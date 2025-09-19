import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Clock, 
  TrendingUp,
  Smartphone,
  Shield,
  Server,
  Play,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

const QuickWinCard = ({ quickWin, onQuickFix }) => {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-[#B00020]/20 text-[#B00020]';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-[#8A8A8A]/20 text-[#8A8A8A]';
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'Low': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'High': return 'bg-[#B00020]/20 text-[#B00020]';
      default: return 'bg-[#8A8A8A]/20 text-[#8A8A8A]';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      endpoints: Smartphone,
      apps: Shield,
      cloud: Server,
      web: Server,
      suppliers: Shield,
      compliance: CheckCircle2
    };
    return icons[category] || Shield;
  };

  const Icon = getCategoryIcon(quickWin.category);

  return (
    <Card className="bg-[#F5F5F5]/5 border-[#8A8A8A]/20 hover:bg-[#F5F5F5]/10 hover:border-[#B00020]/30 transition-all duration-300 shadow-lg rounded-xl relative overflow-hidden">
      {/* Subtle hexagon decoration */}
      <div className="absolute top-2 right-2 opacity-5">
        <svg width="30" height="30" viewBox="0 0 30 30">
          <polygon points="15,2 26,9 26,21 15,28 4,21 4,9" fill="none" stroke="#B00020" strokeWidth="1"/>
        </svg>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#B00020]/20 rounded-lg">
              <Icon className="w-5 h-5 text-[#B00020]" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1">{quickWin.title}</h3>
              <p className="text-sm text-[#8A8A8A]">{quickWin.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getImpactColor(quickWin.impact)}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {quickWin.impact}
            </Badge>
            <Badge className={getEffortColor(quickWin.effort)}>
              <Clock className="w-3 h-3 mr-1" />
              {quickWin.effort}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#8A8A8A]">
            <Clock className="w-4 h-4 inline mr-1" />
            {quickWin.estimatedTime}
          </div>
          
          <Button
            onClick={() => onQuickFix(quickWin.id)}
            size="sm"
            className={quickWin.canAutoFix ? 'bg-[#B00020] hover:bg-[#8B0000]' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {quickWin.canAutoFix ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Auto-Fix
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4 mr-2" />
                Get Help
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function QuickWinsPanel({ quickWins, onQuickFix }) {
  if (quickWins.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-800/20 to-green-700/10 border-green-500/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">All Quick Wins Complete!</h3>
          <p className="text-green-300">
            Excellent work! You've addressed all immediate security improvements.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-800/20 to-yellow-700/10 border-orange-500/30 shadow-lg rounded-xl relative overflow-hidden">
      {/* Background hexagon pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <defs>
            <pattern id="hexGrid" patternUnits="userSpaceOnUse" width="40" height="34.64">
              <polygon points="20,2 35,12 35,24 20,34 5,24 5,12" fill="none" stroke="#B00020" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGrid)" />
        </svg>
      </div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Quick Wins ({quickWins.length})
          <Badge className="bg-yellow-500/20 text-yellow-400 ml-auto">
            High Impact, Low Effort
          </Badge>
        </CardTitle>
        <p className="text-[#F5F5F5] text-sm">
          These simple fixes will significantly improve your security in minutes
        </p>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {quickWins.map((quickWin) => (
          <QuickWinCard
            key={quickWin.id}
            quickWin={quickWin}
            onQuickFix={onQuickFix}
          />
        ))}
      </CardContent>
    </Card>
  );
}