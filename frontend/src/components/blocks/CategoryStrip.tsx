import React from 'react';
import Link from 'next/link';
import { BatteryCharging, CircuitBoard, PlugZap, Settings, Sun } from 'lucide-react';
import { ProductCategoryItem } from '@/types/bmsolar-api';

export function CategoryStrip({ categories }: { categories?: ProductCategoryItem[] }) {
  if (!categories?.length) return null;

  return (
    <section className="solar-categories" aria-label="Danh mục sản phẩm">
      {categories.map((category) => {
        const Icon = /pin-luu/.test(category.slug)
          ? BatteryCharging
          : /inverter|bien-tan/.test(category.slug)
          ? CircuitBoard
          : /tram-sac/.test(category.slug)
          ? PlugZap
          : /phu-kien/.test(category.slug)
          ? Settings
          : Sun;

        return (
          <Link
            key={category.id}
            href={`/san-pham?category=${category.slug}`}
            scroll={false}
            className="solar-category transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Icon aria-hidden="true" strokeWidth={1.6} />
            <h2>{category.name}</h2>
          </Link>
        );
      })}
    </section>
  );
}
