import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { Info, Globe, TrendingUp, Zap, BarChart3, AlertCircle } from 'lucide-react';

const Analytics = ({ products, marketImpact }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure the DOM is painted and ready for measurement
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Early return guard
  if (!isMounted || !products || products.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="italic font-medium">Calibrating Analytics engine...</p>
      </div>
    );
  }

  const uniqueCategories = [...new Set(products.map(p => p.category))];
  
  const radarData = uniqueCategories.map(cat => ({
    subject: cat,
    A: (marketImpact?.[cat] || 1.0) * 100 
  }));

  const bubbleData = products.map(p => ({
    name: p.name,
    stock: p.stock_level,
    heat: p.intelligence?.multiplier || 1.0,
    gap: p.stock_gap || 1,
  }));

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      
      {/* SECTION 1: THE GAP ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0f172a]/30 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
          <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold uppercase tracking-tighter">
            <TrendingUp size={18} /> Demand vs. Stock Gap
          </div>
          
          {/* FIX: Using a numeric height instead of 100% for the ResponsiveContainer */}
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={products} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }} />
                <Bar name="Physical Stock" dataKey="stock_level" fill="#334155" barSize={25} radius={[4, 4, 0, 0]} />
                <Line name="AI Target" type="monotone" dataKey="target_stock" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-[2rem] flex flex-col justify-center">
          <h4 className="text-blue-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
            <Info size={16} /> Insight Node
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Blue Line (AI Target) indicates the recommended inventory level based on your current sales speed.
          </p>
        </div>
      </div>

      {/* SECTION 2: THE CATEGORY WEB (RADAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] flex flex-col justify-center order-2 lg:order-1">
          <h4 className="text-emerald-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
            <Globe size={16} /> Market Pressure
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Live multipliers derived from market news sentiment.
          </p>
        </div>

        <div className="lg:col-span-2 bg-[#0f172a]/30 border border-slate-800 p-8 rounded-[2rem] shadow-2xl order-1 lg:order-2">
          <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold uppercase tracking-tighter">
            <BarChart3 size={18} /> Category Heat Index
          </div>
          {/* FIX: Numeric height */}
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                <Radar name="Heat" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: THE RISK MATRIX (BUBBLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0f172a]/30 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
          <div className="flex items-center gap-2 mb-6 text-red-400 font-bold uppercase tracking-tighter">
            <AlertCircle size={18} /> Risk Matrix
          </div>
          {/* FIX: Numeric height */}
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="stock" name="Stock" unit=" units" stroke="#475569" fontSize={10} />
                <YAxis type="number" dataKey="heat" name="Market Heat" unit="x" stroke="#475569" fontSize={10} />
                <ZAxis type="number" dataKey="gap" range={[50, 450]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }} />
                <Scatter name="Products" data={bubbleData}>
                  {bubbleData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.heat > 1.3 && entry.stock < 10 ? '#ef4444' : '#3b82f6'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2rem] flex flex-col justify-center">
          <h4 className="text-red-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
            <Zap size={16} /> Danger Zone
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Red bubbles (Top-Left) signify items with low stock but high AI velocity projections.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;