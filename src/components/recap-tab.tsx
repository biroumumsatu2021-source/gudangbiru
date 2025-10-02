

"use client"

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { warehouses, type StockItem as StockItemData } from "@/lib/data";
import type { HistoryItem } from "./request-history";

interface RecapTabProps {
    historyData: HistoryItem[];
    stockData: StockItemData[];
    uniqueMonths: string[];
    monthNames: string[];
    uniqueYears: string[];
}

type StockCardItem = {
    date: string;
    itemName: string;
    description: string;
    stockIn: number;
    stockOut: number;
    finalStock: number;
};

export function RecapTab({ historyData, stockData, uniqueMonths, monthNames, uniqueYears }: RecapTabProps) {
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses[0]);
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const stockCardData = useMemo(() => {
        // 1. Define the filter period
        const year = parseInt(selectedYear, 10);
        const month = parseInt(selectedMonth, 10);
        const isAllMonths = selectedMonth === 'all';
        const isAllYears = selectedYear === 'all';

        let startDate = new Date(year, 0, 1);
        let endDate = new Date(year, 11, 31, 23, 59, 59);

        if (!isAllMonths) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
        }

        if (isAllYears) {
            startDate = new Date(2000, 0, 1);
            endDate = new Date(3000, 11, 31);
        }

        // 2. Get all unique items that have ever existed in the selected warehouse based on history and current stock.
        const itemsInWarehouse = new Set<string>();
        stockData
            .filter(i => i.warehouse === selectedWarehouse)
            .forEach(i => itemsInWarehouse.add(`${i.itemType} - ${i.brand}`));
        historyData
            .filter(h => h.warehouse === selectedWarehouse)
            .forEach(h => h.items.forEach(i => itemsInWarehouse.add(`${i.itemType} - ${i.brand}`)));
            
        const allStockCards: StockCardItem[] = [];

        // 3. Process each unique item
        Array.from(itemsInWarehouse).sort().forEach(itemName => {
            const [itemType, brand] = itemName.split(' - ');
            
            // 4. Find all transactions for this item in this warehouse across all time
            const allItemTransactions = historyData
                .filter(h => h.warehouse === selectedWarehouse)
                .flatMap(h => h.items.map(i => ({ ...h, ...i, txDate: new Date(h.date), status: h.status, department: h.department, employee: h.employee })))
                .filter(tx => tx.itemType === itemType && tx.brand === brand)
                .sort((a,b) => a.txDate.getTime() - b.txDate.getTime());
                
            if (allItemTransactions.length === 0) return;

            // 5. Calculate initial stock for the beginning of the filter period
            let initialStock = 0;
            allItemTransactions.forEach(tx => {
                if (tx.txDate < startDate) {
                    if (tx.status === 'Penambahan') {
                        initialStock += tx.quantity;
                    } else { // Pengambilan
                        initialStock -= tx.quantity;
                    }
                }
            });

            // 6. Get transactions within the filtered period
            const transactionsInPeriod = allItemTransactions.filter(tx => tx.txDate >= startDate && tx.txDate <= endDate);

            if (initialStock === 0 && transactionsInPeriod.length === 0) {
                return;
            }

            const itemStockCard: StockCardItem[] = [];
            let currentStock = initialStock;
            
            // 7. Add initial stock row if it's not zero
            if (initialStock > 0) {
                 itemStockCard.push({
                    date: startDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    itemName: itemName,
                    description: "Stok Awal",
                    stockIn: 0,
                    stockOut: 0,
                    finalStock: initialStock,
                });
            }

            // 8. Process transactions within the period
            transactionsInPeriod.forEach((tx, index) => {
                let stockIn = 0;
                let stockOut = 0;
                let description = "";

                // Find the index of the first addition transaction across all time
                const firstAdditionIndex = allItemTransactions.findIndex(t => t.status === 'Penambahan');

                if (tx.status === "Penambahan") {
                    stockIn = tx.quantity;
                    currentStock += tx.quantity;
                    
                    // Check if this is the very first addition for this item
                    const isFirstEverAddition = allItemTransactions[firstAdditionIndex]?.id === tx.id;
                    
                    description = isFirstEverAddition ? "Stok Awal" : "Pembelian";

                } else { // Pengambilan
                    stockOut = tx.quantity;
                    currentStock -= tx.quantity;
                    description = `Pemakaian ${tx.department}`;
                }

                itemStockCard.push({
                    date: tx.txDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    itemName: itemName,
                    description: description,
                    stockIn: stockIn,
                    stockOut: stockOut,
                    finalStock: currentStock,
                });
            });

            allStockCards.push(...itemStockCard);
        });

        return allStockCards;
    }, [historyData, stockData, selectedWarehouse, selectedMonth, selectedYear]);
    
    const handleDownloadExcel = () => {
        if (stockCardData.length === 0) return;

        const now = new Date();
        const monthName = monthNames[uniqueMonths.indexOf(selectedMonth)] || "Semua Bulan";
        const yearName = selectedYear === 'all' ? "Semua Tahun" : selectedYear;

        const title = [
            [`Rekapitulasi Kartu Stok - Gudang ${selectedWarehouse}`],
            [`Periode: ${monthName} ${yearName}`]
        ];

        const dataToExport = stockCardData.map(item => ({
            'Tanggal': item.date,
            'Jenis Barang (Merk/Tipe)': item.itemName,
            'Keterangan': item.description,
            'Masuk': item.stockIn > 0 ? item.stockIn : item.description === 'Stok Awal' && item.stockIn > 0 ? item.stockIn : '',
            'Keluar': item.stockOut > 0 ? item.stockOut : '',
            'Saldo Akhir': item.finalStock,
        }));
        
        const worksheet = XLSX.utils.aoa_to_sheet(title);
        XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: 'A4' });

        worksheet['!cols'] = [
            { wch: 12 }, { wch: 35 }, { wch: 30 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }
        ];
        
        // Merge cells for the main titles
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }
        ];

        const workbook = XLSX.utils.book_new();
        const safeWarehouseName = selectedWarehouse.replace(/[^a-z0-9]/gi, '_');
        const fileName = `Kartu_Stok_${safeWarehouseName}_${monthName.replace(/\s/g, '_')}_${yearName}.xlsx`;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, `Kartu Stok`);
        XLSX.writeFile(workbook, fileName);
    };


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2 md:col-span-2">
                    <Label>Pilih Gudang</Label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {warehouses.map(wh => <SelectItem key={wh} value={wh}>{wh}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Filter Bulan</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {uniqueMonths.map((month, index) => (
                                <SelectItem key={month} value={month}>{monthNames[index]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Filter Tahun</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {uniqueYears.map(year => (
                                <SelectItem key={year} value={year}>{year === 'all' ? 'Semua Tahun' : year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleDownloadExcel} disabled={stockCardData.length === 0} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Excel
                </Button>
            </div>

            {stockCardData.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[600px] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Jenis Barang (Merk/Tipe)</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right">Masuk</TableHead>
                                    <TableHead className="text-right">Keluar</TableHead>
                                    <TableHead className="text-right">Saldo Akhir</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockCardData.map((item, index) => {
                                    const isNewItemGroup = index === 0 || item.itemName !== stockCardData[index - 1]?.itemName;
                                    const isStokAwalRow = item.description === "Stok Awal";
                                    return (
                                        <TableRow key={index} className={`${isNewItemGroup && index > 0 ? "border-t-4 border-primary/20" : ""} ${isStokAwalRow ? "bg-muted/50 font-semibold" : ""}`}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell className="font-medium">{isNewItemGroup ? item.itemName : ''}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right text-green-600 font-semibold">{item.stockIn > 0 ? `+${item.stockIn}` : ''}</TableCell>
                                            <TableCell className="text-right text-red-600 font-semibold">{item.stockOut > 0 ? `-${item.stockOut}` : ''}</TableCell>
                                            <TableCell className="text-right font-bold">{item.finalStock}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Tidak ada data stok di gudang ini untuk ditampilkan.</p>
                </div>
            )}
        </div>
    );
}

    