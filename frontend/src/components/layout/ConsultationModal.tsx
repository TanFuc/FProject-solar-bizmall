'use client';

import React, { useState } from 'react';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { submitLeadRequest } from '@/lib/api/client';
import { X, CheckCircle, AlertCircle, Sparkles, Phone, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ConsultationModal() {
  const { isConsultationModalOpen, closeConsultationModal, branches, activeBranch, consultationNote } =
    useBranch();
  const { t, isEnglish } = useTranslation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branchId, setBranchId] = useState(activeBranch?.id || '');
  const [message, setMessage] = useState(consultationNote || '');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam trap
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isConsultationModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    const res = await submitLeadRequest({
      name: name.trim(),
      phone: phone.trim(),
      branchId: branchId || activeBranch?.id,
      message: message.trim() || (isEnglish ? 'Customer consultation request from website' : 'Khách hàng yêu cầu tư vấn báo giá qua website'),
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
      privacyConsent: true,
      privacyPolicyVersion: 'v1.0.0',
      honeypot: honeypot || undefined,
    });

    setIsSubmitting(false);
    setSubmitResult(res);

    if (res.success) {
      setTimeout(() => {
        closeConsultationModal();
        setSubmitResult(null);
        setName('');
        setPhone('');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeConsultationModal}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeConsultationModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label={isEnglish ? 'Close modal' : 'Đóng biểu mẫu'}
        >
          <X className="w-5 h-5" />
        </button>

        {submitResult?.success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-ink">{t('consultation.successTitle')}</h3>
            <p className="text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
              {submitResult.message || t('consultation.successDesc')}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-light text-accent-orange text-xs font-semibold rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                {t('hero.ctaConsult')}
              </div>
              <h2 className="text-2xl font-bold text-ink">
                {isEnglish ? 'BM SOLAR Consultation Request' : 'Đăng Ký Tư Vấn BM SOLAR'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted">
                {t('consultation.subtitle')}
              </p>
            </div>

            {submitResult && !submitResult.success && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot hidden input for spam bots */}
              <input
                type="text"
                name="website_token_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  {t('consultation.nameLabel')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder={t('consultation.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-slate-200 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  {t('consultation.phoneLabel')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder={t('consultation.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-slate-200 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  {t('consultation.branchLabel')}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-slate-200 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note / Message */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  {t('consultation.messageLabel')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('consultation.messagePlaceholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface border border-slate-200 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="orange"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('consultation.submitting') : t('consultation.submit')}
                </Button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                {t('consultation.consent')}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
