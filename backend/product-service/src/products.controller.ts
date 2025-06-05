import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('get_products')
  async getAll() {
    return this.productsService.getAll();
  }

  @MessagePattern('create_product')
  async create(@Payload() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}