import React, { useState } from 'react';
import { auth } from '../config/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';

const ALLOWED_EMAILS = [
  'eduardo.machado@mesquita.rj.gov.br',
  'daniel.souza@mesquita.rj.gov.br'
];



interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!ALLOWED_EMAILS.includes(email)) {
      setError('Você não tem permissão para acessar este painel.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redireciona para a página que o usuário tentou acessar inicialmente
      const locationState = location.state as LocationState;
      const destination = locationState?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (error.code === 'auth/user-disabled') {
        setError('Esta conta foi desativada.');
      } else if (error.code === 'auth/user-not-found') {
        setError('Usuário não encontrado.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Senha incorreta.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg border-2 border-white/20 backdrop-blur-sm">
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">Redecom</h1>
            <h2 className="text-xl text-gray-400">Painel Administrativo</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Email"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Senha"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;