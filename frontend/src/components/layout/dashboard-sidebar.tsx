'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutGrid, PlusCircle, Users, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const navLinks = [
  { href: '/employer/dashboard', label: 'My Jobs', icon: LayoutGrid },
  { href: '/employer/dashboard/post-job', label: 'Post Job', icon: PlusCircle },
  { href: '/employer/dashboard/applications', label: 'Applications', icon: Users },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-card rounded-lg border">
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center">
                    <User />
                </div>
                <div>
                    <p className="font-bold">{user?.name || 'Employer'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
            </div>
            <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
                <Button
                key={link.href}
                variant={pathname === link.href ? 'default' : 'ghost'}
                asChild
                className="justify-start"
                >
                <Link href={link.href}>
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                </Link>
                </Button>
            ))}
            </nav>
        </div>
      
        <Button variant="ghost" className="justify-start w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    </div>
  );
}
