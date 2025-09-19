import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CodeViewer from '../components/endpoints/CodeViewer';

export default function AgentDownloads() {

  const windowsScript = `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue';
Invoke-WebRequest -Uri "https://redscan-agents.s3.amazonaws.com/windows/redscan-agent-latest.msi" -OutFile "$env:TEMP\\redscan-agent.msi"
msiexec /i "$env:TEMP\\redscan-agent.msi" /quiet ORG_TOKEN="YOUR_ORG_TOKEN_HERE"`;

  const macosScript = `#!/bin/bash
cd /tmp
curl -O "https://redscan-agents.s3.amazonaws.com/macos/redscan-agent-latest.pkg"
sudo installer -pkg redscan-agent-latest.pkg -target /
# The installer will prompt for the organization token during setup`;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Enroll New Device</h1>
          <p className="text-slate-400">Deploy the RedScan agent to your endpoints to begin monitoring.</p>
        </header>

        <div className="space-y-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Windows Agent Deployment</CardTitle>
              <CardDescription>Run the following PowerShell command as an Administrator on your Windows endpoints.</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeViewer code={windowsScript} language="powershell" fileName="deploy-redscan-windows.ps1" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>macOS Agent Deployment</CardTitle>
              <CardDescription>Run the following script in the Terminal on your macOS endpoints.</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeViewer code={macosScript} language="bash" fileName="deploy-redscan-macos.sh" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}