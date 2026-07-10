'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Laptop,
  Smartphone,
  FileText,
  Sparkles,
  CheckCircle2,
  QrCode,
  Printer,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Template, Order } from '@/lib/db';

interface OrderFlowProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelectTemplate: (tpl: Template | null) => void;
  selectedPackage: 'Starter' | 'Business' | 'Premium' | null;
  onSelectPackage: (pkg: 'Starter' | 'Business' | 'Premium' | null) => void;
  customerSession: any;
  onOrderSuccess: (order: Order) => void;
}

export default function OrderFlow({
  templates,
  selectedTemplate,
  onSelectTemplate,
  selectedPackage,
  onSelectPackage,
  customerSession,
  onOrderSuccess,
}: OrderFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [logoUpload, setLogoUpload] = useState<string>('');
  const [contentUpload, setContentUpload] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [contentUploading, setContentUploading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: customerSession?.name || '',
    phone: customerSession?.phone || '',
    email: customerSession?.email || '',
    businessDescription: '',
    requiredPages: 'Home, About Us, Services, Portfolio, Contact Us',
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI QR' | 'Razorpay'>('Razorpay');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [notificationTab, setNotificationTab] = useState<'invoice' | 'whatsapp' | 'email'>('invoice');

  const categories = [
    'Restaurant Website Templates',
    'Clinic Website Templates',
    'Law Firm Website Templates',
    'Salon Website Templates',
    'E-commerce Website Templates',
    'Startup Website Templates',
  ];

  const filteredTemplates = templates.filter(
    (tpl) => tpl.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  // Auto set category if template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setTimeout(() => setSelectedCategory(selectedTemplate.category), 0);
    }
  }, [selectedTemplate]);

  // Pricing definitions
  const packages = [
    {
      name: 'Starter',
      price: 4999,
      desc: 'Ideal for local stores, single portfolios, and landing pages.',
      features: ['Up to 5 Pages', 'Mobile Responsive', 'Contact Form', 'WhatsApp Integration', 'Basic Design'],
    },
    {
      name: 'Business',
      price: 9999,
      desc: 'Perfect for professional practices, clinics, and menus.',
      features: ['Up to 10 Pages', 'SEO Setup', 'Google Map Integration', 'Contact Form', 'Professional UI', 'Speed Optimization'],
    },
    {
      name: 'Premium',
      price: 19999,
      desc: 'Complete database integrated dynamic portals.',
      features: ['Custom UI Design', 'Database Integration', 'Payment Gateway', 'Admin Dashboard', 'Advanced Features'],
    },
  ];

  const activePackageData = packages.find((p) => p.name === selectedPackage);
  const totalPrice = activePackageData ? activePackageData.price : 9999;
  const advanceAmount = Math.round(totalPrice / 2);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSimulatedUpload = (type: 'logo' | 'content') => {
    if (type === 'logo') {
      setLogoUploading(true);
      setTimeout(() => {
        setLogoUpload(`https://picsum.photos/seed/logo-${Date.now()}/150/150`);
        setLogoUploading(false);
      }, 1000);
    } else {
      setContentUploading(true);
      setTimeout(() => {
        setContentUpload(`https://docs.google.com/document/d/websuccessgo-requirements-${Date.now()}`);
        setContentUploading(false);
      }, 1000);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);

    try {
      // Create Order payload
      const payload = {
        customerId: customerSession?.id || '',
        customerName: customerSession?.name || formData.ownerName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        templateId: selectedTemplate?.id || 'tpl-custom',
        templateName: selectedTemplate?.name || 'Custom Setup',
        packageName: selectedPackage || 'Business',
        amount: totalPrice,
        paymentMethod,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        businessDescription: formData.businessDescription,
        requiredPages: formData.requiredPages,
        logoUrl: logoUpload,
        contentUrl: contentUpload,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedOrder(data.order);
        setShowPaymentSuccess(true);
        if (onOrderSuccess) onOrderSuccess(data.order);
        setStep(5); // Proceed to confirmation/invoice view
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#151820] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-8 text-white">
      {/* Stepper Header */}
      {step < 5 && (
        <div className="border-b border-white/5 pb-6">
          <div className="flex justify-between items-center max-w-xl mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s ? 'bg-blue-600 text-white shadow shadow-blue-500/25' : 'bg-black/30 text-zinc-500 border border-white/5'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-[11px] font-bold hidden sm:inline uppercase tracking-widest ${step === s ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  {s === 1 ? 'Category' : s === 2 ? 'Template' : s === 3 ? 'Package' : 'Confirm'}
                </span>
                {s < 4 && <div className="w-10 md:w-16 h-[1.5px] bg-white/5"></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">PIPELINE STAGE 01</span>
            <h3 className="text-xl font-extrabold text-white">Select Website Category</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">Choose the business segment matching your target market niche.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  onSelectTemplate(null); // reset template
                  setStep(2);
                }}
                className={`p-5 rounded-xl border text-left transition-all hover:border-blue-500/40 hover:bg-white/5 cursor-pointer ${
                  selectedCategory === cat ? 'bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/10' : 'border-white/10 bg-black/20'
                }`}
              >
                <span className="font-extrabold text-sm block text-zinc-100">{cat.replace(' Website Templates', '')}</span>
                <span className="text-[10px] text-zinc-500 mt-1.5 block uppercase tracking-wider font-mono">Deploy custom viewport module</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: TEMPLATE SELECTION */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-xs font-mono text-zinc-500">CATEGORY: {selectedCategory.replace(' Website Templates', '')}</span>
          </div>

          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">PIPELINE STAGE 02</span>
            <h3 className="text-xl font-extrabold text-white">Choose Ready-Made Base Design</h3>
            <p className="text-xs text-zinc-400">Select an initial architectural style. Our engineers will customize it live.</p>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-10 bg-black/20 rounded-xl border border-white/5">
              <p className="text-xs text-zinc-500">No template models uploaded in this category. Select another style.</p>
              <button onClick={() => setStep(1)} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold">Go Back</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-2">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    onSelectTemplate(tpl);
                    if (tpl.price <= 4999) onSelectPackage('Starter');
                    else if (tpl.price <= 9999) onSelectPackage('Business');
                    else onSelectPackage('Premium');
                    setStep(3);
                  }}
                  className={`border rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                    selectedTemplate?.id === tpl.id ? 'border-blue-500 bg-blue-500/5 shadow-md' : 'border-white/10 bg-black/20'
                  }`}
                >
                  <img src={tpl.image} alt={tpl.name} className="w-full h-32 object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  <div className="p-4 space-y-1 text-left">
                    <span className="font-extrabold text-xs text-zinc-100 block">{tpl.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold block">Base Rate: ₹{tpl.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: PACKAGE SELECTION */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-xs font-mono text-zinc-500">MODEL: {selectedTemplate?.name}</span>
          </div>

          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">PIPELINE STAGE 03</span>
            <h3 className="text-xl font-extrabold text-white">Choose Development Package</h3>
            <p className="text-xs text-zinc-400">Select a bundle matching your needed dynamic automation levels.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-2">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                onClick={() => {
                  onSelectPackage(pkg.name as any);
                  setStep(4);
                }}
                className={`p-6 border rounded-xl cursor-pointer transition-all hover:border-blue-500/30 flex flex-col justify-between space-y-6 text-left ${
                  selectedPackage === pkg.name ? 'border-blue-500 bg-blue-500/5 shadow-lg' : 'border-white/10 bg-black/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-zinc-300 uppercase tracking-widest font-mono">{pkg.name}</span>
                    {selectedPackage === pkg.name && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-white font-mono">₹{pkg.price}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{pkg.desc}</p>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4 flex-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">BUNDLE SPECS:</span>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: BUSINESS DETAILS & ADVANCE PAYMENT FORM (Sleek Split Layout) */}
      {step === 4 && (
        <form onSubmit={handleCheckoutSubmit} className="space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="text-right">
              <span className="text-xs text-zinc-500 block font-mono">{selectedTemplate?.name}</span>
              <span className="text-xs font-bold text-blue-400">Package: {selectedPackage} (₹{totalPrice})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Left: Form Fields (8 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h4 className="font-extrabold text-sm text-zinc-200 uppercase tracking-wider">
                  Requirement Specifications
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleFormChange}
                    placeholder="e.g., Gourmet Italian Delhi"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Owner / Contact Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    required
                    value={formData.ownerName}
                    onChange={handleFormChange}
                    placeholder="e.g., Amit Sharma"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Contact WhatsApp Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="e.g., 9988776655"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="e.g., owner@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Business Narrative & Brand Colors *</label>
                <textarea
                  name="businessDescription"
                  required
                  rows={4}
                  value={formData.businessDescription}
                  onChange={handleFormChange}
                  placeholder="Describe your dishes/services, primary goals, target audience, and preferred slate/blue/purple accent colors..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Target Viewport Pages List</label>
                <input
                  type="text"
                  name="requiredPages"
                  value={formData.requiredPages}
                  onChange={handleFormChange}
                  placeholder="e.g., Home, About, Pizza Menu, Digital Cart, Contact"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/40"
                />
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="border border-dashed border-white/10 bg-black/20 rounded-xl p-4 text-center space-y-2">
                  <span className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Corporate Brand Logo</span>
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('logo')}
                    disabled={logoUploading}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    {logoUploading ? 'Uploading...' : logoUpload ? 'Change File' : 'Browse Local files'}
                  </button>
                  {logoUpload && (
                    <span className="text-[10px] text-emerald-400 block truncate font-mono">✓ Logo sync verified</span>
                  )}
                </div>

                <div className="border border-dashed border-white/10 bg-black/20 rounded-xl p-4 text-center space-y-2">
                  <span className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Requirement Brief Docs</span>
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('content')}
                    disabled={contentUploading}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    {contentUploading ? 'Uploading...' : contentUpload ? 'Change File' : 'Browse Local files'}
                  </button>
                  {contentUpload && (
                    <span className="text-[10px] text-emerald-400 block truncate font-mono">✓ Brief catalog indexed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Checkout Billing summary (5 cols) */}
            <div className="lg:col-span-5 bg-[#0F1117] border border-white/10 rounded-2xl p-6 self-start space-y-6 shadow-xl">
              <h4 className="font-extrabold text-[11px] text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2 font-mono">
                Real-Time Order Ledger
              </h4>

              <div className="space-y-3.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Selected Layout Model:</span>
                  <span className="font-bold text-white font-mono">{selectedTemplate?.name || 'Custom Build'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Category:</span>
                  <span className="font-bold text-white">{selectedCategory.replace(' Website Templates', '')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Development Tier:</span>
                  <span className="font-bold text-white font-mono">{selectedPackage}</span>
                </div>
                
                <div className="flex justify-between border-t border-white/5 pt-3 text-zinc-300 font-mono">
                  <span>Full Project Cost:</span>
                  <span className="font-extrabold text-white">₹{totalPrice}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>50% Advance Deposit Due:</span>
                  </span>
                  <span className="font-mono text-sm">₹{advanceAmount}</span>
                </div>

                <div className="flex items-start gap-1.5 text-[10px] text-zinc-500 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>The remaining balance of ₹{totalPrice - advanceAmount} is billed only upon your full staging design approval.</span>
                </div>
              </div>

              {/* Secure Payment Gateway Switcher */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Gateway Interface</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`p-2.5 border text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                      paymentMethod === 'Razorpay'
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow'
                        : 'border-white/10 bg-black/20 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Razorpay Secure
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI QR')}
                    className={`p-2.5 border text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                      paymentMethod === 'UPI QR'
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow'
                        : 'border-white/10 bg-black/20 text-zinc-400 hover:text-white'
                    }`}
                  >
                    UPI QR Code
                  </button>
                </div>
              </div>

              {/* Simulators */}
              {paymentMethod === 'UPI QR' ? (
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center space-y-3 shadow-inner">
                  <div className="w-24 h-24 bg-white rounded-lg mx-auto flex items-center justify-center border border-white/5">
                    <QrCode className="w-20 h-20 text-black" />
                  </div>
                  <span className="text-[11px] font-extrabold text-zinc-300 block font-mono">UPI DEPOSIT: ₹{advanceAmount}</span>
                  <p className="text-[9px] text-zinc-500 leading-relaxed">
                    Scan the secure sandbox code. Our automated webhook will index your transaction upon submission.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-[10px] text-zinc-500 leading-relaxed font-mono">
                  ✓ Tokenized Razorpay gateway active. Complete checkout to simulate live UPI / Credit Netbanking ledger verification.
                </div>
              )}

              <button
                type="submit"
                disabled={paymentProcessing}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow shadow-blue-500/20"
              >
                {paymentProcessing ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Approve Deposit & Pay ₹{advanceAmount}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 5: ORDER SUCCESSFUL / CONFIRMATION */}
      {step === 5 && createdOrder && (
        <div className="space-y-8 text-left">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Deployment Subscribed!</h3>
            <p className="text-xs text-zinc-400">
              Your 50% advance deposit of <span className="text-white font-bold font-mono">₹{advanceAmount}</span> has been indexed on order ID <span className="font-mono font-bold text-cyan-400 bg-white/5 border border-white/15 px-2 py-0.5 rounded">{createdOrder.orderNumber}</span>.
            </p>
          </div>

          {/* Tab Layout for Deliverables */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex border-b border-white/10 text-xs font-bold font-mono uppercase tracking-wider bg-black/20 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setNotificationTab('invoice')}
                className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
                  notificationTab === 'invoice' ? 'bg-white/10 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Invoice Receipt
              </button>
              <button
                onClick={() => setNotificationTab('whatsapp')}
                className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
                  notificationTab === 'whatsapp' ? 'bg-white/10 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                WhatsApp Alert
              </button>
              <button
                onClick={() => setNotificationTab('email')}
                className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
                  notificationTab === 'email' ? 'bg-white/10 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Confirmation Email
              </button>
            </div>

            {/* TAB CONTENT: INVOICE */}
            {notificationTab === 'invoice' && (
              <div className="bg-[#0F1117] border border-white/10 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden font-sans text-xs text-zinc-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <h4 className="text-base font-extrabold text-white tracking-widest font-mono">WEBSUCCESSGO</h4>
                    <p className="text-[10px] text-zinc-500">DIGITAL SPACE STUDIO PLATFORM</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-full font-mono uppercase">ADVANCE DEPOSIT PAID</span>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">No: {createdOrder.orderNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Billed To:</span>
                    <span className="font-extrabold text-zinc-100">{createdOrder.customerName}</span>
                    <p className="text-zinc-400 font-mono mt-0.5">{createdOrder.customerEmail} • {createdOrder.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Billing Date:</span>
                    <span className="font-bold text-zinc-100 font-mono">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex justify-between text-zinc-400">
                    <span>Layout Template model:</span>
                    <span className="font-bold text-white">{createdOrder.templateName}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Development Package Bundle:</span>
                    <span className="font-bold text-white font-mono">{createdOrder.packageName}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-white/5 pt-2 font-mono">
                    <span>Full Agreed Cost:</span>
                    <span className="text-white">₹{createdOrder.amount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400 font-mono bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                    <span>50% Deposit Paid (Advance):</span>
                    <span>₹{advanceAmount}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500 italic">
                    <span>Outstanding Balance (Pre-Live):</span>
                    <span>₹{createdOrder.amount - advanceAmount}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Powered by DSS Invoice Automation Node</span>
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    <span>Print PDF Receipt</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WHATSAPP ALERT */}
            {notificationTab === 'whatsapp' && (
              <div className="bg-[#0b141a] border border-[#202c33] rounded-xl p-5 shadow-2xl font-sans text-xs">
                {/* Whatsapp header */}
                <div className="bg-[#202c33] p-3 -mx-5 -mt-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-xs">W</div>
                  <div className="text-left">
                    <span className="font-bold text-white block">WebSuccessGo Support</span>
                    <span className="text-[10px] text-emerald-400 block font-mono">Online</span>
                  </div>
                </div>

                <div className="mt-4 max-w-[85%] bg-[#202c33] rounded-xl p-3 text-white text-left space-y-2 relative border border-[#374248]">
                  <p className="font-bold text-emerald-400 text-[10px] uppercase font-mono tracking-wider">🔒 CUSTOMER NOTIFICATION ALERT</p>
                  <p className="leading-relaxed">
                    Hello <span className="font-bold">{createdOrder.customerName}</span>, your 50% advance deposit for <span className="font-bold">{createdOrder.businessName}</span> has been processed successfully!
                  </p>
                  <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1 font-mono text-[10px]">
                    <div>⚡ ORDER ID: {createdOrder.orderNumber}</div>
                    <div>📦 PACKAGE: {createdOrder.packageName}</div>
                    <div>💳 ADVANCE RECEIVED: ₹{advanceAmount}</div>
                    <div>🟢 STATUS: Wireframe setup initiated</div>
                  </div>
                  <p className="text-[10px] text-zinc-400 pt-1">
                    Reply with any design queries. Our lead engineer will contact you in 2 hours.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EMAIL */}
            {notificationTab === 'email' && (
              <div className="bg-[#0F1117] border border-white/10 rounded-xl p-6 shadow-2xl text-left space-y-4 text-xs text-zinc-300">
                <div className="border-b border-white/5 pb-3">
                  <div className="flex justify-between font-mono text-zinc-500 text-[10px]">
                    <span>From: accounts@websuccessgo.com</span>
                    <span>Subject: Your Deployed Order Invoice</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">Dear {createdOrder.customerName},</h4>
                  <p className="leading-relaxed text-zinc-400">
                    Thank you for ordering your customized web platform on Digital Space Studio. We are incredibly excited to build your online portal.
                  </p>
                  <p className="leading-relaxed text-zinc-400">
                    Your 50% advance payment has been successfully recorded. Below is your order summary. Our developer team has already begun drafting your wireframes.
                  </p>
                  
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl font-mono text-[10px] space-y-1 text-zinc-300">
                    <div>• BUSINESS PROJECT Name: {createdOrder.businessName}</div>
                    <div>• CORRESPONDING TEMPLATE: {createdOrder.templateName}</div>
                    <div>• DEV TIERS: {createdOrder.packageName}</div>
                    <div>• DEPOSIT ACCOUNT: ₹{advanceAmount} (50% Paid)</div>
                    <div>• BALANCED RECONCILIATION: ₹{createdOrder.amount - advanceAmount}</div>
                  </div>

                  <p className="text-[11px] text-zinc-500 font-medium">
                    Best regards, <br />
                    WebSuccessGo Operations Node
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
