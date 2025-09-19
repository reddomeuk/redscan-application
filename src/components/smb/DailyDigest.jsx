import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Smartphone,
  Shield,
  Cloud,
  Building2,
  ExternalLink
} from 'lucide-react';

const DigestItem = ({ icon: Icon, title, description, category, impact, learnMore }) => {
  const getCategoryColor = (category) => {
    const colors = {
      endpoints: 'bg-blue-500/20 text-blue-400',
      apps: 'bg-green-500/20 text-green-400',
      cloud: 'bg-purple-500/20 text-purple-400',
      suppliers: 'bg-orange-500/20 text-orange-400'
    };
    return colors[category] || 'bg-[#8A8A8A]/20 text-[#8A8A8A]';
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-[#F5F5F5]/5 rounded-lg">
      <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-white mb-1">{title}</h4>
        <p className="text-sm text-[#8A8A8A] mb-2">{description}</p>
        {impact && (
          <Badge className="bg-[#B00020]/20 text-[#B00020] text-xs">
            {impact}
          </Badge>
        )}
      </div>
      {learnMore && (
        <Button size="sm" variant="ghost" className="text-[#8A8A8A] hover:text-white">
          <ExternalLink className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default function DailyDigest({ digestData }) {
  const { fixed, detected, pending, summary } = digestData;

  return (
    <Card className="bg-[#F5F5F5]/5 border-[#8A8A8A]/20 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#B00020]" />
          Today's AI Security Digest
        </CardTitle>
        <p className="text-[#8A8A8A] text-sm">
          {summary}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Auto-Fixed Issues */}
        {fixed.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Auto-Fixed ({fixed.length})
            </h3>
            <div className="space-y-2">
              {fixed.map((item, index) => (
                <DigestItem
                  key={`fixed-${index}`}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  category={item.category}
                  impact={item.impact}
                  learnMore={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending Approval */}
        {pending.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Needs Your Approval ({pending.length})
            </h3>
            <div className="space-y-2">
              {pending.map((item, index) => (
                <div key={`pending-${index}`} className="flex items-start gap-3 p-4 bg-[#F5F5F5]/5 rounded-lg border border-yellow-500/30">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <item.icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-[#8A8A8A] mb-2">{item.description}</p>
                    <p className="text-xs text-yellow-300 mb-3">{item.reason}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[#B00020] hover:bg-[#8B0000]">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#8A8A8A]/20 text-[#8A8A8A] hover:text-white">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Detections */}
        {detected.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              New Detections ({detected.length})
            </h3>
            <div className="space-y-2">
              {detected.map((item, index) => (
                <DigestItem
                  key={`detected-${index}`}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  category={item.category}
                  impact={item.impact}
                  learnMore={true}
                />
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#8A8A8A]/20">
          <Button className="w-full bg-[#B00020] hover:bg-[#8B0000]">
            View Full Security Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}