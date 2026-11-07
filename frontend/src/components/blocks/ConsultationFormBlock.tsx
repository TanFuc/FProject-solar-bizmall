'use client';

import React, { useState } from 'react';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { submitLeadRequest } from '@/lib/api/client';
import { Sparkles, Phone, User, MapPin, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConsultationFormBlockProps {
  headline?: string;
  subheading?: string;
}

export function ConsultationFormBlock({
  headline,
  subheading,
}: ConsultationFormBlockProps) {
  const { branches, activeBranch } = useBranch();
  const { t, isEnglish } = useTranslation();

  const resolvedHeadline = headline || t('consultation.title');
  const resolvedSubheading = subheading || t('consultation.subtitle');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branchId, setBranchId] = useState(activeBranch?.id || '');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    const res = await submitLeadRequest({
      name: name.trim(),
      phone: phone.trim(),
      branchId: branchId || activeBranch?.id,
      message: message.trim() || 'Yêu cầu khảo sát từ form chân trang',
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
      privacyConsent: true,
      privacyPolicyVersion: 'v1.0.0',
      honeypot: honeypot || undefined,
    });

    setIsSubmitting(false);
    setSubmitResult(res);

    if (res.success) {
      setName('');
      setPhone('');
      setMessage('');
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-brand-dark via-brand-primary to-brand-darker text-white relative overflow-hidden" id="tu-van">
      {/* Decorative solar glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-accent-orange/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Value props */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-accent-orange text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero.ctaConsult')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {resolvedHeadline}
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
              {resolvedSubheading}
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-white/90">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-accent-orange shrink-0" />
                <span>{isEnglish ? 'Tier 1 Bloomberg Equipment with 25-Year Performance Warranty' : 'Cam kết thiết bị chuẩn Tier 1 bảo hành hiệu suất 25 năm'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-accent-orange shrink-0" />
                <span>{isEnglish ? 'Field Structural Engineering & 3D Simulation Prior to Installation' : 'Kỹ sư đo đạc kết cấu mái và vẽ 3D trực quan trước khi thi công'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-accent-orange shrink-0" />
                <span>{isEnglish ? 'Turnkey Grid-Connection Approval & EVN Safety Compliance' : 'Hỗ trợ trọn gói thủ tục hòa lưới an toàn điện lực EVN'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-conversion Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-ink shadow-2xl">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-ink mb-1">
                    {isEnglish ? 'Enter Contact Details' : 'Nhập Thông Tin Liên Hệ'}
                  </h3>

                  {submitResult && !submitResult.success && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitResult.message}</span>
                    </div>
                  )}

                  {/* Honeypot hidden input */}
                  <input
                    type="text"
                    name="form_hp_check"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

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
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

