import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller()
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('create_order')
  async createOrder(@Payload() data: CreateOrderDto) {
    this.logger.debug(`Received create_order payload:\n${JSON.stringify(data, null, 2)}`);

    if (!data.userId || typeof data.userId !== 'string') {
      this.logger.error('Missing or invalid userId in order payload');
      throw new Error('Missing userId in order payload');
    }

    if (!data.shipping || !data.shipping.method) {
      this.logger.error('Missing shipping information');
      throw new Error('Missing shipping info');
    }

    this.logger.log(`Creating order for user: ${data.userId}`);

    return await this.orderService.createOrder(data);
  }

  @MessagePattern('get_orders_by_user')
  async getOrdersByUser(@Payload() userId: string) {
    this.logger.debug(`Fetching order history for user: ${userId}`);
    return await this.orderService.getOrdersByUser(userId);
  }

  @MessagePattern('get_all_orders')
  async getAllOrders(@Payload() payload: { startDate?: string; endDate?: string }) {
    this.logger.debug(`Fetching all orders with filter: ${JSON.stringify(payload)}`);
    return await this.orderService.getAllOrders(payload.startDate, payload.endDate);
  }

  @MessagePattern('update_order_status')
  async updateOrderStatus(@Payload() payload: { userId: string; orderId: string; status: string }) {
    this.logger.debug(`Updating status of order ${payload.orderId} by user ${payload.userId} to ${payload.status}`);
    return await this.orderService.updateOrderStatus(payload.userId, payload.orderId, payload.status);
  }

  @MessagePattern('get_order_by_id')
  async getOrderById(
    @Payload() payload: { userId: string; orderId: string }
  ) {
    this.logger.debug(
      `Fetching order ${payload.orderId} for user ${payload.userId}`
    )
    return await this.orderService.getOrderById(payload.userId, payload.orderId)
  }
}