import { Injectable, Logger } from '@nestjs/common';
import {
  DynamoDBClient,
  DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';
import {
  ScanCommand,
  GetCommand,
  PutCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { CreateProductDto } from './dto/create-product.dto';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly db: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const config: DynamoDBClientConfig = {
      region: process.env.REGION!,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    };

    const client = new DynamoDBClient(config);
    this.db = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.DYNAMODB_TABLE || 'Products';
  }

  async getAll() {
    this.logger.log(`Scanning table: ${this.tableName}`);
    try {
      const result = await this.db.send(
        new ScanCommand({ TableName: this.tableName })
      );
      return result.Items || [];
    } catch (error) {
      this.logger.error('Error fetching products from DynamoDB:', error);
      throw error;
    }
  }

  async create(dto: CreateProductDto) {
    const item = {
      id: Date.now().toString(),
      ...dto,
    };
    try {
      await this.db.send(
        new PutCommand({
          TableName: this.tableName,
          Item: item,
        })
      );
      this.logger.log(`Product created: ${item.id}`);
      return { message: 'Product created', product: item };
    } catch (error) {
      this.logger.error('Error creating product:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const result = await this.db.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id },
        })
      );
      return result.Item || null;
    } catch (error) {
      this.logger.error('Error fetching product by ID:', error);
      throw error;
    }
  }
}