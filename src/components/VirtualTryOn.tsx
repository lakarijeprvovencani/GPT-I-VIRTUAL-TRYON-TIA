'use client';

import { useState, useRef, useEffect } from 'react';

interface UploadedImage {
  file: File;
  preview: string;
}

interface VTOContext {
  productId: string | null;
  variantId: string | null;
  handle: string | null;
  title: string | null;
  price: string | null;
  image: string | null;
  mode: string | null;
  source: string | null;
  debug: boolean;
}

interface PostMessagePayload {
  type: 'vto:result';
  ready: boolean;
  payload: {
    productId: string | null;
    variantId: string | null;
    handle: string | null;
    title: string | null;
    price: string | null;
    image: string | null;
    resultUrl: string | null;
    source: string | null;
  };
}

export default function VirtualTryOn({ context }: { context: VTOContext }) {
  const [userPhoto, setUserPhoto] = useState<UploadedImage | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<UploadedImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPostMessage, setLastPostMessage] = useState<PostMessagePayload | null>(null);
  
  const userPhotoRef = useRef<HTMLInputElement>(null);
  const clothingPhotoRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setImage: (image: UploadedImage | null) => void) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!userPhoto) {
      setError('Molimo uploadujte svoju fotografiju');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('userPhoto', userPhoto.file);
      
      if (clothingPhoto) {
        formData.append('clothingPhoto', clothingPhoto.file);
      }

      const resp = await fetch('/api/virtual-try-on', { method: 'POST', body: formData });
      const ct = (resp.headers.get('content-type') || '').toLowerCase();

      if (!resp.ok) {
        let msg = '';
        try { msg = (await resp.json()).error || 'Greška'; }
        catch { msg = await resp.text(); }
        throw new Error(msg);
      }

      if (ct.includes('image/')) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedImage(url);
        
        // Send postMessage to parent (Shopify widget) after successful generation
        sendPostMessage(url);
      } else if (ct.includes('application/json')) {
        const data = await resp.json();
        setError(data.message || 'Model je vratio tekstualnu poruku umesto slike');
      } else {
        const text = await resp.text();
        throw new Error('Neočekivan HTML odgovor (verovatno pogrešan URL /api). ' + text.slice(0, 300));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri generisanju slike');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send postMessage to parent (Shopify widget)
  const sendPostMessage = (resultUrl: string | null) => {
    // Better to use parentOrigin from document.referrer, fallback to '*' only for local dev
    const parentOrigin = document.referrer ? new URL(document.referrer).origin : '*';
    
    const message: PostMessagePayload = {
      type: 'vto:result',
      ready: true,
      payload: {
        productId: context.productId,
        variantId: context.variantId,
        handle: context.handle,
        title: context.title,
        price: context.price,
        image: context.image,
        resultUrl: resultUrl,
        source: context.source || 'web'
      }
    };

    // Store last sent message for debug
    setLastPostMessage(message);

    // Send message to parent
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, parentOrigin);
      console.log('📤 PostMessage sent to parent:', message);
    } else {
      console.log('📤 PostMessage would be sent (local dev):', message);
    }
  };

  // Function to send test message (debug)
  const sendTestMessage = () => {
    const testMessage: PostMessagePayload = {
      type: 'vto:result',
      ready: true,
      payload: {
        productId: 'test-123',
        variantId: 'test-456',
        handle: 'test-product',
        title: 'Test Product',
        price: '99.99',
        image: 'https://example.com/test.jpg',
        resultUrl: 'https://example.com/result.jpg',
        source: 'shopify'
      }
    };
    
    setLastPostMessage(testMessage);
    
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(testMessage, '*');
      console.log('🧪 Test PostMessage sent:', testMessage);
    } else {
      console.log('🧪 Test PostMessage would be sent (local dev):', testMessage);
    }
  };

  const resetForm = () => {
    setUserPhoto(null);
    setClothingPhoto(null);
    setGeneratedImage(null);
    setError(null);
    if (userPhotoRef.current) userPhotoRef.current.value = '';
    if (clothingPhotoRef.current) clothingPhotoRef.current.value = '';
  };

  const isCompact = context.mode === 'compact';

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${isCompact ? 'p-4' : 'p-8'}`}>
      <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-8`}>
        {/* Upload Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Vaša fotografija *
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={userPhotoRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setUserPhoto)}
                className="hidden"
              />
              {userPhoto ? (
                <div className="space-y-3">
                  <img
                    src={userPhoto.preview}
                    alt="User photo"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <button
                    onClick={() => setUserPhoto(null)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Ukloni sliku
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => userPhotoRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Kliknite za upload fotografije
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Fotografija odeće (opciono)
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={clothingPhotoRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setClothingPhoto)}
                className="hidden"
              />
              {clothingPhoto ? (
                <div className="space-y-3">
                  <img
                    src={clothingPhoto.preview}
                    alt="Clothing photo"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <button
                    onClick={() => setClothingPhoto(null)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Ukloni sliku
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => clothingPhotoRef.current?.click()}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Kliknite za upload fotografije odeće
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={!userPhoto || isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generisanje...' : 'Generiši Virtual Try-On'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Result Section */}
        <div>
          {!isCompact && (
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Rezultat
            </h3>
          )}
          <div className={`border-2 border-gray-200 rounded-lg ${isCompact ? 'p-4' : 'p-6'} ${isCompact ? 'min-h-[300px]' : 'min-h-[400px]'} flex items-center justify-center`}>
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generisanje slike...</p>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="Generated virtual try-on"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="text-center">
                  <a
                    href={generatedImage}
                    download="virtual-try-on.png"
                    className="inline-block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Preuzmi sliku
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Uploadujte fotografiju i kliknite &quot;Generiši&quot;</p>
                <p className="text-sm mt-2">Rezultat će se prikazati ovde</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug Panel - only show when ?debug=1 */}
      {context.debug && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm z-50">
          <h4 className="font-semibold mb-3 text-yellow-400">🐛 Debug Panel</h4>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong>Context:</strong>
              <pre className="bg-gray-800 p-2 rounded mt-1 text-xs overflow-auto">
                {JSON.stringify(context, null, 2)}
              </pre>
            </div>
            
            <button
              onClick={sendTestMessage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs"
            >
              🧪 Pošalji Test Poruku
            </button>
            
            {lastPostMessage && (
              <div>
                <strong>Last PostMessage:</strong>
                <pre className="bg-gray-800 p-2 rounded mt-1 text-xs overflow-auto">
                  {JSON.stringify(lastPostMessage, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
