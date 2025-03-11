'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getStoredToken } from '@/lib/api/auth';

// Icons
import { 
  LayoutDashboard, 
  Users, 
  Plane, 
  Building, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if user is admin on mount and route changes
  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      return;
    }

    const checkAuth = () => {
      const token = getStoredToken();
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        router.push('/admin/login');
        return;
      }
      
      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'ROLE_ADMIN') {
          router.push('/');
          return;
        }
        
        // User is authenticated as admin
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing user data:', e);
        router.push('/admin/login');
      }
    };
    
    checkAuth();
  }, [router, pathname]);
  
  // Don't render the layout for non-authenticated users (except login page)
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }
  
  // Don't render the layout for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };
  
  const navItems = [
    { name: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Vols', href: '/admin/flights', icon: Plane },
    { name: 'Compagnies', href: '/admin/airlines', icon: Building },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 rounded-md bg-indigo-600 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-indigo-700 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-white">RIMBestPrice</h1>
          </div>
          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <item.icon
                      className="mr-3 flex-shrink-0 h-6 w-6"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-base font-medium text-indigo-100 hover:bg-indigo-600"
            >
              <LogOut className="mr-3 flex-shrink-0 h-6 w-6" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-indigo-700 text-white">
            <div className="flex items-center justify-between px-4 py-5">
              <h1 className="text-2xl font-bold">RIMBestPrice</h1>
              <button
                className="text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-indigo-800 text-white'
                          : 'text-indigo-100 hover:bg-indigo-600'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon
                        className="mr-3 flex-shrink-0 h-6 w-6"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-indigo-100 hover:bg-indigo-600"
              >
                <LogOut className="mr-3 flex-shrink-0 h-6 w-6" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
} 