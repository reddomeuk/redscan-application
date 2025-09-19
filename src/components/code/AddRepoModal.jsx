import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, GitBranch } from "lucide-react";
import { Asset } from "@/api/entities";

export default function AddRepoModal({ onRepoAdded }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    provider: "github",
    owner: "",
    repo: "",
    default_branch: "main"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const repoName = `${formData.owner}/${formData.repo}`;
    const repoUrl = `https://${formData.provider}.com/${repoName}`;

    try {
      await Asset.create({
        name: repoName,
        type: 'code_repository',
        url: repoUrl,
        organization_id: "demo-org-1", // In real app, get from user context
        metadata: {
          provider: formData.provider,
          owner: formData.owner,
          repo: formData.repo,
          default_branch: formData.default_branch
        }
      });
      
      setFormData({ provider: "github", owner: "", repo: "", default_branch: "main" });
      setOpen(false);
      onRepoAdded();
    } catch (error) {
      console.error("Error creating repository asset:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[var(--color-primary)] hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Repository
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Add Code Repository
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={formData.provider} onValueChange={(value) => setFormData({...formData, provider: value})}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="github" className="text-white">GitHub</SelectItem>
                <SelectItem value="gitlab" className="text-white">GitLab</SelectItem>
                <SelectItem value="azure" className="text-white">Azure DevOps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Owner/Organization</Label>
              <Input
                value={formData.owner}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                placeholder="e.g. your-org"
                className="bg-slate-900/50 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Repository Name</Label>
              <Input
                value={formData.repo}
                onChange={(e) => setFormData({...formData, repo: e.target.value})}
                placeholder="e.g. your-repo"
                className="bg-slate-900/50 border-slate-700 text-white"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Default Branch</Label>
            <Input
              value={formData.default_branch}
              onChange={(e) => setFormData({...formData, default_branch: e.target.value})}
              className="bg-slate-900/50 border-slate-700 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] hover:bg-red-700">
              {loading ? "Adding..." : "Add Repository"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}