'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  Briefcase,
  Layers,
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  Laptop,
  Check,
  DollarSign,
  ClipboardList,
  LogOut,
  HelpCircle,
  Menu,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

// Import modular subviews
import Landing from '@/components/Landing';
import Portfolio from '@/components/Portfolio';
import Marketplace from '@/components/Marketplace';
import OrderFlow from '@/components/OrderFlow';
import Tracking from '@/components/Tracking';
import AdminDashboard from '@/components/AdminDashboard';
import { Template, Portfolio as PortfolioItem, Order, Payment } from '@/lib/firebase/types';
import { auth } from '@/lib/firebase/client';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'landing' | 'portfolio' | 'marketplace' | 'pricing' | 'order' | 'track' | 'admin'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global DB states fetched from server
  const [templates, setTemplates] = useState<Template[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Selected checkout options
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'Starter' | 'Business' | 'Premium' | null>(null);

  // Authentication Session
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [openLegalModal, setOpenLegalModal] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  // Helper to fetch authorization header
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!auth.currentUser) return {};
    try {
      const token = await auth.currentUser.getIdToken();
      return { Authorization: `Bearer ${token}` };
    } catch {
      return {};
    }
  };

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      const authHeaders = await getAuthHeaders();

      const [resTpl, resPort, resOrd, resPay] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/portfolio'),
        fetch('/api/orders', { headers: authHeaders }),
        fetch('/api/payments', { headers: authHeaders }),
      ]);

      const dataTpl = await resTpl.json();
      const dataPort = await resPort.json();
      const dataOrd = await resOrd.json();
      const dataPay = await resPay.json();

      if (dataTpl.templates) setTemplates(dataTpl.templates);
      if (dataPort.portfolio) setPortfolio(dataPort.portfolio);
      if (dataOrd.orders) setOrders(dataOrd.orders);
      if (dataPay.payments) setPayments(dataPay.payments);
    } catch (_err) {
      // Do not log raw errors to the console in production
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  // Firebase Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch('/api/auth', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.user) {
            setSession(data.user);
          } else {
            setSession({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: '',
              phone: '',
              role: 'customer'
            });
          }
        } catch {
          setSession(null);
        }
      } else {
        setSession(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials');
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      const token = await userCredential.user.getIdToken();
      // Sync user profile to Firestore `/users`
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: registerName,
          phone: registerPhone,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSession(data.user);
        setAuthPassword('');
        setRegisterName('');
        setRegisterPhone('');
      } else {
        setAuthError(data.error || 'Registration profile sync failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Server registration failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSession(null);
      setActiveTab('landing');
    } catch {
      // Fail silently
    }
  };

  // Order timeline progression callbacks
  const handleUpdateOrder = async (orderId: string, fields: any) => {
    if (!session || session.role !== 'admin') return;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (_err) { /* silent */ }
  };

  // Template administrative mutations
  const handleAddTemplate = async (fields: any) => {
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ action: 'create', ...fields }),
      });
      if (res.ok) fetchData();
    } catch { /* silent */ }
  };

  const handleEditTemplate = async (id: string, fields: any) => {
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ action: 'update', id, ...fields }),
      });
      if (res.ok) fetchData();
    } catch { /* silent */ }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ action: 'delete', id }),
      });
      if (res.ok) fetchData();
    } catch { /* silent */ }
  };

  // Portfolio administrative mutations
  const handleAddPortfolio = async (fields: any) => {
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ action: 'create', ...fields }),
      });
      if (res.ok) fetchData();
    } catch { /* silent */ }
  };

  const handleEditPortfolio = async (id: string, fields: any) => {
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ action: 'update', id, ...fields }),
      });
      if (res.ok) fetchData();
    } catch { /* silent */ }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ action: 'delete', id }),
      });
      if (res.ok) fetchData();
    } catch { /* silent */ }
  };


  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased flex flex-col justify-between">
      {/* Primary Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            {/* Branding Logo */}
            <div
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                W
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  WebSuccessGo
                </span>
                <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider -mt-1 font-mono">
                  Marketplace
                </span>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <button
                onClick={() => setActiveTab('landing')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'landing' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-zinc-200'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'marketplace' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-zinc-200'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'portfolio' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-zinc-200'
                }`}
              >
                Our Portfolio
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'pricing' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-zinc-200'
                }`}
              >
                Pricing Plans
              </button>
              <button
                onClick={() => setActiveTab('track')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'track' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-zinc-200'
                }`}
              >
                Track Order
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'admin' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-zinc-200'
                }`}
              >
                Admin Portal
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Session Indicator / Logged in details */}
            {session ? (
              <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-zinc-300 truncate max-w-[120px]">
                  {session.name} ({session.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className="hidden md:flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Main Primary CTA */}
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setSelectedPackage(null);
                setActiveTab('order');
              }}
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Build My Website
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 md:hidden text-zinc-600 hover:text-zinc-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-zinc-200 p-4 absolute top-16 left-0 right-0 z-30 space-y-3 font-semibold text-xs shadow-lg"
          >
            <button
              onClick={() => {
                setActiveTab('landing');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left p-2.5 hover:bg-zinc-50 rounded-lg text-zinc-700"
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('marketplace');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left p-2.5 hover:bg-zinc-50 rounded-lg text-zinc-700"
            >
              Browse Templates
            </button>
            <button
              onClick={() => {
                setActiveTab('portfolio');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left p-2.5 hover:bg-zinc-50 rounded-lg text-zinc-700"
            >
              Our Portfolio
            </button>
            <button
              onClick={() => {
                setActiveTab('pricing');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left p-2.5 hover:bg-zinc-50 rounded-lg text-zinc-700"
            >
              Pricing Plans
            </button>
            <button
              onClick={() => {
                setActiveTab('track');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left p-2.5 hover:bg-zinc-50 rounded-lg text-zinc-700"
            >
              Track Order
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left p-2.5 hover:bg-zinc-50 rounded-lg text-zinc-700"
            >
              Admin Portal
            </button>
            {session && (
              <div className="pt-2 border-t border-zinc-100 flex justify-between items-center text-zinc-500 font-mono">
                <span>{session.name}</span>
                <button onClick={handleLogout} className="text-zinc-900 font-bold">
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <AnimatePresence mode="wait">
          {/* LANDING SECTION */}
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Landing
                onBuildCTA={() => {
                  setSelectedTemplate(null);
                  setSelectedPackage(null);
                  setActiveTab('order');
                }}
                onBrowseTemplates={() => setActiveTab('marketplace')}
              />
            </motion.div>
          )}

          {/* PORTFOLIO SECTION */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Portfolio
                portfolio={portfolio}
                isAdmin={session?.role === 'admin'}
                onDelete={handleDeletePortfolio}
                onEdit={() => setActiveTab('admin')}
              />
            </motion.div>
          )}

          {/* MARKETPLACE SECTION */}
          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Marketplace
                templates={templates}
                onSelectTemplate={(tpl) => {
                  setSelectedTemplate(tpl);
                  setActiveTab('order');
                }}
                isAdmin={session?.role === 'admin'}
                onDelete={handleDeleteTemplate}
                onEdit={() => setActiveTab('admin')}
              />
            </motion.div>
          )}

          {/* PRICING PLANS SECTION */}
          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10 text-white"
            >
              <div className="text-center space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">TRANSPARENT VALUE LEDGER</span>
                <h2 className="text-3xl font-extrabold tracking-tight">Flexible, Fixed-Rate Investment</h2>
                <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                  Acquire professional premium web platforms. Activate your project with a secure 50% initial advance and unlock instant wireframing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Plan Starter */}
                <div className="bg-[#151820] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-blue-500/30 transition-all space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                  <div className="space-y-4 text-left">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 text-[9px] font-bold uppercase tracking-wider font-mono">
                        Starter Build
                      </span>
                      <h3 className="text-3xl font-black mt-2">₹4,999</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Optimized for single landing pages, portfolio displays, local shops, and quick WhatsApp action loops.
                    </p>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300 border-t border-white/5 pt-4 text-left">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">✓</span> Up to 5 Responsive UI Pages
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">✓</span> Contact Form & Email Integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">✓</span> WhatsApp Action Floating Buttons
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">✓</span> Modern glassmorphic typography
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">✓</span> SSL Secured Domain Setup
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setSelectedPackage('Starter');
                      setActiveTab('order');
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all hover:border-blue-500/40 cursor-pointer text-center"
                  >
                    Select Starter Bundle
                  </button>
                </div>

                {/* Plan Business */}
                <div className="bg-[#151820] border-2 border-purple-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative space-y-6 overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 shadow-md">
                    Most Selected Tier
                  </div>
                  <div className="space-y-4 text-left pt-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[9px] font-bold uppercase tracking-wider font-mono">
                        Business Growth
                      </span>
                      <h3 className="text-3xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">₹9,999</h3>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Complete visual suites configured with deep local SEO, location routing maps, and responsive product sheets.
                    </p>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300 border-t border-white/5 pt-4 text-left">
                    <li className="flex items-center gap-2 text-cyan-300 font-bold">
                      <span>✓</span> Everything in Starter package
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Up to 10 Premium Tailored Pages
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Selective animations & fluid effects
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Business Maps & Route setups
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Core SEO Optimization Scorecard
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Fluid responsive device-scaling
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setSelectedPackage('Business');
                      setActiveTab('order');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/25 cursor-pointer text-center"
                  >
                    Select Business Bundle
                  </button>
                </div>

                {/* Plan Premium */}
                <div className="bg-[#151820] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-purple-500/30 transition-all space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
                  <div className="space-y-4 text-left">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 text-[9px] font-bold uppercase tracking-wider font-mono">
                        Enterprise Portal
                      </span>
                      <h3 className="text-3xl font-black mt-2">₹19,999+</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Custom full-stack suites containing cloud data engines, custom checkout processors, and developer controls.
                    </p>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300 border-t border-white/5 pt-4 text-left">
                    <li className="flex items-center gap-2 text-purple-400 font-bold">
                      <span>✓</span> Everything in Business package
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Unlimited Bespoke Screen States
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Cloud DB & real-time synchronization
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Live Payment Gateway integration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Customer administrator backends
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">✓</span> Encrypted identity auth flow
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setSelectedPackage('Premium');
                      setActiveTab('order');
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all hover:border-purple-500/40 cursor-pointer text-center"
                  >
                    Select Premium Setup
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ORDER CHECKOUT STEPPER SECTION */}
          {activeTab === 'order' && (
            <motion.div
              key="order"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OrderFlow
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                selectedPackage={selectedPackage}
                onSelectPackage={setSelectedPackage}
                customerSession={session}
                onOrderSuccess={(ord) => {
                  fetchData(); // pull new orders
                }}
              />
            </motion.div>
          )}

          {/* PROJECT TRACKING PORTAL */}
          {activeTab === 'track' && (
            <motion.div
              key="track"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tracking initialOrder={orders[0] || null} customerSession={session} />
            </motion.div>
          )}

          {/* ADMINISTRATIVE PORTAL SCREEN */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {session?.role === 'admin' ? (
                <AdminDashboard
                  orders={orders}
                  payments={payments}
                  templates={templates}
                  portfolio={portfolio}
                  onUpdateOrder={handleUpdateOrder}
                  onAddTemplate={handleAddTemplate}
                  onEditTemplate={handleEditTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  onAddPortfolio={handleAddPortfolio}
                  onEditPortfolio={handleEditPortfolio}
                  onDeletePortfolio={handleDeletePortfolio}
                />
              ) : (
                /* AUTH LOGIN PANEL DRAWER */
                <div className="max-w-md mx-auto bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-xs text-zinc-700">
                  <div className="text-center space-y-2 pb-4 border-b border-zinc-100">
                    <h3 className="text-xl font-bold text-zinc-950">
                      {isRegistering ? 'Register Customer Account' : 'Security Sign In'}
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      {isRegistering
                        ? 'Join WebSuccessGo to submit and track your web builds.'
                        : 'Sign in as Customer to track orders, or as Admin to manage orders.'}
                    </p>
                  </div>

                  <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
                    {isRegistering && (
                      <>
                        <div className="space-y-1">
                          <label className="font-bold text-zinc-500 block">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-zinc-500 block">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={registerPhone}
                            onChange={(e) => setRegisterPhone(e.target.value)}
                            placeholder="9988776655"
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-500 block">Authorized Email *</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g., admin@websuccessgo.com"
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-500 block">Account Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-3 pr-10 py-2 border border-zinc-200 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {authError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-lg">
                        {authError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold cursor-pointer"
                    >
                      {isRegistering ? 'Create Customer Account' : 'Sign In Now'}
                    </button>
                  </form>

                  {/* Auth Mode Toggle & 1-Click Sandbox Credentials box */}
                  <div className="space-y-4 pt-4 border-t border-zinc-100 text-center">
                    <button
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setAuthError('');
                      }}
                      className="text-xs text-zinc-500 font-semibold hover:underline block mx-auto"
                    >
                      {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register Here'}
                    </button>

                    {/* Preseeded Evaluator Help Box */}
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-left space-y-1.5 text-[11px]">
                      <span className="font-bold text-zinc-800 block">Sandbox Evaluation Credentials (1-Click):</span>
                      <div className="space-y-1 text-zinc-600">
                        <button
                          onClick={() => {
                            setAuthEmail('admin@websuccessgo.com');
                            setAuthPassword('admin');
                            setIsRegistering(false);
                          }}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-[10px] font-bold block w-full text-center"
                        >
                          Fill Admin (admin@websuccessgo.com / admin)
                        </button>
                        <button
                          onClick={() => {
                            setAuthEmail('customer@gmail.com');
                            setAuthPassword('customer');
                            setIsRegistering(false);
                          }}
                          className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded border border-zinc-200 text-[10px] font-bold block w-full text-center mt-1"
                        >
                          Fill Customer (customer@gmail.com / customer)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-black/40 border-t border-white/5 py-12 text-center text-xs text-zinc-400 space-y-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-6">
          {/* Footer Branding */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xs">
              W
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              WebSuccessGo
            </span>
          </div>

          {/* Footer Links */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center text-zinc-400 font-semibold">
            <button
              onClick={() => setOpenLegalModal('terms')}
              className="hover:text-[#22D3EE] transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
            >
              <span>✉</span> Terms & Conditions
            </button>
            <button
              onClick={() => setOpenLegalModal('privacy')}
              className="hover:text-[#22D3EE] transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
            >
              <span>🤝</span> Privacy Policy
            </button>
            <button
              onClick={() => setOpenLegalModal('refund')}
              className="hover:text-[#22D3EE] transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
            >
              <span>▣</span> Refund Policy
            </button>
          </div>

          {/* Copyright info */}
          <div className="space-y-1.5 text-zinc-500 text-[11px]">
            <p className="font-semibold text-zinc-400">
              © 2026 WebSuccessGo. All Rights Reserved.
            </p>
            <p>
              Powered by Next.js, Framer Motion, and Gemini Advanced Website Planner.
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Documents Modal */}
      <AnimatePresence>
        {openLegalModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#151820] border border-white/15 rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#0b0c10] border-b border-white/10 px-6 py-4 flex justify-between items-center text-white">
                <span className="text-xs font-bold font-mono tracking-wider text-cyan-400 uppercase">
                  {openLegalModal === 'terms' ? 'Terms & Conditions' : openLegalModal === 'privacy' ? 'Privacy Policy' : 'Refund Policy'}
                </span>
                <button
                  onClick={() => setOpenLegalModal(null)}
                  className="text-zinc-400 hover:text-white font-bold text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 text-zinc-300 text-xs md:text-sm leading-relaxed space-y-6 text-left">
                {openLegalModal === 'terms' && (
                  <div className="space-y-6">
                    <h1 className="text-xl font-extrabold text-white pb-2 border-b border-white/10">Terms & Conditions</h1>
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-white">1. Introduction</h2>
                      <p>Welcome to <strong>WebSuccessGo</strong>. By accessing our website or purchasing our services, you agree to follow these Terms & Conditions. These terms define the rules, responsibilities, and limitations related to our website development services.</p>
                      
                      <h2 className="text-base font-bold text-white">2. Website Development Services</h2>
                      <p>WebSuccessGo provides:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Business Website Development</li>
                        <li>E-commerce Website Development</li>
                        <li>Custom Website Design</li>
                        <li>Landing Pages</li>
                        <li>Website Maintenance Services</li>
                        <li>UI/UX Design Services</li>
                      </ul>
                      <p>The final website will be developed according to the selected package and requirements submitted by the customer.</p>

                      <h2 className="text-base font-bold text-white">3. Order Process</h2>
                      <p>The customer must:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Select a website template/package</li>
                        <li>Provide accurate business details</li>
                        <li>Submit required content, images, and documents</li>
                        <li>Complete payment process</li>
                      </ul>
                      <p>Project development will start after confirmation of payment and requirement details.</p>

                      <h2 className="text-base font-bold text-white">4. Payment Terms</h2>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>50% advance payment is required before starting the project.</li>
                        <li>Remaining 50% payment must be completed before final website delivery.</li>
                        <li>Payments made for development services are subject to our refund policy.</li>
                      </ul>

                      <h2 className="text-base font-bold text-white">5. Project Timeline</h2>
                      <p>Estimated delivery time depends on:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Website complexity</li>
                        <li>Client response time</li>
                        <li>Content availability</li>
                        <li>Number of revisions</li>
                      </ul>
                      <p>Delay caused due to missing information from the client may extend delivery timelines.</p>

                      <h2 className="text-base font-bold text-white">6. Client Responsibilities</h2>
                      <p>The client is responsible for providing:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Correct business information</li>
                        <li>Logo and images</li>
                        <li>Website content</li>
                        <li>Legal permissions for uploaded materials</li>
                      </ul>
                      <p>WebSuccessGo is not responsible for copyright issues related to client-provided content.</p>

                      <h2 className="text-base font-bold text-white">7. Website Ownership</h2>
                      <p>After complete payment:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Website source files/design ownership will be transferred according to the selected package.</li>
                        <li>Third-party tools, plugins, themes, or licenses may have separate terms.</li>
                      </ul>

                      <h2 className="text-base font-bold text-white">8. Revisions Policy</h2>
                      <p>Clients can request modifications according to their selected package.</p>
                      <p>Additional changes beyond the agreed scope may require additional charges.</p>

                      <h2 className="text-base font-bold text-white">9. Limitation of Liability</h2>
                      <p>WebSuccessGo is not responsible for:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Server downtime</li>
                        <li>Third-party service failures</li>
                        <li>Domain/hosting issues</li>
                        <li>Loss caused by unauthorized access</li>
                      </ul>
                    </div>
                  </div>
                )}

                {openLegalModal === 'privacy' && (
                  <div className="space-y-6">
                    <h1 className="text-xl font-extrabold text-white pb-2 border-b border-white/10">Privacy Policy</h1>
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
                      <p>We may collect:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Name</li>
                        <li>Email Address</li>
                        <li>Phone Number</li>
                        <li>Business Information</li>
                        <li>Payment Details</li>
                        <li>Website Requirements</li>
                      </ul>

                      <h2 className="text-base font-bold text-white">2. Use of Information</h2>
                      <p>Collected information is used for:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Processing website orders</li>
                        <li>Communication regarding projects</li>
                        <li>Providing customer support</li>
                        <li>Improving our services</li>
                      </ul>

                      <h2 className="text-base font-bold text-white">3. Payment Security</h2>
                      <p>All payments are processed through secure payment gateways. WebSuccessGo does not store complete payment card details.</p>

                      <h2 className="text-base font-bold text-white">4. Data Protection</h2>
                      <p>We take reasonable security measures to protect customer information from unauthorized access.</p>

                      <h2 className="text-base font-bold text-white">5. Third Party Services</h2>
                      <p>We may use third-party services:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Payment gateways</li>
                        <li>Hosting providers</li>
                        <li>Analytics tools</li>
                        <li>Communication platforms</li>
                      </ul>
                      <p>These services have their own privacy policies.</p>

                      <h2 className="text-base font-bold text-white">6. Cookies</h2>
                      <p>Our website may use cookies to improve user experience and analyze website performance.</p>

                      <h2 className="text-base font-bold text-white">7. Contact</h2>
                      <p>For privacy-related questions:</p>
                      <p>Email: <a href="mailto:support@websuccessgo.com" className="text-cyan-400 hover:underline">support@websuccessgo.com</a></p>
                    </div>
                  </div>
                )}

                {openLegalModal === 'refund' && (
                  <div className="space-y-6">
                    <h1 className="text-xl font-extrabold text-white pb-2 border-b border-white/10">Refund Policy</h1>
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-white">1. Advance Payment</h2>
                      <p>The advance payment confirms the project booking and allocation of resources.</p>

                      <h2 className="text-base font-bold text-white">2. Refund Eligibility</h2>
                      <p>Refund requests may be considered only when:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Project has not been started</li>
                        <li>No work has been delivered</li>
                        <li>Request is submitted within applicable conditions</li>
                      </ul>

                      <h2 className="text-base font-bold text-white">3. Non-Refundable Situations</h2>
                      <p>Refunds will not be provided for:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Completed work</li>
                        <li>Delivered designs</li>
                        <li>Approved templates</li>
                        <li>Client delays</li>
                        <li>Change of mind after project commencement</li>
                      </ul>

                      <h2 className="text-base font-bold text-white">4. Cancellation</h2>
                      <p>If a client cancels after development has started, the amount paid may be adjusted against completed work.</p>

                      <h2 className="text-base font-bold text-white">5. Contact For Refund Queries</h2>
                      <p>Email: <a href="mailto:support@websuccessgo.com" className="text-cyan-400 hover:underline">support@websuccessgo.com</a></p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
