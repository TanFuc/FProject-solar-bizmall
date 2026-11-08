'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BranchItem, ContactChannelItem, BrandConfig } from '@/types/bmsolar-api';

interface BranchContextType {
  brand?:BrandConfig;
  activeBranch: BranchItem | null;
  branches: BranchItem[];
  setActiveBranchSlug: (slug: string) => void;
  activeHotline: ContactChannelItem | null;
  activeZalo: ContactChannelItem | null;
  isConsultationModalOpen: boolean;
  openConsultationModal: (contextNote?: string) => void;
  closeConsultationModal: () => void;
  consultationNote: string;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({
  children,
  initialBranches,
  globalChannels=[],
  brand,
}: {
  children: React.ReactNode;
  initialBranches: BranchItem[];
  globalChannels?:ContactChannelItem[];
  brand?:BrandConfig;
}) {
  const [branches] = useState<BranchItem[]>(initialBranches);
  const defaultSlug =
    (initialBranches || []).find((b) => b.isHeadquarters)?.slug ||
    (initialBranches || [])[0]?.slug ||
    'quy-nhon';
  const [activeBranchSlug, setActiveBranchSlugState] = useState<string>(defaultSlug);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationNote, setConsultationNote] = useState('');

  // Persist branch preference in localStorage if client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bmsolar_preferred_branch');
      if (saved && branches.some((b) => b.slug === saved)) {
        setActiveBranchSlugState(saved);
      }
    }
  }, [branches]);

  const setActiveBranchSlug = (slug: string) => {
    setActiveBranchSlugState(slug);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bmsolar_preferred_branch', slug);
    }
  };

  const activeBranch = (branches || []).find((b) => b.slug === activeBranchSlug) || (branches || [])[0] || null;

  const branchChannels = activeBranch?.channels || [];
  const safeGlobalChannels = globalChannels || [];

  const activeHotline = branchChannels.find((c) => c.type === 'phone') || safeGlobalChannels.find((c) => c.type === 'phone') || null;
  const activeZalo = branchChannels.find((c) => c.type === 'zalo') || safeGlobalChannels.find((c) => c.type === 'zalo') || null;

  const openConsultationModal = (note?: string) => {
    setConsultationNote(note || '');
    setIsConsultationModalOpen(true);
  };

  const closeConsultationModal = () => {
    setIsConsultationModalOpen(false);
  };

  return (
    <BranchContext.Provider
      value={{
        brand,
        activeBranch,
        branches,
        setActiveBranchSlug,
        activeHotline,
        activeZalo,
        isConsultationModalOpen,
        openConsultationModal,
        closeConsultationModal,
        consultationNote,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}

