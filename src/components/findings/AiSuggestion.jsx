import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, GitMerge } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ApplySuggestionModal from './ApplySuggestionModal';

export default function AiSuggestion({ finding, suggestion, onGenerate, onApplied, users }) {
  
  const renderContent = (content, type) => {
    const lines = content.split('\n');
    return (
      <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
        {lines.map((line, i) => {
          let color = 'text-slate-300';
          if (line.startsWith('+')) color = 'text-green-400';
          if (line.startsWith('-')) color = 'text-red-400';
          return <div key={i} className={color}>{line}</div>
        })}
      </pre>
    )
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-300 mb-2">AI Suggested Fix</h3>
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4 space-y-4">
          {!suggestion ? (
            <div className="text-center py-4">
              <p className="text-slate-400 mb-3">Generate an AI-powered patch or remediation step.</p>
              <Button onClick={onGenerate} variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20">
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Suggestion
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <Badge variant="outline" className="border-slate-600">
                  {suggestion.status}
                </Badge>
                {suggestion.status === 'pending' && (
                  <ApplySuggestionModal 
                    suggestion={suggestion} 
                    finding={finding} 
                    users={users}
                    onApplied={onApplied}
                  />
                )}
              </div>
              <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                {renderContent(suggestion.content, suggestion.type)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}