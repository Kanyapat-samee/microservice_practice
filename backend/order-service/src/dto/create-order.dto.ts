export class CreateOrderDto {
  userId?: string;
  userName?: string;

  items: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
  }[];

  shipping: {
    name: string;
    phone: string;
    address: string;
    method: 'pickup' | 'delivery';
  };
}