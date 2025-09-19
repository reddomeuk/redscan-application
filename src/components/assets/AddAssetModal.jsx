
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { Asset, Project, Organization, User } from "@/api/entities";
import { toast } from 'sonner';

const PLAN_LIMITS = {
  free: 5,
  pro: 100,
  enterprise: Infinity,
  trial: 100,
};

export default function AddAssetModal({ onAssetCreated }) {
  const [open, setOpen] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("domain");
  const [assetUrl, setAssetUrl] = useState("");
  const [assetProject, setAssetProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canAdd, setCanAdd] = useState(true);

  const loadPrerequisites = useCallback(async () => {
    try {
      const [projectData, user, orgAssets] = await Promise.all([
        Project.list('-created_date', 50),
        User.me(),
        Asset.list()
      ]);
      setProjects(projectData);

      if (user.organization_id) {
        const org = await Organization.get(user.organization_id);
        const limit = PLAN_LIMITS[org.subscription_tier] || 5;
        if (orgAssets.length >= limit) {
          setCanAdd(false);
          toast.warning(`Asset limit reached for your '${org.subscription_tier}' plan.`);
        } else {
          setCanAdd(true);
        }
      }

    } catch (error) {
      console.error('Error loading prerequisites:', error);
    }
  }, [PLAN_LIMITS]); // Added PLAN_LIMITS to dependency array

  useEffect(() => {
    if (open) {
      loadPrerequisites();
    }
  }, [open, loadPrerequisites]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetName || !assetUrl) {
      toast.error("Please fill in all required fields (Asset Name and URL/Endpoint).");
      return;
    }
    if (!canAdd) {
      toast.error("Cannot add asset: subscription limit reached.");
      return;
    }

    setLoading(true);
    try {
      const user = await User.me();
      await Asset.create({
        name: assetName,
        type: assetType,
        url: assetUrl,
        project_id: assetProject === 'none' ? null : assetProject || null,
        organization_id: user.organization_id || "demo-org-1"
      });
      toast.success("Asset added successfully!");
      setOpen(false);
      onAssetCreated();
    } catch (error) {
      console.error("Failed to create asset:", error);
      toast.error("Failed to add asset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[var(--color-primary)] hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new asset for your organization. Make sure to provide a unique name and a valid URL or IP.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            {!canAdd && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
                <p className="text-red-300 text-sm font-medium">Asset limit reached for your plan.</p>
                <p className="text-red-400 text-xs">Please upgrade your subscription to add more assets.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="assetName">Asset Name</Label>
              <Input
                id="assetName"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. example.com, 192.168.1.1"
                className="bg-slate-900/50 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetType">Type</Label>
              <Select value={assetType} onValueChange={(value) => setAssetType(value)}>
                <SelectTrigger id="assetType" className="bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="domain" className="text-white">Domain</SelectItem>
                  <SelectItem value="ip" className="text-white">IP Address</SelectItem>
                  <SelectItem value="code_repository" className="text-white">Repository</SelectItem>
                  <SelectItem value="cloud" className="text-white">Cloud Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetUrl">URL/Endpoint</Label>
              <Input
                id="assetUrl"
                value={assetUrl}
                onChange={(e) => setAssetUrl(e.target.value)}
                placeholder="https://example.com or repository URL"
                className="bg-slate-900/50 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetProject">Project</Label>
              <Select value={assetProject} onValueChange={(value) => setAssetProject(value)}>
                <SelectTrigger id="assetProject" className="bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="none" className="text-white">None</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id} className="text-white">
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !canAdd} className="bg-[var(--color-primary)] hover:bg-red-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
