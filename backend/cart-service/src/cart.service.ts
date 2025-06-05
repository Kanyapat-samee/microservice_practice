import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly db: DynamoDBDocumentClient;
  private readonly productTable = 'Products';
  private readonly cartTable = 'BakeriaCarts';
  private readonly orderTable = 'BakeriaOrders';

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.REGION!,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    this.db = DynamoDBDocumentClient.from(client);
  }

  async getCart(userId: string): Promise<CartItem[]> {
    console.log('[CartService] Getting cart for:', userId);
    const result = await this.db.send(
      new GetCommand({
        TableName: this.cartTable,
        Key: { userId },
      }),
    );
    const rawCart = result.Item?.cart;
    if (typeof rawCart === 'string') {
      return JSON.parse(rawCart);
    }
    return [];
  }

  async getProductById(productId: string) {
    const result = await this.db.send(
      new GetCommand({
        TableName: this.productTable,
        Key: { id: productId },
      }),
    );

    if (!result.Item) {
      throw new Error(`Product not found: ${productId}`);
    }

    const { id, name, price, imageUrl } = result.Item;

    return {
      id,
      name,
      price: Number(price),
      imageUrl,
    };
  }

  async addToCart(data: {
    userId: string;
    id: string;
    quantity: number;
  }) {
    const product = await this.getProductById(data.id);
    const cart = await this.getCart(data.userId);

    const index = cart.findIndex((item) => item.id === product.id);
    if (index > -1) {
      cart[index].quantity += data.quantity;
    } else {
      cart.push({ ...product, quantity: data.quantity });
    }

    await this.db.send(
      new PutCommand({
        TableName: this.cartTable,
        Item: { userId: data.userId, cart: JSON.stringify(cart) },
      }),
    );

    return { message: 'Item added to cart', cart };
  }

  async mergeCart(data: { userId: string; anonymousId: string }) {
    const userCart = await this.getCart(data.userId);
    const anonCart = await this.getCart(data.anonymousId);

    const merged = [...userCart];
    for (const item of anonCart) {
      const existing = merged.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.push(item);
      }
    }

    await this.db.send(
      new PutCommand({
        TableName: this.cartTable,
        Item: { userId: data.userId, cart: JSON.stringify(merged) },
      }),
    );

    await this.db.send(
      new DeleteCommand({
        TableName: this.cartTable,
        Key: { userId: data.anonymousId },
      }),
    );

    return { message: 'Merged successfully', cart: merged };
  }

  async checkout(userId: string) {
    const cart = await this.getCart(userId);
    if (!cart.length) return { message: 'Cart is empty' };

    const orderId = uuidv4();
    const now = new Date();
    const createdAt = now.toISOString();
    const time = now.toLocaleTimeString('th-TH', {
      hour12: false,
      timeZone: 'Asia/Bangkok',
    });

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await this.db.send(
      new PutCommand({
        TableName: this.orderTable,
        Item: {
          userId,
          orderId,
          createdAt,
          time,
          items: JSON.stringify(cart),
          shipping: null,
          status: 'pending',
          total,
        },
      }),
    );

    await this.db.send(
      new DeleteCommand({
        TableName: this.cartTable,
        Key: { userId },
      }),
    );

    return {
      message: 'Checkout successful',
      order: { orderId, createdAt, items: cart, total },
    };
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getCart(userId);
    const updatedCart = cart.filter((item) => item.id !== productId);

    await this.db.send(
      new PutCommand({
        TableName: this.cartTable,
        Item: { userId, cart: JSON.stringify(updatedCart) },
      }),
    );

    return { message: 'Item removed from cart', cart: updatedCart };
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const cart = await this.getCart(userId);
    const index = cart.findIndex((item) => item.id === productId);

    if (index === -1) {
      throw new Error('Item not found in cart');
    }

    cart[index].quantity = quantity;

    await this.db.send(
      new PutCommand({
        TableName: this.cartTable,
        Item: { userId, cart: JSON.stringify(cart) },
      }),
    );

    return { message: 'Quantity updated', cart };
  }
  async clearCart(userId: string) {
    await this.db.send(
      new PutCommand({
        TableName: this.cartTable,
        Item: { userId, cart: JSON.stringify([]) },
      }),
    );
  
    return { message: 'Cart cleared', cart: [] };
  }
}