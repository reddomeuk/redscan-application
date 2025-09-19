import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Code } from 'lucide-react';
import CodeViewer from '../endpoints/CodeViewer';

const ZeroTrustSimulators = ({ policies }) => {
    const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id || '');

    const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

    const generateEntraJson = (policy) => {
        if (!policy) return "{}";
        const entraPolicy = {
            displayName: `RedScan: ${policy.name}`,
            conditions: {
                users: { includeUsers: ["All"] },
                applications: { includeApplications: ["All"] },
                deviceFilter: {
                    mode: "include",
                    rule: Object.entries(policy.conditions)
                        .map(([key, value]) => {
                            if (key === 'complianceState') return `(device.isCompliant -eq ${value === 'Compliant'})`;
                            if (key === 'platform') return `(device.operatingSystem -eq "${value}")`;
                            return null;
                        })
                        .filter(Boolean)
                        .join(" and ")
                }
            },
            grantControls: {
                operator: "OR",
                builtInControls: [],
                customAuthenticationFactors: [],
                termsOfUse: []
            }
        };

        switch (policy.action) {
            case 'Block':
            case 'Quarantine':
                entraPolicy.grantControls.builtInControls.push('block');
                break;
            case 'Require MFA':
                entraPolicy.grantControls.builtInControls.push('mfa');
                break;
            default: // Allow
                // No grant control means allow if conditions met, but for CA it's better to require a compliant device
                entraPolicy.grantControls.builtInControls.push('compliantDevice');
        }

        return JSON.stringify(entraPolicy, null, 2);
    };
    
    const aiGapAnalysis = `**AI Policy Gap Analysis:**

Your current Entra policy for **"${selectedPolicy?.name}"** is a good start, but the RedScan baseline recommends stricter controls.

*   **Weakness:** The policy targets all applications.
*   **Recommendation:** Apply this policy to a specific group of critical apps (e.g., 'Finance Apps', 'DevOps Tools') to reduce user friction while maintaining high security for sensitive data.
*   **Action:** Create a named application group in Entra ID and target this Conditional Access policy to that group.`;

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white">Integration Simulators</CardTitle>
                <CardDescription>
                    Preview how RedScan policies translate to Microsoft Entra and Google Workspace configurations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="entra">
                    <TabsList className="bg-slate-700/50">
                        <TabsTrigger value="entra">Microsoft Entra</TabsTrigger>
                        <TabsTrigger value="google" disabled>Google Workspace (coming soon)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="entra" className="mt-4">
                        <div className="mb-4">
                             <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
                                <SelectTrigger className="w-full md:w-1/2 bg-slate-900/50 border-slate-700">
                                    <SelectValue placeholder="Select a policy to simulate..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {policies.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-white">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                       
                        {selectedPolicy && (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-slate-300 mb-2 flex items-center gap-2"><Code className="w-4 h-4"/>Simulated Conditional Access Policy (JSON)</h4>
                                    <CodeViewer code={generateEntraJson(selectedPolicy)} language="json" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-300 mb-2 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400"/>AI Policy Gap Explainer</h4>
                                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg text-sm text-slate-300 prose prose-invert prose-sm max-w-none">
                                        <p>Your current Entra policy for <strong>"{selectedPolicy.name}"</strong> is a good start, but the RedScan baseline recommends stricter controls.</p>
                                        <ul>
                                            <li><strong>Weakness:</strong> The policy targets all applications.</li>
                                            <li><strong>Recommendation:</strong> Apply this policy to a specific group of critical apps (e.g., 'Finance Apps', 'DevOps Tools') to reduce user friction while maintaining high security for sensitive data.</li>
                                            <li><strong>Action:</strong> Create a named application group in Entra ID and target this Conditional Access policy to that group.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default ZeroTrustSimulators;