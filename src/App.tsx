import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  CreditCard,
  Search,
  Mic,
  Share2,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronRight,
  Shield,
  Heart,
  MessageCircle,
  Clock,
  Printer,
  CheckCircle2,
  HelpCircle,
  Bell,
  Truck
} from 'lucide-react';
import type { StoreData, Product, Category, Carne, OrderItem, Order } from './types';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { InstallmentSimulatorModal } from './components/InstallmentSimulatorModal';
import { AiVoiceSearchModal } from './components/AiVoiceSearchModal';
import { FirstAccessModal } from './components/FirstAccessModal';
import { FeaturedSplashModal } from './components/FeaturedSplashModal';
import { CartModal } from './components/CartModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CarneViewerModal } from './components/CarneViewerModal';
import { AdminPanel } from './components/AdminPanel';
import { FavoritesModal } from './components/FavoritesModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { speakText, stopSpeaking } from './utils/speech';

export default function App() {
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  // Client Name & Onboarding state
  const [clientName, setClientName] = useState<string>(() => {
    return localStorage.getItem('floratta_client_name') || '';
  });
  const [showFirstAccess, setShowFirstAccess] = useState(!clientName);

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('floratta_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [showFavorites, setShowFavorites] = useState(false);

  // Order Tracking state
  const [showTracking, setShowTracking] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Client In-App Notification Dismissal state
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('floratta_dismissed_notifs') || '[]');
    } catch {
      return [];
    }
  });

  // Featured Splash Modal on App Open
  const [showSplash, setShowSplash] = useState(false);

  // Navigation & Category Tab state
  const [activeCategory, setActiveCategory] = useState<string>('cat-perfumes');
  const [mobileTab, setMobileTab] = useState<string>('home');

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [simulatorProduct, setSimulatorProduct] = useState<Product | null>(null);
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeCarne, setActiveCarne] = useState<Carne | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMyCarneLookup, setShowMyCarneLookup] = useState(false);
  const [myCarneCpfInput, setMyCarneCpfInput] = useState('');

  // Cart state
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('floratta_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // PWA Deferred Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  // Fetch store data from backend
  const fetchStoreData = async () => {
    try {
      const res = await fetch('/api/store');
      if (res.ok) {
        const data: StoreData = await res.json();
        setStoreData(data);
        if (data.categories.length > 0 && !activeCategory) {
          setActiveCategory(data.categories[0].id);
        }
      }
    } catch (err) {
      console.warn('Store fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();

    // Listen for PWA installation prompt on Android/Web
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Determine whether to show splash vitrine
    const hasSeenSplash = sessionStorage.getItem('floratta_seen_splash');
    if (!hasSeenSplash && clientName) {
      setShowSplash(true);
      sessionStorage.setItem('floratta_seen_splash', 'true');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [clientName]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('floratta_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // PWA Install Trigger
  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setCanInstallPwa(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar no celular: toque no menu do seu navegador (três pontinhos) e selecione "Adicionar à tela inicial" ou "Instalar Aplicativo".');
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
          image: product.images[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
        }
      ];
    });
    setShowCart(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleToggleFavorite = (product: Product) => {
    setFavoriteIds((prev) => {
      const updated = prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id];
      localStorage.setItem('floratta_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const dismissNotification = (id: string) => {
    setDismissedNotifIds((prev) => {
      const updated = [...prev, id];
      localStorage.setItem('floratta_dismissed_notifs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenLatestTracking = () => {
    if (!storeData || storeData.orders.length === 0) {
      alert('Você ainda não possui pedidos para acompanhamento no momento.');
      return;
    }
    const latest = storeData.orders[0];
    setActiveTrackingOrder(latest);
    setShowTracking(true);
  };

  // First access complete
  const handleFirstAccessComplete = (name: string) => {
    setClientName(name);
    setShowFirstAccess(false);
    setShowSplash(true);
    fetchStoreData();
  };

  // Order success
  const handleOrderSuccess = (order: Order, carne: Carne | null) => {
    setCartItems([]);
    setShowCheckout(false);
    fetchStoreData();
    setActiveTrackingOrder(order);

    if (carne) {
      setActiveCarne(carne);
    } else {
      setShowTracking(true);
    }
  };

  // My Carne lookup
  const handleLookupMyCarne = () => {
    if (!storeData) return;
    const clean = myCarneCpfInput.trim().toLowerCase();
    if (!clean) {
      alert('Por favor, informe seu CPF ou seu Nome para buscar o carnê.');
      return;
    }

    const found = storeData.carnes.find((c) =>
      (c.clientCpf && c.clientCpf.replace(/\D/g, '').includes(clean.replace(/\D/g, ''))) ||
      c.clientName.toLowerCase().includes(clean)
    );

    if (found) {
      setActiveCarne(found);
      setShowMyCarneLookup(false);
    } else {
      alert('Nenhum carnê ativo encontrado com os dados informados.');
    }
  };

  if (loading || !storeData) {
    return (
      <div className="min-h-screen bg-[#0c0514] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-purple-600 p-0.5 animate-spin">
          <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-fuchsia-400" />
          </div>
        </div>
        <p className="text-sm font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 animate-pulse">
          Carregando Floratta Cosmético...
        </p>
      </div>
    );
  }

  // Active featured product
  const featuredProduct = storeData.products.find(
    (p) => p.id === storeData.settings.featuredProductId
  ) || storeData.products[0];

  // Filter products by selected category tab
  const filteredProducts = storeData.products.filter(
    (p) => p.categoryId === activeCategory
  );

  const activeClientNotification = (storeData?.notifications || []).find(
    n => (n.type === 'cliente_atualizacao' || n.type === 'cliente_entrega') && !dismissedNotifIds.includes(n.id)
  );

  return (
    <div className="min-h-screen bg-[#0c0514] text-white flex flex-col selection:bg-fuchsia-600 selection:text-white pb-20 sm:pb-10">
      {/* Dynamic Background Glow Elements */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar
        clientName={clientName}
        cartCount={cartItems.reduce((acc, it) => acc + it.quantity, 0)}
        favoritesCount={favoriteIds.length}
        settings={storeData.settings}
        canInstallPwa={canInstallPwa}
        hasUnreadNotification={Boolean(activeClientNotification)}
        onOpenCart={() => setShowCart(true)}
        onOpenFavorites={() => setShowFavorites(true)}
        onOpenAiSearch={() => setShowAiSearch(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onInstallPwa={handleInstallPwa}
        onOpenMyCarne={() => setShowMyCarneLookup(true)}
        onOpenTracking={handleOpenLatestTracking}
      />

      {/* In-App Notification Banner for Customer as per item 6 */}
      {activeClientNotification && (
        <div className="bg-gradient-to-r from-fuchsia-950/95 via-purple-950/95 to-pink-950/95 border-b border-fuchsia-500/40 px-4 py-2.5 text-xs flex items-center justify-between shadow-xl animate-fade-in z-30">
          <div className="flex items-center space-x-2.5 text-purple-200 min-w-0">
            <Bell className="w-4 h-4 text-fuchsia-400 shrink-0 animate-bounce" />
            <div className="truncate">
              <strong className="text-white font-bold">{activeClientNotification.title}: </strong>
              <span className="text-purple-200">{activeClientNotification.message}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <button
              onClick={() => {
                fetchStoreData();
                dismissNotification(activeClientNotification.id);
                if (activeClientNotification.type === 'cliente_entrega') {
                  handleOpenLatestTracking();
                }
              }}
              className="px-2.5 py-1 rounded-xl btn-floating text-white font-bold text-[10px] cursor-pointer"
            >
              {activeClientNotification.type === 'cliente_entrega' ? 'Ver Entrega' : 'Atualizar App'}
            </button>
            <button
              onClick={() => dismissNotification(activeClientNotification.id)}
              className="p-1 text-purple-300 hover:text-white cursor-pointer"
              title="Fechar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        {/* Welcome Greeting on Mobile/Desktop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-500/15 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-purple-300">
              {clientName ? `Olá, ${clientName}!` : 'Olá!'} Bem-vindo(a) à Floratta Cosmético
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-fuchsia-300">
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30">
              <CreditCard className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Carnê em até 12x</span>
            </span>
            <button
              onClick={() => setShowMyCarneLookup(true)}
              className="px-2.5 py-1 rounded-full bg-purple-900/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 hover:text-white transition cursor-pointer"
            >
              Consultar Meu Carnê
            </button>
          </div>
        </div>

        {/* ================= HERO VITRINE EM DESTAQUE ================= */}
        {featuredProduct && (
          <section className="relative rounded-3xl overflow-hidden glass-panel border border-fuchsia-500/35 p-5 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Text side */}
              <div className="space-y-4 z-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/70 to-purple-600/70 text-xs font-bold text-white shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                  <span>Destaque Exclusivo da Vitrine</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-purple-200 leading-tight">
                  {featuredProduct.name}
                </h2>

                <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed max-w-lg">
                  {featuredProduct.description}
                </p>

                {/* Price and Installment Pill */}
                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-fuchsia-300">
                    R$ {featuredProduct.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-purple-300 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30">
                    ou em até <strong>12x no Carnê Floratta</strong>
                  </span>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleAddToCart(featuredProduct)}
                    className="py-3 px-6 rounded-2xl btn-floating font-bold text-sm flex items-center space-x-2 cursor-pointer transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Adicionar à Sacola</span>
                  </button>

                  <button
                    onClick={() => setSimulatorProduct(featuredProduct)}
                    className="py-3 px-4 rounded-2xl glass-card hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 hover:text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-fuchsia-400" />
                    <span>Simular Parcelas</span>
                  </button>

                  <button
                    onClick={() => {
                      speakText(storeData.settings.welcomeAudioText || `Conheça ${featuredProduct.name} na Floratta Cosmético.`);
                    }}
                    className="p-3 rounded-2xl glass-card hover:bg-purple-900/40 border border-purple-500/30 text-fuchsia-300 transition cursor-pointer"
                    title="Ouvir apresentação da locutora"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image side */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-black/40 border border-purple-500/30 shadow-2xl group cursor-pointer" onClick={() => setDetailProduct(featuredProduct)}>
                <img
                  src={featuredProduct.images[0]}
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0618] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur text-xs font-semibold text-purple-200 border border-purple-500/30 flex items-center space-x-1">
                  <span>Toque para ver fotos</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= CATÁLOGO POR ABAS ================= */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Catálogo de Produtos Floratta
              </h3>
              <p className="text-xs text-purple-300/80">
                Navegue pelas abas ou use a busca inteligente por inteligência artificial.
              </p>
            </div>

            <button
              onClick={() => setShowAiSearch(true)}
              className="px-3.5 py-2 rounded-2xl bg-purple-950/70 hover:bg-purple-900 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
            >
              <Mic className="w-4 h-4 text-fuchsia-400" />
              <span>Buscar por Voz / IA</span>
            </button>
          </div>

          {/* Abas e Categorias Horizontais */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {storeData.categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = storeData.products.filter((p) => p.categoryId === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-2 ${
                    isActive
                      ? 'btn-floating shadow-[0_0_20px_rgba(217,70,239,0.5)] scale-105'
                      : 'glass-card text-purple-300/80 hover:text-white hover:bg-purple-900/40 border border-purple-500/20'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-black/30 text-white' : 'bg-purple-950/70 text-purple-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid de Produtos da Aba */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3 glass-panel rounded-3xl border border-purple-500/20 p-8">
              <p className="text-sm text-purple-300">Nenhum produto cadastrado nesta categoria ainda.</p>
              <button
                onClick={() => setShowAdmin(true)}
                className="px-4 py-2 rounded-xl btn-floating text-xs font-bold cursor-pointer"
              >
                Cadastrar Produto pelo Painel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  settings={storeData.settings}
                  isFavorite={favoriteIds.includes(product.id)}
                  onOpenDetail={(prod) => setDetailProduct(prod)}
                  onOpenSimulator={(prod) => setSimulatorProduct(prod)}
                  onAddToCart={(prod) => handleAddToCart(prod)}
                  onToggleFavorite={(prod) => handleToggleFavorite(prod)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ================= BENEFÍCIOS DO CARNÊ FLORATTA ================= */}
        <section className="p-6 rounded-3xl glass-panel border border-fuchsia-500/20 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Carnê da Loja em até 12x</h4>
              <p className="text-xs text-purple-300/80">
                Condições exclusivas de parcelamento direto, sem burocracia bancária.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Aplicativo no Celular</h4>
              <p className="text-xs text-purple-300/80">
                Novos produtos e promoções chegam no seu celular em tempo real pela nuvem.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Segurança & Privacidade LGPD</h4>
              <p className="text-xs text-purple-300/80">
                Seus dados e documentos permanecem confidenciais e protegidos na nuvem.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-purple-500/15 py-8 text-center text-xs text-purple-300/60 space-y-2">
        <p className="font-semibold text-purple-200">
          Floratta Cosmético • Perfumaria & Cosméticos Finos
        </p>
        <p>
          Atendimento WhatsApp: {storeData.settings.whatsappNumber} • Atualização em nuvem para Android & Web
        </p>
      </footer>

      {/* Android Mobile Bottom Navigation Bar */}
      <MobileNav
        currentTab={mobileTab}
        cartCount={cartItems.reduce((acc, it) => acc + it.quantity, 0)}
        favoritesCount={favoriteIds.length}
        hasActiveOrder={storeData.orders.length > 0}
        onSelectTab={(tab) => {
          setMobileTab(tab);
          if (tab === 'catalogo') {
            window.scrollTo({ top: 350, behavior: 'smooth' });
          } else if (tab === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenAiSearch={() => setShowAiSearch(true)}
        onOpenCart={() => setShowCart(true)}
        onOpenMyCarne={() => setShowMyCarneLookup(true)}
        onOpenFavorites={() => setShowFavorites(true)}
        onOpenTracking={handleOpenLatestTracking}
      />

      {/* ================= MODALS ================= */}

      {/* 1. First Access Modal (name only, no CPF required) */}
      {showFirstAccess && (
        <FirstAccessModal onComplete={handleFirstAccessComplete} />
      )}

      {/* 2. Featured Splash Modal (audio voice greeting on open) */}
      {showSplash && featuredProduct && (
        <FeaturedSplashModal
          product={featuredProduct}
          settings={storeData.settings}
          onClose={() => setShowSplash(false)}
          onSelectProduct={(p) => setDetailProduct(p)}
          onAddToCart={(p) => handleAddToCart(p)}
        />
      )}

      {/* 3. Product Detail Modal (multi-photo gallery + WhatsApp) */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          settings={storeData.settings}
          onClose={() => setDetailProduct(null)}
          onOpenSimulator={(p) => setSimulatorProduct(p)}
          onAddToCart={(p) => handleAddToCart(p)}
        />
      )}

      {/* 4. Installment Simulator Modal (click price to compare parcelas) */}
      {simulatorProduct && (
        <InstallmentSimulatorModal
          product={simulatorProduct}
          settings={storeData.settings}
          onClose={() => setSimulatorProduct(null)}
          onSelectOption={(count) => {
            handleAddToCart(simulatorProduct);
            setShowCheckout(true);
          }}
        />
      )}

      {/* 5. AI Voice / Text Search Modal */}
      {showAiSearch && (
        <AiVoiceSearchModal
          products={storeData.products}
          settings={storeData.settings}
          onClose={() => setShowAiSearch(false)}
          onSelectProduct={(p) => setDetailProduct(p)}
        />
      )}

      {/* 6. Cart Bag Modal */}
      {showCart && (
        <CartModal
          items={cartItems}
          settings={storeData.settings}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onProceedCheckout={() => setShowCheckout(true)}
        />
      )}

      {/* 7. Checkout & Client Registration with Document/Selfie links + LGPD */}
      {showCheckout && (
        <CheckoutModal
          items={cartItems}
          settings={storeData.settings}
          defaultClientName={clientName}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
      )}

      {/* 8. Carnê Viewer & Printer Modal */}
      {activeCarne && (
        <CarneViewerModal
          carne={activeCarne}
          settings={storeData.settings}
          isAdmin={showAdmin}
          onClose={() => setActiveCarne(null)}
          onUpdateInstallment={async (carneId, num, status) => {
            await fetch(`/api/carnes/${carneId}/installments/${num}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
            });
            fetchStoreData();
            // Refresh active carne
            const updated = storeData.carnes.find(c => c.id === carneId);
            if (updated) setActiveCarne({ ...updated });
          }}
        />
      )}

      {/* 9. Administration Suite Modal */}
      {showAdmin && (
        <AdminPanel
          storeData={storeData}
          onRefresh={fetchStoreData}
          onClose={() => setShowAdmin(false)}
          onViewCarne={(carne) => setActiveCarne(carne)}
        />
      )}

      {/* 10. Consultar Meu Carnê Modal */}
      {showMyCarneLookup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-fuchsia-500/40 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Consultar Meu Carnê Floratta</h3>
            <p className="text-xs text-purple-300/80 mb-4">
              Informe seu CPF ou seu Nome para visualizar suas parcelas e comprovantes.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                autoFocus
                value={myCarneCpfInput}
                onChange={(e) => setMyCarneCpfInput(e.target.value)}
                placeholder="Digite seu CPF ou Nome..."
                className="w-full px-4 py-3 rounded-2xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
              />

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMyCarneLookup(false)}
                  className="flex-1 py-2.5 rounded-xl glass-card text-xs text-purple-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLookupMyCarne}
                  className="flex-1 py-2.5 rounded-xl btn-floating text-xs font-bold cursor-pointer"
                >
                  Buscar Carnê
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. Meus Favoritos Modal */}
      {showFavorites && (
        <FavoritesModal
          favoriteIds={favoriteIds}
          products={storeData.products}
          onClose={() => setShowFavorites(false)}
          onRemoveFavorite={(id) => {
            const p = storeData.products.find(item => item.id === id);
            if (p) handleToggleFavorite(p);
          }}
          onAddToCart={(p) => handleAddToCart(p)}
          onSelectProduct={(p) => setDetailProduct(p)}
        />
      )}

      {/* 12. Acompanhamento de Entrega em 3 Etapas */}
      {showTracking && activeTrackingOrder && (
        <OrderTrackingModal
          order={activeTrackingOrder}
          settings={storeData.settings}
          onClose={() => setShowTracking(false)}
          onOpenCarne={() => {
            setShowTracking(false);
            const carne = storeData.carnes.find(
              c => c.id === activeTrackingOrder.carneId || c.orderId === activeTrackingOrder.id
            );
            if (carne) setActiveCarne(carne);
          }}
        />
      )}
    </div>
  );
}
