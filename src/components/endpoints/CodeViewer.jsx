import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clipboard, Download, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function CodeViewer({ code, language, fileName }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  };

  return (
    <Card className="bg-slate-900/70 border-slate-700 relative">
      <div className="absolute top-2 right-2 flex gap-2">
        <Button size="icon" variant="ghost" onClick={handleCopy} className="text-slate-400 hover:text-white h-8 w-8">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Clipboard className="w-4 h-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={handleDownload} className="text-slate-400 hover:text-white h-8 w-8">
          <Download className="w-4 h-4" />
        </Button>
      </div>
      <CardContent className="p-4 overflow-x-auto">
        <pre><code className={`language-${language} text-sm text-slate-300 whitespace-pre-wrap font-mono`}>{code.trim()}</code></pre>
      </CardContent>
    </Card>
  );
}