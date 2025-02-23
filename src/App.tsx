import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AdminPanel from './pages/AdminPanel';
import EditProfessional from './pages/EditProfessional';
import NewProfessional from './pages/NewProfessional';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import InitializeAreas from './pages/InitializeAreas';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminPanel />} />
            <Route path="edit-professional" element={<EditProfessional />} />
            <Route path="new-professional" element={<NewProfessional />} />
            <Route path="initialize-areas" element={<InitializeAreas />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;