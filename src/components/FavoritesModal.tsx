import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import type { Product } from '../types';

interface FavoritesModalProps {
  favoriteIds: string[];
  products: Product[];
  onClose: () => void;
  onRemoveFavorite: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  favoriteIds,
  products,
  onClose,
  onRemoveFavorite,
  onAddToCart,
  onSelectProduct
}) => {
  const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 rounded-3xl glass-panel border border-fuchsia-500/35 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/30">
              <Heart className="w-5 h-5 fill-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Meus Produtos Favoritos</h3>
              <span className="text-xs text-purple-300/80">{favoriteProducts.length} produto(s) salvos</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Favorites List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {favoriteProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Heart className="w-8 h-8 opacity-40 text-rose-400" />
              </div>
              <h4 className="text-base font-bold text-white">Nenhum favorito ainda</h4>
              <p className="text-xs text-purple-300/80 max-w-xs mx-auto">
                Toque no botão de coração nos produtos que você mais gostar para salvar aqui na sua conta!
              </p>
            </div>
          ) : (
            favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between gap-3 hover:border-purple-400/40 transition"
              >
                <div
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-purple-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider block">
                      {product.brand}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{product.name}</h4>
                    <span className="text-xs font-extrabold text-fuchsia-300 block">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                    }}
                    className="px-3 py-2 rounded-xl btn-floating text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    title="Adicionar à Sacola"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Comprar</span>
                  </button>

                  <button
                    onClick={() => onRemoveFavorite(product.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                    title="Remover dos Favoritos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
