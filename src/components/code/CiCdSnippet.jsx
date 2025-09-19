import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from 'lucide-react';

const CiCdSnippet = () => {
  const snippet = `
# Example for GitHub Actions
# 1. Run your scanner and output to SARIF format
- name: Run Semgrep SAST Scan
  run: semgrep scan --sarif -o results.sarif

# 2. Upload results to RedScan.ai (hypothetical endpoint)
- name: Upload to RedScan.ai
  run: |
    curl -X POST \\
    -H "Authorization: Bearer YOUR_REDSCAN_API_KEY" \\
    -F "file=@results.sarif" \\
    -F "assetId=YOUR_ASSET_ID" \\
    https://api.redscan.ai/v1/ingest/results
  `;

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          CI/CD Integration Snippet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 mb-4">
          Integrate RedScan.ai into your CI/CD pipeline to continuously monitor your code. Below is a hypothetical example for uploading scan results.
        </p>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
          <pre>
            <code className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
              {snippet.trim()}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default CiCdSnippet;