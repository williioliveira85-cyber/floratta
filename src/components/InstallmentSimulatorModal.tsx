import React, { useState } from 'react';
import { X, CheckCircle, Calculator, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import type { Product, StoreSettings } from '../types';

interface InstallmentSimulatorModalProps {
  product: Product;
  settings: StoreSettings;
  onClose: () => void;
  onSelectOption: (installmentsCount: number) => void;
}

export const InstallmentSimulatorModal: React.FC<InstallmentSimulatorModalProps> = ({
  product,
  settings,
  onClose,
  onSelectOption
}) => {
  const allowed = settings.allowedInstallments || [1, 2, 3, 4, 5, 6, 10, 12];
  const [selectedCount, setSelectedCount] = useState<number>(4);

  // Compute installment breakdown
  const options = allowed.map((count) => {
    if (count === 1) {
      return {
        count: 1,
        installmentValue: product.price,
        total: product.price,
        interestText: 'Sem juros à vista'
      };
    }
    const rate = settings.monthlyInterestRate || 2.5;
    // Simple period multiplier: 1 + (rate% * (count/2))
    const multiplier = 1 + ((rate / 100) * (count / 2));
    const total = Math.round(product.price * multiplier * 100) / 100;
    const installmentValue = Math.round((total / count) * 100) / 100;

    return {
      count,
      installmentValue,
      total,
      interestText: `Juros suaves de ${rate}% ao mês no carnê`
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 rounded-3xl glass-panel border border-fuchsia-500/35 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Simulador de Parcelamento</h3>
              <p className="text-xs text-purple-300/80">Escolha a melhor condição no carnê Floratta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product snapshot */}
        <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover border border-purple-500/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate">{product.name}</h4>
            <span className="text-xs text-purple-300/80 block">Preço à vista:</span>
            <span className="text-base font-extrabold text-fuchsia-300">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Installment Options List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-5">
          {options.map((opt) => {
            const isSelected = selectedCount === opt.count;
            return (
              <div
                key={opt.count}
                onClick={() => setSelectedCount(opt.count)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-fuchsia-600/25 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.3)]'
                    : 'bg-purple-950/30 border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-950/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-fuchsia-400 bg-fuchsia-500 text-white'
                        : 'border-purple-500/40 bg-purple-950/60'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {opt.count === 1 ? '1x À Vista (Sem Juros)' : `${opt.count}x de R$ ${opt.installmentValue.toFixed(2).replace('.', ',')}`}
                    </span>
                    <span className="text-[11px] text-purple-300/70 block">
                      {opt.interestText}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-purple-200/90 font-medium block">
                    Total: R$ {opt.total.toFixed(2).replace('.', ',')}
                  </span>
                  {opt.count > 1 && (
                    <span className="text-[10px] text-fuchsia-300 px-2 py-0.5 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/30 inline-block mt-0.5">
                      Carnê Floratta
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onSelectOption(selectedCount);
            onClose();
          }}
          className="w-full py-3.5 px-5 rounded-2xl btn-floating font-semibold text-sm flex items-center justify-center space-x-2 cursor-pointer transition"
        >
          <span>Confirmar {selectedCount}x de R$ {options.find(o => o.count === selectedCount)?.installmentValue.toFixed(2).replace('.', ',')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
