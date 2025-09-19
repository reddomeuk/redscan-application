import React, { useState, useEffect } from 'react';
import { Finding } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Filter, Ticket } from 'lucide-react';
import CreateTicketModal from '../components/findings/CreateTicketModal';
import ActionButton from '../components/ui/ActionButton';

const createTicketAction = async (props) => {
    console.log("Creating ticket for finding:", props.finding.id);
    // Simulate API call to Jira/ServiceNow
    await new Promise(res => setTimeout(res, 1500));
    // Simulate a failure for demonstration
    if (props.finding.id === 'finding-id-2') {
        const FAIL_PERMISSION = true; // For useAction hook to catch
        throw new Error("You do not have permission to create tickets for this project.");
    }
    return { ticketUrl: 'https://jira.example.com/browse/SEC-123' };
};

export default function FindingsPage() {
    const [findings, setFindings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ severity: 'all', status: 'all', search: '' });

    useEffect(() => {
        const loadFindings = async () => {
            setLoading(true);
            const query = {};
            if(filters.severity !== 'all') query.severity = filters.severity;
            if(filters.status !== 'all') query.status = 'open'; // Hardcode for demo
            
            const fetched = await Finding.filter(query, '-created_date', 200);
            
            const searchFiltered = filters.search
                ? fetched.filter(f => f.title.toLowerCase().includes(filters.search.toLowerCase()))
                : fetched;

            setFindings(searchFiltered);
            setLoading(false);
        };
        loadFindings();
    }, [filters]);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Findings</h1>
                <p className="text-slate-400">All security findings from across your integrated tools.</p>
            </header>

            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <CardTitle className="text-white">Findings Directory</CardTitle>
                         <div className="flex gap-2 flex-wrap">
                            <Input 
                                placeholder="Search findings..." 
                                value={filters.search}
                                onChange={e => setFilters({...filters, search: e.target.value})}
                                className="max-w-sm bg-slate-900/50 border-slate-700" 
                            />
                            <Select value={filters.severity} onValueChange={v => setFilters({...filters, severity: v})}>
                                <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="all">All Severities</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select value={filters.status} onValueChange={v => setFilters({...filters, status: v})}>
                                <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline"><Filter className="w-4 h-4 mr-2"/>More Filters</Button>
                            <ActionButton
                                actionFn={() => { /* Mock bulk update */ }}
                                confirm={{ title: 'Bulk Update Findings?', description: 'This will update all selected findings.' }}
                                successToast="Findings updated."
                            >
                                <Ticket className="w-4 h-4 mr-2"/>Bulk Actions
                            </ActionButton>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-700">
                                <TableHead className="text-slate-300">Title</TableHead>
                                <TableHead className="text-slate-300">Severity</TableHead>
                                <TableHead className="text-slate-300">Status</TableHead>
                                <TableHead className="text-slate-300">Source</TableHead>
                                <TableHead className="text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan="5" className="text-center text-slate-400">Loading...</TableCell></TableRow>
                            ) : findings.map(finding => (
                                <TableRow key={finding.id} className="border-slate-800">
                                    <TableCell className="font-medium text-white max-w-sm truncate">{finding.title}</TableCell>
                                    <TableCell><Badge variant={finding.severity}>{finding.severity}</Badge></TableCell>
                                    <TableCell><Badge variant="secondary">{finding.status}</Badge></TableCell>
                                    <TableCell className="text-slate-400">{finding.source}</TableCell>
                                    <TableCell>
                                        <ActionButton
                                            actionFn={createTicketAction}
                                            finding={finding} /* Pass finding as a prop */
                                            successToast="Ticket created successfully!"
                                            errorToast="Failed to create ticket."
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Ticket className="w-3 h-3 mr-1"/> Create Ticket
                                        </ActionButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}