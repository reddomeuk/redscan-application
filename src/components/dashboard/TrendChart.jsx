import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart as ChartIcon } from 'lucide-react';

const data = Array.from({ length: 30 }, (_, i) => ({
  name: `Day ${i + 1}`,
  open: 258 - i * 5 + Math.floor(Math.random() * 20),
  critical: 12 - Math.floor(i / 3) + Math.floor(Math.random() * 3),
  high: 45 - i * 1.5 + Math.floor(Math.random() * 10),
}));

export default function TrendChart() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-purple-400"/>
            Findings Trend (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#8A8A8A" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#8A8A8A" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #8A8A8A' }} />
            <Legend />
            <Line type="monotone" dataKey="open" stroke="#f59e0b" strokeWidth={2} dot={false} name="Open"/>
            <Line type="monotone" dataKey="critical" stroke="#B00020" strokeWidth={2} dot={false} name="Critical" />
            <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={false} name="High"/>
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}