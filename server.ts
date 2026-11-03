import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type { StoreData, Product, Category, Client, Carne, Order, InstallationRecord, StoreSettings, ApiToken } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data with high-end Floratta cosmetics and perfumes
const initialCategories: Category[] = [
  { id: 'cat-perfumes', name: 'Perfumes & Fragrâncias', slug: 'perfumes', icon: 'Sparkles' },
  { id: 'cat-batons', name: 'Batons & Lábios', slug: 'batons', icon: 'Heart' },
  { id: 'cat-maquiagem', name: 'Maquiagem & Rosto', slug: 'maquiagem', icon: 'Smile' },
  { id: 'cat-skincare', name: 'Skincare & Tratamento', slug: 'skincare', icon: 'Droplets' },
  { id: 'cat-cabelo', name: 'Cuidados com o Cabelo', slug: 'cabelo', icon: 'Flame' },
];

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Floratta Fleur Supreme Eau de Parfum',
    brand: 'Floratta Cosmético',
    description: 'Fragrância floral amadeirada marcante com o exclusivo acorde Ylang Ylang de Grasse e notas de bergamota fresca, patchouli e baunilha dourada. Fixação superior para ocasiões inesquecíveis.',
    price: 189.90,
    categoryId: 'cat-perfumes',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Topo: Bergamota, Pêssego Rosa | Coração: Ylang Ylang, Rosa de Maio | Fundo: Baunilha, Âmbar, Patchouli',
    volume: '75ml',
    isFeatured: true,
    stock: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Floratta Rose Sensuelle Desodorante Colônia',
    brand: 'Floratta Cosmético',
    description: 'Romântica, alegre e envolvente. Uma combinação moderna de pétalas de rosas búlgaras e frutas vermelhas frescas com toque almiscarado.',
    price: 149.90,
    categoryId: 'cat-perfumes',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Topo: Frutas Vermelhas, Mandarina | Coração: Rosa Damascena, Gardênia | Fundo: Almíscar Branco, Cedro',
    volume: '100ml',
    isFeatured: false,
    stock: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Floratta Gold Intenso Elixir',
    brand: 'Floratta Cosmético',
    description: 'Para quem ama brilhar. Notas quentes de baunilha oriental, orquídea dourada e madeira de cashmere. Sedutor e duradouro.',
    price: 169.90,
    categoryId: 'cat-perfumes',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Topo: Abacaxi Glaceado, Flor de Laranjeira | Coração: Orquídea Dourada, Heliotrópio | Fundo: Sândalo, Baunilha',
    volume: '90ml',
    isFeatured: false,
    stock: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Batom Velvet Matte Floratta Vermelho Imperial',
    brand: 'Floratta Cosmético',
    description: 'Acabamento matte aveludado de altíssima pigmentação, com ácido hialurônico que hidrata os lábios por até 18 horas sem ressecar.',
    price: 54.90,
    categoryId: 'cat-batons',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Acabamento: Matte Aveludado | Cor: Vermelho Imperial 01 | Com Ácido Hialurônico',
    volume: '4g',
    stock: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Gloss Labial Holographic Diamond Pink',
    brand: 'Floratta Cosmético',
    description: 'Brilho espelhado cristalino com micropartículas de pérolas refletoras de luz e manteiga de karité.',
    price: 49.90,
    categoryId: 'cat-batons',
    images: [
      'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Efeito Plump | Vitamina E | Textura Confortável não grudenta',
    volume: '5ml',
    stock: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Sérum Facial Radiance Iluminador com Niacinamida',
    brand: 'Floratta Cosmético',
    description: 'Tratamento de alta performance para renovar o viço, uniformizar o tom e hidratar profundamente a pele com textura levíssima toque seco.',
    price: 119.90,
    categoryId: 'cat-skincare',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-7104d49f032d?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Ativos: Niacinamida 10%, Ácido Hialurônico Puro e Extrato de Orquídea',
    volume: '30ml',
    stock: 22,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Máscara Capilar Nutrição de Seda com Óleo de Ojen',
    brand: 'Floratta Cosmético',
    description: 'Restauração profunda dos fios desidratados. Devolve o brilho luminoso, sela as cutículas e combate o frizz instantaneamente.',
    price: 89.90,
    categoryId: 'cat-cabelo',
    images: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Tratamento intensivo anti-porosidade com aroma floral sofisticado',
    volume: '250g',
    stock: 19,
    createdAt: new Date().toISOString()
  }
];

const initialClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Mariana Silva Santos',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'mariana.silva@email.com',
    address: {
      street: 'Rua das Flores',
      number: '250',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zip: '01415-000'
    },
    documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    consentLgpd: true,
    firstAccessAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    registrationCompletedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'cli-2',
    name: 'Carlos Eduardo Ramos',
    cpf: '321.654.987-11',
    phone: '(21) 97654-3210',
    email: 'carlos.ramos@email.com',
    address: {
      street: 'Avenida Atlântica',
      number: '1200',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zip: '22070-000'
    },
    documentUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    consentLgpd: true,
    firstAccessAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    registrationCompletedAt: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

const initialCarnes: Carne[] = [
  {
    id: 'carne-1',
    code: 'FLOR-2026-001',
    clientId: 'cli-1',
    clientName: 'Mariana Silva Santos',
    clientCpf: '123.456.789-00',
    clientPhone: '(11) 98765-4321',
    totalOriginal: 189.90,
    interestRate: 2.0,
    totalFinal: 197.50,
    installmentsCount: 4,
    status: 'em_dia',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    installments: [
      { number: 1, dueDate: '2026-11-10', amount: 49.38, status: 'pago', paidAt: '2026-11-09', receiptNumber: 'REC-9821' },
      { number: 2, dueDate: '2026-12-10', amount: 49.38, status: 'pendente' },
      { number: 3, dueDate: '2027-01-10', amount: 49.38, status: 'pendente' },
      { number: 4, dueDate: '2027-02-10', amount: 49.36, status: 'pendente' }
    ]
  },
  {
    id: 'carne-2',
    code: 'FLOR-2026-002',
    clientId: 'cli-2',
    clientName: 'Carlos Eduardo Ramos',
    clientCpf: '321.654.987-11',
    clientPhone: '(21) 97654-3210',
    totalOriginal: 224.80,
    interestRate: 2.5,
    totalFinal: 236.04,
    installmentsCount: 3,
    status: 'atrasado',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    installments: [
      { number: 1, dueDate: '2026-10-15', amount: 78.68, status: 'atrasado' },
      { number: 2, dueDate: '2026-11-15', amount: 78.68, status: 'pendente' },
      { number: 3, dueDate: '2026-12-15', amount: 78.68, status: 'pendente' }
    ]
  }
];

const initialInstallations: InstallationRecord[] = [
  {
    id: 'inst-1',
    clientName: 'Mariana Silva',
    deviceInfo: 'Android 14 (Samsung Galaxy S23)',
    installedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    active: true
  },
  {
    id: 'inst-2',
    clientName: 'Carlos Eduardo',
    deviceInfo: 'Android 13 (Motorola Edge 40)',
    installedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    active: true
  },
  {
    id: 'inst-3',
    clientName: 'Juliana Paes',
    deviceInfo: 'Android 14 (Xiaomi Redmi Note 13)',
    installedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    active: true
  }
];

const initialSettings: StoreSettings = {
  featuredProductId: 'prod-1',
  monthlyInterestRate: 2.5,
  allowedInstallments: [1, 2, 3, 4, 5, 6, 10, 12],
  welcomeAudioText: 'Olá! Seja muito bem-vindo à Floratta Cosmético. Conheça nossa fragrância exclusiva em destaque: Floratta Fleur Supreme Eau de Parfum. Sofisticação, elegância e as melhores condições no carnê para você!',
  whatsappNumber: '5511999998888',
  storeName: 'Floratta Cosmético'
};

const initialTokens: ApiToken[] = [
  {
    id: 'tok-1',
    name: 'Launcher Android Mobile',
    token: 'floratta_sec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
    active: true
  }
];

function loadStoreData(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.notifications) parsed.notifications = [];
      if (!parsed.orders || parsed.orders.length === 0) {
        parsed.orders = [
          {
            id: 'ped-101',
            clientId: 'cli-1',
            clientName: 'Mariana Silva Santos',
            items: [
              {
                productId: 'prod-1',
                productName: 'Floratta Fleur Supreme Eau de Parfum',
                price: 189.90,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
              }
            ],
            subtotal: 189.90,
            paymentMethod: 'carne',
            installmentsCount: 4,
            carneId: 'carne-1',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: 'saiu_para_entrega',
            trackingStep: 2,
            statusUpdatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
          }
        ];
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading store data:', err);
  }

  const defaultData: StoreData = {
    products: initialProducts,
    categories: initialCategories,
    clients: initialClients,
    carnes: initialCarnes,
    orders: [
      {
        id: 'ped-101',
        clientId: 'cli-1',
        clientName: 'Mariana Silva Santos',
        items: [
          {
            productId: 'prod-1',
            productName: 'Floratta Fleur Supreme Eau de Parfum',
            price: 189.90,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
          }
        ],
        subtotal: 189.90,
        paymentMethod: 'carne',
        installmentsCount: 4,
        carneId: 'carne-1',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'saiu_para_entrega',
        trackingStep: 2,
        statusUpdatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ],
    installations: initialInstallations,
    settings: initialSettings,
    apiTokens: initialTokens,
    notifications: [
      {
        id: 'notif-1',
        title: 'Bem-vindo à Floratta Cosmético!',
        message: 'Catálogo de perfumes e cosméticos atualizado na nuvem com entrega expressa.',
        type: 'cliente_atualizacao',
        timestamp: new Date().toISOString(),
        read: false
      }
    ]
  };
  saveStoreData(defaultData);
  return defaultData;
}

function saveStoreData(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store data:', err);
  }
}

let storeState = loadStoreData();

// ================= API ROUTES =================

// Full state sync
app.get('/api/store', (req: Request, res: Response) => {
  res.json(storeState);
});

// Products: Add / Edit / Delete
app.post('/api/products', (req: Request, res: Response) => {
  const { action, product, id } = req.body;

  if (action === 'delete') {
    storeState.products = storeState.products.filter(p => p.id !== id);
    if (storeState.settings.featuredProductId === id && storeState.products.length > 0) {
      storeState.settings.featuredProductId = storeState.products[0].id;
    }
    storeState.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'Catálogo Floratta Atualizado',
      message: 'O catálogo de produtos foi atualizado na nuvem. Toque para conferir!',
      type: 'cliente_atualizacao',
      timestamp: new Date().toISOString(),
      read: false
    });
    saveStoreData(storeState);
    return res.json({ success: true, products: storeState.products });
  }

  if (action === 'save') {
    if (product.id) {
      const idx = storeState.products.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        storeState.products[idx] = { ...storeState.products[idx], ...product };
      } else {
        storeState.products.unshift(product);
      }
    } else {
      const newProduct: Product = {
        ...product,
        id: 'prod-' + Date.now(),
        createdAt: new Date().toISOString()
      };
      storeState.products.unshift(newProduct);
    }
    storeState.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'Novidades no Catálogo Floratta!',
      message: `O produto "${product.name || 'Novo produto'}" já está disponível para compra em até 12x no carnê!`,
      type: 'cliente_atualizacao',
      timestamp: new Date().toISOString(),
      read: false
    });
    saveStoreData(storeState);
    return res.json({ success: true, products: storeState.products });
  }

  res.status(400).json({ error: 'Invalid action' });
});

// Categories: Add / Edit / Delete
app.post('/api/categories', (req: Request, res: Response) => {
  const { action, category, id } = req.body;

  if (action === 'delete') {
    storeState.categories = storeState.categories.filter(c => c.id !== id);
    saveStoreData(storeState);
    return res.json({ success: true, categories: storeState.categories });
  }

  if (action === 'save') {
    if (category.id) {
      const idx = storeState.categories.findIndex(c => c.id === category.id);
      if (idx >= 0) {
        storeState.categories[idx] = { ...storeState.categories[idx], ...category };
      } else {
        storeState.categories.push(category);
      }
    } else {
      const newCategory: Category = {
        ...category,
        id: 'cat-' + Date.now(),
        slug: category.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      };
      storeState.categories.push(newCategory);
    }
    saveStoreData(storeState);
    return res.json({ success: true, categories: storeState.categories });
  }

  res.status(400).json({ error: 'Invalid action' });
});

// Register first access / Installation tracking
app.post('/api/installations', (req: Request, res: Response) => {
  const { clientName, deviceInfo } = req.body;
  if (!clientName) {
    return res.status(400).json({ error: 'Nome do cliente obrigatório' });
  }

  // Check if installation exists
  let inst = storeState.installations.find(i => i.clientName.toLowerCase() === clientName.toLowerCase());
  if (!inst) {
    inst = {
      id: 'inst-' + Date.now(),
      clientName: clientName.trim(),
      deviceInfo: deviceInfo || 'Mobile Device',
      installedAt: new Date().toISOString(),
      active: true
    };
    storeState.installations.unshift(inst);

    // Also register initial lightweight client record if not exists
    const existingClient = storeState.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    if (!existingClient) {
      storeState.clients.unshift({
        id: 'cli-' + Date.now(),
        name: clientName.trim(),
        firstAccessAt: new Date().toISOString()
      });
    }

    saveStoreData(storeState);
  }

  res.json({ success: true, installation: inst, installations: storeState.installations });
});

// Client registration & checkout update with Document & Selfie links
app.post('/api/clients', (req: Request, res: Response) => {
  const clientData: Client = req.body;
  if (!clientData.name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  let idx = -1;
  if (clientData.id) {
    idx = storeState.clients.findIndex(c => c.id === clientData.id);
  } else if (clientData.cpf) {
    idx = storeState.clients.findIndex(c => c.cpf === clientData.cpf);
  }

  if (idx >= 0) {
    storeState.clients[idx] = {
      ...storeState.clients[idx],
      ...clientData,
      registrationCompletedAt: new Date().toISOString()
    };
  } else {
    const newClient: Client = {
      ...clientData,
      id: clientData.id || 'cli-' + Date.now(),
      firstAccessAt: clientData.firstAccessAt || new Date().toISOString(),
      registrationCompletedAt: new Date().toISOString()
    };
    storeState.clients.unshift(newClient);
  }

  saveStoreData(storeState);
  res.json({ success: true, clients: storeState.clients });
});

// Orders & Carnê Generation
app.post('/api/orders', (req: Request, res: Response) => {
  const { client, items, paymentMethod, installmentsCount, customInterestRate } = req.body;

  if (!client || !items || !items.length) {
    return res.status(400).json({ error: 'Dados do pedido inválidos' });
  }

  const subtotal = items.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
  const orderId = 'ped-' + Date.now();
  let carne: Carne | null = null;

  if (paymentMethod === 'carne') {
    const count = installmentsCount || 1;
    const interest = customInterestRate !== undefined ? customInterestRate : storeState.settings.monthlyInterestRate;
    // Simple interest calculation per period: Total * (1 + (interest / 100) * (count > 1 ? count * 0.5 : 0))
    const multiplier = count > 1 ? 1 + ((interest / 100) * (count / 2)) : 1;
    const totalFinal = Math.round(subtotal * multiplier * 100) / 100;
    const installmentValue = Math.round((totalFinal / count) * 100) / 100;

    const installmentsList = [];
    const now = new Date();
    for (let i = 1; i <= count; i++) {
      const due = new Date(now);
      due.setDate(due.getDate() + (30 * i));
      const dueStr = due.toISOString().split('T')[0];
      installmentsList.push({
        number: i,
        dueDate: dueStr,
        amount: i === count ? Number((totalFinal - (installmentValue * (count - 1))).toFixed(2)) : installmentValue,
        status: 'pendente' as const
      });
    }

    carne = {
      id: 'carne-' + Date.now(),
      code: 'FLOR-' + new Date().getFullYear() + '-' + String(storeState.carnes.length + 1).padStart(3, '0'),
      orderId,
      clientId: client.id,
      clientName: client.name,
      clientCpf: client.cpf,
      clientPhone: client.phone,
      totalOriginal: subtotal,
      interestRate: interest,
      totalFinal,
      installmentsCount: count,
      installments: installmentsList,
      createdAt: new Date().toISOString(),
      status: 'em_dia'
    };

    storeState.carnes.unshift(carne);
  }

  const order: Order = {
    id: orderId,
    clientId: client.id,
    clientName: client.name,
    items,
    subtotal,
    paymentMethod,
    installmentsCount,
    carneId: carne?.id,
    createdAt: new Date().toISOString(),
    status: 'confirmado',
    trackingStep: 1,
    statusUpdatedAt: new Date().toISOString()
  };

  storeState.orders.unshift(order);

  // In-App internal notification for Admin as requested in item 6:
  // "quando um cliente finalizar uma compra, o administrador recebe uma notificação com o cliente, o produto e o valor. Essa notificação fica só dentro do aplicativo."
  const itemsSummary = items.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ');
  storeState.notifications.unshift({
    id: 'notif-' + Date.now(),
    title: 'Nova Compra Realizada!',
    message: `Cliente: ${client.name} • Produtos: ${itemsSummary} • Total: R$ ${subtotal.toFixed(2).replace('.', ',')}`,
    type: 'admin_nova_compra',
    timestamp: new Date().toISOString(),
    read: false,
    orderId
  });

  saveStoreData(storeState);

  res.json({ success: true, order, carne, carnes: storeState.carnes, notifications: storeState.notifications });
});

// Update Order Delivery Tracking Step (1: Pedido confirmado, 2: Saiu para entrega, 3: Entregue)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'confirmado' | 'saiu_para_entrega' | 'entregue'

  const order = storeState.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  order.status = status;
  if (status === 'confirmado') order.trackingStep = 1;
  else if (status === 'saiu_para_entrega') order.trackingStep = 2;
  else if (status === 'entregue') order.trackingStep = 3;

  order.statusUpdatedAt = new Date().toISOString();

  const stepLabels: Record<string, string> = {
    confirmado: 'Pedido Confirmado',
    saiu_para_entrega: 'Saiu para Entrega',
    entregue: 'Entregue com Sucesso'
  };

  // Push notification for client on mobile:
  // "o cliente recebe aviso no celular a cada mudança."
  storeState.notifications.unshift({
    id: 'notif-' + Date.now(),
    title: 'Atualização na Entrega!',
    message: `Seu pedido #${order.id} avançou para: ${stepLabels[status] || status}.`,
    type: 'cliente_entrega',
    timestamp: new Date().toISOString(),
    read: false,
    orderId: order.id,
    clientId: order.clientId
  });

  saveStoreData(storeState);
  res.json({ success: true, order, orders: storeState.orders, notifications: storeState.notifications });
});

// Mark notification as read
app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = storeState.notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveStoreData(storeState);
  }
  res.json({ success: true, notifications: storeState.notifications });
});

// Sales Reports Endpoint with Period Filter and Supplier Restock Aggregation
app.get('/api/reports/sales', (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'todos'; // 'hoje' | '7dias' | '30dias' | 'todos'

  const now = new Date();
  let filteredOrders = storeState.orders;

  if (period === 'hoje') {
    const todayStr = now.toISOString().split('T')[0];
    filteredOrders = storeState.orders.filter(o => o.createdAt.startsWith(todayStr));
  } else if (period === '7dias') {
    const cutoff = new Date(now.getTime() - (7 * 86400000));
    filteredOrders = storeState.orders.filter(o => new Date(o.createdAt) >= cutoff);
  } else if (period === '30dias') {
    const cutoff = new Date(now.getTime() - (30 * 86400000));
    filteredOrders = storeState.orders.filter(o => new Date(o.createdAt) >= cutoff);
  }

  // Aggregate items sold for restock/reposição
  const productAgg: Record<string, { productId: string; productName: string; quantity: number; revenue: number }> = {};
  filteredOrders.forEach(o => {
    o.items.forEach(it => {
      if (!productAgg[it.productId]) {
        productAgg[it.productId] = {
          productId: it.productId,
          productName: it.productName,
          quantity: 0,
          revenue: 0
        };
      }
      productAgg[it.productId].quantity += it.quantity;
      productAgg[it.productId].revenue += it.price * it.quantity;
    });
  });

  const itemsSold = Object.values(productAgg).sort((a, b) => b.quantity - a.quantity);
  const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.subtotal, 0);

  // Text for WhatsApp reposição/fornecedor as requested in item 8:
  // "Botão para enviar pelo WhatsApp o relatório com todos os produtos vendidos, de uma vez só, para usar na hora de comprar reposição."
  const whatsappRestockMessage = [
    `*FLORATTA COSMÉTICO - RELATÓRIO DE REPOSIÇÃO DE ESTOQUE*`,
    `Período: ${period.toUpperCase()}`,
    `Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`,
    `----------------------------------------`,
    `*Produtos Vendidos para Reposição:*`,
    ...itemsSold.map((it, idx) => `${idx + 1}. *${it.productName}* - Qtd Vendida: *${it.quantity} un*`),
    `----------------------------------------`,
    `Total de Itens: ${itemsSold.reduce((acc, it) => acc + it.quantity, 0)} unidades`,
    `Total Faturado: R$ ${totalRevenue.toFixed(2).replace('.', ',')}`
  ].join('\n');

  res.json({
    period,
    totalOrders: filteredOrders.length,
    totalRevenue,
    orders: filteredOrders,
    itemsSold,
    whatsappRestockMessage
  });
});

// CSV Spreadsheet Download Endpoint
app.get('/api/reports/sales/csv', (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'todos';

  const now = new Date();
  let filteredOrders = storeState.orders;

  if (period === 'hoje') {
    const todayStr = now.toISOString().split('T')[0];
    filteredOrders = storeState.orders.filter(o => o.createdAt.startsWith(todayStr));
  } else if (period === '7dias') {
    const cutoff = new Date(now.getTime() - (7 * 86400000));
    filteredOrders = storeState.orders.filter(o => new Date(o.createdAt) >= cutoff);
  } else if (period === '30dias') {
    const cutoff = new Date(now.getTime() - (30 * 86400000));
    filteredOrders = storeState.orders.filter(o => new Date(o.createdAt) >= cutoff);
  }

  const csvRows = [
    ['ID Pedido', 'Data', 'Cliente', 'Produtos', 'Valor Total (R$)', 'Forma Pagamento', 'Status Entrega'].join(';')
  ];

  filteredOrders.forEach(o => {
    const prods = o.items.map(i => `${i.quantity}x ${i.productName}`).join(' | ');
    csvRows.push([
      o.id,
      new Date(o.createdAt).toLocaleDateString('pt-BR'),
      `"${o.clientName.replace(/"/g, '""')}"`,
      `"${prods.replace(/"/g, '""')}"`,
      o.subtotal.toFixed(2).replace('.', ','),
      o.paymentMethod === 'carne' ? `Carnê (${o.installmentsCount || 1}x)` : 'À Vista',
      o.status
    ].join(';'));
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="floratta_vendas_${period}.csv"`);
  res.send('\uFEFF' + csvRows.join('\r\n')); // \uFEFF BOM for Excel compatibility
});

// Standalone Carnê Creation (avulso)
app.post('/api/carnes', (req: Request, res: Response) => {
  const { clientName, clientCpf, clientPhone, totalAmount, installmentsCount, interestRate, notes } = req.body;

  if (!clientName || !totalAmount) {
    return res.status(400).json({ error: 'Nome e valor são obrigatórios' });
  }

  const count = Number(installmentsCount) || 1;
  const rate = Number(interestRate) || 0;
  const multiplier = count > 1 ? 1 + ((rate / 100) * (count / 2)) : 1;
  const totalFinal = Math.round(Number(totalAmount) * multiplier * 100) / 100;
  const installmentValue = Math.round((totalFinal / count) * 100) / 100;

  const installmentsList = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const due = new Date(now);
    due.setDate(due.getDate() + (30 * i));
    const dueStr = due.toISOString().split('T')[0];
    installmentsList.push({
      number: i,
      dueDate: dueStr,
      amount: i === count ? Number((totalFinal - (installmentValue * (count - 1))).toFixed(2)) : installmentValue,
      status: 'pendente' as const
    });
  }

  const carne: Carne = {
    id: 'carne-' + Date.now(),
    code: 'FLOR-' + new Date().getFullYear() + '-AV' + String(storeState.carnes.length + 1).padStart(3, '0'),
    clientId: 'cli-avulso-' + Date.now(),
    clientName,
    clientCpf,
    clientPhone,
    totalOriginal: Number(totalAmount),
    interestRate: rate,
    totalFinal,
    installmentsCount: count,
    installments: installmentsList,
    createdAt: new Date().toISOString(),
    status: 'em_dia',
    notes
  };

  storeState.carnes.unshift(carne);
  saveStoreData(storeState);
  res.json({ success: true, carne, carnes: storeState.carnes });
});

// Carnê Installment Payment / Status Update
app.patch('/api/carnes/:id/installments/:num', (req: Request, res: Response) => {
  const { id, num } = req.params;
  const { status, receiptNumber } = req.body;

  const carne = storeState.carnes.find(c => c.id === id);
  if (!carne) {
    return res.status(404).json({ error: 'Carnê não encontrado' });
  }

  const inst = carne.installments.find(i => i.number === Number(num));
  if (!inst) {
    return res.status(404).json({ error: 'Parcela não encontrada' });
  }

  inst.status = status;
  if (status === 'pago') {
    inst.paidAt = new Date().toISOString().split('T')[0];
    inst.receiptNumber = receiptNumber || 'REC-' + Math.floor(1000 + Math.random() * 9000);
  } else {
    delete inst.paidAt;
    delete inst.receiptNumber;
  }

  // Recalculate overall carne status
  const allPaid = carne.installments.every(i => i.status === 'pago');
  const hasLate = carne.installments.some(i => i.status === 'atrasado');

  if (allPaid) {
    carne.status = 'quitado';
  } else if (hasLate) {
    carne.status = 'atrasado';
  } else {
    carne.status = 'em_dia';
  }

  saveStoreData(storeState);
  res.json({ success: true, carne, carnes: storeState.carnes });
});

// Settings update
app.post('/api/settings', (req: Request, res: Response) => {
  storeState.settings = { ...storeState.settings, ...req.body };
  saveStoreData(storeState);
  res.json({ success: true, settings: storeState.settings });
});

// API Tokens Management
app.post('/api/tokens', (req: Request, res: Response) => {
  const { action, name, id } = req.body;

  if (action === 'create') {
    const newToken: ApiToken = {
      id: 'tok-' + Date.now(),
      name: name || 'Nova Integração API',
      token: 'floratta_sec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      active: true
    };
    storeState.apiTokens.unshift(newToken);
    saveStoreData(storeState);
    return res.json({ success: true, token: newToken, tokens: storeState.apiTokens });
  }

  if (action === 'revoke') {
    const tok = storeState.apiTokens.find(t => t.id === id);
    if (tok) {
      tok.active = false;
      saveStoreData(storeState);
    }
    return res.json({ success: true, tokens: storeState.apiTokens });
  }

  if (action === 'delete') {
    storeState.apiTokens = storeState.apiTokens.filter(t => t.id !== id);
    saveStoreData(storeState);
    return res.json({ success: true, tokens: storeState.apiTokens });
  }

  res.status(400).json({ error: 'Ação inválida' });
});

// External Monitoring API (read-only with Bearer Token)
app.get('/api/v1/monitor', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : queryToken;

  const valid = storeState.apiTokens.find(t => t.token === token && t.active);
  if (!valid) {
    return res.status(401).json({
      error: 'Não autorizado',
      message: 'Token de API inválido ou inativo. Gere um token válido no painel administrativo da Floratta Cosmético.'
    });
  }

  // Record last used
  valid.lastUsedAt = new Date().toISOString();
  saveStoreData(storeState);

  // Calculate monitoring statistics
  const totalSales = storeState.orders.length;
  const totalRevenue = storeState.orders.reduce((acc, o) => acc + o.subtotal, 0);

  // Top products calculation
  const productSalesMap: Record<string, { product: Product; quantity: number }> = {};
  storeState.orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        const prod = storeState.products.find(p => p.id === item.productId);
        if (prod) {
          productSalesMap[item.productId] = { product: prod, quantity: 0 };
        }
      }
      if (productSalesMap[item.productId]) {
        productSalesMap[item.productId].quantity += item.quantity;
      }
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(p => ({
      id: p.product.id,
      name: p.product.name,
      price: p.product.price,
      quantitySold: p.quantity
    }));

  const upToDateCarnes = storeState.carnes.filter(c => c.status === 'em_dia' || c.status === 'quitado');
  const overdueCarnes = storeState.carnes.filter(c => c.status === 'atrasado');

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    store: storeState.settings.storeName,
    summary: {
      totalVendas: totalSales,
      receitaEstimada: Number(totalRevenue.toFixed(2)),
      totalProdutos: storeState.products.length,
      instalacoesApk: storeState.installations.length,
      totalClientes: storeState.clients.length,
      carnesEmDia: upToDateCarnes.length,
      carnesInadimplentes: overdueCarnes.length
    },
    produtosMaisVendidos: topProducts,
    clientesInadimplentes: overdueCarnes.map(c => ({
      carneCode: c.code,
      cliente: c.clientName,
      telefone: c.clientPhone,
      valorTotal: c.totalFinal,
      parcelasAtrasadas: c.installments.filter(i => i.status === 'atrasado').length
    })),
    instalacoesRecentes: storeState.installations.slice(0, 10)
  });
});

// AI Search and Voice Assistant endpoint
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  const { query, mode } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query necessária' });
  }

  const catalogContext = storeState.products.map(p =>
    `- [ID: ${p.id}] ${p.name} (R$ ${p.price}): ${p.description}. Notas: ${p.notes || 'N/A'}`
  ).join('\n');

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      const ai = new GoogleGenAI();
      const prompt = mode === 'voice_command'
        ? `Você é o assistente inteligente do Dashboard de Gestão da Floratta Cosmético.
O administrador falou: "${query}".
Interprete a intenção e responda de forma resumida, calorosa e executiva (em português do Brasil).
Dados da loja:
Total de vendas: ${storeState.orders.length}
Total de clientes: ${storeState.clients.length}
Instalações do app: ${storeState.installations.length}
Carnês atrasados: ${storeState.carnes.filter(c => c.status === 'atrasado').map(c => c.clientName).join(', ') || 'Nenhum'}
Produto destaque: ${storeState.products.find(p => p.id === storeState.settings.featuredProductId)?.name || 'Floratta Fleur Supreme'}
Responda com brevidade para ser falado em áudio.`
        : `Você é uma consultora de fragrâncias e cosméticos de luxo da Floratta Cosmético.
O cliente procura: "${query}".
Analise o catálogo abaixo e recomende os produtos mais adequados, explicando por que eles combinam com o desejo do cliente:
${catalogContext}
Retorne um texto simpático, persuasivo e elegante recomendando os produtos pelo ID exato.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        response: response.text,
        matchedProductIds: storeState.products
          .filter(p => query.toLowerCase().split(' ').some((w: string) => w.length > 2 && (p.name.toLowerCase().includes(w) || p.description.toLowerCase().includes(w) || (Boolean(p.notes) && (p.notes as string).toLowerCase().includes(w)))))
          .map(p => p.id)
      });
    }
  } catch (err) {
    console.warn('Gemini API call failed, using intelligent fallback:', err);
  }

  // Fallback local matching
  const words = query.toLowerCase().split(/\s+/).filter((w: string) => w.length >= 3);
  const matches = storeState.products.filter(p => {
    const hay = `${p.name} ${p.description} ${p.notes || ''} ${p.brand}`.toLowerCase();
    return words.some((w: string) => hay.includes(w));
  });

  const matched = matches.length > 0 ? matches : [storeState.products[0]];
  res.json({
    response: `Encontrei ${matched.length} opção(ões) incrível(is) para você na Floratta Cosmético! Recomendo conferir: ${matched.map(p => p.name).join(', ')}.`,
    matchedProductIds: matched.map(p => p.id)
  });
});

// Setup Vite or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Floratta Cosmético Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
