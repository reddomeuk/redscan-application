
import React, { useState, useEffect } from "react";
import { Asset, Finding, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Settings,
  RefreshCw,
  FileText,
  Play,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const MOCK_SAAS_DATA = {
  google_workspace: {
    name: 'Google Workspace',
    connected: true,
    score: 75,
    issues: ['MFA not enforced for 3 users', 'Legacy auth enabled']
  },
  salesforce: {
    name: 'Salesforce',
    connected: false,
    score: 0,
    issues: []
  },
  slack: {
    name: 'Slack',
    connected: true,
    score: 90,
    issues: []
  }
};

const SaasAppCard = ({ appKey, appData, onConnect, onFixAll }) => {
  if (!appData.connected) {
    return (
      <Card className="bg-slate-800/30 border-slate-700 border-dashed">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">{appData.name}</h3>
          <Button onClick={() => onConnect(appKey)} className="bg-blue-600 hover:bg-blue-700">Connect App</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-400" />
          <CardTitle className="text-white">{appData.name}</CardTitle>
        </div>
        <Badge className={appData.score >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
          Score: {appData.score}%
        </Badge>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Open Issues</h4>
        {appData.issues.length > 0 ? (
          <div className="space-y-3">
            <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                {appData.issues.map((issue, i) => <li key={i}>{issue}</li>)}
            </ul>
            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => onFixAll(appKey)}>
                <Play className="w-3 h-3 mr-1" />
                Secure App
            </Button>
          </div>
        ) : (
          <div className="text-center py-4 text-green-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
            <p>App is secure!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function SaasAppsPage() {
  const [saasData, setSaasData] = useState(MOCK_SAAS_DATA);

  const handleConnect = (appKey) => {
    toast.info(`Connecting to ${saasData[appKey].name}...`);
    setTimeout(() => {
      setSaasData(prev => ({
        ...prev,
        [appKey]: { ...prev[appKey], connected: true, score: 90 }
      }));
      toast.success(`${saasData[appKey].name} connected successfully!`);
    }, 2000);
  };

  const handleFixAll = (appKey) => {
    toast.info(`Applying security baseline to ${saasData[appKey].name}...`);
    setTimeout(() => {
      setSaasData(prev => ({
        ...prev,
        [appKey]: { ...prev[appKey], issues: [], score: 100 }
      }));
      toast.success(`✅ ${saasData[appKey].name} has been secured!`);
    }, 2000);
  };
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">SaaS & Apps Security</h1>
        <p className="text-slate-400">Monitor and secure your connected business applications.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {Object.entries(saasData).map(([key, data]) => (
          <SaasAppCard
            key={key}
            appKey={key}
            appData={data}
            onConnect={handleConnect}
            onFixAll={handleFixAll}
          />
        ))}
      </div>
    </div>
  );
}
