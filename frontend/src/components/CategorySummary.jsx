import React from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, ShoppingCart } from 'lucide-react';

const CategorySummary = ({ marketData }) => {
  if (!marketData) return null;

  // We extract the multipliers we created in the backend
  const categories = [
    { name: 'Electronics', val: marketData.Electronics || 1.0, icon: <Zap size={16}/> },
    { name: 'Furniture', val: marketData.Furniture || 1.0, icon: <ShoppingCart size={16}/> },
    { name: 'General', val: marketData.General || 1.0, icon: <Minus size={16}/> }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {categories.map((cat) => (
        <div key={cat.name} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
              {cat.icon}
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
              cat.val > 1.2 ? 'bg-emerald-500/10 text-emerald-500' : 
              cat.val < 0.9 ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'
            }`}>
              {cat.val > 1.2 ? '🔥 HOT' : cat.val < 0.9 ? '⚠️ SLOW' : 'STABLE'}
            </span>
          </div>
          
          <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{cat.name} Demand</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{cat.val}x</span>
            <span className="text-[10px] text-slate-600 font-medium">Velocity Multiplier</span>
          </div>

          {/* Progress bar visual for the multiplier */}
          <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${cat.val > 1 ? 'bg-blue-500' : 'bg-slate-600'}`}
              style={{ width: `${Math.min(cat.val * 40, 100)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategorySummary;