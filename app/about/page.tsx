'use client';

import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiCheck, FiUsers, FiGlobe, FiStar, FiShield } from 'react-icons/fi';
import { RiFlightTakeoffLine } from 'react-icons/ri';

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-md rounded-xl overflow-hidden mb-10"
          >
            <div className="relative h-80 md:h-96">
              <Image
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
                alt="Avion en vol"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/80 to-primary-900/60 flex items-center">
                <div className="px-8 md:px-12 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    À Propos de RIMBestPrice
                  </h1>
                  <p className="text-lg md:text-xl max-w-2xl">
                    Nous révolutionnons la manière dont vous réservez vos vols en vous offrant les meilleurs prix du marché.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Our Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Notre Histoire</h2>
              <div className="w-24 h-1 bg-primary-600 mx-auto mt-2"></div>
            </div>
            
            <div className="bg-white shadow-md rounded-xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2">
                  <p className="text-gray-600 mb-4">
                    Fondée en 2023, RIMBestPrice est née de la vision d{`'`}un groupe d{`'`}entrepreneurs mauritaniens passionnés par le voyage et la technologie.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Face à un marché où il était difficile de trouver rapidement les meilleures offres de vols, nous avons créé une plateforme qui rassemble et compare instantanément les prix proposés par différentes compagnies aériennes.
                  </p>
                  <p className="text-gray-600">
                    Notre mission est simple : vous faire économiser du temps et de l{`'`}argent en vous offrant les meilleurs tarifs pour vos voyages, tout en garantissant une expérience de réservation simple, sécurisée et agréable.
                  </p>
                </div>
                
                <div className="w-full md:w-1/2 relative h-64 md:h-80 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
                    alt="Équipe RIMBestPrice"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Our Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Nos Valeurs</h2>
              <div className="w-24 h-1 bg-primary-600 mx-auto mt-2"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                  <FiUsers size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Satisfaction Client</h3>
                <p className="text-gray-600">
                  Nous mettons tout en œuvre pour garantir la meilleure expérience client possible, de la recherche à l{`'`}après-voyage.
                </p>
              </div>
              
              <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                  <FiGlobe size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">
                  Nous innovons constamment pour offrir des solutions technologiques qui simplifient l{`'`}organisation de vos voyages.
                </p>
              </div>
              
              <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                  <FiShield size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Transparence</h3>
                <p className="text-gray-600">
                  Nous vous garantissons des informations claires et des prix transparents, sans frais cachés.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Why Choose Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Pourquoi Nous Choisir ?</h2>
              <div className="w-24 h-1 bg-primary-600 mx-auto mt-2"></div>
            </div>
            
            <div className="bg-white shadow-md rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiCheck className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Les Meilleurs Prix</h3>
                    <p className="mt-1 text-gray-600">
                      Notre système compare en temps réel les tarifs de nombreuses compagnies aériennes pour vous garantir les meilleurs prix.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiCheck className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Réservation Simplifiée</h3>
                    <p className="mt-1 text-gray-600">
                      Notre interface intuitive vous permet de rechercher, comparer et réserver vos vols en quelques clics.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiCheck className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Paiement Sécurisé</h3>
                    <p className="mt-1 text-gray-600">
                      Nous utilisons les dernières technologies de sécurité pour garantir la protection de vos données et de vos transactions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiCheck className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Flexibilité</h3>
                    <p className="mt-1 text-gray-600">
                      Modifiez ou annulez vos réservations jusqu{`'`}à 48h avant votre vol, directement depuis votre espace client.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-md p-8 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">15+</div>
                  <div className="text-primary-100">Compagnies Partenaires</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">10K+</div>
                  <div className="text-primary-100">Clients Satisfaits</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">200+</div>
                  <div className="text-primary-100">Destinations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-primary-100">Support Client</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 