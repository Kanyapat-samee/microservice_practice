import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';

@Controller()
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @MessagePattern('get_cart')
  async getCart(@Payload() userId: string) {
    this.logger.debug(`[get_cart] userId: ${userId}`);
    return this.cartService.getCart(userId);
  }

  @MessagePattern('add_to_cart')
  async addToCart(
    @Payload() data: {
      userId: string;
      id: string;
      quantity: number;
    },
  ) {
    const { userId, id, quantity } = data;

    if (!userId || !id || typeof quantity !== 'number') {
      this.logger.warn(`[add_to_cart] Invalid payload: ${JSON.stringify(data)}`);
      throw new Error('Missing required fields for add_to_cart');
    }

    this.logger.debug(`[add_to_cart] userId: ${userId}, productId: ${id}, quantity: ${quantity}`);
    return this.cartService.addToCart({ userId, id, quantity });
  }

  @MessagePattern('merge_cart')
  async mergeCart(@Payload() data: { userId: string; anonymousId: string }) {
    this.logger.debug(`[merge_cart] Merging anonymous (${data.anonymousId}) → user (${data.userId})`);
    return this.cartService.mergeCart(data);
  }

  @MessagePattern('checkout')
  async checkout(@Payload() userId: string) {
    this.logger.debug(`[checkout] userId: ${userId}`);
    return this.cartService.checkout(userId);
  }

  @MessagePattern('remove_from_cart')
  async removeFromCart(@Payload() data: { userId: string; productId: string }) {
    const { userId, productId } = data;

    if (!userId || !productId) {
      this.logger.warn(`[remove_from_cart] Missing userId or productId`);
      throw new Error('Missing required fields for remove_from_cart');
    }

    this.logger.debug(`[remove_from_cart] userId: ${userId}, productId: ${productId}`);
    return this.cartService.removeItem(userId, productId);
  }

  @MessagePattern('update_quantity')
  async updateQuantity(@Payload() data: { userId: string; productId: string; quantity: number }) {
    const { userId, productId, quantity } = data;

    if (!userId || !productId || typeof quantity !== 'number') {
      this.logger.warn(`[update_quantity] Invalid payload`);
      throw new Error('Missing required fields for update_quantity');
    }

    this.logger.debug(`✏️ [update_quantity] userId: ${userId}, productId: ${productId}, quantity: ${quantity}`);
    return this.cartService.updateQuantity(userId, productId, quantity);
  }

  @MessagePattern('clear_cart')
  async clearCart(@Payload() userId: string) {
    this.logger.debug(`[clear_cart] userId: ${userId}`);
    return this.cartService.clearCart(userId);
  }
}