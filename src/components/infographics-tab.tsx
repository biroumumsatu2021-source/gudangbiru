
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList, Pie, PieChart, Cell, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, getMonth, getYear } from "date-fns";
import { id } from "date-fns/locale";
import type { HistoryItem } from "@/components/request-history";
import type { Proposal } from "@/lib/data";

interface InfographicsTabProps {
    history: HistoryItem[];
    proposals: Proposal[];
    selectedWarehouse: string;
    selectedMonth: string;
    selectedYear: string;
}

const chartConfig = {
    penambahan: { label: "Penambahan", color: "hsl(var(--chart-2))" },
    pengambilan: { label: "Pengambilan", color: "hsl(var(--chart-5))" },
    items: { label: "Jumlah Diambil", color: "hsl(var(--chart-1))" },
    department: { label: "Total Barang Diambil", color: "hsl(var(--chart-4))" },
    approved: { label: "Diterima", color: "hsl(var(--chart-2))" },
    rejected: { label: "Ditolak", color: "hsl(var(--chart-5))" },
};

const PIE_CHART_COLORS_STATUS = [chartConfig.approved.color, chartConfig.rejected.color];
const PIE_CHART_COLORS_DYNAMIC = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00c49f",
];


export function InfographicsTab({ history, proposals, selectedWarehouse, selectedMonth, selectedYear }: InfographicsTabProps) {

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            const date = new Date(item.date);
            const warehouseMatch = item.warehouse === selectedWarehouse;
            const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
            const yearMatch = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
            return warehouseMatch && monthMatch && yearMatch;
        });
    }, [history, selectedWarehouse, selectedMonth, selectedYear]);

    const filteredProposals = useMemo(() => {
        return proposals.filter(item => {
            const date = new Date(item.date);
            const warehouseMatch = item.warehouse === selectedWarehouse;
            const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
            const yearMatch = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
            return warehouseMatch && monthMatch && yearMatch;
        });
    }, [proposals, selectedWarehouse, selectedMonth, selectedYear]);


    const monthlyData = useMemo(() => {
        const data: { [key: string]: { month: string; penambahan: number; pengambilan: number, date: Date } } = {};

        filteredHistory.forEach(item => {
            const date = new Date(item.date);
            if (isNaN(date.getTime())) return; 

            const monthKey = `${getYear(date)}-${getMonth(date)}`;
            const monthName = format(date, "MMM yyyy", { locale: id });

            if (!data[monthKey]) {
                data[monthKey] = { month: monthName, penambahan: 0, pengambilan: 0, date: date };
            }

            const totalQuantity = item.items.reduce((sum, current) => sum + current.quantity, 0);

            if (item.status === "Penambahan") {
                data[monthKey].penambahan += totalQuantity;
            } else {
                data[monthKey].pengambilan += totalQuantity;
            }
        });
        
        return Object.values(data).sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [filteredHistory]);

     const proposalStatusData = useMemo(() => {
        const counts = {
            approved: 0,
            rejected: 0,
        };

        filteredProposals.forEach(p => {
            if (p.status === 'approved') counts.approved++;
            if (p.status === 'rejected') counts.rejected++;
        });

        const total = counts.approved + counts.rejected;
        if (total === 0) return [];
        
        return [
            { name: 'Diterima', value: counts.approved },
            { name: 'Ditolak', value: counts.rejected },
        ];
    }, [filteredProposals]);

    const topItemsData = useMemo(() => {
        const itemCounts: { [key: string]: { name: string; value: number } } = {};

        filteredHistory.forEach(item => {
            if (item.status === "Pengambilan") {
                item.items.forEach(detail => {
                    const itemName = `${detail.itemType} - ${detail.brand}`;
                    if (!itemCounts[itemName]) {
                        itemCounts[itemName] = { name: itemName, value: 0 };
                    }
                    itemCounts[itemName].value += detail.quantity;
                });
            }
        });

        return Object.values(itemCounts)
            .sort((a, b) => b.value - a.value);
    }, [filteredHistory]);

    const topDepartmentsData = useMemo(() => {
        const departmentCounts: { [key: string]: { name: string; value: number } } = {};

        filteredHistory.forEach(item => {
            if (item.status === "Pengambilan") {
                const departmentName = item.department;
                if (!departmentName || item.employee === "Admin") return;

                const totalQuantity = item.items.reduce((sum, current) => sum + current.quantity, 0);

                if (!departmentCounts[departmentName]) {
                    departmentCounts[departmentName] = { name: departmentName, value: 0 };
                }
                departmentCounts[departmentName].value += totalQuantity;
            }
        });

        return Object.values(departmentCounts)
            .sort((a, b) => b.value - a.value);
    }, [filteredHistory]);

    const renderChartOrMessage = (chart: React.ReactNode, data: any[], title: string) => {
        if (data.length === 0 || data.every(d => Object.values(d).every(val => (typeof val === 'number' && val === 0) || (typeof val !== 'number') ))) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground p-4">
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm mt-2">Tidak ada data yang tersedia untuk periode filter yang dipilih.</p>
                </div>
            )
        }
        return chart;
    }

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't render label for small slices

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Analisis Arus Barang Bulanan</CardTitle>
                    <CardDescription>Perbandingan jumlah barang masuk dan keluar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                         {renderChartOrMessage((
                            <ResponsiveContainer>
                                <BarChart data={monthlyData} margin={{ top: 20 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="penambahan" fill="var(--color-penambahan)" radius={4}>
                                        <LabelList position="top" offset={8} className="fill-foreground text-xs" />
                                    </Bar>
                                    <Bar dataKey="pengambilan" fill="var(--color-pengambilan)" radius={4}>
                                        <LabelList position="top" offset={8} className="fill-foreground text-xs" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ), monthlyData, "Analisis Arus Barang Bulanan")}
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Status Usulan Barang</CardTitle>
                    <CardDescription>Persentase usulan yang diterima dan ditolak.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        {renderChartOrMessage((
                           <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="name" />} />
                                    <Legend />
                                    <Pie
                                        data={proposalStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={100}
                                        dataKey="value"
                                    >
                                        {proposalStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS_STATUS[index % PIE_CHART_COLORS_STATUS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ), proposalStatusData, "Status Usulan Barang")}
                    </ChartContainer>
                </CardContent>
            </Card>

             <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Barang Paling Sering Diambil</CardTitle>
                    <CardDescription>Persentase barang yang paling banyak diajukan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                         {renderChartOrMessage((
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="name" />} />
                                     <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingLeft: "20px"}}/>
                                    <Pie
                                        data={topItemsData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={110}
                                        innerRadius={40}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {topItemsData.map((entry, index) => (
                                            <Cell key={`cell-item-${index}`} fill={PIE_CHART_COLORS_DYNAMIC[index % PIE_CHART_COLORS_DYNAMIC.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ), topItemsData, "Barang Paling Sering Diambil")}
                    </ChartContainer>
                </CardContent>
            </Card>

             <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Subbagian Pengambil Barang</CardTitle>
                    <CardDescription>Persentase subbagian yang paling banyak mengambil barang.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        {renderChartOrMessage((
                           <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="name" />} />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingLeft: "20px"}}/>
                                    <Pie
                                        data={topDepartmentsData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={110}
                                        innerRadius={40}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {topDepartmentsData.map((entry, index) => (
                                            <Cell key={`cell-dept-${index}`} fill={PIE_CHART_COLORS_DYNAMIC[index % PIE_CHART_COLORS_DYNAMIC.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ), topDepartmentsData, "Subbagian Pengambil Barang")}
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}


    