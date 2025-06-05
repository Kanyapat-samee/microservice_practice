import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfirmDto } from './dto/confirm.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @MessagePattern('auth_register')
  register(data: RegisterDto) {
    const role = data.role ?? 'user';
    return this.authService.register(data.email, data.password, data.name, role);
  }

  @MessagePattern('auth_login')
  login(data: LoginDto) {
    return this.authService.login(data.email, data.password);
  }

  @MessagePattern('auth_confirm')
  confirm(data: ConfirmDto) {
    return this.authService.confirm(data.email, data.code);
  }

  @Post('admin/login')
  async adminLogin(@Body() body: LoginDto) {
    const { email, password } = body;
    const result = await this.authService.login(email, password);

    if (result.role !== 'admin' && result.role !== 'employee') {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return {
      accessToken: result.accessToken,
      idToken: result.idToken,
      username: email,
      role: result.role,
    };
  }
}