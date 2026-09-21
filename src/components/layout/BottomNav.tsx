'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Building2, PlusCircle } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '대시보드', icon: LayoutDashboard },
    { href: '/jobs', label: '촬영', icon: Calendar },
    { href: '/jobs/new', label: '신규등록', icon: PlusCircle, isPrimary: true },
    { href: '/photographers', label: '작가관리', icon: Users },
    { href: '/venues', label: '웨딩홀', icon: Building2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe">
      <div className="max-w-xl mx-auto px-2 flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/jobs/new');

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-active:scale-95 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 py-1 transition ${
                isActive
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-normal'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
