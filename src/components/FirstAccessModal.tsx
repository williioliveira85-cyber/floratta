import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';

interface FirstAccessModalProps {
  onComplete: (name: string) => void;
}

export const FirstAccessModal: React.FC<FirstAccessModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Por favor, informe seu nome para começar.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register device installation on the server
      const ua = navigator.userAgent;
      let deviceInfo = 'Dispositivo Móvel Android/Web';
      if (/Android/i.test(ua)) deviceInfo = 'Android Mobile';
      else if (/iPhone|iPad/i.test(ua)) deviceInfo = 'iOS Mobile';
      else if (/Windows/i.test(ua)) deviceInfo = 'Computador Windows';
      else if (/Macintosh/i.test(ua)) deviceInfo = 'Mac OS Desktop';

      await fetch('/api/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: trimmed,
          deviceInfo: `${deviceInfo} (${navigator.language || 'pt-BR'})`
        })
      });
    } catch (err) {
      console.warn('Installation register offline fallback', err);
    } finally {
      localStorage.setItem('floratta_client_name', trimmed);
      setIsSubmitting(false);
      onComplete(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-fuchsia-500/30 shadow-2xl text-center">
        {/* Logo and Icon */}
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-purple-600 p-0.5 shadow-[0_0_35px_rgba(217,70,239,0.5)]">
          <div className="w-full h-full rounded-2xl bg-black/80 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-fuchsia-400 animate-pulse" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-purple-300 mb-2">
          Floratta Cosmético
        </h1>
        <p className="text-sm text-purple-200/80 mb-6">
          Seja muito bem-vindo ao nosso aplicativo oficial de perfumes e cosméticos exclusivos!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-fuchsia-300 uppercase tracking-wider mb-2">
              Como podemos te chamar?
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Digite seu primeiro nome"
              className="w-full px-4 py-3.5 rounded-2xl bg-purple-950/40 border border-fuchsia-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-400 transition text-base"
            />
            {error && <p className="text-rose-400 text-xs mt-1.5 ml-1">{error}</p>}
          </div>

          <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-500/20 flex items-start space-x-2.5 text-xs text-purple-300/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Acesso rápido e gratuito: Não solicitamos CPF no primeiro acesso. Explore todo o nosso catálogo com total liberdade!
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl btn-floating font-semibold text-base flex items-center justify-center space-x-2 cursor-pointer transition disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Iniciando...' : 'Entrar no Aplicativo'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center space-x-2 text-xs text-purple-300/60">
          <Smartphone className="w-3.5 h-3.5" />
          <span>App pronto para Android & Navegador</span>
        </div>
      </div>
    </div>
  );
};
