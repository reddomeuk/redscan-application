import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

const NewPaths = ({ onRemove }) => {
  const mockPaths = [
    { id: 1, title: 'Cloud misconfig → S3 public', risk: 85, trend: 'new' },
    { id: 2, title: 'Phished user → SharePoint', risk: 78, trend: 'persisting' }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-[#B00020]" />
          Attack Paths (7d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">2</div>
            <div className="text-xs text-slate-400">New</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">1</div>
            <div className="text-xs text-slate-400">Resolved</div>
          </div>
        </div>
        <div className="space-y-2">
          {mockPaths.map(path => (
            <div key={path.id} className="p-2 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white truncate flex-1">{path.title}</p>
                <Badge className="bg-red-500/20 text-red-400 ml-2">{path.risk}</Badge>
              </div>
              <Badge variant="outline" className="mt-1 text-xs">
                {path.trend === 'new' ? '🆕 New' : '🔄 Persisting'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  NewPaths
};