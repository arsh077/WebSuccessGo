'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ExternalLink, Calendar, Layers, Eye, Laptop, ShieldAlert, Check } from 'lucide-react';
import { Portfolio as PortfolioItem } from '@/lib/firebase/types';

interface PortfolioProps {
  portfolio: PortfolioItem[];
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (item: PortfolioItem) => void;
}

export default function Portfolio({ portfolio, isAdmin, onDelete, onEdit }: PortfolioProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const [demoItem, setDemoItem] = useState<PortfolioItem | null>(null);

  const categories = ['All', 'Restaurant', 'Clinic', 'Law Firm', 'E-commerce', 'Startup'];

  const filteredItems = portfolio.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technology.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 text-white">
      {/* Portfolio Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-purple-400">OUR CREATIVE REALM</span>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">The Bento Portfolio Grid</h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Explore high-speed reactive portals successfully deployed for our global premium partners.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#151820] p-4 rounded-xl border border-white/10">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-black/30 hover:bg-black/50 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deployed products..."
            className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-white/30 text-zinc-200 placeholder-zinc-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Bento Portfolio Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          No premium projects found matching your layout parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {filteredItems.map((item, index) => {
            // Alternating Bento Column Spans for Large vs Small layout style
            // index 0, 3, 4 etc can be large cards (col-span 3 or 4) and others small (col-span 2)
            const isLarge = index % 3 === 0;
            const gridClass = isLarge 
              ? 'md:col-span-4 min-h-[380px]' 
              : 'md:col-span-2 min-h-[380px]';

            return (
              <motion.div
                key={item.id}
                layout
                className={`bg-[#151820] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group ${gridClass}`}
              >
                {/* Image Section with Zoom */}
                <div className="relative h-48 md:h-56 bg-black/40 overflow-hidden">
                  <img
                    src={item.image || 'https://picsum.photos/800/600'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle top-left badge */}
                  <span className="absolute top-4 left-4 bg-black/80 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-sm">
                    {item.category}
                  </span>

                  {/* Staging speed indicator bottom-right */}
                  <span className="absolute bottom-4 right-4 bg-blue-600/90 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm flex items-center gap-1 shadow">
                    <Calendar className="w-3 h-3 text-cyan-300" />
                    <span>{item.deliveryTime} DELIVERY</span>
                  </span>

                  {/* Dark overlay showing on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => {
                        setDemoUrl(item.demoURL);
                        setDemoItem(item);
                      }}
                      className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Project Live</span>
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-left">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Tech stack & administrative control */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                        {item.technology}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setDemoUrl(item.demoURL);
                          setDemoItem(item);
                        }}
                        className="px-4 py-2 bg-black/40 hover:bg-black/70 border border-white/10 text-zinc-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Inspect Build</span>
                      </button>

                      {isAdmin && (
                        <div className="flex gap-1">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item.id)}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Demo Web Simulator Modal */}
      {demoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151820] border border-white/15 rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col h-[80vh]">
            <div className="bg-[#0b0c10] border-b border-white/10 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold font-mono tracking-wider">PREVIEW CONTAINER SUITE</span>
              </div>
              <button
                onClick={() => {
                  setDemoUrl(null);
                  setDemoItem(null);
                }}
                className="text-zinc-400 hover:text-white font-bold text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                Close View
              </button>
            </div>
            
            {/* Embedded Mock Safari bar */}
            <div className="bg-black/30 px-4 py-2 border-b border-white/5 flex items-center gap-2 text-[11px] text-zinc-500">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              </div>
              <div className="bg-black/60 px-4 py-1 rounded-md border border-white/5 flex-1 ml-4 font-mono truncate text-zinc-400 flex items-center justify-between">
                <span>{demoUrl}</span>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">● SSL SECURE</span>
              </div>
            </div>

            {/* Core Simulator Presentation Workspace */}
            <div className="flex-1 bg-black/45 relative overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
              <div className="space-y-6 max-w-lg">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mx-auto shadow-inner">
                  <Laptop className="w-8 h-8 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold text-white">
                    {demoItem ? demoItem.title : 'Active Demo Portal'}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Digital Space Studio deploys serverless server-rendered static web platforms. This live inspect panel evaluates client responsiveness and interaction funnels prior to live DNS mapping.
                  </p>
                </div>

                {/* Grid details block */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left space-y-3 text-xs text-zinc-300">
                  <span className="font-extrabold text-white block uppercase tracking-wider text-[10px] text-blue-400">Technical Specifications:</span>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Serverless Staging</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>WhatsApp Widgets</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Tailwind 4 Ready</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Gemini Schema Mapping</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <a
                    href="https://wa.me/919999999999"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Discuss Live on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setDemoUrl(null);
                      setDemoItem(null);
                    }}
                    className="px-5 py-2.5 bg-[#151820] hover:bg-[#1c212c] border border-white/10 text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Return to Portfolio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
