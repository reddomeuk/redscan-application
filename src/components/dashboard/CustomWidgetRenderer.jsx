import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Finding, Asset, Scan } from '@/api/entities';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#B00020', '#f97316', '#f59e0b', '#22c55e', '#3b82f6'];

export default function CustomWidgetRenderer({ widget }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            let rawData;
            try {
                switch(widget.data_source) {
                    case 'assets': rawData = await Asset.list(); break;
                    case 'scans': rawData = await Scan.list(); break;
                    default: rawData = await Finding.list(); break;
                }
                
                // This is a simplified transformation logic
                if (widget.widget_type === 'counter') {
                    setData(rawData.length);
                } else if (widget.widget_type === 'pie_chart' || widget.widget_type === 'bar_chart') {
                    const groupKey = widget.configuration?.group_by || 'severity';
                    const grouped = rawData.reduce((acc, item) => {
                        const key = item[groupKey] || 'Unknown';
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                    }, {});
                    setData(Object.entries(grouped).map(([name, value]) => ({ name, value })));
                }
            } catch (e) {
                console.error("Failed to fetch widget data", e);
            }
            setLoading(false);
        };
        fetchData();
    }, [widget]);

    const renderContent = () => {
        if (loading) return <p className="text-slate-400">Loading...</p>;
        if (!data) return <p className="text-red-400">Error loading data</p>;

        switch(widget.widget_type) {
            case 'counter':
                return <div className="text-4xl font-bold text-white">{data}</div>;
            case 'pie_chart':
                return (
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'bar_chart':
                return (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#8A8A8A" fontSize={10}/>
                            <YAxis stroke="#8A8A8A" fontSize={10}/>
                            <Bar dataKey="value" fill="#B00020" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700 h-full">
            <CardHeader><CardTitle className="text-white text-base">{widget.title}</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
                {renderContent()}
            </CardContent>
        </Card>
    );
}