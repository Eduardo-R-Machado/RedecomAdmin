import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminPanel = () => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredDemands, setFilteredDemands] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [uniqueAreas, setUniqueAreas] = useState([]);

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const demandsRef = collection(db, 'demandas');
      const q = query(demandsRef);
      const querySnapshot = await getDocs(q);
      
      const demandsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDemands(demandsData);
    } catch (error) {
      console.error('Erro ao buscar demandas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Na fila';
      case 1: return 'Em progresso';
      case 2: return 'Finalizada';
      case 3: return 'Aprovada';
      default: return 'Desconhecido';
    }
  };

  useEffect(() => {
    if (selectedArea === 'all') {
      setFilteredDemands(demands);
    } else {
      setFilteredDemands(demands.filter(demand => 
        demand.needs?.includes(selectedArea)
      ));
    }
  }, [selectedArea, demands]);

  useEffect(() => {
    const areas = new Set();
    demands.forEach(demand => {
      demand.needs?.forEach(need => areas.add(need));
    });
    setUniqueAreas(Array.from(areas));
  }, [demands]);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="bg-gray-900 rounded-lg border-2 border-white/20 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <h1 className="text-2xl font-bold text-white">Painel Administrativo de Demandas</h1>
            <select 
              value={selectedArea} 
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas as áreas</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="bg-gray-900 rounded-lg border-2 border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-400">Carregando demandas...</p>
            </div>
          ) : filteredDemands.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-400">Nenhuma demanda encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="p-4 text-left text-gray-400 font-medium">Assunto</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Área(s)</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Criado em</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Criado por</th>
                    <th className="p-4 text-left text-gray-400 font-medium">Profissionais</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemands.map((demand, index) => (
                    <tr key={index} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="p-4 text-white">{demand.subject}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {demand.needs?.map(need => (
                            <span key={need} className="px-2 py-1 text-sm bg-gray-800 text-gray-300 rounded-full">
                              {need}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-sm text-white rounded-full ${
                          demand.status === 0 ? 'bg-yellow-600' :
                          demand.status === 1 ? 'bg-blue-600' :
                          demand.status === 2 ? 'bg-green-600' :
                          demand.status === 3 ? 'bg-purple-600' :
                          'bg-gray-600'
                        }`}>
                          {getStatusText(demand.status)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">
                        {new Date(demand.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-gray-300">{demand.user?.name}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {demand.involved?.map(person => (
                            <span key={person.uid} className="text-gray-300">{person.name}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;  