export class RegisterDto {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'employee';
}
