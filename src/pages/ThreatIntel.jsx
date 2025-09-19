import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ThreatIntelItem, Asset } from '@/api/entities';
import { BookOpen, Search, AlertTriangle, Rss, Newspaper, Shield, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function ThreatIntelPage() {
  const [intelItems, setIntelItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntel = async () => {
      setLoading(true);
      try {
        const items = await ThreatIntelItem.list('-created_date', 100);
        setIntelItems(items);
      } catch (error) {
        toast.error("Failed to load threat intelligence feed.");
      }
      setLoading(false);
    };
    loadIntel();
  }, []);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'cve': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'bulletin': return <Rss className="w-4 h-4 text-blue-400" />;
      case 'news': return <Newspaper className="w-4 h-4 text-yellow-400" />;
      default: return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Threat Intelligence Center</h1>
        <p className="text-slate-400">Curated threat intelligence relevant to your attack surface.</p>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Threat Feed</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Search feed..." className="max-w-sm bg-slate-900/50 border-slate-700" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Title</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Relevance</TableHead>
                <TableHead className="text-slate-300">Affected Assets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="4" className="text-center text-slate-400">Loading feed...</TableCell></TableRow>
              ) : (
                intelItems.map(item => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-sm text-slate-400">{item.summary}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize flex items-center gap-1">
                        {getTypeIcon(item.type)} {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={item.relevance_score > 0.7 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {(item.relevance_score * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {item.mapped_asset_ids?.length || 0}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}