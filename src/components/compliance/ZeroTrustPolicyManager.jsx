import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AuthPolicy } from '@/api/entities';
import { Plus, Shield, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import PolicyEditorModal from './PolicyEditorModal';
import ZeroTrustPolicyList from './ZeroTrustPolicyList';
import ZeroTrustSimulators from './ZeroTrustSimulators';

const ZeroTrustPolicyManager = () => {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);

    const loadPolicy = useCallback(async () => {
        setLoading(true);
        try {
            const policies = await AuthPolicy.list();
            let mainPolicy = policies[0];
            if (!mainPolicy) {
                mainPolicy = await AuthPolicy.create({ organization_id: 'org_default' });
            }
            if (!mainPolicy.zero_trust_settings) {
                mainPolicy = await AuthPolicy.update(mainPolicy.id, { 
                    zero_trust_settings: { enforcement_mode: 'Monitor-Only', policies: [] } 
                });
            }
            setPolicy(mainPolicy);
        } catch (error) {
            toast.error("Failed to load Zero-Trust policies.");
            console.error(error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadPolicy();
    }, [loadPolicy]);

    const handleSavePolicy = async (newOrUpdatedPolicy) => {
        try {
            let updatedPolicies;
            const currentPolicies = policy.zero_trust_settings.policies || [];

            if (newOrUpdatedPolicy.id) {
                updatedPolicies = currentPolicies.map(p => p.id === newOrUpdatedPolicy.id ? newOrUpdatedPolicy : p);
            } else {
                updatedPolicies = [...currentPolicies, { ...newOrUpdatedPolicy, id: `ztp-${Date.now()}` }];
            }

            const updatedSettings = { ...policy.zero_trust_settings, policies: updatedPolicies };
            const updatedAuthPolicy = await AuthPolicy.update(policy.id, { zero_trust_settings: updatedSettings });
            
            setPolicy(updatedAuthPolicy);
            toast.success("Zero-Trust policy saved successfully.");
        } catch (error) {
            toast.error("Failed to save policy.");
            console.error(error);
        }
        setIsModalOpen(false);
        setEditingPolicy(null);
    };

    const handleDeletePolicy = async (policyId) => {
        if (!window.confirm("Are you sure you want to delete this policy?")) return;
        
        try {
            const updatedPolicies = policy.zero_trust_settings.policies.filter(p => p.id !== policyId);
            const updatedSettings = { ...policy.zero_trust_settings, policies: updatedPolicies };
            const updatedAuthPolicy = await AuthPolicy.update(policy.id, { zero_trust_settings: updatedSettings });
            
            setPolicy(updatedAuthPolicy);
            toast.success("Policy deleted.");
        } catch (error) {
            toast.error("Failed to delete policy.");
        }
    };
    
    const handleEnforcementChange = async (mode) => {
        try {
            const updatedSettings = { ...policy.zero_trust_settings, enforcement_mode: mode };
            const updatedAuthPolicy = await AuthPolicy.update(policy.id, { zero_trust_settings: updatedSettings });
            setPolicy(updatedAuthPolicy);
            toast.success(`Enforcement mode set to ${mode}.`);
        } catch (error) {
            toast.error("Failed to update enforcement mode.");
        }
    };

    if (loading) {
        return <p className="text-slate-400">Loading Zero-Trust settings...</p>;
    }

    return (
        <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Zero-Trust Access Policies</span>
                        <Button onClick={() => { setEditingPolicy(null); setIsModalOpen(true); }}>
                            <Plus className="w-4 h-4 mr-2"/>
                            New Policy
                        </Button>
                    </CardTitle>
                    <CardDescription>Define conditions and actions to enforce device posture for application access.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 mb-6">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-blue-400" />
                            <div>
                                <Label className="text-white font-medium">Global Enforcement Mode</Label>
                                <p className="text-xs text-slate-400">Current mode: {policy.zero_trust_settings?.enforcement_mode}</p>
                            </div>
                        </div>
                         <select
                            value={policy.zero_trust_settings?.enforcement_mode}
                            onChange={(e) => handleEnforcementChange(e.target.value)}
                            className="bg-slate-800 border border-slate-600 rounded-md p-2 text-sm text-white"
                        >
                            <option value="Monitor-Only">Monitor-Only</option>
                            <option value="MFA Required">MFA Required</option>
                            <option value="Strict Enforcement">Strict Enforcement</option>
                        </select>
                    </div>
                    <ZeroTrustPolicyList 
                        policies={policy.zero_trust_settings?.policies || []}
                        onEdit={(p) => { setEditingPolicy(p); setIsModalOpen(true); }}
                        onDelete={handleDeletePolicy}
                    />
                </CardContent>
            </Card>

            <ZeroTrustSimulators policies={policy.zero_trust_settings?.policies || []} />

            {isModalOpen && (
                <PolicyEditorModal
                    policy={editingPolicy}
                    onSave={handleSavePolicy}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ZeroTrustPolicyManager;