'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <span className="text-primary-600 text-2xl font-bold">RIM</span>
            <span className="text-accent-500 text-2xl font-bold">BestPrice</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} RIMBestPrice. Tous droits réservés.
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
              Conditions d'utilisation
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              Politique de confidentialité
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
              Contactez-nous
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 