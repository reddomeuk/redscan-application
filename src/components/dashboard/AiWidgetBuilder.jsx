import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, BarChart, PieChart, LineChart, Table } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_QUERIES = [
  "Show me unresolved phishing training cases by department",
  "Top 3 suppliers with missing ISO certificates", 
  "CE+ controls failing mapped to risks",
  "Endpoint encryption coverage by OS platform",
  "Attack paths discovered in the last 30 days"
];

export default function AiWidgetBuilder({ isOpen, onClose, onCreateWidget }) {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWidget, setGeneratedWidget] = useState(null);

  const handleGenerate = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query to generate a widget");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI widget generation based on query keywords
    let mockWidget = {
      title: query,
      widget_type: 'table',
      data_source: 'findings',
      configuration: {
        group_by: 'status',
        metric: 'count'
      }
    };

    // Simple keyword matching for demo
    if (query.toLowerCase().includes('phishing')) {
      mockWidget = {
        title: 'Phishing Training Status by Department',
        widget_type: 'bar_chart',
        data_source: 'training',
        configuration: {
          group_by: 'department',
          metric: 'completion_rate'
        }
      };
    } else if (query.toLowerCase().includes('supplier')) {
      mockWidget = {
        title: 'Suppliers Missing Certifications',
        widget_type: 'pie_chart',
        data_source: 'suppliers',
        configuration: {
          group_by: 'certification_status',
          metric: 'count'
        }
      };
    } else if (query.toLowerCase().includes('encryption')) {
      mockWidget = {
        title: 'Encryption Coverage by Platform',
        widget_type: 'bar_chart',
        data_source: 'endpoints',
        configuration: {
          group_by: 'platform',
          metric: 'encryption_percentage'
        }
      };
    } else if (query.toLowerCase().includes('attack path')) {
      mockWidget = {
        title: 'Attack Paths Timeline',
        widget_type: 'line_chart',
        data_source: 'attack_paths',
        configuration: {
          group_by: 'date',
          metric: 'count'
        }
      };
    }

    setGeneratedWidget(mockWidget);
    setIsGenerating(false);
    toast.success("Widget generated successfully!");
  };

  const handleCreateWidget = () => {
    if (generatedWidget) {
      onCreateWidget(generatedWidget);
      setGeneratedWidget(null);
      setQuery('');
      onClose();
      toast.success("Widget added to dashboard!");
    }
  };

  const getWidgetIcon = (type) => {
    switch(type) {
      case 'bar_chart': return <BarChart className="w-4 h-4" />;
      case 'pie_chart': return <PieChart className="w-4 h-4" />;
      case 'line_chart': return <LineChart className="w-4 h-4" />;
      case 'table': return <Table className="w-4 h-4" />;
      default: return <BarChart className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Widget Builder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="query" className="text-white">
              Describe the widget you want to create
            </Label>
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me top 5 unresolved risks by score"
              className="bg-slate-900 border-slate-700 mt-2"
              disabled={isGenerating}
            />
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-3">Try these sample queries:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(sample)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md text-slate-300 transition-colors"
                  disabled={isGenerating}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {generatedWidget && (
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-900/50">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                {getWidgetIcon(generatedWidget.widget_type)}
                Generated Widget Preview
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-white">{generatedWidget.title}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">
                    Type: {generatedWidget.widget_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    Source: {generatedWidget.data_source}
                  </Badge>
                  <Badge variant="outline">
                    Group by: {generatedWidget.configuration.group_by}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!generatedWidget ? (
              <Button 
                onClick={handleGenerate} 
                disabled={!query.trim() || isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Widget
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleCreateWidget}
                className="bg-green-600 hover:bg-green-700"
              >
                Add to Dashboard
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}