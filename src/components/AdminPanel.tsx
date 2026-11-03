import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Package,
  Layers,
  Users,
  CreditCard,
  Smartphone,
  Key,
  Settings,
  Mic,
  MicOff,
  Volume2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileDown,
  ExternalLink,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle,
  Copy,
  Printer,
  ChevronRight,
  ShieldCheck,
  Lock,
  Truck,
  Bell,
  BarChart3,
  FileSpreadsheet,
  MessageCircle,
  ShoppingBag
} from 'lucide-react';
import type { StoreData, Product, Category, Client, Carne, StoreSettings, ApiToken, Order } from '../types';
import { startSpeechRecognition, speakText, stopSpeaking, isSpeechRecognitionAvailable } from '../utils/speech';

interface AdminPanelProps {
  storeData: StoreData;
  onRefresh: () => void;
  onClose: () => void;
  onViewCarne: (carne: Carne) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  storeData,
  onRefresh,
  onClose,
  onViewCarne
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'pedidos' | 'relatorios' | 'notificacoes' | 'produtos' | 'categorias' | 'clientes' | 'carnes' | 'instalacoes' | 'config' | 'api'
  >('dashboard');

  // Sales report state
  const [reportPeriod, setReportPeriod] = useState<'todos' | 'hoje' | '7dias' | '30dias'>('todos');
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Voice Command State
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [voiceCardData, setVoiceCardData] = useState<any>(null);
  const hasVoice = isSpeechRecognitionAvailable();

  // Search filters
  const [productSearch, setProductSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [carneSearch, setCarneSearch] = useState('');

  // Selected client for modal inspection of sensitive documents
  const [inspectClient, setInspectClient] = useState<Client | null>(null);

  // Standalone Carnê form state
  const [showNewCarneModal, setShowNewCarneModal] = useState(false);
  const [avulsoClientName, setAvulsoClientName] = useState('');
  const [avulsoCpf, setAvulsoCpf] = useState('');
  const [avulsoPhone, setAvulsoPhone] = useState('');
  const [avulsoAmount, setAvulsoAmount] = useState('');
  const [avulsoInstallments, setAvulsoInstallments] = useState('4');
  const [avulsoInterest, setAvulsoInterest] = useState('2.5');

  // Product Edit/Create State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productImageInput, setProductImageInput] = useState('');

  // Category Edit/Create State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Config Form State
  const [interestRateInput, setInterestRateInput] = useState(storeData.settings.monthlyInterestRate.toString());
  const [audioTextInput, setAudioTextInput] = useState(storeData.settings.welcomeAudioText);
  const [whatsappInput, setWhatsappInput] = useState(storeData.settings.whatsappNumber);
  const [featuredIdInput, setFeaturedIdInput] = useState(storeData.settings.featuredProductId);

  // API Token State
  const [newTokenName, setNewTokenName] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // ================= VOICE DASHBOARD COMMAND HANDLER =================
  const handleVoiceCommand = async (command: string) => {
    setVoiceQuery(command);
    setIsListeningVoice(false);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: command, mode: 'voice_command' })
      });
      const data = await res.json();
      setVoiceResponse(data.response);

      // Speak response back
      speakText(data.response);

      // Categorize voice command to surface relevant UI card
      const lower = command.toLowerCase();
      if (lower.includes('mais vendido') || lower.includes('top')) {
        setVoiceCardData({ type: 'bestsellers' });
      } else if (lower.includes('atrasado') || lower.includes('inadimplente') || lower.includes('devendo')) {
        setVoiceCardData({
          type: 'overdue',
          carnes: storeData.carnes.filter(c => c.status === 'atrasado')
        });
      } else if (lower.includes('instal') || lower.includes('apk') || lower.includes('celular') || lower.includes('app')) {
        setVoiceCardData({
          type: 'installations',
          count: storeData.installations.length,
          list: storeData.installations
        });
      } else if (lower.includes('pagando') || lower.includes('em dia') || lower.includes('recebi')) {
        setVoiceCardData({
          type: 'uptodate',
          carnes: storeData.carnes.filter(c => c.status === 'em_dia' || c.status === 'quitado')
        });
      } else {
        setVoiceCardData(null);
      }
    } catch (err) {
      console.error('Voice command error:', err);
      const fallback = `Entendido. Total de ${storeData.orders.length} vendas registradas e ${storeData.installations.length} dispositivos com o app instalado.`;
      setVoiceResponse(fallback);
      speakText(fallback);
    }
  };

  const toggleVoiceRecording = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    setIsListeningVoice(true);
    startSpeechRecognition(
      (transcript) => handleVoiceCommand(transcript),
      () => setIsListeningVoice(false)
    );
  };

  // ================= EXPORT CLIENT LIST TO PRINTABLE PDF =================
  const handleExportClientsPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Floratta Cosmético - Relatório Oficial de Clientes</title>
        <style>
          body { font-family: sans-serif; padding: 25px; color: #111; }
          h1 { color: #86198f; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
          th { background-color: #f5d0fe; color: #701a75; }
          .header { border-bottom: 2px solid #86198f; padding-bottom: 12px; }
          .footer { margin-top: 30px; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FLORATTA COSMÉTICO</h1>
          <p>Relatório Consolidado de Cadastro de Clientes • Emitido em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome do Cliente</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Cidade / UF</th>
              <th>Primeiro Acesso</th>
              <th>Status do Cadastro</th>
            </tr>
          </thead>
          <tbody>
            ${storeData.clients.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.cpf || 'Não informado'}</td>
                <td>${c.phone || 'Não informado'}</td>
                <td>${c.address ? `${c.address.city}/${c.address.state}` : '-'}</td>
                <td>${new Date(c.firstAccessAt).toLocaleDateString('pt-BR')}</td>
                <td>${c.cpf ? 'Completo (comprador)' : 'Acesso Inicial'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Total de ${storeData.clients.length} clientes cadastrados na nuvem Floratta Cosmético. Documento com proteção LGPD.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // ================= CARNÊ BAIL / STATUS UPDATE =================
  const handleUpdateInstallment = async (carneId: string, installmentNumber: number, status: 'pago' | 'pendente') => {
    try {
      await fetch(`/api/carnes/${carneId}/installments/${installmentNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      onRefresh();
    } catch (err) {
      console.error('Error updating installment:', err);
    }
  };

  // ================= ORDER DELIVERY TRACKING UPDATE (3 STEPS) =================
  const handleUpdateOrderStatus = async (orderId: string, status: 'confirmado' | 'saiu_para_entrega' | 'entregue') => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      onRefresh();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // ================= FETCH SALES REPORTS & REPOSIÇÃO =================
  const fetchReports = async (period: string) => {
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/reports/sales?period=${period}`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching sales report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'relatorios') {
      fetchReports(reportPeriod);
    }
  }, [activeTab, reportPeriod]);

  const handleSendRestockWhatsApp = () => {
    if (!reportData?.whatsappRestockMessage) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportData.whatsappRestockMessage)}`;
    window.open(url, '_blank');
  };

  const handleDownloadSalesPdf = () => {
    if (!reportData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Floratta Cosmético - Relatório de Produtos Vendidos</title>
        <style>
          body { font-family: sans-serif; padding: 25px; color: #111; }
          h1 { color: #86198f; margin-bottom: 2px; }
          .header { border-bottom: 2px solid #86198f; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
          th { background-color: #f5d0fe; color: #701a75; }
          .summary-card { background: #faf5ff; border: 1px solid #e9d5ff; padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 13px; }
          .footer { margin-top: 25px; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FLORATTA COSMÉTICO</h1>
          <p>Relatório de Produtos Vendidos & Reposição de Estoque • Período: ${reportPeriod.toUpperCase()}</p>
          <p style="font-size: 11px; color: #555;">Emitido em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div class="summary-card">
          <strong>Faturamento no Período:</strong> R$ ${reportData.totalRevenue.toFixed(2).replace('.', ',')} &nbsp;|&nbsp;
          <strong>Total de Pedidos:</strong> ${reportData.totalOrders} &nbsp;|&nbsp;
          <strong>Unidades Vendidas:</strong> ${reportData.itemsSold.reduce((a: number, b: any) => a + b.quantity, 0)} un
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome do Produto</th>
              <th>Quantidade Vendida</th>
              <th>Receita Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.itemsSold.map((it: any, idx: number) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${it.productName}</strong></td>
                <td>${it.quantity} un</td>
                <td>R$ ${it.revenue.toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Floratta Cosmético • Controle interno de vendas e reposição de fornecedor.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      onRefresh();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // ================= CREATE STANDALONE CARNÊ =================
  const handleCreateAvulsoCarne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avulsoClientName.trim() || !avulsoAmount) {
      alert('Nome e valor são obrigatórios.');
      return;
    }

    try {
      await fetch('/api/carnes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: avulsoClientName.trim(),
          clientCpf: avulsoCpf.trim() || undefined,
          clientPhone: avulsoPhone.trim() || undefined,
          totalAmount: parseFloat(avulsoAmount),
          installmentsCount: parseInt(avulsoInstallments, 10),
          interestRate: parseFloat(avulsoInterest)
        })
      });
      setShowNewCarneModal(false);
      setAvulsoClientName('');
      setAvulsoCpf('');
      setAvulsoPhone('');
      setAvulsoAmount('');
      onRefresh();
      alert('Carnê avulso gerado com sucesso! Já disponível para impressão e acompanhamento.');
    } catch (err) {
      alert('Erro ao criar carnê avulso.');
    }
  };

  // ================= SAVE PRODUCT =================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      alert('Nome e preço são obrigatórios');
      return;
    }

    const payload = {
      ...editingProduct,
      price: Number(editingProduct.price),
      stock: Number(editingProduct.stock || 10),
      images: editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80']
    };

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', product: payload })
      });
      setEditingProduct(null);
      setProductImageInput('');
      onRefresh();
    } catch (err) {
      alert('Erro ao salvar produto.');
    }
  };

  // ================= DELETE PRODUCT =================
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      onRefresh();
    } catch (err) {
      alert('Erro ao excluir produto.');
    }
  };

  // ================= ADD CATEGORY =================
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', category: { name: newCategoryName.trim() } })
      });
      setNewCategoryName('');
      onRefresh();
    } catch (err) {
      alert('Erro ao criar categoria.');
    }
  };

  // ================= DELETE CATEGORY =================
  const handleDeleteCategory = async (id: string) => {
    if (storeData.categories.length <= 1) {
      alert('Você precisa manter pelo menos uma categoria no catálogo.');
      return;
    }
    if (!confirm('Excluir esta categoria? Os produtos vinculados precisarão ser reatribuídos.')) return;
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      onRefresh();
    } catch (err) {
      alert('Erro ao excluir categoria.');
    }
  };

  // ================= SAVE CONFIG =================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyInterestRate: parseFloat(interestRateInput) || 2.5,
          welcomeAudioText: audioTextInput,
          whatsappNumber: whatsappInput,
          featuredProductId: featuredIdInput
        })
      });
      onRefresh();
      alert('Configurações da Floratta salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configurações.');
    }
  };

  // ================= CREATE API TOKEN =================
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: newTokenName.trim() || 'Launcher App Token' })
      });
      setNewTokenName('');
      onRefresh();
    } catch (err) {
      alert('Erro ao gerar token de API.');
    }
  };

  // ================= REVOKE API TOKEN =================
  const handleRevokeToken = async (id: string) => {
    try {
      await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', id })
      });
      onRefresh();
    } catch (err) {
      alert('Erro ao revogar token.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Metrics
  const totalOrders = storeData.orders.length;
  const totalRevenue = storeData.orders.reduce((acc, o) => acc + o.subtotal, 0);
  const upToDateCarnes = storeData.carnes.filter(c => c.status === 'em_dia' || c.status === 'quitado');
  const overdueCarnes = storeData.carnes.filter(c => c.status === 'atrasado');

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0c0514] text-white animate-fade-in overflow-hidden">
      {/* Top Navbar */}
      <div className="h-16 px-4 sm:px-6 bg-[#140822] border-b border-purple-500/25 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-purple-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.5)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Floratta Cosmético
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300">
                Painel Gestão Web
              </span>
            </div>
            <p className="text-[11px] text-purple-300/70">
              Controle central na nuvem: atualize aqui e reflita no celular dos clientes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Voice Command Button on Admin Top Bar */}
          {hasVoice && (
            <button
              onClick={toggleVoiceRecording}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition cursor-pointer ${
                isListeningVoice
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.8)]'
                  : 'bg-purple-900/40 hover:bg-purple-900 border-purple-500/30 text-fuchsia-300'
              }`}
              title="Falar comando de voz no dashboard (ex: 'mostrar quem está atrasado')"
            >
              {isListeningVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {isListeningVoice ? 'Ouvindo Comando...' : 'Comando de Voz'}
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-purple-900/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Voltar ao Catálogo do App"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className="w-16 sm:w-60 bg-[#12071f] border-r border-purple-500/20 p-2 sm:p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard & Voz', icon: Sparkles },
              { id: 'pedidos', label: 'Entregas & Pedidos', icon: Truck, badge: storeData.orders.filter(o => o.status !== 'entregue').length },
              { id: 'relatorios', label: 'Relatórios & Reposição', icon: BarChart3 },
              { id: 'notificacoes', label: 'Novas Compras', icon: Bell, badge: (storeData.notifications || []).filter(n => !n.read).length },
              { id: 'produtos', label: 'Catálogo de Produtos', icon: Package },
              { id: 'categorias', label: 'Abas & Categorias', icon: Layers },
              { id: 'clientes', label: 'Clientes & Documentos', icon: Users },
              { id: 'carnes', label: 'Carnês de Pagamento', icon: CreditCard },
              { id: 'instalacoes', label: 'Instalações do App', icon: Smartphone },
              { id: 'config', label: 'Juros & Destaque', icon: Settings },
              { id: 'api', label: 'API & Tokens', icon: Key }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const badgeCount = (tab as any).badge;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full p-2.5 sm:px-3 sm:py-3 rounded-2xl flex items-center justify-between transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500/80 to-purple-600/80 text-white font-bold shadow-lg border border-fuchsia-400/40'
                      : 'text-purple-300/80 hover:text-white hover:bg-purple-900/30 border border-transparent'
                  }`}
                  title={tab.label}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline text-xs sm:text-sm truncate">{tab.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden sm:block p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-300/80">
            <span className="font-bold text-white block mb-0.5">Sincronização Nuvem:</span>
            <span>Clientes recebem alterações em tempo real no celular.</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-7 overflow-y-auto bg-gradient-to-br from-[#0c0514] via-[#12071f] to-[#1a0b2c]">
          {/* ================= TAB: DASHBOARD & VOZ ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Voice Command Banner */}
              <div className="p-5 rounded-3xl glass-panel border border-fuchsia-500/30 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-lg shrink-0">
                      <div className="w-full h-full rounded-2xl bg-black/80 flex items-center justify-center">
                        <Mic className={`w-6 h-6 ${isListeningVoice ? 'text-rose-400 animate-pulse' : 'text-fuchsia-400'}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>Controle do Dashboard por Voz</span>
                        {hasVoice && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            Microfone Ativo
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-purple-300/80 mt-0.5">
                        Diga comandos como: <em>"quem está atrasado"</em>, <em>"quantas instalações hoje"</em>, <em>"mostrar produtos mais vendidos"</em>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={toggleVoiceRecording}
                      className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer w-full sm:w-auto ${
                        isListeningVoice
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.9)]'
                          : 'btn-floating'
                      }`}
                    >
                      {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>{isListeningVoice ? 'Parar Escuta' : 'Falar Comando de Voz'}</span>
                    </button>
                  </div>
                </div>

                {/* Voice Response Area */}
                {(voiceQuery || voiceResponse) && (
                  <div className="mt-4 pt-4 border-t border-purple-500/20 text-xs space-y-2 animate-fade-in">
                    {voiceQuery && (
                      <div className="flex items-center space-x-2 text-purple-300">
                        <span className="font-semibold text-fuchsia-400">Você falou:</span>
                        <span className="italic">"{voiceQuery}"</span>
                      </div>
                    )}
                    {voiceResponse && (
                      <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-fuchsia-500/30 text-white leading-relaxed flex items-start space-x-2.5">
                        <Volume2 className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-fuchsia-300 block mb-0.5">Resposta do Sistema:</span>
                          <p>{voiceResponse}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Voice Card Result if triggered */}
              {voiceCardData && (
                <div className="p-5 rounded-3xl glass-panel border border-fuchsia-400/40 animate-fade-in shadow-2xl">
                  {voiceCardData.type === 'overdue' && (
                    <div>
                      <h4 className="text-sm font-bold text-rose-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Clientes em Atraso ({voiceCardData.carnes.length})</span>
                      </h4>
                      {voiceCardData.carnes.length === 0 ? (
                        <p className="text-xs text-emerald-300">Parabéns! Nenhum cliente está com carnê atrasado no momento.</p>
                      ) : (
                        <div className="space-y-2">
                          {voiceCardData.carnes.map((c: Carne) => (
                            <div key={c.id} className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white block">{c.clientName}</span>
                                <span className="text-purple-300">Carnê {c.code} • Total: R$ {c.totalFinal.toFixed(2).replace('.', ',')}</span>
                              </div>
                              <button
                                onClick={() => onViewCarne(c)}
                                className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 border border-purple-500/30 text-white text-[11px] font-semibold"
                              >
                                Ver Carnê
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {voiceCardData.type === 'installations' && (
                    <div>
                      <h4 className="text-sm font-bold text-fuchsia-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                        <Smartphone className="w-4 h-4 text-fuchsia-400" />
                        <span>Dispositivos Instalados ({voiceCardData.count})</span>
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {voiceCardData.list.map((i: any) => (
                          <div key={i.id} className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">{i.clientName}</span>
                            <span className="text-purple-300 text-[11px]">{new Date(i.installedAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Big Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-3xl glass-card border border-fuchsia-500/30">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                    Faturamento Vendas
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-white">
                    R$ {totalRevenue.toFixed(2).replace('.', ',')}
                  </div>
                  <span className="text-[11px] text-purple-400/80 block mt-1">{totalOrders} pedidos realizados</span>
                </div>

                <div className="p-4 sm:p-5 rounded-3xl glass-card border border-emerald-500/30">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                    Carnês em Dia
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-300">
                    {upToDateCarnes.length}
                  </div>
                  <span className="text-[11px] text-purple-400/80 block mt-1">Clientes adimplentes</span>
                </div>

                <div className="p-4 sm:p-5 rounded-3xl glass-card border border-rose-500/30">
                  <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block mb-1">
                    Carnês Atrasados
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-rose-400">
                    {overdueCarnes.length}
                  </div>
                  <span className="text-[11px] text-purple-400/80 block mt-1">Inadimplentes para cobrança</span>
                </div>

                <div className="p-4 sm:p-5 rounded-3xl glass-card border border-purple-500/30">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                    Instalações do App
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {storeData.installations.length}
                  </div>
                  <span className="text-[11px] text-purple-400/80 block mt-1">Aparelhos Android/Web</span>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('produtos')}
                  className="p-5 rounded-3xl glass-panel hover:border-fuchsia-400/50 transition cursor-pointer text-left group"
                >
                  <Package className="w-8 h-8 text-fuchsia-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-white mb-1">Gerenciar Produtos ({storeData.products.length})</h4>
                  <p className="text-xs text-purple-300/80">Adicione novos perfumes, edite fotos, preços e categorias.</p>
                </button>

                <button
                  onClick={() => setShowNewCarneModal(true)}
                  className="p-5 rounded-3xl glass-panel hover:border-fuchsia-400/50 transition cursor-pointer text-left group"
                >
                  <CreditCard className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-white mb-1">Emitir Carnê Avulso</h4>
                  <p className="text-xs text-purple-300/80">Gere e imprima um carnê sem precisar de uma venda vinculada.</p>
                </button>

                <button
                  onClick={handleExportClientsPdf}
                  className="p-5 rounded-3xl glass-panel hover:border-fuchsia-400/50 transition cursor-pointer text-left group"
                >
                  <FileDown className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-white mb-1">Exportar Clientes em PDF</h4>
                  <p className="text-xs text-purple-300/80">Gere lista completa de clientes com dados para impressão.</p>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB: ENTREGAS & PEDIDOS (3 ETAPAS) ================= */}
          {activeTab === 'pedidos' && (
            <div className="space-y-5 max-w-6xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-fuchsia-400" />
                  <span>Acompanhamento de Entrega em Três Etapas</span>
                </h2>
                <p className="text-xs text-purple-300/80">
                  Etapas: <strong>1. Pedido Confirmado</strong> &rarr; <strong>2. Saiu para Entrega</strong> &rarr; <strong>3. Entregue</strong>. O cliente acompanha a barra de progresso no celular e recebe aviso a cada mudança.
                </p>
              </div>

              {storeData.orders.length === 0 ? (
                <div className="py-16 text-center space-y-3 glass-panel rounded-3xl border border-purple-500/20 p-8">
                  <p className="text-sm text-purple-300">Nenhum pedido registrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {storeData.orders.map((order) => {
                    const step = order.trackingStep || (order.status === 'entregue' ? 3 : order.status === 'saiu_para_entrega' ? 2 : 1);
                    return (
                      <div
                        key={order.id}
                        className="p-5 rounded-3xl glass-panel border border-purple-500/25 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center space-x-2.5">
                              <span className="text-sm font-bold text-white">Pedido #{order.id}</span>
                              <span className="text-xs text-purple-300">• Cliente: <strong>{order.clientName}</strong></span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  step === 3
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                    : step === 2
                                    ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                    : 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30'
                                }`}
                              >
                                {step === 1 ? '1. Pedido Confirmado' : step === 2 ? '2. Saiu para Entrega' : '3. Entregue'}
                              </span>
                            </div>
                            <span className="text-xs text-purple-300/80 block mt-0.5">
                              Data: {new Date(order.createdAt).toLocaleDateString('pt-BR')} • Total: <strong className="text-fuchsia-300">R$ {order.subtotal.toFixed(2).replace('.', ',')}</strong> ({order.paymentMethod === 'carne' ? `Carnê ${order.installmentsCount || 1}x` : 'À Vista'})
                            </span>
                          </div>

                          {/* Quick delivery stage advance buttons */}
                          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                            {step < 2 && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'saiu_para_entrega')}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow transition"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Despachar (Saiu para Entrega)</span>
                              </button>
                            )}

                            {step === 2 && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'entregue')}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow transition"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Confirmar Entrega ao Cliente</span>
                              </button>
                            )}

                            {step === 3 && (
                              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>Entrega Concluída</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Items list */}
                        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/15 flex flex-wrap gap-2 text-xs">
                          {order.items.map((it, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-purple-900/40 border border-purple-500/20 text-purple-200">
                              <strong>{it.quantity}x</strong> {it.productName}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB: RELATÓRIOS & REPOSIÇÃO DE ESTOQUE ================= */}
          {activeTab === 'relatorios' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-fuchsia-400" />
                    <span>Relatórios de Vendas & Reposição</span>
                  </h2>
                  <p className="text-xs text-purple-300/80">
                    Acompanhe produtos vendidos por período, baixe em PDF ou planilha e envie pelo WhatsApp para seu fornecedor.
                  </p>
                </div>

                {/* Period Filter Selector */}
                <div className="flex space-x-1.5 p-1 rounded-2xl bg-purple-950/80 border border-purple-500/30">
                  {[
                    { id: 'hoje', label: 'Hoje' },
                    { id: '7dias', label: '7 Dias' },
                    { id: '30dias', label: '30 Dias' },
                    { id: 'todos', label: 'Todos' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setReportPeriod(p.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        reportPeriod === p.id
                          ? 'btn-floating text-white'
                          : 'text-purple-300 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: PDF, Planilha CSV, WhatsApp Reposição */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleDownloadSalesPdf}
                  className="p-3.5 rounded-2xl glass-card hover:border-fuchsia-400 border border-purple-500/30 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow"
                >
                  <FileDown className="w-4 h-4 text-fuchsia-400" />
                  <span>Baixar Lista em PDF</span>
                </button>

                <a
                  href={`/api/reports/sales/csv?period=${reportPeriod}`}
                  download={`floratta_vendas_${reportPeriod}.csv`}
                  className="p-3.5 rounded-2xl glass-card hover:border-emerald-400 border border-purple-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow text-center"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Baixar Planilha (CSV / Excel)</span>
                </a>

                <button
                  onClick={handleSendRestockWhatsApp}
                  className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Reposição no WhatsApp</span>
                </button>
              </div>

              {/* Summary Cards */}
              {reportData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-3xl glass-card border border-fuchsia-500/30">
                    <span className="text-[11px] text-purple-300 block mb-1">Faturamento no Período</span>
                    <div className="text-2xl font-black text-white">
                      R$ {reportData.totalRevenue.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                  <div className="p-4 rounded-3xl glass-card border border-purple-500/30">
                    <span className="text-[11px] text-purple-300 block mb-1">Total de Pedidos</span>
                    <div className="text-2xl font-black text-fuchsia-300">{reportData.totalOrders}</div>
                  </div>
                  <div className="p-4 rounded-3xl glass-card border border-emerald-500/30">
                    <span className="text-[11px] text-emerald-300 block mb-1">Unidades Vendidas para Reposição</span>
                    <div className="text-2xl font-black text-emerald-400">
                      {reportData.itemsSold.reduce((a: number, b: any) => a + b.quantity, 0)} un
                    </div>
                  </div>
                </div>
              )}

              {/* Items Sold Table */}
              <div className="rounded-3xl glass-panel border border-purple-500/25 overflow-hidden">
                <div className="p-4 border-b border-purple-500/20 bg-purple-950/40">
                  <h4 className="text-sm font-bold text-white">Lista de Produtos Vendidos para Reposição</h4>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-950/60 text-purple-300 border-b border-purple-500/20">
                    <tr>
                      <th className="p-3.5 pl-5">Produto</th>
                      <th className="p-3.5 text-center">Quantidade Vendida</th>
                      <th className="p-3.5 text-right pr-5">Receita Gerada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {reportData?.itemsSold?.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-purple-400">
                          Nenhum produto vendido no período selecionado.
                        </td>
                      </tr>
                    ) : (
                      reportData?.itemsSold?.map((it: any) => (
                        <tr key={it.productId} className="hover:bg-purple-900/20 transition">
                          <td className="p-3.5 pl-5 font-bold text-white">{it.productName}</td>
                          <td className="p-3.5 text-center font-extrabold text-fuchsia-300 text-sm">
                            {it.quantity} un
                          </td>
                          <td className="p-3.5 text-right pr-5 text-white">
                            R$ {it.revenue.toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB: NOTIFICAÇÕES INTERNAS (NOVAS COMPRAS) ================= */}
          {activeTab === 'notificacoes' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-fuchsia-400" />
                  <span>Notificações Internas do Aplicativo</span>
                </h2>
                <p className="text-xs text-purple-300/80">
                  Avisos de novas compras finalizadas por clientes que ficam salvos exclusivamente dentro do app.
                </p>
              </div>

              <div className="space-y-3">
                {(storeData.notifications || []).length === 0 ? (
                  <div className="py-12 text-center space-y-2 glass-panel rounded-3xl border border-purple-500/20 p-8">
                    <p className="text-sm text-purple-300">Nenhuma notificação registrada.</p>
                  </div>
                ) : (
                  (storeData.notifications || []).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                        notif.type === 'admin_nova_compra'
                          ? 'bg-fuchsia-950/40 border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                          : 'bg-purple-950/30 border-purple-500/20'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            notif.type === 'admin_nova_compra'
                              ? 'bg-fuchsia-600/40 text-fuchsia-300 border border-fuchsia-500/40'
                              : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {notif.type === 'admin_nova_compra' ? (
                            <ShoppingBag className="w-4 h-4 text-fuchsia-300" />
                          ) : (
                            <Bell className="w-4 h-4 text-purple-300" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                            {!notif.read && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-600 text-white font-bold">
                                Nova
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-purple-200/90 mt-0.5">{notif.message}</p>
                          <span className="text-[10px] text-purple-400/70 block mt-1">
                            {new Date(notif.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => handleMarkNotificationRead(notif.id)}
                          className="px-2.5 py-1 rounded-xl bg-purple-900/50 hover:bg-purple-900 text-purple-300 hover:text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB: CATÁLOGO DE PRODUTOS ================= */}
          {activeTab === 'produtos' && (
            <div className="space-y-5 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Catálogo de Produtos</h2>
                  <p className="text-xs text-purple-300/80">Edite fotos, preços, pirâmide olfativa e estoque em tempo real.</p>
                </div>
                <button
                  onClick={() => setEditingProduct({
                    name: '',
                    brand: 'Floratta Cosmético',
                    price: 99.90,
                    categoryId: storeData.categories[0]?.id || 'cat-perfumes',
                    description: '',
                    images: [],
                    notes: '',
                    volume: '100ml',
                    stock: 20
                  })}
                  className="px-4 py-2.5 rounded-2xl btn-floating text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Produto</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar produto por nome..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                />
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
              </div>

              {/* Products Table/Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeData.products
                  .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                  .map((prod) => (
                    <div key={prod.id} className="p-4 rounded-3xl glass-card border border-purple-500/20 flex flex-col justify-between">
                      <div>
                        <div className="relative h-44 rounded-2xl overflow-hidden mb-3 bg-black/40">
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] text-fuchsia-300 font-bold">
                              {prod.images.length} fotos
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[10px] text-fuchsia-400 font-bold uppercase">{prod.brand}</span>
                          <span className="text-[10px] text-purple-300">{prod.volume}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{prod.name}</h4>
                        <p className="text-xs text-purple-200/70 line-clamp-2 mb-2">{prod.description}</p>
                      </div>

                      <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-purple-300 block">Preço</span>
                          <span className="text-base font-extrabold text-fuchsia-300">
                            R$ {prod.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingProduct({ ...prod })}
                            className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 transition cursor-pointer"
                            title="Editar produto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition cursor-pointer"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================= TAB: ABAS & CATEGORIAS ================= */}
          {activeTab === 'categorias' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-white">Abas e Categorias do Catálogo</h2>
                <p className="text-xs text-purple-300/80">
                  Crie e edite abas como Batons, Maquiagem, Skincare ou Cabelo sem precisar refazer o aplicativo.
                </p>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="p-4 sm:p-5 rounded-3xl glass-panel border border-fuchsia-500/30 flex items-center space-x-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova aba (Ex: Cuidados com o Cabelo, Batons, Skincare)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl btn-floating text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Nova Aba</span>
                </button>
              </form>

              {/* Categories list */}
              <div className="space-y-2.5">
                {storeData.categories.map((cat) => {
                  const prodCount = storeData.products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl glass-card border border-purple-500/20 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                          <span className="text-xs text-purple-300/70">{prodCount} produtos nesta categoria</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition cursor-pointer"
                        title="Excluir categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB: CLIENTES & DOCUMENTOS ================= */}
          {activeTab === 'clientes' && (
            <div className="space-y-5 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Clientes & Documentos Seguros</h2>
                  <p className="text-xs text-purple-300/80">
                    Documentos e selfies vinculados ao cadastro com acesso restrito apenas ao administrador.
                  </p>
                </div>
                <button
                  onClick={handleExportClientsPdf}
                  className="px-4 py-2 rounded-2xl btn-floating text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-lg"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Exportar Lista em PDF</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar cliente por nome ou CPF..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                />
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
              </div>

              {/* Clients Table */}
              <div className="overflow-x-auto rounded-3xl glass-panel border border-purple-500/25">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-950/60 text-purple-300 border-b border-purple-500/20">
                    <tr>
                      <th className="p-3.5 pl-5">Nome do Cliente</th>
                      <th className="p-3.5">CPF</th>
                      <th className="p-3.5">Telefone</th>
                      <th className="p-3.5">Primeiro Acesso</th>
                      <th className="p-3.5">Documento & Selfie</th>
                      <th className="p-3.5 text-right pr-5">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {storeData.clients
                      .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.cpf && c.cpf.includes(clientSearch)))
                      .map((cli) => {
                        const hasDocs = cli.documentUrl || cli.selfieUrl;
                        return (
                          <tr key={cli.id} className="hover:bg-purple-900/20 transition">
                            <td className="p-3.5 pl-5">
                              <span className="font-bold text-white block">{cli.name}</span>
                              {cli.address && (
                                <span className="text-[10px] text-purple-300/70">
                                  {cli.address.city}/{cli.address.state}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-purple-200">{cli.cpf || <span className="text-purple-400/60 italic">Não informado</span>}</td>
                            <td className="p-3.5 text-purple-200">{cli.phone || '-'}</td>
                            <td className="p-3.5 text-purple-300/80">{new Date(cli.firstAccessAt).toLocaleDateString('pt-BR')}</td>
                            <td className="p-3.5">
                              {hasDocs ? (
                                <button
                                  onClick={() => setInspectClient(cli)}
                                  className="px-2.5 py-1 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                                >
                                  <Lock className="w-3 h-3 text-amber-400" />
                                  <span>Inspecionar Fotos</span>
                                </button>
                              ) : (
                                <span className="text-purple-400/50 text-[10px]">Sem fotos</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right pr-5">
                              <button
                                onClick={() => setInspectClient(cli)}
                                className="p-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/30 text-purple-200 transition cursor-pointer"
                                title="Ver detalhes completos"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB: CARNÊS & FINANÇAS ================= */}
          {activeTab === 'carnes' && (
            <div className="space-y-5 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Carnês de Pagamento & Controle Financeiro</h2>
                  <p className="text-xs text-purple-300/80">
                    Acompanhamento do que foi recebido, do que está em aberto e baixa com recibo.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewCarneModal(true)}
                  className="px-4 py-2.5 rounded-2xl btn-floating text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Carnê Avulso</span>
                </button>
              </div>

              {/* Carnês list */}
              <div className="space-y-3">
                {storeData.carnes.map((carne) => {
                  const isPaid = carne.status === 'quitado';
                  const isLate = carne.status === 'atrasado';
                  const paidCount = carne.installments.filter(i => i.status === 'pago').length;

                  return (
                    <div
                      key={carne.id}
                      className="p-4 sm:p-5 rounded-3xl glass-panel border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isPaid
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                              : isLate
                              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                              : 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40'
                          }`}
                        >
                          {carne.installmentsCount}x
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm sm:text-base font-bold text-white">{carne.clientName}</h4>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300">
                              {carne.code}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isPaid
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : isLate
                                  ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {isPaid ? 'Quitado' : isLate ? 'Atrasado' : 'Em Dia'}
                            </span>
                          </div>

                          <div className="text-xs text-purple-300/80 mt-1 flex flex-wrap gap-x-4">
                            <span>Total: <strong className="text-white">R$ {carne.totalFinal.toFixed(2).replace('.', ',')}</strong></span>
                            <span>Progresso: {paidCount} de {carne.installmentsCount} pagas</span>
                            {carne.clientPhone && <span>Tel: {carne.clientPhone}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => onViewCarne(carne)}
                          className="px-3.5 py-2 rounded-xl btn-floating text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Ver / Imprimir Carnê</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB: INSTALAÇÕES DO APP ================= */}
          {activeTab === 'instalacoes' && (
            <div className="space-y-5 max-w-5xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-white">Dashboard de Instalações do App</h2>
                <p className="text-xs text-purple-300/80">
                  Acompanhe quais clientes já instalaram o aplicativo e o alcance na base.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-4 rounded-2xl glass-card border border-fuchsia-500/30">
                  <span className="text-[11px] text-purple-300 block mb-1">Total de Dispositivos</span>
                  <div className="text-2xl font-bold text-white">{storeData.installations.length}</div>
                </div>
                <div className="p-4 rounded-2xl glass-card border border-emerald-500/30">
                  <span className="text-[11px] text-emerald-300 block mb-1">Dispositivos Ativos</span>
                  <div className="text-2xl font-bold text-emerald-300">{storeData.installations.filter(i => i.active).length}</div>
                </div>
                <div className="p-4 rounded-2xl glass-card border border-purple-500/30">
                  <span className="text-[11px] text-purple-300 block mb-1">Taxa de Adesão</span>
                  <div className="text-2xl font-bold text-fuchsia-300">
                    {storeData.clients.length > 0 ? Math.round((storeData.installations.length / storeData.clients.length) * 100) : 100}%
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {storeData.installations.map((inst) => (
                  <div key={inst.id} className="p-4 rounded-2xl glass-card border border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{inst.clientName}</h4>
                        <span className="text-xs text-purple-300/70">{inst.deviceInfo}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-purple-300/80 block">
                        Instalado em: {new Date(inst.installedAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-semibold inline-block mt-0.5">
                        Conectado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: CONFIGURAÇÕES & JUROS ================= */}
          {activeTab === 'config' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-white">Configurações de Venda & Destaque</h2>
                <p className="text-xs text-purple-300/80">
                  Ajuste a taxa de juros do carnê, selecione o produto da vitrine e configure a locução de voz.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl glass-panel border border-fuchsia-500/30 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">
                    Taxa de Juros Mensal do Carnê (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRateInput}
                    onChange={(e) => setInterestRateInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-purple-400/80 mt-1">
                    Taxa aplicada suavemente nos cálculos de parcelamento de 2x a 12x.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">
                    Produto em Destaque na Abertura (Vitrine)
                  </label>
                  <select
                    value={featuredIdInput}
                    onChange={(e) => setFeaturedIdInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/80 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                  >
                    {storeData.products.map(p => (
                      <option key={p.id} value={p.id} className="bg-purple-950">
                        {p.name} (R$ {p.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">
                    Texto da Apresentação por Voz na Abertura
                  </label>
                  <textarea
                    rows={3}
                    value={audioTextInput}
                    onChange={(e) => setAudioTextInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-purple-400/80 mt-1">
                    Texto lido com voz natural e calorosa de locutor ao abrir o aplicativo.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">
                    WhatsApp de Atendimento da Loja
                  </label>
                  <input
                    type="text"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    placeholder="5511999998888"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-2xl btn-floating font-bold text-xs uppercase tracking-wider cursor-pointer transition shadow-lg"
                >
                  Salvar Configurações
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB: API & TOKENS ================= */}
          {activeTab === 'api' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-white">API Própria & Chaves de Acesso (Tokens)</h2>
                <p className="text-xs text-purple-300/80">
                  Pronto para conectar ao seu launcher ou sistema externo. Consulta vendas, produtos, instalações e clientes com segurança.
                </p>
              </div>

              {/* Endpoint Documentation */}
              <div className="p-5 rounded-3xl glass-panel border border-fuchsia-500/30 space-y-3">
                <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider block">
                  Endpoint de Monitoramento:
                </span>
                <div className="p-3 rounded-xl bg-black/60 border border-purple-500/30 font-mono text-xs text-fuchsia-200 flex items-center justify-between">
                  <span className="truncate">GET /api/v1/monitor</span>
                  <span className="text-[10px] text-purple-400 font-sans">Header: Authorization: Bearer &lt;TOKEN&gt;</span>
                </div>
                <p className="text-xs text-purple-300/80">
                  A API retorna em formato JSON: total de vendas, produtos mais vendidos, instalações do APK, clientes em dia e clientes inadimplentes.
                </p>
              </div>

              {/* Generate Token Form */}
              <form onSubmit={handleCreateToken} className="p-4 rounded-2xl glass-card border border-purple-500/25 flex items-center space-x-3">
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="Nome do Token (Ex: Launcher Celular Android)..."
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl btn-floating text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow shrink-0"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Gerar Token</span>
                </button>
              </form>

              {/* Tokens List */}
              <div className="space-y-2.5">
                {storeData.apiTokens.map((tok) => (
                  <div key={tok.id} className="p-4 rounded-2xl glass-card border border-purple-500/20 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{tok.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tok.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'}`}>
                          {tok.active ? 'Ativo' : 'Revogado'}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-purple-300/80 flex items-center space-x-2">
                        <span>{tok.token.substring(0, 16)}••••••••••••</span>
                        <button
                          onClick={() => copyToClipboard(tok.token)}
                          className="text-fuchsia-400 hover:text-white transition cursor-pointer"
                          title="Copiar token completo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedToken === tok.token && (
                          <span className="text-emerald-400 text-[10px]">Copiado!</span>
                        )}
                      </div>
                    </div>

                    {tok.active && (
                      <button
                        onClick={() => handleRevokeToken(tok.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition"
                      >
                        Revogar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: INSPECIONAR DOCUMENTOS E SELFIE (SENSÍVEL) ================= */}
      {inspectClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-2xl p-6 rounded-3xl glass-panel border border-fuchsia-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Documentos Confidenciais de {inspectClient.name}</h3>
              </div>
              <button
                onClick={() => setInspectClient(null)}
                className="w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-900 text-purple-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center">
                <span className="text-xs font-bold text-purple-300 block mb-2">Foto do Documento (RG/CNH):</span>
                {inspectClient.documentUrl ? (
                  <div className="h-48 rounded-xl overflow-hidden bg-black/60 border border-purple-500/20 mb-2">
                    <img src={inspectClient.documentUrl} alt="Documento" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 rounded-xl flex items-center justify-center text-xs text-purple-400/60 bg-black/40">
                    Nenhum documento anexado
                  </div>
                )}
                {inspectClient.documentUrl && (
                  <a
                    href={inspectClient.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-fuchsia-400 hover:underline flex items-center justify-center space-x-1"
                  >
                    <span>Abrir em tamanho original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center">
                <span className="text-xs font-bold text-purple-300 block mb-2">Selfie do Titular:</span>
                {inspectClient.selfieUrl ? (
                  <div className="h-48 rounded-xl overflow-hidden bg-black/60 border border-purple-500/20 mb-2">
                    <img src={inspectClient.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 rounded-xl flex items-center justify-center text-xs text-purple-400/60 bg-black/40">
                    Nenhuma selfie anexada
                  </div>
                )}
                {inspectClient.selfieUrl && (
                  <a
                    href={inspectClient.selfieUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-fuchsia-400 hover:underline flex items-center justify-center space-x-1"
                  >
                    <span>Abrir em tamanho original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300">
              <p><strong>Aviso de Segurança (LGPD):</strong> Os arquivos de documentos e selfies são visíveis única e exclusivamente aos administradores cadastrados da Floratta Cosmético.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EMITIR CARNÊ AVULSO ================= */}
      {showNewCarneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-3xl glass-panel border border-fuchsia-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-4">
              <h3 className="text-base font-bold text-white">Emitir Carnê Avulso (Sem Venda Prévia)</h3>
              <button
                onClick={() => setShowNewCarneModal(false)}
                className="w-8 h-8 rounded-full bg-purple-950 text-purple-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAvulsoCarne} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-purple-300 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={avulsoClientName}
                  onChange={(e) => setAvulsoClientName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">CPF (opcional)</label>
                  <input
                    type="text"
                    value={avulsoCpf}
                    onChange={(e) => setAvulsoCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={avulsoPhone}
                    onChange={(e) => setAvulsoPhone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={avulsoAmount}
                    onChange={(e) => setAvulsoAmount(e.target.value)}
                    placeholder="199.90"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">Parcelas</label>
                  <select
                    value={avulsoInstallments}
                    onChange={(e) => setAvulsoInstallments(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950 border border-purple-500/30 text-white text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">Juros (% a.m.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={avulsoInterest}
                    onChange={(e) => setAvulsoInterest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl btn-floating font-bold text-xs uppercase tracking-wider mt-2 cursor-pointer"
              >
                Gerar Carnê Avulso
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR / CRIAR PRODUTO COM VÁRIAS FOTOS ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl my-6 p-6 rounded-3xl glass-panel border border-fuchsia-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingProduct.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-purple-950 text-purple-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-purple-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ex: Floratta Fleur Supreme Eau de Parfum"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    placeholder="189.90"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">Categoria (Aba) *</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950 border border-purple-500/30 text-white text-xs"
                  >
                    {storeData.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-purple-300 mb-1">Descrição Comercial</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                />
              </div>

              {/* Multiple Photos Manager */}
              <div>
                <label className="block text-[11px] text-purple-300 mb-1">
                  Galeria de Fotos (Várias fotos por produto - cole o link)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="url"
                    value={productImageInput}
                    onChange={(e) => setProductImageInput(e.target.value)}
                    placeholder="Cole o link da foto (URL)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (productImageInput.trim()) {
                        const currentImages = editingProduct.images || [];
                        setEditingProduct({
                          ...editingProduct,
                          images: [...currentImages, productImageInput.trim()]
                        });
                        setProductImageInput('');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Adicionar Foto
                  </button>
                </div>

                {/* Thumbnails of images added */}
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {(editingProduct.images || []).map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500/30 shrink-0">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = (editingProduct.images || []).filter((_, i) => i !== idx);
                          setEditingProduct({ ...editingProduct, images: filtered });
                        }}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">Pirâmide Olfativa / Detalhes</label>
                  <input
                    type="text"
                    value={editingProduct.notes || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, notes: e.target.value })}
                    placeholder="Topo: ..., Coração: ..., Fundo: ..."
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-purple-300 mb-1">Volume / Conteúdo</label>
                  <input
                    type="text"
                    value={editingProduct.volume || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                    placeholder="Ex: 75ml ou 4g"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl btn-floating font-bold text-xs uppercase tracking-wider mt-3 cursor-pointer"
              >
                Salvar Produto na Nuvem
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
