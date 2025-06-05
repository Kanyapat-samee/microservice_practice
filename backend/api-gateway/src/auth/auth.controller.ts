import {
  Body,
  Controller,
  Inject,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmDto } from './dto/confirm.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.client.send('auth_register', data).toPromise();
  }

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.client.send('auth_login', data).toPromise();
  }

  @Post('confirm')
  confirm(@Body() data: ConfirmDto) {
    return this.client.send('auth_confirm', data).toPromise();
  }

  @Post('admin/login')
  async adminLogin(@Body() data: LoginDto) {
    const result = await this.client.send('auth_login', data).toPromise();

    if (result.role !== 'admin' && result.role !== 'employee') {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return {
      accessToken: result.accessToken,
      idToken: result.idToken,
      username: data.email,
      role: result.role,
    };
  }
}