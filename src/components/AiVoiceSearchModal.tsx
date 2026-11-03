import React, { useState } from 'react';
import { X, Mic, MicOff, Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import type { Product, StoreSettings } from '../types';
import { startSpeechRecognition, isSpeechRecognitionAvailable } from '../utils/speech';

interface AiVoiceSearchModalProps {
  products: Product[];
  settings: StoreSettings;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const AiVoiceSearchModal: React.FC<AiVoiceSearchModalProps> = ({
  products,
  settings,
  onClose,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const hasVoiceRecognition = isSpeechRecognitionAvailable();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, mode: 'customer_search' })
      });
      const data = await res.json();
      setAiAdvice(data.response || null);

      if (data.matchedProductIds && data.matchedProductIds.length > 0) {
        const found = products.filter(p => data.matchedProductIds.includes(p.id));
        setMatchedProducts(found.length > 0 ? found : products.slice(0, 3));
      } else {
        const words = searchQuery.toLowerCase().split(' ').filter(w => w.length >= 3);
        const fallback = products.filter(p =>
          words.some(w => `${p.name} ${p.description} ${p.notes || ''}`.toLowerCase().includes(w))
        );
        setMatchedProducts(fallback.length > 0 ? fallback : products.slice(0, 3));
      }
    } catch (err) {
      console.warn('AI search error:', err);
      const words = searchQuery.toLowerCase().split(' ').filter(w => w.length >= 3);
      const fallback = products.filter(p =>
        words.some(w => `${p.name} ${p.description}`.toLowerCase().includes(w))
      );
      setMatchedProducts(fallback.length > 0 ? fallback : products.slice(0, 3));
      setAiAdvice('Aqui estão as melhores opções encontradas no nosso catálogo para a sua busca:');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    startSpeechRecognition(
      (transcript) => {
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const samplePrompts = [
    'Perfume floral marcante para presente',
    'Batom vermelho de longa duração',
    'Fragrância doce e sedutora com baunilha',
    'Tratamento rejuvenescedor facial com ácido hialurônico'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 p-6 rounded-3xl glass-panel border border-fuchsia-500/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-fuchsia-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Consultora Inteligente Floratta</h3>
              <p className="text-xs text-purple-300/80">Busque escrevendo ou falando por voz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input & Voice bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative mb-4"
        >
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ex: "perfume floral para presente"...'
            className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-purple-950/50 border border-fuchsia-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-400 transition text-sm"
          />
          <Search className="w-5 h-5 text-purple-400 absolute left-3.5 top-4 pointer-events-none" />

          <div className="absolute right-2 top-2 flex items-center space-x-1.5">
            {hasVoiceRecognition && (
              <button
                type="button"
                onClick={toggleVoice}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.7)]'
                    : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200'
                }`}
                title={isListening ? 'Ouvindo... Clique para parar' : 'Falar o que procura'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-3.5 py-2 rounded-xl btn-floating text-xs font-bold transition disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </form>

        {/* Voice indicator banner if listening */}
        {isListening && (
          <div className="p-3 mb-4 rounded-xl bg-pink-950/70 border border-pink-500/40 text-center animate-pulse flex items-center justify-center space-x-2 text-xs text-pink-200">
            <Mic className="w-4 h-4 text-pink-400 animate-bounce" />
            <span>Ouvindo sua voz com carinho... Pode falar o que procura!</span>
          </div>
        )}

        {/* Suggestion Prompts */}
        {!aiAdvice && matchedProducts.length === 0 && !isLoading && (
          <div>
            <span className="text-[11px] font-semibold text-fuchsia-300 uppercase tracking-wider block mb-2">
              Ideias para você experimentar:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p);
                    handleSearch(p);
                  }}
                  className="p-2.5 rounded-xl text-left bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 text-xs text-purple-200/90 transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-1">{p}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 animate-spin">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-fuchsia-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-purple-200 animate-pulse">
              Nossa IA está analisando notas olfativas e catálogo Floratta...
            </p>
          </div>
        )}

        {/* AI Advice Speech Bubble */}
        {aiAdvice && !isLoading && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-pink-950/50 border border-fuchsia-500/30 mb-4 text-xs sm:text-sm text-purple-100 leading-relaxed shadow-lg">
            <div className="flex items-center space-x-1.5 text-fuchsia-300 font-bold mb-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Recomendação Personalizada Floratta:</span>
            </div>
            <p className="whitespace-pre-line">{aiAdvice}</p>
          </div>
        )}

        {/* Matched Products Results */}
        {matchedProducts.length > 0 && !isLoading && (
          <div>
            <span className="text-xs font-semibold text-fuchsia-300 uppercase tracking-wider block mb-2">
              Produtos encontrados ({matchedProducts.length}):
            </span>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {matchedProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className="p-3 rounded-2xl glass-card hover:border-fuchsia-400/50 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{prod.name}</h4>
                      <span className="text-[11px] text-purple-300/80 block line-clamp-1">{prod.notes || prod.description}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs sm:text-sm font-extrabold text-fuchsia-300 block">
                      R$ {prod.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-purple-300/80">Até 12x no Carnê</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
