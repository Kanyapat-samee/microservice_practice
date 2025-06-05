import {
  Controller,
  Post,
  Req,
  UseGuards,
  Inject,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginGuard } from '../middleware/login.guard';

@Controller('cart')
export class CartController {
  constructor(
    @Inject('CART_SERVICE') private readonly cartClient: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  // ========== Auth-only ==========
  @UseGuards(LoginGuard)
  @Post('checkout')
  async checkout(@Req() req, @Body() body: {
    shipping: {
      name: string;
      phone: string;
      address: string;
      method: 'pickup' | 'delivery';
    };
  }) {
    const userId = req.user.userId;
    const userName = req.user.userId;
    const email = req.user.email;

    const result = await this.cartClient.send('get_cart', userId).toPromise();
    const cart = Array.isArray(result) ? result : result.cart;
    if (!Array.isArray(cart) || cart.length === 0) {
      return { message: 'Cart is empty' };
    }

    const orderPayload = {
      userId,
      userName,
      items: cart,
      shipping: body.shipping,
    };

    return this.orderClient.send('create_order', orderPayload).toPromise();
  }

  @UseGuards(LoginGuard)
  @Post('merge')
  async mergeCart(@Req() req, @Body() body: { anonymousId: string }) {
    const userId = req.user.userId;
    const result = await this.cartClient.send('merge_cart', {
      userId,
      anonymousId: body.anonymousId,
    }).toPromise();
    return { cart: result.cart ?? [] };
  }

  @UseGuards(LoginGuard)
  @Get('get/me')
  async getCartForLoggedInUser(@Req() req) {
    const userId = req.user.userId;
    const result = await this.cartClient.send('get_cart', userId).toPromise();
    return { cart: Array.isArray(result) ? result : result.cart ?? [] };
  }

  // ========== For Everyone ==========
  @Post('add')
  async addToCart(@Req() req, @Body() body: {
    anonymousId?: string;
    id: string;
    quantity: number;
  }) {
    const token = req.headers['authorization'];
    let userId: string | undefined;

    if (token?.startsWith('Bearer ')) {
      try {
        const decoded: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded['name'] || decoded['cognito:username'] || decoded.username;
      } catch {}
    }

    const ownerId = userId || body.anonymousId;
    const result = await this.cartClient.send('add_to_cart', {
      userId: ownerId,
      id: body.id,
      quantity: body.quantity,
    }).toPromise();

    return { cart: result.cart ?? [] };
  }

  @Get('get/:id')
  async getCart(@Param('id') id: string) {
    const result = await this.cartClient.send('get_cart', id).toPromise();
    return { cart: Array.isArray(result) ? result : result.cart ?? [] };
  }

  @Post('remove')
  async removeFromCart(@Req() req, @Body() body: { id: string; anonymousId?: string }) {
    const token = req.headers['authorization'];
    let userId: string | undefined;

    if (token?.startsWith('Bearer ')) {
      try {
        const decoded: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded['name'] || decoded['cognito:username'] || decoded.username;
      } catch {}
    }

    const ownerId = userId || body.anonymousId;
    if (!ownerId) return { cart: [] };

    const result = await this.cartClient.send('remove_from_cart', {
      userId: ownerId,
      productId: body.id,
    }).toPromise();

    return { cart: result.cart ?? [] };
  }

  @Post('update')
  async updateCartQuantity(@Req() req, @Body() body: {
    id: string;
    quantity: number;
    anonymousId?: string;
  }) {
    const token = req.headers['authorization'];
    let userId: string | undefined;

    if (token?.startsWith('Bearer ')) {
      try {
        const decoded: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded['name'] || decoded['cognito:username'] || decoded.username;
      } catch {}
    }

    const ownerId = userId || body.anonymousId;
    if (!ownerId) return { cart: [] };

    const result = await this.cartClient.send('update_quantity', {
      userId: ownerId,
      productId: body.id,
      quantity: body.quantity,
    }).toPromise();

    return { cart: result.cart ?? [] };
  }

  @Post('clear')
  async clearCart(@Req() req, @Body() body: { anonymousId?: string }) {
    const token = req.headers['authorization'];
    let userId: string | undefined;

    if (token?.startsWith('Bearer ')) {
      try {
        const decoded: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded['name'] || decoded['cognito:username'] || decoded.username;
      } catch {}
    }

    const ownerId = userId || body.anonymousId;
    if (!ownerId) return { cart: [] };

    const result = await this.cartClient.send('clear_cart', ownerId).toPromise();
    return { cart: result.cart ?? [] };
  }
}