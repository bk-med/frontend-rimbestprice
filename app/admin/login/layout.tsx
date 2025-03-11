import Image from 'next/image';

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">RIMBestPrice</h1>
          <p className="text-gray-600 mt-2">Portail d'Administration</p>
        </div>
        {children}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} RIMBestPrice. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
} 