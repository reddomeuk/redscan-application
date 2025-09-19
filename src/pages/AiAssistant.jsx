
import React, { useState, useEffect } from "react";
import { Asset, Finding, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FreeAIProviders } from "@/services/FreeAIProviders";
import AIProviderSetup from "@/components/ai/AIProviderSetup";
import AIServiceErrorBoundary from "@/components/common/AIServiceErrorBoundary";
import { 
  Bot, 
  Target, 
  Shield, 
  Code, 
  MessageCircle,
  Play,
  ArrowRight,
  Terminal,
  Eye,
  Lock,
  Zap,
  Brain,
  FileCode,
  AlertTriangle,
  Settings,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// AI Pentest Assistant Component
const PentestAssistant = ({ assets }) => {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [pentestData, setPentestData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const pentestPhases = [
    {
      name: "Reconnaissance",
      icon: Eye,
      description: "Information gathering and target analysis"
    },
    {
      name: "Enumeration", 
      icon: Terminal,
      description: "Service and vulnerability discovery"
    },
    {
      name: "Exploitation",
      icon: Zap,
      description: "Attempt to exploit discovered vulnerabilities"
    },
    {
      name: "Post-Exploitation",
      icon: Lock,
      description: "Privilege escalation and lateral movement"
    }
  ];

  const generatePentestScenario = (asset) => {
    const scenarios = {
      domain: {
        recon: {
          commands: ["nmap -sn " + asset.url, "dig " + asset.url, "whois " + asset.url],
          findings: ["Found 3 subdomains", "Identified web server: Apache 2.4.41", "Email addresses leaked in WHOIS"],
          explanation: "Initial reconnaissance revealed the target's infrastructure and potential attack surface."
        },
        enumeration: {
          commands: ["nmap -sV -sC " + asset.url, "nikto -h " + asset.url, "gobuster dir -u http://" + asset.url],
          findings: ["Port 22 (SSH) open", "Port 80 (HTTP) with outdated PHP", "Found /admin directory"],
          explanation: "Service enumeration uncovered potentially vulnerable services and hidden directories."
        },
        exploitation: {
          commands: ["sqlmap -u http://" + asset.url + "/login", "hydra -l admin -P passwords.txt " + asset.url + " ssh"],
          findings: ["SQL injection in login form", "Weak SSH credentials discovered"],
          explanation: "Exploitation attempts revealed critical vulnerabilities allowing unauthorized access."
        },
        post_exploitation: {
          commands: ["sudo -l", "find / -perm -4000 2>/dev/null", "cat /etc/passwd"],
          findings: ["User has sudo privileges", "Found SUID binaries", "Retrieved user list"],
          explanation: "Post-exploitation activities would allow an attacker to escalate privileges and maintain persistence."
        }
      },
      ip: {
        recon: {
          commands: ["nmap -sn " + asset.url, "ping " + asset.url, "traceroute " + asset.url],
          findings: ["Host is alive", "No firewall detected", "Direct routing path"],
          explanation: "Target IP is directly accessible with no intermediate filtering."
        },
        enumeration: {
          commands: ["nmap -p- " + asset.url, "nmap -sU --top-ports 100 " + asset.url],
          findings: ["21 ports open", "FTP anonymous login enabled", "SNMP community string 'public'"],
          explanation: "Multiple services discovered with potential security misconfigurations."
        },
        exploitation: {
          commands: ["ftp " + asset.url, "snmpwalk -c public -v1 " + asset.url],
          findings: ["Anonymous FTP access granted", "Retrieved system information via SNMP"],
          explanation: "Misconfigured services provide unauthorized access to system information."
        },
        post_exploitation: {
          commands: ["ls -la /home", "cat /proc/version", "netstat -tuln"],
          findings: ["Multiple user directories found", "Kernel version 4.15.0", "Additional services discovered"],
          explanation: "Further enumeration reveals potential for lateral movement and system compromise."
        }
      }
    };

    const assetType = asset.type === 'domain' ? 'domain' : 'ip';
    return scenarios[assetType] || scenarios.domain;
  };

  const handleStartPentest = async () => {
    const asset = assets.find(a => a.id === selectedAsset);
    if (!asset) return;

    setIsRunning(true);
    setCurrentStep(0);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenario = generatePentestScenario(asset);
    setPentestData(scenario);
    setIsRunning(false);
    
    toast.success("AI Pentest scenario generated successfully!");
  };

  const handleNextStep = () => {
    if (currentStep < pentestPhases.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const currentPhase = pentestPhases[currentStep];
  const phaseKey = currentPhase?.name.toLowerCase().replace('-', '_');
  const currentData = pentestData?.[phaseKey];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-red-400" />
            AI Penetration Testing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Select target asset" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {assets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id} className="text-white">
                    {asset.name} ({asset.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleStartPentest}
              disabled={!selectedAsset || isRunning}
              className="bg-red-700 hover:bg-red-800"
            >
              {isRunning ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Start AI Pentest
            </Button>
          </div>
        </CardContent>
      </Card>

      {pentestData && (
        <>
          {/* Phase Navigation */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {pentestPhases.map((phase, index) => {
                  const PhaseIcon = phase.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div key={phase.name} className="flex items-center">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isActive ? 'bg-red-700/30 text-red-300' : 
                        isCompleted ? 'bg-green-700/30 text-green-300' : 
                        'bg-slate-700/30 text-slate-400'
                      }`}>
                        <PhaseIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{phase.name}</span>
                      </div>
                      {index < pentestPhases.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-500 mx-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Current Phase Details */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {React.createElement(currentPhase.icon, { className: "w-5 h-5 text-red-400" })}
                {currentPhase.name}
              </CardTitle>
              <p className="text-slate-400">{currentPhase.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentData && (
                <>
                  {/* Commands */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Commands Executed</h4>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-2">
                      {currentData.commands.map((cmd, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Terminal className="w-3 h-3 text-green-400" />
                          <code className="text-green-400 text-sm font-mono">{cmd}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Findings */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Key Findings</h4>
                    <div className="space-y-2">
                      {currentData.findings.map((finding, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/30 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <span className="text-slate-300 text-sm">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">AI Analysis</h4>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-200 text-sm leading-relaxed">{currentData.explanation}</p>
                    </div>
                  </div>

                  {/* Next Step Button */}
                  {currentStep < pentestPhases.length - 1 && (
                    <div className="flex justify-end">
                      <Button onClick={handleNextStep} className="bg-red-700 hover:bg-red-800">
                        Next Phase <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  {currentStep === pentestPhases.length - 1 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <h4 className="text-red-200 font-medium mb-2">⚠️ Pentest Complete</h4>
                      <p className="text-red-200 text-sm">
                        This simulation demonstrates potential attack paths. Implement security controls to prevent these attack vectors.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// Attack Scenario Simulator Component
const AttackScenarioSimulator = ({ assets, findings }) => {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [simulationData, setSimulationData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const attackScenarios = [
    { id: 'phishing', name: 'Phishing Campaign', icon: '🎣' },
    { id: 'ransomware', name: 'Ransomware Attack', icon: '🔒' },
    { id: 'sqli', name: 'SQL Injection', icon: '💉' },
    { id: 'cloud_misconfig', name: 'Cloud Misconfiguration', icon: '☁️' },
    { id: 'insider_threat', name: 'Insider Threat', icon: '👤' }
  ];

  const generateAttackSimulation = (scenarioId) => {
    const simulations = {
      phishing: {
        title: "Phishing Campaign Simulation",
        phases: [
          {
            name: "Initial Access",
            description: "Attacker sends phishing emails to employees",
            success_probability: 85,
            impact: "Employee clicks malicious link, credentials compromised",
            defenses: ["Email filtering", "User training"],
            defense_effectiveness: "Partial - 60% of emails blocked"
          },
          {
            name: "Credential Harvesting",
            description: "Stolen credentials used to access systems",
            success_probability: 70,
            impact: "Access to corporate email and file shares",
            defenses: ["MFA enforcement", "Conditional access"],
            defense_effectiveness: "Strong - MFA would block this attack"
          },
          {
            name: "Lateral Movement",
            description: "Attacker explores network for valuable data",
            success_probability: 45,
            impact: "Discovery of sensitive customer database",
            defenses: ["Network segmentation", "Access controls"],
            defense_effectiveness: "Weak - Limited network monitoring"
          }
        ],
        overall_risk: "High",
        business_impact: "Potential data breach affecting 10,000+ customers. Estimated cost: $2.5M in fines and remediation.",
        recommendations: [
          "Implement mandatory MFA for all users",
          "Deploy advanced email security solutions",
          "Conduct regular phishing simulation training",
          "Implement zero-trust network architecture"
        ]
      },
      ransomware: {
        title: "Ransomware Attack Simulation", 
        phases: [
          {
            name: "Initial Compromise",
            description: "Ransomware delivered via email attachment",
            success_probability: 75,
            impact: "Malware executes on endpoint device",
            defenses: ["Email security", "Endpoint protection"],
            defense_effectiveness: "Moderate - Some variants detected"
          },
          {
            name: "Encryption",
            description: "Files encrypted across network shares",
            success_probability: 90,
            impact: "Critical business files become inaccessible",
            defenses: ["File backups", "Endpoint detection"],
            defense_effectiveness: "Critical - Backups would enable recovery"
          },
          {
            name: "Ransom Demand",
            description: "Attacker demands payment for decryption",
            success_probability: 100,
            impact: "Business operations completely halted",
            defenses: ["Incident response plan", "Business continuity"],
            defense_effectiveness: "Variable - Depends on backup quality"
          }
        ],
        overall_risk: "Critical",
        business_impact: "Complete business shutdown for 3-7 days. Revenue loss: $500K per day. Recovery costs: $1M+",
        recommendations: [
          "Implement immutable backup strategy",
          "Deploy behavioral-based endpoint protection",
          "Create and test incident response procedures",
          "Segment critical systems from general network"
        ]
      }
    };

    return simulations[scenarioId] || simulations.phishing;
  };

  const handleRunSimulation = async () => {
    if (!selectedScenario) return;

    setIsSimulating(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const simulation = generateAttackSimulation(selectedScenario);
    setSimulationData(simulation);
    setIsSimulating(false);
    
    toast.success("Attack scenario simulation complete!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Attack Scenario Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {attackScenarios.map(scenario => (
              <Card 
                key={scenario.id}
                className={`cursor-pointer transition-all border-slate-700 ${
                  selectedScenario === scenario.id 
                    ? 'bg-red-500/20 border-red-500/50' 
                    : 'bg-slate-900/30 hover:bg-slate-900/50'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{scenario.icon}</div>
                  <div className="text-sm text-white font-medium">{scenario.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={handleRunSimulation}
              disabled={!selectedScenario || isSimulating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSimulating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Attack Simulation
            </Button>
          </div>
        </CardContent>
      </Card>

      {simulationData && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{simulationData.title}</CardTitle>
            <Badge className={`w-fit ${simulationData.overall_risk === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {simulationData.overall_risk} Risk
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Attack Phases */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-4">Attack Progression</h4>
              <div className="space-y-4">
                {simulationData.phases.map((phase, index) => (
                  <div key={index} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-white">{phase.name}</h5>
                      <Badge className={`${phase.success_probability > 70 ? 'bg-red-500/20 text-red-400' : phase.success_probability > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {phase.success_probability}% Success
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">{phase.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="text-xs font-medium text-red-300 mb-1">Potential Impact:</h6>
                        <p className="text-xs text-slate-400">{phase.impact}</p>
                      </div>
                      <div>
                        <h6 className="text-xs font-medium text-blue-300 mb-1">Defense Status:</h6>
                        <p className="text-xs text-slate-400">{phase.defense_effectiveness}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Impact */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h4 className="text-red-200 font-medium mb-2">Business Impact Assessment</h4>
              <p className="text-red-200 text-sm leading-relaxed">{simulationData.business_impact}</p>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {simulationData.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-blue-500/10 rounded-lg">
                    <Brain className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span className="text-blue-200 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// AI Code Fixer Component
const AiCodeFixer = ({ findings }) => {
  const [selectedFinding, setSelectedFinding] = useState('');
  const [fixData, setFixData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const codeFindings = findings.filter(f => ['sast', 'sca', 'secrets', 'iac'].includes(f.source));

  const generateCodeFix = (finding) => {
    const fixes = {
      sast: {
        title: "SQL Injection Vulnerability Fix",
        explanation: "This fix replaces direct string concatenation with parameterized queries to prevent SQL injection attacks.",
        original_code: `// Vulnerable code
String query = "SELECT * FROM users WHERE username='" + userInput + "' AND password='" + password + "'";
Statement stmt = connection.createStatement();
ResultSet rs = stmt.executeQuery(query);`,
        fixed_code: `// Fixed code
String query = "SELECT * FROM users WHERE username=? AND password=?";
PreparedStatement pstmt = connection.prepareStatement(query);
pstmt.setString(1, userInput);
pstmt.setString(2, password);
ResultSet rs = pstmt.executeQuery();`,
        confidence: 95,
        risk_reduction: "Eliminates SQL injection vulnerability completely"
      },
      sca: {
        title: "Vulnerable Dependency Update",
        explanation: "This fix updates the vulnerable library to a patched version that resolves the security issue.",
        original_code: `// package.json
{
  "dependencies": {
    "lodash": "^4.17.19"
  }
}`,
        fixed_code: `// package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}`,
        confidence: 100,
        risk_reduction: "Updates to patched version, resolving CVE-2021-23337"
      },
      secrets: {
        title: "Hardcoded Secret Removal",
        explanation: "This fix removes hardcoded credentials and replaces them with environment variables.",
        original_code: `// Vulnerable code
const apiKey = "REDACTED_FOR_SECURITY";
const dbPassword = "REDACTED_FOR_SECURITY";

connect(apiKey, dbPassword);`,
        fixed_code: `// Fixed code
const apiKey = import.meta.env.VITE_API_KEY;
const dbPassword = import.meta.env.VITE_DB_PASSWORD;

if (!apiKey || !dbPassword) {
  throw new Error("Required environment variables not set");
}

connect(apiKey, dbPassword);`,
        confidence: 90,
        risk_reduction: "Removes hardcoded secrets, requires proper configuration management"
      },
      iac: {
        title: "Terraform Security Misconfiguration Fix",
        explanation: "This fix enables encryption and restricts access to follow security best practices.",
        original_code: `# Vulnerable Terraform
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
  
  versioning {
    enabled = false
  }
}`,
        fixed_code: `# Fixed Terraform
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
  
  public_access_block {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }
}`,
        confidence: 85,
        risk_reduction: "Enables versioning, encryption, and blocks public access"
      }
    };

    return fixes[finding.source] || fixes.sast;
  };

  const handleGenerateFix = async () => {
    const finding = codeFindings.find(f => f.id === selectedFinding);
    if (!finding) return;

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const fix = generateCodeFix(finding);
    setFixData(fix);
    setIsGenerating(false);
    
    toast.success("AI code fix generated successfully!");
  };

  const handleApplyFix = () => {
    toast.success("Code fix applied successfully! (Simulated)");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-green-400" />
            AI Code Fixer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedFinding} onValueChange={setSelectedFinding}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Select code finding to fix" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {codeFindings.map(finding => (
                  <SelectItem key={finding.id} value={finding.id} className="text-white">
                    {finding.title} ({finding.source.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerateFix}
              disabled={!selectedFinding || isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Generate AI Fix
            </Button>
          </div>
        </CardContent>
      </Card>

      {fixData && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{fixData.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400">
                {fixData.confidence}% Confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Explanation */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-200 text-sm leading-relaxed">{fixData.explanation}</p>
            </div>

            {/* Code Diff */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-red-300 mb-3">❌ Before (Vulnerable)</h4>
                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                  <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap">
                    {fixData.original_code}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-300 mb-3">✅ After (Fixed)</h4>
                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                  <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap">
                    {fixData.fixed_code}
                  </pre>
                </div>
              </div>
            </div>

            {/* Risk Reduction */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-green-200 font-medium mb-2">Risk Reduction</h4>
              <p className="text-green-200 text-sm">{fixData.risk_reduction}</p>
            </div>

            {/* Apply Fix */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-slate-600 text-slate-300">
                Review Changes
              </Button>
              <Button onClick={handleApplyFix} className="bg-green-600 hover:bg-green-700">
                Apply Fix
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Main AI Assistant Page
export default function AiAssistantPage() {
  const [assets, setAssets] = useState([]);
  const [findings, setFindings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [currentUser, assetData, findingData] = await Promise.all([
        User.me(),
        Asset.list('-created_date', 50),
        Finding.list('-created_date', 100)
      ]);
      
      setUser(currentUser);
      setAssets(assetData);
      setFindings(findingData);
    } catch (error) {
      console.error('Error loading AI Assistant data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="h-10 w-1/3 mb-8 bg-slate-700" />
        <div className="grid grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 bg-slate-700" />)}
        </div>
      </div>
    );
  }

  return (
    <AIServiceErrorBoundary 
      componentName="AI Assistant Page"
      fallbackMessage="The AI Assistant is currently experiencing technical difficulties. Please try again in a few moments or use the manual security tools available in the dashboard."
    >
      <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Bot className="w-8 h-8 text-purple-400" />
                AI Security Assistant
              </h1>
              <p className="text-slate-400">Intelligent security automation and guidance powered by AI</p>
            </div>
          </div>

          {/* Tabs for different AI tools */}
          <Tabs defaultValue="setup" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-8">
            <TabsTrigger value="setup">⚙️ AI Setup</TabsTrigger>
            <TabsTrigger value="pentest">🎯 Pentest Assistant</TabsTrigger>
            <TabsTrigger value="attack-sim">🛡️ Threat Simulator</TabsTrigger>
            <TabsTrigger value="attack-surface">🗺️ Attack Surface</TabsTrigger>
            <TabsTrigger value="code-fixer">🔧 Code Fixer</TabsTrigger>
            <TabsTrigger value="knowledge">🧠 Knowledge Trainer</TabsTrigger>
            <TabsTrigger value="chat">💬 AI Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <AIProviderSetup />
          </TabsContent>

          <TabsContent value="pentest">
            <PentestAssistant assets={assets} />
          </TabsContent>

          <TabsContent value="attack-sim">
            <AttackScenarioSimulator assets={assets} findings={findings} />
          </TabsContent>

          <TabsContent value="attack-surface">
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Attack Surface Mapper</h3>
              <p className="text-slate-400 mb-6">
                Visualize potential attack paths through your infrastructure
              </p>
              <Button 
                onClick={() => window.location.href = '/AttackSurfaceMapper'}
                className="bg-red-700 hover:bg-red-800"
              >
                Open Attack Surface Mapper
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="code-fixer">
            <AiCodeFixer findings={findings} />
          </TabsContent>

          <TabsContent value="knowledge">
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold text-white mb-2">AI Knowledge Trainer</h3>
              <p className="text-slate-400 mb-6">
                Interactive security knowledge base with expert guidance
              </p>
              <Button 
                onClick={() => window.location.href = '/AiKnowledgeTrainer'}
                className="bg-purple-700 hover:bg-purple-800"
              >
                Open Knowledge Trainer
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  AI Remediation Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-96 bg-slate-900/50 border border-slate-700 rounded-lg p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Bot className="w-6 h-6 text-purple-400 mt-1" />
                      <div className="bg-slate-700 rounded-lg p-3 max-w-md">
                        <p className="text-white text-sm">
                          Hi! I'm your AI security assistant. I can help you with:
                        </p>
                        <ul className="text-slate-300 text-sm mt-2 space-y-1">
                          <li>• Step-by-step remediation guides</li>
                          <li>• Security best practices</li>
                          <li>• Compliance guidance</li>
                          <li>• Threat analysis</li>
                        </ul>
                        <p className="text-white text-sm mt-2">
                          What security challenge can I help you with today?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask me about remediation steps, security best practices, or compliance requirements..."
                    className="bg-slate-900/50 border-slate-700 text-white min-h-[60px]"
                  />
                  <Button className="bg-purple-600 hover:bg-purple-700 h-fit">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AIServiceErrorBoundary>
  );
}
