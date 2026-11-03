import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus, CreditCard, Sparkles, MessageCircle } from 'lucide-react';
import type { OrderItem, StoreSettings } from '../types';

interface CartModalProps {
  items: OrderItem[];
  settings: StoreSettings;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  items,
  settings,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout
}) => {
  const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const totalCount = items.reduce((acc, it) => acc + it.quantity, 0);

  const handleWhatsAppInquiry = () => {
    if (items.length === 0) return;
    const orderLines = items.map(i => `• ${i.quantity}x ${i.productName} - R$ ${(i.price * i.quantity).toFixed(2).replace('.', ',')}`).join('\n');
    const msg = encodeURIComponent(
      `*Olá, Floratta Cosmético!*\nGostaria de comprar os seguintes produtos no Carnê:\n\n${orderLines}\n\n*Total: R$ ${subtotal.toFixed(2).replace('.', ',')}*\nComo podemos fechar o meu pedido?`
    );
    window.open(`https://api.whatsapp.com/send?phone=${settings.whatsappNumber || '5511999998888'}&text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 rounded-3xl glass-panel border border-fuchsia-500/35 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sua Sacola de Cosméticos</h3>
              <span className="text-xs text-purple-300/80">{totalCount} item(s) selecionado(s)</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShoppingBag className="w-8 h-8 opacity-50" />
              </div>
              <h4 className="text-base font-bold text-white">Sua sacola está vazia</h4>
              <p className="text-xs text-purple-300/80 max-w-xs mx-auto">
                Explore nossos perfumes finos e cosméticos em destaque e adicione à sua sacola.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between gap-3"
              >
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-14 h-14 rounded-xl object-cover border border-purple-500/30 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{item.productName}</h4>
                  <span className="text-xs font-extrabold text-fuchsia-300 block">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] text-purple-300/70">ou até 12x no Carnê</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex items-center rounded-xl bg-purple-900/50 border border-purple-500/30 p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-purple-950 hover:bg-purple-800 text-purple-200 flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-purple-950 hover:bg-purple-800 text-purple-200 flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-purple-500/20 bg-purple-950/30 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300">Subtotal à vista:</span>
              <span className="text-base font-extrabold text-white">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-fuchsia-950/50 border border-fuchsia-500/30 flex items-center justify-between text-xs text-fuchsia-200">
              <div className="flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-fuchsia-400" />
                <span>Opção no Carnê Floratta:</span>
              </div>
              <span className="font-bold text-white">
                em até 12x a partir de R$ {(subtotal / 12).toFixed(2).replace('.', ',')}/mês
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="w-full py-3.5 px-6 rounded-2xl btn-floating font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer transition"
              >
                <span>Finalizar Pedido no Carnê</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppInquiry}
                className="w-full py-2.5 px-4 rounded-2xl glass-card hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Comprar Direto no WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
