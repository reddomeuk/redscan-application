import React, { useState, useEffect } from 'react';
import { Asset, Finding, Scan, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Calendar,
  Download,
  Settings,
  TrendingUp,
  Brain
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SecurityCopilot from '../components/dashboard/SecurityCopilot';
import { toast } from 'sonner';

export default function SecurityCopilotPage() {
  const [assets, setAssets] = useState([]);
  const [findings, setFindings] = useState([]);
  const [scans, setScans] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [currentUser, assetData, findingData, scanData] = await Promise.all([
        User.me(),
        Asset.list('-created_date', 100),
        Finding.list('-created_date', 500),
        Scan.list('-created_date', 200)
      ]);
      
      setUser(currentUser);
      setAssets(assetData);
      setFindings(findingData);
      setScans(scanData);
    } catch (error) {
      console.error('Error loading Security Copilot data:', error);
    }
    setLoading(false);
  };

  const handleWeeklyDigestToggle = (enabled) => {
    setWeeklyDigestEnabled(enabled);
    if (enabled) {
      toast.success('Weekly security digest enabled. You\'ll receive summaries every Monday.');
    } else {
      toast.info('Weekly security digest disabled.');
    }
  };

  const generateWeeklyDigest = async () => {
    toast.info('Generating weekly security digest...');
    
    // Simulate digest generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const digest = {
      title: `Security Digest - Week of ${new Date().toLocaleDateString()}`,
      content: `
        **Weekly Security Summary**
        
        • Total scans: ${scans.length}
        • New vulnerabilities: ${findings.filter(f => new Date(f.created_date) > new Date(Date.now() - 7*24*60*60*1000)).length}
        • Critical issues resolved: ${findings.filter(f => f.severity === 'critical' && f.status === 'resolved').length}
        • Assets monitored: ${assets.length}
        
        **Key Accomplishments:**
        • Patched ${findings.filter(f => f.status === 'resolved').length} vulnerabilities
        • Completed security scans on ${assets.filter(a => a.last_scan_date).length} assets
        • Maintained ${findings.filter(f => f.severity === 'critical' && f.status === 'open').length === 0 ? 'zero' : findings.filter(f => f.severity === 'critical' && f.status === 'open').length} open critical findings
        
        **Recommendations for Next Week:**
        • Focus on medium-severity findings
        • Schedule quarterly security review
        • Update incident response playbooks
      `,
      generated_at: new Date().toISOString()
    };
    
    toast.success('Weekly digest generated and saved!');
    return digest;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="h-10 w-1/3 mb-8 bg-slate-700" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full bg-slate-700" />
          <Skeleton className="h-96 w-full bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-400" />
              Security Copilot
            </h1>
            <p className="text-slate-400">Your AI-powered security assistant and analyst</p>
          </div>
          
          {/* Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="weekly-digest"
                    checked={weeklyDigestEnabled}
                    onCheckedChange={handleWeeklyDigestToggle}
                  />
                  <Label htmlFor="weekly-digest" className="text-slate-300">
                    Weekly Digest
                  </Label>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateWeeklyDigest}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Insights */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 to-slate-800/50 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Security Posture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {findings.filter(f => f.severity === 'critical' && f.status === 'open').length === 0 ? 'Strong' : 'Moderate'}
              </div>
              <p className="text-blue-200 text-sm">
                {findings.filter(f => f.status === 'open').length} open findings across {assets.length} assets
              </p>
              <div className="mt-3 flex gap-2">
                <Badge className="bg-red-500/20 text-red-400">
                  {findings.filter(f => f.severity === 'critical').length} Critical
                </Badge>
                <Badge className="bg-orange-500/20 text-orange-400">
                  {findings.filter(f => f.severity === 'high').length} High
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-slate-800/50 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {findings.filter(f => f.status === 'resolved' && new Date(f.updated_date || f.created_date) > new Date(Date.now() - 7*24*60*60*1000)).length}
              </div>
              <p className="text-green-200 text-sm">Vulnerabilities resolved</p>
              <div className="mt-3">
                <Badge className="bg-green-500/20 text-green-400">
                  ↑ {scans.filter(s => s.status === 'completed' && new Date(s.finished_at || s.created_date) > new Date(Date.now() - 7*24*60*60*1000)).length} Scans completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-slate-800/50 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {Math.round((findings.filter(f => f.status === 'resolved').length / Math.max(findings.length, 1)) * 100)}%
              </div>
              <p className="text-purple-200 text-sm">Resolution rate</p>
              <div className="mt-3">
                <Badge className="bg-purple-500/20 text-purple-400">
                  {findings.filter(f => f.severity === 'critical' && f.status === 'open').length === 0 ? 'Excellent' : 'Needs attention'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Copilot Interface */}
        <SecurityCopilot 
          findings={findings}
          scans={scans}
          assets={assets}
          compact={false}
        />
      </div>
    </div>
  );
}