import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

const ZeroTrustPolicyList = ({ policies, onEdit, onDelete }) => {

    const getActionBadge = (action) => {
        const styles = {
            'Allow': 'bg-green-500/20 text-green-400',
            'Require MFA': 'bg-yellow-500/20 text-yellow-400',
            'Block': 'bg-red-500/20 text-red-400',
            'Quarantine': 'bg-orange-500/20 text-orange-400',
        };
        return <Badge className={styles[action]}>{action}</Badge>;
    };

    const renderConditions = (conditions) => {
        if (Object.keys(conditions).length === 0) {
            return <span className="text-slate-400">Any Device</span>;
        }
        return (
            <div className="flex flex-wrap gap-1">
                {Object.entries(conditions).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                        {key}: {value}
                    </Badge>
                ))}
            </div>
        );
    };

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Policy Name</TableHead>
                    <TableHead className="text-slate-300">Conditions</TableHead>
                    <TableHead className="text-slate-300">Action</TableHead>
                    <TableHead className="text-slate-300 w-28 text-right">Manage</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {policies.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                            No Zero-Trust policies defined.
                        </TableCell>
                    </TableRow>
                ) : (
                    policies.map(policy => (
                        <TableRow key={policy.id} className="border-slate-800 hover:bg-slate-700/30">
                            <TableCell className="font-medium text-white">{policy.name}</TableCell>
                            <TableCell>{renderConditions(policy.conditions)}</TableCell>
                            <TableCell>{getActionBadge(policy.action)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(policy)} className="text-slate-400 hover:text-white">
                                    <Edit className="w-4 h-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(policy.id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
};

export default ZeroTrustPolicyList;