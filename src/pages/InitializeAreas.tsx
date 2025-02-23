import React, { useState } from 'react';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const InitializeAreas = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const areas = [
    { name: 'social media', displayName: 'Social Media' },
    { name: 'audiovisual', displayName: 'Audiovisual' },
    { name: 'imprensa', displayName: 'Imprensa' },
    { name: 'design', displayName: 'Design' },
    { name: 'marketing', displayName: 'Marketing' },
    { name: 'bigdata', displayName: 'Big Data' },
    { name: 'dev', displayName: 'Desenvolvimento' },
    { name: 'admin', displayName: 'Administração' }
  ];

  const initializeAreas = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const timestamp = serverTimestamp();

      // Criar cada área no Firestore
      for (const area of areas) {
        await setDoc(doc(db, 'areas', area.name), {
          ...area,
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      setSuccess(true);
    } catch (error) {
      console.error('Erro ao inicializar áreas:', error);
      setError('Erro ao criar áreas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border-2 border-white/20 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Inicializar Áreas</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
          Áreas criadas com sucesso!
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg text-white mb-2">Áreas que serão criadas:</h2>
        <ul className="space-y-1 text-gray-300">
          {areas.map(area => (
            <li key={area.name}>• {area.displayName}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={initializeAreas}
        disabled={loading}
        className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Criando áreas...' : 'Criar Áreas'}
      </button>
    </div>
  );
};

export default InitializeAreas;