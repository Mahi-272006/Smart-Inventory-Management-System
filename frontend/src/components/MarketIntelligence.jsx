import React, { useEffect, useState } from 'react';
import { Globe, Zap, TrendingUp, TrendingDown, RefreshCw, Layers, ExternalLink, Newspaper } from 'lucide-react';

const MarketIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = () => {
    setLoading(true);
    fetch('http://localhost:8000/market-news')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(err => console.error("News Fetch Error:", err));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-500 text-sm font-medium animate-pulse">Scanning Indian Market Consensus...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Market Intelligence</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest text-[10px] font-bold">
            Consensus Engine: {data?.count || 0} Sources Analyzed
          </p>
        </div>
        <button 
          onClick={fetchNews}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-all text-slate-300 hover:text-white text-xs font-bold"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> RE-SCAN MARKET
        </button>
      </header>

      {/* Aggregate Consensus Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className={`p-5 rounded-2xl ${data.multiplier > 1 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {data.multiplier > 1 ? (
              <TrendingUp size={40} className="text-emerald-500" />
            ) : (
              <TrendingDown size={40} className="text-red-500" />
            )}
          </div>
          <div>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Current Consensus</div>
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{data.sentiment}</h3>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="h-12 w-[1px] bg-slate-800 hidden md:block"></div>
            <div className="text-right">
                <div className="text-4xl font-black text-blue-400 font-mono tracking-tighter">{data.multiplier}x</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">AI Demand Multiplier</div>
            </div>
        </div>
      </div>

      {/* Article Feed */}
      <div className="grid grid-cols-1 gap-4">
        <h4 className="text-slate-600 text-[10px] font-black uppercase tracking-widest pl-2">Live Source Feed</h4>
        {data.articles?.map((article, index) => (
          <div 
            key={index} 
            className="group bg-slate-900/20 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all hover:bg-slate-800/40"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-0.5 bg-blue-500/10 rounded text-[9px] font-bold text-blue-500 uppercase">
                    {article.source.name}
                  </div>
                  <span className="text-slate-700 text-[10px] font-mono">
                    {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h5 className="text-md font-bold text-slate-200 group-hover:text-white transition-colors leading-snug">
                  {article.title}
                </h5>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed italic">
                  {article.description || "No summary available for this market signal."}
                </p>
              </div>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noreferrer" 
                className="p-3 bg-slate-800/50 rounded-xl text-slate-500 hover:text-white hover:bg-blue-600/20 transition-all border border-slate-700/50"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketIntelligence;