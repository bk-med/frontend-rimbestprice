'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  FiCheckCircle, 
  FiArrowLeft, 
  FiHome, 
  FiCalendar 
} from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils/formatters';

export default function CancelConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Get data from URL params
  const bookingId = params.id as string;
  const bookingNumber = searchParams.get('bookingNumber') || 'N/A';
  const amount = parseFloat(searchParams.get('amount') || '0');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Loading state
  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <FiCheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Annulation confirmée
            </h1>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Votre réservation <span className="font-semibold">{bookingNumber}</span> a été annulée avec succès. Le remboursement de {formatPrice(amount)} sera traité dans les prochains jours.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-left mb-8">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">
                Informations sur le remboursement
              </h2>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Le montant sera remboursé sur le mode de paiement utilisé lors de la réservation.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Le traitement du remboursement peut prendre de 5 à 10 jours ouvrables.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Vous recevrez une confirmation par email une fois le remboursement effectué.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Pour toute question concernant votre remboursement, veuillez contacter notre service client.</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/bookings">
                <Button size="lg">
                  <FiArrowLeft className="mr-2" /> Mes réservations
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  <FiHome className="mr-2" /> Accueil
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 