import React from 'react';
import { LoadingMark } from '@/components/ui/LoadingMark';

export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center py-24 bg-white">
      <LoadingMark size={56} showText={true} />
    </div>
  );
}

