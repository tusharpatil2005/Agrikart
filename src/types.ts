export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'farmer';
  balance: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Produce' | 'Seeds' | 'Fertilizers' | 'Tools' | 'Equipment';
  stock: number;
  image: string;
  unit: string; // e.g., "kg", "pack", "unit"
  farmerId: string;
  farmerName: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
}
