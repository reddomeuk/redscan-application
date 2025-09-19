import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, ArrowRight, Clock, Zap, Shield, Building2 } from 'lucide-react';

const AttackPathList = ({ paths = [], selectedPath, onPathSelect, onCreateTicket }) => {
  const getRiskColor = (score) => {
    if (score >= 80) return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (score >= 60) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    return 'bg-green-500/20 text-green-400 border-green-500/40';
  };

  const getPathTypeIcon = (type) => {
    switch (type) {
      case 'external_entry': return <Zap className="w-4 h-4" />;
      case 'lateral_movement': return <ArrowRight className="w-4 h-4" />;
      case 'privilege_escalation': return <AlertTriangle className="w-4 h-4" />;
      case 'data_exfiltration': return <Shield className="w-4 h-4" />;
      case 'supplier_chain': return <Building2 className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Mock data for demonstration
  const mockPaths = [
    {
      id: 'path-1',
      start_node_id: 'internet',
      end_node_id: 'db-server',
      path_type: 'external_entry',
      risk_score: 89,
      persistence_score: 3,
      hops: [
        { node_name: 'Internet', exploitation_method: 'Public Access' },
        { node_name: 'Web Application', exploitation_method: 'CVE-2024-1234 (SQL Injection)' },
        { node_name: 'Database Server', exploitation_method: 'Privilege Escalation' }
      ],
      status: 'active',
      remediation_plan: {
        priority: 'critical',
        steps: [
          { action: 'Patch CVE-2024-1234 on web server', responsible_role: 'DevSecOps' },
          { action: 'Implement WAF rules', responsible_role: 'Security' }
        ]
      }
    },
    {
      id: 'path-2',
      start_node_id: 'user-john',
      end_node_id: 'sharepoint',
      path_type: 'lateral_movement',
      risk_score: 72,
      persistence_score: 5,
      hops: [
        { node_name: 'John Smith (Admin)', exploitation_method: 'Phishing Email' },
        { node_name: 'M365 Tenant', exploitation_method: 'OAuth Token Theft' },
        { node_name: 'SharePoint', exploitation_method: 'Privileged Access' }
      ],
      status: 'active',
      remediation_plan: {
        priority: 'high',
        steps: [
          { action: 'Enable MFA for all admin accounts', responsible_role: 'IT Admin' },
          { action: 'Implement conditional access policies', responsible_role: 'Security' }
        ]
      }
    },
    {
      id: 'path-3',
      start_node_id: 'supplier-acme',
      end_node_id: 'saas-app',
      path_type: 'supplier_chain',
      risk_score: 65,
      persistence_score: 1,
      hops: [
        { node_name: 'Acme Hosting', exploitation_method: 'Supplier Breach' },
        { node_name: 'CRM System', exploitation_method: 'API Integration' }
      ],
      status: 'active',
      remediation_plan: {
        priority: 'medium',
        steps: [
          { action: 'Review supplier security assessment', responsible_role: 'Procurement' },
          { action: 'Implement API rate limiting', responsible_role: 'Engineering' }
        ]
      }
    }
  ];

  const pathsToShow = paths.length > 0 ? paths : mockPaths;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Attack Paths ({pathsToShow.length})
          </span>
          <Badge className="bg-red-500/20 text-red-400">
            {pathsToShow.filter(p => p.risk_score >= 80).length} Critical
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-300">Path</TableHead>
              <TableHead className="text-slate-300">Type</TableHead>
              <TableHead className="text-slate-300">Risk</TableHead>
              <TableHead className="text-slate-300">Persistence</TableHead>
              <TableHead className="text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pathsToShow.map((path) => (
              <TableRow 
                key={path.id}
                className={`border-slate-800 cursor-pointer hover:bg-slate-700/50 ${
                  selectedPath?.id === path.id ? 'bg-slate-700/30' : ''
                }`}
                onClick={() => onPathSelect(path)}
              >
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white font-medium">
                      {path.hops[0]?.node_name} 
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      {path.hops[path.hops.length - 1]?.node_name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {path.hops.length} hops • ID: {path.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    {getPathTypeIcon(path.path_type)}
                    {path.path_type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getRiskColor(path.risk_score)}>
                    {path.risk_score}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3 h-3" />
                    {path.persistence_score} runs
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateTicket?.(path);
                    }}
                  >
                    Create Ticket
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedPath && (
          <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <h4 className="text-white font-medium mb-3">Attack Path Details</h4>
            <div className="space-y-3">
              {selectedPath.hops.map((hop, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{hop.node_name}</div>
                    <div className="text-sm text-slate-400">{hop.exploitation_method}</div>
                  </div>
                  {index < selectedPath.hops.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-500 mt-1" />
                  )}
                </div>
              ))}
            </div>

            {selectedPath.remediation_plan && (
              <div className="mt-4 pt-4 border-t border-slate-600">
                <h5 className="text-white font-medium mb-2">AI Remediation Plan</h5>
                <div className="space-y-2">
                  {selectedPath.remediation_plan.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-slate-300">{step.action}</div>
                        <div className="text-xs text-slate-500">Assigned to: {step.responsible_role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttackPathList;