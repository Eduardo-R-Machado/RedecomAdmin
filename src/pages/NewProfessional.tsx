import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, collection, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Area {
  name: string;
  displayName: string;
}

const NewProfessional = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    whatsapp: '',
    area: '',
    birthDay: '',
    gender: '',
    type: '2', // Padrão como profissional
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
          .filter(area => area.active) // Apenas áreas ativas
          .sort((a, b) => a.displayName.localeCompare(b.displayName)); // Ordenar por displayName
        setAreas(areasData);
      } catch (error) {
        console.error('Erro ao buscar áreas:', error);
      }
    };

    fetchAreas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const userDocRef = doc(collection(db, 'users'));
      const userUID = userDocRef.id;

      // Criar usuário no Authentication com o mesmo UID
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Remover o campo password e criar uma cópia dos dados
      const { password, ...userData } = formData;

      // Criar documento do usuário no Firestore sem o campo password
      await setDoc(doc(db, 'users', userUID), {
        ...userData,
        type: parseInt(formData.type),
        dataAuth: true,
        terms: true
      });

      setSuccess(true);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        whatsapp: '',
        area: '',
        birthDay: '',
        gender: '',
        type: '2',
        manager: '',
        managerEmail: '',
        managerWhatsapp: '',
      });
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso.');
      } else {
        setError('Erro ao criar usuário. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border-2 border-white/20 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Novo Usuário</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
          Usuário criado com sucesso!
        </div>
      )}

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
            <label className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
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
          {loading ? 'Criando...' : 'Criar Usuário'}
        </button>
      </form>
    </div>
  );
};

export default NewProfessional;