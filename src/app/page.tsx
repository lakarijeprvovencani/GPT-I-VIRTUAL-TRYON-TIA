'use client';

import { useEffect, useState } from 'react';
import VirtualTryOn from '@/components/VirtualTryOn';

export default function Home() {
  const [context, setContext] = useState({
    productId: null as string | null,
    variantId: null as string | null,
    handle: null as string | null,
    title: null as string | null,
    price: null as string | null,
    image: null as string | null,
    mode: null as string | null,
    source: null as string | null,
    debug: false
  });

  useEffect(() => {
    // Parse query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const newContext = {
      productId: urlParams.get('productId'),
      variantId: urlParams.get('variantId'),
      handle: urlParams.get('handle'),
      title: urlParams.get('title'),
      price: urlParams.get('price'),
      image: urlParams.get('image'),
      mode: urlParams.get('mode'),
      source: urlParams.get('source'),
      debug: urlParams.get('debug') === '1'
    };
    setContext(newContext);
  }, []);

  const isCompact = context.mode === 'compact';

  return (
    <main className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${isCompact ? 'p-4' : 'p-8'}`}>
      <div className={`mx-auto ${isCompact ? 'max-w-2xl' : 'max-w-4xl'}`}>
        {!isCompact && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Virtual Try-On
            </h1>
            <p className="text-xl text-gray-600">
              Isprobajte odeću na sebi koristeći AI tehnologiju
            </p>
          </div>
        )}
        
        <VirtualTryOn context={context} />
      </div>
    </main>
  );
}
