'use client';

import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { FlightSearchForm } from '@/components/flights/FlightSearchForm';
import { Button } from '@/components/ui/Button';
import { FiArrowRight, FiCheck, FiClock, FiDollarSign, FiShield, FiList } from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('/images/hero-bg.jpg')",
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Trouvez les Meilleures Offres de Vols avec RIMBestPrice
              </h1>
              <p className="text-xl text-white mb-8">
                Comparez les vols de plusieurs compagnies aériennes et réservez au meilleur prix.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FlightSearchForm />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Pourquoi Choisir RIMBestPrice?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Nous offrons la meilleure expérience pour trouver et réserver vos vols.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FiDollarSign className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Garantie Meilleur Prix</h3>
              <p className="text-gray-600">
                Nous comparons les prix de plusieurs compagnies aériennes pour vous garantir la meilleure offre.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FiClock className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Réservation Rapide & Facile</h3>
              <p className="text-gray-600">
                Réservez votre vol en quelques minutes grâce à notre processus de réservation simple et intuitif.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FiShield className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paiements Sécurisés</h3>
              <p className="text-gray-600">
                Tous les paiements sont traités de manière sécurisée avec les dernières technologies de cryptage.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Popular Destinations */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Destinations Populaires</h2>
            <p className="mt-4 text-lg text-gray-600">
              Explorez nos itinéraires de vol les plus populaires
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="relative h-64 rounded-lg overflow-hidden shadow-md"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img src="/images/paris.jpg" alt="Paris" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-bold">Paris</h3>
                <p className="text-white text-sm">À partir de 28.500 MRU</p>
                <Link href="/flights?departureCity=Nouakchott&arrivalCity=Paris">
                  <Button size="sm" variant="outline" className="mt-2 bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-black">
                    Réserver <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative h-64 rounded-lg overflow-hidden shadow-md"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <img src="/images/casablanca.jpg" alt="Casablanca" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-bold">Casablanca</h3>
                <p className="text-white text-sm">À partir de 9.500 MRU</p>
                <Link href="/flights?departureCity=Nouakchott&arrivalCity=Casablanca">
                  <Button size="sm" variant="outline" className="mt-2 bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-black">
                    Réserver <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative h-64 rounded-lg overflow-hidden shadow-md"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <img src="/images/dubai.jpg" alt="Dubai" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-bold">Dubaï</h3>
                <p className="text-white text-sm">À partir de 38.500 MRU</p>
                <Link href="/flights?departureCity=Nouakchott&arrivalCity=Dubai">
                  <Button size="sm" variant="outline" className="mt-2 bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-black">
                    Réserver <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-12 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Ce Que Disent Nos Clients</h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez les avis de nos clients satisfaits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-bold">A</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Ahmed S.</h4>
                  <div className="flex text-accent-500">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "J'ai trouvé une super offre pour mon vol vers Paris. Le processus de réservation était simple et j'ai reçu mes billets instantanément !"
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-bold">F</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Fatima M.</h4>
                  <div className="flex text-accent-500">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "RIMBestPrice m'a fait économiser plus de 200 MRU sur mon vol par rapport à d'autres sites. Je l'utiliserai à nouveau !"
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-bold">K</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Karim L.</h4>
                  <div className="flex text-accent-500">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Le service client était exceptionnel quand j'ai dû modifier ma réservation. Je recommande vivement !"
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à Trouver Votre Vol Idéal ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Comparez les vols de plusieurs compagnies aériennes et réservez votre prochain voyage au meilleur prix.
          </p>
          <div className="flex justify-center">
            <Link href="/flights">
              <Button size="lg" variant="accent">
                Rechercher des Vols <FiArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
