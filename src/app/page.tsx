'use client';


import VirtualTryOn from '@/components/VirtualTryOn';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Virtual Try-On
          </h1>
          <p className="text-xl text-gray-600">
            Isprobajte odeću na sebi koristeći AI tehnologiju
          </p>
        </div>
        
        <VirtualTryOn />
      </div>
    </main>
  );
}
