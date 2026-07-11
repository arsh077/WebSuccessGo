'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Check, ShoppingBag, Laptop, Tablet, Smartphone, Sparkles } from 'lucide-react';
import { Template } from '@/lib/firebase/types';

interface MarketplaceProps {
  templates: Template[];
  onSelectTemplate: (tpl: Template) => void;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (item: Template) => void;
}

export default function Marketplace({
  templates,
  onSelectTemplate,
  isAdmin,
  onDelete,
  onEdit,
}: MarketplaceProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewTpl, setPreviewTpl] = useState<Template | null>(null);
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const categories = [
    'All',
    'Restaurant Website Templates',
    'Clinic Website Templates',
    'Law Firm Website Templates',
    'Salon Website Templates',
    'E-commerce Website Templates',
    'Startup Website Templates',
    'Bike Website Templates',
  ];

  const filteredTemplates = templates.filter((tpl) => {
    return activeCategory === 'All' || tpl.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="space-y-10 text-white">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-cyan-400">PRODUCT CATALOG</span>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">The SaaS Marketplace</h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Choose a baseline visual layout. Our team will inject your custom copy, colors, menus, schemas, and launch it on your domain.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 justify-center bg-[#151820] p-2 rounded-xl border border-white/10 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-black/40 text-zinc-400 hover:text-white'
            }`}
          >
            {cat.replace(' Website Templates', '')}
          </button>
        ))}
      </div>

      {/* Templates Grid - Netflix + Shopify style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredTemplates.map((tpl) => (
          <motion.div
            key={tpl.id}
            layout
            className="bg-[#151820] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between group relative"
            whileHover={{ y: -8, scale: 1.015 }}
          >
            {/* Ambient Background Glow on Hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

            {/* Template Card Visual Header */}
            <div className="relative h-48 bg-black/40 overflow-hidden">
              <img
                src={tpl.image || 'https://picsum.photos/800/600'}
                alt={tpl.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3.5 left-3.5 bg-black/80 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                {tpl.category.replace(' Website Templates', '')}
              </span>
              <span className="absolute bottom-3.5 right-3.5 bg-blue-600 text-white text-[10px] font-black font-mono px-3 py-1 rounded-md border border-white/15 shadow-lg backdrop-blur-sm">
                Starting ₹{tpl.price}
              </span>
            </div>

            {/* Description Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5 relative z-10 text-left">
              <div className="space-y-3">
                <h3 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors">
                  {tpl.name}
                </h3>
                
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
                    MODULE DELIVERABLES:
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {tpl.features.slice(0, 3).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                    {tpl.features.length > 3 && (
                      <li className="text-[10px] text-blue-400 font-mono pl-6">
                        + {tpl.features.length - 3} dynamic schemas included
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* User interaction CTA */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewTpl(tpl)}
                  className="px-3.5 py-2.5 bg-black/40 hover:bg-black/70 border border-white/10 text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => onSelectTemplate(tpl)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-cyan-300" />
                  <span>Select Template</span>
                </button>
              </div>

              {/* Administrative hooks */}
              {isAdmin && (
                <div className="flex gap-1.5 pt-3 border-t border-dashed border-white/5">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(tpl)}
                      className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(tpl.id)}
                      className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Template Preview Simulator Modal */}
      {previewTpl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151820] border border-white/15 rounded-2xl overflow-hidden shadow-2xl max-w-5xl w-full flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#0b0c10] border-b border-white/10 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold font-mono tracking-wider text-zinc-300">INTERACTIVE DEMO HARNESS</span>
              </div>
              
              {/* Device switcher bar */}
              <div className="hidden sm:flex items-center gap-1.5 bg-black/40 border border-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setDeviceFrame('desktop')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${deviceFrame === 'desktop' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceFrame('tablet')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${deviceFrame === 'tablet' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceFrame('mobile')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${deviceFrame === 'mobile' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {previewTpl.demoURL && (
                  <a
                    href={previewTpl.demoURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-bold text-xs px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Launch Live Demo ↗
                  </a>
                )}
                <button
                  onClick={() => setPreviewTpl(null)}
                  className="text-zinc-400 hover:text-white font-bold text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Exit Preview
                </button>
              </div>
            </div>

            {/* Core Workspace Body */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-black/40">
              {/* Center Screen Viewer (Device Frame simulator) */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto flex items-center justify-center">
                <div
                  className={`bg-[#0b0c10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative transition-all duration-300 ${
                    deviceFrame === 'desktop' ? 'w-full max-w-3xl aspect-[16/10]' :
                    deviceFrame === 'tablet' ? 'w-[480px] aspect-[3/4]' : 'w-[280px] aspect-[9/16]'
                  }`}
                >
                  {/* Safari Header */}
                  <div className="bg-black/50 px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5 text-[9px] text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <div className="bg-black/40 px-3 py-0.5 rounded border border-white/5 flex-1 text-center font-mono text-[8px] truncate">
                      demo.websuccessgo.com/{previewTpl.id}
                    </div>
                  </div>

                  <div className="w-full h-full relative overflow-y-auto bg-black/40">
                    <img
                      src={previewTpl.image}
                      alt={previewTpl.name}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar Specifications */}
              <div className="w-full md:w-80 bg-[#151820] border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between self-stretch text-left">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-1">
                      {previewTpl.category}
                    </span>
                    <h3 className="text-xl font-extrabold text-white leading-tight">{previewTpl.name}</h3>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
                      ALL MODULE SPECS:
                    </span>
                    <ul className="space-y-2.5">
                      {previewTpl.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-5 mt-5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Starting Package</span>
                    <span className="text-xl font-extrabold text-white font-mono">₹{previewTpl.price}</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTemplate(previewTpl);
                      setPreviewTpl(null);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-cyan-300" />
                    <span>Select This Template</span>
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
