'use client';

import { useRef, useState, useCallback } from 'react';

export function useDraggableScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasMovedRef = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    // Only primary mouse button (left click)
    if (!el || e.button !== 0) return;

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
      el.scrollLeft = initialScrollLeft - walk;
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const onDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasMovedRef.current) {
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
