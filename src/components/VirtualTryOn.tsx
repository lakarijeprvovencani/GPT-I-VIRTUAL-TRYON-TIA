'use client';

import { useState, useRef } from 'react';

interface UploadedImage {
  file: File;
  preview: string;
}

export default function VirtualTryOn() {
  const [userPhoto, setUserPhoto] = useState<UploadedImage | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<UploadedImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const resetForm = () => {
    setUserPhoto(null);
    setClothingPhoto(null);
    setGeneratedImage(null);
    setError(null);
    if (userPhotoRef.current) userPhotoRef.current.value = '';
    if (clothingPhotoRef.current) clothingPhotoRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Rezultat
          </h3>
          <div className="border-2 border-gray-200 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
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
    </div>
  );
}
