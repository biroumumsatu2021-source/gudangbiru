

"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import type { Proposal } from "@/lib/data";


export type HistoryItem = Proposal & {
    status: "Penambahan" | "Pengambilan";
};

interface SummarizedItem {
    itemType: string;
    brand: string;
    quantity: number;
    lastTransactionDate: string;
}

interface EmployeeSummaryItem {
  employee: string;
  employeeNip?: string;
  department: string;
  items: SummarizedItem[];
  warehouse: string;
}

interface DepartmentSummaryItem {
  department: string;
  items: SummarizedItem[];
  warehouse: string;
}

interface RequestHistoryProps {
  history: HistoryItem[];
  viewType: 'transactions' | 'employee-summary' | 'department-summary';
  employeeSummary: any[];
  departmentSummary: any[];
}

export function RequestHistory({ history, viewType, employeeSummary, departmentSummary }: RequestHistoryProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMM yyyy", { locale: id });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm 'WIB'", { locale: id });
    } catch (error) {
      return "Invalid Time";
    }
  };


  if (viewType === 'employee-summary') {
    return (
      <>
        {employeeSummary.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pegawai</TableHead>
                <TableHead>Bagian</TableHead>
                <TableHead>Gudang</TableHead>
                <TableHead>Jenis Barang</TableHead>
                <TableHead>Merk</TableHead>
                <TableHead className="text-right">Total Diambil</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeSummary.map((summary, index) => {
                const rowSpan = summary.items.length;
                return summary.items.map((item: any, itemIndex: number) => (
                  <TableRow key={`${index}-${itemIndex}`} className="odd:bg-muted/30 hover:bg-muted/50">
                    {itemIndex === 0 && (
                      <>
                        <TableCell className="font-medium" rowSpan={rowSpan}>
                            <div>{summary.employee}</div>
                            {summary.employeeNip && <div className="text-xs text-muted-foreground">{summary.employeeNip}</div>}
                        </TableCell>
                        <TableCell rowSpan={rowSpan}>{summary.department}</TableCell>
                        <TableCell rowSpan={rowSpan}><Badge variant="secondary">{summary.warehouse}</Badge></TableCell>
                      </>
                    )}
                    <TableCell>{item.itemType}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{formatDate(item.lastDate)}</TableCell>
                    <TableCell>{formatTime(item.lastDate)}</TableCell>
                  </TableRow>
                ))
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Tidak ada riwayat pengambilan pada periode ini.</p>
        )}
      </>
    );
  }

  if (viewType === 'department-summary') {
    return (
      <>
        {departmentSummary.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bagian</TableHead>
                <TableHead>Gudang</TableHead>
                <TableHead>Jenis Barang</TableHead>
                <TableHead>Merk</TableHead>
                <TableHead className="text-right">Total Diambil</TableHead>
                <TableHead>Tanggal Transaksi Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentSummary.map((summary, index) => {
                const rowSpan = summary.items.length;
                return summary.items.map((item: any, itemIndex: number) => (
                  <TableRow key={`${index}-${itemIndex}`} className="odd:bg-muted/30 hover:bg-muted/50">
                    {itemIndex === 0 && (
                      <>
                        <TableCell className="font-medium" rowSpan={rowSpan}>{summary.department}</TableCell>
                        <TableCell rowSpan={rowSpan}><Badge variant="secondary">{summary.warehouse}</Badge></TableCell>
                      </>
                    )}
                    <TableCell>{item.itemType}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{formatDate(item.lastDate)}</TableCell>
                  </TableRow>
                ))
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Tidak ada riwayat pengambilan pada periode ini.</p>
        )}
      </>
    );
  }

  return (
    <>
        {history.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pegawai/Admin</TableHead>
                <TableHead>Bagian</TableHead>
                <TableHead>Gudang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Jumlah</TableHead>
                <TableHead>Jenis Barang</TableHead>
                <TableHead>Merk</TableHead>
                <TableHead className="w-[120px]">Tanggal</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Foto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((request, index) => {
                const rowSpan = Array.isArray(request.items) && request.items.length > 1 ? request.items.length : 1;
                const rowClassName = index % 2 === 1 ? "bg-muted/30 hover:bg-muted/50" : "hover:bg-muted/50";
                return (
                  Array.isArray(request.items) && request.items.map((item, itemIndex) => (
                    <TableRow key={`${index}-${itemIndex}`} className={rowClassName}>
                      {itemIndex === 0 && (
                        <>
                          <TableCell className="font-medium" rowSpan={rowSpan}>
                            <div>{request.employee}</div>
                            {request.employeeNip && <div className="text-xs text-muted-foreground">{request.employeeNip}</div>}
                          </TableCell>
                          <TableCell rowSpan={rowSpan}>{request.department}</TableCell>
                          <TableCell rowSpan={rowSpan}><Badge variant="outline">{request.warehouse}</Badge></TableCell>
                          <TableCell rowSpan={rowSpan}>
                            <Badge variant={request.status === 'Penambahan' ? 'secondary' : 'outline'}>
                              {request.status}
                            </Badge>
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell>{item.itemType}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      {itemIndex === 0 && (
                         <>
                          <TableCell rowSpan={rowSpan}>{formatDate(request.date)}</TableCell>
                          <TableCell rowSpan={rowSpan}>{formatTime(request.date)}</TableCell>
                          <TableCell className="text-xs" rowSpan={rowSpan}>{request.gps}</TableCell>
                          <TableCell rowSpan={rowSpan}>
                            {request.photoUrl ? (
                                <Dialog>
                                <DialogTrigger asChild>
                                    <button className="w-full h-full">
                                        <Image src={request.photoUrl} alt={`Foto ${request.employee}`} width={100} height={75} className="rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl p-2">
                                     <DialogHeader>
                                        <DialogTitle className="sr-only">Tampilan Penuh Gambar Bukti</DialogTitle>
                                        <DialogDescription className="sr-only">Menampilkan gambar bukti dokumentasi dalam ukuran penuh.</DialogDescription>
                                    </DialogHeader>
                                    <Image src={request.photoUrl} alt={`Foto ${request.employee}`} width={1200} height={900} className="rounded-md object-contain" />
                                </DialogContent>
                                </Dialog>
                            ): (
                                <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada riwayat pengajuan.</p>
        )}
    </>
  )
}
