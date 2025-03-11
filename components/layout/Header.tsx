'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiCalendar, FiSearch, FiList } from 'react-icons/fi';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-primary-600 text-2xl font-bold">RIM</span>
              <span className="text-accent-500 text-2xl font-bold">BestPrice</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
              Accueil
            </Link>
            <Link href="/flights" className="text-gray-700 hover:text-primary-600 font-medium">
              Vols
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 font-medium">
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={toggleProfile}
                  className="flex items-center text-gray-700 hover:text-primary-600 font-medium"
                >
                  <FiUser className="mr-2" /> {user?.username}
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    >
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <FiUser className="mr-2" /> Profil
                      </Link>
                      <Link href="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <FiCalendar className="mr-2" /> Mes Réservations
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FiLogOut className="mr-2" /> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Connexion</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Inscription</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link href="/" className="block py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center">
                <FiHome className="mr-2" /> Accueil
              </Link>
              <Link href="/flights" className="block py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center">
                <FiSearch className="mr-2" /> Vols
              </Link>
              <Link href="/about" className="block py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center">
                À propos
              </Link>
              <Link href="/contact" className="block py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center">
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  <Link href="/profile" className="block py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center">
                    <FiUser className="mr-2" /> Profil
                  </Link>
                  <Link href="/bookings" className="block py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center">
                    <FiCalendar className="mr-2" /> Mes Réservations
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center"
                  >
                    <FiLogOut className="mr-2" /> Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <div className="pt-2 flex flex-col space-y-2">
                    <Link href="/auth/login" className="w-full">
                      <Button variant="outline" fullWidth>Connexion</Button>
                    </Link>
                    <Link href="/auth/register" className="w-full">
                      <Button fullWidth>Inscription</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}; 