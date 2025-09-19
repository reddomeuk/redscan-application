import { lazy, Suspense } from 'react';
import Layout from "./Layout.jsx";
import PageLoadingSpinner from "@/components/common/PageLoadingSpinner.jsx";

// Lazy load major pages for better code splitting
const Dashboard = lazy(() => import("./Dashboard"));
const Code = lazy(() => import("./Code"));
const SecurityTraining = lazy(() => import("./SecurityTraining"));
const NetworkSecurity = lazy(() => import("./NetworkSecurity"));
const SoarPlatform = lazy(() => import("./SoarPlatform"));
const PartnerMarketplace = lazy(() => import("./PartnerMarketplace"));
const PartnerPortal = lazy(() => import("./PartnerPortal"));
const Reports = lazy(() => import("./Reports"));
const Policies = lazy(() => import("./Policies"));
const Settings = lazy(() => import("./Settings"));
const Assets = lazy(() => import("./Assets"));
const AssetDetail = lazy(() => import("./AssetDetail"));
const Scans = lazy(() => import("./Scans"));
const Findings = lazy(() => import("./Findings"));
const Connections = lazy(() => import("./Connections"));
const Analytics = lazy(() => import("./Analytics"));
const Compliance = lazy(() => import("./Compliance"));
const AiAssistant = lazy(() => import("./AiAssistant"));
const Controls = lazy(() => import("./Controls"));
const AttackSurfaceMapper = lazy(() => import("./AttackSurfaceMapper"));
const AiKnowledgeTrainer = lazy(() => import("./AiKnowledgeTrainer"));
const SecurityCopilot = lazy(() => import("./SecurityCopilot"));
const ThreatIntel = lazy(() => import("./ThreatIntel"));
const ThreatIntelligence = lazy(() => import("./ThreatIntelligence"));
const IdentityManagement = lazy(() => import("./IdentityManagement"));

import PhishingSimulator from "./PhishingSimulator";

import AgentDownloads from "./AgentDownloads";

import IngestionLog from "./IngestionLog";

import Devices from "./Devices";

import DeviceDetail from "./DeviceDetail";

import AssignmentRules from "./AssignmentRules";

import Pricing from "./Pricing";

import Billing from "./Billing";

import SuperAdminDashboard from "./SuperAdminDashboard";

import SecurityCenter from "./SecurityCenter";

import GetStarted from "./GetStarted";

import Troubleshoot from "./Troubleshoot";

import Suppliers from "./Suppliers";

import SupplierDetail from "./SupplierDetail";

import AccessReviews from "./AccessReviews";

import SupplierPortalLogin from "./SupplierPortalLogin";

import SupplierPortalDashboard from "./SupplierPortalDashboard";

import SupplierPortalDocuments from "./SupplierPortalDocuments";

import SupplierPortalQuestionnaire from "./SupplierPortalQuestionnaire";

import SupplierIncidents from "./SupplierIncidents";

import SupplierIncidentDetail from "./SupplierIncidentDetail";

import ContractsDashboard from "./ContractsDashboard";

import RemediationCenter from "./RemediationCenter";

import SmbApps from "./SmbApps";

import WebSecurity from "./WebSecurity";

import TenantManagement from "./TenantManagement";

import TenantDetail from "./TenantDetail";

import Home from "./Home";

import AdminDiagnostics from "./AdminDiagnostics";

import DeviceBaselines from "./DeviceBaselines";

import ComplianceNew from "./ComplianceNew";

import PhishingCampaignNew from "./PhishingCampaignNew";

import PhishingCampaignDetail from "./PhishingCampaignDetail";

import Risk from "./Risk";

import RiskDashboard from "./RiskDashboard";

import RiskDetail from "./RiskDetail";

import PentestEngagements from "./PentestEngagements";

import PentestEngagementNew from "./PentestEngagementNew";

import PentestReports from "./PentestReports";

import PentestTemplates from "./PentestTemplates";

import M365PostureRuns from "./M365PostureRuns";

import M365Posture from "./M365Posture";

import Cloud from "./Cloud";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Code: Code,
    
    Reports: Reports,
    
    Policies: Policies,
    
    Settings: Settings,
    
    Assets: Assets,
    
    AssetDetail: AssetDetail,
    
    Scans: Scans,
    
    Findings: Findings,
    
    Connections: Connections,
    
    Analytics: Analytics,
    
    Compliance: Compliance,
    
    ThreatIntelligence: ThreatIntelligence,
    
    IdentityManagement: IdentityManagement,
    
    AiAssistant: AiAssistant,
    
    Controls: Controls,
    
    AttackSurfaceMapper: AttackSurfaceMapper,
    
    AiKnowledgeTrainer: AiKnowledgeTrainer,
    
    SecurityCopilot: SecurityCopilot,
    
    ThreatIntel: ThreatIntel,
    
    PhishingSimulator: PhishingSimulator,
    
    AgentDownloads: AgentDownloads,
    
    IngestionLog: IngestionLog,
    
    Devices: Devices,
    
    DeviceDetail: DeviceDetail,
    
    AssignmentRules: AssignmentRules,
    
    Pricing: Pricing,
    
    Billing: Billing,
    
    SuperAdminDashboard: SuperAdminDashboard,
    
    SecurityCenter: SecurityCenter,
    
    GetStarted: GetStarted,
    
    Troubleshoot: Troubleshoot,
    
    Suppliers: Suppliers,
    
    SupplierDetail: SupplierDetail,
    
    AccessReviews: AccessReviews,
    
    SupplierPortalLogin: SupplierPortalLogin,
    
    SupplierPortalDashboard: SupplierPortalDashboard,
    
    SupplierPortalDocuments: SupplierPortalDocuments,
    
    SupplierPortalQuestionnaire: SupplierPortalQuestionnaire,
    
    SupplierIncidents: SupplierIncidents,
    
    SupplierIncidentDetail: SupplierIncidentDetail,
    
    ContractsDashboard: ContractsDashboard,
    
    RemediationCenter: RemediationCenter,
    
    SmbApps: SmbApps,
    
    WebSecurity: WebSecurity,
    
    TenantManagement: TenantManagement,
    
    TenantDetail: TenantDetail,
    
    Home: Home,
    
    AdminDiagnostics: AdminDiagnostics,
    
    DeviceBaselines: DeviceBaselines,
    
    ComplianceNew: ComplianceNew,
        SecurityTraining: SecurityTraining,
    
    PhishingCampaignNew: PhishingCampaignNew,
    
    PhishingCampaignDetail: PhishingCampaignDetail,
    
    Risk: Risk,
    
    RiskDashboard: RiskDashboard,
    
    RiskDetail: RiskDetail,
    
    PentestEngagements: PentestEngagements,
    
    PentestEngagementNew: PentestEngagementNew,
    
    PentestReports: PentestReports,
    
    PentestTemplates: PentestTemplates,
    
    M365PostureRuns: M365PostureRuns,
    
    M365Posture: M365Posture,
    
    Cloud: Cloud,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoadingSpinner />}>
                <Routes>            
                    
                        <Route path="/" element={<Dashboard />} />
                    
                    
                    <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Code" element={<Code />} />
                
                <Route path="/NetworkSecurity" element={<NetworkSecurity />} />
                <Route path="/network-security" element={<NetworkSecurity />} />
                <Route path="/endpoints" element={<Devices />} />

                <Route path="/soar" element={<SoarPlatform />} />

                <Route path="/PartnerMarketplace" element={<PartnerMarketplace />} />                <Route path="/PartnerPortal" element={<PartnerPortal />} />                <Route path="/Reports" element={<Reports />} />                <Route path="/Policies" element={<Policies />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Assets" element={<Assets />} />
                
                <Route path="/AssetDetail" element={<AssetDetail />} />
                
                <Route path="/Scans" element={<Scans />} />
                
                <Route path="/Findings" element={<Findings />} />
                
                <Route path="/Connections" element={<Connections />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Compliance" element={<Compliance />} />
                
                <Route path="/AiAssistant" element={<AiAssistant />} />
                
                <Route path="/Controls" element={<Controls />} />
                
                <Route path="/AttackSurfaceMapper" element={<AttackSurfaceMapper />} />
                
                <Route path="/AiKnowledgeTrainer" element={<AiKnowledgeTrainer />} />
                
                <Route path="/SecurityCopilot" element={<SecurityCopilot />} />
                
                <Route path="/ThreatIntel" element={<ThreatIntel />} />
                
                <Route path="/threat-intelligence" element={<ThreatIntelligence />} />
                
                <Route path="/identity-management" element={<IdentityManagement />} />
                
                <Route path="/PhishingSimulator" element={<PhishingSimulator />} />
                
                <Route path="/AgentDownloads" element={<AgentDownloads />} />
                
                <Route path="/IngestionLog" element={<IngestionLog />} />
                
                <Route path="/Devices" element={<Devices />} />
                
                <Route path="/DeviceDetail" element={<DeviceDetail />} />
                
                <Route path="/AssignmentRules" element={<AssignmentRules />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/Billing" element={<Billing />} />
                
                <Route path="/SuperAdminDashboard" element={<SuperAdminDashboard />} />
                
                <Route path="/SecurityCenter" element={<SecurityCenter />} />
                
                <Route path="/GetStarted" element={<GetStarted />} />
                
                <Route path="/Troubleshoot" element={<Troubleshoot />} />
                
                <Route path="/Suppliers" element={<Suppliers />} />
                
                <Route path="/SupplierDetail" element={<SupplierDetail />} />
                
                <Route path="/AccessReviews" element={<AccessReviews />} />
                
                <Route path="/SupplierPortalLogin" element={<SupplierPortalLogin />} />
                
                <Route path="/SupplierPortalDashboard" element={<SupplierPortalDashboard />} />
                
                <Route path="/SupplierPortalDocuments" element={<SupplierPortalDocuments />} />
                
                <Route path="/SupplierPortalQuestionnaire" element={<SupplierPortalQuestionnaire />} />
                
                <Route path="/SupplierIncidents" element={<SupplierIncidents />} />
                
                <Route path="/SupplierIncidentDetail" element={<SupplierIncidentDetail />} />
                
                <Route path="/ContractsDashboard" element={<ContractsDashboard />} />
                
                <Route path="/RemediationCenter" element={<RemediationCenter />} />
                
                <Route path="/SmbApps" element={<SmbApps />} />
                
                <Route path="/WebSecurity" element={<WebSecurity />} />
                
                <Route path="/TenantManagement" element={<TenantManagement />} />
                
                <Route path="/TenantDetail" element={<TenantDetail />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/AdminDiagnostics" element={<AdminDiagnostics />} />
                
                <Route path="/DeviceBaselines" element={<DeviceBaselines />} />
                
                <Route path="/ComplianceNew" element={<ComplianceNew />} />
                
                <Route path="/PhishingCampaignNew" element={<PhishingCampaignNew />} />
                
                <Route path="/PhishingCampaignDetail" element={<PhishingCampaignDetail />} />
                
                <Route path="/Risk" element={<Risk />} />
                
                <Route path="/RiskDashboard" element={<RiskDashboard />} />
                
                <Route path="/RiskDetail" element={<RiskDetail />} />
                
                <Route path="/PentestEngagements" element={<PentestEngagements />} />
                
                <Route path="/PentestEngagementNew" element={<PentestEngagementNew />} />
                
                <Route path="/PentestReports" element={<PentestReports />} />
                
                <Route path="/PentestTemplates" element={<PentestTemplates />} />
                
                <Route path="/M365PostureRuns" element={<M365PostureRuns />} />
                
                <Route path="/M365Posture" element={<M365Posture />} />
                
                <Route path="/Cloud" element={<Cloud />} />
                    <Route path="/SecurityTraining" element={<SecurityTraining />} />
                
            </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}