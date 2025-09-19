import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Router, 
  Shield, 
  Globe, 
  Wifi, 
  Server, 
  Monitor,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Settings
} from 'lucide-react';

/**
 * NetworkTopology - Interactive network topology visualization
 * Shows network devices, connections, and real-time status
 */
export default function NetworkTopology({ networkData, onDeviceClick }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [topology, setTopology] = useState({ devices: [], connections: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateTopology();
  }, [networkData]);

  useEffect(() => {
    if (topology.devices.length > 0) {
      drawTopology();
    }
  }, [topology, zoom, pan]);

  const generateTopology = () => {
    setIsLoading(true);
    
    // Generate topology based on network integrations
    const devices = [
      // Core infrastructure
      { 
        id: 'internet', 
        name: 'Internet', 
        type: 'internet', 
        x: 400, 
        y: 50, 
        status: 'active',
        vendor: 'global'
      },
      { 
        id: 'firewall-1', 
        name: 'Palo Alto PA-220', 
        type: 'firewall', 
        x: 400, 
        y: 150, 
        status: 'active',
        vendor: 'palo-alto',
        health: 98
      },
      { 
        id: 'router-1', 
        name: 'UniFi Dream Machine', 
        type: 'router', 
        x: 400, 
        y: 250, 
        status: 'active',
        vendor: 'ubiquiti',
        health: 95
      },
      
      // Security appliances
      { 
        id: 'meraki-1', 
        name: 'Meraki MX84', 
        type: 'security', 
        x: 200, 
        y: 350, 
        status: 'active',
        vendor: 'cisco-meraki',
        health: 92
      },
      { 
        id: 'fortigate-1', 
        name: 'FortiGate 60F', 
        type: 'firewall', 
        x: 600, 
        y: 350, 
        status: 'active',
        vendor: 'fortinet',
        health: 89
      },
      
      // Cloud services
      { 
        id: 'cloudflare-1', 
        name: 'Cloudflare Zero Trust', 
        type: 'cloud', 
        x: 100, 
        y: 150, 
        status: 'active',
        vendor: 'cloudflare',
        health: 97
      },
      { 
        id: 'zscaler-1', 
        name: 'Zscaler ZPA', 
        type: 'cloud', 
        x: 700, 
        y: 150, 
        status: 'active',
        vendor: 'zscaler',
        health: 94
      },
      
      // Endpoints
      { 
        id: 'switch-1', 
        name: 'Core Switch', 
        type: 'switch', 
        x: 300, 
        y: 450, 
        status: 'active',
        vendor: 'ubiquiti',
        health: 96
      },
      { 
        id: 'switch-2', 
        name: 'Edge Switch', 
        type: 'switch', 
        x: 500, 
        y: 450, 
        status: 'active',
        vendor: 'ubiquiti',
        health: 94
      },
      { 
        id: 'wifi-1', 
        name: 'WiFi Access Point', 
        type: 'wifi', 
        x: 200, 
        y: 550, 
        status: 'active',
        vendor: 'ubiquiti',
        health: 91
      },
      { 
        id: 'server-1', 
        name: 'Application Server', 
        type: 'server', 
        x: 600, 
        y: 550, 
        status: 'active',
        vendor: 'generic',
        health: 88
      }
    ];

    const connections = [
      // Main network flow
      { source: 'internet', target: 'firewall-1', type: 'primary', bandwidth: '1 Gbps' },
      { source: 'firewall-1', target: 'router-1', type: 'primary', bandwidth: '1 Gbps' },
      { source: 'router-1', target: 'meraki-1', type: 'secondary', bandwidth: '100 Mbps' },
      { source: 'router-1', target: 'fortigate-1', type: 'secondary', bandwidth: '100 Mbps' },
      { source: 'router-1', target: 'switch-1', type: 'primary', bandwidth: '1 Gbps' },
      { source: 'router-1', target: 'switch-2', type: 'primary', bandwidth: '1 Gbps' },
      
      // Cloud connections
      { source: 'firewall-1', target: 'cloudflare-1', type: 'cloud', bandwidth: 'Variable' },
      { source: 'firewall-1', target: 'zscaler-1', type: 'cloud', bandwidth: 'Variable' },
      
      // Edge connections
      { source: 'switch-1', target: 'wifi-1', type: 'secondary', bandwidth: '100 Mbps' },
      { source: 'switch-2', target: 'server-1', type: 'secondary', bandwidth: '1 Gbps' }
    ];

    setTopology({ devices, connections });
    setIsLoading(false);
  };

  const drawTopology = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw connections first
    topology.connections.forEach(connection => {
      drawConnection(ctx, connection);
    });

    // Draw devices
    topology.devices.forEach(device => {
      drawDevice(ctx, device);
    });

    ctx.restore();
  };

  const drawConnection = (ctx, connection) => {
    const sourceDevice = topology.devices.find(d => d.id === connection.source);
    const targetDevice = topology.devices.find(d => d.id === connection.target);
    
    if (!sourceDevice || !targetDevice) return;

    ctx.beginPath();
    ctx.moveTo(sourceDevice.x, sourceDevice.y);
    ctx.lineTo(targetDevice.x, targetDevice.y);
    
    // Set line style based on connection type
    switch (connection.type) {
      case 'primary':
        ctx.strokeStyle = '#3b82f6'; // blue
        ctx.lineWidth = 3;
        break;
      case 'secondary':
        ctx.strokeStyle = '#6b7280'; // gray
        ctx.lineWidth = 2;
        break;
      case 'cloud':
        ctx.strokeStyle = '#8b5cf6'; // purple
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        break;
      default:
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1;
    }
    
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bandwidth label
    const midX = (sourceDevice.x + targetDevice.x) / 2;
    const midY = (sourceDevice.y + targetDevice.y) / 2;
    
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(midX - 30, midY - 8, 60, 16);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(connection.bandwidth, midX, midY + 3);
  };

  const drawDevice = (ctx, device) => {
    const radius = 25;
    
    // Device background circle
    ctx.beginPath();
    ctx.arc(device.x, device.y, radius, 0, 2 * Math.PI);
    
    // Color based on health
    const health = device.health || 100;
    if (health > 80) {
      ctx.fillStyle = device.id === selectedDevice?.id ? '#065f46' : '#064e3b'; // green
    } else if (health > 60) {
      ctx.fillStyle = device.id === selectedDevice?.id ? '#92400e' : '#78350f'; // yellow
    } else {
      ctx.fillStyle = device.id === selectedDevice?.id ? '#991b1b' : '#7f1d1d'; // red
    }
    
    ctx.fill();
    
    // Border
    ctx.strokeStyle = health > 80 ? '#10b981' : health > 60 ? '#f59e0b' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Device icon (simplified)
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    let icon = '📡';
    switch (device.type) {
      case 'firewall': icon = '🛡️'; break;
      case 'router': icon = '📡'; break;
      case 'switch': icon = '⚡'; break;
      case 'wifi': icon = '📶'; break;
      case 'server': icon = '🖥️'; break;
      case 'cloud': icon = '☁️'; break;
      case 'internet': icon = '🌐'; break;
      case 'security': icon = '🔒'; break;
    }
    
    ctx.fillText(icon, device.x, device.y + 4);

    // Device name
    ctx.fillStyle = '#f3f4f6';
    ctx.font = '11px sans-serif';
    ctx.fillText(device.name, device.x, device.y + radius + 15);
    
    // Health percentage
    if (device.health) {
      ctx.fillStyle = health > 80 ? '#10b981' : health > 60 ? '#f59e0b' : '#ef4444';
      ctx.font = '9px sans-serif';
      ctx.fillText(`${device.health}%`, device.x, device.y + radius + 28);
    }
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x * zoom) / zoom;
    const y = (event.clientY - rect.top - pan.y * zoom) / zoom;

    // Find clicked device
    const clickedDevice = topology.devices.find(device => {
      const distance = Math.sqrt((x - device.x) ** 2 + (y - device.y) ** 2);
      return distance < 25;
    });

    if (clickedDevice) {
      setSelectedDevice(clickedDevice);
      onDeviceClick?.(clickedDevice);
    } else {
      setSelectedDevice(null);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <Network className="w-5 h-5 mr-2" />
            Network Topology
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleResetView}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={generateTopology}>
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-slate-900/50 rounded-lg cursor-pointer"
            onClick={handleCanvasClick}
          />
          
          {/* Device Details Panel */}
          {selectedDevice && (
            <div className="absolute top-4 right-4 bg-slate-800 border border-slate-600 rounded-lg p-4 min-w-[200px]">
              <h4 className="text-white font-semibold mb-2">{selectedDevice.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white capitalize">{selectedDevice.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vendor:</span>
                  <span className="text-white capitalize">{selectedDevice.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge variant="outline" className={
                    selectedDevice.status === 'active' 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }>
                    {selectedDevice.status}
                  </Badge>
                </div>
                {selectedDevice.health && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Health:</span>
                    <span className={`font-semibold ${
                      selectedDevice.health > 80 ? 'text-green-400' : 
                      selectedDevice.health > 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedDevice.health}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-600 rounded-lg p-3">
            <h5 className="text-white text-sm font-semibold mb-2">Legend</h5>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span className="text-slate-400">Primary Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-500"></div>
                <span className="text-slate-400">Secondary Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500 border-dashed"></div>
                <span className="text-slate-400">Cloud Connection</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}