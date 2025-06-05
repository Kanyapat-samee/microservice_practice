import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  Inject,
  Get,
  Param,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { CreateOrderDto } from './dto/create-order.dto'
import { LoginGuard } from '../middleware/login.guard'

@Controller('order')
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  @UseGuards(LoginGuard)
  @Post()
  async createOrder(
    @Req() req,
    @Body() dto: Omit<CreateOrderDto, 'userId' | 'userName'>,
  ) {
    const userId = req.user.userId
    const userName = dto.shipping?.name || 'Unknown'

    console.log('UserId from token:', userId)
    console.log('Shipping name from form:', userName)

    return this.orderClient
      .send('create_order', {
        ...dto,
        userId,
        userName,
      })
      .toPromise()
  }

  @UseGuards(LoginGuard)
  @Get('history')
  async getOrderHistory(@Req() req) {
    const userId = req.user.userId

    return this.orderClient
      .send('get_orders_by_user', userId)
      .toPromise()
  }

  @UseGuards(LoginGuard)
  @Get('admin')
  async getAllOrders(
    @Req() req,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const roles = req.user.roles || []
    if (!roles.includes('admin') && !roles.includes('employee')) {
      throw new UnauthorizedException('You do not have admin access')
    }

    return this.orderClient
      .send('get_all_orders', { startDate: start, endDate: end })
      .toPromise()
  }

  @UseGuards(LoginGuard)
  @Patch('admin/:userId/:orderId')
  async updateOrderStatus(
    @Req() req,
    @Param('userId') userId: string,
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    const roles = req.user.roles || []
    if (!roles.includes('admin') && !roles.includes('employee')) {
      throw new UnauthorizedException('You do not have admin access')
    }

    return this.orderClient
      .send('update_order_status', { userId, orderId, status })
      .toPromise()
  }

  @UseGuards(LoginGuard)
  @Get(':orderId')
  async getOrderById(@Req() req, @Param('orderId') orderId: string) {
    const userId = req.user.userId

    return this.orderClient
      .send('get_order_by_id', { userId, orderId })
      .toPromise()
  }
}