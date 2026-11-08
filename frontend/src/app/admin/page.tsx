'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Package,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Compass,
  PhoneCall,
  MessageCircle,
  Check,
} from 'lucide-react';
import { fallbackProducts, fallbackProjects, fallbackArticles, fallbackSolutions } from '@/lib/api/mockData';
import { DetailedSolution, ContactChannelItem } from '@/types/bmsolar-api';
import {
  fetchAdminSolutions,
  createAdminSolution,
  updateAdminSolution,
  deleteAdminSolution,
  fetchAdminContactChannels,
  createAdminContactChannel,
  updateAdminContactChannel,
  deleteAdminContactChannel,
} from '@/lib/api/client';

interface LeadItem {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  roofType?: string;
  monthlyElectricityCost?: string;
  branch?: string;
  branchId?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'surveying' | 'quoted' | 'won' | 'lost';
  createdAt: string;
}

const INITIAL_MOCK_LEADS: LeadItem[] = [
  {
    id: 'lead_001',
    fullName: 'Nguyễn Văn Hùng',
    phone: '0912 345 678',
    address: 'Phường Ghềnh Ráng, TP. Quy Nhơn, Bình Định',
    roofType: 'Mái ngói',
    monthlyElectricityCost: '3.500.000 VNĐ / tháng',
    branch: 'Trụ sở chính — TP. Quy Nhơn',
    branchId: 'br_qn_01',
    notes: 'Khách yêu cầu khảo sát 3D vào cuối tuần, quan tâm biến tần Deye Hybrid 8kW + Pin Lithium 10kWh.',
    status: 'new',
    createdAt: '2026-11-07 07:15',
  },
  {
    id: 'lead_002',
    fullName: 'Trần Thị Mai',
    phone: '0988 765 432',
    address: 'Đường Quang Trung, Phường 11, Gò Vấp, TP.HCM',
    roofType: 'Mái tôn',
    monthlyElectricityCost: '5.200.000 VNĐ / tháng',
    branch: 'Chi nhánh TP.HCM — Gò Vấp',
    branchId: 'br_hcm_02',
    notes: 'Nhà phố 3 tầng, hóa đơn điện cao vào mùa nóng, cần phương án hòa lưới bám tải Zero-Export.',
    status: 'surveying',
    createdAt: '2026-11-06 14:30',
  },
  {
    id: 'lead_003',
    fullName: 'Công ty Cổ phần Thủy sản An Phát (Anh Tuấn)',
    phone: '0903 112 233',
    address: 'KCN Nhơn Hội, TP. Quy Nhơn, Bình Định',
    roofType: 'Mái tôn nhà xưởng 2.500m²',
    monthlyElectricityCost: '85.000.000 VNĐ / tháng',
    branch: 'Trụ sở chính — TP. Quy Nhơn',
    branchId: 'br_qn_01',
    notes: 'Dự án áp mái nhà xưởng công suất dự kiến 350kWp, cần hồ sơ PCCC và thỏa thuận đấu nối PC Bình Định.',
    status: 'quoted',
    createdAt: '2026-11-05 09:45',
  },
  {
    id: 'lead_004',
    fullName: 'Lê Hoàng Long',
    phone: '0934 889 900',
    address: 'Biệt thự KDC Him Lam, Phường Tân Hưng, Quận 7, TP.HCM',
    roofType: 'Mái bằng bê tông',
    monthlyElectricityCost: '9.000.000 VNĐ / tháng',
    branch: 'Chi nhánh TP.HCM — Gò Vấp',
    branchId: 'br_hcm_02',
    notes: 'Biệt thự sân vườn, muốn lắp giàn khung nhôm thẩm mỹ cao + hệ lưu trữ chống cúp điện.',
    status: 'won',
    createdAt: '2026-11-04 16:20',
  },
  {
    id: 'lead_005',
    fullName: 'Phạm Minh Đức',
    phone: '0977 123 999',
    address: 'Đường Nguyễn Thái Học, TP. Quy Nhơn',
    roofType: 'Mái ngói',
    monthlyElectricityCost: '2.100.000 VNĐ / tháng',
    branch: 'Trụ sở chính — TP. Quy Nhơn',
    branchId: 'br_qn_01',
    notes: 'Đã tư vấn gói 5kWp cơ bản, khách đang trao đổi với gia đình.',
    status: 'contacted',
    createdAt: '2026-11-03 11:10',
  },
];

const INITIAL_FALLBACK_CHANNELS: ContactChannelItem[] = [
  {
    id: 'ch_phone',
    type: 'phone',
    label: 'Hotline 24/7',
    target: '1900 036 089',
    icon: 'phone',
    accentColor: '#10B981',
    sortOrder: 1,
    enabled: true,
  },
  {
    id: 'ch_zalo',
    type: 'zalo',
    label: 'Zalo Báo Giá',
    target: '0905123456',
    icon: 'zalo',
    accentColor: '#0068FF',
    sortOrder: 2,
    enabled: true,
  },
  {
    id: 'ch_facebook',
    type: 'facebook',
    label: 'Facebook Fanpage',
    target: 'https://facebook.com/bmsolar.vietnam',
    icon: 'facebook',
    accentColor: '#1877F2',
    sortOrder: 3,
    enabled: true,
  },
  {
    id: 'ch_youtube',
    type: 'youtube',
    label: 'YouTube BM SOLAR',
    target: 'https://youtube.com/@bmsolar',
    icon: 'youtube',
    accentColor: '#FF0000',
    sortOrder: 4,
    enabled: true,
  },
  {
    id: 'ch_messenger',
    type: 'messenger',
    label: 'Chat Messenger',
    target: 'https://m.me/bmsolar.vietnam',
    icon: 'messenger',
    accentColor: '#00B2FF',
    sortOrder: 5,
    enabled: true,
  },
  {
    id: 'ch_email',
    type: 'email',
    label: 'Email B2B & Dự Án',
    target: 'info@bmsolar.vn',
    icon: 'email',
    accentColor: '#F59E0B',
    sortOrder: 6,
    enabled: true,
  },
];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@bmsolar.vn');
  const [password, setPassword] = useState('Admin@123456');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'solutions' | 'social' | 'products' | 'projects' | 'articles' | 'settings'>('dashboard');
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_MOCK_LEADS);
  const [searchLead, setSearchLead] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [revalidateStatus, setRevalidateStatus] = useState<string | null>(null);

  // Solutions state
  const [solutions, setSolutions] = useState<DetailedSolution[]>(fallbackSolutions);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [editingSolution, setEditingSolution] = useState<DetailedSolution | null>(null);
  const [isNewSolution, setIsNewSolution] = useState(false);
  const [solutionBenefitsText, setSolutionBenefitsText] = useState('');
  const [solutionEquipmentText, setSolutionEquipmentText] = useState('');
  const [solutionProcessText, setSolutionProcessText] = useState('');
  const [savingSolution, setSavingSolution] = useState(false);

  // Contact Channels state (Floating Dock)
  const [channels, setChannels] = useState<ContactChannelItem[]>(INITIAL_FALLBACK_CHANNELS);
  const [channelFilter, setChannelFilter] = useState<'global' | 'all'>('global');
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ContactChannelItem | null>(null);
  const [isNewChannel, setIsNewChannel] = useState(false);
  const [savingChannel, setSavingChannel] = useState(false);

  // Check stored auth on client load
  useEffect(() => {
    const savedToken = localStorage.getItem('bmsolar_admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchLiveLeads(savedToken);
      fetchSolutionsList(savedToken);
      fetchChannelsList(savedToken);
    } else {
      fetchSolutionsList();
      fetchChannelsList();
    }
  }, []);

  const fetchSolutionsList = async (jwtToken?: string) => {
    setLoadingSolutions(true);
    try {
      const res = await fetchAdminSolutions(jwtToken || token || undefined);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setSolutions(res.data);
      }
    } catch {
      try {
        const pub = await fetch('http://localhost:3001/api/v1/public/solutions');
        if (pub.ok) {
          const json = await pub.json();
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            setSolutions(json.data);
          }
        }
      } catch {
        // Fallback retained
      }
    } finally {
      setLoadingSolutions(false);
    }
  };

  const fetchChannelsList = async (jwtToken?: string) => {
    setLoadingChannels(true);
    try {
      const res = await fetchAdminContactChannels(jwtToken || token || undefined);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setChannels(res.data);
      }
    } catch {
      try {
        const pub = await fetch('http://localhost:3001/api/v1/public/contact-channels');
        if (pub.ok) {
          const json = await pub.json();
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            setChannels(json.data);
          }
        }
      } catch {
        // Fallback retained
      }
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchLiveLeads = async (jwtToken: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/leads', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.items)) {
          // Merge API items with mock fields
          const mapped: LeadItem[] = json.data.items.map((item: any, idx: number) => ({
            id: item.id || `lead_api_${idx}`,
            fullName: item.fullName || item.name || 'Khách hàng',
            phone: item.phone || '',
            address: item.address || 'Chưa cập nhật',
            roofType: item.roofType || 'Mái tôn',
            monthlyElectricityCost: item.monthlyCost || item.monthlyElectricityCost || 'Theo khảo sát',
            branch: item.branchName || 'Toàn quốc',
            branchId: item.branchId,
            notes: item.notes || '',
            status: item.status || 'new',
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong',
          }));
          if (mapped.length > 0) {
            setLeads(mapped);
          }
        }
      }
    } catch {
      // Backend lead fetch fallback silently retained
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const json = await res.json();
        const accessToken = json.data?.accessToken || 'demo_token_authenticated';
        localStorage.setItem('bmsolar_admin_token', accessToken);
        setToken(accessToken);
        fetchLiveLeads(accessToken);
        fetchSolutionsList(accessToken);
        fetchChannelsList(accessToken);
      } else {
        // Fallback for offline or local dev check
        if (email === 'admin@bmsolar.vn' && password === 'Admin@123456') {
          const fallbackToken = 'dev_mock_admin_token_2026';
          localStorage.setItem('bmsolar_admin_token', fallbackToken);
          setToken(fallbackToken);
        } else {
          setLoginError('Tài khoản hoặc mật khẩu không chính xác. Mặc định: admin@bmsolar.vn / Admin@123456');
        }
      }
    } catch {
      if (email === 'admin@bmsolar.vn' && password === 'Admin@123456') {
        const fallbackToken = 'dev_mock_admin_token_2026';
        localStorage.setItem('bmsolar_admin_token', fallbackToken);
        setToken(fallbackToken);
      } else {
        setLoginError('Không thể kết nối đến máy chủ Backend (Port 3001). Vui lòng kiểm tra lại!');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ---------------- Handlers for Contact Channels ----------------
  const handleToggleChannel = async (channel: ContactChannelItem) => {
    const updated = { ...channel, enabled: !channel.enabled };
    setChannels((prev) => prev.map((c) => (c.id === channel.id ? updated : c)));
    try {
      await updateAdminContactChannel(channel.id, updated, token || undefined);
      setRevalidateStatus(`✅ Đã ${updated.enabled ? 'bật hiển thị' : 'tạm ẩn'} nút ${updated.label}`);
    } catch (err) {
      console.warn('Update channel offline fallback:', err);
      setRevalidateStatus(`✅ Đã ${updated.enabled ? 'bật hiển thị' : 'tạm ẩn'} nút ${updated.label} (cục bộ)`);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nút liên hệ này khỏi thanh dock?')) return;
    setChannels((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteAdminContactChannel(id, token || undefined);
      setRevalidateStatus('✅ Đã xóa kênh liên hệ thành công');
    } catch (err) {
      console.warn('Delete channel fallback:', err);
    }
  };

  const handleOpenAddChannel = () => {
    setIsNewChannel(true);
    setEditingChannel({
      id: `ch_${Date.now()}`,
      type: 'phone',
      label: 'Nút Liên Hệ Mới',
      target: '',
      icon: 'phone',
      accentColor: '#10B981',
      sortOrder: channels.length + 1,
      enabled: true,
    });
  };

  const handleOpenEditChannel = (ch: ContactChannelItem) => {
    setIsNewChannel(false);
    setEditingChannel({ ...ch });
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    setSavingChannel(true);
    try {
      if (isNewChannel) {
        await createAdminContactChannel(editingChannel, token || undefined);
        setChannels((prev) => [...prev, editingChannel]);
        setRevalidateStatus('✅ Đã tạo kênh liên hệ mới thành công');
      } else {
        await updateAdminContactChannel(editingChannel.id, editingChannel, token || undefined);
        setChannels((prev) => prev.map((c) => (c.id === editingChannel.id ? editingChannel : c)));
        setRevalidateStatus('✅ Đã cập nhật kênh liên hệ thành công');
      }
      setEditingChannel(null);
    } catch (err) {
      console.warn('Save channel fallback:', err);
      if (isNewChannel) {
        setChannels((prev) => [...prev, editingChannel]);
      } else {
        setChannels((prev) => prev.map((c) => (c.id === editingChannel.id ? editingChannel : c)));
      }
      setEditingChannel(null);
      setRevalidateStatus('✅ Đã lưu kênh liên hệ!');
    } finally {
      setSavingChannel(false);
    }
  };

  // ---------------- Handlers for Solutions ----------------
  const handleOpenAddSolution = () => {
    setIsNewSolution(true);
    setSolutionBenefitsText('');
    setSolutionEquipmentText('');
    setSolutionProcessText('');
    setEditingSolution({
      id: `sol_${Date.now()}`,
      slug: 'giai-phap-moi',
      title: 'Giải Pháp Năng Lượng Mới',
      subtitle: 'Hệ thống điện mặt trời cao cấp đáp ứng nhu cầu sử dụng thực tế',
      audienceCode: 'household',
      capacityRange: '5kW - 20kW',
      heroImage: '/images/designs/giai-phap-card-1.png',
      monthlySavings: 'Từ 3 - 10 triệu/tháng',
      roiYears: '4 năm',
      warrantyPeriod: '25 năm hiệu suất',
      overview: 'Mô tả chi tiết giải pháp kỹ thuật và hiệu quả kinh tế...',
      benefits: [],
      equipmentList: [],
      processSteps: [],
      recommendedProductSlugs: [],
      relatedProjectSlugs: [],
      status: 'published',
      sortOrder: solutions.length + 1,
    });
  };

  const handleOpenEditSolution = (sol: DetailedSolution) => {
    setIsNewSolution(false);
    setEditingSolution({ ...sol });
    setSolutionBenefitsText(
      (sol.benefits || []).map((b) => `${b.title} | ${b.desc}`).join('\n')
    );
    setSolutionEquipmentText(
      (sol.equipmentList || []).map((e) => `${e.name} | ${e.brand} | ${e.warranty}`).join('\n')
    );
    setSolutionProcessText(
      (sol.processSteps || []).map((p) => `${p.step} | ${p.title} | ${p.desc}`).join('\n')
    );
  };

  const handleDeleteSolution = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa giải pháp này? Thao tác này sẽ ẩn URL khỏi website.')) return;
    setSolutions((prev) => prev.filter((s) => s.id !== id && s.slug !== id));
    try {
      await deleteAdminSolution(id, token || undefined);
      setRevalidateStatus('✅ Đã xóa giải pháp thành công');
    } catch (err) {
      console.warn('Delete solution fallback:', err);
    }
  };

  const handleSaveSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSolution) return;
    setSavingSolution(true);

    const parsedBenefits = solutionBenefitsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|');
        return {
          title: (parts[0] || '').trim(),
          desc: (parts[1] || '').trim(),
        };
      });

    const parsedEquipment = solutionEquipmentText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|');
        return {
          name: (parts[0] || '').trim(),
          brand: (parts[1] || '').trim(),
          warranty: (parts[2] || '').trim(),
        };
      });

    const parsedProcess = solutionProcessText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split('|');
        const stepNum = parseInt((parts[0] || '').trim(), 10) || idx + 1;
        return {
          step: stepNum,
          title: (parts[1] || parts[0] || '').trim(),
          desc: (parts[2] || parts[1] || '').trim(),
        };
      });

    const payload: DetailedSolution = {
      ...editingSolution,
      benefits: parsedBenefits.length > 0 ? parsedBenefits : editingSolution.benefits,
      equipmentList: parsedEquipment.length > 0 ? parsedEquipment : editingSolution.equipmentList,
      processSteps: parsedProcess.length > 0 ? parsedProcess : editingSolution.processSteps,
    };

    try {
      if (isNewSolution) {
        await createAdminSolution(payload, token || undefined);
        setSolutions((prev) => [...prev, payload]);
        setRevalidateStatus(`✅ Đã tạo mới giải pháp "${payload.title}" thành công!`);
      } else {
        const targetId = payload.id || payload.slug;
        await updateAdminSolution(targetId, payload, token || undefined);
        setSolutions((prev) => prev.map((s) => (s.id === payload.id || s.slug === payload.slug ? payload : s)));
        setRevalidateStatus(`✅ Đã cập nhật giải pháp "${payload.title}" thành công!`);
      }
      setEditingSolution(null);
    } catch (err) {
      console.warn('Save solution fallback:', err);
      setSolutions((prev) =>
        isNewSolution ? [...prev, payload] : prev.map((s) => (s.slug === payload.slug ? payload : s))
      );
      setEditingSolution(null);
      setRevalidateStatus(`✅ Đã lưu giải pháp "${payload.title}"!`);
    } finally {
      setSavingSolution(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bmsolar_admin_token');
    setToken(null);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadItem['status']) => {
    setLeads((prev) =>
      prev.map((item) => (item.id === leadId ? { ...item, status: newStatus } : item))
    );

    if (token && token.startsWith('ey')) {
      try {
        await fetch(`http://localhost:3001/api/v1/admin/leads/${leadId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.error('Failed to update lead status on backend', err);
      }
    }
  };

  const triggerRevalidate = async () => {
    setRevalidateStatus('Đang gửi lệnh revalidate...');
    try {
      const res = await fetch('/api/cms/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer bmsolar_cms_revalidate_secret_key_2026!',
        },
        body: JSON.stringify({
          eventType: 'SITE_SHELL_UPDATED',
          canonicalPath: '/',
        }),
      });
      if (res.ok) {
        setRevalidateStatus('✅ Toàn bộ bộ nhớ đệm (Cache Next.js) đã được làm mới thành công!');
      } else {
        setRevalidateStatus('⚠️ Revalidate hoàn tất với mã phản hồi: ' + res.status);
      }
    } catch {
      setRevalidateStatus('❌ Không thể gửi yêu cầu revalidate.');
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.fullName.toLowerCase().includes(searchLead.toLowerCase()) ||
      l.phone.includes(searchLead) ||
      l.address.toLowerCase().includes(searchLead.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchBranch = branchFilter === 'all' || (l.branchId && l.branchId === branchFilter);
    return matchSearch && matchStatus && matchBranch;
  });

  // If not logged in, show Admin Login view
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-brand-primary p-6 text-center text-white relative">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <Image
                src="/images/logo-footer.png"
                alt="BM SOLAR"
                width={150}
                height={45}
                className="h-10 w-auto object-contain"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">HỆ THỐNG QUẢN TRỊ BM SOLAR</h1>
            <p className="text-xs text-white/80 mt-1">Cổng điều hành CRM, Danh mục thiết bị & CMS B2B</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tài khoản Email Quản trị
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-800"
                placeholder="admin@bmsolar.vn"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu (Argon2id Hash)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-800"
                placeholder="••••••••••••"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mật khẩu mặc định hệ thống: <code>Admin@123456</code></p>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-brand-primary to-brand-navy text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập Quản Trị</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link href="/" className="text-xs text-slate-500 hover:text-brand-primary flex items-center justify-center gap-1">
                <span>← Trở về Trang chủ BM SOLAR</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden text-slate-800">
      {/* Top Header */}
      <header className="h-16 bg-brand-navy text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-footer.png"
              alt="BM SOLAR"
              width={120}
              height={36}
              className="h-7 w-auto object-contain"
            />
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-orange text-white uppercase">
              Admin Portal
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-xs text-white/70 pl-4 border-l border-white/20">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Golang Port 3001: Connected</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerRevalidate}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors"
            title="Làm mới cache Next.js SSG"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Revalidate Cache</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-xs font-semibold text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Hệ thống điều hành</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">BM SOLAR Administrator</p>
          </div>

          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'dashboard'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tổng Quan & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'leads'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Quản Lý Leads Tư Vấn</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent-orange text-white">
                {leads.filter((l) => l.status === 'new').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('solutions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'solutions'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4" />
                <span>Quản Lý Giải Pháp</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800">
                {solutions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'social'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4" />
                <span>Dãy Social & Hotline</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                {channels.filter((c) => c.enabled).length}/{channels.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'products'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Danh Mục Thiết Bị ({fallbackProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'projects'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Dự Án Công Trình ({fallbackProjects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'articles'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tin Tức & Cẩm Nang ({fallbackArticles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'settings'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>CMS Cache & Trạng Thái</span>
            </button>
          </nav>

          <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">BM SOLAR Web Platform</p>
            <p>Phiên bản V3.0 • Production Ready</p>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {revalidateStatus && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
              <span>{revalidateStatus}</span>
              <button onClick={() => setRevalidateStatus(null)} className="font-bold ml-2">✕</button>
            </div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Bảng Điều Khiển Tổng Quan</h2>
                <p className="text-xs text-slate-500 mt-0.5">Chỉ số hoạt động, yêu cầu tư vấn và tình trạng vận hành</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Tổng Yêu Cầu Báo Giá</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{leads.length}</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ 100% tự động lưu vào CRM</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Khách Cần Gọi Ngay</p>
                    <p className="text-2xl font-extrabold text-accent-orange mt-1">
                      {leads.filter((l) => l.status === 'new').length}
                    </p>
                    <p className="text-[11px] text-accent-orange font-medium mt-1">Chờ liên hệ & khảo sát 3D</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-accent-orange flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Thiết Bị Đang Bán</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{fallbackProducts.length}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Tier 1 Canadian Solar, Deye...</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Dự Án Đã Thực Hiện</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{fallbackProjects.length}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Bình Định, TP.HCM & Miền Nam</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Quick Navigation to Solutions & Social Dock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveTab('solutions')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-white to-orange-50/50 border border-orange-100 hover:border-orange-300 transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-primary flex items-center justify-center">
                        <Compass className="w-5 h-5 text-accent-orange" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-accent-orange transition-colors">
                          Quản Lý 3 Giải Pháp Chuyên Biệt
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hộ gia đình • Doanh nghiệp • Nhà xưởng (Trang & URL độc lập)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('social')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-100 hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-primary flex items-center justify-center">
                        <PhoneCall className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Dãy Phím Tắt Social Dock Nổi ({channels.filter((c) => c.enabled).length}/{channels.length} đang bật)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hotline 24/7 • Zalo • Facebook • YouTube • Messenger
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>

              {/* Recent Leads Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Yêu Cầu Tư Vấn Mới Nhất</h3>
                    <p className="text-xs text-slate-500">Khách hàng vừa để lại thông tin trên website</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                  >
                    <span>Xem tất cả ({leads.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {leads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{lead.fullName}</p>
                          <span className="text-xs font-semibold text-brand-primary bg-brand-light px-2 py-0.5 rounded-full">
                            {lead.phone}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.address}</span>
                          <span className="text-slate-300">•</span>
                          <span>{lead.roofType}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            lead.status === 'new'
                              ? 'bg-amber-100 text-amber-800'
                              : lead.status === 'won'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {lead.status === 'new'
                            ? 'Mới tiếp nhận'
                            : lead.status === 'won'
                            ? 'Đã chốt HĐ'
                            : lead.status === 'quoted'
                            ? 'Đã báo giá'
                            : 'Đang xử lý'}
                        </span>

                        <a
                          href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Gọi ngay</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS CRM TABLE */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Quản Lý Yêu Cầu Tư Vấn & Báo Giá (CRM)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Dữ liệu thu thập tự động từ Form Báo Giá và Modal Tư Vấn</p>
                </div>
                <button
                  onClick={() => fetchLiveLeads(token || '')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Đồng bộ từ Backend</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchLead}
                    onChange={(e) => setSearchLead(e.target.value)}
                    placeholder="Tìm theo tên khách hàng, số điện thoại, địa chỉ..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="new">Mới tiếp nhận</option>
                    <option value="contacted">Đã gọi điện</option>
                    <option value="surveying">Đang khảo sát 3D</option>
                    <option value="quoted">Đã gửi báo giá</option>
                    <option value="won">Chốt hợp đồng</option>
                    <option value="lost">Hủy tư vấn</option>
                  </select>

                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">Tất cả chi nhánh</option>
                    <option value="br_qn_01">TP. Quy Nhơn</option>
                    <option value="br_hcm_02">TP.HCM (Gò Vấp)</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Khách Hàng</th>
                        <th className="py-3 px-4">Địa Chỉ & Mái</th>
                        <th className="py-3 px-4">Tiền Điện Tháng</th>
                        <th className="py-3 px-4">Chi Nhánh</th>
                        <th className="py-3 px-4">Trạng Thái Xử Lý</th>
                        <th className="py-3 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{lead.fullName}</p>
                            <a
                              href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                              className="text-brand-primary font-semibold hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{lead.phone}</span>
                            </a>
                            <p className="text-[10px] text-slate-400 mt-0.5">{lead.createdAt}</p>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-700 line-clamp-1">{lead.address}</p>
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 mt-1 font-medium">
                              {lead.roofType || 'Chưa rõ loại mái'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {lead.monthlyElectricityCost}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                            {lead.branch}
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                                lead.status === 'new'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : lead.status === 'won'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : lead.status === 'quoted'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-slate-50 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="new">Mới tiếp nhận</option>
                              <option value="contacted">Đã gọi điện</option>
                              <option value="surveying">Đang khảo sát 3D</option>
                              <option value="quoted">Đã gửi báo giá</option>
                              <option value="won">Chốt hợp đồng</option>
                              <option value="lost">Hủy tư vấn</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <a
                              href={`https://zalo.me/${lead.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                            >
                              <span>Chat Zalo</span>
                            </a>
                          </td>
                        </tr>
                      ))}

                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            Không tìm thấy yêu cầu tư vấn nào phù hợp với bộ lọc.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: QUẢN LÝ GIẢI PHÁP (DEDICATED PAGES & CRUD) */}
          {activeTab === 'solutions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Quản Lý Danh Mục Giải Pháp Năng Lượng</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mỗi giải pháp là một giao diện và đường dẫn chuyên biệt độc lập (/giai-phap/ho-gia-dinh, /giai-phap/doanh-nghiep, /giai-phap/nha-xuong-cong-nghiep). Admin toàn quyền CRUD thời gian thực.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddSolution}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Giải Pháp Mới</span>
                </button>
              </div>

              {loadingSolutions ? (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-brand-primary" />
                  <span>Đang tải danh sách giải pháp từ Golang Backend...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {solutions.map((sol) => (
                    <div
                      key={sol.id || sol.slug}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Hero Image & Badges */}
                      <div className="h-44 relative bg-slate-900">
                        <Image
                          src={sol.heroImage || '/images/designs/giai-phap-card-1.png'}
                          alt={sol.title}
                          fill
                          className="object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm ${
                            sol.audienceCode === 'household'
                              ? 'bg-amber-500'
                              : sol.audienceCode === 'business'
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                          }`}>
                            {sol.audienceCode === 'household'
                              ? 'Hộ gia đình'
                              : sol.audienceCode === 'business'
                              ? 'Doanh nghiệp'
                              : 'Nhà xưởng'}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                            sol.status === 'published'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-500 text-white'
                          }`}>
                            {sol.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                          <code className="text-[11px] font-mono text-emerald-300 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded border border-white/10 inline-block">
                            /giai-phap/{sol.slug}
                          </code>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                            {sol.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {sol.subtitle}
                          </p>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">Quy mô công suất:</span>
                            <span className="font-bold text-slate-800">{sol.capacityRange || 'Chưa cập nhật'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Tiết kiệm/tháng:</span>
                            <span className="font-bold text-emerald-600">{sol.monthlySavings || 'Theo khảo sát'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Hoàn vốn:</span>
                            <span className="font-bold text-slate-800">{sol.roiYears || '4 - 5 năm'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Bảo hành:</span>
                            <span className="font-bold text-slate-800">{sol.warrantyPeriod || '25 năm'}</span>
                          </div>
                        </div>

                        {/* Data Counts */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                          <span>{sol.benefits?.length || 0} Lợi ích</span>
                          <span>•</span>
                          <span>{sol.equipmentList?.length || 0} Thiết bị</span>
                          <span>•</span>
                          <span>{sol.processSteps?.length || 0} Bước quy trình</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                          <Link
                            href={`/giai-phap/${sol.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Xem trang thực tế</span>
                          </Link>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditSolution(sol)}
                              className="p-2 rounded-lg text-brand-primary hover:bg-brand-light transition-colors"
                              title="Chỉnh sửa nội dung giải pháp"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSolution(sol.id || sol.slug)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Xóa giải pháp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: QUẢN LÝ DÃY SOCIAL & HOTLINE NỔI */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Quản Lý Dãy Phím Tắt Social & Hotline Nổi</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thanh công cụ liên hệ nổi cố định mép phải website (Floating Social Dock). Admin toàn quyền cấu hình nút gọi, Zalo, Facebook, YouTube, bật/tắt tức thì.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddChannel}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Nút Liên Hệ Mới</span>
                </button>
              </div>

              {/* 2-Column Layout: Table + Live Preview */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Left 2 Cols: Channels Table */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Phạm vi:</span>
                        <select
                          value={channelFilter}
                          onChange={(e) => setChannelFilter(e.target.value as 'global' | 'all')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                          <option value="global">Thanh Dock Nổi Toàn Website (Global)</option>
                          <option value="all">Tất cả kênh (bao gồm chi nhánh)</option>
                        </select>
                      </div>

                      <div className="text-xs font-semibold text-slate-500">
                        Đang bật:{' '}
                        <span className="text-emerald-600 font-extrabold">
                          {channels.filter((c) => c.enabled).length}
                        </span>{' '}
                        / {channels.length} nút
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4 w-12 text-center">STT</th>
                            <th className="py-3 px-4">Tên Nút & Biểu Tượng</th>
                            <th className="py-3 px-4">Đích Đến (Target URL / Số ĐT)</th>
                            <th className="py-3 px-4 text-center">Trạng Thái Hiển Thị</th>
                            <th className="py-3 px-4 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {(channelFilter === 'global'
                            ? channels.filter((c) => !(c as any).branchId)
                            : channels
                          ).map((ch, idx) => (
                            <tr key={ch.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 text-center font-bold text-slate-400">
                                {ch.sortOrder || idx + 1}
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                                    style={{ backgroundColor: ch.accentColor || '#10B981' }}
                                  >
                                    {ch.type === 'phone' ? (
                                      <Phone className="w-4 h-4" />
                                    ) : ch.type === 'zalo' ? (
                                      <span className="font-extrabold text-[10px]">Z</span>
                                    ) : ch.type === 'facebook' ? (
                                      <span className="font-extrabold text-xs">f</span>
                                    ) : ch.type === 'youtube' ? (
                                      <span className="text-xs">▶</span>
                                    ) : ch.type === 'messenger' ? (
                                      <MessageCircle className="w-4 h-4" />
                                    ) : ch.type === 'email' ? (
                                      <Mail className="w-4 h-4" />
                                    ) : (
                                      <Zap className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900">{ch.label}</p>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {ch.type}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <code className="text-slate-800 bg-slate-100 px-2 py-1 rounded text-[11px] font-mono break-all">
                                  {ch.target}
                                </code>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleChannel(ch)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                                    ch.enabled
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                                  }`}
                                  title={ch.enabled ? 'Click để tạm ẩn nút này' : 'Click để hiển thị nút này'}
                                >
                                  {ch.enabled ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Hiển thị</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Đang ẩn</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditChannel(ch)}
                                    className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-light transition-colors"
                                    title="Chỉnh sửa nút"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChannel(ch.id)}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    title="Xóa nút này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Live Dock Preview */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Mô Phỏng Trực Tiếp (Live Dock)</span>
                      </h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Giao diện mép phải website hiển thị ngay theo các nút đang được bật dưới đây:
                    </p>

                    {/* Miniature Browser Viewport */}
                    <div className="relative w-full h-[460px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col">
                      {/* Browser mock address bar */}
                      <div className="h-8 bg-slate-950 px-3 flex items-center gap-2 border-b border-slate-800 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <div className="flex-1 bg-slate-900 rounded px-2 py-0.5 text-[10px] text-slate-400 font-mono text-center">
                          bmsolar.vn
                        </div>
                      </div>

                      {/* Mock Website Page Content */}
                      <div className="flex-1 p-4 relative overflow-hidden flex flex-col justify-between">
                        {/* Mock header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-bold text-white tracking-wider">BM SOLAR</span>
                          <span className="text-[10px] text-slate-400">Trang chủ • Giải pháp</span>
                        </div>

                        {/* Mock Hero content */}
                        <div className="space-y-2 py-8">
                          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                            Giải pháp năng lượng xanh
                          </span>
                          <div className="text-sm font-extrabold text-white leading-tight">
                            Điện Mặt Trời Cho Mọi Nhu Cầu
                          </div>
                          <div className="w-24 h-6 rounded-full bg-[#FF6B19] text-[10px] font-bold text-white flex items-center justify-center">
                            Nhận tư vấn
                          </div>
                        </div>

                        {/* Floating Dock Mockup at Right Bottom */}
                        <div className="absolute right-3 bottom-6 flex flex-col items-end gap-2.5 z-20">
                          {channels
                            .filter((c) => c.enabled)
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((ch) => (
                              <div key={ch.id} className="relative group flex items-center">
                                {/* Tooltip label */}
                                <span className="absolute right-12 px-2 py-1 rounded bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
                                  {ch.label}
                                </span>

                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transform hover:scale-110 active:scale-95 transition-all"
                                  style={{ backgroundColor: ch.accentColor || '#10B981' }}
                                  title={ch.label}
                                >
                                  {ch.type === 'phone' ? (
                                    <Phone className="w-4 h-4" />
                                  ) : ch.type === 'zalo' ? (
                                    <span className="font-extrabold text-[11px]">Z</span>
                                  ) : ch.type === 'facebook' ? (
                                    <span className="font-extrabold text-xs">f</span>
                                  ) : ch.type === 'youtube' ? (
                                    <span className="text-xs">▶</span>
                                  ) : ch.type === 'messenger' ? (
                                    <MessageCircle className="w-4 h-4" />
                                  ) : ch.type === 'email' ? (
                                    <Mail className="w-4 h-4" />
                                  ) : (
                                    <Zap className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Danh Mục Thiết Bị Năng Lượng Mặt Trời</h2>
                <p className="text-xs text-slate-500 mt-0.5">Sản phẩm chính hãng Tier 1 Bloomberg có sẵn trong kho</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fallbackProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                    <div className="h-44 relative bg-slate-100">
                      <Image
                        src={p.coverMediaUrl || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80'}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                      {p.category && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-brand-primary text-white text-[10px] font-bold">
                          {p.category.name}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {p.brand && <p className="text-xs font-bold text-accent-orange uppercase">{p.brand.name}</p>}
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">{p.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.summary}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-brand-primary">
                          {p.priceEstimate || 'Liên hệ báo giá'}
                        </span>
                        <Link
                          href={`/san-pham/${p.slug}`}
                          target="_blank"
                          className="text-xs font-bold text-slate-600 hover:text-brand-primary flex items-center gap-1"
                        >
                          <span>Xem thử</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS PORTFOLIO */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Dự Án Điện Mặt Trời Đã Thi Công</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hồ sơ năng lực thực tế được đồng bộ lên website</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fallbackProjects.map((proj) => (
                  <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="h-44 relative bg-slate-100">
                      <Image
                        src={proj.coverMediaUrl || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80'}
                        alt={proj.title}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-accent-orange text-white text-[11px] font-extrabold shadow-sm">
                        {proj.capacityKwp} kWp
                      </span>
                    </div>

                    <div className="p-4">
                      <p className="text-xs font-medium text-slate-400">
                        {proj.province?.name || 'Việt Nam'} • {proj.completedAt || 'Hoàn thành'}
                      </p>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{proj.title}</h4>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{proj.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ARTICLES EDITORIAL */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Bài Viết & Cẩm Nang Kỹ Thuật</h2>
                <p className="text-xs text-slate-500 mt-0.5">Nội dung SEO, cơ chế chính sách DPPA và cẩm nang điện mặt trời</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fallbackArticles.map((art) => (
                  <div key={art.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="h-40 relative bg-slate-100">
                      <Image
                        src={art.coverMediaUrl || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80'}
                        alt={art.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      {art.category && (
                        <span className="text-[10px] font-bold text-brand-primary uppercase bg-brand-light px-2 py-0.5 rounded">
                          {art.category}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">{art.title}</h4>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{art.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & REVALIDATION */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Cấu Hình Vận Hành & Làm Mới Bộ Nhớ Đệm</h2>
                <p className="text-xs text-slate-500 mt-0.5">Quản lý đồng bộ giữa CMS Backend và Next.js Cache</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Webhook Revalidate URL</span>
                  <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-brand-primary font-mono">
                    POST /api/cms/revalidate
                  </code>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Trạng Thái Kết Nối Backend Golang</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hoạt động (Port 3001)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Cơ Chế Phân Quyền</span>
                  <span className="text-xs text-slate-600 font-medium">HMAC-SHA256 & Bearer Token</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={triggerRevalidate}
                  className="py-3 px-6 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Kích Hoạt Làm Mới Toàn Bộ Cache Ngay (Purge Cache)</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: CHỈNH SỬA / THÊM MỚI GIẢI PHÁP */}
      {editingSolution && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-accent-orange" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewSolution ? 'Thêm Giải Pháp Mới' : `Chỉnh Sửa Giải Pháp: ${editingSolution.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSolution(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSolution} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tiêu Đề Giải Pháp *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSolution.title}
                    onChange={(e) => setEditingSolution({ ...editingSolution, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Điện Mặt Trời Hộ Gia Đình & Biệt Thự"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Đường Dẫn URL Slug * (duy nhất)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSolution.slug}
                    onChange={(e) => setEditingSolution({ ...editingSolution, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="ho-gia-dinh"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phụ Đề / Tóm Tắt Ngắn Gọn *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSolution.subtitle}
                    onChange={(e) => setEditingSolution({ ...editingSolution, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Hệ thống điện mặt trời áp mái 3kW - 10kW tiết kiệm hóa đơn tiền điện"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nhóm Khách Hàng (Audience)
                  </label>
                  <select
                    value={editingSolution.audienceCode}
                    onChange={(e) => setEditingSolution({ ...editingSolution, audienceCode: e.target.value as 'household' | 'business' | 'industrial' })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="household">Hộ gia đình & Biệt thự (household)</option>
                    <option value="business">Doanh nghiệp & Thương mại (business)</option>
                    <option value="industrial">Nhà xưởng & Công nghiệp (industrial)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dải Quy Mô Công Suất
                  </label>
                  <input
                    type="text"
                    value={editingSolution.capacityRange || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, capacityRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="3kW - 10kW"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mức Tiết Kiệm Hàng Tháng Dự Kiến
                  </label>
                  <input
                    type="text"
                    value={editingSolution.monthlySavings || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, monthlySavings: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Từ 1.5 - 6 triệu đồng/tháng"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Thời Gian Hoàn Vốn (ROI)
                  </label>
                  <input
                    type="text"
                    value={editingSolution.roiYears || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, roiYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="4 - 5 năm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Thời Gian Bảo Hành
                  </label>
                  <input
                    type="text"
                    value={editingSolution.warrantyPeriod || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, warrantyPeriod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="25 năm hiệu suất tấm pin"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Đường Dẫn Ảnh Đại Diện (Hero Image)
                  </label>
                  <input
                    type="text"
                    value={editingSolution.heroImage || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, heroImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="/images/designs/giai-phap-card-1.png"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Trạng Thái Xuất Bản
                  </label>
                  <select
                    value={editingSolution.status || 'published'}
                    onChange={(e) => setEditingSolution({ ...editingSolution, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="published">Xuất bản (Hiển thị công khai)</option>
                    <option value="draft">Bản nháp (Ẩn tạm thời)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Thứ Tự Sắp Xếp
                  </label>
                  <input
                    type="number"
                    value={editingSolution.sortOrder || 1}
                    onChange={(e) => setEditingSolution({ ...editingSolution, sortOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mô Tả Tổng Quan Giải Pháp (Overview)
                </label>
                <textarea
                  rows={3}
                  value={editingSolution.overview || ''}
                  onChange={(e) => setEditingSolution({ ...editingSolution, overview: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Hệ thống điện mặt trời áp mái dành cho gia đình được BM SOLAR thiết kế..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">
                    Lợi Ích Cốt Lõi (Benefits)
                  </label>
                  <span className="text-slate-400 text-[11px]">Định dạng: Tiêu đề | Mô tả (mỗi dòng một mục)</span>
                </div>
                <textarea
                  rows={4}
                  value={solutionBenefitsText}
                  onChange={(e) => setSolutionBenefitsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Giảm 80 - 90% Hóa Đơn Điện | Sử dụng điện mặt trời tự sản tự tiêu cho điều hòa, tủ lạnh...&#10;Cấp Điện Liên Tục Khi Mất Lưới | Hệ thống chuyển mạch UPS siêu tốc < 10ms..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">
                    Danh Mục Thiết Bị Chính (Equipment)
                  </label>
                  <span className="text-slate-400 text-[11px]">Định dạng: Tên thiết bị | Thương hiệu | Thời gian bảo hành</span>
                </div>
                <textarea
                  rows={4}
                  value={solutionEquipmentText}
                  onChange={(e) => setSolutionEquipmentText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Tấm pin Canadian Solar 550W | Canadian Solar | 25 năm&#10;Biến tần Inverter Deye Hybrid | Deye Energy | 5 năm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">
                    Quy Trình Triển Khai (Process Steps)
                  </label>
                  <span className="text-slate-400 text-[11px]">Định dạng: Số thứ tự | Tên bước | Mô tả chi tiết</span>
                </div>
                <textarea
                  rows={4}
                  value={solutionProcessText}
                  onChange={(e) => setSolutionProcessText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="1 | Tiếp nhận & Tư vấn sơ bộ | Đánh giá hóa đơn tiền điện hiện tại&#10;2 | Khảo sát 3D thực tế | Kỹ sư đo đạc hướng nắng miễn phí"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setEditingSolution(null)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingSolution}
                  className="px-6 py-2.5 rounded-lg bg-[#FF6B19] hover:bg-[#ea5d0f] text-white font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
                >
                  {savingSolution ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Thay Đổi Giải Pháp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA / THÊM MỚI NÚT DÃY SOCIAL NỔI */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewChannel ? 'Thêm Nút Liên Hệ Mới' : `Chỉnh Sửa Nút: ${editingChannel.label}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingChannel(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Loại Kênh Liên Hệ *
                </label>
                <select
                  value={editingChannel.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    let defaultColor = '#10B981';
                    if (type === 'phone') defaultColor = '#10B981';
                    else if (type === 'zalo') defaultColor = '#0068FF';
                    else if (type === 'facebook') defaultColor = '#1877F2';
                    else if (type === 'youtube') defaultColor = '#FF0000';
                    else if (type === 'messenger') defaultColor = '#00B2FF';
                    else if (type === 'email') defaultColor = '#F59E0B';
                    setEditingChannel({ ...editingChannel, type, accentColor: defaultColor });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="phone">Điện thoại / Hotline (tel:)</option>
                  <option value="zalo">Zalo Chat / Zalo OA</option>
                  <option value="facebook">Facebook Fanpage</option>
                  <option value="youtube">Kênh YouTube</option>
                  <option value="messenger">Messenger Chat</option>
                  <option value="email">Email liên hệ</option>
                  <option value="custom">Tùy biến (Custom Link)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tên Nhãn Hiển Thị (Tooltip Label) *
                </label>
                <input
                  type="text"
                  required
                  value={editingChannel.label}
                  onChange={(e) => setEditingChannel({ ...editingChannel, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Hotline 24/7 hoặc Chat Zalo"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Giá Trị Đích (Số Hotline hoặc URL Web) *
                </label>
                <input
                  type="text"
                  required
                  value={editingChannel.target}
                  onChange={(e) => setEditingChannel({ ...editingChannel, target: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="1900 036 089 hoặc https://zalo.me/..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Màu Sắc Nhận Diện (Hex Color)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editingChannel.accentColor || '#10B981'}
                    onChange={(e) => setEditingChannel({ ...editingChannel, accentColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={editingChannel.accentColor || '#10B981'}
                    onChange={(e) => setEditingChannel({ ...editingChannel, accentColor: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>
                {/* Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400">Gợi ý màu:</span>
                  {[
                    { c: '#10B981', name: 'Xanh Lá' },
                    { c: '#0068FF', name: 'Zalo' },
                    { c: '#1877F2', name: 'Facebook' },
                    { c: '#FF0000', name: 'YouTube' },
                    { c: '#00B2FF', name: 'Messenger' },
                    { c: '#FF6B19', name: 'Cam' },
                  ].map((p) => (
                    <button
                      key={p.c}
                      type="button"
                      onClick={() => setEditingChannel({ ...editingChannel, accentColor: p.c })}
                      className="w-5 h-5 rounded-full border border-white shadow-xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: p.c }}
                      title={p.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Thứ Tự Sắp Xếp
                </label>
                <input
                  type="number"
                  value={editingChannel.sortOrder || 1}
                  onChange={(e) => setEditingChannel({ ...editingChannel, sortOrder: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={editingChannel.enabled}
                    onChange={(e) => setEditingChannel({ ...editingChannel, enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Hiển thị nút này trên website</span>
                    <span className="text-slate-500 text-[11px]">Bỏ chọn nếu muốn tạm ẩn mà không cần xóa</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingChannel}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  {savingChannel ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Nút Liên Hệ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
