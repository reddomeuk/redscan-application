
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, AlertCircle } from "lucide-react";
import { Asset, Project, User } from "@/api/entities";

export default function BulkImportModal({ onImportComplete }) {
  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = () => {
    const template = `type,name,url,tags,project
domain,example.com,https://example.com,"production,web",Main Website
ip,192.168.1.1,http://192.168.1.1,"internal,infrastructure",Infrastructure
repo,my-app,https://github.com/user/my-app,"code,frontend",Development
cloud,s3-bucket,s3://my-bucket,"storage,aws",Cloud Resources`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    const header = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      
      header.forEach((key, index) => {
        const value = values[index]?.replace(/"/g, '').trim();
        if (key === 'tags') {
          row[key] = value ? value.split(';').map(tag => tag.trim()).filter(Boolean) : [];
        } else {
          row[key] = value || '';
        }
      });
      
      return row;
    });
  };

  const handleImport = async () => {
    if (!csvData.trim()) return;
    
    setLoading(true);
    setResults(null);

    try {
      const parsedData = parseCSV(csvData);
      const importResults = { success: 0, errors: [] };
      const user = await User.me();

      for (const row of parsedData) {
        try {
          if (!row.name || !row.type) {
            importResults.errors.push(`Row missing required fields: ${JSON.stringify(row)}`);
            continue;
          }
          
          let projectId = row.project || null;
          if (projectId === 'none') {
            projectId = null;
          }

          await Asset.create({
            name: row.name,
            type: row.type,
            url: row.url || '',
            tags: row.tags || [],
            organization_id: user.organization_id || "demo-org-1",
            project_id: projectId
          });
          
          importResults.success++;
        } catch (error) {
          importResults.errors.push(`Error importing ${row.name}: ${error.message}`);
        }
      }

      setResults(importResults);
      
      if (importResults.success > 0) {
        onImportComplete();
      }
    } catch (error) {
      setResults({ success: 0, errors: [`CSV parsing error: ${error.message}`] });
    }
    
    setLoading(false);
  };

  const resetModal = () => {
    setCsvData("");
    setResults(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Assets</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>CSV Data</Label>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={downloadTemplate}
              className="border-slate-600 text-slate-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
          
          <Textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Paste your CSV data here or download the template to get started..."
            className="bg-slate-900/50 border-slate-700 text-white h-48 font-mono text-sm"
          />

          <Alert className="bg-slate-900/50 border-slate-700">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            <AlertDescription className="text-slate-300">
              Format: type,name,url,tags,project. Tags should be separated by semicolons.
            </AlertDescription>
          </Alert>

          {results && (
            <div className="space-y-2">
              <p className="text-green-400">Successfully imported: {results.success} assets</p>
              {results.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-red-400">Errors ({results.errors.length}):</p>
                  <div className="text-sm text-slate-400 max-h-32 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-red-300">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetModal} className="border-slate-600 text-slate-300">
              {results ? "Close" : "Cancel"}
            </Button>
            {!results && (
              <Button 
                onClick={handleImport} 
                disabled={loading || !csvData.trim()}
                className="bg-[var(--color-primary)] hover:bg-red-700"
              >
                {loading ? "Importing..." : "Import Assets"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
