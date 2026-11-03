import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Camera, Check, Lock, AlertCircle, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import type { OrderItem, StoreSettings, Client, Carne, Order } from '../types';

interface CheckoutModalProps {
  items: OrderItem[];
  settings: StoreSettings;
  defaultClientName: string;
  onClose: () => void;
  onSuccess: (order: Order, carne: Carne | null) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  settings,
  defaultClientName,
  onClose,
  onSuccess
}) => {
  const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);

  // Form states
  const [name, setName] = useState(defaultClientName || '');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [zip, setZip] = useState('');

  // Sensitive identity attachments via link as per spec
  const [documentUrl, setDocumentUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [consentLgpd, setConsentLgpd] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'a_vista' | 'carne'>('carne');
  const [installmentsCount, setInstallmentsCount] = useState<number>(4);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper mask for CPF
  const handleCpfChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 11);
    if (clean.length > 9) clean = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    else if (clean.length > 6) clean = clean.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (clean.length > 3) clean = clean.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    setCpf(clean);
  };

  // Helper mask for Phone
  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 11);
    if (clean.length > 10) clean = clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (clean.length > 5) clean = clean.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (clean.length > 2) clean = clean.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    setPhone(clean);
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'Nome completo é obrigatório.';
    if (!cpf.trim() || cpf.length < 14) err.cpf = 'CPF válido é obrigatório para emissão do pedido e carnê.';
    if (!phone.trim() || phone.length < 14) err.phone = 'Telefone/WhatsApp é obrigatório.';
    if (!street.trim()) err.street = 'Rua é obrigatória.';
    if (!number.trim()) err.number = 'Número é obrigatório.';
    if (!neighborhood.trim()) err.neighborhood = 'Bairro é obrigatório.';
    if (!city.trim()) err.city = 'Cidade é obrigatória.';
    if (!consentLgpd) err.consent = 'É necessário concordar com o termo de proteção de dados (LGPD).';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const clientData: Client = {
        id: 'cli-' + Date.now(),
        name: name.trim(),
        cpf: cpf.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: {
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim() || undefined,
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim() || '00000-000'
        },
        documentUrl: documentUrl.trim() || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
        selfieUrl: selfieUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        consentLgpd: true,
        firstAccessAt: new Date().toISOString(),
        registrationCompletedAt: new Date().toISOString()
      };

      // 1. Save or update client in database
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      // 2. Create Order & Carnê
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: clientData,
          items,
          paymentMethod,
          installmentsCount: paymentMethod === 'carne' ? installmentsCount : 1
        })
      });

      const orderData = await orderRes.json();
      if (orderData.success) {
        onSuccess(orderData.order, orderData.carne);
      } else {
        alert('Erro ao processar pedido: ' + (orderData.error || 'Tente novamente.'));
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Erro de conexão ao processar compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute live price with interest for installment preview
  const rate = settings.monthlyInterestRate || 2.5;
  const multiplier = paymentMethod === 'carne' && installmentsCount > 1
    ? 1 + ((rate / 100) * (installmentsCount / 2))
    : 1;
  const totalCalculated = Math.round(subtotal * multiplier * 100) / 100;
  const installmentValue = Math.round((totalCalculated / (paymentMethod === 'carne' ? installmentsCount : 1)) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 rounded-3xl glass-panel border border-fuchsia-500/35 overflow-hidden shadow-2xl">
        {/* Top Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-purple-200 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
          {/* Title */}
          <div>
            <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest block">
              Finalização & Cadastro Seguro
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Concluir Pedido no Carnê Floratta
            </h2>
            <p className="text-xs text-purple-300/80 mt-1">
              Preencha os dados para entrega e geração do seu carnê oficial de pagamento.
            </p>
          </div>

          {/* Items Summary preview */}
          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-purple-200">
              <ShoppingBag className="w-4 h-4 text-fuchsia-400" />
              <span><strong>{items.reduce((acc, it) => acc + it.quantity, 0)}</strong> itens na sacola</span>
            </div>
            <div className="text-sm font-extrabold text-fuchsia-300">
              Total base: R$ {subtotal.toFixed(2).replace('.', ',')}
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center space-x-1.5">
              <span>1. Seus Dados Pessoais</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome e Sobrenome"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                />
                {errors.name && <p className="text-rose-400 text-[10px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => handleCpfChange(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                />
                {errors.cpf && <p className="text-rose-400 text-[10px] mt-1">{errors.cpf}</p>}
              </div>

              <div>
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                />
                {errors.phone && <p className="text-rose-400 text-[10px] mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">E-mail (opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              2. Endereço de Entrega
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">Rua / Logradouro *</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Av. Paulista"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                />
                {errors.street && <p className="text-rose-400 text-[10px] mt-1">{errors.street}</p>}
              </div>

              <div>
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">Número *</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                />
                {errors.number && <p className="text-rose-400 text-[10px] mt-1">{errors.number}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">Bairro *</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Centro"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                />
                {errors.neighborhood && <p className="text-rose-400 text-[10px] mt-1">{errors.neighborhood}</p>}
              </div>

              <div>
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">Cidade *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                />
                {errors.city && <p className="text-rose-400 text-[10px] mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-[11px] text-purple-300 mb-1 font-medium">Estado (UF)</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-white text-xs focus:ring-1 focus:ring-fuchsia-400 focus:outline-none"
                >
                  {['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'PE', 'CE', 'SC', 'GO', 'DF', 'ES', 'Outro'].map(uf => (
                    <option key={uf} value={uf} className="bg-purple-950">{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Documento e Selfie por link (Conforme item 2 da especificação: sem upload manual, cópia de link) */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-fuchsia-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>3. Validação do Carnê (Link do Documento & Selfie)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span>Apenas Admin Visualiza</span>
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80 leading-tight">
              Para emissão do carnê sem consulta bancária, cole o link de uma foto do seu documento (RG ou CNH) e de uma selfie. Se preferir, pode enviar os links de fotos pelo WhatsApp para o atendente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-purple-300 mb-1 font-medium">
                  Link da Foto do Documento (RG/CNH):
                </label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto-documento.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs placeholder-purple-400/40 focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-purple-300 mb-1 font-medium">
                  Link da Selfie do Cliente:
                </label>
                <input
                  type="url"
                  value={selfieUrl}
                  onChange={(e) => setSelfieUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto-selfie.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs placeholder-purple-400/40 focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                />
              </div>
            </div>
          </div>

          {/* Forma de Pagamento & Escolha de Parcelas do Carnê */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              4. Forma de Pagamento
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('carne')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  paymentMethod === 'carne'
                    ? 'bg-fuchsia-600/30 border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                    : 'bg-purple-950/30 border-purple-500/20 text-purple-300'
                }`}
              >
                <span className="text-xs font-bold text-white block">Carnê Floratta</span>
                <span className="text-[10px] text-fuchsia-300 block">Em até 12x no carnê da loja</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('a_vista')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  paymentMethod === 'a_vista'
                    ? 'bg-fuchsia-600/30 border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                    : 'bg-purple-950/30 border-purple-500/20 text-purple-300'
                }`}
              >
                <span className="text-xs font-bold text-white block">À Vista (PIX / Dinheiro)</span>
                <span className="text-[10px] text-purple-300/80 block">Sem acréscimos</span>
              </button>
            </div>

            {/* Parcelas Selector if Carnê */}
            {paymentMethod === 'carne' && (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-fuchsia-500/30">
                <label className="block text-xs font-semibold text-fuchsia-300 mb-2">
                  Escolha o número de parcelas do carnê:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(settings.allowedInstallments || [1, 2, 3, 4, 5, 6, 10, 12]).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setInstallmentsCount(count)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        installmentsCount === count
                          ? 'bg-fuchsia-500 text-white shadow-md'
                          : 'bg-purple-900/40 text-purple-200 hover:bg-purple-900/70 border border-purple-500/20'
                      }`}
                    >
                      {count}x
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs">
                  <span className="text-purple-300">Condição escolhida:</span>
                  <span className="font-bold text-white">
                    {installmentsCount}x de R$ {installmentValue.toFixed(2).replace('.', ',')} (Total: R$ {totalCalculated.toFixed(2).replace('.', ',')})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* LGPD Consent Checkbox */}
          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/25">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentLgpd}
                onChange={(e) => setConsentLgpd(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 border-purple-500 bg-purple-950"
              />
              <span className="text-[11px] text-purple-200/90 leading-relaxed">
                <strong>Termo de Consentimento & LGPD:</strong> Autorizo a Floratta Cosmético a armazenar com segurança meus dados cadastrais e documentos exclusivamente para fins de faturamento, entrega dos produtos e controle interno do carnê de pagamento, com sigilo garantido.
              </span>
            </label>
            {errors.consent && <p className="text-rose-400 text-[10px] mt-1 ml-6">{errors.consent}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl btn-floating font-bold text-base flex items-center justify-center space-x-2 cursor-pointer transition disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Gerando Carnê e Pedido...' : `Confirmar Pedido • ${paymentMethod === 'carne' ? `${installmentsCount}x de R$ ${installmentValue.toFixed(2).replace('.', ',')}` : `R$ ${subtotal.toFixed(2).replace('.', ',')}`}`}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
