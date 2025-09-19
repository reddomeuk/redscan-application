import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const PolicyEditorModal = ({ policy, onSave, onClose }) => {
    const [name, setName] = useState(policy?.name || '');
    const [action, setAction] = useState(policy?.action || 'Allow');
    const [conditions, setConditions] = useState(policy?.conditions ? { ...policy.conditions } : {});

    const handleConditionChange = (key, value) => {
        const newConditions = { ...conditions };
        if (value === 'any' || !value) {
            delete newConditions[key];
        } else {
            newConditions[key] = value;
        }
        setConditions(newConditions);
    };

    const handleSubmit = () => {
        if (!name) {
            toast.error("Policy name is required.");
            return;
        }
        const newPolicy = {
            id: policy?.id,
            name,
            action,
            conditions,
        };
        onSave(newPolicy);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{policy ? 'Edit' : 'Create'} Zero-Trust Policy</DialogTitle>
                    <DialogDescription>Define the conditions a device must meet and the action to take.</DialogDescription>
                </DialogHeader>
                <div className="py-6 grid grid-cols-2 gap-6">
                    {/* Column 1: General & Action */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="policy-name">Policy Name</Label>
                            <Input id="policy-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Block Non-Compliant Finance Access" className="bg-slate-900/50 border-slate-700" />
                        </div>
                        <div>
                            <Label htmlFor="policy-action">Action</Label>
                            <Select value={action} onValueChange={setAction}>
                                <SelectTrigger id="policy-action" className="bg-slate-900/50 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="Allow" className="text-white">Allow</SelectItem>
                                    <SelectItem value="Require MFA" className="text-white">Require MFA</SelectItem>
                                    <SelectItem value="Block" className="text-white">Block</SelectItem>
                                    <SelectItem value="Quarantine" className="text-white">Quarantine</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Column 2: Conditions */}
                    <div className="space-y-4 border-l border-slate-700 pl-6">
                        <h3 className="font-medium text-slate-300">Conditions</h3>
                        <div>
                            <Label>Device OS</Label>
                            <Select value={conditions.platform || 'any'} onValueChange={v => handleConditionChange('platform', v)}>
                                <SelectTrigger className="bg-slate-900/50 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="any" className="text-white">Any OS</SelectItem>
                                    <SelectItem value="windows" className="text-white">Windows</SelectItem>
                                    <SelectItem value="macos" className="text-white">macOS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Compliance State</Label>
                            <Select value={conditions.complianceState || 'any'} onValueChange={v => handleConditionChange('complianceState', v)}>
                                <SelectTrigger className="bg-slate-900/50 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="any" className="text-white">Any State</SelectItem>
                                    <SelectItem value="Compliant" className="text-white">Compliant</SelectItem>
                                    <SelectItem value="Non-Compliant" className="text-white">Non-Compliant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>EDR Presence</Label>
                             <Select value={conditions.edrPresent || 'any'} onValueChange={v => handleConditionChange('edrPresent', v)}>
                                <SelectTrigger className="bg-slate-900/50 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="any" className="text-white">Any</SelectItem>
                                    <SelectItem value="true" className="text-white">Present</SelectItem>
                                    <SelectItem value="false" className="text-white">Not Present</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label>Patch Age (Days)</Label>
                            <Input type="number" value={conditions.maxPatchAge || ''} onChange={e => handleConditionChange('maxPatchAge', e.target.value)} placeholder="e.g., 30" className="bg-slate-900/50 border-slate-700"/>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-[var(--color-primary)] hover:bg-red-700">Save Policy</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PolicyEditorModal;