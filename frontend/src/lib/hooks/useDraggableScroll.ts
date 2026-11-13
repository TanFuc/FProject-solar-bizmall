'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export function useDraggableScroll<T extends HTMLElement = HTMLDivElement>(onRelease?: (element: T) => void) {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasMovedRef = useRef(false);
  const cleanup = useRef<() => void>(undefined);
  useEffect(() => () => cleanup.current?.(), []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    // Only primary mouse button (left click)
    if (!el || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
    cleanup.current?.();

    setIsDragging(true);
    hasMovedRef.current = false;
    const startX = e.pageX - el.offsetLeft;
    const initialScrollLeft = el.scrollLeft;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const x = moveEvent.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(x - startX) > 4) {
        hasMovedRef.current = true;
      }
      if (hasMovedRef.current) el.scrollLeft = initialScrollLeft - walk;
    };

    const stop = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
    };
    const onMouseUp = () => {
      stop();
      setIsDragging(false);
      if (hasMovedRef.current) onRelease?.(el);
    };
    cleanup.current = stop;

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
  }, [onRelease]);

  const onDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (e.detail > 0 && hasMovedRef.current) {
      hasMovedRef.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return {
    ref,
    isDragging,
    hasMoved: hasMovedRef.current,
    dragProps: {
      ref,
      onMouseDown,
      onDragStart,
      onClickCapture,
    },
  };
}
