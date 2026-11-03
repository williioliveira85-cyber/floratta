import React from 'react';
import { X, CheckCircle, Truck, PackageCheck, Clock, MapPin, Sparkles, MessageCircle, ArrowLeft } from 'lucide-react';
import type { Order, StoreSettings } from '../types';

interface OrderTrackingModalProps {
  order: Order;
  settings: StoreSettings;
  onClose: () => void;
  onOpenCarne?: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  settings,
  onClose,
  onOpenCarne
}) => {
  const currentStep = order.trackingStep || (order.status === 'entregue' ? 3 : order.status === 'saiu_para_entrega' ? 2 : 1);

  const steps = [
    {
      step: 1,
      title: 'Pedido Confirmado',
      description: 'Compra registrada e separação do estoque',
      icon: CheckCircle
    },
    {
      step: 2,
      title: 'Saiu para Entrega',
      description: 'A caminho do seu endereço com representante Floratta',
      icon: Truck
    },
    {
      step: 3,
      title: 'Entregue com Sucesso',
      description: 'Produtos entregues e conferidos',
      icon: PackageCheck
    }
  ];

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Olá Floratta Cosmético! Gostaria de falar sobre o andamento do meu pedido #${order.id}.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${settings.whatsappNumber || '5511999998888'}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 rounded-3xl glass-panel border border-fuchsia-500/35 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Acompanhamento de Entrega</h3>
              <span className="text-xs text-purple-300 font-mono">Pedido #{order.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Progress Bar with 3 Steps */}
          <div>
            <div className="relative flex items-center justify-between mb-8 px-2">
              {/* Connecting line */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-purple-950 rounded-full z-0">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{
                    width: currentStep === 1 ? '15%' : currentStep === 2 ? '55%' : '100%'
                  }}
                />
              </div>

              {steps.map((s) => {
                const Icon = s.icon;
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div key={s.step} className="flex flex-col items-center relative z-10 text-center w-24">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isPassed
                          ? s.step === 3
                            ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                            : 'btn-floating text-white shadow-[0_0_20px_rgba(217,70,239,0.7)]'
                          : 'bg-purple-950/80 border border-purple-500/30 text-purple-400/60'
                      } ${isCurrent ? 'scale-115 ring-4 ring-fuchsia-500/30' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2.5 block ${
                        isCurrent
                          ? 'text-fuchsia-300 font-extrabold'
                          : isPassed
                          ? 'text-white'
                          : 'text-purple-400/60'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current Step Highlight Banner */}
            <div className="p-4 rounded-2xl bg-purple-950/50 border border-fuchsia-500/30 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider block">
                  Etapa Atual ({currentStep}/3): {steps[currentStep - 1].title}
                </span>
                <p className="text-xs text-purple-200/90 mt-0.5">
                  {steps[currentStep - 1].description}
                </p>
                {order.statusUpdatedAt && (
                  <span className="text-[10px] text-purple-400 block mt-1">
                    Última atualização: {new Date(order.statusUpdatedAt).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Items Summary in this Order */}
          <div>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
              Itens do Pedido ({order.items.length}):
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img src={it.image} alt={it.productName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <span className="font-semibold text-white truncate">{it.quantity}x {it.productName}</span>
                  </div>
                  <span className="font-extrabold text-fuchsia-300 shrink-0 ml-2">
                    R$ {(it.price * it.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-purple-500/15">
            {order.carneId && onOpenCarne && (
              <button
                onClick={onOpenCarne}
                className="w-full py-3 px-4 rounded-2xl btn-floating font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Ver / Imprimir Carnê do Pedido</span>
              </button>
            )}

            <button
              onClick={handleWhatsAppContact}
              className="w-full py-2.5 px-4 rounded-2xl glass-card hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Dúvidas sobre a entrega no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
