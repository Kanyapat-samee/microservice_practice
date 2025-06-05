import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';

import {
  DynamoDBClient,
  DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';
import {
  QueryCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly db: DynamoDBDocumentClient;
  private readonly orderTable = 'BakeriaOrders';
  private readonly cartTable = 'BakeriaCarts';

  constructor() {
    const config: DynamoDBClientConfig = {
      region: process.env.REGION!,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    };

    const client = new DynamoDBClient(config);
    this.db = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        convertClassInstanceToMap: false,
        removeUndefinedValues: true,
      },
    });
  }

  async createOrder(dto: CreateOrderDto) {
    this.logger.debug('Received createOrder DTO:');
    this.logger.debug(JSON.stringify(dto, null, 2));

    if (!dto.userId || typeof dto.userId !== 'string') {
      throw new Error('Missing userId (username)');
    }

    const cart = dto.items;

    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error('Cart is empty');
    }

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

    const order = {
      userId: dto.userId,
      userName: dto.userName || 'Unknown',
      orderId,
      createdAt,
      time,
      items: JSON.stringify(cart),
      shipping: JSON.stringify(dto.shipping),
      status: 'pending',
      total,
    };

    this.logger.debug('Final order object to save:');
    this.logger.debug(JSON.stringify(order, null, 2));

    await this.db.send(
      new PutCommand({
        TableName: this.orderTable,
        Item: order,
      }),
    );

    await this.db.send(
      new DeleteCommand({
        TableName: this.cartTable,
        Key: { userId: dto.userId },
      }),
    );

    this.logger.log(
      `Order created for user: ${dto.userId}, orderId: ${orderId}`,
    );

    return {
      message: 'Order created successfully',
      orderId,
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const result = await this.db.send(
      new GetCommand({
        TableName: this.orderTable,
        Key: { userId, orderId },
      }),
    );

    if (!result.Item) {
      throw new Error('Order not found');
    }

    return {
      ...result.Item,
      items: JSON.parse(result.Item.items),
      shipping: JSON.parse(result.Item.shipping),
    };
  }

  async getOrdersByUser(userId: string) {
    const result = await this.db.send(
      new QueryCommand({
        TableName: this.orderTable,
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: {
          ':uid': userId,
        },
      }),
    );

    return (result.Items || []).map((item) => ({
      ...item,
      items: JSON.parse(item.items),
      shipping: JSON.parse(item.shipping),
    }));
  }

  async getAllOrders(startDate?: string, endDate?: string) {
    const result = await this.db.send(
      new ScanCommand({
        TableName: this.orderTable,
      }),
    );

    let orders = result.Items || [];

    orders = orders.map((item) => ({
      ...item,
      items: JSON.parse(item.items),
      shipping: JSON.parse(item.shipping),
    }));

    if (startDate || endDate) {
      const start = new Date(`${startDate}T00:00:00+07:00`)
      const end = new Date(`${endDate}T23:59:59+07:00`)
    
      orders = orders.filter((order) => {
        const created = new Date(order.createdAt)
        return created >= start && created <= end
      })
    }

    return orders;
  }

  async updateOrderStatus(userId: string, orderId: string, status: string) {
    await this.db.send(
      new UpdateCommand({
        TableName: this.orderTable,
        Key: { userId, orderId },
        UpdateExpression: 'SET #s = :status',
        ExpressionAttributeNames: {
          '#s': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
      }),
    );

    return {
      message: `Updated order ${orderId} to status: ${status}`,
    };
  }
}