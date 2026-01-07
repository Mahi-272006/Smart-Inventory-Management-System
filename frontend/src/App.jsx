import { useEffect, useState, useMemo } from 'react';
import { Package, CheckCircle, LayoutDashboard, BarChart3, Globe, Zap, Plus, Search, ArrowRight, Info } from 'lucide-react';
import Analytics from './components/Analytics';
import AddProductModal from './components/AddProductModal';
import toast, { Toaster } from 'react-hot-toast';
import MarketIntelligence from './components/MarketIntelligence';
import CategorySummary from './components/CategorySummary';

function App() {
  // 1. STATE DEFINITIONS
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketImpact, setMarketImpact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 2. DATA REFRESH LOGIC
  const refreshData = () => {
    fetch('http://localhost:8000/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch(err => {
        console.error("Connection failed:", err);
        setProducts([]);
      });
  };

  // 3. INITIAL LOAD
  useEffect(() => {
    refreshData();
    fetch('http://localhost:8000/market-news')
      .then(res => res.json())
      .then(data => setMarketImpact(data));
  }, []);

  // 4. COMPUTED VALUES (FILTERING)
  const categories = useMemo(() => {
    if (!Array.isArray(products)) return ['All'];
    return ['All', ...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // 5. ACTION HANDLERS
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleSell = async (id, productName) => {
    const qtyString = window.prompt(`Bulk Sale: How many "${productName}" were sold?`, "1");
    const qty = parseInt(qtyString);
    if (isNaN(qty) || qty <= 0) return;

    const response = await fetch(`http://localhost:8000/sell-product/${id}?quantity=${qty}`, {
      method: 'POST'
    });

    if (response.ok) {
      refreshData();
      toast.success(`Sold ${qty} units. Velocity updated.`);
    } else {
      toast.error("Inventory sync failed.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    const response = await fetch(`http://localhost:8000/delete-product/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      refreshData();
      toast.success(`${name} removed from network.`);
    } else {
      toast.error("Failed to delete product.");
    }
  };

  // 6. RENDER
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30">
      <Toaster position="bottom-right" />

      {/* Sidebar */}
      <aside className="w-64 bg-[#020617] border-r border-slate-800/60 p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-10 text-blue-500 px-2">
          <Package size={24} />
          <span className="text-xl font-bold tracking-tight text-white uppercase italic">S-Stock.AI</span>
        </div>
        <nav className="space-y-1">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
            { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Intelligence' },
            { id: 'market', icon: <Globe size={18} />, label: 'Market Feed' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${view === item.id ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
            >
              {item.icon} <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            <header className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Systems Control</h1>
                <p className="text-slate-500 text-sm mt-1">Prescriptive AI analysis & stock gap detection.</p>
              </div>

              <div className="hidden lg:flex items-center p-3 px-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 group relative cursor-help transition-all hover:bg-blue-500/10">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                  AI Intelligence System ⓘ
                </span>

                {/* TOOLTIP CONTENT */}
                <div className="hidden group-hover:block absolute top-full right-0 mt-3 w-80 p-6 bg-[#020617] border border-slate-800 rounded-[2rem] shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-300">
                  <h5 className="text-blue-400 font-bold text-[10px] uppercase mb-4 tracking-[0.2em] border-b border-slate-800 pb-2">
                    Operational Glossary
                  </h5>

                  <div className="space-y-4">
                    <p className="text-[11px] leading-relaxed">
                      <strong className="text-blue-400 block mb-1 uppercase tracking-tighter">Current Runway:</strong>
                      <span className="text-slate-400">Estimated days until zero stock based on your real-time 7-day sales velocity.</span>
                    </p>

                    <p className="text-[11px] leading-relaxed">
                      <strong className="text-blue-400 block mb-1 uppercase tracking-tighter">Market Multiplier:</strong>
                      <span className="text-slate-400">AI-generated coefficient from Indian financial news sentiment analysis.</span>
                    </p>

                    <p className="text-[11px] leading-relaxed">
                      <strong className="text-blue-400 block mb-1 uppercase tracking-tighter">Purchase Order:</strong>
                      <span className="text-slate-400">The "Stock Gap"—exactly how many units to buy to satisfy 30 days of demand + lead time.</span>
                    </p>

                    <p className="text-[11px] leading-relaxed">
                      <strong className="text-blue-400 block mb-1 uppercase tracking-tighter">Priority Level:</strong>
                      <span className="text-slate-400">Risk-weighted urgency status calculated against supplier delivery windows.</span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddClick}
                className="bg-white hover:bg-slate-200 text-black px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 shadow-xl"
              >
                <Plus size={16} /> NEW ENTRY
              </button>
            </header>



            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-slate-900/20 border border-slate-800 rounded-2xl shadow-inner">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search node name..."
                  className="w-full bg-transparent border-none pl-10 pr-4 py-1 text-sm focus:ring-0 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>
              <div className="flex items-center gap-3 pr-2">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Category:</span>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="bg-transparent text-xs font-bold text-blue-400 outline-none cursor-pointer focus:text-white transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-[#020617]">{cat.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#0f172a]/40 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Segment Density</p>
                <h2 className="text-3xl font-bold text-white">{filteredProducts.length} <span className="text-sm font-normal text-slate-500 italic">Nodes</span></h2>
              </div>
              <div className="bg-[#0f172a]/40 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Stock Shortfalls</p>
                <h2 className="text-3xl font-bold text-red-500">
                  {filteredProducts.filter(p => (p.stock_gap || 0) > 0).length}
                </h2>
              </div>
              <div className="bg-[#0f172a]/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Network Status</p>
                  <h2 className="text-xl font-bold text-emerald-500 flex items-center gap-2 uppercase tracking-tighter">Operational <CheckCircle size={16} /></h2>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-800/50">Asset Info</th>
                    <th colSpan="2" className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-800/50">
                      Physical Reality <span className="text-[8px] font-medium opacity-50">(Manual Data)</span>
                    </th>
                    <th colSpan="3" className="p-3 text-[10px] font-black text-blue-400 uppercase tracking-widest text-center bg-blue-500/5">
                      AI Intelligence <span className="text-[8px] font-medium opacity-70">(Market News + Lead Time)</span>
                    </th>
                    <th className="p-6 text-right text-[10px] font-black text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-800">
                    <th className="px-6 py-5 text-left">Product Details</th>
                    <th className="px-6 py-5 text-left">Physical Stock</th>
                    <th className="px-6 py-5 text-left">Current Runway</th>
                    <th className="px-6 py-5 text-center">Market Multiplier</th>
                    <th className="px-6 py-5 text-center">Target Inventory</th>
                    <th className="px-6 py-5 text-center">Priority Level</th>
                    <th className="px-6 py-5 text-right">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-all group">
                      <td className="p-6">
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase">{item.category}</div>
                      </td>
                      <td className="p-6 font-mono text-sm">
                        <span className="text-white">{item.stock_level}</span>
                        <span className="ml-1 text-[10px] text-slate-600">UNITS</span>
                      </td>
                      <td className="p-6 border-r border-slate-800/50 text-xs font-medium text-slate-400">
                        {item.user_runway} <span className="text-[9px] opacity-50 italic">Days Left</span>
                      </td>
                      <td className="p-6 bg-blue-500/[0.02] text-center">
                        <span className="text-blue-400 font-black text-xs">{item.intelligence?.multiplier || 1.0}x</span>
                      </td>
                      <td className="p-6 bg-blue-500/[0.02]">
                        <div className="text-sm font-black text-white">{item.target_stock}</div>
                        {item.stock_gap > 0 && (
                          <div className="text-[9px] text-red-500 font-black mt-1 flex items-center gap-1"><ArrowRight size={10} /> BUY +{item.stock_gap}</div>
                        )}
                      </td>
                      <td className="p-6 bg-blue-500/[0.02] text-center">
                        <span className={`px-3 py-1 rounded text-[9px] font-black border ${item.ai_priority?.includes('CRITICAL') ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                          {item.ai_priority}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(item)} className="text-[10px] font-black text-blue-400 bg-blue-500/10 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-xl uppercase">Edit</button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="text-[10px] font-black text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl uppercase">Delete</button>
                          <button onClick={() => handleSell(item.id, item.name)} className="text-[10px] font-black text-white bg-slate-800 hover:bg-blue-600 px-3 py-2 rounded-xl uppercase shadow-lg">Sell</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'analytics' && <Analytics products={filteredProducts} activeCategory={activeCategory} />}
        {view === 'market' && <MarketIntelligence />}
      </main>

      {/* 7. MODAL MOUNTED OUTSIDE MAIN FLOW */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null); // This is important so the next "Add" is blank
        }}
        onRefresh={refreshData}
        product={selectedProduct} // This MUST be the state updated by handleEditClick
      />
    </div>
  );
}

export default App;