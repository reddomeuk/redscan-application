
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, RefreshCw, Eraser, LifeBuoy, Settings, Eye } from 'lucide-react';
import { useSafeMode } from './SafeModeContext';
import { useLogger } from './LogContext';

export default function DiagnosticsPanel({ error, resetErrorBoundary }) {
  const { isSafeMode, setIsSafeMode } = useSafeMode();
  const { logs, clearLogs } = useLogger();
  const [strictMode, setStrictMode] = useState(false);

  const handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleResetUI = () => {
    localStorage.removeItem('dashboardLayout');
    localStorage.removeItem('userPreferences');
    sessionStorage.clear();
    window.location.reload();
  };

  const attemptNormalMode = () => {
    setIsSafeMode(false);
    resetErrorBoundary();
  };

  const testStorage = (storageType) => {
    try {
      const storage = window[storageType];
      const testKey = 'redscan_test';
      storage.setItem(testKey, 'test');
      const result = storage.getItem(testKey);
      storage.removeItem(testKey);
      return result === 'test';
    } catch {
      return false;
    }
  };

  const knownRoutes = [
    '/Dashboard', '/Assets', '/Findings', '/Reports', '/Settings', 
    '/Compliance', '/Scans', '/Code', '/Cloud', '/Analytics'
  ];

  const appInfo = {
    version: '1.0.0',
    route: window.location.pathname,
    buildMode: import.meta.env.NODE_ENV || 'development',
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    safeMode: isSafeMode,
    strictMode: strictMode
  };

  return (
    <div className="p-4 md:p-8 bg-slate-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">Application Diagnostics</h1>
            <p className="text-slate-400">
              {error ? 'An error occurred and has been captured.' : 'Diagnostics panel opened manually.'}
            </p>
          </div>
        </div>

        {error && (
          <Card className="bg-red-900/20 border-red-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-red-400">Error Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-300 font-semibold mb-2">{error.message}</p>
              <pre className="text-xs bg-slate-900 p-4 rounded-md overflow-auto text-slate-300 max-h-40">
                {error.stack}
              </pre>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="recovery" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="recovery">Recovery Actions</TabsTrigger>
            <TabsTrigger value="app">App Info</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="routing">Routing</TabsTrigger>
            <TabsTrigger value="logs">Error Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="recovery" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Retry Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={resetErrorBoundary} className="w-full bg-green-600 hover:bg-green-700">
                    <RefreshCw className="w-4 h-4 mr-2"/>
                    Retry Render
                  </Button>
                  <Button onClick={attemptNormalMode} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Settings className="w-4 h-4 mr-2"/>
                    Exit Safe Mode
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-orange-400">Reset State</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleResetUI} variant="outline" className="w-full border-slate-600">
                    <Eraser className="w-4 h-4 mr-2"/>
                    Reset UI State
                  </Button>
                  <Button onClick={handleClearStorage} variant="outline" className="w-full border-slate-600 text-orange-400">
                    <Eraser className="w-4 h-4 mr-2"/>
                    Clear All Storage
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-400">Debug Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setStrictMode(!strictMode)} 
                    variant="outline" 
                    className="w-full border-slate-600"
                  >
                    Strict Mode: {strictMode ? 'ON' : 'OFF'}
                  </Button>
                  <Button onClick={clearLogs} variant="outline" className="w-full border-slate-600">
                    Clear Error Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="app" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Application Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-slate-300">Version:</strong> {appInfo.version}
                  </div>
                  <div>
                    <strong className="text-slate-300">Current Route:</strong> {appInfo.route}
                  </div>
                  <div>
                    <strong className="text-slate-300">Build Mode:</strong> {appInfo.buildMode}
                  </div>
                  <div>
                    <strong className="text-slate-300">Viewport:</strong> {appInfo.viewport}
                  </div>
                  <div>
                    <strong className="text-slate-300">Safe Mode:</strong> 
                    <Badge className={isSafeMode ? 'bg-green-500/20 text-green-400 ml-2' : 'bg-red-500/20 text-red-400 ml-2'}>
                      {isSafeMode ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                  <div>
                    <strong className="text-slate-300">Strict Mode:</strong>
                    <Badge className={strictMode ? 'bg-yellow-500/20 text-yellow-400 ml-2' : 'bg-slate-500/20 text-slate-400 ml-2'}>
                      {strictMode ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Environment & Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-slate-300">React Version:</strong> 18.x
                    </div>
                    <div>
                      <strong className="text-slate-300">Node.js:</strong> {navigator.userAgent.includes('Node') ? 'Detected' : 'Browser'}
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-4">
                    <h4 className="font-semibold text-slate-300 mb-2">Storage Tests:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>localStorage:</span>
                        <Badge className={testStorage('localStorage') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {testStorage('localStorage') ? 'OK' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>sessionStorage:</span>
                        <Badge className={testStorage('sessionStorage') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {testStorage('sessionStorage') ? 'OK' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routing" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Route Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong className="text-slate-300">Current Route:</strong> 
                    <Badge className="ml-2 bg-blue-500/20 text-blue-400">{window.location.pathname}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Known Routes:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {knownRoutes.map(route => (
                        <div key={route} className="flex items-center justify-between text-sm">
                          <span className={route === window.location.pathname ? 'text-blue-400 font-semibold' : 'text-slate-400'}>
                            {route}
                          </span>
                          {route === window.location.pathname && <Badge className="bg-red-500/20 text-red-400 text-xs">FAILED</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Error Log (Last 10)</CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No errors logged yet.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-auto">
                    {logs.map((log, index) => (
                      <div key={index} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-red-400 font-semibold">{log.message}</span>
                          <Badge className="bg-slate-600 text-slate-300 text-xs">{log.route}</Badge>
                        </div>
                        <pre className="text-xs text-slate-400 overflow-auto">{log.stack_start}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
