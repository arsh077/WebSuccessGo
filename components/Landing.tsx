'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Heart,
  Star,
  Send,
  Laptop,
  CheckCircle2,
  Clock,
  Briefcase,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  UserCheck
} from 'lucide-react';

import hero3d from '../src/assets/images/websuccessgo_hero_3d_1783674425988.jpg';
import factory3d from '../src/assets/images/websuccessgo_factory_3d_1783674443710.jpg';

interface LandingProps {
  onBuildCTA: () => void;
  onBrowseTemplates: () => void;
}

export default function Landing({ onBuildCTA, onBrowseTemplates }: LandingProps) {
  const [plannerInput, setPlannerInput] = useState('');
  const [plannerResult, setPlannerResult] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [heroView, setHeroView] = useState<'visual' | 'simulator'>('visual');

  // Animated Numbers State
  const [websitesCount, setWebsitesCount] = useState(0);
  const [satisfactionCount, setSatisfactionCount] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState(15);
  const [supportRatio, setSupportRatio] = useState(0);

  // Interactive Website Builder Journey State
  const [selectedBuilderCat, setSelectedBuilderCat] = useState<'Restaurant' | 'Clinic' | 'Law' | 'Startup'>('Restaurant');
  const [buildStep, setBuildStep] = useState<'idle' | 'building' | 'deployed'>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);

  // Trusted Logos list
  const clientCategories = [
    { name: "La Pino'z Pizzeria", desc: "Italian Gourmet" },
    { name: "Dr. Seth's Ortho Care", desc: "Premium Clinic" },
    { name: "Apex Legal Partners", desc: "Law Chamber" },
    { name: "Aura MediSpa & Salon", desc: "Aesthetic Salon" },
    { name: "Vortex Labs AI", desc: "SaaS Tech Startup" },
    { name: "Grand Imperial Banquets", desc: "Premium Hospitality" },
  ];

  // Number Counter Animation
  useEffect(() => {
    // 250+ Websites
    const intervalWebsites = setInterval(() => {
      setWebsitesCount((prev) => {
        if (prev >= 250) {
          clearInterval(intervalWebsites);
          return 250;
        }
        return prev + 5;
      });
    }, 15);

    // 98% Satisfaction
    const intervalSatisfaction = setInterval(() => {
      setSatisfactionCount((prev) => {
        if (prev >= 98) {
          clearInterval(intervalSatisfaction);
          return 98;
        }
        return prev + 2;
      });
    }, 20);

    // 7 Days Average Delivery
    const intervalDelivery = setInterval(() => {
      setDeliveryDays((prev) => {
        if (prev <= 7) {
          clearInterval(intervalDelivery);
          return 7;
        }
        return prev - 1;
      });
    }, 100);

    // 24/7 Support (represented by 24)
    const intervalSupport = setInterval(() => {
      setSupportRatio((prev) => {
        if (prev >= 24) {
          clearInterval(intervalSupport);
          return 24;
        }
        return prev + 1;
      });
    }, 30);

    return () => {
      clearInterval(intervalWebsites);
      clearInterval(intervalSatisfaction);
      clearInterval(intervalDelivery);
      clearInterval(intervalSupport);
    };
  }, []);

  // Website Builder Journey - Compilation Logs
  const startBuilderCompilation = () => {
    setBuildStep('building');
    setBuildProgress(0);
    setBuildLogs([]);

    const logs = [
      "🔗 Connecting to Digital Space Studio compilers...",
      "⚡ Provisioning high-availability Vercel container edge node...",
      "🎨 Binding custom Tailwind CSS styles and fluid spacing sheets...",
      "📱 Compiling fully fluid responsive viewport layouts...",
      "✨ Injecting high-conversion Call-To-Action controllers...",
      "🔍 Structuring local Search Engine Optimization meta schemas...",
      "🚀 final push to production edge routers..."
    ];

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setBuildLogs((prev) => [...prev, logs[currentLogIndex]]);
        setBuildProgress((prev) => prev + 14);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        setBuildProgress(100);
        setTimeout(() => {
          setBuildStep('deployed');
        }, 500);
      }
    }, 450);
  };

  const resetBuilder = () => {
    setBuildStep('idle');
    setBuildProgress(0);
    setBuildLogs([]);
  };

  const handleAIPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerInput.trim()) return;
    setLoadingAI(true);
    setPlannerResult(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: plannerInput }),
      });
      const data = await res.json();
      setPlannerResult(data);
    } catch (err) {
      console.error('AI Planner failed:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-20 text-white">
      {/* 1. Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8 md:py-16">
        <div className="lg:col-span-7 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Digital Space Studio • Next-Gen Website Selling Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-[64px] font-extrabold tracking-tight leading-[1.05] text-white"
          >
            Build Your Website <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400">
              Without Waiting
            </span> Months
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed"
          >
            Choose premium high-conversion templates, customize dynamic components, pay with secure 50% advance, and watch your platform launch in 7 days. 
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
          >
            <button
              onClick={onBuildCTA}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Start Project</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onBrowseTemplates}
              className="px-8 py-4 bg-[#151820] hover:bg-[#1a1e28] text-zinc-200 rounded-xl font-bold border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Choose Template</span>
            </button>
          </motion.div>
        </div>

        {/* Hero Interactive 3D Mockup Stage / Builder Machine */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
          
          {/* Floating Cards around Mockup */}
          <div className="absolute -top-4 -left-4 z-20 bg-[#151820]/90 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl shadow-black/40">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Finished Orders</span>
              <span className="text-xs font-bold text-white font-mono">+250 Websites Completed</span>
            </div>
          </div>

          <div className="absolute top-1/2 -right-8 z-20 bg-[#151820]/90 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl shadow-black/40">
            <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Starting Cost</span>
              <span className="text-xs font-bold text-white font-mono">₹4,999 Flat Rate</span>
            </div>
          </div>

          <div className="absolute -bottom-4 left-6 z-20 bg-[#151820]/90 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl shadow-black/40">
            <Clock className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Fast Turnaround</span>
              <span className="text-xs font-bold text-white font-mono">7 Days Delivery</span>
            </div>
          </div>

          <div className="absolute bottom-1/3 -left-8 z-20 bg-[#151820]/90 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl shadow-black/40">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Deposit Model</span>
              <span className="text-xs font-bold text-white font-mono">50% Safe Advance</span>
            </div>
          </div>

          {/* Core Interactive Digital Machine Box */}
          <div className="bg-[#151820] border border-white/10 rounded-2xl p-5 shadow-2xl relative z-10 overflow-hidden min-h-[380px] flex flex-col justify-between">
            {/* Header console tab */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[10px] text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              </div>
              <span className="text-blue-400">WSG_ENGINE_V2_ONLINE</span>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 my-3">
              <button
                onClick={() => setHeroView('visual')}
                className={`flex-grow py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  heroView === 'visual'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D EcoSystem Model</span>
              </button>
              <button
                onClick={() => setHeroView('simulator')}
                className={`flex-grow py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  heroView === 'simulator'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Live Simulator</span>
              </button>
            </div>

            {/* Simulated Live Viewport based on State */}
            <div className="my-2 flex-1 flex flex-col justify-center">
              {heroView === 'visual' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 text-left"
                >
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/40 bg-zinc-950">
                    <Image
                      src={hero3d}
                      alt="WebSuccessGo Premium 3D Ecosystem Render"
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[8px] font-mono text-zinc-300">
                      <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        OCTANE 3D ENGINE
                      </span>
                      <span className="bg-blue-600/80 px-2 py-0.5 rounded border border-white/10">
                        8K RENDER
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>WebSuccessGo Floating Ecosystem</span>
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Sleek high-end 3D product showcase displaying templates, secure client checkout flows, and automated WhatsApp responses.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col justify-center">
                  {buildStep === 'idle' && (
                    <div className="text-center py-4 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
                        <Laptop className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">Interactive Builder Journey</h3>
                        <p className="text-[10px] text-zinc-400 max-w-[280px] mx-auto mt-0.5 leading-relaxed">
                          Select a business style below and compile a mock interactive website in real-time.
                        </p>
                      </div>

                      {/* Selector Switches */}
                      <div className="grid grid-cols-2 gap-1.5 max-w-[280px] mx-auto">
                        {(['Restaurant', 'Clinic', 'Law', 'Startup'] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedBuilderCat(cat)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              selectedBuilderCat === cat
                                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {cat === 'Restaurant' && '🍔 Restaurant'}
                            {cat === 'Clinic' && '🩺 Clinic'}
                            {cat === 'Law' && '⚖️ Law Firm'}
                            {cat === 'Startup' && '🚀 Startup'}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={startBuilderCompilation}
                        className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-[10px] font-bold hover:scale-[1.02] transition-transform shadow shadow-blue-500/20 cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>Compile {selectedBuilderCat} Website</span>
                      </button>
                    </div>
                  )}

                  {buildStep === 'building' && (
                    <div className="space-y-3 py-2 text-left">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                          <span>Assembling Layout Assets...</span>
                        </span>
                        <span className="font-bold text-blue-400">{buildProgress}%</span>
                      </div>

                      {/* Progress bar container */}
                      <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"
                          initial={{ width: '0%' }}
                          animate={{ width: `${buildProgress}%` }}
                          transition={{ ease: 'easeInOut' }}
                        ></motion.div>
                      </div>

                      {/* Console scrollbox */}
                      <div className="bg-black/65 border border-white/5 rounded-xl p-3 h-28 overflow-y-auto font-mono text-[9px] text-zinc-500 space-y-1 select-none scrollbar-thin">
                        <AnimatePresence>
                          {buildLogs.map((log, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`${i === buildLogs.length - 1 ? 'text-blue-400 font-bold' : ''}`}
                            >
                              {log}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {buildStep === 'deployed' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3 text-left"
                    >
                      {/* Category Mock Preview Screen */}
                      <div className="bg-[#0b0c10] border border-white/10 rounded-xl p-3 space-y-3 relative shadow-inner overflow-hidden">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-wider rounded-bl-lg">
                          Live Preview Demo
                        </div>

                        {selectedBuilderCat === 'Restaurant' && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-serif font-bold text-amber-400 font-mono">★★★★★ Gourmet Bistro</div>
                            <h4 className="text-xs font-bold text-white tracking-tight leading-snug">Woodfired Italian Pizzas Delivered Hot in Delhi</h4>
                            <div className="flex gap-1 items-center">
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-zinc-300">🍕 Food Menu</span>
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-zinc-300">🛵 Fast Checkout</span>
                            </div>
                            <div className="pt-1.5 flex justify-between items-center border-t border-white/5 text-[9px]">
                              <span className="text-zinc-400">Template: Restaurant Pro</span>
                              <span className="text-emerald-400 font-bold">50% Advance Activated</span>
                            </div>
                          </div>
                        )}

                        {selectedBuilderCat === 'Clinic' && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-sans font-bold text-sky-400 font-mono">🩺 Apex Dental & Ortho</div>
                            <h4 className="text-xs font-bold text-white tracking-tight leading-snug">Painless Root Canal Treatments & Invisalign Specialists</h4>
                            <div className="flex gap-1 items-center">
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-zinc-300">📅 Live Bookings</span>
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-zinc-300">🏥 Smart Map</span>
                            </div>
                            <div className="pt-1.5 flex justify-between items-center border-t border-white/5 text-[9px]">
                              <span className="text-zinc-400">Template: Clinic Pro</span>
                              <span className="text-emerald-400 font-bold">7 Days Live Setup</span>
                            </div>
                          </div>
                        )}

                        {selectedBuilderCat === 'Law' && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-serif font-bold text-amber-500 font-mono">⚖️ Singhania Associates</div>
                            <h4 className="text-xs font-bold text-white tracking-tight leading-snug">Corporate Law Consultations & Intellectual Property Protection</h4>
                            <div className="flex gap-1 items-center">
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-zinc-300">💼 Case Studies</span>
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-zinc-300">✍️ Legal Request Form</span>
                            </div>
                            <div className="pt-1.5 flex justify-between items-center border-t border-white/5 text-[9px]">
                              <span className="text-zinc-400">Template: Law Firm Executive</span>
                              <span className="text-emerald-400 font-bold">WhatsApp Action Live</span>
                            </div>
                          </div>
                        )}

                        {selectedBuilderCat === 'Startup' && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-mono font-bold text-purple-400">🚀 Vortex Labs AI</div>
                            <h4 className="text-xs font-bold text-white tracking-tight leading-snug">Generate Automated Business Portals in Under 5 Minutes</h4>
                            <div className="flex gap-1 items-center">
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-zinc-300">📊 Live Database</span>
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-zinc-300">🔐 JWT Session API</span>
                            </div>
                            <div className="pt-1.5 flex justify-between items-center border-t border-white/5 text-[9px]">
                              <span className="text-zinc-400">Template: SaaS Platform Elite</span>
                              <span className="text-emerald-400 font-bold">Production Compiled</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={onBuildCTA}
                          className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>Order This Style</span>
                        </button>
                        <button
                          onClick={resetBuilder}
                          className="p-1.5 bg-black/40 border border-white/10 hover:border-white/20 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                          title="Reset Simulator"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Console Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-zinc-400 font-mono">
              <span>PLATFORM: NEXT.JS 15</span>
              <span>HOSTED ON CLOUD EDGE</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trusted By Scrolling Banner */}
      <section className="space-y-4">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">
            TRUSTED BY BUSINESSES ACROSS INDIA
          </span>
        </div>
        <div className="relative w-full overflow-hidden py-4 bg-[#0F1117] border-y border-white/5">
          <div className="flex gap-12 items-center justify-center flex-wrap md:flex-nowrap">
            {clientCategories.map((client, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#151820] border border-white/5 rounded-full px-4 py-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-bold text-zinc-200">{client.name}</span>
                <span className="text-[9px] text-zinc-500 uppercase font-mono font-bold">({client.desc})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Live Counters Row */}
      <section className="bg-[#151820] border border-white/10 rounded-2xl p-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/5">
          <div className="space-y-1">
            <span className="block text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-mono">
              {websitesCount}+
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Websites Built</span>
          </div>
          <div className="space-y-1 pt-4 md:pt-0">
            <span className="block text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">
              {satisfactionCount}%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Client Satisfaction</span>
          </div>
          <div className="space-y-1 pt-4 md:pt-0">
            <span className="block text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
              {deliveryDays} Days
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Average Delivery</span>
          </div>
          <div className="space-y-1 pt-4 md:pt-0">
            <span className="block text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-mono">
              {supportRatio}/7
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Technical Support</span>
          </div>
        </div>
      </section>

      {/* 3.5 Interactive 3D Factory Showroom */}
      <section className="bg-gradient-to-br from-[#12141c] to-[#1a1c24] border border-white/10 rounded-2xl p-8 max-w-5xl mx-auto overflow-hidden relative">
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-4 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block font-mono">WSG PRODUCTION ECOSYSTEM</span>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">The Digital Website Factory</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Experience the perfect synthesis of raw engineering power and meticulous visual design. Every layout undergoes our multi-step automated compiler stack before manual branding deployment.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300 font-mono">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-Latency Production Edge Router</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300 font-mono">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>W3C Fluid Viewport Standards</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300 font-mono">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Secure SSL Keys & Database Enclaves</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 relative">
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={factory3d}
                alt="WebSuccessGo Website Factory 3D Render"
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <span className="absolute bottom-3 left-3 bg-black/80 px-2.5 py-1 text-[9px] text-zinc-300 font-mono rounded border border-white/10 backdrop-blur-sm">
                SYSTEM CONCEPT MODEL V2.4
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works - Bento Grid */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-blue-400">STRUCTURED PIPELINE</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">How We Launch Your Portal</h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Our optimized productized agency framework streamlines planning, checkout, and deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="bg-[#151820] border border-white/5 rounded-2xl p-6 relative group overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="space-y-3 relative z-10">
              <span className="text-2xl font-black text-blue-500 font-mono">01</span>
              <h3 className="font-extrabold text-zinc-200 text-sm">Choose Template</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Explore our visual catalog tailored for clinics, restaurants, law firms, and tech startups.
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 pt-4 block border-t border-white/5 mt-4">STEP ONE • CATALOG</span>
          </div>

          {/* Card 2 */}
          <div className="bg-[#151820] border border-white/5 rounded-2xl p-6 relative group overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="space-y-3 relative z-10">
              <span className="text-2xl font-black text-purple-500 font-mono">02</span>
              <h3 className="font-extrabold text-zinc-200 text-sm">Customize Details</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Provide your custom brand name, logs, desired pages, and exact text instructions in one dashboard.
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 pt-4 block border-t border-white/5 mt-4">STEP TWO • CUSTOMIZE</span>
          </div>

          {/* Card 3 */}
          <div className="bg-[#151820] border border-white/5 rounded-2xl p-6 relative group overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
            <div className="space-y-3 relative z-10">
              <span className="text-2xl font-black text-cyan-400 font-mono">03</span>
              <h3 className="font-extrabold text-zinc-200 text-sm">Secure Payment</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Submit a 50% secure advance deposit using safe digital UPI QR or integrated credit checkout gateways.
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 pt-4 block border-t border-white/5 mt-4">STEP THREE • DEPOSIT</span>
          </div>

          {/* Card 4 */}
          <div className="bg-[#151820] border border-white/5 rounded-2xl p-6 relative group overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors"></div>
            <div className="space-y-3 relative z-10">
              <span className="text-2xl font-black text-pink-400 font-mono">04</span>
              <h3 className="font-extrabold text-zinc-200 text-sm">Website Live</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Approve your responsive staging environment. We bind your custom domain and host it live.
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 pt-4 block border-t border-white/5 mt-4">STEP FOUR • LAUNCH</span>
          </div>
        </div>
      </section>

      {/* 5. Interactive AI Website Planner */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-mono">
            <span>GEMINI AI ENGINE POWERED</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>AI Website Blueprint Planner</span>
          </h2>
          <p className="text-sm text-zinc-400">
            Describe your business, and our real-time Gemini planner will instantly craft your custom site layout.
          </p>
        </div>

        <form onSubmit={handleAIPlan} className="flex gap-2 bg-[#151820] p-2 rounded-2xl border border-white/10 shadow-lg">
          <input
            type="text"
            value={plannerInput}
            onChange={(e) => setPlannerInput(e.target.value)}
            placeholder="e.g., A boutique lawyer office in Mumbai focused on intellectual property claims..."
            className="flex-1 px-4 py-3 text-sm focus:outline-none bg-transparent text-white placeholder-zinc-500"
            disabled={loadingAI}
          />
          <button
            type="submit"
            disabled={loadingAI || !plannerInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            {loadingAI ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Generate Plan</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* AI Recommendations Results Display */}
        {plannerResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#151820] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-sm">Custom Website Blueprint Outline</h3>
                <p className="text-[10px] text-zinc-500 font-mono">POWERED BY GEMINI PRO</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 font-mono">
                Match Score: 99.4%
              </span>
            </div>

            {plannerResult.fallback && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 font-mono">
                {plannerResult.message || "Running on localized fallback model blueprint parameters."}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Recommended Style</span>
                <span className="font-semibold text-zinc-200">{plannerResult.recommendedCategory}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Suggested Bundle</span>
                <span className="font-bold text-cyan-400 font-mono">₹{plannerResult.recommendedPackage === 'Starter' ? '4,999 (Starter)' : plannerResult.recommendedPackage === 'Business' ? '9,999 (Business)' : '19,999+ (Premium)'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Business Description Summary</span>
              <p className="text-zinc-300 leading-relaxed italic text-xs">
                &ldquo;{plannerResult.businessDescription}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Proposed Viewport Pages</span>
                <div className="flex flex-wrap gap-1.5">
                  {plannerResult.pages?.map((page: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-black/40 text-zinc-300 rounded border border-white/5 font-mono text-[10px]">
                      {page}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Suggested Automation Modules</span>
                <ul className="space-y-1.5 text-zinc-400 font-mono text-[10px]">
                  {plannerResult.suggestedFeatures?.map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={onBuildCTA}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shadow-blue-500/20"
              >
                <span>Apply and Start Order</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* 6. Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-5xl mx-auto">
        <div className="bg-[#151820] border border-white/10 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-white/25 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-extrabold text-zinc-100 text-sm uppercase tracking-wide">Dynamic Components</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Every workspace contains customizable modules for digital payments, automated WhatsApp responders, and live client inquiry logs.
          </p>
        </div>

        <div className="bg-[#151820] border border-white/10 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-white/25 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-extrabold text-zinc-100 text-sm uppercase tracking-wide">Pristine Security</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Integrated Firebase and Firestore backends ensure your administrative client logs and progress timelines remain completely secure.
          </p>
        </div>

        <div className="bg-[#151820] border border-white/10 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-white/25 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow shadow-cyan-500/20">
            <UserCheck className="w-5 h-5 text-white animate-pulse" />
          </div>
          <h3 className="font-extrabold text-zinc-100 text-sm uppercase tracking-wide">Productized Agency</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Say goodbye to endless design back-and-forths. Select premium layouts, specify texts, and watch your business thrive.
          </p>
        </div>
      </section>
    </div>
  );
}
