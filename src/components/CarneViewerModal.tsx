import React from 'react';
import { X, Printer, Share2, CheckCircle2, AlertTriangle, Clock, Sparkles, MessageCircle, ArrowLeft } from 'lucide-react';
import type { Carne, StoreSettings } from '../types';

interface CarneViewerModalProps {
  carne: Carne;
  settings: StoreSettings;
  isAdmin?: boolean;
  onClose: () => void;
  onUpdateInstallment?: (carneId: string, installmentNumber: number, status: 'pago' | 'pendente') => void;
}

export const CarneViewerModal: React.FC<CarneViewerModalProps> = ({
  carne,
  settings,
  isAdmin,
  onClose,
  onUpdateInstallment
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Floratta Cosmético - Carnê de Pagamento*\n🌸 Cliente: *${carne.clientName}*\nCódigo do Carnê: *${carne.code}*\nValor Total: R$ ${carne.totalFinal.toFixed(2).replace('.', ',')} (${carne.installmentsCount} parcelas)\n\n*Parcelas:*\n` +
      carne.installments.map(i => `• Parcela ${i.number}/${carne.installmentsCount}: R$ ${i.amount.toFixed(2).replace('.', ',')} - Venc: ${i.dueDate.split('-').reverse().join('/')} [${i.status.toUpperCase()}]`).join('\n') +
      `\n\nQualquer dúvida estamos à disposição!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${carne.clientPhone ? carne.clientPhone.replace(/\D/g, '') : ''}&text=${text}`, '_blank');
  };

  const paidCount = carne.installments.filter(i => i.status === 'pago').length;
  const totalPaid = carne.installments.filter(i => i.status === 'pago').reduce((a, b) => a + b.amount, 0);
  const totalPending = carne.totalFinal - totalPaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 rounded-3xl glass-panel border border-fuchsia-500/35 overflow-hidden shadow-2xl print-page">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between no-print bg-purple-950/40">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Carnê Oficial Floratta</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-900/60 border border-fuchsia-500/40 text-fuchsia-300 font-mono">
                  {carne.code}
                </span>
              </h2>
              <span className="text-xs text-purple-300/80">Controle Interno de Pagamentos da Loja</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 rounded-xl bg-emerald-700/60 hover:bg-emerald-600 border border-emerald-500/40 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Enviar extrato das parcelas via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl btn-floating text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition shadow-lg"
              title="Imprimir carnê / Salvar em PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Carnê</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-900 text-purple-200 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carnê Document Body */}
        <div className="p-5 sm:p-8 space-y-6 text-white bg-[#0e0618] print:bg-white print:text-black">
          {/* Header of the Carnê */}
          <div className="border-b-2 border-dashed border-fuchsia-500/30 print:border-black pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-fuchsia-400 print:text-black">
                  FLORATTA COSMÉTICO
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300 print:border-black print:text-black">
                  CARNÊ DA LOJA
                </span>
              </div>
              <p className="text-xs text-purple-300/80 print:text-gray-600 mt-0.5">
                Perfumes Finos, Cosméticos & Tratamentos Exclusivos
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-mono text-purple-300 print:text-black font-semibold">
                Nº CARNÊ: {carne.code}
              </div>
              <div className="text-[11px] text-purple-400/80 print:text-gray-600">
                Emissão: {new Date(carne.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Customer & Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 print:border print:border-black print:bg-gray-50">
            <div>
              <span className="text-[10px] uppercase font-bold text-fuchsia-400 print:text-black tracking-wider block">
                Dados do Titular
              </span>
              <h4 className="text-base font-bold text-white print:text-black mt-0.5">{carne.clientName}</h4>
              <div className="text-xs text-purple-300 print:text-black mt-1 space-y-0.5">
                {carne.clientCpf && <p>CPF: <strong>{carne.clientCpf}</strong></p>}
                {carne.clientPhone && <p>Tel: {carne.clientPhone}</p>}
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-purple-500/20 sm:pl-4 print:border-black">
              <span className="text-[10px] uppercase font-bold text-fuchsia-400 print:text-black tracking-wider block">
                Resumo do Financiamento
              </span>
              <div className="text-xs text-purple-300 print:text-black mt-1 space-y-0.5">
                <p>Total a Pagar: <strong className="text-white print:text-black text-sm">R$ {carne.totalFinal.toFixed(2).replace('.', ',')}</strong></p>
                <p>Condição: {carne.installmentsCount} parcelas {carne.interestRate > 0 ? `(${carne.interestRate}% a.m.)` : '(Sem juros)'}</p>
                <p className="text-[11px] text-emerald-400 print:text-black font-semibold">
                  Quitado: R$ {totalPaid.toFixed(2).replace('.', ',')} ({paidCount}/{carne.installmentsCount}) • Saldo: R$ {totalPending.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Barcode */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 print:border print:border-black">
            <div className="h-8 w-64 bg-gradient-to-r from-purple-200 via-fuchsia-300 to-purple-200 print:bg-black opacity-80 rounded flex items-center justify-around px-2">
              {[...Array(28)].map((_, i) => (
                <div
                  key={i}
                  className={`h-full bg-black print:bg-white ${i % 3 === 0 ? 'w-1.5' : i % 2 === 0 ? 'w-1' : 'w-0.5'}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono tracking-widest text-purple-300/80 print:text-black mt-1">
              {carne.code.replace(/-/g, ' ')} • {carne.clientCpf || 'FLORATTA-2026'}
            </span>
          </div>

          {/* Installments Table / Slips */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wider print:text-black">
              Lâminas das Parcelas
            </h3>

            <div className="space-y-2.5">
              {carne.installments.map((inst) => {
                const isPaid = inst.status === 'pago';
                const isLate = inst.status === 'atrasado';

                return (
                  <div
                    key={inst.number}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isPaid
                        ? 'bg-emerald-950/20 border-emerald-500/30 print:border-gray-400 print:bg-white'
                        : isLate
                        ? 'bg-rose-950/25 border-rose-500/40 print:border-gray-400 print:bg-white'
                        : 'bg-purple-950/30 border-purple-500/20 print:border-gray-400 print:bg-white'
                    }`}
                  >
                    {/* Installment Info */}
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isPaid
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 print:border-black print:text-black'
                            : isLate
                            ? 'bg-rose-600/30 text-rose-300 border border-rose-500/30 print:border-black print:text-black'
                            : 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/30 print:border-black print:text-black'
                        }`}
                      >
                        {inst.number}/{carne.installmentsCount}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white print:text-black">
                            Parcela {inst.number} de {carne.installmentsCount}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider print:border print:border-black ${
                              isPaid
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 print:text-black'
                                : isLate
                                ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40 print:text-black'
                                : 'bg-amber-900/60 text-amber-300 border border-amber-500/40 print:text-black'
                            }`}
                          >
                            {isPaid ? 'Quitada' : isLate ? 'Em Atraso' : 'A Vencer'}
                          </span>
                        </div>

                        <div className="text-xs text-purple-300/80 print:text-gray-700 mt-0.5 flex flex-wrap gap-x-3">
                          <span>Vencimento: <strong>{inst.dueDate.split('-').reverse().join('/')}</strong></span>
                          {inst.paidAt && <span>Pago em: {inst.paidAt.split('-').reverse().join('/')} (Recibo: {inst.receiptNumber})</span>}
                        </div>
                      </div>
                    </div>

                    {/* Value & Admin Actions */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-purple-400 print:text-gray-500 block">Valor:</span>
                        <span className="text-base font-extrabold text-fuchsia-300 print:text-black">
                          R$ {inst.amount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Admin Pay/Unpay button (no-print) */}
                      {isAdmin && onUpdateInstallment && (
                        <div className="no-print">
                          <button
                            onClick={() => onUpdateInstallment(carne.id, inst.number, isPaid ? 'pendente' : 'pago')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center space-x-1 ${
                              isPaid
                                ? 'bg-purple-900/40 hover:bg-purple-900 border-purple-500/30 text-purple-200'
                                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-md'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isPaid ? 'Desfazer Baixa' : 'Dar Baixa (Recebido)'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal / Internal Note */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/15 text-[11px] text-purple-300/70 print:text-gray-600 leading-tight">
            <p>
              * Documento de controle interno da Floratta Cosmético. Não constitui título de crédito negociável em cartório bancário. Pagamentos podem ser realizados via PIX ou em dinheiro diretamente com o representante. Guarde seus recibos para comprovação.
            </p>
          </div>
        </div>

        {/* Floating Print Button as requested in item 4 */}
        <div className="fixed bottom-6 right-6 z-50 no-print animate-bounce">
          <button
            onClick={handlePrint}
            className="py-3.5 px-6 rounded-2xl btn-floating font-black text-sm flex items-center space-x-2.5 shadow-[0_10px_35px_rgba(217,70,239,0.8)] cursor-pointer transition hover:scale-105 active:scale-95"
            title="Imprimir carnê com todas as parcelas, valores e vencimentos"
          >
            <Printer className="w-5 h-5 text-white" />
            <span>Imprimir Carnê Oficial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
