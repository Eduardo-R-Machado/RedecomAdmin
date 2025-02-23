import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Area {
  name: string;
  displayName: string;
}

const EditProfessional = () => {
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    area: '',
    birthDay: '',
    gender: '',
    type: '',
    manager: '',
    managerEmail: '',
    managerWhatsapp: '',
  });

  // Buscar áreas do Firestore
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areasCollection = collection(db, 'areas');
        const areasSnapshot = await getDocs(areasCollection);
        const areasData = areasSnapshot.docs
          .map(doc => ({ name: doc.id, ...doc.data() } as Area))
          .filter(area => area.active)
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
        setAreas(areasData);
      } catch (error) {
        console.error('Erro ao buscar áreas:', error);
      }
    };

    fetchAreas();
  }, []);

  // Buscar lista de profissionais
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const professionalsData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user => user.area)
          .sort((a, b) => a.fullName.localeCompare(b.fullName));

        setProfessionals(professionalsData);
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        setError('Erro ao carregar lista de profissionais.');
      }
    };

    fetchProfessionals();
  }, []);

  const handleProfessionalSelect = (id) => {
    const professional = professionals.find(p => p.id === id);
    if (professional) {
      setSelectedProfessional(professional);
      setFormData({
        fullName: professional.fullName || '',
        whatsapp: professional.whatsapp || '',
        area: professional.area || '',
        birthDay: professional.birthDay || '',
        gender: professional.gender || '',
        type: professional.type?.toString() || '2',
        manager: professional.manager || '',
        managerEmail: professional.managerEmail || '',
        managerWhatsapp: professional.managerWhatsapp || '',
      });
      setError('');
      setSuccess(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfessional) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', selectedProfessional.id);
      await updateDoc(userRef, {
        ...formData,
        type: parseInt(formData.type)
      });
      setSuccess(true);

      // Atualizar a lista de profissionais
      const updatedProfessionals = professionals.map(prof => 
        prof.id === selectedProfessional.id 
          ? { ...prof, ...formData, type: parseInt(formData.type) }
          : prof
      );
      setProfessionals(updatedProfessionals);

    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      setError('Erro ao atualizar profissional. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border-2 border-white/20 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Editar Profissional</h1>

      {/* Seleção de Profissional */}
      <div className="mb-6">
        <label className="block text-gray-400 mb-2">Selecione o Profissional</label>
        <select
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
          onChange={(e) => handleProfessionalSelect(e.target.value)}
          value={selectedProfessional?.id || ''}
        >
          <option value="">Selecione um profissional</option>
          {professionals.map(prof => (
            <option key={prof.id} value={prof.id}>
              {prof.fullName} - {areas.find(a => a.name === prof.area)?.displayName || prof.area}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
          Profissional atualizado com sucesso!
        </div>
      )}

      {selectedProfessional && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 mb-2">Tipo de Usuário</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                required
              >
                <option value="2">Profissional</option>
                <option value="3">Gestor</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Área</label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                required
              >
                <option value="">Selecione uma área</option>
                {areas.map(area => (
                  <option key={area.name} value={area.name}>
                    {area.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Nome Completo</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(21) 99999-9999"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Data de Nascimento</label>
              <input
                type="date"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Gênero</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                required
              >
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {formData.type === '2' && (
              <>
                <div>
                  <label className="block text-gray-400 mb-2">Nome do Gestor</label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Email do Gestor</label>
                  <input
                    type="email"
                    name="managerEmail"
                    value={formData.managerEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">WhatsApp do Gestor</label>
                  <input
                    type="text"
                    name="managerWhatsapp"
                    value={formData.managerWhatsapp}
                    onChange={handleChange}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditProfessional;