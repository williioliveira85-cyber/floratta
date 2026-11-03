export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  notes?: string;
  volume?: string;
  isFeatured?: boolean;
  stock: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface ClientAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

export interface Client {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: ClientAddress;
  documentUrl?: string; // photo/link of ID (RG/CNH)
  selfieUrl?: string; // photo/link of customer selfie
  consentLgpd?: boolean;
  firstAccessAt: string;
  registrationCompletedAt?: string;
}

export interface InstallationRecord {
  id: string;
  clientName: string;
  deviceInfo: string;
  installedAt: string;
  active: boolean;
}

export interface InstallmentItem {
  number: number;
  dueDate: string;
  amount: number;
  status: 'pendente' | 'pago' | 'atrasado';
  paidAt?: string;
  receiptNumber?: string;
}

export interface Carne {
  id: string;
  code: string;
  orderId?: string;
  clientId: string;
  clientName: string;
  clientCpf?: string;
  clientPhone?: string;
  totalOriginal: number;
  interestRate: number; // monthly %
  totalFinal: number;
  installmentsCount: number;
  installments: InstallmentItem[];
  createdAt: string;
  status: 'em_dia' | 'atrasado' | 'quitado';
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  subtotal: number;
  paymentMethod: 'a_vista' | 'carne';
  installmentsCount?: number;
  carneId?: string;
  createdAt: string;
  status: 'confirmado' | 'saiu_para_entrega' | 'entregue';
  trackingStep?: 1 | 2 | 3; // 1: Pedido confirmado, 2: Saiu para entrega, 3: Entregue
  statusUpdatedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'admin_nova_compra' | 'cliente_atualizacao' | 'cliente_entrega';
  timestamp: string;
  read: boolean;
  orderId?: string;
  clientId?: string;
}

export interface StoreSettings {
  featuredProductId: string;
  monthlyInterestRate: number; // default e.g. 2.5%
  allowedInstallments: number[]; // e.g. [1, 2, 3, 4, 5, 6, 10, 12]
  welcomeAudioText: string;
  whatsappNumber: string;
  storeName: string;
}

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  lastUsedAt?: string;
  active: boolean;
}

export interface StoreData {
  products: Product[];
  categories: Category[];
  clients: Client[];
  carnes: Carne[];
  orders: Order[];
  installations: InstallationRecord[];
  settings: StoreSettings;
  apiTokens: ApiToken[];
  notifications: AppNotification[];
}
