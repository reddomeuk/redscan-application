import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Target, Shield, AlertTriangle } from 'lucide-react';

const ThreatGraph = ({ paths = [], selectedPath, onPathSelect, onNodeSelect }) => {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Mock graph data - in production this would be calculated from actual attack paths
  const mockNodes = [
    { id: 'internet', label: 'Internet', type: 'entry', x: 100, y: 200, risk: 100 },
    { id: 'web-app', label: 'Web App', type: 'asset', x: 300, y: 200, risk: 80 },
    { id: 'db-server', label: 'Database', type: 'asset', x: 500, y: 200, risk: 90 },
    { id: 'user-john', label: 'John (Admin)', type: 'user', x: 300, y: 100, risk: 70 },
    { id: 'm365', label: 'M365 Tenant', type: 'service', x: 500, y: 100, risk: 60 },
    { id: 'sharepoint', label: 'SharePoint', type: 'asset', x: 700, y: 100, risk: 85 },
    { id: 'supplier-acme', label: 'Acme Hosting', type: 'supplier', x: 300, y: 300, risk: 75 },
    { id: 'saas-app', label: 'CRM System', type: 'asset', x: 500, y: 300, risk: 65 }
  ];

  const mockEdges = [
    { from: 'internet', to: 'web-app', risk: 80, label: 'CVE-2024-1234' },
    { from: 'web-app', to: 'db-server', risk: 90, label: 'SQL Injection' },
    { from: 'user-john', to: 'm365', risk: 70, label: 'Phishing' },
    { from: 'm365', to: 'sharepoint', risk: 60, label: 'OAuth Token' },
    { from: 'supplier-acme', to: 'saas-app', risk: 75, label: 'API Integration' }
  ];

  const getNodeColor = (node) => {
    switch (node.type) {
      case 'entry': return '#ef4444'; // Red for entry points
      case 'asset': return '#3b82f6'; // Blue for assets
      case 'user': return '#f59e0b'; // Orange for users
      case 'service': return '#10b981'; // Green for services
      case 'supplier': return '#8b5cf6'; // Purple for suppliers
      default: return '#6b7280';
    }
  };

  const getNodeSize = (risk) => {
    return 20 + (risk / 100) * 30; // Size based on risk: 20-50px
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-red-400" />
          Attack Surface Graph
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-96">
        <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${400 / zoom}`}
            className="cursor-move"
          >
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {mockEdges.map((edge, index) => {
              const fromNode = mockNodes.find(n => n.id === edge.from);
              const toNode = mockNodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted = selectedPath && selectedPath.hops.some(h => 
                h.node_id === edge.from || h.node_id === edge.to
              );

              return (
                <g key={index}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isHighlighted ? '#ef4444' : '#64748b'}
                    strokeWidth={isHighlighted ? 3 : 2}
                    opacity={isHighlighted ? 1 : 0.6}
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Edge label */}
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 5}
                    fill={isHighlighted ? '#ef4444' : '#94a3b8'}
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>

            {/* Nodes */}
            {mockNodes.map((node) => {
              const isHighlighted = selectedPath && selectedPath.hops.some(h => h.node_id === node.id);
              const nodeSize = getNodeSize(node.risk);

              return (
                <g key={node.id} onClick={() => onNodeSelect?.(node)}>
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize / 2}
                    fill={getNodeColor(node)}
                    stroke={isHighlighted ? '#fbbf24' : 'none'}
                    strokeWidth={isHighlighted ? 3 : 0}
                    opacity={0.8}
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                  />
                  {/* Risk indicator */}
                  {node.risk > 70 && (
                    <circle
                      cx={node.x + nodeSize/3}
                      cy={node.y - nodeSize/3}
                      r="6"
                      fill="#ef4444"
                      className="animate-pulse"
                    />
                  )}
                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + nodeSize/2 + 15}
                    fill="white"
                    fontSize="11"
                    textAnchor="middle"
                    className="font-medium pointer-events-none"
                  >
                    {node.label}
                  </text>
                  {/* Risk score */}
                  <text
                    x={node.x}
                    y={node.y + nodeSize/2 + 28}
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="middle"
                    className="font-mono pointer-events-none"
                  >
                    Risk: {node.risk}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 border border-slate-600 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-2">Node Types</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-slate-300">Entry Points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-300">Assets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-slate-300">Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-300">Services</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-slate-300">Suppliers</span>
              </div>
            </div>
          </div>

          {/* Stats overlay */}
          <div className="absolute top-4 right-4 bg-slate-800/90 border border-slate-600 rounded-lg p-3">
            <div className="text-xs text-slate-300 space-y-1">
              <div>Nodes: {mockNodes.length}</div>
              <div>Edges: {mockEdges.length}</div>
              <div>High Risk: {mockNodes.filter(n => n.risk > 70).length}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatGraph;