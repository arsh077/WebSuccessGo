import fs from 'fs';
import path from 'path';

// Define DB paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface Declarations
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'customer';
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
  paymentStatus: 'Pending' | 'Partial Paid' | 'Fully Paid' | 'Refunded';
  projectStatus: 'Pending' | 'Payment Received' | 'Requirement Received' | 'Design Started' | 'Development Started' | 'Testing' | 'Completed';
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
  status: 'Pending' | 'Partial Paid' | 'Fully Paid' | 'Refunded';
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

interface DatabaseSchema {
  users: User[];
  templates: Template[];
  orders: Order[];
  payments: Payment[];
  portfolio: Portfolio[];
}

// Initial Data Seeding
const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    name: 'BistroBite Premium',
    category: 'Restaurant Website Templates',
    image: 'https://picsum.photos/seed/bistro/800/600',
    price: 4999,
    features: ['Online Menu Integration', 'Table Booking Request Form', 'WhatsApp Direct Ordering', 'Responsive Gallery', 'Location Map Integration'],
    demoURL: 'https://bistrobite-demo.websuccessgo.com',
  },
  {
    id: 'tpl-2',
    name: 'HealWell Medical Portal',
    category: 'Clinic Website Templates',
    image: 'https://picsum.photos/seed/clinic/800/600',
    price: 9999,
    features: ['Doctor Profiles', 'Patient Appointment Form', 'Services & Treatments List', 'Patient Reviews', 'SEO Optimized Content Structure'],
    demoURL: 'https://healwell-demo.websuccessgo.com',
  },
  {
    id: 'tpl-3',
    name: 'LexCounsel Law Firm',
    category: 'Law Firm Website Templates',
    image: 'https://picsum.photos/seed/law/800/600',
    price: 9999,
    features: ['Practice Area Showcases', 'Case Consultation Booking', 'Attorney Profiles', 'Blog & Legal Insights', 'High-Trust Professional Layout'],
    demoURL: 'https://lexcounsel-demo.websuccessgo.com',
  },
  {
    id: 'tpl-4',
    name: 'GlamourCut Salon & Spa',
    category: 'Salon Website Templates',
    image: 'https://picsum.photos/seed/salon/800/600',
    price: 4999,
    features: ['Service Catalog with Prices', 'Stylist Booking Form', 'Instagram Feed Widget', 'Gift Card Information', 'WhatsApp Inquiry Button'],
    demoURL: 'https://glamourcut-demo.websuccessgo.com',
  },
  {
    id: 'tpl-5',
    name: 'CartSwift E-Commerce Store',
    category: 'E-commerce Website Templates',
    image: 'https://picsum.photos/seed/shop/800/600',
    price: 19999,
    features: ['Product Catalog & Filter', 'Shopping Cart & Checkout', 'Razorpay & UPI Payment Gateway', 'Admin Order Dashboard', 'User Account System'],
    demoURL: 'https://cartswift-demo.websuccessgo.com',
  },
  {
    id: 'tpl-6',
    name: 'SaaSify Launchpad',
    category: 'Startup Website Templates',
    image: 'https://picsum.photos/seed/startup/800/600',
    price: 9999,
    features: ['Interactive Feature Comparison', 'Pricing Tier Cards', 'Lead Generation & Newsletter Forms', 'Modern Hero Section with Video Embed', 'Custom Framer Animations'],
    demoURL: 'https://saasify-demo.websuccessgo.com',
  }
];

const INITIAL_PORTFOLIO: Portfolio[] = [
  {
    id: 'port-1',
    title: 'Bella Italia Restaurant',
    category: 'Restaurant',
    image: 'https://picsum.photos/seed/pasta/800/600',
    description: 'A gorgeous restaurant website featuring a digital, interactive menu, booking options, and live table status updates.',
    demoURL: 'https://bellaitalia.websuccessgo.com',
    technology: 'Next.js, Tailwind CSS, Framer Motion',
    deliveryTime: '5 Days',
  },
  {
    id: 'port-2',
    title: 'Apex Dental Care',
    category: 'Clinic',
    image: 'https://picsum.photos/seed/dental/800/600',
    description: 'Patient appointment system and dental service guide with fully optimized landing page and contact form funnel.',
    demoURL: 'https://apexdental.websuccessgo.com',
    technology: 'React, Tailwind CSS, Node.js',
    deliveryTime: '7 Days',
  },
  {
    id: 'port-3',
    title: 'Veritas Legal Chambers',
    category: 'Law Firm',
    image: 'https://picsum.photos/seed/justice/800/600',
    description: 'High-end corporate portfolio website for a prestigious litigation chambers showing case records and partner biographies.',
    demoURL: 'https://veritaslegal.websuccessgo.com',
    technology: 'Next.js, Tailwind, SEO Engine',
    deliveryTime: '6 Days',
  },
  {
    id: 'port-4',
    title: 'FitWear Active Marketplace',
    category: 'E-commerce',
    image: 'https://picsum.photos/seed/shoes/800/600',
    description: 'A modern direct-to-consumer e-commerce portal with customized carts, UPI QR gateway, and instant invoice mailing.',
    demoURL: 'https://fitwear.websuccessgo.com',
    technology: 'Next.js, Express, MongoDB, Razorpay',
    deliveryTime: '10 Days',
  }
];

// Helper to ensure data directory exists and DB is seeded
function getDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialDB: DatabaseSchema = {
        users: [
          {
            id: 'u-admin',
            name: 'WebSuccessGo Admin',
            email: 'admin@websuccessgo.com',
            phone: '9876543210',
            password: 'admin', // standard cleartext for simple evaluation/MVP auth
            role: 'admin',
          },
          {
            id: 'u-customer',
            name: 'John Doe',
            email: 'customer@gmail.com',
            phone: '9988776655',
            password: 'customer',
            role: 'customer',
          }
        ],
        templates: INITIAL_TEMPLATES,
        orders: [
          {
            id: 'ord-1',
            orderNumber: 'WSG-2026-0001',
            customerId: 'u-customer',
            customerName: 'John Doe',
            customerEmail: 'customer@gmail.com',
            customerPhone: '9988776655',
            templateId: 'tpl-2',
            templateName: 'HealWell Medical Portal',
            package: 'Business',
            amount: 9999,
            paymentStatus: 'Partial Paid',
            projectStatus: 'Requirement Received',
            businessName: 'Doe Wellness Clinic',
            ownerName: 'Dr. John Doe',
            businessDescription: 'A modern family health and dental care clinic located in central Mumbai specializing in dermatology and pediatric care.',
            requiredPages: 'Home, About Us, Services, Book Appointment, Contact Us',
            logoUrl: '',
            contentUrl: '',
            developerAssigned: 'Aman Sharma',
            adminNotes: 'Requirements received. Doctor photos will be provided on email by Monday.',
            uploadedFiles: [],
            createdAt: '2026-07-08T10:15:30Z',
          }
        ],
        payments: [
          {
            id: 'pay-1',
            orderId: 'ord-1',
            orderNumber: 'WSG-2026-0001',
            transactionId: 'TXN-Razorpay-789423',
            amount: 5000,
            status: 'Partial Paid',
            method: 'Razorpay',
            date: '2026-07-08T10:16:45Z',
          }
        ],
        portfolio: INITIAL_PORTFOLIO,
      };

      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
      return initialDB;
    }

    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading/initializing database file:', error);
    return { users: [], templates: [], orders: [], payments: [], portfolio: [] };
  }
}

// Helper to save to DB
function saveDB(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// Database Actions Wrapper
export const db = {
  getUsers: () => getDB().users,
  addUser: (user: User) => {
    const current = getDB();
    const newUser = { ...user, id: user.id || `u-${Date.now()}` };
    current.users.push(newUser);
    saveDB(current);
    return newUser;
  },

  getTemplates: () => getDB().templates,
  addTemplate: (template: Omit<Template, 'id'>) => {
    const current = getDB();
    const newTemplate = { ...template, id: `tpl-${Date.now()}` };
    current.templates.push(newTemplate);
    saveDB(current);
    return newTemplate;
  },
  updateTemplate: (id: string, updated: Partial<Template>) => {
    const current = getDB();
    const idx = current.templates.findIndex(t => t.id === id);
    if (idx !== -1) {
      current.templates[idx] = { ...current.templates[idx], ...updated };
      saveDB(current);
      return current.templates[idx];
    }
    return null;
  },
  deleteTemplate: (id: string) => {
    const current = getDB();
    current.templates = current.templates.filter(t => t.id !== id);
    saveDB(current);
    return true;
  },

  getOrders: () => getDB().orders,
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const current = getDB();
    const orderCount = current.orders.length + 1;
    const orderNumber = `WSG-2026-${String(orderCount).padStart(4, '0')}`;
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };
    current.orders.push(newOrder);
    saveDB(current);
    return newOrder;
  },
  updateOrder: (id: string, updated: Partial<Order>) => {
    const current = getDB();
    const idx = current.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      current.orders[idx] = { ...current.orders[idx], ...updated };
      saveDB(current);
      return current.orders[idx];
    }
    return null;
  },

  getPayments: () => getDB().payments,
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => {
    const current = getDB();
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
    };
    current.payments.push(newPayment);
    saveDB(current);
    return newPayment;
  },

  getPortfolio: () => getDB().portfolio,
  addPortfolioItem: (item: Omit<Portfolio, 'id'>) => {
    const current = getDB();
    const newItem = { ...item, id: `port-${Date.now()}` };
    current.portfolio.push(newItem);
    saveDB(current);
    return newItem;
  },
  updatePortfolioItem: (id: string, updated: Partial<Portfolio>) => {
    const current = getDB();
    const idx = current.portfolio.findIndex(p => p.id === id);
    if (idx !== -1) {
      current.portfolio[idx] = { ...current.portfolio[idx], ...updated };
      saveDB(current);
      return current.portfolio[idx];
    }
    return null;
  },
  deletePortfolioItem: (id: string) => {
    const current = getDB();
    current.portfolio = current.portfolio.filter(p => p.id !== id);
    saveDB(current);
    return true;
  },

  // Reset helper
  resetToDefault: () => {
    try {
      if (fs.existsSync(DB_FILE)) {
        fs.unlinkSync(DB_FILE);
      }
      return getDB();
    } catch (e) {
      console.error('Failed to reset db', e);
      return null;
    }
  }
};
