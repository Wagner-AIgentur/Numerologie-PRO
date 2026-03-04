'use client';

import { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopBar from './DashboardTopBar';

interface Props {
  children: React.ReactNode;
  locale: string;
  userName: string;
  isAdmin?: boolean;
}

export default function DashboardShell({ children, locale, userName, isAdmin }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        locale={locale}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar
          userName={userName}
          locale={locale}
          isAdmin={isAdmin}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
