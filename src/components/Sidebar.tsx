// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Removed useRouter as not directly used for redirection here
import { LayoutDashboard, Users, UserCircle, LogOut, FileText } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/invoices', icon: FileText }, 
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  const handleLogout = async () => {
    // 1. Call the logout API endpoint to clear the server-side cookie
    await fetch('/api/auth/logout', { method: 'POST' });

    // 2. Force a full page reload. This is crucial for Next.js to
    //    fully reset its client-side state and recognize the cleared cookie.
    //    This ensures the user is immediately sent to the login page
    //    by the middleware on the next request.
    window.location.href = '/login';
  };

  return (
    <aside style={{ width: '280px' }} className="d-flex flex-column flex-shrink-0 bg-white border-end">
      <div className="d-flex align-items-center justify-content-center border-bottom" style={{ height: '60px' }}>
        <h1 className="fs-4 fw-bold text-primary">Invoicer</h1>
      </div>
      <nav className="flex-grow-1 p-3 d-flex flex-column">
        <ul className="nav nav-pills flex-column mb-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href + '/'));
            return (
              <li className="nav-item" key={link.name}>
                <Link
                  href={link.href}
                  className={`nav-link d-flex align-items-center ${isActive ? 'active' : 'text-dark'}`}
                >
                  <link.icon className="me-3" size={20} />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-3 border-top">
        <button
          onClick={handleLogout}
          className="btn btn-light w-100 d-flex align-items-center"
        >
          <LogOut className="me-3" size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}