import React, { useState, useEffect } from 'react';
import { DeviceBaseline } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, GitCompareArrows, Play, Plus, Clock } from 'lucide-react';
import BaselineCompareModal from '../components/endpoints/BaselineCompareModal';
import BaselineDeployModal from '../components/endpoints/BaselineDeployModal';
import ActionButton from '../components/ui/ActionButton';

const getProviderIcon = (provider) => {
    // In a real app, you'd have proper icons
    return provider === 'intune' ? 'Ms' : 'G';
};

const BaselineCard = ({ baseline, onCompare, onDeploy }) => (
    <Card className="bg-slate-800/50 border-slate-700 flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-white text-lg">{baseline.name}</CardTitle>
                    <CardDescription>{baseline.description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-slate-300 border-slate-600">{getProviderIcon(baseline.provider)} {baseline.platform}</Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">Version:</span>
                <span className="text-white font-mono">{baseline.version}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">CE+ Controls:</span>
                <span className="text-white">{baseline.ce_control_mapping?.length || 0}</span>
            </div>
             <div className="flex justify-between text-sm items-center">
                <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Last Deployed:</span>
                {baseline.last_deployed_at ? (
                    <Badge className={baseline.last_deployment_status === 'succeeded' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {new Date(baseline.last_deployed_at).toLocaleDateString()}
                    </Badge>
                ) : (
                    <Badge variant="secondary">Never</Badge>
                )}
            </div>
        </CardContent>
        <div className="p-4 border-t border-slate-700 flex gap-2">
            <Button variant="outline" className="w-full" onClick={() => onCompare(baseline)}>
                <GitCompareArrows className="w-4 h-4 mr-2" /> Compare
            </Button>
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => onDeploy(baseline)}>
                <Play className="w-4 h-4 mr-2" /> Deploy
            </Button>
        </div>
    </Card>
);

export default function DeviceBaselinesPage() {
    const [baselines, setBaselines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBaseline, setSelectedBaseline] = useState(null);
    const [isCompareModalOpen, setCompareModalOpen] = useState(false);
    const [isDeployModalOpen, setDeployModalOpen] = useState(false);

    useEffect(() => {
        const loadBaselines = async () => {
            const data = await DeviceBaseline.list();
            setBaselines(data);
            setLoading(false);
        };
        loadBaselines();
    }, []);

    const handleCompare = (baseline) => {
        setSelectedBaseline(baseline);
        setCompareModalOpen(true);
    };

    const handleDeploy = (baseline) => {
        setSelectedBaseline(baseline);
        setDeployModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Device Baselines</h1>
                    <p className="text-slate-400">Manage and deploy security configurations to your MDM providers.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> New Baseline
                </Button>
            </header>

            {loading ? (
                <p className="text-slate-400">Loading baselines...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {baselines.map(baseline => (
                        <BaselineCard key={baseline.id} baseline={baseline} onCompare={handleCompare} onDeploy={handleDeploy} />
                    ))}
                </div>
            )}
            
            <BaselineCompareModal isOpen={isCompareModalOpen} onClose={() => setCompareModalOpen(false)} baseline={selectedBaseline} />
            <BaselineDeployModal isOpen={isDeployModalOpen} onClose={() => setDeployModalOpen(false)} baseline={selectedBaseline} />
        </div>
    );
}