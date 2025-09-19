import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Users } from "lucide-react";
import { Finding } from "@/api/entities";

export default function BulkUpdateModal({ selectedFindings, onUpdate, users }) {
  const [open, setOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    assignee: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update each selected finding
      const updatePromises = selectedFindings.map(async (findingId) => {
        const updateFields = {};
        if (updateData.status) updateFields.status = updateData.status;
        if (updateData.assignee) updateFields.assignee = updateData.assignee;
        
        if (Object.keys(updateFields).length > 0) {
          await Finding.update(findingId, updateFields);
        }
      });

      await Promise.all(updatePromises);

      setUpdateData({
        status: "",
        assignee: ""
      });
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error bulk updating findings:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <Edit className="w-4 h-4 mr-2" />
          Bulk Update ({selectedFindings.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Update Findings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Status (optional)</Label>
            <Select value={updateData.status} onValueChange={(value) => setUpdateData({...updateData, status: value})}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="open" className="text-white">Open</SelectItem>
                <SelectItem value="investigating" className="text-white">Investigating</SelectItem>
                <SelectItem value="resolved" className="text-white">Resolved</SelectItem>
                <SelectItem value="false_positive" className="text-white">False Positive</SelectItem>
                <SelectItem value="accepted_risk" className="text-white">Accepted Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assignee (optional)</Label>
            <Select value={updateData.assignee} onValueChange={(value) => setUpdateData({...updateData, assignee: value})}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Select assignee..." />
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] hover:bg-red-700">
              {loading ? "Updating..." : "Update Findings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}