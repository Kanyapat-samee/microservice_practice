import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class LoginGuard implements CanActivate {
  private readonly logger = new Logger(LoginGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Authorization header missing or invalid');
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.decode(token);
      this.logger.debug(`Decoded JWT: ${JSON.stringify(decoded, null, 2)}`);

      if (!decoded || typeof decoded !== 'object' || !decoded.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const groups: string[] = decoded['cognito:groups'] || [];

      if (decoded.name && groups.includes('user')) {
        request.user = {
          userId: decoded.name,
          email: decoded.email,
          username: decoded.name,
          roles: groups,
        };
      }
      
      else if (!decoded.name && (groups.includes('admin') || groups.includes('employee'))) {
        request.user = {
          userId: decoded.sub,
          email: decoded.email,
          username: decoded.email,
          roles: groups,
        };
      } else {
        throw new UnauthorizedException('Unauthorized role or token structure');
      }

      this.logger.debug(`Authenticated userId: ${request.user.userId}`);
      return true;
    } catch (err) {
      this.logger.error('Token decoding failed', err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}