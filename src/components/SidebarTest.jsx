import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  Smartphone,
  Cloud, 
  Building2, 
  Award,
  Settings,
  Bot,
  LogOut,
  Zap,
  Users,
  FileText,
  BarChart,
  GitBranch,
  Target,
  FlaskConical,
  BookOpen,
  Mail,
  Wallet,
  Wrench,
  Link2,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

const SidebarTest = () => {
  const location = useLocation();
  
  const mainNavigation = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Assets", url: "/assets", icon: Target },
    { title: "Findings", url: "/findings", icon: Zap },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Analytics", url: "/analytics", icon: BarChart },
  ];

  const securityModules = [
    { title: "Code Security", url: "/code", icon: GitBranch },
    { title: "Cloud Security", url: "/cloud", icon: Cloud }, 
    { title: "Endpoints", url: "/devices", icon: Smartphone },
    { title: "Web Security", url: "/websecurity", icon: Shield },
  ];

  const threatManagement = [
    { title: "Attack Surface", url: "/attacksurface", icon: Target },
    { title: "Threat Intelligence", url: "/threatintel", icon: BookOpen },
    { title: "Advanced Threat Intel", url: "/threat-intelligence", icon: FlaskConical },
    { title: "Phishing Simulator", url: "/phishing", icon: Mail },
  ];

  const governanceModules = [
    { title: "Suppliers", url: "/suppliers", icon: Building2 },
    { title: "Compliance", url: "/compliance", icon: Award },
    { title: "Identity Management", url: "/identity-management", icon: Users },
    { title: "Risk", url: "/risk", icon: ShieldCheck }, 
    { title: "Policies", url: "/policies", icon: Shield },
     { title: "Security Training & Awareness", url: "/SecurityTraining", icon: GraduationCap },
  ];

  const NavGroup = ({ label, items }) => (
    <div className="mb-6">
      <h3 className="text-[#8A8A8A] uppercase text-xs font-bold tracking-wider px-3 py-2 mb-2">{label}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <Link 
            key={item.title} 
            to={item.url}
            className={`flex items-center gap-3 px-3 py-2.5 text-[#F5F5F5] hover:bg-[#B00020]/10 hover:text-[#B00020] transition-all duration-300 rounded-lg text-sm font-medium no-underline ${
              location.pathname === item.url ? 'bg-[#B00020]/20 text-[#B00020] border-l-2 border-[#B00020]' : ''
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="truncate">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-64 h-screen bg-[#1E1E1E] border-r border-[#8A8A8A]/20 flex flex-col">
      {/* Header */}
      <div className="border-b border-[#8A8A8A]/20 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#B00020] to-[#8B0000] rounded-lg flex items-center justify-center shadow-lg relative shrink-0">
            <Shield className="w-6 h-6 text-white" />
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="none" stroke="white" strokeWidth="1"/>
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-lg text-white truncate">RedScan</h2>
            <p className="text-xs text-[#8A8A8A] truncate">Security Platform</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <NavGroup label="Core" items={mainNavigation} />
        <NavGroup label="Security Modules" items={securityModules} />
        <NavGroup label="Threat Management" items={threatManagement} />
        <NavGroup label="Governance" items={governanceModules} />
      </div>

      {/* Footer */}
      <div className="border-t border-[#8A8A8A]/20 p-4 space-y-4">
        <div className="flex items-center gap-3 p-2 bg-[#F5F5F5]/5 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-[#B00020] to-[#8B0000] rounded-lg flex items-center justify-center">
            <span className="text-white font-medium text-xs">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">Business Owner</p>
            <p className="text-xs text-[#8A8A8A] truncate">admin</p>
          </div>
        </div>
        
        <div className="flex items-center justify-around">
          <Link to="/settings" className="text-[#8A8A8A] hover:text-[#B00020] transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <button className="text-[#8A8A8A] hover:text-[#B00020] transition-colors">
            <FlaskConical className="w-5 h-5" />
          </button>
          <button className="text-[#8A8A8A] hover:text-[#B00020] transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center pt-2 border-t border-[#8A8A8A]/10">
          <p className="text-xs text-[#8A8A8A]">RedScan — Powered by</p>
          <p className="text-xs font-medium text-[#B00020]">Reddome.org</p>
        </div>
      </div>
    </div>
  );
};

export default SidebarTest;
