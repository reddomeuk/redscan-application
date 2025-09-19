import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileJson } from "lucide-react";
import { Finding } from "@/api/entities";
import { toast } from "sonner";

// SARIF parsing logic moved here from the invalid utils/ directory
function getSourceFromRuleId(ruleId) {
    if (!ruleId) return 'sast';
    const lowerRuleId = ruleId.toLowerCase();
    if (lowerRuleId.includes('gitleaks')) return 'secrets';
    if (lowerRuleId.includes('semgrep')) return 'sast';
    if (lowerRuleId.includes('grype') || lowerRuleId.includes('dependency')) return 'sca';
    if (lowerRuleId.includes('checkov')) return 'iac';
    if (lowerRuleId.includes('bandit')) return 'sast';
    if (lowerRuleId.includes('gosec')) return 'sast';
    return 'sast'; // Default to SAST
}

function mapSeverity(level) {
    switch (level) {
        case 'error': return 'high';
        case 'warning': return 'medium';
        case 'note': return 'low';
        default: return 'info';
    }
}

function parseSarif(sarifData, assetId, organizationId) {
    const findings = [];
    if (!sarifData.runs) return findings;

    for (const run of sarifData.runs) {
        if (!run.results) continue;

        for (const result of run.results) {
            const location = result.locations?.[0]?.physicalLocation;
            const file = location?.artifactLocation?.uri || 'Unknown file';
            const line = location?.region?.startLine || 1;

            const cveIdMatch = result.ruleId?.match(/(CVE-\d{4}-\d{4,7})/);

            const finding = {
                title: result.message.text || result.ruleId,
                description: `Finding for rule: ${result.ruleId}. Full details in scan report.`,
                severity: mapSeverity(result.level || 'note'),
                status: 'open',
                asset_id: assetId,
                organization_id: organizationId,
                source: getSourceFromRuleId(result.ruleId),
                cve_ids: cveIdMatch ? [cveIdMatch[0]] : [],
                evidence: {
                    location: `${file}#L${line}`,
                    snippet: location?.contextRegion?.snippet?.text || location?.region?.snippet?.text || 'No snippet available.'
                },
                first_seen: new Date().toISOString(),
                last_seen: new Date().toISOString(),
            };
            findings.push(finding);
        }
    }
    return findings;
}


export default function UploadResultsModal({ codeAssets, onUploadComplete }) {
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
      toast.error("Please select an asset and a results file.");
      return;
    }
    setLoading(true);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      // Currently only supports SARIF
      const findingsToCreate = parseSarif(jsonData, assetId, "demo-org-1");

      if (findingsToCreate.length > 0) {
        // The SDK might not have a bulkCreate, so we create one by one.
        // In a real scenario, a bulk endpoint would be more efficient.
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
      onUploadComplete();
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
            Upload Scan Results
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Target Repository</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {codeAssets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id} className="text-white">
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Results File (SARIF format)</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".sarif,.json"
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