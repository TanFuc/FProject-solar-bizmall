'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDraggableScroll } from '@/lib/hooks/useDraggableScroll';
import { useTranslation } from '@/lib/i18n';

function scrollToCard(track: HTMLDivElement, target: number) {
  const end = track.scrollWidth - track.clientWidth;
  const origin = track.firstElementChild?.getBoundingClientRect().left ?? 0;
  const stops = [0, ...Array.from(track.children, card => Math.min(end, card.getBoundingClientRect().left - origin)), end];
  const left = stops.reduce((closest, stop) => Math.abs(stop - target) < Math.abs(closest - target) ? stop : closest);
  track.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

function settleDrag(track: HTMLDivElement) {
  scrollToCard(track, track.scrollLeft);
}

export function ContentTrack({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  const { isEnglish } = useTranslation();
  const { ref, dragProps, isDragging } = useDraggableScroll(settleDrag);
  const id = useId();
  const [edges, setEdges] = useState({ previous: false, next: false });
  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    const update = () => setEdges({
      previous: track.scrollLeft > 1,
      next: track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
    });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    for (const card of track.children) observer.observe(card);
    track.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); track.removeEventListener('scroll', update); };
  }, [children, ref]);

  function scroll(direction: number) {
    const track = ref.current;
    if (!track) return;
    scrollToCard(track, track.scrollLeft + direction * track.clientWidth * .85);
  }

  return <div className="solar-content-track">
    <div {...dragProps} id={id} role="group" aria-label={label}
      className={className + ' solar-content-track-items' + (isDragging ? ' is-dragging' : '')}>
      {children}
    </div>
    {(edges.previous || edges.next) && <div className="solar-content-track-controls">
      <button type="button" aria-controls={id} aria-label={isEnglish ? 'Previous items' : 'Xem mục trước'} disabled={!edges.previous} onClick={() => scroll(-1)}><ChevronLeft size={20} aria-hidden /></button>
      <button type="button" aria-controls={id} aria-label={isEnglish ? 'Next items' : 'Xem mục tiếp theo'} disabled={!edges.next} onClick={() => scroll(1)}><ChevronRight size={20} aria-hidden /></button>
    </div>}
  </div>;
}
