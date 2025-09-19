import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomWidget } from '@/api/entities';
import { toast } from 'sonner';

export default function CustomWidgetModal({ isOpen, onClose, onWidgetCreated }) {
    const [config, setConfig] = useState({ title: '', widget_type: 'counter', data_source: 'findings' });

    const handleCreate = async () => {
        try {
            await CustomWidget.create(config);
            toast.success('Custom widget created!');
            onWidgetCreated();
            onClose();
        } catch (error) {
            toast.error('Failed to create widget.');
        }
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader><DialogTitle>Create Custom Widget</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <Label>Title</Label>
                    <Input value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="bg-slate-900 border-slate-700" />
                </div>
                <div>
                    <Label>Widget Type</Label>
                    <Select value={config.widget_type} onValueChange={v => setConfig({...config, widget_type: v})}>
                        <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="counter">Counter</SelectItem>
                            <SelectItem value="pie_chart">Pie Chart</SelectItem>
                            <SelectItem value="bar_chart">Bar Chart</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Data Source</Label>
                     <Select value={config.data_source} onValueChange={v => setConfig({...config, data_source: v})}>
                        <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="findings">Findings</SelectItem>
                            <SelectItem value="assets">Assets</SelectItem>
                            <SelectItem value="scans">Scans</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700">Create</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}