import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Ticket } from "lucide-react";
import { Finding } from "@/api/entities";

export default function CreateTicketModal({ selectedFindings, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [ticketData, setTicketData] = useState({
    type: "ticket",
    url: "",
    id: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update each selected finding with the external reference
      for (const findingId of selectedFindings) {
        const finding = await Finding.get(findingId);
        const existingRefs = finding.external_references || [];
        
        await Finding.update(findingId, {
          external_references: [
            ...existingRefs,
            {
              type: ticketData.type,
              url: ticketData.url,
              id: ticketData.id
            }
          ]
        });
      }

      setTicketData({
        type: "ticket",
        url: "",
        id: "",
        description: ""
      });
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error creating ticket reference:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <Ticket className="w-4 h-4 mr-2" />
          Create Ticket ({selectedFindings.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Create External Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Reference Type</Label>
            <Select value={ticketData.type} onValueChange={(value) => setTicketData({...ticketData, type: value})}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="ticket" className="text-white">Support Ticket</SelectItem>
                <SelectItem value="issue" className="text-white">GitHub Issue</SelectItem>
                <SelectItem value="pr" className="text-white">Pull Request</SelectItem>
                <SelectItem value="documentation" className="text-white">Documentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ticket ID/Number</Label>
            <Input
              value={ticketData.id}
              onChange={(e) => setTicketData({...ticketData, id: e.target.value})}
              placeholder="e.g. TICKET-123, #456, DOC-789"
              className="bg-slate-900/50 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>External URL</Label>
            <Input
              value={ticketData.url}
              onChange={(e) => setTicketData({...ticketData, url: e.target.value})}
              placeholder="https://..."
              className="bg-slate-900/50 border-slate-700 text-white"
              type="url"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] hover:bg-red-700">
              {loading ? "Creating..." : "Create Reference"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}