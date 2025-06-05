import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  getProducts() {
    return this.client.send('get_products', {});
  }

  @Post()
  createProduct(@Body() dto: CreateProductDto) {
    return this.client.send('create_product', dto);
  }
}