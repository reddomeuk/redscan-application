import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, FileQuestion, User, LogOut } from 'lucide-react';

const PortalLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('supplierPortalUser');
    navigate('/SupplierPortalLogin');
  };
  
  const user = JSON.parse(localStorage.getItem('supplierPortalUser') || '{}');

  const navItems = [
    { name: 'Dashboard', path: '/SupplierPortalDashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/SupplierPortalDocuments', icon: FileText },
    { name: 'Questionnaires', path: '/SupplierPortalQuestionnaire', icon: FileQuestion },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <aside className="w-64 bg-slate-800/50 p-4 border-r border-slate-700 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">RedScan Portal</h2>
            <p className="text-xs text-slate-400">Supplier Access</p>
          </div>
        </div>
        <nav className="flex-1">
          <ul>
            {navItems.map(item => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-red-900/30 text-[var(--color-primary)]' 
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm truncate">{user.full_name || 'Supplier Contact'}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default PortalLayout;