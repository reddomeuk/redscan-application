import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Calendar, 
  Target,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const ComplianceCard = ({ framework, data }) => {
  if (!data) return null;

  const getProgressColor = (score) => {
    if (score >= 80) return 'from-green-600 to-green-500';
    if (score >= 60) return 'from-yellow-600 to-yellow-500';
    return 'from-[#B00020] to-[#8B0000]';
  };

  const getStatusBadge = (score) => {
    if (score >= 80) return <Badge className="bg-green-500/20 text-green-400">Ready</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500/20 text-yellow-400">In Progress</Badge>;
    return <Badge className="bg-[#B00020]/20 text-[#B00020]">Needs Work</Badge>;
  };

  const daysUntilDeadline = data.nextDeadline ? differenceInDays(new Date(data.nextDeadline), new Date()) : null;

  return (
    <Card className="bg-[#F5F5F5]/5 border-[#8A8A8A]/20 shadow-lg rounded-xl relative overflow-hidden">
      {/* Hexagon decoration */}
      <div className="absolute top-2 right-2 opacity-10">
        <svg width="50" height="50" viewBox="0 0 50 50">
          <polygon points="25,3 43,14 43,36 25,47 7,36 7,14" fill="none" stroke="#B00020" strokeWidth="1"/>
        </svg>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B00020]/20 rounded-lg">
              <Award className="w-6 h-6 text-[#B00020]" />
            </div>
            <div>
              <h3 className="font-medium text-white">{framework === 'ce_plus' ? 'Cyber Essentials Plus' : 'ISO 27001'}</h3>
              <p className="text-sm text-[#8A8A8A]">
                {framework === 'ce_plus' ? 'UK Government Security Standard' : 'International Security Management'}
              </p>
            </div>
          </div>
          {getStatusBadge(data.current)}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#8A8A8A]">Progress</span>
              <span className="text-lg font-bold text-white">{data.current}%</span>
            </div>
            <Progress 
              value={data.current} 
              className="h-3"
            />
          </div>

          {daysUntilDeadline && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-[#8A8A8A]">
                <Calendar className="w-4 h-4" />
                Target: {format(new Date(data.nextDeadline), 'MMM dd, yyyy')}
              </div>
              <Badge className={daysUntilDeadline > 30 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}>
                {daysUntilDeadline} days
              </Badge>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-[#B00020] hover:bg-[#8B0000]">
              <Target className="w-4 h-4 mr-2" />
              View Progress
            </Button>
            <Button size="sm" variant="outline" className="border-[#8A8A8A]/20 text-[#8A8A8A] hover:text-white">
              <ExternalLink className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ComplianceProgress({ compliance }) {
  if (!compliance || Object.keys(compliance).length === 0) {
    return (
      <Card className="bg-[#F5F5F5]/5 border-[#8A8A8A]/20">
        <CardContent className="p-6 text-center text-[#8A8A8A]">
          No compliance data available.
        </CardContent>
      </Card>
    );
  }

  const validFrameworks = Object.entries(compliance).filter(([, data]) => data && typeof data.current === 'number');
  
  const totalProgress = validFrameworks.reduce((acc, [, data]) => acc + data.current, 0);
  const overallProgress = validFrameworks.length > 0 ? Math.round(totalProgress / validFrameworks.length) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-[#B00020]" />
          Compliance Progress
        </h2>
        <Badge className="bg-[#B00020]/20 text-[#B00020]">
          <TrendingUp className="w-4 h-4 mr-1" />
          {overallProgress}% Average
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {validFrameworks.map(([frameworkKey, frameworkData]) => (
          <ComplianceCard key={frameworkKey} framework={frameworkKey} data={frameworkData} />
        ))}
      </div>

      {/* Benefits Banner */}
      <Card className="mt-6 bg-gradient-to-r from-blue-800/20 to-[#B00020]/20 border-[#B00020]/30 shadow-lg rounded-xl relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 200 100">
            <defs>
              <pattern id="hexBenefits" patternUnits="userSpaceOnUse" width="30" height="25.98">
                <polygon points="15,2 26,9 26,17 15,24 4,17 4,9" fill="none" stroke="#B00020" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexBenefits)" />
          </svg>
        </div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#B00020] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Why Get Certified?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[#B00020] font-medium">Win More Business</span>
                  <p className="text-[#F5F5F5]">Many clients require certified suppliers</p>
                </div>
                <div>
                  <span className="text-[#B00020] font-medium">Reduce Insurance</span>
                  <p className="text-[#F5F5F5]">Lower cyber insurance premiums</p>
                </div>
                <div>
                  <span className="text-[#B00020] font-medium">Prevent Attacks</span>
                  <p className="text-[#F5F5F5]">80% reduction in successful attacks</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}