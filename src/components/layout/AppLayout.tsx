"use client";
import { ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Building2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dealer-groups', label: 'Dealer Groups', icon: Building2 },
] as const;

export function AppLayout({ children }: Props) {
  const { user, signOut } = useAuth();
  const pathname = usePathname() ?? "";  


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-[1680] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-6 w-6 border border-foreground flex items-center justify-center">
                <span className="text-xs font-medium">A</span>
              </div>
              <span className="text-sm font-medium hidden sm:inline">AutoAce</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const isActive = pathname.startsWith(path);
                return (
                 <Link key={path} href={path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-32">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="h-7 gap-1 text-xs"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-8xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
