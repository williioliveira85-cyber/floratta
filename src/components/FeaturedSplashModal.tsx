import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, X, ShoppingBag, ArrowRight, Play, Pause } from 'lucide-react';
import type { Product, StoreSettings } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface FeaturedSplashModalProps {
  product: Product;
  settings: StoreSettings;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const FeaturedSplashModal: React.FC<FeaturedSplashModalProps> = ({
  product,
  settings,
  onClose,
  onSelectProduct,
  onAddToCart
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('floratta_audio_muted') === 'true';
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isMuted) {
      const speechText = settings.welcomeAudioText ||
        `Olá! Seja muito bem-vindo à Floratta Cosmético. Conheça nossa fragrância em destaque: ${product.name}. Sofisticação e as melhores condições no carnê para você!`;

      // Slight delay to allow browser interaction
      const timer = setTimeout(() => {
        setIsPlayingAudio(true);
        speechRef.current = speakText(speechText, () => {
          setIsPlayingAudio(false);
        });
      }, 700);

      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [product, settings, isMuted]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('floratta_audio_muted', String(newMuted));

    if (newMuted) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const speechText = settings.welcomeAudioText ||
        `Olá! Conheça nossa fragrância em destaque: ${product.name}!`;
      speechRef.current = speakText(speechText, () => setIsPlayingAudio(false));
    }
  };

  const handleClose = () => {
    stopSpeaking();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-fuchsia-500/35 overflow-hidden shadow-2xl">
        {/* Top bar with audio toggle and close */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-full flex items-center space-x-2 text-xs font-semibold backdrop-blur-md border transition cursor-pointer ${
              isMuted
                ? 'bg-black/60 border-purple-500/30 text-purple-300 hover:bg-black/80'
                : 'bg-fuchsia-600/70 border-fuchsia-400 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]'
            }`}
            title={isMuted ? 'Ativar locução por voz' : 'Silenciar locução'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
            <span>{isMuted ? 'Áudio Desligado' : (isPlayingAudio ? 'Tocando Locução...' : 'Voz Ativada')}</span>
          </button>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-purple-500/30 text-purple-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Fechar vitrine"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Featured Product Image Hero */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-b from-purple-900/40 to-black">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12091c] via-[#12091c]/40 to-transparent" />

          {/* Badge Vitrine da Semana */}
          <div className="absolute bottom-4 left-4 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/80 to-purple-600/80 backdrop-blur-md border border-fuchsia-400/40 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>Destaque Exclusivo Floratta</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 pt-2">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-semibold text-fuchsia-400 uppercase tracking-widest">{product.brand}</span>
            {product.volume && <span className="text-xs text-purple-300/70">{product.volume}</span>}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2">
            {product.name}
          </h2>

          <p className="text-xs sm:text-sm text-purple-200/80 line-clamp-3 mb-4">
            {product.description}
          </p>

          {/* Pricing & Installment banner */}
          <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-fuchsia-500/25 mb-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-300 block">À vista ou no Carnê</span>
              <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-fuchsia-300 font-semibold px-2 py-0.5 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/30">
                Até 12x no Carnê
              </span>
              <span className="text-xs text-purple-300/80 block mt-1">
                ou a partir de <strong>R$ {(product.price / 4).toFixed(2).replace('.', ',')}</strong>/mês
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                handleClose();
                onSelectProduct(product);
              }}
              className="py-3 px-4 rounded-2xl glass-card hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 hover:text-white font-medium text-sm flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <span>Ver Detalhes</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onAddToCart(product);
                handleClose();
              }}
              className="py-3 px-4 rounded-2xl btn-floating font-semibold text-sm flex items-center justify-center space-x-2 cursor-pointer transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Eu Quero</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
