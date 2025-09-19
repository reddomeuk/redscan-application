import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileJson } from "lucide-react";
import { Finding } from "@/api/entities";
import { toast } from "sonner";

function parseTrivyJson(jsonData, assetId, organizationId) {
    const findings = [];
    if (!jsonData.Results) return findings;

    const mapSeverity = (sev) => {
        const lowerSev = sev.toLowerCase();
        if (lowerSev === 'critical') return 'critical';
        if (lowerSev === 'high') return 'high';
        if (lowerSev === 'medium') return 'medium';
        if (lowerSev === 'low') return 'low';
        return 'info';
    };

    for (const result of jsonData.Results) {
        if (!result.Vulnerabilities) continue;

        for (const vuln of result.Vulnerabilities) {
            const finding = {
                title: `${vuln.PkgName}: ${vuln.VulnerabilityID}`,
                description: vuln.Description || `Vulnerability ${vuln.VulnerabilityID} found in ${vuln.PkgName}.`,
                severity: mapSeverity(vuln.Severity),
                status: 'open',
                asset_id: assetId,
                organization_id: organizationId,
                source: 'cspm',
                cve_ids: [vuln.VulnerabilityID],
                evidence: {
                    location: `Package: ${vuln.PkgName}@${vuln.InstalledVersion}`,
                    snippet: `Fixed Version: ${vuln.FixedVersion || 'N/A'}`
                },
                first_seen: new Date().toISOString(),
                last_seen: new Date().toISOString(),
            };
            findings.push(finding);
        }
    }
    return findings;
}

export default function UploadCloudResultsModal({ cloudAssets = [], onUploadComplete }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [assetId, setAssetId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !assetId) {
      toast.error("Please select an account and a results file.");
      return;
    }
    setLoading(true);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      
      const findingsToCreate = parseTrivyJson(jsonData, assetId, "demo-org-1");

      if (findingsToCreate.length > 0) {
        for (const finding of findingsToCreate) {
          await Finding.create(finding);
        }
        toast.success(`Successfully imported ${findingsToCreate.length} findings.`);
      } else {
        toast.info("No findings were found in the uploaded file.");
      }

      setFile(null);
      setAssetId("");
      setOpen(false);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Error parsing or uploading results:", error);
      toast.error(`Failed to import findings: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Results
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Upload Cloud Scan Results
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Target Account</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Select a cloud account" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {cloudAssets && cloudAssets.length > 0 ? (
                  cloudAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id} className="text-white">
                      {asset.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="demo-account" className="text-white">
                    Demo Account (No accounts configured)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Results File (Trivy JSON, etc.)</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".json"
              className="bg-slate-900/50 border-slate-700 text-white file:text-slate-300 file:bg-slate-700 file:border-none file:px-2 file:py-1 file:rounded"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] hover:bg-red-700">
              {loading ? "Importing..." : "Import Findings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}