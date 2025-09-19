import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

export default function QuickActions({ canEdit, projects, assets, handle }) {
    return (
        <Card {...handle} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {canEdit && (
                    <button className="w-full p-3 bg-red-800/20 border border-red-500/30 rounded-lg hover:bg-red-800/30 transition-all duration-200 text-left">
                        <div className="font-medium text-white">Start New Scan</div>
                        <div className="text-sm text-slate-400">Initiate security assessment</div>
                    </button>
                )}
                
                <button className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200 text-left">
                    <div className="font-medium text-white">Generate Report</div>
                    <div className="text-sm text-slate-400">Export security findings</div>
                </button>
                
                {canEdit && (
                    <button className="w-full p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200 text-left">
                        <div className="font-medium text-white">Add New Asset</div>
                        <div className="text-sm text-slate-400">Expand monitoring scope</div>
                    </button>
                )}

                <div className="pt-4 border-t border-slate-700">
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Active Projects</h4>
                    <div className="space-y-2">
                        {projects.slice(0, 3).map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-2 bg-slate-900/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: project.color || '#3b82f6' }}
                                    ></div>
                                    <span className="text-sm text-slate-300">{project.name}</span>
                                </div>
                                <Badge variant="outline" className="text-xs text-slate-400">
                                    {assets.filter(a => a.project_id === project.id).length} assets
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}