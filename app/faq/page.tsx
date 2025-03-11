'use client';

import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch, FiPlus, FiMail, FiPhone } from 'react-icons/fi';

type FAQCategory = {
  id: string;
  title: string;
  faqs: FAQ[];
};

type FAQ = {
  id: string;
  question: string;
  answer: React.ReactNode;
};

export default function FAQPage() {
  const [openFAQs, setOpenFAQs] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: FAQCategory[] = [
    {
      id: 'booking',
      title: 'Réservation',
      faqs: [
        {
          id: 'booking-1',
          question: 'Comment réserver un vol sur RIMBestPrice ?',
          answer: (
            <div>
              <p className="mb-4">
                Réserver un vol sur RIMBestPrice est simple et rapide. Voici les étapes à suivre :
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Sur la page d'accueil, utilisez notre moteur de recherche pour indiquer votre destination, vos dates de voyage et le nombre de passagers.</li>
                <li>Parcourez les résultats de recherche et comparez les différentes options de vols.</li>
                <li>Sélectionnez le vol qui vous convient le mieux et cliquez sur "Réserver".</li>
                <li>Remplissez les informations des passagers.</li>
                <li>Procédez au paiement sécurisé.</li>
                <li>Une fois la réservation confirmée, vous recevrez un email de confirmation avec vos billets électroniques.</li>
              </ol>
            </div>
          ),
        },
        {
          id: 'booking-2',
          question: `Puis-je réserver pour quelqu'un d'autre ?`,
          answer: (
            <p>
              Oui, vous pouvez réserver des vols pour d'autres personnes. Lors de la procédure de réservation, vous serez invité à saisir les informations de chaque passager. Assurez-vous simplement que les noms correspondent exactement à ceux figurant sur les pièces d'identité officielles des voyageurs.
            </p>
          ),
        },
        {
          id: 'booking-3',
          question: `Combien de temps à l'avance dois-je réserver mon vol ?`,
          answer: (
            <p>
              Pour obtenir les meilleurs tarifs, nous recommandons de réserver vos vols au moins 6 à 8 semaines avant votre date de départ prévue. Les prix ont tendance à augmenter à mesure que la date du vol approche. Cependant, nous proposons également des offres de dernière minute qui peuvent parfois être avantageuses.
            </p>
          ),
        },
        {
          id: 'booking-4',
          question: 'Est-ce que je reçois une confirmation immédiate après ma réservation ?',
          answer: (
            <p>
              Oui, dès que votre réservation est confirmée et que le paiement est traité, vous recevrez un email de confirmation contenant tous les détails de votre vol ainsi que vos billets électroniques. Nous vous recommandons de vérifier également votre dossier de spam si vous ne trouvez pas l'email dans votre boîte de réception.
            </p>
          ),
        },
      ],
    },
    {
      id: 'payment',
      title: 'Paiement',
      faqs: [
        {
          id: 'payment-1',
          question: 'Quels modes de paiement acceptez-vous ?',
          answer: (
            <p>
              Nous acceptons plusieurs modes de paiement pour faciliter vos réservations :
              <ul className="list-disc pl-5 mt-2">
                <li>Cartes de crédit (Visa, MasterCard)</li>
                <li>Cartes de débit</li>
                <li>PayPal</li>
                <li>Virement bancaire (pour certaines réservations)</li>
              </ul>
              Tous nos paiements sont sécurisés et cryptés pour garantir la protection de vos informations financières.
            </p>
          ),
        },
        {
          id: 'payment-2',
          question: 'Les prix affichés incluent-ils toutes les taxes ?',
          answer: (
            <p>
              Oui, tous les prix affichés sur RIMBestPrice incluent les taxes aéroportuaires et les frais de service. Nous nous engageons à offrir une transparence totale sur les prix, sans frais cachés. Le prix que vous voyez est le prix final que vous paierez, sauf si vous choisissez des services supplémentaires comme des bagages en soute supplémentaires ou des repas spéciaux.
            </p>
          ),
        },
        {
          id: 'payment-3',
          question: 'Comment puis-je obtenir une facture pour ma réservation ?',
          answer: (
            <p>
              Une facture électronique est automatiquement générée et envoyée à l'adresse email que vous avez fournie lors de la réservation. Si vous avez besoin d'une facture spécifique ou si vous ne l'avez pas reçue, vous pouvez la télécharger depuis votre compte dans la section "Mes Réservations" ou contacter notre service client qui vous l'enverra dans les plus brefs délais.
            </p>
          ),
        },
      ],
    },
    {
      id: 'cancellation',
      title: 'Annulation et Modification',
      faqs: [
        {
          id: 'cancellation-1',
          question: 'Comment puis-je annuler ma réservation ?',
          answer: (
            <div>
              <p className="mb-4">
                Pour annuler votre réservation, suivez ces étapes simples :
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Connectez-vous à votre compte RIMBestPrice.</li>
                <li>Accédez à la section "Mes Réservations".</li>
                <li>Sélectionnez la réservation que vous souhaitez annuler.</li>
                <li>Cliquez sur le bouton "Annuler" et suivez les instructions.</li>
              </ol>
              <p className="mt-4">
                Veuillez noter que l'annulation n'est possible que jusqu'à 48 heures avant le départ du vol. Des frais d'annulation peuvent s'appliquer selon la politique tarifaire de votre billet.
              </p>
            </div>
          ),
        },
        {
          id: 'cancellation-2',
          question: 'Puis-je modifier les détails de ma réservation après avoir payé ?',
          answer: (
            <p>
              Oui, vous pouvez modifier certains détails de votre réservation après paiement. Les modifications possibles incluent la correction de fautes d'orthographe dans les noms (sous certaines conditions), l'ajout de services supplémentaires ou la modification des coordonnées de contact. 
              
              Pour des changements plus importants comme les dates de vol ou les itinéraires, des frais supplémentaires peuvent s'appliquer et la disponibilité n'est pas garantie. Pour toute modification, veuillez vous rendre dans la section "Mes Réservations" de votre compte ou contacter notre service client.
            </p>
          ),
        },
        {
          id: 'cancellation-3',
          question: 'Quelle est votre politique de remboursement ?',
          answer: (
            <p>
              Notre politique de remboursement dépend du type de billet que vous avez acheté. Les billets économiques standard sont généralement remboursables avec des frais d'annulation si l'annulation est effectuée au moins 48 heures avant le départ. Les billets promotionnels ou à tarif spécial peuvent être non remboursables.
              
              En cas d'annulation de vol par la compagnie aérienne, vous avez droit à un remboursement complet. Pour connaître les conditions exactes applicables à votre réservation, veuillez consulter les termes et conditions fournis lors de votre achat ou contacter notre service client.
            </p>
          ),
        },
      ],
    },
    {
      id: 'checkin',
      title: 'Enregistrement et Bagages',
      faqs: [
        {
          id: 'checkin-1',
          question: `Comment puis-je m'enregistrer en ligne pour mon vol ?`,
          answer: (
            <div>
              <p className="mb-4">
                L'enregistrement en ligne est disponible pour la plupart des vols via notre plateforme. Pour vous enregistrer :
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Connectez-vous à votre compte RIMBestPrice.</li>
                <li>Accédez à la section "Mes Réservations".</li>
                <li>Sélectionnez le vol pour lequel vous souhaitez vous enregistrer.</li>
                <li>Cliquez sur "Enregistrement en ligne" et suivez les instructions.</li>
                <li>Téléchargez et imprimez votre carte d'embarquement ou conservez-la sur votre téléphone.</li>
              </ol>
              <p className="mt-4">
                L'enregistrement en ligne est généralement disponible de 24 à 48 heures avant le départ du vol, selon la compagnie aérienne.
              </p>
            </div>
          ),
        },
        {
          id: 'checkin-2',
          question: 'Quelles sont les restrictions de bagages ?',
          answer: (
            <p>
              Les restrictions de bagages varient selon la compagnie aérienne et le type de billet. En général, vous avez droit à un bagage à main (généralement limité à 7-10 kg) et, selon votre tarif, à un ou plusieurs bagages en soute (habituellement limités à 20-23 kg chacun).
              
              Les dimensions et poids exacts sont indiqués lors de votre réservation et dans votre email de confirmation. Des frais supplémentaires peuvent s'appliquer pour les bagages excédentaires. Nous vous recommandons de vérifier ces informations avant votre départ.
            </p>
          ),
        },
        {
          id: 'checkin-3',
          question: `Puis-je choisir mon siège à l'avance ?`,
          answer: (
            <p>
              Oui, la plupart des compagnies aériennes permettent de choisir votre siège à l'avance. Cette option peut être gratuite ou payante selon la compagnie et le type de billet. Vous pouvez sélectionner votre siège lors de la réservation ou ultérieurement via la section "Gérer ma réservation" de votre compte. Pour certains tarifs promotionnels, la sélection de siège peut n'être disponible qu'au moment de l'enregistrement.
            </p>
          ),
        },
      ],
    },
    {
      id: 'technical',
      title: 'Problèmes Techniques',
      faqs: [
        {
          id: 'technical-1',
          question: `J'ai des problèmes pour accéder à mon compte, que faire ?`,
          answer: (
            <div>
              <p className="mb-4">
                Si vous rencontrez des difficultés pour accéder à votre compte, voici quelques solutions :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Vérifiez que vous utilisez la bonne adresse email et le bon mot de passe.</li>
                <li>Utilisez l'option "Mot de passe oublié" pour réinitialiser votre mot de passe.</li>
                <li>Videz le cache de votre navigateur ou essayez un autre navigateur.</li>
                <li>Assurez-vous que votre connexion internet est stable.</li>
                <li>Si le problème persiste, contactez notre service client par email ou téléphone.</li>
              </ul>
            </div>
          ),
        },
        {
          id: 'technical-2',
          question: `L'application ne fonctionne pas correctement sur mon téléphone`,
          answer: (
            <p>
              Si vous rencontrez des problèmes avec notre application mobile, essayez les solutions suivantes :
              <ul className="list-disc pl-5 mt-2">
                <li>Vérifiez que vous disposez de la dernière version de l'application.</li>
                <li>Redémarrez votre téléphone.</li>
                <li>Assurez-vous que votre système d'exploitation est à jour.</li>
                <li>Désinstallez puis réinstallez l'application.</li>
              </ul>
              Si ces solutions ne résolvent pas le problème, veuillez nous contacter en précisant le modèle de votre téléphone et la version de votre système d'exploitation.
            </p>
          ),
        },
      ],
    },
  ];

  const toggleFAQ = (id: string) => {
    setOpenFAQs(prev => 
      prev.includes(id) 
        ? prev.filter(faqId => faqId !== id) 
        : [...prev, id]
    );
  };

  const allFAQs = categories.flatMap(category => category.faqs);
  
  const filteredFAQs = allFAQs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || 
      categories.find(category => category.id === activeCategory)?.faqs.some(item => item.id === faq.id);
    
    return matchesSearch && matchesCategory;
  });

  const groupedFAQs: Record<string, FAQ[]> = {};
  
  if (activeCategory === 'all') {
    categories.forEach(category => {
      groupedFAQs[category.id] = category.faqs.filter(faq => 
        filteredFAQs.some(filteredFaq => filteredFaq.id === faq.id)
      );
    });
  } else {
    const categoryFaqs = categories.find(category => category.id === activeCategory)?.faqs || [];
    groupedFAQs[activeCategory] = categoryFaqs.filter(faq => 
      filteredFAQs.some(filteredFaq => filteredFaq.id === faq.id)
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-md rounded-xl overflow-hidden mb-10"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-10 px-8 md:px-12">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Questions Fréquemment Posées
              </h1>
              <p className="text-lg text-primary-100 max-w-2xl">
                Trouvez rapidement des réponses à vos questions concernant nos services de réservation de vol, paiement, annulation et plus encore.
              </p>
            </div>
          </motion.div>
          
          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 block w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Rechercher une question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                className={`px-4 py-2 rounded-full text-sm ${
                  activeCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory('all')}
              >
                Toutes les questions
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded-full text-sm ${
                    activeCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </motion.div>
          
          {/* FAQ Content */}
          {Object.entries(groupedFAQs).map(([categoryId, faqs]) => {
            if (faqs.length === 0) return null;
            
            const categoryTitle = categories.find(c => c.id === categoryId)?.title || '';
            
            return (
              <motion.div
                key={categoryId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-10"
              >
                {activeCategory === 'all' && (
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{categoryTitle}</h2>
                    <div className="w-20 h-1 bg-primary-600 mt-1"></div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div 
                      key={faq.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <button
                        className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                        <div className="ml-4 flex-shrink-0">
                          {openFAQs.includes(faq.id) ? (
                            <FiChevronUp className="h-6 w-6 text-primary-600" />
                          ) : (
                            <FiChevronDown className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      {openFAQs.includes(faq.id) && (
                        <div className="px-6 pb-6 text-gray-600">
                          <div className="pt-2">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
          
          {/* No Results */}
          {Object.values(groupedFAQs).flat().length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 bg-white rounded-xl shadow-md"
            >
              <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun résultat trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Nous n'avons pas trouvé de questions correspondant à votre recherche.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Contact Us Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-primary-50 rounded-xl shadow-md p-8 text-center mt-12"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-gray-600 mb-6">
              Notre équipe de support client est disponible pour répondre à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiMail className="mr-2" /> Contactez-nous
              </a>
              <a 
                href="tel:+2221234567890" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-primary-600 bg-white hover:bg-gray-50"
              >
                <FiPhone className="mr-2" /> +222 1234 5678
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 