'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Lightbulb, 
  Bell, 
  Pencil, 
  Archive, 
  Trash2 
} from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Notes', icon: Lightbulb, active: true },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/labels', label: 'Edit labels', icon: Pencil },
  { href: '/archives', label: 'Archive', icon: Archive },
  { href: '/trash', label: 'Trash', icon: Trash2 },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-yellow-400 text-gray-900'
                : 'hover:theme-bg-tertiary cursor-pointer'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className={isActive ? 'font-medium' : 'theme-text-secondary'}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
