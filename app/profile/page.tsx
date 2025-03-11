'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiCreditCard, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Form validation schema
const profileSchema = z.object({
  fullName: z.string().min(2, 'Veuillez entrer votre nom complet'),
  email: z.string().email('Adresse email invalide'),
  phoneNumber: z.string().min(8, 'Numéro de téléphone invalide'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Veuillez entrer votre mot de passe actuel'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(6, 'Veuillez confirmer votre nouveau mot de passe'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
    }
  });
  
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });
  
  // Set initial form values from user data
  useEffect(() => {
    if (user) {
      setProfileValue('email', user.email);
      // Note: We need to get fullName and phoneNumber from user API
      // This is a placeholder - in a real app, you'd fetch user details here
      setProfileValue('fullName', 'John Doe'); // Replace with actual user data
      setProfileValue('phoneNumber', '+1234567890'); // Replace with actual user data
    }
  }, [user, setProfileValue]);
  
  const onUpdateProfile = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    setUpdateError('');
    
    try {
      // In a real application, you would call an API to update the user profile
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setUpdateError(
        err.response?.data?.message || 
        'La mise à jour du profil a échoué. Veuillez réessayer.'
      );
    } finally {
      setIsUpdating(false);
    }
  };
  
  const onChangePassword = async (data: PasswordFormValues) => {
    setIsUpdating(true);
    setPasswordSuccess(false);
    setPasswordError('');
    
    try {
      // In a real application, you would call an API to change the password
      // For now, we'll just simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordSuccess(true);
      resetPasswordForm();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Password change error:', err);
      setPasswordError(
        err.response?.data?.message || 
        'Le changement de mot de passe a échoué. Veuillez réessayer.'
      );
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Profil Utilisateur
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Gérez vos informations personnelles et préférences
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex border-b">
              <button
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser className="mr-2" /> Informations personnelles
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === 'security'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <FiLock className="mr-2" /> Sécurité
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === 'bookings'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('bookings')}
              >
                <FiCalendar className="mr-2" /> Mes réservations
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === 'payment'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('payment')}
              >
                <FiCreditCard className="mr-2" /> Paiement
              </button>
            </div>
            
            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Informations personnelles
                    </h2>
                    <p className="text-gray-600">
                      Mettez à jour vos informations personnelles
                    </p>
                  </div>
                  
                  {updateSuccess && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md text-sm">
                      Vos informations ont été mises à jour avec succès.
                    </div>
                  )}
                  
                  {updateError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">
                      {updateError}
                    </div>
                  )}
                  
                  <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom d'utilisateur
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={user?.username || ''}
                          disabled
                          className="pl-10 block w-full rounded-md border border-gray-300 bg-gray-100 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Le nom d'utilisateur ne peut pas être modifié</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            {...registerProfile('fullName')}
                            className={`pl-10 block w-full rounded-md border ${
                              profileErrors.fullName ? 'border-red-500' : 'border-gray-300'
                            } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                          />
                        </div>
                        {profileErrors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.fullName.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            {...registerProfile('email')}
                            className={`pl-10 block w-full rounded-md border ${
                              profileErrors.email ? 'border-red-500' : 'border-gray-300'
                            } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                          />
                        </div>
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de téléphone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          {...registerProfile('phoneNumber')}
                          className={`pl-10 block w-full rounded-md border ${
                            profileErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                        />
                      </div>
                      {profileErrors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.phoneNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        type="submit"
                        size="lg"
                        isLoading={isUpdating}
                      >
                        <FiSave className="mr-2" /> Enregistrer les modifications
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Sécurité du compte
                    </h2>
                    <p className="text-gray-600">
                      Mettez à jour votre mot de passe pour sécuriser votre compte
                    </p>
                  </div>
                  
                  {passwordSuccess && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md text-sm">
                      Votre mot de passe a été modifié avec succès.
                    </div>
                  )}
                  
                  {passwordError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">
                      {passwordError}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          {...registerPassword('currentPassword')}
                          className={`pl-10 block w-full rounded-md border ${
                            passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                          } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                          placeholder="Entrez votre mot de passe actuel"
                        />
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          {...registerPassword('newPassword')}
                          className={`pl-10 block w-full rounded-md border ${
                            passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                          } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                          placeholder="Entrez votre nouveau mot de passe"
                        />
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          {...registerPassword('confirmPassword')}
                          className={`pl-10 block w-full rounded-md border ${
                            passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          } py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        type="submit"
                        size="lg"
                        isLoading={isUpdating}
                      >
                        <FiSave className="mr-2" /> Changer le mot de passe
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
              
              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Mes réservations
                    </h2>
                    <p className="text-gray-600">
                      Consultez et gérez vos réservations de vols
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Link href="/bookings">
                      <Button size="lg">
                        <FiCalendar className="mr-2" /> Voir toutes mes réservations
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
              
              {/* Payment Tab */}
              {activeTab === 'payment' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Méthodes de paiement
                    </h2>
                    <p className="text-gray-600">
                      Gérez vos cartes bancaires et préférences de paiement
                    </p>
                  </div>
                  
                  <div className="text-center py-8">
                    <FiCreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune méthode de paiement</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vous n'avez pas encore ajouté de méthode de paiement.
                    </p>
                    <div className="mt-6">
                      <Button size="md">
                        <FiCreditCard className="mr-2" /> Ajouter une carte
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 