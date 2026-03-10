import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ProductInfo } from '../services/gemini';
import { Activity, Droplets, Flame, Zap, Scale, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: ProductInfo;
  onAdd?: (product: ProductInfo, amount: number, category: string) => void;
  onAddToShoppingList?: (productName: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onAddToShoppingList }) => {
  const [amount, setAmount] = useState<number>(100);
  const [category, setCategory] = useState<string>('Comida');

  const calculateMacro = (base: number) => {
    return ((base / 100) * amount).toFixed(1);
  };

  const categories = ['Desayuno', 'Comida', 'Cena', 'Snacks'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto glass-card overflow-hidden bg-emerald-50/40"
    >
      <div className="p-6 border-b border-emerald-100">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-zinc-950 leading-tight tracking-tight">{product.name}</h2>
            <p className="text-emerald-900/60 font-bold text-[10px] uppercase tracking-widest mt-1">{product.brand}</p>
          </div>
          <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{product.unit}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Category Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-emerald-900/60 uppercase tracking-widest ml-1">Momento del día</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border",
                  category === cat 
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                    : "bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-zinc-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Scale className="w-3 h-3" />
              Cantidad
            </label>
            <button 
              onClick={() => setAmount(product.packageSize)}
              className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-colors"
            >
              Todo ({product.packageSize}{product.unit})
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="number" 
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-5 font-black text-3xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-center text-zinc-900"
              placeholder="0"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-xs font-black text-zinc-300 uppercase">{product.unit}</span>
            </div>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-2 gap-3">
          <NutrientItem 
            icon={<Flame className="w-4 h-4 text-orange-500" />}
            label="Calorías"
            value={calculateMacro(product.caloriesPer100)}
            unit="kcal"
          />
          <NutrientItem 
            icon={<Zap className="w-4 h-4 text-blue-500" />}
            label="Proteína"
            value={calculateMacro(product.proteinPer100)}
            unit="g"
          />
          <NutrientItem 
            icon={<Activity className="w-4 h-4 text-yellow-600" />}
            label="Carbos"
            value={calculateMacro(product.carbsPer100)}
            unit="g"
          />
          <NutrientItem 
            icon={<Droplets className="w-4 h-4 text-emerald-600" />}
            label="Grasas"
            value={calculateMacro(product.fatPer100)}
            unit="g"
          />
        </div>

        <div className="flex gap-3 pt-2">
          {onAdd && (
            <button 
              onClick={() => onAdd(product, amount, category)}
              className="flex-[3] primary-btn py-5 flex items-center justify-center gap-2 text-sm"
            >
              <Zap className="w-5 h-5" />
              Registrar {category}
            </button>
          )}
          {onAddToShoppingList && (
            <button 
              onClick={() => onAddToShoppingList(product.name)}
              className="flex-1 bg-zinc-100 text-zinc-400 rounded-2xl hover:bg-zinc-200 hover:text-zinc-900 transition-all flex items-center justify-center"
              title="Añadir a la lista"
            >
              <ShoppingCart className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface NutrientItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}

const NutrientItem: React.FC<NutrientItemProps> = ({ icon, label, value, unit }) => (
  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-bold text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{value}</span>
      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">{unit}</span>
    </div>
  </div>
);


