import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupplierDocument } from '@/api/entities';
import PortalLayout from '../components/suppliers/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusConfig = {
  Missing: { color: 'bg-slate-500/20 text-slate-400', icon: AlertTriangle },
  Uploaded: { color: 'bg-blue-500/20 text-blue-400', icon: Upload },
  'In Review': { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  Accepted: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  'Needs Clarification': { color: 'bg-orange-500/20 text-orange-400', icon: AlertTriangle },
  Rejected: { color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
};

export default function SupplierPortalDocuments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadData, setUploadData] = useState({
    docId: null,
    file: null,
    expiryDate: ''
  });

  const onDrop = useCallback(acceptedFiles => {
    setUploadData(prev => ({ ...prev, file: acceptedFiles[0] }));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('supplierPortalUser'));
    if (!loggedInUser || !loggedInUser.supplier_id) {
      navigate('/SupplierPortalLogin');
      return;
    }
    setUser(loggedInUser);

    const fetchData = async () => {
      setLoading(true);
      try {
        const docsData = await SupplierDocument.filter({ supplier_id: loggedInUser.supplier_id });
        setDocuments(docsData);
      } catch (error) {
        toast.error("Failed to load documents.");
      }
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  const handleUpload = async () => {
    if (!uploadData.docId || !uploadData.file) {
      toast.error('Please select a document type and a file.');
      return;
    }
    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      const file_url = `/uploads/simulated/${uploadData.file.name}`;
      
      const docToUpdate = documents.find(d => d.id === uploadData.docId);

      await SupplierDocument.update(uploadData.docId, {
        file_url,
        status: 'In Review',
        expiry_date: uploadData.expiryDate || docToUpdate.expiry_date,
        version: (docToUpdate.version || 1) + 1,
        uploaded_by: user.email
      });

      toast.success('Document uploaded successfully and is now in review.');
      setUploadData({ docId: null, file: null, expiryDate: '' });
      const updatedDocs = await SupplierDocument.filter({ supplier_id: user.supplier_id });
      setDocuments(updatedDocs);
    } catch (error) {
      toast.error('Failed to upload document.');
    }
    setIsUploading(false);
  };
  
  const selectedDocForUpload = documents.find(d => d.id === uploadData.docId);

  return (
    <PortalLayout>
      <h1 className="text-3xl font-bold mb-2">Compliance Documents</h1>
      <p className="text-slate-400 mb-6">Upload and manage your compliance documents and certificates.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle>Required Documents</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Document</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Expiry Date</TableHead>
                    <TableHead className="text-slate-300">Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => {
                    const config = statusConfig[doc.status] || statusConfig.Missing;
                    const Icon = config.icon;
                    return (
                      <TableRow key={doc.id} className="border-slate-700">
                        <TableCell className="font-medium text-white">{doc.name}</TableCell>
                        <TableCell>
                          <Badge className={config.color}><Icon className="w-3 h-3 mr-1.5" />{doc.status}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs max-w-xs truncate">
                          {doc.feedback || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription className="text-slate-400">Select a document type to upload or replace a file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={(value) => setUploadData({ docId: value, file: null, expiryDate: '' })}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Select document to upload..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {documents
                    .filter(d => ['Missing', 'Needs Clarification', 'Rejected', 'Accepted'].includes(d.status) || (d.expiry_date && differenceInDays(new Date(d.expiry_date), new Date()) <= 60))
                    .map(doc => (
                    <SelectItem key={doc.id} value={doc.id} className="text-white">{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {uploadData.docId && (
                <>
                  <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-[var(--color-primary)] bg-red-900/20' : 'border-slate-600 hover:border-slate-500'}`}>
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                    {uploadData.file ? (
                      <p>{uploadData.file.name}</p>
                    ) : (
                      <p>Drag & drop a file here, or click to select</p>
                    )}
                  </div>
                  
                  {selectedDocForUpload?.type !== 'Contract' && (
                    <div>
                      <label className="text-sm font-medium text-slate-300">Expiry Date (Optional)</label>
                      <Input 
                        type="date"
                        value={uploadData.expiryDate}
                        onChange={e => setUploadData(prev => ({...prev, expiryDate: e.target.value}))}
                        className="bg-slate-900/50 border-slate-700 mt-1"
                      />
                    </div>
                  )}

                  <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-[var(--color-primary)] hover:bg-red-700">
                    {isUploading ? 'Uploading...' : 'Upload and Submit for Review'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}