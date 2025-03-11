'use client';

import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FiMapPin, FiPhone, FiMail, FiClock, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real application, you would send the form data to your backend
    // const response = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // });
    
    setLoading(false);
    setSubmitted(true);
    toast.success('Votre message a été envoyé avec succès !');
    
    // Reset form after some time
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

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
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-10 px-8 md:px-12">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Contactez-Nous</h1>
              <p className="text-lg text-primary-100 max-w-2xl">
                Vous avez des questions ou besoin d{`'`}assistance ? Notre équipe est là pour vous aider.
              </p>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-white shadow-md rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
                
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck size={40} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message Envoyé !</h3>
                    <p className="text-gray-600">
                      Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="Votre nom"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="Votre email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Sujet
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="reservation">Réservation</option>
                        <option value="payment">Paiement</option>
                        <option value="cancellation">Annulation</option>
                        <option value="checkin">Enregistrement</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Comment pouvons-nous vous aider ?"
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    
                    <div>
                      <Button 
                        type="submit" 
                        size="lg"
                        disabled={loading}
                        className="w-full md:w-auto"
                      >
                        {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white shadow-md rounded-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos Coordonnées</h2>
                
                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        <FiMapPin size={20} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                      <p className="mt-1 text-gray-600">
                        123 Rue des Compagnies<br />
                        Nouakchott, Mauritanie
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        <FiPhone size={20} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Téléphone</h3>
                      <p className="mt-1 text-gray-600">
                        +222 1234 5678<br />
                        +222 9876 5432
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        <FiMail size={20} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Email</h3>
                      <p className="mt-1 text-gray-600">
                        info@rimbest.com<br />
                        support@rimbest.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        <FiClock size={20} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Heures d{`'`}ouverture</h3>
                      <p className="mt-1 text-gray-600">
                        Lundi - Vendredi: 8h à 20h<br />
                        Samedi - Dimanche: 9h à 18h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary-50 shadow-md rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Support d{`'`}urgence</h3>
                <p className="text-gray-600 mb-4">
                  Pour toute situation d{`'`}urgence concernant votre vol, veuillez nous contacter par téléphone 24h/24 et 7j/7.
                </p>
                <div className="mt-2">
                  <a 
                    href="tel:+2221234567890" 
                    className="inline-flex items-center text-lg font-semibold text-primary-600"
                  >
                    <FiPhone className="mr-2" /> +222 1234 5678 90
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-white shadow-md rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Retrouvez-nous</h2>
              <div className="h-96 rounded-xl overflow-hidden bg-gray-200 relative">
                {/* In a real application, you would embed a Google Maps iframe here */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-lg text-gray-600">Carte interactive de notre emplacement</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 