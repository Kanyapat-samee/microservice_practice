import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            getAll: jest.fn().mockResolvedValue([
              { id: '1', name: 'Product A' },
              { id: '2', name: 'Product B' },
            ]),
            create: jest.fn().mockResolvedValue({
              message: 'Product created',
              product: { id: '1', name: 'Product A' },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const result = await controller.getAll();
      expect(result).toEqual([
        { id: '1', name: 'Product A' },
        { id: '2', name: 'Product B' },
      ]);
      expect(service.getAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto: CreateProductDto = { name: 'Product A', price: 100 };
      const result = await controller.create(dto);
      expect(result).toEqual({
        message: 'Product created',
        product: { id: '1', name: 'Product A' },
      });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
});