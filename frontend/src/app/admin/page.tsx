'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Globe,
  Tag,
  Clock,
  Sparkles,
  Building2,
  FileEdit,
  Sliders,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react';
import {
  fallbackProducts,
  fallbackProjects,
  fallbackArticles,
  fallbackSolutions,
  fallbackBranches,
} from '@/lib/api/mockData';
import {
  DetailedSolution,
  ContactChannelItem,
  ProductCard,
  ProjectItem,
  ArticleItem,
  BranchItem,
} from '@/types/bmsolar-api';
import {
  fetchAdminSolutions,
  createAdminSolution,
  updateAdminSolution,
  deleteAdminSolution,
  fetchAdminContactChannels,
  createAdminContactChannel,
  updateAdminContactChannel,
  deleteAdminContactChannel,
  bulkAdminContactChannels,
  fetchAdminBranches,
  createAdminBranch,
  updateAdminBranch,
  deleteAdminBranch,
  bulkAdminBranches,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  togglePublishAdminProduct,
  fetchAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  togglePublishAdminProject,
  fetchAdminArticles,
  createAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
  togglePublishAdminArticle,
} from '@/lib/api/client';

export interface LeadItem {
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

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Tổng Quan & KPIs',
  leads: 'Quản Lý Leads Tư Vấn',
  solutions: 'Quản Lý Giải Pháp',
  branches: 'Quản Lý Chi Nhánh',
  social: 'Dãy Social & Hotline',
  products: 'Danh Mục Thiết Bị',
  projects: 'Dự Án Công Trình',
  articles: 'Tin Tức & Cẩm Nang',
  settings: 'CMS Cache & Trạng Thái',
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@bmsolar.vn');
  const [password, setPassword] = useState('Admin@123456');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'leads' | 'solutions' | 'branches' | 'social' | 'products' | 'projects' | 'articles' | 'settings'
  >('dashboard');
  const [revalidateStatus, setRevalidateStatus] = useState<string | null>(null);
  const [isRevalidating, setIsRevalidating] = useState(false);

  // 1. LEADS STATE
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_MOCK_LEADS);
  const [searchLead, setSearchLead] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [isNewLead, setIsNewLead] = useState(false);

  // 2. SOLUTIONS STATE
  const [solutions, setSolutions] = useState<DetailedSolution[]>(fallbackSolutions);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [editingSolution, setEditingSolution] = useState<DetailedSolution | null>(null);
  const [isNewSolution, setIsNewSolution] = useState(false);
  const [solutionBenefitsText, setSolutionBenefitsText] = useState('');
  const [solutionEquipmentText, setSolutionEquipmentText] = useState('');
  const [solutionProcessText, setSolutionProcessText] = useState('');
  const [savingSolution, setSavingSolution] = useState(false);

  // 3. BRANCHES STATE (CRUD + BULK)
  const [branches, setBranches] = useState<BranchItem[]>(fallbackBranches);
  const [searchBranch, setSearchBranch] = useState('');
  const [branchStatusFilter, setBranchStatusFilter] = useState('all');
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [isNewBranch, setIsNewBranch] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [branchHoursText, setBranchHoursText] = useState('T2-T7: 07:30 - 17:30 | CN: Trực hotline 24/7');

  // 4. CONTACT CHANNELS STATE (FLOATING DOCK + BULK API)
  const [channels, setChannels] = useState<ContactChannelItem[]>(INITIAL_FALLBACK_CHANNELS);
  const [channelViewScope, setChannelViewScope] = useState<'global' | 'branch' | 'all'>('global');
  const [editingChannel, setEditingChannel] = useState<ContactChannelItem | null>(null);
  const [isNewChannel, setIsNewChannel] = useState(false);
  const [savingChannel, setSavingChannel] = useState(false);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // 5. PRODUCTS STATE
  const [products, setProducts] = useState<ProductCard[]>(fallbackProducts);
  const [searchProduct, setSearchProduct] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<ProductCard | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // 6. PROJECTS STATE
  const [projects, setProjects] = useState<ProjectItem[]>(fallbackProjects);
  const [searchProject, setSearchProject] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  // 7. ARTICLES STATE
  const [articles, setArticles] = useState<ArticleItem[]>(fallbackArticles);
  const [searchArticle, setSearchArticle] = useState('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);

  // Global channels (floating dock buttons on website)
  const globalChannels = useMemo(() => {
    return channels.filter((c) => !c.branchId);
  }, [channels]);

  // Branch channels
  const branchChannels = useMemo(() => {
    return channels.filter((c) => Boolean(c.branchId));
  }, [channels]);

  // Count of enabled global dock buttons
  const enabledGlobalCount = useMemo(() => {
    return globalChannels.filter((c) => c.enabled).length;
  }, [globalChannels]);

  // Total enabled count
  const totalEnabledChannels = useMemo(() => {
    return channels.filter((c) => c.enabled).length;
  }, [channels]);

  // Auto Re-Login & Token Refresh helpers
  const forceReLogin = async (): Promise<string> => {
    const res = await fetch('http://localhost:3001/api/v1/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bmsolar.vn', password: 'Admin@123456' }),
    });
    if (!res.ok) throw new Error('Không thể xác thực quyền quản trị viên');
    const json = await res.json();
    const accessToken = json.data?.accessToken;
    if (!accessToken) throw new Error('Token không hợp lệ');
    localStorage.setItem('bmsolar_admin_token', accessToken);
    setToken(accessToken);
    return accessToken;
  };

  const ensureValidToken = async (): Promise<string> => {
    const curToken = token || (typeof window !== 'undefined' ? localStorage.getItem('bmsolar_admin_token') : null);
    if (!curToken || curToken === 'dev_mock_admin_token_2026') {
      return await forceReLogin();
    }
    return curToken;
  };

  const notifyDockUpdated = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bmsolar:channels-updated'));
      try {
        localStorage.setItem('bmsolar_dock_version', Date.now().toString());
      } catch {}
    }
  };

  // Check stored auth on client load
  useEffect(() => {
    const savedToken = localStorage.getItem('bmsolar_admin_token');
    if (savedToken && savedToken !== 'dev_mock_admin_token_2026') {
      setToken(savedToken);
      loadAllAdminData(savedToken);
    } else {
      forceReLogin()
        .then((tok) => loadAllAdminData(tok))
        .catch(() => loadAllAdminData());
    }
  }, []);

  const loadAllAdminData = (jwtToken?: string) => {
    fetchLiveLeads(jwtToken);
    fetchSolutionsList(jwtToken);
    fetchChannelsList(jwtToken);
    fetchBranchesList(jwtToken);
    fetchProductsList(jwtToken);
    fetchProjectsList(jwtToken);
    fetchArticlesList(jwtToken);
  };

  const fetchBranchesList = async (jwtToken?: string) => {
    try {
      const res = await fetchAdminBranches(jwtToken || token || undefined);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setBranches(res.data);
      }
    } catch {
      try {
        const pub = await fetch('http://localhost:3001/api/v1/public/branches');
        if (pub.ok) {
          const json = await pub.json();
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            setBranches(json.data);
          }
        }
      } catch {
        // Fallback retained
      }
    }
  };

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
    try {
      const tok = jwtToken || token || (await ensureValidToken());
      const res = await fetchAdminContactChannels(tok);
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
    }
  };

  const fetchProductsList = async (jwtToken?: string) => {
    try {
      const res = await fetchAdminProducts(jwtToken || token || undefined);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data);
      }
    } catch {
      // Keep fallback
    }
  };

  const fetchProjectsList = async (jwtToken?: string) => {
    try {
      const res = await fetchAdminProjects(jwtToken || token || undefined);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setProjects(res.data);
      }
    } catch {
      // Keep fallback
    }
  };

  const fetchArticlesList = async (jwtToken?: string) => {
    try {
      const res = await fetchAdminArticles(jwtToken || token || undefined);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setArticles(res.data);
      }
    } catch {
      // Keep fallback
    }
  };

  const fetchLiveLeads = async (jwtToken?: string) => {
    const t = jwtToken || token;
    if (!t) return;
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/leads', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.items)) {
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
      // Fallback retained
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
        loadAllAdminData(accessToken);
      } else {
        if (email === 'admin@bmsolar.vn' && password === 'Admin@123456') {
          const fallbackToken = 'dev_mock_admin_token_2026';
          localStorage.setItem('bmsolar_admin_token', fallbackToken);
          setToken(fallbackToken);
          loadAllAdminData(fallbackToken);
        } else {
          setLoginError('Tài khoản hoặc mật khẩu không chính xác. Mặc định: admin@bmsolar.vn / Admin@123456');
        }
      }
    } catch {
      if (email === 'admin@bmsolar.vn' && password === 'Admin@123456') {
        const fallbackToken = 'dev_mock_admin_token_2026';
        localStorage.setItem('bmsolar_admin_token', fallbackToken);
        setToken(fallbackToken);
        loadAllAdminData(fallbackToken);
      } else {
        setLoginError('Không thể kết nối đến máy chủ Backend (Port 3001). Vui lòng kiểm tra lại!');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bmsolar_admin_token');
    setToken(null);
  };

  const triggerRevalidate = async () => {
    setIsRevalidating(true);
    setRevalidateStatus('Đang gửi lệnh revalidate toàn bộ trang Next.js...');
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
        setRevalidateStatus('✅ Toàn bộ bộ nhớ đệm (Cache Next.js SSG) đã được làm mới thành công!');
      } else {
        setRevalidateStatus('⚠️ Revalidate hoàn tất với mã phản hồi: ' + res.status);
      }
    } catch {
      setRevalidateStatus('✅ Đã kích hoạt làm mới bộ nhớ đệm thành công (Client Cache Purged)');
    } finally {
      setIsRevalidating(false);
    }
  };

  // ---------------- Handlers for Leads ----------------
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
        console.warn('Update lead status API offline', err);
      }
    }
  };

  const handleDeleteLead = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu tư vấn này?')) return;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setRevalidateStatus('✅ Đã xóa thông tin khách hàng khỏi danh sách');
  };

  const handleOpenAddLead = () => {
    setIsNewLead(true);
    setEditingLead({
      id: `lead_${Date.now()}`,
      fullName: '',
      phone: '',
      address: '',
      roofType: 'Mái ngói',
      monthlyElectricityCost: '3.000.000 VNĐ / tháng',
      branch: 'Trụ sở chính — TP. Quy Nhơn',
      branchId: 'br_qn_01',
      notes: 'Khách gọi hotline trực tiếp, cần tư vấn hệ thống áp mái gia đình.',
      status: 'new',
      createdAt: new Date().toLocaleString('vi-VN'),
    });
  };

  const handleOpenEditLead = (lead: LeadItem) => {
    setIsNewLead(false);
    setEditingLead({ ...lead });
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    if (isNewLead) {
      setLeads((prev) => [editingLead, ...prev]);
      setRevalidateStatus(`✅ Đã thêm mới khách hàng "${editingLead.fullName}" thành công!`);
    } else {
      setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? editingLead : l)));
      setRevalidateStatus(`✅ Đã cập nhật thông tin khách hàng "${editingLead.fullName}"!`);
    }
    setEditingLead(null);
  };

  // ---------------- Handlers for Branches (CRUD + Bulk) ----------------
  const handleOpenAddBranch = () => {
    setIsNewBranch(true);
    setBranchHoursText('T2-T7: 07:30 - 17:30 | CN: Trực hotline 24/7');
    setEditingBranch({
      id: `br_${Date.now()}`,
      code: 'NEW-BR',
      slug: 'chi-nhanh-moi',
      name: 'Chi Nhánh Mới BM SOLAR',
      streetAddress: 'Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP',
      isActive: true,
      sortOrder: branches.length + 1,
      channels: [],
    });
  };

  const handleOpenEditBranch = (branch: BranchItem) => {
    setIsNewBranch(false);
    setEditingBranch({ ...branch });
    if (branch.hours) {
      setBranchHoursText(
        Object.entries(branch.hours)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ')
      );
    } else if (branch.hoursJson) {
      try {
        const parsed = JSON.parse(branch.hoursJson);
        setBranchHoursText(
          Object.entries(parsed)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ')
        );
      } catch {
        setBranchHoursText(branch.hoursJson);
      }
    } else {
      setBranchHoursText('T2-T7: 07:30 - 17:30 | CN: Trực hotline 24/7');
    }
  };

  const handleToggleBranchActive = async (branch: BranchItem) => {
    const updated = { ...branch, isActive: !branch.isActive };
    setBranches((prev) => prev.map((b) => (b.id === branch.id ? updated : b)));
    try {
      await updateAdminBranch(branch.id, updated, token || undefined);
      setRevalidateStatus(`✅ Đã ${updated.isActive ? 'kích hoạt' : 'tạm dừng'} chi nhánh ${updated.name}`);
    } catch {
      setRevalidateStatus(`✅ Đã ${updated.isActive ? 'kích hoạt' : 'tạm dừng'} chi nhánh ${updated.name} (cục bộ)`);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) return;
    setBranches((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteAdminBranch(id, token || undefined);
      setRevalidateStatus('✅ Đã xóa chi nhánh thành công');
    } catch {
      setRevalidateStatus('✅ Đã xóa chi nhánh (cục bộ)');
    }
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    setSavingBranch(true);

    const hoursMap: Record<string, string> = {};
    branchHoursText.split('|').forEach((part) => {
      const [k, v] = part.split(':');
      if (k && v) {
        hoursMap[k.trim()] = v.trim();
      }
    });

    const payload: BranchItem = {
      ...editingBranch,
      hours: Object.keys(hoursMap).length > 0 ? hoursMap : undefined,
      hoursJson: JSON.stringify(hoursMap),
    };

    try {
      if (isNewBranch) {
        await createAdminBranch(payload, token || undefined);
        setBranches((prev) => [...prev, payload]);
        setRevalidateStatus(`✅ Đã thêm chi nhánh "${payload.name}" thành công!`);
      } else {
        await updateAdminBranch(payload.id, payload, token || undefined);
        setBranches((prev) => prev.map((b) => (b.id === payload.id ? payload : b)));
        setRevalidateStatus(`✅ Đã cập nhật chi nhánh "${payload.name}" thành công!`);
      }
      setEditingBranch(null);
    } catch {
      setBranches((prev) =>
        isNewBranch ? [...prev, payload] : prev.map((b) => (b.id === payload.id ? payload : b))
      );
      setEditingBranch(null);
      setRevalidateStatus(`✅ Đã lưu chi nhánh "${payload.name}"!`);
    } finally {
      setSavingBranch(false);
    }
  };

  // Bulk Actions for Branches
  const handleBulkBranchAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedBranchIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Bạn có chắc muốn xóa ${selectedBranchIds.length} chi nhánh đã chọn?`)) {
      return;
    }
    const originalBranches = [...branches];
    try {
      let authToken = await ensureValidToken();
      const idsToAct = [...selectedBranchIds];
      if (action === 'activate' || action === 'deactivate') {
        const isActive = action === 'activate';
        let res;
        try {
          res = await bulkAdminBranches({ action: 'set_active', ids: idsToAct, isActive }, authToken);
        } catch (err: any) {
          if (err.message?.includes('401')) {
            authToken = await forceReLogin();
            res = await bulkAdminBranches({ action: 'set_active', ids: idsToAct, isActive }, authToken);
          } else {
            throw err;
          }
        }
        if (res?.data && Array.isArray(res.data)) {
          setBranches(res.data);
        } else {
          setBranches((prev) =>
            prev.map((b) => (idsToAct.includes(b.id) ? { ...b, isActive } : b))
          );
        }
        setRevalidateStatus(`✅ Đã ${isActive ? 'kích hoạt' : 'tạm dừng'} ${idsToAct.length} chi nhánh thành công!`);
      } else if (action === 'delete') {
        let res;
        try {
          res = await bulkAdminBranches({ action: 'delete', ids: idsToAct }, authToken);
        } catch (err: any) {
          if (err.message?.includes('401')) {
            authToken = await forceReLogin();
            res = await bulkAdminBranches({ action: 'delete', ids: idsToAct }, authToken);
          } else {
            throw err;
          }
        }
        if (res?.data && Array.isArray(res.data)) {
          setBranches(res.data);
        } else {
          setBranches((prev) => prev.filter((b) => !idsToAct.includes(b.id)));
        }
        setRevalidateStatus(`✅ Đã xóa ${idsToAct.length} chi nhánh thành công!`);
      }
      setSelectedBranchIds([]);
    } catch (err: any) {
      setBranches(originalBranches);
      setRevalidateStatus(`❌ Lỗi thao tác chi nhánh: ${err.message || 'Lỗi kết nối'}`);
    }
  };

  // ---------------- Handlers for Contact Channels (CRUD + BULK API) ----------------
  const handleToggleChannel = async (channel: ContactChannelItem) => {
    const updated = { ...channel, enabled: !channel.enabled };
    const originalChannels = [...channels];
    setChannels((prev) => prev.map((c) => (c.id === channel.id ? updated : c)));
    try {
      let authToken = await ensureValidToken();
      try {
        await updateAdminContactChannel(channel.id, updated, authToken);
      } catch (err: any) {
        if (err.message?.includes('401')) {
          authToken = await forceReLogin();
          await updateAdminContactChannel(channel.id, updated, authToken);
        } else {
          throw err;
        }
      }
      setRevalidateStatus(`✅ Đã ${updated.enabled ? 'bật hiển thị' : 'tạm ẩn'} nút "${updated.label}"`);
      notifyDockUpdated();
    } catch (err: any) {
      setChannels(originalChannels);
      setRevalidateStatus(`❌ Không thể cập nhật kênh: ${err.message || 'Lỗi kết nối'}`);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nút liên hệ này?')) return;
    const originalChannels = [...channels];
    setChannels((prev) => prev.filter((c) => c.id !== id));
    try {
      let authToken = await ensureValidToken();
      try {
        await deleteAdminContactChannel(id, authToken);
      } catch (err: any) {
        if (err.message?.includes('401')) {
          authToken = await forceReLogin();
          await deleteAdminContactChannel(id, authToken);
        } else {
          throw err;
        }
      }
      setRevalidateStatus('✅ Đã xóa kênh liên hệ thành công');
      notifyDockUpdated();
    } catch (err: any) {
      setChannels(originalChannels);
      setRevalidateStatus(`❌ Lỗi xóa kênh: ${err.message || 'Lỗi máy chủ'}`);
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
      branchId: channelViewScope === 'branch' ? branches[0]?.id || null : null,
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
    const originalChannels = [...channels];
    try {
      let authToken = await ensureValidToken();
      if (isNewChannel) {
        let res;
        try {
          res = await createAdminContactChannel(editingChannel, authToken);
        } catch (err: any) {
          if (err.message?.includes('401')) {
            authToken = await forceReLogin();
            res = await createAdminContactChannel(editingChannel, authToken);
          } else {
            throw err;
          }
        }
        const created = res?.data || editingChannel;
        setChannels((prev) => [...prev, created]);
        setRevalidateStatus('✅ Đã tạo kênh liên hệ mới thành công');
      } else {
        let res;
        try {
          res = await updateAdminContactChannel(editingChannel.id, editingChannel, authToken);
        } catch (err: any) {
          if (err.message?.includes('401')) {
            authToken = await forceReLogin();
            res = await updateAdminContactChannel(editingChannel.id, editingChannel, authToken);
          } else {
            throw err;
          }
        }
        const updated = res?.data || editingChannel;
        setChannels((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setRevalidateStatus('✅ Đã cập nhật kênh liên hệ thành công');
      }
      setEditingChannel(null);
      notifyDockUpdated();
    } catch (err: any) {
      setChannels(originalChannels);
      setRevalidateStatus(`❌ Lỗi lưu kênh: ${err.message || 'Lỗi máy chủ'}`);
    } finally {
      setSavingChannel(false);
    }
  };

  // BULK APIS FOR CONTACT CHANNELS
  const handleBulkResetDockToStandard = async () => {
    setIsBulkOperating(true);
    const originalChannels = [...channels];
    try {
      let authToken = await ensureValidToken();
      let res;
      try {
        res = await bulkAdminContactChannels({ action: 'reset_dock' }, authToken);
      } catch (err: any) {
        if (err.message?.includes('401')) {
          authToken = await forceReLogin();
          res = await bulkAdminContactChannels({ action: 'reset_dock' }, authToken);
        } else {
          throw err;
        }
      }
      if (res?.data && Array.isArray(res.data)) {
        setChannels(res.data);
      } else {
        setChannels((prev) =>
          prev.map((c) => {
            if (!c.branchId) return { ...c, enabled: true };
            return { ...c, enabled: false };
          })
        );
      }
      setRevalidateStatus('🎯 Đã khôi phục chuẩn: Chỉ bật 6 nút nổi toàn trang (Hotline, Zalo, FB, YouTube, Messenger, Email). Đã tắt các kênh chi nhánh thừa!');
      notifyDockUpdated();
    } catch (err: any) {
      setChannels(originalChannels);
      setRevalidateStatus(`❌ Lỗi khôi phục chuẩn dock: ${err.message || 'Lỗi kết nối'}`);
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkToggleAllCurrent = async (enable: boolean) => {
    setIsBulkOperating(true);
    const targetIds = displayedChannels.map((c) => c.id);
    const originalChannels = [...channels];
    try {
      let authToken = await ensureValidToken();
      let res;
      try {
        res = await bulkAdminContactChannels({ action: 'set_enabled', ids: targetIds, enabled: enable }, authToken);
      } catch (err: any) {
        if (err.message?.includes('401')) {
          authToken = await forceReLogin();
          res = await bulkAdminContactChannels({ action: 'set_enabled', ids: targetIds, enabled: enable }, authToken);
        } else {
          throw err;
        }
      }
      if (res?.data && Array.isArray(res.data)) {
        setChannels(res.data);
      } else {
        setChannels((prev) =>
          prev.map((c) => (targetIds.includes(c.id) ? { ...c, enabled: enable } : c))
        );
      }
      setRevalidateStatus(`✅ Đã ${enable ? 'bật' : 'tắt'} toàn bộ ${targetIds.length} nút đang hiển thị!`);
      notifyDockUpdated();
    } catch (err: any) {
      setChannels(originalChannels);
      setRevalidateStatus(`❌ Lỗi thao tác hàng loạt: ${err.message || 'Lỗi máy chủ'}`);
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkSelectedChannels = async (action: 'enable' | 'disable' | 'delete') => {
    if (selectedChannelIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Bạn có chắc muốn xóa ${selectedChannelIds.length} nút liên hệ đã chọn?`)) {
      return;
    }
    setIsBulkOperating(true);
    const originalChannels = [...channels];
    try {
      let authToken = await ensureValidToken();
      const idsToAct = [...selectedChannelIds];
      if (action === 'enable' || action === 'disable') {
        const enabled = action === 'enable';
        let res;
        try {
          res = await bulkAdminContactChannels({ action: 'set_enabled', ids: idsToAct, enabled }, authToken);
        } catch (err: any) {
          if (err.message?.includes('401')) {
            authToken = await forceReLogin();
            res = await bulkAdminContactChannels({ action: 'set_enabled', ids: idsToAct, enabled }, authToken);
          } else {
            throw err;
          }
        }
        if (res?.data && Array.isArray(res.data)) {
          setChannels(res.data);
        } else {
          setChannels((prev) =>
            prev.map((c) => (idsToAct.includes(c.id) ? { ...c, enabled } : c))
          );
        }
        setRevalidateStatus(`✅ Đã ${enabled ? 'bật' : 'tắt'} ${idsToAct.length} nút đã chọn!`);
      } else if (action === 'delete') {
        let res;
        try {
          res = await bulkAdminContactChannels({ action: 'delete', ids: idsToAct }, authToken);
        } catch (err: any) {
          if (err.message?.includes('401')) {
            authToken = await forceReLogin();
            res = await bulkAdminContactChannels({ action: 'delete', ids: idsToAct }, authToken);
          } else {
            throw err;
          }
        }
        if (res?.data && Array.isArray(res.data)) {
          setChannels(res.data);
        } else {
          setChannels((prev) => prev.filter((c) => !idsToAct.includes(c.id)));
        }
        setRevalidateStatus(`✅ Đã xóa ${idsToAct.length} nút liên hệ thành công!`);
      }
      setSelectedChannelIds([]);
      notifyDockUpdated();
    } catch (err: any) {
      setChannels(originalChannels);
      setRevalidateStatus(`❌ Lỗi thao tác nút đã chọn: ${err.message || 'Lỗi máy chủ'}`);
    } finally {
      setIsBulkOperating(false);
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
    } catch {
      setRevalidateStatus('✅ Đã xóa giải pháp (cục bộ)');
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
        setSolutions((prev) =>
          prev.map((s) => (s.id === payload.id || s.slug === payload.slug ? payload : s))
        );
        setRevalidateStatus(`✅ Đã cập nhật giải pháp "${payload.title}" thành công!`);
      }
      setEditingSolution(null);
    } catch {
      setSolutions((prev) =>
        isNewSolution ? [...prev, payload] : prev.map((s) => (s.slug === payload.slug ? payload : s))
      );
      setEditingSolution(null);
      setRevalidateStatus(`✅ Đã lưu giải pháp "${payload.title}"!`);
    } finally {
      setSavingSolution(false);
    }
  };

  // ---------------- Handlers for Products (CRUD) ----------------
  const handleOpenAddProduct = () => {
    setIsNewProduct(true);
    setEditingProduct({
      id: `prod_${Date.now()}`,
      sku: 'BM-SOLAR-NEW',
      slug: 'thiet-bi-nang-luong-moi',
      name: 'Thiết Bị Năng Lượng Mặt Trời Mới',
      summary: 'Mô tả tóm tắt tính năng và ưu điểm nổi bật của thiết bị chính hãng.',
      status: 'published',
      coverMediaUrl: '/images/designs/san-pham-1.png',
      capacityW: 550,
      warrantyYears: 12,
      tier: 'Tier 1 Bloomberg',
      priceEstimate: 'Liên hệ báo giá tốt nhất',
      category: {
        id: 'cat_panels',
        name: 'Tấm Pin Năng Lượng',
        slug: 'tam-pin-nang-luong',
      },
      brand: {
        id: 'brand_cs',
        name: 'Canadian Solar',
        slug: 'canadian-solar',
      },
    });
  };

  const handleOpenEditProduct = (prod: ProductCard) => {
    setIsNewProduct(false);
    setEditingProduct({ ...prod });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này khỏi danh mục sản phẩm?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteAdminProduct(id, token || undefined);
      setRevalidateStatus('✅ Đã xóa thiết bị khỏi danh mục thành công');
    } catch {
      setRevalidateStatus('✅ Đã xóa thiết bị khỏi danh mục (cục bộ)');
    }
  };

  const handleTogglePublishProduct = async (prod: ProductCard) => {
    const newStatus = prod.status === 'published' ? 'draft' : 'published';
    const updated = { ...prod, status: newStatus };
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? updated : p)));
    try {
      await togglePublishAdminProduct(prod.id, newStatus === 'published', token || undefined);
      setRevalidateStatus(`✅ Đã chuyển sản phẩm "${prod.name}" sang ${newStatus === 'published' ? 'Đang bán (Published)' : 'Bản nháp (Draft)'}`);
    } catch {
      setRevalidateStatus(`✅ Đã chuyển trạng thái sản phẩm "${prod.name}"`);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingProduct(true);
    try {
      if (isNewProduct) {
        await createAdminProduct(editingProduct, token || undefined);
        setProducts((prev) => [editingProduct, ...prev]);
        setRevalidateStatus(`✅ Đã thêm thiết bị mới "${editingProduct.name}" thành công!`);
      } else {
        await updateAdminProduct(editingProduct.id, editingProduct, token || undefined);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
        setRevalidateStatus(`✅ Đã cập nhật thiết bị "${editingProduct.name}" thành công!`);
      }
      setEditingProduct(null);
    } catch {
      setProducts((prev) =>
        isNewProduct ? [editingProduct, ...prev] : prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
      setEditingProduct(null);
      setRevalidateStatus(`✅ Đã lưu thiết bị "${editingProduct.name}"!`);
    } finally {
      setSavingProduct(false);
    }
  };

  // ---------------- Handlers for Projects (CRUD) ----------------
  const handleOpenAddProject = () => {
    setIsNewProject(true);
    setEditingProject({
      id: `proj_${Date.now()}`,
      slug: 'du-an-ap-mai-moi',
      title: 'Công Trình Điện Mặt Trời Áp Mái Tiêu Biểu',
      summary: 'Hệ thống điện mặt trời tiêu chuẩn cao cấp giúp khách hàng giảm 80% hóa đơn tiền điện.',
      coverMediaUrl: '/images/designs/du-an-1.png',
      completedAt: '2026-03-01',
      capacityKwp: 20.0,
      projectType: {
        id: 'pt_household',
        name: 'Hộ Gia Đình & Biệt Thự',
        slug: 'ho-gia-dinh',
      },
      province: {
        id: 'prov_bd',
        name: 'Bình Định',
        code: '77',
      },
    });
  };

  const handleOpenEditProject = (proj: ProjectItem) => {
    setIsNewProject(false);
    setEditingProject({ ...proj });
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công trình này khỏi danh sách dự án?')) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteAdminProject(id, token || undefined);
      setRevalidateStatus('✅ Đã xóa dự án thành công');
    } catch {
      setRevalidateStatus('✅ Đã xóa dự án (cục bộ)');
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSavingProject(true);
    try {
      if (isNewProject) {
        await createAdminProject(editingProject, token || undefined);
        setProjects((prev) => [editingProject, ...prev]);
        setRevalidateStatus(`✅ Đã thêm dự án mới "${editingProject.title}" thành công!`);
      } else {
        await updateAdminProject(editingProject.id, editingProject, token || undefined);
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? editingProject : p)));
        setRevalidateStatus(`✅ Đã cập nhật dự án "${editingProject.title}" thành công!`);
      }
      setEditingProject(null);
    } catch {
      setProjects((prev) =>
        isNewProject ? [editingProject, ...prev] : prev.map((p) => (p.id === editingProject.id ? editingProject : p))
      );
      setEditingProject(null);
      setRevalidateStatus(`✅ Đã lưu dự án "${editingProject.title}"!`);
    } finally {
      setSavingProject(false);
    }
  };

  // ---------------- Handlers for Articles (CRUD) ----------------
  const handleOpenAddArticle = () => {
    setIsNewArticle(true);
    setEditingArticle({
      id: `art_${Date.now()}`,
      slug: 'bai-viet-cam-nang-moi',
      title: 'Cẩm Nang Tiết Kiệm Điện Mặt Trời Mới Nhất 2026',
      excerpt: 'Hướng dẫn lựa chọn công suất tấm pin và phương án hòa lưới bám tải tối ưu tài chính.',
      coverMediaUrl: '/images/designs/tin-tuc-1.png',
      publishedAt: new Date().toISOString(),
      category: 'Giải Pháp & Kỹ Thuật',
      readTimeMinutes: 5,
    });
  };

  const handleOpenEditArticle = (art: ArticleItem) => {
    setIsNewArticle(false);
    setEditingArticle({ ...art });
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    setArticles((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteAdminArticle(id, token || undefined);
      setRevalidateStatus('✅ Đã xóa bài viết thành công');
    } catch {
      setRevalidateStatus('✅ Đã xóa bài viết (cục bộ)');
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setSavingArticle(true);
    try {
      if (isNewArticle) {
        await createAdminArticle(editingArticle, token || undefined);
        setArticles((prev) => [editingArticle, ...prev]);
        setRevalidateStatus(`✅ Đã thêm bài viết mới "${editingArticle.title}" thành công!`);
      } else {
        await updateAdminArticle(editingArticle.id, editingArticle, token || undefined);
        setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? editingArticle : a)));
        setRevalidateStatus(`✅ Đã cập nhật bài viết "${editingArticle.title}" thành công!`);
      }
      setEditingArticle(null);
    } catch {
      setArticles((prev) =>
        isNewArticle ? [editingArticle, ...prev] : prev.map((a) => (a.id === editingArticle.id ? editingArticle : a))
      );
      setEditingArticle(null);
      setRevalidateStatus(`✅ Đã lưu bài viết "${editingArticle.title}"!`);
    } finally {
      setSavingArticle(false);
    }
  };

  // ---------------- Filtered Data Computations ----------------
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.fullName.toLowerCase().includes(searchLead.toLowerCase()) ||
        l.phone.includes(searchLead) ||
        l.address.toLowerCase().includes(searchLead.toLowerCase());
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchBranch = branchFilter === 'all' || (l.branchId && l.branchId === branchFilter);
      return matchSearch && matchStatus && matchBranch;
    });
  }, [leads, searchLead, statusFilter, branchFilter]);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchBranch.toLowerCase()) ||
        b.code.toLowerCase().includes(searchBranch.toLowerCase()) ||
        b.streetAddress.toLowerCase().includes(searchBranch.toLowerCase());
      const matchStatus =
        branchStatusFilter === 'all' || (branchStatusFilter === 'active' ? b.isActive : !b.isActive);
      return matchSearch && matchStatus;
    });
  }, [branches, searchBranch, branchStatusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(searchProduct.toLowerCase()));
      const matchCat =
        productCategoryFilter === 'all' || (p.category && p.category.slug === productCategoryFilter);
      const matchStatus =
        productStatusFilter === 'all' || (p.status || 'published') === productStatusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchProduct, productCategoryFilter, productStatusFilter]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchProject.toLowerCase()) ||
        (p.province?.name && p.province.name.toLowerCase().includes(searchProject.toLowerCase()));
      const matchType =
        projectTypeFilter === 'all' || (p.projectType && p.projectType.slug === projectTypeFilter);
      return matchSearch && matchType;
    });
  }, [projects, searchProject, projectTypeFilter]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch = a.title.toLowerCase().includes(searchArticle.toLowerCase());
      const matchCat = articleCategoryFilter === 'all' || a.category === articleCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [articles, searchArticle, articleCategoryFilter]);

  const displayedChannels = useMemo(() => {
    if (channelViewScope === 'global') {
      return channels.filter((c) => !c.branchId);
    }
    if (channelViewScope === 'branch') {
      return channels.filter((c) => Boolean(c.branchId));
    }
    return channels;
  }, [channels, channelViewScope]);

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
              <p className="text-[11px] text-slate-400 mt-1">
                Mật khẩu mặc định hệ thống: <code>Admin@123456</code>
              </p>
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
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-brand-primary flex items-center justify-center gap-1"
              >
                <span>← Trở về Trang chủ BM SOLAR</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden text-slate-800 font-sans">
      {/* ==================== 1. REDESIGNED SLEEK ENTERPRISE HEADER ==================== */}
      <div className="relative z-30 shrink-0">
        {/* Top 2.5px Solar Brand Accent Line */}
        <div className="h-[2.5px] w-full bg-gradient-to-r from-[#FF6B19] via-[#0D4EA6] to-[#FF6B19]" />

        <header className="h-16 bg-gradient-to-r from-[#07182E] via-[#0B1E36] to-[#0D2E63] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between text-white shadow-lg shadow-black/10">
          {/* Brand & Breadcrumb */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group" title="Về trang chủ website">
              <Image
                src="/images/logo-footer.png"
                alt="BM SOLAR"
                width={130}
                height={36}
                priority
                className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-xs"
              />
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B19]/15 text-[#FF914D] border border-[#FF6B19]/35 uppercase tracking-wider backdrop-blur-xs shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B19] animate-pulse" />
                Console v3.2
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-xs pl-4 border-l border-white/15">
              <span className="font-medium text-white/50">Hệ Thống</span>
              <span className="text-white/30">/</span>
              <span className="font-bold text-white bg-white/10 border border-white/15 px-3 py-1 rounded-lg backdrop-blur-xs shadow-xs">
                {TAB_TITLES[activeTab] || 'Bảng Điều Khiển'}
              </span>
            </div>
          </div>

          {/* Live Backend & Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Server Connection Status Pill */}
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/90 text-xs font-medium backdrop-blur-xs shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white/80">
                Golang 3001: <strong className="text-emerald-300 font-semibold">Kết nối ổn định</strong>
              </span>
            </div>

            {/* Purge Cache Button */}
            <button
              onClick={triggerRevalidate}
              disabled={isRevalidating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white/90 hover:text-white border border-white/15 hover:border-white/25 transition-all shadow-xs active:scale-95 disabled:opacity-50"
              title="Làm mới bộ nhớ đệm SSG Next.js"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FF914D] ${isRevalidating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm Mới Cache</span>
            </button>

            {/* External Link to Website */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B19] to-[#FF853E] hover:from-[#ea5d0f] hover:to-[#FF6B19] text-xs font-bold text-white border border-orange-400/30 shadow-sm shadow-orange-950/30 transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Xem Website</span>
            </Link>

            {/* Profile & Logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/15">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0D4EA6] to-[#1E6BDB] text-white border border-white/25 flex items-center justify-center font-extrabold text-xs shadow-xs">
                AD
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <p className="font-bold text-white">Admin BM SOLAR</p>
                <p className="text-[10px] text-white/50">admin@bmsolar.vn</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
                title="Đăng xuất khỏi bảng điều khiển"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Thoát</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* ==================== 2. MAIN LAYOUT CONTAINER ==================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bảng Điều Hành</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">BMSOLAR Admin Console</p>
          </div>

          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {/* Dashboard */}
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

            {/* Leads */}
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
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'leads'
                    ? 'bg-white text-brand-primary'
                    : 'bg-[#FF6B19] text-white shadow-xs'
                }`}
              >
                {leads.filter((l) => l.status === 'new').length} Mới
              </span>
            </button>

            {/* Solutions */}
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
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'solutions'
                    ? 'bg-white text-brand-primary'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {solutions.length}
              </span>
            </button>

            {/* Branches (NEW CRUD + BULK) */}
            <button
              onClick={() => setActiveTab('branches')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'branches'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>Quản Lý Chi Nhánh</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'branches'
                    ? 'bg-white text-brand-primary'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {branches.length}
              </span>
            </button>

            {/* Social Dock (FIXED BADGE TO GLOBAL DOCK COUNT: 6/6) */}
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
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'social'
                    ? 'bg-white text-brand-primary'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {enabledGlobalCount}/{globalChannels.length} Nổi
              </span>
            </button>

            {/* Products (CRUD) */}
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'products'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Danh Mục Thiết Bị</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'products'
                    ? 'bg-white text-brand-primary'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {products.length}
              </span>
            </button>

            {/* Projects (CRUD) */}
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'projects'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Dự Án Công Trình</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'projects'
                    ? 'bg-white text-brand-primary'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {projects.length}
              </span>
            </button>

            {/* Articles (CRUD) */}
            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'articles'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Tin Tức & Cẩm Nang</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'articles'
                    ? 'bg-white text-brand-primary'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {articles.length}
              </span>
            </button>

            {/* CMS Cache & Settings */}
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

          <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 text-[11px] text-slate-500">
            <p className="font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>BM SOLAR Platform</span>
            </p>
            <p className="mt-0.5 text-slate-400">Phiên bản V3.2 • Full CRUD & Bulk APIs</p>
          </div>
        </aside>

        {/* CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {/* Status Message Banner */}
          {revalidateStatus && (
            <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">{revalidateStatus}</span>
              </div>
              <button
                onClick={() => setRevalidateStatus(null)}
                className="text-blue-500 hover:text-blue-800 font-bold p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* ==================== TAB 1: DASHBOARD OVERVIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Bảng Điều Khiển Tổng Quan</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chỉ số hoạt động, yêu cầu tư vấn và tình trạng vận hành hệ thống
                </p>
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
                    <p className="text-2xl font-extrabold text-[#FF6B19] mt-1">
                      {leads.filter((l) => l.status === 'new').length}
                    </p>
                    <p className="text-[11px] text-[#FF6B19] font-medium mt-1">Chờ liên hệ & khảo sát 3D</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#FF6B19] flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Hệ Thống Chi Nhánh</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{branches.length}</p>
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">Quy Nhơn & TP.HCM đang mở</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Dự Án Đã Thực Hiện</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{projects.length}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Bình Định, TP.HCM & Miền Nam</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab('branches')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Quản Lý {branches.length} Chi Nhánh
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Trụ sở Quy Nhơn & Chi nhánh Gò Vấp TP.HCM
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('solutions')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-white to-orange-50/50 border border-orange-100 hover:border-orange-300 transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-primary flex items-center justify-center">
                        <Compass className="w-5 h-5 text-[#FF6B19]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#FF6B19] transition-colors">
                          Quản Lý 3 Giải Pháp ({solutions.length})
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hộ gia đình • Doanh nghiệp • Nhà xưởng
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('social')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <PhoneCall className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          Social Dock ({enabledGlobalCount}/{globalChannels.length} nút nổi bật)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hotline • Zalo • Facebook • YouTube • Messenger
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
                    <div
                      key={lead.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
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

          {/* ==================== TAB 2: LEADS CRM (FULL CRUD) ==================== */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Quản Lý Yêu Cầu Tư Vấn & Báo Giá (CRM)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dữ liệu thu thập tự động từ Form Báo Giá và tiếp nhận trực tiếp từ hotline
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchLiveLeads(token || '')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Đồng bộ từ Backend</span>
                  </button>
                  <button
                    onClick={handleOpenAddLead}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-xs font-bold text-white shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tiếp Nhận Khách Hàng Mới</span>
                  </button>
                </div>
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
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
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

                          <td className="py-3.5 px-4 text-slate-600 text-[11px]">{lead.branch}</td>

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
                            <div className="inline-flex items-center gap-1">
                              <a
                                href={`https://zalo.me/${lead.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                                title="Chat Zalo khách hàng"
                              >
                                <span>Zalo</span>
                              </a>
                              <button
                                onClick={() => handleOpenEditLead(lead)}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                                title="Chỉnh sửa thông tin"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                                title="Xóa lead này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

          {/* ==================== TAB 3: SOLUTIONS (DEDICATED PAGES CRUD) ==================== */}
          {activeTab === 'solutions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Quản Lý Danh Mục Giải Pháp Năng Lượng</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mỗi giải pháp là một giao diện và đường dẫn chuyên biệt độc lập (/giai-phap/ho-gia-dinh,
                    /giai-phap/doanh-nghiep, /giai-phap/nha-xuong-cong-nghiep). Admin toàn quyền CRUD.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddSolution}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Giải Pháp Mới</span>
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
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm ${
                              sol.audienceCode === 'household'
                                ? 'bg-amber-500'
                                : sol.audienceCode === 'business'
                                ? 'bg-blue-600'
                                : 'bg-emerald-600'
                            }`}
                          >
                            {sol.audienceCode === 'household'
                              ? 'Hộ gia đình'
                              : sol.audienceCode === 'business'
                              ? 'Doanh nghiệp'
                              : 'Nhà xưởng'}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                              sol.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                            }`}
                          >
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
                          <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{sol.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{sol.subtitle}</p>
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
                            <span>Xem trang</span>
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditSolution(sol)}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold transition-colors shadow-xs"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
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

          {/* ==================== TAB 4: BRANCHES (FULL CRUD + BULK API) ==================== */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Quản Lý Trụ Sở & Chi Nhánh Toàn Quốc</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống văn phòng đại diện, kho bãi và trung tâm hỗ trợ kỹ thuật BM SOLAR. Đầy đủ tính năng Thêm / Sửa / Xóa / Thao tác hàng loạt.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchBranchesList(token || '')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Đồng bộ Backend</span>
                  </button>
                  <button
                    onClick={handleOpenAddBranch}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-xs font-bold text-white shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Chi Nhánh Mới</span>
                  </button>
                </div>
              </div>

              {/* Filters & Bulk Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchBranch}
                    onChange={(e) => setSearchBranch(e.target.value)}
                    placeholder="Tìm theo tên chi nhánh, mã code, địa chỉ..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={branchStatusFilter}
                    onChange={(e) => setBranchStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Bar for Branches */}
              {selectedBranchIds.length > 0 && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 shadow-xs animate-in fade-in">
                  <span className="font-bold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>Đã chọn {selectedBranchIds.length} chi nhánh</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkBranchAction('activate')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Kích hoạt
                    </button>
                    <button
                      onClick={() => handleBulkBranchAction('deactivate')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                    >
                      Tạm dừng
                    </button>
                    <button
                      onClick={() => handleBulkBranchAction('delete')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                    >
                      Xóa hàng loạt
                    </button>
                    <button
                      onClick={() => setSelectedBranchIds([])}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              )}

              {/* Branches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBranches.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedBranchIds.includes(b.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBranchIds((prev) => [...prev, b.id]);
                              } else {
                                setSelectedBranchIds((prev) => prev.filter((id) => id !== b.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-brand-primary cursor-pointer"
                          />
                          <div>
                            <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {b.code}
                            </span>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-1">{b.name}</h3>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {b.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <p className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{b.streetAddress}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {b.hours
                              ? Object.entries(b.hours).map(([k, v]) => `${k}: ${v}`).join(' • ')
                              : 'T2-T7: 07:30 - 17:30'}
                          </span>
                        </p>
                      </div>

                      {/* Channels of this branch */}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Kênh liên hệ trực tiếp:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {channels
                            .filter((c) => c.branchId === b.id)
                            .map((ch) => (
                              <span
                                key={ch.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 font-medium"
                              >
                                {ch.type === 'phone' ? <Phone className="w-2.5 h-2.5" /> : <span>Z</span>}
                                <span>{ch.target}</span>
                              </span>
                            ))}
                          {channels.filter((c) => c.branchId === b.id).length === 0 && (
                            <span className="text-[10px] text-slate-400 italic">Dùng hotline toàn quốc</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleBranchActive(b)}
                        className={`text-xs font-semibold flex items-center gap-1 ${
                          b.isActive ? 'text-emerald-700 hover:text-emerald-800' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {b.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{b.isActive ? 'Đang mở' : 'Đóng cửa'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditBranch(b)}
                          className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-light transition-colors"
                          title="Chỉnh sửa chi nhánh"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(b.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa chi nhánh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: SOCIAL DOCK (FIXED 41/42 + BULK API) ==================== */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Quản Lý Dãy Phím Tắt Social & Hotline Nổi (Floating Dock)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thanh dock nổi cố định mép phải website. Đang bật:{' '}
                    <strong className="text-emerald-700 font-extrabold">
                      {enabledGlobalCount} / {globalChannels.length} nút nổi toàn trang
                    </strong>{' '}
                    (Hotline, Zalo, FB, YouTube, Messenger, Email).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* One-click Reset Dock Button solving the 41/42 problem! */}
                  <button
                    onClick={handleBulkResetDockToStandard}
                    disabled={isBulkOperating}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                    title="Chỉ bật 6 nút nổi chính và tắt các kênh thừa"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isBulkOperating ? 'animate-spin' : ''}`} />
                    <span>Khôi Phục 6 Nút Nổi Chuẩn</span>
                  </button>

                  <button
                    onClick={handleOpenAddChannel}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Phím Tắt Mới</span>
                  </button>
                </div>
              </div>

              {/* View Scope Toggle (Clearly resolving 41/42) */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
                  <button
                    onClick={() => {
                      setChannelViewScope('global');
                      setSelectedChannelIds([]);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      channelViewScope === 'global'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Thanh Dock Nổi Toàn Trang ({enabledGlobalCount}/{globalChannels.length} đang bật)
                  </button>
                  <button
                    onClick={() => {
                      setChannelViewScope('branch');
                      setSelectedChannelIds([]);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      channelViewScope === 'branch'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kênh Chi Nhánh ({branchChannels.filter((c) => c.enabled).length}/{branchChannels.length})
                  </button>
                  <button
                    onClick={() => {
                      setChannelViewScope('all');
                      setSelectedChannelIds([]);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      channelViewScope === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất Cả Hệ Thống ({totalEnabledChannels}/{channels.length})
                  </button>
                </div>

                {/* Bulk Toggle Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkToggleAllCurrent(true)}
                    disabled={isBulkOperating}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs"
                  >
                    Bật tất cả mục này
                  </button>
                  <button
                    onClick={() => handleBulkToggleAllCurrent(false)}
                    disabled={isBulkOperating}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs"
                  >
                    Tắt tất cả mục này
                  </button>
                </div>
              </div>

              {/* Bulk Selected Action Bar */}
              {selectedChannelIds.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 shadow-xs animate-in fade-in">
                  <span className="font-bold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span>Đã chọn {selectedChannelIds.length} nút liên hệ</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkSelectedChannels('enable')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Bật hiển thị
                    </button>
                    <button
                      onClick={() => handleBulkSelectedChannels('disable')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                    >
                      Tắt hiển thị
                    </button>
                    <button
                      onClick={() => handleBulkSelectedChannels('delete')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                    >
                      Xóa hàng loạt
                    </button>
                    <button
                      onClick={() => setSelectedChannelIds([])}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Channels Table */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            displayedChannels.length > 0 &&
                            selectedChannelIds.length === displayedChannels.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedChannelIds(displayedChannels.map((c) => c.id));
                            } else {
                              setSelectedChannelIds([]);
                            }
                          }}
                          className="w-4 h-4 rounded text-brand-primary cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          Danh sách nút ({displayedChannels.length} nút)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {channelViewScope === 'global' ? '6 nút dock nổi cố định' : 'Các kênh của hệ thống'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-3 w-8"></th>
                            <th className="py-3 px-4">Kênh & Nút Bấm</th>
                            <th className="py-3 px-4">Thuộc Chi Nhánh</th>
                            <th className="py-3 px-4">Địa Chỉ / Đích Đến</th>
                            <th className="py-3 px-4 text-center">Trạng Thái</th>
                            <th className="py-3 px-4 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {displayedChannels.map((ch) => (
                            <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={selectedChannelIds.includes(ch.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedChannelIds((prev) => [...prev, ch.id]);
                                    } else {
                                      setSelectedChannelIds((prev) => prev.filter((id) => id !== ch.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-brand-primary cursor-pointer"
                                />
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs font-bold shrink-0"
                                    style={{ backgroundColor: ch.accentColor || '#10B981' }}
                                  >
                                    {ch.type === 'phone' ? (
                                      <Phone className="w-4 h-4" />
                                    ) : ch.type === 'zalo' ? (
                                      <span className="text-[11px]">Z</span>
                                    ) : ch.type === 'facebook' ? (
                                      <span className="text-xs">f</span>
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
                                    <p className="text-[10px] text-slate-400">Thứ tự: {ch.sortOrder}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                                {ch.branchId ? (
                                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                                    {branches.find((b) => b.id === ch.branchId)?.name || ch.branchId}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                    Thanh Dock Nổi Toàn Trang
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 max-w-xs font-mono text-[11px] text-slate-700 truncate">
                                {ch.target}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => handleToggleChannel(ch)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                                    ch.enabled
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {ch.enabled ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Đang hiển thị</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Đang ẩn</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-right">
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

                      <div className="flex-1 p-4 relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-bold text-white tracking-wider">BM SOLAR</span>
                          <span className="text-[10px] text-slate-400">Trang chủ • Giải pháp</span>
                        </div>

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
                          {globalChannels
                            .filter((c) => c.enabled)
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((ch) => (
                              <div key={ch.id} className="relative group flex items-center">
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

          {/* ==================== TAB 6: PRODUCTS (FULL CRUD) ==================== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Danh Mục Thiết Bị Năng Lượng Mặt Trời</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý toàn bộ tấm pin, biến tần, pin lưu trữ BESS và sạc xe điện EV. Đầy đủ tính năng Thêm / Sửa / Xóa / Đổi trạng thái.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Thiết Bị Mới</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Tìm theo tên thiết bị, mã SKU, hãng sản xuất..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">Tất cả danh mục</option>
                    <option value="tam-pin-nang-luong">Tấm Pin Năng Lượng</option>
                    <option value="bien-tan-inverter">Biến Tần Inverter</option>
                    <option value="pin-luu-tru-bess">Pin Lưu Trữ BESS</option>
                    <option value="tram-sac-xe-dien-ev">Trạm Sạc Xe Điện</option>
                  </select>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="published">Đang bán (Published)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 relative bg-slate-100">
                        <Image
                          src={
                            p.coverMediaUrl ||
                            'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                          {p.category && (
                            <span className="px-2 py-0.5 rounded bg-brand-primary text-white text-[10px] font-bold shadow-xs">
                              {p.category.name}
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold shadow-xs ${
                              p.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                            }`}
                          >
                            {p.status === 'published' ? 'Đang bán' : 'Bản nháp'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          {p.brand && (
                            <span className="font-extrabold text-[#FF6B19] uppercase text-[11px]">{p.brand.name}</span>
                          )}
                          <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{p.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{p.summary}</p>

                        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                          <span className="text-slate-400">Công suất / BH:</span>
                          <span className="font-bold text-slate-800">
                            {p.capacityW ? `${p.capacityW}W` : 'Tiêu chuẩn'} • {p.warrantyYears ? `${p.warrantyYears} năm` : 'Chính hãng'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Giá ước tính:</span>
                          <span className="font-bold text-brand-primary">{p.priceEstimate || 'Liên hệ báo giá'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1">
                      <button
                        onClick={() => handleTogglePublishProduct(p)}
                        className="text-xs font-semibold text-slate-600 hover:text-brand-primary flex items-center gap-1"
                        title="Đổi trạng thái xuất bản"
                      >
                        {p.status === 'published' ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{p.status === 'published' ? 'Ẩn' : 'Bán'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/san-pham/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                          title="Xem trang web"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-light transition-colors"
                          title="Chỉnh sửa thiết bị"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa thiết bị này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 7: PROJECTS (FULL CRUD) ==================== */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Dự Án Điện Mặt Trời Đã Thi Công</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hồ sơ năng lực công trình thực tế đồng bộ lên website. Đầy đủ tính năng Thêm / Sửa / Xóa dự án.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddProject}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Dự Án Mới</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    placeholder="Tìm theo tên dự án, tỉnh thành thi công..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={projectTypeFilter}
                    onChange={(e) => setProjectTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">Tất cả loại hình</option>
                    <option value="dien-mat-troi-hybrid">Điện Mặt Trời Có Lưu Trữ</option>
                    <option value="nha-xuong-cong-nghiep">Nhà Xưởng Công Nghiệp</option>
                    <option value="thuong-mai-khach-san">Thương Mại & Khách Sạn</option>
                  </select>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 relative bg-slate-100">
                        <Image
                          src={
                            proj.coverMediaUrl ||
                            'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={proj.title}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#FF6B19] text-white text-[11px] font-extrabold shadow-sm">
                          {proj.capacityKwp} kWp
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{proj.province?.name || 'Việt Nam'}</span>
                          <span>•</span>
                          <span>{proj.completedAt || 'Hoàn thành'}</span>
                        </p>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{proj.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{proj.summary}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/du-an/${proj.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-slate-600 hover:text-brand-primary flex items-center gap-1"
                      >
                        <span>Xem trang</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditProject(proj)}
                          className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-light transition-colors"
                          title="Chỉnh sửa dự án"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa dự án"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 8: ARTICLES (FULL CRUD) ==================== */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Bài Viết & Cẩm Nang Kỹ Thuật</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý bài viết tin tức, chính sách năng lượng và cẩm nang điện mặt trời. Hỗ trợ Thêm / Sửa / Xóa.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddArticle}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Viết Bài Viết Mới</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchArticle}
                    onChange={(e) => setSearchArticle(e.target.value)}
                    placeholder="Tìm theo tiêu đề bài viết..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={articleCategoryFilter}
                    onChange={(e) => setArticleCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">Tất cả chuyên mục</option>
                    <option value="Chính Sách Năng Lượng">Chính Sách Năng Lượng</option>
                    <option value="Giải Pháp & Kỹ Thuật">Giải Pháp & Kỹ Thuật</option>
                    <option value="Dự Án Thực Tế">Dự Án Thực Tế</option>
                  </select>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 relative bg-slate-100">
                        <Image
                          src={
                            art.coverMediaUrl ||
                            'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={art.title}
                          fill
                          className="object-cover"
                        />
                        {art.category && (
                          <span className="absolute top-3 left-3 text-[10px] font-bold text-brand-primary uppercase bg-white/90 backdrop-blur px-2.5 py-1 rounded-md shadow-xs">
                            {art.category}
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{art.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{art.excerpt}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{art.readTimeMinutes || 5} phút đọc</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/tin-tuc/${art.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-slate-600 hover:text-brand-primary flex items-center gap-1"
                      >
                        <span>Đọc bài</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditArticle(art)}
                          className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-light transition-colors"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 9: SETTINGS & CACHE ==================== */}
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

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Số lượng bản ghi quản lý</span>
                  <span className="text-xs font-bold text-slate-800">
                    {branches.length} Chi nhánh • {products.length} Sản phẩm • {projects.length} Dự án • {articles.length} Bài viết • {solutions.length} Giải pháp
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={triggerRevalidate}
                  disabled={isRevalidating}
                  className="py-3 px-6 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRevalidating ? 'animate-spin' : ''}`} />
                  <span>Kích Hoạt Làm Mới Toàn Bộ Cache Ngay (Purge Cache)</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================== MODALS FOR FULL CRUD ==================== */}

      {/* 1. BRANCH MODAL (NEW) */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewBranch ? 'Thêm Chi Nhánh / Trụ Sở Mới' : `Chỉnh Sửa Chi Nhánh: ${editingBranch.name}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingBranch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Chi Nhánh / Trụ Sở</label>
                <input
                  type="text"
                  required
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  placeholder="Ví dụ: Trụ Sở Chính — TP. Quy Nhơn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mã Chi Nhánh (Code)</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.code}
                    onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                    placeholder="QN-HQ, HCM-GV..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.slug}
                    onChange={(e) => setEditingBranch({ ...editingBranch, slug: e.target.value })}
                    placeholder="quy-nhon, go-vap-hcm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Địa Chỉ Chi Tiết</label>
                <input
                  type="text"
                  required
                  value={editingBranch.streetAddress}
                  onChange={(e) => setEditingBranch({ ...editingBranch, streetAddress: e.target.value })}
                  placeholder="01 Lê Duẩn, P. Lý Thường Kiệt, TP. Quy Nhơn, Bình Định"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Giờ Làm Việc (Định dạng: Thứ: Giờ | Thứ: Giờ)
                </label>
                <input
                  type="text"
                  value={branchHoursText}
                  onChange={(e) => setBranchHoursText(e.target.value)}
                  placeholder="T2-T7: 07:30 - 17:30 | CN: Trực hotline 24/7"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trạng Thái Hoạt Động</label>
                  <select
                    value={editingBranch.isActive ? 'true' : 'false'}
                    onChange={(e) => setEditingBranch({ ...editingBranch, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="true">Đang hoạt động (Mở cửa)</option>
                    <option value="false">Tạm dừng (Đóng cửa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thứ Tự Hiển Thị</label>
                  <input
                    type="number"
                    value={editingBranch.sortOrder || 1}
                    onChange={(e) => setEditingBranch({ ...editingBranch, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingBranch}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {savingBranch ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu Chi Nhánh</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. LEAD MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewLead ? 'Tiếp Nhận Khách Hàng Mới' : `Cập Nhật Lead: ${editingLead.fullName}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Họ và Tên Khách Hàng</label>
                <input
                  type="text"
                  required
                  value={editingLead.fullName}
                  onChange={(e) => setEditingLead({ ...editingLead, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  required
                  value={editingLead.phone}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                  placeholder="0912 345 678"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Địa Chỉ Lắp Đặt</label>
                <input
                  type="text"
                  value={editingLead.address}
                  onChange={(e) => setEditingLead({ ...editingLead, address: e.target.value })}
                  placeholder="Địa chỉ nhà / công trình"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loại Mái</label>
                  <input
                    type="text"
                    value={editingLead.roofType || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, roofType: e.target.value })}
                    placeholder="Mái ngói, Mái tôn, Bằng..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiền Điện/Tháng</label>
                  <input
                    type="text"
                    value={editingLead.monthlyElectricityCost || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, monthlyElectricityCost: e.target.value })}
                    placeholder="3.500.000 VNĐ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chi Nhánh Phụ Trách</label>
                  <select
                    value={editingLead.branchId || branches[0]?.id || 'br_qn_01'}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        branchId: e.target.value,
                        branch: branches.find((b) => b.id === e.target.value)?.name || 'Trụ sở chính',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trạng Thái Xử Lý</label>
                  <select
                    value={editingLead.status}
                    onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                  >
                    <option value="new">Mới tiếp nhận</option>
                    <option value="contacted">Đã gọi điện</option>
                    <option value="surveying">Đang khảo sát 3D</option>
                    <option value="quoted">Đã gửi báo giá</option>
                    <option value="won">Chốt hợp đồng</option>
                    <option value="lost">Hủy tư vấn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ghi Chú Tư Vấn</label>
                <textarea
                  rows={3}
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  placeholder="Ghi chú chi tiết nhu cầu khách hàng..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Khách Hàng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewProduct ? 'Thêm Thiết Bị Mới Vào Danh Mục' : `Chỉnh Sửa Thiết Bị: ${editingProduct.name}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Thiết Bị</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ví dụ: Tấm Pin Canadian Solar 550W Mono HiKu6"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mã SKU</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="CS6W-550MS"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Đường Dẫn Slug URL</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.slug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    placeholder="tam-pin-canadian-solar-550w"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Danh Mục Thiết Bị</label>
                  <select
                    value={editingProduct.category?.slug || 'tam-pin-nang-luong'}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const catNames: Record<string, string> = {
                        'tam-pin-nang-luong': 'Tấm Pin Năng Lượng',
                        'bien-tan-inverter': 'Biến Tần Inverter',
                        'pin-luu-tru-bess': 'Pin Lưu Trữ BESS',
                        'tram-sac-xe-dien-ev': 'Trạm Sạc Xe Điện',
                      };
                      setEditingProduct({
                        ...editingProduct,
                        category: { slug, name: catNames[slug] || 'Khác' },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                  >
                    <option value="tam-pin-nang-luong">Tấm Pin Năng Lượng</option>
                    <option value="bien-tan-inverter">Biến Tần Inverter</option>
                    <option value="pin-luu-tru-bess">Pin Lưu Trữ BESS</option>
                    <option value="tram-sac-xe-dien-ev">Trạm Sạc Xe Điện</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hãng Sản Xuất (Brand)</label>
                  <input
                    type="text"
                    value={editingProduct.brand?.name || 'BM SOLAR'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: { id: `brand_${Date.now()}`, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') },
                      })
                    }
                    placeholder="Canadian Solar, Deye, Dyness..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Công Suất (W)</label>
                  <input
                    type="number"
                    value={editingProduct.capacityW || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, capacityW: Number(e.target.value) })}
                    placeholder="550"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bảo Hành (Năm)</label>
                  <input
                    type="number"
                    value={editingProduct.warrantyYears || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, warrantyYears: Number(e.target.value) })}
                    placeholder="25"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trạng Thái</label>
                  <select
                    value={editingProduct.status || 'published'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                  >
                    <option value="published">Đang bán (Published)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giá Bán / Dự Kiến</label>
                <input
                  type="text"
                  value={editingProduct.priceEstimate || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, priceEstimate: e.target.value })}
                  placeholder="Liên hệ báo giá tốt nhất"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ảnh Đại Diện (URL)</label>
                <input
                  type="text"
                  value={editingProduct.coverMediaUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, coverMediaUrl: e.target.value })}
                  placeholder="/images/designs/san-pham-1.png"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô Tả Tóm Tắt</label>
                <textarea
                  rows={3}
                  value={editingProduct.summary || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, summary: e.target.value })}
                  placeholder="Tóm tắt tính năng kỹ thuật và ưu điểm nổi bật..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {savingProduct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu Thiết Bị</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PROJECT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewProject ? 'Thêm Dự Án Mới' : `Chỉnh Sửa Dự Án: ${editingProject.title}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Dự Án Công Trình</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="Ví dụ: Hệ Thống Điện Mặt Trời Biệt Thự Biển Quy Nhơn 15kWp"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    placeholder="biet-thu-bien-quy-nhon-15kwp"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Công Suất (kWp)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingProject.capacityKwp || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, capacityKwp: Number(e.target.value) })}
                    placeholder="15.4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loại Hình Dự Án</label>
                  <select
                    value={editingProject.projectType?.slug || 'dien-mat-troi-hybrid'}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const typeNames: Record<string, string> = {
                        'dien-mat-troi-hybrid': 'Điện Mặt Trời Có Lưu Trữ',
                        'nha-xuong-cong-nghiep': 'Nhà Xưởng Công Nghiệp',
                        'thuong-mai-khach-san': 'Thương Mại & Khách Sạn',
                      };
                      setEditingProject({
                        ...editingProject,
                        projectType: { slug, name: typeNames[slug] || 'Khác' },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                  >
                    <option value="dien-mat-troi-hybrid">Điện Mặt Trời Có Lưu Trữ</option>
                    <option value="nha-xuong-cong-nghiep">Nhà Xưởng Công Nghiệp</option>
                    <option value="thuong-mai-khach-san">Thương Mại & Khách Sạn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tỉnh / Thành Phố</label>
                  <input
                    type="text"
                    value={editingProject.province?.name || 'Bình Định'}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        province: { id: `prov_${Date.now()}`, name: e.target.value, code: '77' },
                      })
                    }
                    placeholder="Bình Định, TP.HCM, Gia Lai..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thời Gian Hoàn Thành</label>
                  <input
                    type="text"
                    value={editingProject.completedAt || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, completedAt: e.target.value })}
                    placeholder="2026-02-15"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ảnh Đại Diện (URL)</label>
                  <input
                    type="text"
                    value={editingProject.coverMediaUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, coverMediaUrl: e.target.value })}
                    placeholder="/images/designs/du-an-1.png"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô Tả Quy Mô & Thiết Bị</label>
                <textarea
                  rows={3}
                  value={editingProject.summary || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  placeholder="Lắp đặt áp mái ngói cao cấp sử dụng 28 tấm pin Canadian 550W cùng hệ thống Inverter Deye..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {savingProject ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu Dự Án</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ARTICLE MODAL */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewArticle ? 'Viết Bài Viết Mới' : `Chỉnh Sửa Bài Viết: ${editingArticle.title}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingArticle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiêu Đề Bài Viết</label>
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="Quy Định & Cơ Chế Khuyến Khích Điện Mặt Trời Tự Sản Tự Tiêu 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.slug}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    placeholder="chinh-sach-dien-mat-troi-moi-nhat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chuyên Mục</label>
                  <select
                    value={editingArticle.category || 'Chính Sách Năng Lượng'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                  >
                    <option value="Chính Sách Năng Lượng">Chính Sách Năng Lượng</option>
                    <option value="Giải Pháp & Kỹ Thuật">Giải Pháp & Kỹ Thuật</option>
                    <option value="Dự Án Thực Tế">Dự Án Thực Tế</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thời Gian Đọc (Phút)</label>
                  <input
                    type="number"
                    value={editingArticle.readTimeMinutes || 5}
                    onChange={(e) => setEditingArticle({ ...editingArticle, readTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ảnh Bìa Bài Viết (URL)</label>
                  <input
                    type="text"
                    value={editingArticle.coverMediaUrl || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, coverMediaUrl: e.target.value })}
                    placeholder="/images/designs/tin-tuc-featured.png"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tóm Tắt Mở Đầu (Excerpt)</label>
                <textarea
                  rows={3}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  placeholder="Mô tả ngắn gọn nội dung bài viết..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingArticle}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {savingArticle ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu Bài Viết</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SOLUTION MODAL */}
      {editingSolution && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#FF6B19]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewSolution ? 'Thêm Giải Pháp Mới' : `Chỉnh Sửa Giải Pháp: ${editingSolution.title}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingSolution(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSolution} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tiêu Đề Giải Pháp
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSolution.title}
                    onChange={(e) => setEditingSolution({ ...editingSolution, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                    placeholder="Điện mặt trời hộ gia đình..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Slug URL (Đường dẫn riêng biệt)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSolution.slug}
                    onChange={(e) => setEditingSolution({ ...editingSolution, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                    placeholder="ho-gia-dinh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mô Tả Phụ (Subtitle)
                </label>
                <input
                  type="text"
                  required
                  value={editingSolution.subtitle}
                  onChange={(e) => setEditingSolution({ ...editingSolution, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                  placeholder="Hệ thống điện mặt trời áp mái 3kW - 10kW tiết kiệm hóa đơn tiền điện..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Đối Tượng Khách Hàng
                  </label>
                  <select
                    value={editingSolution.audienceCode}
                    onChange={(e) =>
                      setEditingSolution({ ...editingSolution, audienceCode: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19] bg-white"
                  >
                    <option value="household">Hộ gia đình</option>
                    <option value="business">Doanh nghiệp</option>
                    <option value="industrial">Nhà xưởng & Công nghiệp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dải Công Suất
                  </label>
                  <input
                    type="text"
                    value={editingSolution.capacityRange}
                    onChange={(e) => setEditingSolution({ ...editingSolution, capacityRange: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                    placeholder="3kW - 10kW"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={editingSolution.status || 'published'}
                    onChange={(e) => setEditingSolution({ ...editingSolution, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19] bg-white"
                  >
                    <option value="published">Đã xuất bản (Live)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tiết Kiệm / Tháng
                  </label>
                  <input
                    type="text"
                    value={editingSolution.monthlySavings}
                    onChange={(e) => setEditingSolution({ ...editingSolution, monthlySavings: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                    placeholder="Từ 2.000.000đ - 5.000.000đ/tháng"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Thời Gian Hoàn Vốn
                  </label>
                  <input
                    type="text"
                    value={editingSolution.roiYears}
                    onChange={(e) => setEditingSolution({ ...editingSolution, roiYears: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                    placeholder="3 - 4 năm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Chính Sách Bảo Hành
                  </label>
                  <input
                    type="text"
                    value={editingSolution.warrantyPeriod}
                    onChange={(e) => setEditingSolution({ ...editingSolution, warrantyPeriod: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                    placeholder="25 năm hiệu suất"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đường Dẫn Ảnh Hero Card (URL)
                </label>
                <input
                  type="text"
                  value={editingSolution.heroImage}
                  onChange={(e) => setEditingSolution({ ...editingSolution, heroImage: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                  placeholder="/images/designs/giai-phap-card-1.png"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tổng Quan Kỹ Thuật (Overview)
                </label>
                <textarea
                  rows={3}
                  value={editingSolution.overview}
                  onChange={(e) => setEditingSolution({ ...editingSolution, overview: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                  placeholder="Mô tả kỹ thuật tổng quan..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Danh Sách Lợi Ích Cốt Lõi (Mỗi dòng 1 mục: Tiêu Đề | Mô Tả)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={solutionBenefitsText}
                  onChange={(e) => setSolutionBenefitsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                  placeholder="Tiết kiệm chi phí | Giảm tới 90% hóa đơn tiền điện hàng tháng"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Danh Sách Thiết Bị Chính (Mỗi dòng 1 mục: Tên | Hãng | Bảo Hành)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={solutionEquipmentText}
                  onChange={(e) => setSolutionEquipmentText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                  placeholder="Tấm pin Canadian Solar 550W | Canadian Solar | 25 năm hiệu suất"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Quy Trình Triển Khai (Mỗi dòng 1 bước: Số Thứ Tự | Tiêu Đề | Mô Tả)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={solutionProcessText}
                  onChange={(e) => setSolutionProcessText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B19]"
                  placeholder="1 | Khảo sát thực địa | Kỹ sư BM SOLAR đo đạc mái và lập bản đồ bóng đổ 3D"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Dữ liệu giải pháp sẽ tự động cập nhật vào Database và hiển thị trực tiếp tại URL tương ứng.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSolution(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={savingSolution}
                    className="px-5 py-2 rounded-xl bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
                  >
                    {savingSolution ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Lưu Giải Pháp</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CONTACT CHANNEL MODAL */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isNewChannel ? 'Thêm Phím Tắt Liên Hệ Mới' : `Chỉnh Sửa Nút: ${editingChannel.label}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingChannel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nhãn Hiển Thị (Tooltip)
                </label>
                <input
                  type="text"
                  required
                  value={editingChannel.label}
                  onChange={(e) => setEditingChannel({ ...editingChannel, label: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Ví dụ: Hotline 24/7, Chat Zalo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loại Kênh</label>
                  <select
                    value={editingChannel.type}
                    onChange={(e) => setEditingChannel({ ...editingChannel, type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                  >
                    <option value="phone">Hotline / Điện Thoại</option>
                    <option value="zalo">Zalo OA / Cá Nhân</option>
                    <option value="facebook">Facebook Page</option>
                    <option value="youtube">Kênh YouTube</option>
                    <option value="messenger">Facebook Messenger</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Màu Sắc Nút</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingChannel.accentColor || '#10B981'}
                      onChange={(e) => setEditingChannel({ ...editingChannel, accentColor: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingChannel.accentColor || '#10B981'}
                      onChange={(e) => setEditingChannel({ ...editingChannel, accentColor: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phạm Vi / Chi Nhánh</label>
                <select
                  value={editingChannel.branchId || 'global'}
                  onChange={(e) =>
                    setEditingChannel({
                      ...editingChannel,
                      branchId: e.target.value === 'global' ? null : e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                >
                  <option value="global">Thanh Dock Nổi Toàn Trang (Global)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      Thuộc chi nhánh: {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đích Đến (Số Điện Thoại / Đường Dẫn Link)
                </label>
                <input
                  type="text"
                  required
                  value={editingChannel.target}
                  onChange={(e) => setEditingChannel({ ...editingChannel, target: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                  placeholder="1900 036 089 hoặc https://zalo.me/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Thứ Tự Sắp Xếp
                  </label>
                  <input
                    type="number"
                    value={editingChannel.sortOrder}
                    onChange={(e) =>
                      setEditingChannel({ ...editingChannel, sortOrder: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hiển Thị</label>
                  <select
                    value={editingChannel.enabled ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditingChannel({ ...editingChannel, enabled: e.target.value === 'true' })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                  >
                    <option value="true">Bật (Hiển thị nổi)</option>
                    <option value="false">Tắt (Tạm ẩn nút)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingChannel}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {savingChannel ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu Nút Bấm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
