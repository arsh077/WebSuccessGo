export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'developer' | 'customer';
  createdAt?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  features: string[];
  demoURL: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  templateId: string;
  templateName: string;
  package: 'Starter' | 'Business' | 'Premium';
  amount: number;
  paymentStatus: 'Pending' | 'Partial Paid' | 'Paid' | 'Refunded';
  projectStatus: 'Pending' | 'Payment Received' | 'Requirement Received' | 'Design Started' | 'Development Started' | 'Testing' | 'Completed' | 'Delivered' | 'On Hold';
  businessName: string;
  ownerName: string;
  businessDescription: string;
  requiredPages: string;
  logoUrl?: string;
  contentUrl?: string;
  developerAssigned?: string;
  adminNotes?: string;
  uploadedFiles?: { name: string; url: string; date: string }[];
  uploadedFile?: { name: string; url: string };
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  transactionId: string;
  amount: number;
  status: 'Pending' | 'Partial Paid' | 'Paid' | 'Refunded';
  method: 'UPI QR' | 'Razorpay';
  date: string;
}

export interface Portfolio {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  demoURL: string;
  technology: string;
  deliveryTime: string;
}
