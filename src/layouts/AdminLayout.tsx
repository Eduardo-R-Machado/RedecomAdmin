import React, { useState } from 'react';
import { Users, UserPlus, Menu as MenuIcon, X } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

// Remova o { children } dos props já que vamos usar Outlet
const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    {
      title: 'Demandas',
      icon: <Users className="w-5 h-5" />,
      path: '/'
    },
    {
      title: 'Editar Profissional',
      icon: <Users className="w-5 h-5" />,
      path: '/edit-professional'
    },
    {
      title: 'Novo Profissional',
      icon: <UserPlus className="w-5 h-5" />,
      path: '/new-professional'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r-2 border-white/20
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b-2 border-white/20">
          <h1 className="text-2xl font-bold text-white">Redecom</h1>
          <p className="text-gray-400 text-sm">Painel Administrativo</p>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg mb-2 transition-colors duration-200"
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`
        transition-all duration-200 ease-in-out
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
      `}>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;