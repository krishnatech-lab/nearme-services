import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Plus,
  Upload,
  Settings,
  AlertTriangle,
  FolderTree,
  Calendar,
  Sparkles,
  Search,
  Eye,
  Check,
  Phone,
} from 'lucide-react';
import { WorkerProfile, Category, SiteSettings, Report, Enquiry, ServiceRequest, WorkerAvailabilityStatus } from '../types';
import { AvailabilityBadge } from './AvailabilityBadge';

interface AdminDashboardProps {
  categories: Category[];
  workers: WorkerProfile[];
  settings: SiteSettings;
  onRefreshData: () => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories: initialCategories,
  workers: initialWorkers,
  settings: initialSettings,
  onRefreshData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'workers' | 'categories' | 'requests' | 'reports' | 'csv-import' | 'settings'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [workersList, setWorkersList] = useState<WorkerProfile[]>(initialWorkers);
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings);
  const [reportsList, setReportsList] = useState<Report[]>([]);
  const [enquiriesList, setEnquiriesList] = useState<Enquiry[]>([]);
  const [serviceRequestsList, setServiceRequestsList] = useState<ServiceRequest[]>([]);

  const [searchWorker, setSearchWorker] = useState('');
  const [workerStatusFilter, setWorkerStatusFilter] = useState<'all' | 'active' | 'pending'>('all');

  // CSV Import State
  const [csvText, setCsvText] = useState(
    `name,phone,whatsapp,category,subcategory,business_name,experience,rating,locality,city,pincode\nSunil Electrician,+919876501234,+919876501234,Home Repair & Maintenance,Electrician,Sunil Electricals,8,4.9,Koramangala,Bengaluru,560034\nDeepak Plumber Works,+919876505678,+919876505678,Home Repair & Maintenance,Plumber,Deepak Sanitary,10,4.8,Indiranagar,Bengaluru,560038`
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSubcategories, setNewCatSubcategories] = useState('');

  // Settings Save State
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) setReportsList(await res.json());
    } catch {}
  };

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/enquiries');
      if (res.ok) setEnquiriesList(await res.json());
    } catch {}
  };

  const fetchServiceRequests = async () => {
    try {
      const res = await fetch('/api/service-requests');
      if (res.ok) setServiceRequestsList(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchStats();
    fetchReports();
    fetchEnquiries();
    fetchServiceRequests();
  }, []);

  const handleToggleVerify = async (worker: WorkerProfile) => {
    try {
      const res = await fetch(`/api/workers/${worker.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !worker.isVerified }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkersList(workersList.map((w) => (w.id === updated.id ? updated : w)));
        onRefreshData();
      }
    } catch {}
  };

  const handleToggleFeature = async (worker: WorkerProfile) => {
    try {
      const res = await fetch(`/api/workers/${worker.id}/feature`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !worker.isFeatured }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkersList(workersList.map((w) => (w.id === updated.id ? updated : w)));
        onRefreshData();
      }
    } catch {}
  };

  const handleApproveStatus = async (worker: WorkerProfile, newStatus: 'active' | 'rejected') => {
    try {
      const res = await fetch(`/api/workers/${worker.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkersList(workersList.map((w) => (w.id === updated.id ? updated : w)));
        onRefreshData();
      }
    } catch {}
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (!confirm('Are you sure you want to permanently delete this worker listing?')) return;
    try {
      const res = await fetch(`/api/workers/${workerId}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkersList(workersList.filter((w) => w.id !== workerId));
        onRefreshData();
      }
    } catch {}
  };

  const handleUpdateAvailability = async (workerId: string, status: WorkerAvailabilityStatus) => {
    try {
      const res = await fetch(`/api/workers/${workerId}/availability-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkersList(workersList.map((w) => (w.id === updated.id ? updated : w)));
        onRefreshData();
      }
    } catch {}
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const subs = newCatSubcategories.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          description: newCatDesc,
          subcategories: subs,
        }),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategoriesList([...categoriesList, cat]);
        setNewCatName('');
        setNewCatDesc('');
        setNewCatSubcategories('');
        onRefreshData();
      }
    } catch {}
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Delete this service category?')) return;
    try {
      const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        setCategoriesList(categoriesList.filter((c) => c.id !== catId));
        onRefreshData();
      }
    } catch {}
  };

  const handleImportCsv = async () => {
    setImportStatus('Importing CSV records...');
    try {
      const res = await fetch('/api/admin/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvText }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportStatus(`Successfully imported ${data.count} verified workers into database!`);
        onRefreshData();
        fetchStats();
      } else {
        setImportStatus(`Import error: ${data.error}`);
      }
    } catch {
      setImportStatus('Failed to upload CSV');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
        onRefreshData();
      }
    } catch {}
    setSavingSettings(false);
  };

  const filteredWorkers = workersList.filter((w) => {
    if (workerStatusFilter !== 'all' && w.status !== workerStatusFilter) return false;
    if (searchWorker.trim()) {
      const q = searchWorker.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.businessName.toLowerCase().includes(q) ||
        w.phone.includes(q) ||
        w.subcategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Super Admin Control Center</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage verified workers, registration approvals, categories, proactive requests & site settings
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: '📊 Analytics & Overview' },
          { id: 'workers', label: `👷 Workers Directory (${workersList.length})` },
          { id: 'requests', label: `💬 Job Requests (${serviceRequestsList.length})` },
          { id: 'categories', label: `🗂️ Categories (${categoriesList.length})` },
          { id: 'reports', label: `🚨 Reports & Grievances (${reportsList.length})` },
          { id: 'csv-import', label: '📥 Bulk CSV Import' },
          { id: 'settings', label: '⚙️ Brand & Site Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-xs font-bold text-blue-600 uppercase">Total Providers</p>
                <p className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">
                  {stats?.totalWorkers || workersList.length}
                </p>
                <p className="text-[11px] text-blue-700 mt-1">
                  🟢 {stats?.availableNowWorkers || workersList.filter(w => w.availabilityStatus === 'available_now').length} Available Now
                </p>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-xs font-bold text-amber-700 uppercase">Pending Approval</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                  {stats?.pendingWorkers || workersList.filter((w) => w.status === 'pending').length}
                </p>
                <p className="text-[11px] text-amber-800 mt-1">Review registrations</p>
              </div>

              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <p className="text-xs font-bold text-emerald-600 uppercase">Verified Badge</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                  {stats?.verifiedWorkers || workersList.filter((w) => w.isVerified).length}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">100% ID Verified</p>
              </div>

              <div className="p-5 bg-purple-50 border border-purple-100 rounded-2xl">
                <p className="text-xs font-bold text-purple-600 uppercase">Total Profile Views</p>
                <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-1">
                  {stats?.totalViews || 2500}+
                </p>
                <p className="text-[11px] text-purple-700 mt-1">Customer discovery visits</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="font-bold text-slate-800 text-sm mb-3">Pending Worker Registrations</h4>
                {workersList.filter((w) => w.status === 'pending').length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No registrations pending approval.</p>
                ) : (
                  <div className="space-y-2">
                    {workersList
                      .filter((w) => w.status === 'pending')
                      .map((w) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{w.name} ({w.subcategory})</p>
                            <p className="text-[10px] text-slate-500">{w.phone} • {w.locality}, {w.city}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApproveStatus(w, 'active')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveStatus(w, 'rejected')}
                              className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="font-bold text-slate-800 text-sm mb-3">Recent Customer Service Requests</h4>
                {serviceRequestsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No service requests yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {serviceRequestsList.slice(0, 5).map((sr) => (
                      <div key={sr.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-700">{sr.subcategory}</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                            {sr.quotes?.length || 0} Quotes
                          </span>
                        </div>
                        <p className="text-slate-800 font-semibold truncate mt-0.5">{sr.title}</p>
                        <p className="text-[10px] text-slate-400">By {sr.customerName} ({sr.customerPhone})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORKERS DIRECTORY TAB */}
        {activeTab === 'workers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, phone, trade..."
                  value={searchWorker}
                  onChange={(e) => setSearchWorker(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={workerStatusFilter}
                  onChange={(e) => setWorkerStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Worker / Business</th>
                    <th className="p-3">Category & Trade</th>
                    <th className="p-3">Live Status</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Verified</th>
                    <th className="p-3">Featured</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorkers.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img src={w.profileImage} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{w.name}</p>
                            <p className="text-[10px] text-slate-500">{w.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {w.subcategory}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{w.locality}, {w.city}</p>
                      </td>
                      <td className="p-3">
                        <AvailabilityBadge
                          status={w.availabilityStatus}
                          interactive
                          onStatusChange={(newSt) => handleUpdateAvailability(w.id, newSt)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{w.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({w.reviewCount})</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleVerify(w)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                            w.isVerified
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-500 hover:bg-blue-50'
                          }`}
                        >
                          {w.isVerified ? '✓ Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleFeature(w)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                            w.isFeatured
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-500 hover:bg-purple-50'
                          }`}
                        >
                          {w.isFeatured ? '★ Featured' : 'Normal'}
                        </button>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            w.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {w.status === 'pending' && (
                            <button
                              onClick={() => handleApproveStatus(w, 'active')}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Approve Listing"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteWorker(w.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Delete Worker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROACTIVE JOB REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Customer Service Requirements & Quotes</h3>
            <div className="space-y-3">
              {serviceRequestsList.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {req.subcategory}
                        </span>
                        <span className="text-slate-400">By {req.customerName} ({req.customerPhone})</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{req.title}</h4>
                      <p className="text-slate-600 mt-1">{req.description}</p>
                      <p className="text-slate-400 mt-1">📍 {req.address}, {req.locality} • Budget: {req.budget}</p>
                    </div>

                    <span className="px-2 py-1 bg-white font-bold rounded-lg border text-blue-600">
                      {req.quotes?.length || 0} Quotes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES MANAGEMENT TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Add New Service Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Solar & Green Energy)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="Subcategories (Comma separated, e.g. Solar Panel Installer, Solar Inverter Repair, Net Metering)"
                value={newCatSubcategories}
                onChange={(e) => setNewCatSubcategories(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Create Category
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoriesList.map((cat) => (
                <div key={cat.id} className="p-4 border border-slate-200 rounded-2xl bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {cat.subcategories.map((sub, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BULK CSV IMPORT TAB */}
        {activeTab === 'csv-import' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bulk Verified Worker Import</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste CSV worker records or upload worker data from local spreadsheet records.
              </p>
            </div>

            {importStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl font-semibold">
                {importStatus}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">CSV Data Format:</label>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800"
              />
            </div>

            <button
              onClick={handleImportCsv}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Import Verified Workers</span>
            </button>
          </div>
        )}

        {/* SITE SETTINGS TAB */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
            <h3 className="font-bold text-slate-900 text-base">Website Identity & Behavior</h3>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
                Settings saved successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website Brand Name</label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={siteSettings.tagline}
                onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={siteSettings.contactPhone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoApprove"
                checked={siteSettings.autoApproveWorkers}
                onChange={(e) => setSiteSettings({ ...siteSettings, autoApproveWorkers: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="autoApprove" className="text-xs font-bold text-slate-800">
                Auto-approve worker registrations immediately (Skip moderation queue)
              </label>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
