"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/jobs', label: 'Find Jobs' },
  { href: '/employer', label: 'For Employers' },
  { href: '/ussd', label: 'USSD Demo' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-headline font-bold text-xl text-primary">
          <Briefcase className="h-6 w-6" />
          Mkononi Connect
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                'text-muted-foreground transition-colors hover:text-primary',
                (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))) && 'text-primary font-semibold'
              )}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
