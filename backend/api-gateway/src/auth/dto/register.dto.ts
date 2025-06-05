export class RegisterDto {
  email: string;
  password: string;
  role: 'user' | 'admin' | 'employee';
}