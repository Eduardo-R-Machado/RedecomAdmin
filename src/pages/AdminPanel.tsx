import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Person {
  uid: string;
  name: string;
}

interface User {
  name: string;
  secretary: string;
  uid: string;
}

interface Demand {
  id: string;
  subject: string;
  description: string;
  status: number;
  createdAt: string;
  user?: User;
  needs?: string[];
  involved?: Person[];
  links?: string[];
  editedBy?: string;
}

interface Professional {
  id: string;
  fullName: string;
  area: string;
  whatsapp?: string;
  birthDay?: string;
  gender?: string;
  type?: number;
  manager?: string;
  managerEmail?: string;
  managerWhatsapp?: string;
}

const AdminPanel = () => {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredDemands, setFilteredDemands] = useState<Demand[]>([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uniqueAreas, setUniqueAreas] = useState<string[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingProfessional, setSavingProfessional] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState('');

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const demandsRef = collection(db, 'demandas');
      const q = query(demandsRef);
      const querySnapshot = await getDocs(q);
      
      const demandsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Demand[];
      
      setDemands(demandsData);
    } catch (error) {
      console.error('Erro ao buscar demandas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const profsRef = collection(db, 'users');
      const q = query(profsRef);
      const querySnapshot = await getDocs(q);
      
      const profsData = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => 'area' in user && user.area)
      .sort((a, b) => {
        if ('fullName' in a && 'fullName' in b && typeof a.fullName === 'string' && typeof b.fullName === 'string') {
          return a.fullName.localeCompare(b.fullName);
        }
        return 0;
      }) as Professional[];
      
      setProfessionals(profsData);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } 
  };  

  useEffect(() => {
    fetchDemands();
    fetchProfessionals();
  }, []);

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0: return 'Na fila';
      case 1: return 'Em progresso';
      case 2: return 'Finalizada';
      case 3: return 'Aprovada';
      default: return 'Desconhecido';
    }
  };

  useEffect(() => {
    let result = [...demands];

    if (selectedArea !== 'all') {
      result = result.filter(demand => demand.needs?.includes(selectedArea));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();

      result = result.filter(demand => {
        if (demand.subject?.toLowerCase().includes(term)) return true;

        if (demand.needs?.some(need => need.toLowerCase().includes(term))) return true;

        if (demand.user?.name?.toLowerCase().includes(term)) return true;

        if (demand.involved?.some(person => person.name?.toLowerCase().includes(term))) return true;

        return false;
      });
    }

    setFilteredDemands(result); 
  }, [selectedArea, searchTerm, demands]);

  useEffect(() => {
    const areas = new Set<string>();
    demands.forEach(demand => {
      demand.needs?.forEach(need => areas.add(need));
    });
    setUniqueAreas(Array.from(areas));
  }, [demands]);  

  
  const openDemandDetails = (demand: Demand) => {
    setSelectedDemand(demand);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDemand(null);
  };

  const addProfessionalToDemand = async () => {
    if (!selectedProfessional || !selectedDemand) return;
    setSavingProfessional(true);
    try {
      const professional = professionals.find(p => p.id === selectedProfessional);
      
      if (!professional) {
        throw new Error('Profissional não encontrado');
      }
      
      const alreadyInvolved = selectedDemand.involved?.some(p => p.uid === professional.id);
      if (alreadyInvolved) {
        alert('Este profissional já está envolvido nesta demanda.');
        setSavingProfessional(false);
        return;
      }

      const newInvolved = [
        ...(selectedDemand.involved || []),
        {
          name: professional.fullName,
          uid: professional.id
        }
      ];
      
      const demandRef = doc(db, 'demandas', selectedDemand.id);
      await updateDoc(demandRef, {
        involved: newInvolved,
        editedBy: "Admin" 
      });
      
      const updatedDemand = {
        ...selectedDemand,
        involved: newInvolved
      };
      
      setSelectedDemand(updatedDemand);
      
      const updatedDemands = demands.map(d => 
        d.id === selectedDemand.id ? updatedDemand : d
      );
      
      setDemands(updatedDemands);
      
      setSelectedProfessional('');
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
      alert('Erro ao adicionar profissional à demanda.');
    } finally {
      setSavingProfessional(false);
    }
  };

  const removeProfessionalFromDemand = async (professionalUid: string) => {
    if (!selectedDemand) return;

    setSavingProfessional(true);
    try {
      // Garantir que involved existe
      if (!selectedDemand.involved || selectedDemand.involved.length === 0) {
        throw new Error('Não há profissionais envolvidos');
      }

      // Filtrar o profissional do array involved
      const newInvolved = selectedDemand.involved.filter(p => p.uid !== professionalUid);
      
      // Atualizar no Firestore
      const demandRef = doc(db, 'demandas', selectedDemand.id);
      await updateDoc(demandRef, {
        involved: newInvolved,
        editedBy: "Admin" // Temporário
      });
      
      // Atualizar estado local
      const updatedDemand = {
        ...selectedDemand,
        involved: newInvolved
      };
      
      setSelectedDemand(updatedDemand);
      
      // Atualizar a lista de demandas
      const updatedDemands = demands.map(d => 
        d.id === selectedDemand.id ? updatedDemand : d
      );
      
      setDemands(updatedDemands);
    } catch (error) {
      console.error('Erro ao remover profissional:', error);
      alert('Erro ao remover profissional da demanda.');
    } finally {
      setSavingProfessional(false);
    }
  };


  const DemandDetailsModal = () => {
    if (!selectedDemand || !isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg border-2 border-white/20 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-white pr-10">{selectedDemand.subject}</h2>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-white"
            >
              X
            </button>
          </div>

          {/* Detalhes principais em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-gray-400 text-sm mb-1">Solicitante:</h3>
              <div className="text-white">
                <p className="font-medium">Nome: {selectedDemand.user?.name}</p>
                <p>Secretaria: {selectedDemand.user?.secretary}</p>
              </div>
            </div>

            <div>
              <h3 className="text-gray-400 text-sm mb-1">Status</h3>
              <div className="flex space-x-2 mb-2">
                <span className={`px-3 py-1 text-sm text-white rounded-full ${selectedDemand.status === 0 ? 'bg-yellow-600' :
                    selectedDemand.status === 1 ? 'bg-blue-600' :
                      selectedDemand.status === 2 ? 'bg-green-600' :
                        selectedDemand.status === 3 ? 'bg-purple-600' :
                          'bg-gray-600'
                  }`}>
                  {getStatusText(selectedDemand.status)}
                </span>
              </div>

            </div>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-sm mb-1">Descrição:</h3>
            <div className="bg-gray-800/50 p-4 rounded-lg text-white">
              {selectedDemand.description}
            </div>
          </div>

          {/* Profissionais envolvidos */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-400 text-sm">Profissionais envolvidos</h3>
            </div>

            {selectedDemand.involved && selectedDemand.involved.length > 0 ? (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {selectedDemand.involved.map(person => (
                    <li key={person.uid} className="text-white flex justify-between items-center">
                      <span>{person.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          removeProfessionalFromDemand(person.uid);
                        }}
                        className="text-red-400 hover:text-red-300 px-2 py-1 rounded-md hover:bg-red-900/20"
                        disabled={savingProfessional}
                      > 
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-yellow-600/20 border border-yellow-600 p-4 rounded-lg">
                <p className="text-yellow-400">No momento há apenas gestores envolvidos nessa demanda.</p>
              </div>
            )}

            {/* Adicionar profissional */}
            <div className="mt-4">
              <div className="flex gap-2">
                <select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                  className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.fullName} - {prof.area}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addProfessionalToDemand}
                  disabled={!selectedProfessional || savingProfessional}
                  className={`bg-green-600 text-white px-4 py-2 rounded-lg ${!selectedProfessional || savingProfessional ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                    }`}
                >
                  {savingProfessional ? "Adicionando..." : "Adicionar profissional"}
                </button>
              </div>
            </div>
          </div>

     {/* Resultado */}
          <div>
            <h3 className="text-gray-400 text-sm mb-1">Resultado</h3>
            {selectedDemand.links && selectedDemand.links.length > 0 ? (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {selectedDemand.links.map((link, index) => (
                    <li key={index} className="text-blue-400 hover:text-blue-300">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
                Não há links disponíveis para sua demanda.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="bg-gray-900 rounded-lg border-2 border-white/20 p-6">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-white">Painel Administrativo de Demandas</h1>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Buscar por palavra-chave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

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

            {/* Contador de resultados */}
            <div className="text-gray-400 text-sm">
              {filteredDemands.length} {filteredDemands.length === 1 ? 'demanda encontrada' : 'demandas encontradas'}
            </div>
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
                    <tr
                      key={index}
                      className="border-t border-gray-800 hover:bg-gray-800/30 cursor-pointer"
                      onClick={() => openDemandDetails(demand)}
                    >
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
                        <span className={`px-2 py-1 text-sm text-white rounded-full ${demand.status === 0 ? 'bg-yellow-600' :
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

      {/* Modal Detalhes */}
      <DemandDetailsModal />
    </div>
  );
};

export default AdminPanel;