

import React from "react";
import { Link, useLocation } from "react-router-dom";
import TaskDrawer from "../components/common/TaskDrawer";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Shield, 
  Smartphone,
  Cloud, 
  Building2, 
  Award,
  Settings,
  Bot,
  Menu,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  Users,
  HelpCircle,
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
  Wifi,
  Code,
  Monitor,
  Globe
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Organization } from "@/api/entities";
import { Toaster } from "@/components/ui/sonner";
import { isBefore, differenceInDays } from 'date-fns';
import { TaskQueueProvider } from '../components/contexts/TaskQueueContext';
import AiSecurityCopilot from '@/components/smb/AiSecurityCopilot';

const mainNavigation = [
  { id: 'nav-dashboard', title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { id: 'nav-assets', title: "Assets", url: createPageUrl("Assets"), icon: Target },
  { id: 'nav-findings', title: "Findings", url: createPageUrl("Findings"), icon: Zap },
  { id: 'nav-reports', title: "Reports", url: createPageUrl("Reports"), icon: FileText },
  { id: 'nav-analytics', title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart },
];

  const securityModules = [
    { id: 'sec-center', title: 'Security Center', url: '/security-center', icon: Shield },
    { id: 'sec-soar', title: 'SOAR Platform', url: '/soar', icon: Bot },
    { id: 'sec-network', title: 'Network Security', url: '/network-security', icon: Wifi },
    { id: 'sec-code', title: 'Code Security', url: '/code', icon: Code },
    { id: 'sec-cloud', title: 'Cloud Security', url: '/cloud', icon: Cloud },
    { id: 'sec-endpoints', title: 'Endpoints', url: '/endpoints', icon: Monitor },
    { id: 'sec-web', title: 'Web Security', url: '/web-security', icon: Globe },
  ];

// cloudModules array removed as per simplification
// The M365Posture item was moved to securityModules, and other cloud items are no longer in the primary navigation.

const threatManagement = [
    { id: 'threat-attack', title: "Attack Surface", url: createPageUrl("AttackSurfaceMapper"), icon: Target },
    { id: 'threat-intel', title: "Threat Intelligence", url: createPageUrl("ThreatIntel"), icon: BookOpen },
    { id: 'threat-phishing', title: "Phishing Simulator", url: createPageUrl("PhishingSimulator"), icon: Mail },
];

const governanceModules = [
    { id: 'gov-suppliers', title: "Suppliers", url: createPageUrl("Suppliers"), icon: Building2 },
    { id: 'gov-compliance', title: "Compliance", url: createPageUrl("Compliance"), icon: Award },
    { id: 'gov-risk', title: "Risk", url: createPageUrl("Risk"), icon: ShieldCheck }, 
    { id: 'gov-policies', title: "Policies", url: createPageUrl("Policies"), icon: Shield },
];

const testingModules = [
    { id: 'test-engagements', title: "Engagements", url: createPageUrl("PentestEngagements"), icon: Shield },
    { id: 'test-marketplace', title: "Partner Marketplace", url: createPageUrl("PartnerMarketplace"), icon: Users },
    { id: 'test-reports', title: "Reports", url: createPageUrl("PentestReports"), icon: FileText },
    { id: 'test-templates', title: "Templates", url: createPageUrl("PentestTemplates"), icon: BookOpen },
];

const platformModules = [
    { id: 'plat-connections', title: "Connections", url: createPageUrl("Connections"), icon: Link2 },
    { id: 'plat-rules', title: "Assignment Rules", url: createPageUrl("AssignmentRules"), icon: Users },
    { id: 'plat-billing', title: "Billing", url: createPageUrl("Billing"), icon: Wallet },
    { id: 'plat-ai', title: "AI Trainer", url: createPageUrl("AiKnowledgeTrainer"), icon: Bot },
    { id: 'plat-troubleshoot', title: "Troubleshoot", url: createPageUrl("Troubleshoot"), icon: Wrench },
];

// Hexagon SVG component for subtle background decoration
const HexagonPattern = ({ className = "" }) => (
  <svg className={`absolute inset-0 opacity-5 ${className}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="hexPattern" patternUnits="userSpaceOnUse" width="20" height="17.32">
        <polygon points="10,1 18.66,6 18.66,15 10,20 1.34,15 1.34,6" fill="none" stroke="#B00020" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hexPattern)" />
  </svg>
);


const AppLayout = ({ children, currentPageName }) => {
  const location = useLocation();
  const [darkMode, setDarkMode] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [organizations, setOrganizations] = React.useState([]);
  const [selectedOrgId, setSelectedOrgId] = React.useState('');
  const [branding, setBranding] = React.useState({
    primary: '#B00020',
    secondary: '#1E1E1E',
  });
  const [trialBanner, setTrialBanner] = React.useState(null);
  const [showCopilot, setShowCopilot] = React.useState(true);
  const [isTaskDrawerOpen, setTaskDrawerOpen] = React.useState(false);

  const loadInitialData = React.useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      let orgId = currentUser.organization_id;
      let allOrgs = [];

      const isSuperAdminUser = currentUser.role === 'super_admin';

      if (isSuperAdminUser) { 
        const orgDataList = await Organization.list();
        allOrgs = orgDataList;
      } else if (orgId) {
        const currentOrg = await Organization.get(orgId);
        allOrgs = [currentOrg];
      }

      if (orgId && allOrgs.length > 0) {
        const orgData = allOrgs.find(o => o.id === orgId);
        if (orgData) {
          if (orgData.subscription_tier === 'trial' && orgData.trial_end_date) {
            const endDate = new Date(orgData.trial_end_date);
            if (isBefore(new Date(), endDate)) {
              const daysLeft = differenceInDays(endDate, new Date());
              setTrialBanner(`Your trial ends in ${daysLeft} days. Upgrade to keep your security protection!`);
            }
          }
        }
      }

      setOrganizations(allOrgs);
      setSelectedOrgId(orgId || '');
    } catch (error) {
      console.log("User not authenticated or data fetch failed", error);
      // Fallback for development/demo
      setUser({ full_name: 'Demo Business Owner', email: 'admin@democompany.com', role: 'admin' });
      setOrganizations([{ id: 'demo-org', name: 'Demo Company' }]);
      setSelectedOrgId('demo-org');
      setTrialBanner("You're in a demo environment. Explore all features!");
    }
  }, []);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    await User.logout();
  };
  
  const getUserRole = () => user?.role || 'viewer';
  const canManage = () => getUserRole() === 'admin' || getUserRole() === 'super_admin';
  const isSuperAdmin = () => getUserRole() === 'super_admin';

  const NavGroup = ({ label, items }) => (
    <SidebarGroup className="px-0 mb-4">
      <SidebarGroupLabel className="text-[#8A8A8A] uppercase text-xs font-bold tracking-wider px-3 py-2 mb-2">{label}</SidebarGroupLabel>
      <SidebarGroupContent className="px-0">
        <div className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.id || item.url || item.title} className="list-none w-full">{/* Added fallback keys */}
              <SidebarMenuButton 
                asChild 
                className={`w-full hover:bg-[#B00020]/10 hover:text-[#B00020] transition-all duration-300 rounded-lg text-[#F5F5F5] ${
                  location.pathname.startsWith(item.url) ? 'bg-[#B00020]/20 text-[#B00020] border-l-2 border-[#B00020]' : ''
                }`}
              >
                <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5 w-full no-underline">
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium truncate flex-1 text-left">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#1E1E1E] relative overflow-hidden">
        {/* <HexagonPattern className="fixed inset-0 z-0" /> */}
        
        <Sidebar 
          className="border-r border-[#8A8A8A]/20 bg-[#1E1E1E] backdrop-blur-xl fixed top-0 left-0 z-10 shrink-0 w-64 min-w-64 max-w-64 flex flex-col h-screen"
          style={{ width: '16rem', minWidth: '16rem', maxWidth: '16rem' }}
        >
          <SidebarHeader className="border-b border-[#8A8A8A]/20 p-4 w-full shrink-0">
            <div className="flex items-center gap-3 w-full">
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
          </SidebarHeader>
          
          <SidebarContent className="p-4 flex-1 overflow-y-auto min-h-0">
            <SidebarMenu className="space-y-0 w-full">
              <NavGroup label="Core" items={mainNavigation} />
              <NavGroup label="Security Modules" items={securityModules} />
              <NavGroup label="Threat Management" items={threatManagement} />
              <NavGroup label="Governance" items={governanceModules} />
              <NavGroup label="Penetration Testing" items={testingModules} />
              <NavGroup label="Platform" items={platformModules} />
              
              {isSuperAdmin() && (
                <NavGroup label="System Management" items={[
                  { title: "Tenants", url: createPageUrl("TenantManagement"), icon: Building2, id: "tenants" }
                ]} />
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-[#8A8A8A]/20 p-4 space-y-4 shrink-0">
            {user && (
              <div className="flex items-center gap-3 p-2 bg-[#F5F5F5]/5 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-[#B00020] to-[#8B0000] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-medium text-xs">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {user.full_name || 'Business Owner'}
                  </p>
                  <p className="text-xs text-[#8A8A8A] truncate capitalize">
                    {getUserRole()}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-around">
              {canManage() && (
                <Link to={createPageUrl("Settings")} className="text-[#8A8A8A] hover:text-[#B00020] transition-colors">
                  <Settings className="w-5 h-5" />
                </Link>
              )}
               <button onClick={() => setTaskDrawerOpen(true)} className="text-[#8A8A8A] hover:text-[#B00020] transition-colors">
                  <FlaskConical className="w-5 h-5" />
                </button>
              <span onClick={handleLogout} className="text-[#8A8A8A] hover:text-[#B00020] cursor-pointer transition-colors">
                <LogOut className="w-5 h-5" />
              </span>
            </div>
            
            <div className="text-center pt-2 border-t border-[#8A8A8A]/10">
              <p className="text-xs text-[#8A8A8A]">RedScan — Powered by</p>
              <p className="text-xs font-medium text-[#B00020]">Reddome.org</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div 
          className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden main-content-area"
          style={{ marginLeft: '16rem', width: 'calc(100% - 16rem)' }}
        >
          {trialBanner && (
            <div className="bg-gradient-to-r from-[#B00020] to-[#8B0000] text-white text-center p-2 text-sm font-medium">
              {trialBanner}
            </div>
          )}
          <main className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-br from-[#1E1E1E] via-[#2A2A2A] to-[#1E1E1E] max-w-full">
            <Toaster richColors theme="dark" />
            <div className="relative z-10 max-w-full">
              {children}
            </div>
          </main>
        </div>

        {showCopilot && (
          <div className="w-[400px] h-screen border-l border-[#8A8A8A]/20 flex flex-col bg-[#1E1E1E] fixed top-0 right-0 z-10 shrink-0">
             <AiSecurityCopilot onClose={() => setShowCopilot(false)} isPanel={true} dashboardData={{}} />
          </div>
        )}
        <TaskDrawer isOpen={isTaskDrawerOpen} onClose={() => setTaskDrawerOpen(false)} />
      </div>
      
      <style jsx global>{`
        :root {
          --color-primary: #B00020;
          --color-primary-hover: #8B0000;
          --color-secondary: #1E1E1E;
          --color-surface: #F5F5F5;
          --color-text-primary: #FFFFFFE6;
          --color-text-muted: #8A8A8A;
          --color-border: rgba(138, 138, 138, 0.2);
        }
        
        .font-sans {
          font-family: 'Inter', 'Roboto', 'Open Sans', sans-serif;
        }
        
        .bg-primary { background-color: var(--color-primary); }
        .bg-primary:hover { background-color: var(--color-primary-hover); }
        .text-primary { color: var(--color-primary); }
        .border-primary { border-color: var(--color-primary); }
        
        .hexagon-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B00020' fill-opacity='0.03'%3E%3Cpolygon points='30,10 50,25 50,45 30,60 10,45 10,25'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        /* Ensure sidebar navigation items display inline properly */
        [data-sidebar] [data-sidebar-menu] {
          width: 100%;
        }
        
        [data-sidebar] [data-sidebar-menu-button] {
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
        }
        
        [data-sidebar] [data-sidebar-menu-button] > * {
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
        }
      `}</style>
    </SidebarProvider>
  );
}

// Keep the LayoutWrapper for context providers
export default function LayoutWrapper(props) {
  return (
    <TaskQueueProvider>
      <AppLayout {...props} />
    </TaskQueueProvider>
  );
}

