'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Search,
  Calendar,
  FileText,
  AlertCircle,
  RefreshCw,
  User,
  Download,
  Sparkles,
  ChevronRight,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { Order } from '@/lib/firebase/types';
import { auth } from '@/lib/firebase/client';

interface TrackingProps {
  initialOrder: Order | null;
  customerSession: any;
}

export default function Tracking({ initialOrder, customerSession }: TrackingProps) {
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [emailInput, setEmailInput] = useState(customerSession?.email || '');
  const [activeOrder, setActiveOrder] = useState<Order | null>(initialOrder);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Status mapping to timeline index
  const statusTimeline = [
    { label: 'Payment Received', statusKey: 'Payment Received', desc: '50% Advance received and synced.' },
    { label: 'Requirements Submitted', statusKey: 'Requirement Received', desc: 'Requirement forms locked & brief analyzed.' },
    { label: 'Design Started', statusKey: 'Design Started', desc: 'Custom wireframe UI layouts being tailored.' },
    { label: 'Development Started', statusKey: 'Development Started', desc: 'Next.js components and assets assembly initiated.' },
    { label: 'Testing & SEO', statusKey: 'Testing', desc: 'Quality assurance speeds & Google SEO scoring check.' },
    { label: 'Website Live', statusKey: 'Completed', desc: 'Domain DNS mapped. Workspace deployed live!' },
  ];

  const getActiveStepIndex = (status: string) => {
    if (status === 'Pending') return -1;
    if (status === 'Payment Received') return 0;
    if (status === 'Requirement Received') return 1;
    if (status === 'Design Started') return 2;
    if (status === 'Development Started') return 3;
    if (status === 'Testing') return 4;
    if (status === 'Completed') return 5;
    return 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim() || !emailInput.trim()) return;
    setSearching(true);
    setError('');
    setActiveOrder(null);

    try {
      let authHeader = '';
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        authHeader = `Bearer ${token}`;
      }
      const res = await fetch(`/api/orders/${orderNumberInput}`, {
        headers: authHeader ? { Authorization: authHeader } : {}
      });
      const data = await res.json();

      if (res.ok && data.order) {
        if (data.order.customerEmail.toLowerCase() === emailInput.trim().toLowerCase()) {
          setActiveOrder(data.order);
        } else {
          setError('Order found but email address does not match.');
        }
      } else {
        setError(data.error || 'No active project found with this Order ID.');
      }
    } catch (err) {
      setError('Failed to fetch tracking details. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleClientApproveDesign = async () => {
    if (!activeOrder) return;
    setUpdating(true);

    try {
      // Build Authorization header from Firebase Auth
      let authHeader = '';
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        authHeader = `Bearer ${token}`;
      }

      const res = await fetch(`/api/orders/${activeOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          projectStatus: 'Development Started',
          adminNotes: 'Design approved by customer! Coding and development phase initiated.',
        }),
      });


      const data = await res.json();
      if (data.success && data.order) {
        setActiveOrder(data.order);
      }
    } catch (err) {
      console.error('Design approval transition failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const currentStep = activeOrder ? getActiveStepIndex(activeOrder.projectStatus) : -1;

  return (
    <div className="space-y-10 text-white text-left">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-cyan-400">REAL-TIME TELEMETRY</span>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Delivery Roadmap</h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Monitor your specialized template build, interact with drafts, download assets, and verify staging approval nodes.
        </p>
      </div>

      {/* Search Lookup */}
      {!activeOrder && (
        <div className="max-w-md mx-auto bg-[#151820] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block">AUTHENTICATED HANDSHAKE</span>
            <h3 className="text-base font-extrabold text-white">Project Tracker Login</h3>
            <p className="text-xs text-zinc-400">Track development milestones live by entering credentials.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-bold block uppercase tracking-wider text-[10px]">Order Number / ID *</label>
              <input
                type="text"
                required
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                placeholder="e.g., WSG-2026-0001"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs uppercase focus:outline-none focus:border-blue-500/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-bold block uppercase tracking-wider text-[10px]">Authorized Email *</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g., owner@gmail.com"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500/40"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={searching}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {searching ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Fetch Timeline Logs</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tracking Timeline Board */}
      {activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Left: Timeline Tracking Flow (8 cols) */}
          <div className="lg:col-span-7 bg-[#151820] border border-white/10 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-0.5">SSL REAL-TIME LINK</span>
                <h3 className="font-extrabold text-lg text-white">Project Staging Logs</h3>
              </div>
              <button
                onClick={() => {
                  setOrderNumberInput('');
                  setActiveOrder(null);
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Exit Tracker
              </button>
            </div>

            {/* Visual Timeline (Vertical Flow) */}
            <div className="relative pl-6 space-y-8 text-xs text-zinc-400">
              {/* Connecting Line */}
              <div className="absolute left-2.5 top-2.5 bottom-2.5 w-[2px] bg-white/5 -z-10"></div>

              {statusTimeline.map((step, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <div key={idx} className="relative flex gap-4 items-start group">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-emerald-500 border-emerald-500 text-black shadow shadow-emerald-500/25'
                          : isCurrent
                          ? 'bg-blue-600 border-blue-500 text-white animate-pulse shadow shadow-blue-500/45'
                          : 'bg-[#151820] border-white/10 text-zinc-500'
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-3 h-3 text-black stroke-[3]" />
                      ) : (
                        <span className="text-[9px] font-black">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step details */}
                    <div className="space-y-1.5 text-left ml-2">
                      <span
                        className={`font-extrabold text-sm ${
                          isPassed ? 'text-zinc-100' : isCurrent ? 'text-blue-400' : 'text-zinc-500'
                        }`}
                      >
                        {step.label}
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Technical Specs & Approval Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Meta context card */}
            <div className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl text-left">
              <div className="border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-mono">SPECIFIED LEDGER</span>
                <h4 className="font-extrabold text-sm text-zinc-200">Authorized Account</h4>
              </div>

              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Authorized ID:</span>
                  <span className="font-mono font-bold text-white uppercase">{activeOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Business Entity:</span>
                  <span className="font-bold text-white truncate max-w-[180px]">{activeOrder.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Baseline layout:</span>
                  <span className="font-bold text-white font-mono">{activeOrder.templateName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Development Tier:</span>
                  <span className="font-bold text-white font-mono uppercase text-[10px]">{activeOrder.package}</span>
                </div>
                {activeOrder.developerAssigned && (
                  <div className="flex justify-between text-blue-400 font-mono">
                    <span>Lead Developer:</span>
                    <span>{activeOrder.developerAssigned}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Design approval trigger */}
            {activeOrder.projectStatus === 'Design Started' && (
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 text-left space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black">APPROVAL LOCK AVAILABLE</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Interactive Wireframes Ready</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Our lead developer has finalized your tailored design model blueprint. View, approve, and authorize prompt assembly.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleClientApproveDesign}
                    disabled={updating}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {updating ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-cyan-300" />
                        <span>Approve Blueprint Design</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Uploaded deliverables asset card */}
            {activeOrder.uploadedFile && (
              <div className="bg-[#151820] border border-white/10 rounded-2xl p-6 text-left space-y-4 shadow-xl">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest font-mono">STAGING ENVIRONMENT</span>
                  <h4 className="font-extrabold text-sm text-zinc-100 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-blue-400" />
                    <span>Deployed Deliverable Bundle</span>
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Download custom styled mockups, interactive HTML models, or compiled static production builds from this project pipeline block.
                  </p>
                </div>

                <a
                  href={activeOrder.uploadedFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download deliverable: {activeOrder.uploadedFile.name}</span>
                </a>
              </div>
            )}

            {/* Dynamic support block */}
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl text-left space-y-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">SUPPORT CONTACT NODE</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Need immediate visual amendments or copy injections? Reply to our automated WhatsApp stream or contact operations at <span className="text-blue-400 font-mono">support@websuccessgo.com</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
