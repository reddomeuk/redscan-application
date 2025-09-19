import { base44 } from './base44Client';


export const Project = base44.entities.Project;

export const Asset = base44.entities.Asset;

export const Organization = base44.entities.Organization;

export const Scan = base44.entities.Scan;

export const Finding = base44.entities.Finding;

export const Suggestion = base44.entities.Suggestion;

export const Task = base44.entities.Task;

export const Policy = base44.entities.Policy;

export const Risk = base44.entities.Risk;

export const Device = base44.entities.Device;

export const IntunePolicy = base44.entities.IntunePolicy;

export const IntuneConnection = base44.entities.IntuneConnection;

export const Control = base44.entities.Control;

export const KnowledgeArticle = base44.entities.KnowledgeArticle;

export const GeneratedReport = base44.entities.GeneratedReport;

export const ThreatIntelItem = base44.entities.ThreatIntelItem;

export const PhishingCampaign = base44.entities.PhishingCampaign;

export const CustomWidget = base44.entities.CustomWidget;

export const SoftwareItem = base44.entities.SoftwareItem;

export const PostureItem = base44.entities.PostureItem;

export const AgentEvent = base44.entities.AgentEvent;

export const ItsmConnection = base44.entities.ItsmConnection;

export const ItsmAuditLog = base44.entities.ItsmAuditLog;

export const ItsmSyncEvent = base44.entities.ItsmSyncEvent;

export const FieldMapping = base44.entities.FieldMapping;

export const AssignmentRule = base44.entities.AssignmentRule;

export const SyncQueueItem = base44.entities.SyncQueueItem;

export const Invitation = base44.entities.Invitation;

export const AuthAuditLog = base44.entities.AuthAuditLog;

export const Subscription = base44.entities.Subscription;

export const Invoice = base44.entities.Invoice;

export const DomainVerification = base44.entities.DomainVerification;

export const AccessViolationLog = base44.entities.AccessViolationLog;

export const AuthPolicy = base44.entities.AuthPolicy;

export const UserSession = base44.entities.UserSession;

export const SsoBypass = base44.entities.SsoBypass;

export const Region = base44.entities.Region;

export const GeolocationAuditLog = base44.entities.GeolocationAuditLog;

export const OnboardingAuditLog = base44.entities.OnboardingAuditLog;

export const Supplier = base44.entities.Supplier;

export const SupplierReview = base44.entities.SupplierReview;

export const QuestionnaireResponse = base44.entities.QuestionnaireResponse;

export const SupplierAccessReview = base44.entities.SupplierAccessReview;

export const AccessReviewCampaign = base44.entities.AccessReviewCampaign;

export const SupplierDocument = base44.entities.SupplierDocument;

export const MessageThread = base44.entities.MessageThread;

export const SupplierPortalAuditLog = base44.entities.SupplierPortalAuditLog;

export const SupplierSla = base44.entities.SupplierSla;

export const SupplierIncident = base44.entities.SupplierIncident;

export const SupplierContract = base44.entities.SupplierContract;

export const RemediationPlaybook = base44.entities.RemediationPlaybook;

export const RemediationTask = base44.entities.RemediationTask;

export const RemediationEvent = base44.entities.RemediationEvent;

export const DeviceBaseline = base44.entities.DeviceBaseline;

export const MdmConnection = base44.entities.MdmConnection;

export const AssessmentRun = base44.entities.AssessmentRun;

export const EvidenceSnapshot = base44.entities.EvidenceSnapshot;

export const PhishingRecipient = base44.entities.PhishingRecipient;

export const PhishingTemplate = base44.entities.PhishingTemplate;

export const PhishingLandingPage = base44.entities.PhishingLandingPage;

export const PhishingTraining = base44.entities.PhishingTraining;

export const PhishingSettings = base44.entities.PhishingSettings;

export const AttackPath = base44.entities.AttackPath;

export const AttackSurfaceAnalysis = base44.entities.AttackSurfaceAnalysis;

export const AttackSurfaceAlert = base44.entities.AttackSurfaceAlert;

export const PentestEngagement = base44.entities.PentestEngagement;

export const PentestFinding = base44.entities.PentestFinding;

export const PentestCredential = base44.entities.PentestCredential;

export const PentestCredentialCheckout = base44.entities.PentestCredentialCheckout;

export const PentestDocument = base44.entities.PentestDocument;

export const PentestComment = base44.entities.PentestComment;

export const PentestTemplate = base44.entities.PentestTemplate;

export const PentestGeneratedReport = base44.entities.PentestGeneratedReport;

export const PentestVendorApiKey = base44.entities.PentestVendorApiKey;

export const M365PostureProfile = base44.entities.M365PostureProfile;

export const M365PostureRun = base44.entities.M365PostureRun;



// auth sdk:
export const User = base44.auth;

// Helper functions
export const ensureInitialScansForAsset = async (assetId) => {
  try {
    // This would typically ensure initial scans are created for an asset
    const scans = await Scan.filter({ asset_id: assetId });
    return scans;
  } catch (error) {
    console.error('Error ensuring initial scans:', error);
    return [];
  }
};