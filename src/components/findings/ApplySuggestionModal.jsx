import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Task, Suggestion } from '@/api/entities';
import { toast } from 'sonner';

export default function ApplySuggestionModal({ suggestion, finding, users, onApplied }) {
  const [open, setOpen] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignee || !dueDate) {
      toast.error('Please select an assignee and a due date.');
      return;
    }
    setLoading(true);

    try {
      // Create a task
      await Task.create({
        title: `Fix: ${finding.title}`,
        description: `Apply the following suggestion for finding ID ${finding.id}:\n\n${suggestion.content}`,
        assignee,
        due_date: dueDate,
        related_finding_id: finding.id,
      });

      // Update suggestion status
      await Suggestion.update(suggestion.id, { status: 'applied' });

      toast.success('Task created and suggestion marked as applied.');
      setOpen(false);
      onApplied();
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast.error('Failed to create task.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
          Apply Suggestion
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Create Task from Suggestion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id} className="text-white">
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-900/50 border-slate-700 text-white"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[var(--color-primary)]">
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}