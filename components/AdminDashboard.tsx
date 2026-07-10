'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  Layers,
  Users,
  ClipboardList,
  Plus,
  Trash2,
  Edit3,
  Save,
  CheckCircle2,
  QrCode,
  FileSpreadsheet,
  Eye,
  X,
  ShieldCheck,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { Order, Template, Portfolio, Payment } from '@/lib/db';

interface AdminDashboardProps {
  orders: Order[];
  payments: Payment[];
  templates: Template[];
  portfolio: Portfolio[];
  onUpdateOrder: (id: string, fields: any) => Promise<void>;
  onAddTemplate: (fields: any) => Promise<void>;
  onEditTemplate: (id: string, fields: any) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  onAddPortfolio: (fields: any) => Promise<void>;
  onEditPortfolio: (id: string, fields: any) => Promise<void>;
  onDeletePortfolio: (id: string) => Promise<void>;
}

export default function AdminDashboard({
  orders,
  payments,
  templates,
  portfolio,
  onUpdateOrder,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onAddPortfolio,
  onEditPortfolio,
  onDeletePortfolio,
}: AdminDashboardProps) {
  const [adminTab, setAdminTab] = useState<'orders' | 'sheets' | 'templates' | 'portfolio'>('orders');

  // Managing active edit state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState({
    projectStatus: '',
    paymentStatus: '',
    developerAssigned: '',
    adminNotes: '',
    fileName: 'Design_Wireframes_Draft_V1.pdf',
    fileUrl: 'https://websuccessgo-downloads.s3.amazonaws.com/mockups.pdf',
  });

  // Template Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'Restaurant Website Templates',
    image: '',
    price: '9999',
    features: '',
    demoURL: '',
  });

  // Portfolio Modal
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    category: 'Restaurant',
    image: '',
    description: '',
    demoURL: '',
    technology: 'Next.js, Tailwind',
    deliveryTime: '7 Days',
  });

  // Computed Metrics
  const totalOrdersCount = orders.length;
  const totalRevenue = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const pendingProjectsCount = orders.filter((o) => o.projectStatus !== 'Completed').length;
  const completedProjectsCount = orders.filter((o) => o.projectStatus === 'Completed').length;

  const handleEditOrderClick = (order: Order) => {
    setEditingOrderId(order.id);
    setEditedFields({
      projectStatus: order.projectStatus,
      paymentStatus: order.paymentStatus,
      developerAssigned: order.developerAssigned || '',
      adminNotes: order.adminNotes || '',
      fileName: 'Project_Assets_Bundle.zip',
      fileUrl: 'https://websuccessgo-downloads.s3.amazonaws.com/bundle.zip',
    });
  };

  const handleSaveOrderEdit = async (orderId: string) => {
    const payload: any = {
      projectStatus: editedFields.projectStatus,
      paymentStatus: editedFields.paymentStatus,
      developerAssigned: editedFields.developerAssigned,
      adminNotes: editedFields.adminNotes,
    };
    await onUpdateOrder(orderId, payload);
    setEditingOrderId(null);
  };

  const handleUploadDeliverable = async (orderId: string) => {
    const payload = {
      uploadedFile: {
        name: editedFields.fileName,
        url: editedFields.fileUrl,
      },
    };
    await onUpdateOrder(orderId, payload);
    const current = orders.find((o) => o.id === orderId);
    if (current) {
      handleEditOrderClick(current);
    }
  };

  // Template CRUD
  const handleOpenAddTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm({
      name: '',
      category: 'Restaurant Website Templates',
      image: '',
      price: '9999',
      features: 'SEO Optimized, Contact Form, WhatsApp Integration',
      demoURL: '',
    });
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (tpl: Template) => {
    setEditingTemplateId(tpl.id);
    setTemplateForm({
      name: tpl.name,
      category: tpl.category,
      image: tpl.image,
      price: String(tpl.price),
      features: tpl.features.join(', '),
      demoURL: tpl.demoURL,
    });
    setShowTemplateModal(true);
  };

  const handleTemplateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: templateForm.name,
      category: templateForm.category,
      image: templateForm.image,
      price: Number(templateForm.price),
      features: templateForm.features.split(',').map((f) => f.trim()),
      demoURL: templateForm.demoURL,
    };

    if (editingTemplateId) {
      await onEditTemplate(editingTemplateId, payload);
    } else {
      await onAddTemplate(payload);
    }
    setShowTemplateModal(false);
  };

  // Portfolio CRUD
  const handleOpenAddPortfolio = () => {
    setEditingPortfolioId(null);
    setPortfolioForm({
      title: '',
      category: 'Restaurant',
      image: '',
      description: '',
      demoURL: '',
      technology: 'Next.js, Tailwind',
      deliveryTime: '7 Days',
    });
    setShowPortfolioModal(true);
  };

  const handleOpenEditPortfolio = (item: Portfolio) => {
    setEditingPortfolioId(item.id);
    setPortfolioForm({
      title: item.title,
      category: item.category,
      image: item.image,
      description: item.description,
      demoURL: item.demoURL,
      technology: item.technology,
      deliveryTime: item.deliveryTime,
    });
    setShowPortfolioModal(true);
  };

  const handlePortfolioFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPortfolioId) {
      await onEditPortfolio(editingPortfolioId, portfolioForm);
    } else {
      await onAddPortfolio(portfolioForm);
    }
    setShowPortfolioModal(false);
  };

  return (
    <div className="space-y-8 text-white">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-blue-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> ROOT ADMINISTRATIVE ACCESS
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">DSS Control Console</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOpenAddTemplate}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Template</span>
          </button>
          <button
            onClick={handleOpenAddPortfolio}
            className="px-4 py-2 bg-[#151820] hover:bg-[#1b1f2b] border border-white/10 text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Portfolio Case</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#151820] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Total Leads</span>
            <span className="text-xl font-extrabold text-white font-mono">{totalOrdersCount}</span>
          </div>
          <ClipboardList className="w-5 h-5 text-blue-400" />
        </div>

        <div className="bg-[#151820] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Total Revenue</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">₹{totalRevenue}</span>
          </div>
          <DollarSign className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="bg-[#151820] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Active Builds</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">{pendingProjectsCount}</span>
          </div>
          <Layers className="w-5 h-5 text-amber-400" />
        </div>

        <div className="bg-[#151820] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Completed Projects</span>
            <span className="text-xl font-extrabold text-cyan-400 font-mono">{completedProjectsCount}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#151820] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Google Sheets</span>
            <span className="text-xs font-black text-emerald-500 font-mono uppercase">SYNCING ACTIVE</span>
          </div>
          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/10 text-xs font-bold font-mono uppercase tracking-wider bg-black/20 p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setAdminTab('orders')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
            adminTab === 'orders' ? 'bg-white/10 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Orders Pipeline ({orders.length})
        </button>
        <button
          onClick={() => setAdminTab('sheets')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
            adminTab === 'sheets' ? 'bg-white/10 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Google Sheet Logs
        </button>
        <button
          onClick={() => setAdminTab('templates')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
            adminTab === 'templates' ? 'bg-white/10 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Manage Templates ({templates.length})
        </button>
        <button
          onClick={() => setAdminTab('portfolio')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
            adminTab === 'portfolio' ? 'bg-white/10 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Manage Portfolio ({portfolio.length})
        </button>
      </div>

      {/* VIEW: ACTIVE ORDERS */}
      {adminTab === 'orders' && (
        <div className="space-y-6 text-left">
          <div className="overflow-hidden bg-[#151820] border border-white/10 rounded-xl shadow-xl text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-white/5 text-zinc-500 font-black font-mono uppercase text-[9px] tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer Project</th>
                    <th className="p-4">Package</th>
                    <th className="p-4">Project Pipeline</th>
                    <th className="p-4">Deposit Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {orders.map((order) => {
                    const isEditing = editingOrderId === order.id;
                    return (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-white/2s transition-all">
                          <td className="p-4 font-mono font-bold text-blue-400">{order.orderNumber}</td>
                          <td className="p-4">
                            <span className="font-extrabold text-white block">{order.customerName}</span>
                            <span className="text-[10px] text-zinc-500 block font-mono">{order.businessName}</span>
                          </td>
                          <td className="p-4 font-mono text-zinc-200">
                            {order.package}
                            <span className="block text-[10px] text-cyan-400">₹{order.amount}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold font-mono uppercase">
                              {order.projectStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono uppercase">
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleEditOrderClick(order)}
                              className="px-3 py-1.5 bg-[#0F1117] hover:bg-black border border-white/15 text-zinc-200 hover:text-white rounded-lg font-bold font-mono text-[10px] transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Panel */}
                        {isEditing && (
                          <tr className="bg-black/30">
                            <td colSpan={6} className="p-6">
                              <div className="bg-[#151820] border border-white/15 rounded-xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left form updates */}
                                <div className="space-y-4">
                                  <h4 className="font-black text-xs text-white uppercase tracking-wider border-b border-white/5 pb-2 font-mono text-blue-400">
                                    Pipeline State Controller
                                  </h4>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Project Status</label>
                                      <select
                                        value={editedFields.projectStatus}
                                        onChange={(e) => setEditedFields({ ...editedFields, projectStatus: e.target.value })}
                                        className="w-full p-2 bg-[#0F1117] border border-white/10 rounded-lg text-xs text-white"
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Payment Received">Payment Received</option>
                                        <option value="Requirement Received">Requirement Received</option>
                                        <option value="Design Started">Design Started</option>
                                        <option value="Development Started">Development Started</option>
                                        <option value="Staging Approval Pending">Staging Approval Pending</option>
                                        <option value="Completed">Completed</option>
                                      </select>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Payment Status</label>
                                      <select
                                        value={editedFields.paymentStatus}
                                        onChange={(e) => setEditedFields({ ...editedFields, paymentStatus: e.target.value })}
                                        className="w-full p-2 bg-[#0F1117] border border-white/10 rounded-lg text-xs text-white"
                                      >
                                        <option value="Advance Paid (50%)">Advance Paid (50%)</option>
                                        <option value="Fully Paid (100%)">Fully Paid (100%)</option>
                                        <option value="Refunded">Refunded</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Assign Architect</label>
                                    <input
                                      type="text"
                                      value={editedFields.developerAssigned}
                                      onChange={(e) => setEditedFields({ ...editedFields, developerAssigned: e.target.value })}
                                      placeholder="e.g., Senior Node Engineer"
                                      className="w-full p-2 bg-[#0F1117] border border-white/10 rounded-lg text-xs text-white"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Admin Log Notes</label>
                                    <textarea
                                      value={editedFields.adminNotes}
                                      onChange={(e) => setEditedFields({ ...editedFields, adminNotes: e.target.value })}
                                      placeholder="Provide internal instructions or sprint benchmarks..."
                                      rows={3}
                                      className="w-full p-2 bg-[#0F1117] border border-white/10 rounded-lg text-xs text-white"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSaveOrderEdit(order.id)}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Commit Pipeline Status</span>
                                    </button>
                                    <button
                                      onClick={() => setEditingOrderId(null)}
                                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold rounded-lg cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>

                                {/* Right deliverables uploads */}
                                <div className="space-y-4">
                                  <h4 className="font-black text-xs text-white uppercase tracking-wider border-b border-white/5 pb-2 font-mono text-cyan-400">
                                    Deliverables Repository
                                  </h4>

                                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                                    <p className="text-[10px] text-zinc-400 font-mono">
                                      Upload high fidelity wireframes, dynamic staging preview containers, or exported code builds directly to this project ledger.
                                    </p>

                                    <div className="space-y-2">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-zinc-500 block uppercase font-mono">Deliverable Label</label>
                                        <input
                                          type="text"
                                          value={editedFields.fileName}
                                          onChange={(e) => setEditedFields({ ...editedFields, fileName: e.target.value })}
                                          className="w-full p-1.5 bg-[#0F1117] border border-white/10 rounded text-[10px] text-white"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-zinc-500 block uppercase font-mono">Simulated Delivery URL</label>
                                        <input
                                          type="text"
                                          value={editedFields.fileUrl}
                                          onChange={(e) => setEditedFields({ ...editedFields, fileUrl: e.target.value })}
                                          className="w-full p-1.5 bg-[#0F1117] border border-white/10 rounded text-[10px] text-white"
                                        />
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleUploadDeliverable(order.id)}
                                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                                    >
                                      <span>Index New Staging Deliverable</span>
                                    </button>
                                  </div>

                                  {order.uploadedFile && (
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                                      <div className="truncate">
                                        <span className="text-[9px] font-black text-zinc-500 block font-mono">INDEXED FILE</span>
                                        <span className="text-[10px] text-zinc-300 font-mono truncate block">{order.uploadedFile.name}</span>
                                      </div>
                                      <a
                                        href={order.uploadedFile.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-bold text-blue-400 font-mono"
                                      >
                                        Download
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: GOOGLE SHEET SYNC LOGS */}
      {adminTab === 'sheets' && (
        <div className="space-y-6 text-left">
          <div className="p-6 bg-[#151820] border border-white/10 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">REAL-TIME WEBHOOK INTEGRATION</span>
                <h3 className="text-lg font-extrabold text-white leading-tight mt-0.5">Google Sheets Enterprise Sync Log</h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-bold rounded-full font-mono">● LIVE CONNECTIONS</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Every checkout submission, payment milestone, and project pipeline state update is securely streamed to the client&rsquo;s Google Sheet dashboard via our Google App Script webhooks.
            </p>

            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/40 p-4 font-mono text-[10px] text-zinc-500 space-y-2 leading-relaxed">
              <div className="text-emerald-400">[{new Date().toISOString()}] Webhook node initialized. SSL handshake completed.</div>
              <div className="text-zinc-400">[{new Date().toISOString()}] Streaming {orders.length} order rows to sheets API.</div>
              <div className="text-zinc-500">[{new Date().toISOString()}] payload mapping: [OrderNum, CustomerName, BusinessTitle, PackageDetails, RevenueMetric]</div>
              <div className="text-cyan-400">[{new Date().toISOString()}] sheet synchronization completed. 0 synchronization failures.</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TEMPLATE CRUD LISTING */}
      {adminTab === 'templates' && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-white text-sm">Active Marketplace Baseline Models</h3>
            <button
              onClick={handleOpenAddTemplate}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-[#151820] border border-white/10 rounded-xl overflow-hidden shadow-md flex flex-col justify-between"
              >
                <div className="relative h-36 bg-black/40">
                  <img src={tpl.image || 'https://picsum.photos/400/300'} alt={tpl.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-black/80 px-2.5 py-0.5 border border-white/10 text-white rounded-full text-[9px] font-bold uppercase">
                    {tpl.category.replace(' Website Templates', '')}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-sm text-white block truncate">{tpl.name}</span>
                    <span className="font-mono text-xs text-cyan-400 font-bold shrink-0">₹{tpl.price}</span>
                  </div>

                  <div className="flex gap-2.5 pt-3 border-t border-white/5 justify-end">
                    <button
                      onClick={() => handleOpenEditTemplate(tpl)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-bold rounded-lg border border-white/5 cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-blue-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/10 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PORTFOLIO CRUD LISTING */}
      {adminTab === 'portfolio' && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-white text-sm">Deployed Portfolio Master Catalog</h3>
            <button
              onClick={handleOpenAddPortfolio}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Portfolio Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolio.map((item) => (
              <div
                key={item.id}
                className="bg-[#151820] border border-white/10 rounded-xl overflow-hidden shadow-md flex flex-col justify-between"
              >
                <div className="relative h-36 bg-black/40">
                  <img src={item.image || 'https://picsum.photos/400/300'} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-black/80 px-2.5 py-0.5 border border-white/10 text-white rounded-full text-[9px] font-bold uppercase">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-sm text-white block truncate">{item.title}</span>
                    <span className="font-mono text-[10px] text-cyan-400 font-bold shrink-0">{item.deliveryTime}</span>
                  </div>

                  <div className="flex gap-2.5 pt-3 border-t border-white/5 justify-end">
                    <button
                      onClick={() => handleOpenEditPortfolio(item)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-bold rounded-lg border border-white/5 cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-blue-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeletePortfolio(item.id)}
                      className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/10 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: TEMPLATE FORM */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151820] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-widest font-mono">
                {editingTemplateId ? 'Edit Blueprint Schema' : 'Deploy New Baseline design'}
              </h4>
              <button onClick={() => setShowTemplateModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTemplateFormSubmit} className="space-y-4 text-xs text-zinc-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Design Title *</label>
                <input
                  type="text"
                  required
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="e.g., Bella Italia Deluxe"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Target Category *</label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                >
                  <option value="Restaurant Website Templates">Restaurant</option>
                  <option value="Clinic Website Templates">Clinic</option>
                  <option value="Law Firm Website Templates">Law Firm</option>
                  <option value="Salon Website Templates">Salon</option>
                  <option value="E-commerce Website Templates">E-commerce</option>
                  <option value="Startup Website Templates">Startup</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Agreed Rate (INR) *</label>
                  <input
                    type="number"
                    required
                    value={templateForm.price}
                    onChange={(e) => setTemplateForm({ ...templateForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Inspect Demo URL</label>
                  <input
                    type="text"
                    value={templateForm.demoURL}
                    onChange={(e) => setTemplateForm({ ...templateForm, demoURL: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Thumbnail Asset URL</label>
                <input
                  type="text"
                  value={templateForm.image}
                  onChange={(e) => setTemplateForm({ ...templateForm, image: e.target.value })}
                  placeholder="https://picsum.photos/..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Key Features (Comma-Separated) *</label>
                <input
                  type="text"
                  required
                  value={templateForm.features}
                  onChange={(e) => setTemplateForm({ ...templateForm, features: e.target.value })}
                  placeholder="e.g., Live Sync, Dark Mode, Webhook Logs"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer font-mono"
              >
                Deploy Template model
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PORTFOLIO FORM */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151820] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-widest font-mono">
                {editingPortfolioId ? 'Edit Portfolio Case' : 'Add Case Study'}
              </h4>
              <button onClick={() => setShowPortfolioModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePortfolioFormSubmit} className="space-y-4 text-xs text-zinc-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Case Title *</label>
                <input
                  type="text"
                  required
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  placeholder="e.g., Apex Dental Studio"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Industry Category *</label>
                <select
                  value={portfolioForm.category}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Law Firm">Law Firm</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Startup">Startup</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Delivery Lead *</label>
                  <input
                    type="text"
                    required
                    value={portfolioForm.deliveryTime}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, deliveryTime: e.target.value })}
                    placeholder="e.g., 7 Days"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Staged Demo URL</label>
                  <input
                    type="text"
                    value={portfolioForm.demoURL}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, demoURL: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Mock Image Asset</label>
                <input
                  type="text"
                  value={portfolioForm.image}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, image: e.target.value })}
                  placeholder="https://picsum.photos/..."
                  className="w-full px-3.5 py-2.5 bg-[#0F1117] border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Technologies *</label>
                <input
                  type="text"
                  required
                  value={portfolioForm.technology}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, technology: e.target.value })}
                  placeholder="e.g., Next.js, Tailwind, SQLite"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Project Summary Brief *</label>
                <textarea
                  rows={3}
                  required
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  placeholder="Case objectives and delivered benchmarks..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer font-mono"
              >
                Commit Case study
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
