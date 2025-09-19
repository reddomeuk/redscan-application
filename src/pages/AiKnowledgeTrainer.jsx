import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, BookOpen } from 'lucide-react';

export default function AiKnowledgeTrainerPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">AI Knowledge Trainer</h1>
        <p className="text-slate-400">Train the RedScan AI on your internal policies and security knowledge.</p>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Q&A Training Console</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <Textarea placeholder="Ask a question to test the AI's knowledge..." className="bg-slate-900/50 border-slate-700 min-h-[100px]" />
            <Textarea placeholder="AI response will appear here..." readOnly className="bg-slate-900 border-slate-700 min-h-[100px]" />
            <Button className="bg-red-600 hover:bg-red-700">Ask</Button>
        </CardContent>
      </Card>
    </div>
  );
}