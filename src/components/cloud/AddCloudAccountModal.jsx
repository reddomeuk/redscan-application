import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Asset } from "@/api/entities";
import { toast } from "sonner";

export default function AddCloudAccountModal({ onAccountAdded }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.provider) {
      toast.error("Please provide an account name and provider.");
      return;
    }
    setLoading(true);

    try {
      await Asset.create({
        name: formData.name,
        type: 'cloud',
        metadata: { provider: formData.provider },
        organization_id: "demo-org-1", // Placeholder
      });
      
      toast.success("Cloud account added successfully.");
      setFormData({ name: "", provider: "" });
      setOpen(false);
      onAccountAdded();
    } catch (error) {
      console.error("Error creating cloud account:", error);
      toast.error("Failed to add cloud account.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[var(--color-primary)] hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Cloud Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Name / ID</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Production AWS Account or 123456789012"
              className="bg-slate-900/50 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={formData.provider} onValueChange={(value) => setFormData({...formData, provider: value})}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Select cloud provider" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="AWS" className="text-white">AWS</SelectItem>
                <SelectItem value="Azure" className="text-white">Azure</SelectItem>
                <SelectItem value="GCP" className="text-white">GCP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
           <p className="text-xs text-slate-400 pt-2">Note: This form is for demonstration. In a real-world scenario, you would securely provide credentials or assume a role for scanning.</p>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] hover:bg-red-700">
              {loading ? "Adding..." : "Add Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}