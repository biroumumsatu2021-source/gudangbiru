
"use client";

import { useState, useEffect, useId, useMemo } from "react";
import AppHeader from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RequestHistory, type HistoryItem } from "@/components/request-history";
import { brands, itemTypes as initialItemTypes, brandsByItemType as initialBrandsByItemType, unitKerja, bidangSubbagian, employeesByBidang, stockItems as initialStockData, itemTypes, Employee, warehouseStaff, warehouses } from "@/lib/data";
import { PlusCircle, Trash2, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StockItem as StockItemData, Proposal } from "@/lib/data";
import { getAddressFromCoordinates } from "@/lib/actions";
import { InfographicsTab } from "@/components/infographics-tab";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import * as XLSX from 'xlsx';
import { RecapTab } from "@/components/recap-tab";


type StockItem = {
  id: string;
  itemType: string;
  newItemTypeName: string; // To hold the value of the new item type
  brand: string;
  newBrand: string;
  quantity: number;
  price: number;
};

type Location = {
  latitude: number;
  longitude: number;
} | null;

// Helper functions for localStorage
const getFromLocalStorage = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) || typeof parsed === 'object') return parsed;
        return fallback;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
        return fallback;
    }
}

const updateLocalStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(data) }));
    }
}

const getStock = (): StockItemData[] => getFromLocalStorage('stockItems', initialStockData) || [];
const updateStock = (newStock: StockItemData[]) => updateLocalStorage('stockItems', newStock);

const getHistory = (): HistoryItem[] => getFromLocalStorage('requestHistory', []) || [];
const updateHistory = (newHistory: HistoryItem[]) => updateLocalStorage('requestHistory', newHistory);

const getProposals = (): Proposal[] => getFromLocalStorage('proposals', []) || [];
const updateProposals = (newProposals: Proposal[]) => updateLocalStorage('proposals', newProposals);


function AddStockForm({ onStockAdded, stockData }: { onStockAdded: () => void, stockData: StockItemData[] }) {
  const { toast } = useToast();
  const formId = useId();
  const [items, setItems] = useState<StockItem[]>([
    { id: `${formId}-0`, itemType: "", newItemTypeName: "", brand: "", newBrand: "", quantity: 1, price: 0 }
  ]);
  const [address, setAddress] = useState<string>("Kantor Pusat");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");


  // Get unique item types from current stock for the dropdown
   const availableItemTypes = Array.from(new Set(stockData.map(item => item.itemType)))
        .map(type => ({ name: type }));

  // Get brands for a selected item type
  const getBrandsForItemType = (itemType: string) => {
      // Exclude special value for new item type
      if (itemType === '__new_item_type__') return [];
      return Array.from(new Set(stockData
          .filter(item => item.itemType === itemType)
          .map(item => item.brand)
      ));
  };


  useEffect(() => {
    const fetchAddress = async (latitude: number, longitude: number) => {
        const result = await getAddressFromCoordinates({ latitude, longitude });
        if (result.success && result.address) {
            setAddress(result.address);
        } else {
            console.error("Gagal mendapatkan alamat dari GPS.");
        }
    };
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchAddress(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location for admin:", error);
          // Tetap gunakan default "Kantor Pusat" jika gagal
        }
      );
    }
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      const staffMember = warehouseStaff.find(s => s.name === selectedStaff);
      if (staffMember) {
        switch (staffMember.name) {
          case "Bangun Waizal Karniz, S.Pd.":
            setSelectedWarehouse("Gudang Biro Umum");
            break;
          case "Nur Elsahbania, S.E.":
            setSelectedWarehouse("Gudang Sekretaris Jenderal");
            break;
          case "Rizka Putri Rumastari, A.Md.Bns.":
            setSelectedWarehouse("Gudang Menteri");
            break;
          default:
            setSelectedWarehouse("");
            break;
        }
      }
    } else {
      setSelectedWarehouse("");
    }
  }, [selectedStaff]);

  const handleItemChange = (id: string, field: keyof Omit<StockItem, 'id' | 'newItemTypeName'>, value: string | number) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'itemType') {
             if (value === '__new_item_type__') {
                updatedItem.brand = 'new';
                updatedItem.newBrand = "";
                updatedItem.newItemTypeName = "";
             } else {
                updatedItem.brand = "";
                updatedItem.newBrand = "";
                updatedItem.newItemTypeName = "";
            }
          }
          if (field === 'brand') {
             updatedItem.brand = value as string;
             if (value !== 'new') {
                updatedItem.newBrand = "";
             }
          }
          return updatedItem;
        }
        return item;
      })
    );
  };
  
  const handleNewItemTypeChange = (id: string, value: string) => {
     setItems(prevItems =>
      prevItems.map(item => 
        item.id === id ? { ...item, newItemTypeName: value } : item
      )
    );
  }
  
  const handleNewBrandPriceChange = (id: string, field: 'newBrand' | 'price', value: string | number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };


  const addNewItem = () => {
    setItems(prev => [...prev, { id: `${formId}-${prev.length}`, itemType: "", newItemTypeName: "", brand: "", newBrand: "", quantity: 1, price: 0 }]);
  };
  
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStaff) {
       toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Mohon pilih nama petugas gudang yang melakukan aksi ini.",
      });
      return;
    }
     if (!selectedWarehouse) {
      toast({
        variant: "destructive",
        title: "Pilih Gudang",
        description: "Mohon pilih gudang tujuan penambahan stok.",
      });
      return;
    }
    
    const isAnyItemIncomplete = items.some(item => {
      const isNewItemType = item.itemType === '__new_item_type__';
      
      if (isNewItemType) {
        // Must have new item type name, new brand name, and price
        return !item.newItemTypeName || !item.newBrand || item.quantity <= 0 || item.price <= 0;
      }
      
      const isNewBrand = item.brand === 'new';
      if (isNewBrand) {
        return !item.itemType || !item.newBrand || item.quantity <= 0 || item.price <= 0;
      }
      
      // Standard item
      return !item.itemType || !item.brand || item.quantity <= 0;
    });
    

    if (isAnyItemIncomplete) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Mohon lengkapi semua detail barang (termasuk merek dan harga untuk item baru).",
      });
      return;
    }

    const currentStock = getStock();
    const currentHistory = getHistory();
    const newHistoryEntries: HistoryItem[] = [];
    const selectedStaffInfo = warehouseStaff.find(s => s.name === selectedStaff);

    items.forEach(item => {
        const isNewItemType = item.itemType === '__new_item_type__';
        const itemTypeName = isNewItemType ? item.newItemTypeName.trim() : item.itemType;
        const brandName = (isNewItemType || item.brand === 'new') ? item.newBrand.trim() : item.brand;
        
        if (!itemTypeName || !brandName) return; // Should be caught by validation, but as a safeguard

        const existingStockIndex = currentStock.findIndex(
            s => s.itemType.toLowerCase() === itemTypeName.toLowerCase() && 
                 s.brand.toLowerCase() === brandName.toLowerCase() &&
                 s.warehouse === selectedWarehouse
        );

        if (existingStockIndex > -1) {
            currentStock[existingStockIndex].quantity += item.quantity;
            if ((isNewItemType || item.brand === 'new') && item.price > 0) {
               currentStock[existingStockIndex].price = item.price;
            }
        } else {
            const newItemId = `${itemTypeName.toLowerCase().replace(/\s+/g, '-')}-${brandName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
            currentStock.push({
                id: newItemId,
                itemType: itemTypeName,
                brand: brandName,
                quantity: item.quantity,
                price: item.price,
                warehouse: selectedWarehouse,
            });
        }
        
        newHistoryEntries.push({
            id: `hist-${Date.now()}`,
            employee: selectedStaff,
            employeeNip: selectedStaffInfo?.nip,
            department: "Gudang",
            items: [{ itemType: itemTypeName, brand: brandName, quantity: item.quantity }],
            date: new Date().toISOString(),
            status: "Penambahan",
            photoUrl: "",
            gps: address,
            warehouse: selectedWarehouse,
        });
    });

    updateStock(currentStock);
    updateHistory([...newHistoryEntries, ...currentHistory]);
    
    toast({
      title: "Stok Berhasil Ditambahkan",
      description: `Stok untuk ${selectedWarehouse} dan riwayat telah diperbarui.`,
    });
    
    onStockAdded();
    setItems([{ id: `${formId}-0`, itemType: "", newItemTypeName: "", brand: "", newBrand: "", quantity: 1, price: 0 }]);
    setSelectedStaff("");
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium text-lg">Detail Petugas & Gudang</h3>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Nama Petugas Gudang</Label>
                    <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                        <SelectTrigger><SelectValue placeholder="Pilih Petugas" /></SelectTrigger>
                        <SelectContent>
                        {warehouseStaff.map(staff => <SelectItem key={staff.nip} value={staff.name}>{staff.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Gudang Tujuan</Label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse} disabled={!!selectedStaff}>
                        <SelectTrigger><SelectValue placeholder="Pilih Gudang" /></SelectTrigger>
                        <SelectContent>
                        {warehouses.map(wh => <SelectItem key={wh} value={wh}>{wh}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
      </div>

      {items.map((item, index) => {
        const isNewItemType = item.itemType === '__new_item_type__';
        const isNewBrand = item.brand === 'new';

        return (
         <div key={item.id} className="space-y-4 p-4 border rounded-lg relative animate-in fade-in-30">
            <h3 className="font-medium text-lg">Detail Barang #{index + 1}</h3>
            {items.length > 1 && (
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7" 
                    onClick={() => removeItem(item.id)}
                    aria-label="Hapus item"
                >
                    <Trash2 className="h-4 w-4 text-destructive"/>
                </Button>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor={`itemType-${item.id}`}>Tipe Barang</Label>
                <Select value={item.itemType} onValueChange={(value) => handleItemChange(item.id, 'itemType', value)}>
                    <SelectTrigger id={`itemType-${item.id}`}><SelectValue placeholder="Pilih Tipe" /></SelectTrigger>
                    <SelectContent>
                    {availableItemTypes.map(it => <SelectItem key={it.name} value={it.name}>{it.name}</SelectItem>)}
                     <SelectItem value="__new_item_type__">Lainnya (Tipe Baru)</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor={`brand-${item.id}`}>Merek</Label>
                <Select value={item.brand} onValueChange={(value) => handleItemChange(item.id, 'brand', value)} disabled={!item.itemType || isNewItemType}>
                    <SelectTrigger id={`brand-${item.id}`}><SelectValue placeholder="Pilih Merek" /></SelectTrigger>
                    <SelectContent>
                    {getBrandsForItemType(item.itemType).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    <SelectItem value="new">Lainnya (Merek Baru)</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
             {isNewItemType && (
                <div className="space-y-2 animate-in fade-in-50">
                    <Label htmlFor={`newItemType-${item.id}`}>Nama Tipe Barang Baru</Label>
                    <Input id={`newItemType-${item.id}`} value={item.newItemTypeName} onChange={e => handleNewItemTypeChange(item.id, e.target.value)} placeholder="Masukkan tipe barang baru" />
                </div>
            )}
            {(isNewBrand || isNewItemType) && (
                <div className="space-y-2 animate-in fade-in-50 grid sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor={`newBrand-${item.id}`}>Merek Baru</Label>
                        <Input id={`newBrand-${item.id}`} value={item.newBrand} onChange={e => handleNewBrandPriceChange(item.id, 'newBrand', e.target.value)} placeholder="Masukkan nama merek baru" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`price-${item.id}`}>Harga Satuan (Baru)</Label>
                        <Input id={`price-${item.id}`} type="number" value={item.price} onChange={e => handleNewBrandPriceChange(item.id, 'price', parseInt(e.target.value, 10) || 0)} min="0" placeholder="e.g. 50000" />
                    </div>
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor={`quantity-${item.id}`}>Jumlah</Label>
                <Input id={`quantity-${item.id}`} type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)} min="1" />
            </div>
        </div>
      )})}
      
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={addNewItem} type="button">
            <PlusCircle className="mr-2 h-4 w-4"/> Tambah Jenis Barang
        </Button>
        <Button type="submit">Tambah Semua Stok</Button>
      </div>
    </form>
    </>
  );
}

function ReviewStock({ stockData, selectedWarehouse }: { stockData: StockItemData[], selectedWarehouse: string }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };
  
  const getItemIcon = (itemTypeName: string) => {
    const itemType = itemTypes.find(it => it.name === itemTypeName);
    return itemType ? itemType.icon : null;
  }
  
  const getBrandLogo = (brandName: string) => {
    const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
    return brand?.logoUrl;
  }

  const processedStock = useMemo(() => {
    if (selectedWarehouse === "Gudang Sentral") {
      const aggregatedStock: { [key: string]: StockItemData } = {};
      stockData.forEach(item => {
        const key = `${item.itemType}-${item.brand}`;
        if (aggregatedStock[key]) {
          aggregatedStock[key].quantity += item.quantity;
        } else {
          aggregatedStock[key] = { ...item };
        }
      });
      return Object.values(aggregatedStock);
    }
    return stockData.filter(item => item.warehouse === selectedWarehouse);
  }, [stockData, selectedWarehouse]);
  
  const handleDownloadExcel = () => {
    let dataForSheet: any[];
    
    const now = new Date();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    const title = [
        [`Laporan Stok - ${selectedWarehouse}`],
        [`Per Tanggal: ${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`]
    ];

    let headers: string[];
    let columnWidths: { wch: number }[];

    if (selectedWarehouse === 'Gudang Sentral') {
        dataForSheet = stockData;
        headers = ['Gudang', 'Tipe Barang', 'Merek', 'Jumlah (Stok)', 'Harga Satuan', 'Total Nilai'];
        columnWidths = [{ wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
        dataForSheet = dataForSheet.map(item => ({
          'Gudang': item.warehouse,
          'Tipe Barang': item.itemType,
          'Merek': item.brand,
          'Jumlah (Stok)': item.quantity,
          'Harga Satuan': item.price,
          'Total Nilai': item.quantity * item.price
        }));
    } else {
        dataForSheet = processedStock;
        headers = ['Tipe Barang', 'Merek', 'Jumlah (Stok)', 'Harga Satuan', 'Total Nilai'];
        columnWidths = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
        dataForSheet = dataForSheet.map(item => ({
          'Tipe Barang': item.itemType,
          'Merek': item.brand,
          'Jumlah (Stok)': item.quantity,
          'Harga Satuan': item.price,
          'Total Nilai': item.quantity * item.price,
        }));
    }

    if (dataForSheet.length === 0) return;

    // Format currency for excel
    const dataToExport = dataForSheet.map(item => ({
      ...item,
      'Harga Satuan': formatCurrency(item['Harga Satuan']),
      'Total Nilai': formatCurrency(item['Total Nilai'])
    }));
    
    const worksheet = XLSX.utils.aoa_to_sheet(title);
    XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: 'A4', header: headers });

    worksheet['!cols'] = columnWidths;
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columnWidths.length -1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: columnWidths.length -1 } }
    ];

    const workbook = XLSX.utils.book_new();
    const safeWarehouseName = selectedWarehouse.replace(/[^a-z0-9]/gi, '_');
    const fileName = `Laporan_Stok_${safeWarehouseName}_${month}_${year}.xlsx`;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, `Stok ${safeWarehouseName}`);
    XLSX.writeFile(workbook, fileName);
  };


  return (
    <div>
      <div className="flex justify-end items-center mb-4">
        <div className="flex gap-2">
            <Button onClick={handleDownloadExcel} variant="outline" size="sm" disabled={processedStock.length === 0 && (selectedWarehouse !== 'Gudang Sentral' || stockData.length === 0)}>
                <Download className="mr-2 h-4 w-4" />
                Unduh Excel
            </Button>
        </div>
      </div>
      {processedStock.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe Barang</TableHead>
                <TableHead>Merek</TableHead>
                <TableHead className="text-right">Jumlah (Stok)</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Total Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedStock.map((item, index) => {
                const Icon = getItemIcon(item.itemType);
                const brandLogo = getBrandLogo(item.brand);
                const isOutOfStock = item.quantity === 0;
                return (
                  <TableRow key={item.id + '-' + index} className={isOutOfStock ? "opacity-50" : "odd:bg-muted/20"}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        <span>{item.itemType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {brandLogo && <AvatarImage src={brandLogo} alt={item.brand} />}
                            <AvatarFallback>{item.brand.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{item.brand}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        {isOutOfStock ? (
                            <Badge variant="destructive">Stok Habis</Badge>
                        ) : (
                            item.quantity
                        )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.quantity * item.price)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">{selectedWarehouse === "Gudang Sentral" ? "Tidak ada stok di semua gudang." : `Gudang ini kosong.`}</p>
                 {selectedWarehouse !== "Gudang Sentral" && <p className="text-sm text-muted-foreground mt-2">Silahkan tambahkan stok baru melalui tab "Tambah Stok".</p>}
            </div>
        )}
    </div>
  );
}

function ProposalInbox({ proposals, onUpdateProposals }: { proposals: Proposal[], onUpdateProposals: () => void }) {
    const { toast } = useToast();
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);

    const pendingProposals = proposals.filter(p => p.status === 'pending');

    const handleApprove = (proposalId: string) => {
        const currentProposals = getProposals();
        const currentStock = getStock();
        const currentHistory = getHistory();

        const proposalIndex = currentProposals.findIndex(p => p.id === proposalId);
        if (proposalIndex === -1) return;

        const proposal = currentProposals[proposalIndex];

        // 1. Check stock availability in the correct warehouse
        let isStockSufficient = true;
        let insufficientItem = "";
        proposal.items.forEach(reqItem => {
            const stockItem = currentStock.find(s => 
                s.itemType === reqItem.itemType && 
                s.brand === reqItem.brand &&
                s.warehouse === proposal.warehouse
            );
            if (!stockItem || stockItem.quantity < reqItem.quantity) {
                isStockSufficient = false;
                insufficientItem = `${reqItem.itemType} - ${reqItem.brand}`;
            }
        });

        if (!isStockSufficient) {
            toast({
                variant: "destructive",
                title: "Stok Tidak Cukup",
                description: `Stok untuk "${insufficientItem}" di ${proposal.warehouse} tidak mencukupi.`,
            });
            handleReject(proposalId, `Stok tidak mencukupi untuk ${insufficientItem} di ${proposal.warehouse}.`);
            return;
        }

        // 2. Update stock
        proposal.items.forEach(reqItem => {
            const stockItemIndex = currentStock.findIndex(s => 
                s.itemType === reqItem.itemType && 
                s.brand === reqItem.brand &&
                s.warehouse === proposal.warehouse
            );
            if (stockItemIndex > -1) {
                currentStock[stockItemIndex].quantity -= reqItem.quantity;
            }
        });
        updateStock(currentStock);

        // 3. Update proposal status
        proposal.status = 'approved';
        currentProposals[proposalIndex] = proposal;
        updateProposals(currentProposals);

        // 4. Add to history
        const newHistoryEntry: HistoryItem = {
            ...proposal,
            status: "Pengambilan"
        };
        updateHistory([newHistoryEntry, ...currentHistory]);

        toast({
            title: "Usulan Disetujui",
            description: `Permintaan dari ${proposal.employee} telah disetujui dan stok diperbarui.`
        });
        onUpdateProposals();
    };

    const handleReject = (proposalId: string, reason: string) => {
        const currentProposals = getProposals();
        const proposalIndex = currentProposals.findIndex(p => p.id === proposalId);
        if (proposalIndex === -1) return;

        currentProposals[proposalIndex].status = 'rejected';
        currentProposals[proposalIndex].rejectionReason = reason;
        updateProposals(currentProposals);

        toast({
            title: "Usulan Ditolak",
            description: `Permintaan dari ${currentProposals[proposalIndex].employee} telah ditolak.`
        });
        onUpdateProposals();
        setIsRejecting(false);
        setSelectedProposal(null);
        setRejectionReason("");
    };

    const openRejectDialog = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setIsRejecting(true);
    }
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID');

    return (
        <>
            <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tolak Usulan Permintaan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Berikan alasan penolakan untuk permintaan dari <span className="font-bold">{selectedProposal?.employee}</span>. Alasan ini akan terlihat oleh pegawai.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea 
                        placeholder="Contoh: Stok barang yang Anda minta sedang kosong."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRejectionReason("")}>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                            disabled={!rejectionReason}
                            onClick={() => selectedProposal && handleReject(selectedProposal.id, rejectionReason)}
                        >
                            Kirim Alasan & Tolak
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="space-y-4">
                {pendingProposals.length > 0 ? (
                    pendingProposals.map(proposal => (
                        <Card key={proposal.id} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-start bg-muted/50 justify-between p-4">
                                <div className="grid gap-0.5">
                                    <CardTitle className="group flex items-center gap-2 text-lg">
                                        {proposal.employee} 
                                        <span className="font-normal text-sm text-muted-foreground">({proposal.department})</span>
                                    </CardTitle>
                                    <CardDescription>{formatDate(proposal.date)} - <Badge variant="outline">{proposal.warehouse}</Badge></CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button size="sm" variant="outline" onClick={() => openRejectDialog(proposal)}>
                                        Tolak
                                    </Button>
                                    <Button size="sm" onClick={() => handleApprove(proposal.id)}>
                                        Setujui
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <h4 className="font-semibold mb-2">Detail Barang</h4>
                                        <Table>
                                             <TableHeader>
                                                <TableRow>
                                                    <TableHead>Barang</TableHead>
                                                    <TableHead className="text-right">Jumlah</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {proposal.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.itemType} - {item.brand}</TableCell>
                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Dokumentasi</h4>
                                        <Image src={proposal.photoUrl} alt={`Foto ${proposal.employee}`} width={300} height={225} className="rounded-md object-cover w-full" />
                                        <p className="text-xs text-muted-foreground mt-2">Lokasi: {proposal.gps}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Tidak ada usulan permintaan baru.</p>
                    </div>
                )}
            </div>
        </>
    );
}

function WarehouseStaffTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Petugas Gudang</CardTitle>
        <CardDescription>Daftar petugas yang bertanggung jawab atas setiap gudang.</CardDescription>
      </CardHeader>
      <CardContent>
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nama Petugas</TableHead>
                    <TableHead>NIP</TableHead>
                    <TableHead>Gudang Bertugas</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {warehouseStaff.map(staff => {
                    let assignedWarehouse = "";
                     switch (staff.name) {
                        case "Bangun Waizal Karniz, S.Pd.":
                            assignedWarehouse = "Gudang Biro Umum";
                            break;
                        case "Nur Elsahbania, S.E.":
                            assignedWarehouse = "Gudang Sekretaris Jenderal";
                            break;
                        case "Rizka Putri Rumastari, A.Md.Bns.":
                            assignedWarehouse = "Gudang Menteri";
                            break;
                    }
                    return (
                        <TableRow key={staff.nip}>
                            <TableCell className="font-medium">{staff.name}</TableCell>
                            <TableCell>{staff.nip}</TableCell>
                            <TableCell><Badge variant="secondary">{assignedWarehouse}</Badge></TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stock, setStock] = useState<StockItemData[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  const [viewType, setViewType] = useState<"transactions" | "employee-summary" | "department-summary">("transactions");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const [reviewWarehouse, setReviewWarehouse] = useState<string>("Gudang Sentral");
  const [infoSelectedWarehouse, setInfoSelectedWarehouse] = useState<string>(warehouses[0]);
  const [infoSelectedMonth, setInfoSelectedMonth] = useState<string>("all");
  const [infoSelectedYear, setInfoSelectedYear] = useState<string>("all");

  const reviewWarehouses = ["Gudang Sentral", ...warehouses];

  const refreshData = () => {
    setHistory(getHistory());
    setStock(getStock());
    setProposals(getProposals());
  }

  useEffect(() => {
    refreshData();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'requestHistory' || event.key === 'stockItems' || event.key === 'proposals') {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  
  const uniqueYears = ["all", ...Array.from(new Set(history.map(item => new Date(item.date).getFullYear().toString()))).sort((a, b) => parseInt(b) - parseInt(a))];
  const uniqueMonths = ["all", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const monthNames = ["Semua", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const { filteredHistory, employeeSummary, departmentSummary } = useMemo(() => {
        const filtered = history.filter(item => {
            const date = new Date(item.date);
            const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
            const yearMatch = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
            return monthMatch && yearMatch;
        });

        const empSummary: { [key: string]: any } = {};
        const deptSummary: { [key: string]: any } = {};

        filtered.filter(item => item.status === 'Pengambilan').forEach(item => {
            // Employee Summary Logic
            const empKey = `${item.employee}-${item.warehouse}`;
            if (!empSummary[empKey]) {
                empSummary[empKey] = { employee: item.employee, employeeNip: item.employeeNip, department: item.department, warehouse: item.warehouse, items: {} };
            }
            item.items.forEach(takenItem => {
                const itemKey = `${takenItem.itemType}-${takenItem.brand}`;
                if (!empSummary[empKey].items[itemKey]) {
                    empSummary[empKey].items[itemKey] = { ...takenItem, count: 0, lastDate: item.date };
                }
                empSummary[empKey].items[itemKey].quantity += takenItem.quantity;
                if(new Date(item.date) > new Date(empSummary[empKey].items[itemKey].lastDate)) {
                   empSummary[empKey].items[itemKey].lastDate = item.date
                }
            });

            // Department Summary Logic
            if(item.employee !== 'Admin'){
                const deptKey = `${item.department}-${item.warehouse}`;
                if (!deptSummary[deptKey]) {
                    deptSummary[deptKey] = { department: item.department, warehouse: item.warehouse, items: {} };
                }
                item.items.forEach(takenItem => {
                    const itemKey = `${takenItem.itemType}-${takenItem.brand}`;
                    if (!deptSummary[deptKey].items[itemKey]) {
                        deptSummary[deptKey].items[itemKey] = { ...takenItem, quantity: 0, lastDate: item.date };
                    }
                    deptSummary[deptKey].items[itemKey].quantity += takenItem.quantity;
                     if(new Date(item.date) > new Date(deptSummary[deptKey].items[itemKey].lastDate)) {
                        deptSummary[deptKey].items[itemKey].lastDate = item.date
                    }
                });
            }
        });

        return {
            filteredHistory: filtered,
            employeeSummary: Object.values(empSummary).map(s => ({...s, items: Object.values(s.items)})),
            departmentSummary: Object.values(deptSummary).map(s => ({...s, items: Object.values(s.items)}))
        };
    }, [history, selectedMonth, selectedYear]);

  const handleDownloadHistoryExcel = () => {
        let dataToExport: any[] = [];
        let sheetTitle = "";
        let headers: string[] = [];
        let viewName = "";

        const now = new Date();
        const month = selectedMonth === 'all' ? 'Semua_Bulan' : monthNames[parseInt(selectedMonth)].replace(/\s/g, '_');
        const year = selectedYear === 'all' ? 'Semua_Tahun' : selectedYear;

        const title = [
            [`Laporan Riwayat`],
            [`Filter: ${viewType === 'transactions' ? 'Riwayat Transaksi' : viewType === 'employee-summary' ? 'Rekap per Pegawai' : 'Rekap per Bagian'}`],
            [`Periode: ${monthNames[uniqueMonths.indexOf(selectedMonth)]} ${selectedYear === 'all' ? '' : selectedYear}`],
            [`Tanggal Unduh: ${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`]
        ];
        
        switch (viewType) {
            case 'transactions':
                viewName = "Riwayat_Transaksi";
                sheetTitle = "Riwayat Transaksi";
                headers = ["Pegawai/Admin", "NIP", "Bagian", "Gudang", "Status", "Jenis Barang", "Merk", "Jumlah", "Tanggal", "Jam", "Lokasi"];
                filteredHistory.forEach(h => {
                    h.items.forEach(item => {
                        dataToExport.push({
                            "Pegawai/Admin": h.employee,
                            "NIP": h.employeeNip || '',
                            "Bagian": h.department,
                            "Gudang": h.warehouse,
                            "Status": h.status,
                            "Jenis Barang": item.itemType,
                            "Merk": item.brand,
                            "Jumlah": item.quantity,
                            "Tanggal": new Date(h.date).toLocaleDateString('id-ID'),
                            "Jam": new Date(h.date).toLocaleTimeString('id-ID'),
                            "Lokasi": h.gps
                        });
                    });
                });
                break;
            case 'employee-summary':
                 viewName = "Rekap_Pegawai";
                 sheetTitle = "Rekap per Pegawai";
                 headers = ["Pegawai", "NIP", "Bagian", "Gudang", "Jenis Barang", "Merk", "Total Diambil", "Tanggal Terakhir"];
                 employeeSummary.forEach((s: any) => {
                     s.items.forEach((item: any) => {
                         dataToExport.push({
                             "Pegawai": s.employee,
                             "NIP": s.employeeNip || '',
                             "Bagian": s.department,
                             "Gudang": s.warehouse,
                             "Jenis Barang": item.itemType,
                             "Merk": item.brand,
                             "Total Diambil": item.quantity,
                             "Tanggal Terakhir": new Date(item.lastDate).toLocaleDateString('id-ID')
                         });
                     });
                 });
                break;
            case 'department-summary':
                viewName = "Rekap_Bagian";
                sheetTitle = "Rekap per Bagian";
                headers = ["Bagian", "Gudang", "Jenis Barang", "Merk", "Total Diambil", "Tanggal Transaksi Terakhir"];
                 departmentSummary.forEach((s: any) => {
                     s.items.forEach((item: any) => {
                         dataToExport.push({
                             "Bagian": s.department,
                             "Gudang": s.warehouse,
                             "Jenis Barang": item.itemType,
                             "Merk": item.brand,
                             "Total Diambil": item.quantity,
                             "Tanggal Transaksi Terakhir": new Date(item.lastDate).toLocaleDateString('id-ID')
                         });
                     });
                 });
                break;
        }

        if (dataToExport.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Tidak Ada Data',
                description: 'Tidak ada data untuk diekspor dengan filter yang dipilih.',
            });
            return;
        }
        
        const worksheet = XLSX.utils.aoa_to_sheet(title);
        XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: 'A6', skipHeader: true });
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A5' });

        const colWidths = headers.map(h => ({ wch: h.length + 5 > 25 ? h.length + 5 : 25 }));
        worksheet['!cols'] = colWidths;
        
        const workbook = XLSX.utils.book_new();
        const fileName = `${viewName}_${month}_${year}.xlsx`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
        XLSX.writeFile(workbook, fileName);
    };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4">
          <h1 className="font-headline text-3xl font-bold">Dashboard Administrator</h1>
          <Tabs defaultValue="proposals">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="proposals">Kotak Masuk Usulan <Badge className="ml-2">{proposals.filter(p => p.status === 'pending').length}</Badge></TabsTrigger>
              <TabsTrigger value="add">Tambah Stok</TabsTrigger>
              <TabsTrigger value="review">Review Stok</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
              <TabsTrigger value="infographics">Infografis</TabsTrigger>
              <TabsTrigger value="recap">Rekapitulasi</TabsTrigger>
            </TabsList>
            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah Stok Barang Baru</CardTitle>
                  <CardDescription>Masukkan detail barang yang akan ditambahkan ke dalam gudang.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddStockForm onStockAdded={refreshData} stockData={stock} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="review">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div>
                                <CardTitle>Review Stok Barang</CardTitle>
                                <CardDescription>Tinjau ketersediaan dan nilai semua barang di dalam gudang.</CardDescription>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-64">
                                  <Label>Pilih Gudang</Label>
                                  <Select value={reviewWarehouse} onValueChange={setReviewWarehouse}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          {reviewWarehouses.map(wh => <SelectItem key={wh} value={wh}>{wh}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                                </div>
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ReviewStock 
                            stockData={stock} 
                            selectedWarehouse={reviewWarehouse} 
                        />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="proposals">
                 <Card>
                    <CardHeader>
                        <CardTitle>Kotak Masuk Usulan</CardTitle>
                        <CardDescription>Tinjau dan proses usulan permintaan barang dari pegawai.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProposalInbox proposals={proposals} onUpdateProposals={refreshData} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Pengajuan</CardTitle>
                   <div className="flex flex-wrap gap-4 pt-4 items-end">
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <Label htmlFor="view-type">Tipe Tampilan</Label>
                        <Select value={viewType} onValueChange={(value) => setViewType(value as any)}>
                            <SelectTrigger id="view-type"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="transactions">Riwayat Transaksi</SelectItem>
                                <SelectItem value="employee-summary">Rekap Pengambilan per Pegawai</SelectItem>
                                <SelectItem value="department-summary">Rekap Pengambilan per Bagian</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 min-w-[150px] space-y-2">
                         <Label htmlFor="month-filter">Filter Bulan</Label>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger id="month-filter"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {uniqueMonths.map((month, index) => (
                                    <SelectItem key={month} value={month}>{monthNames[index]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>
                       <div className="flex-1 min-w-[150px] space-y-2">
                         <Label htmlFor="year-filter">Filter Tahun</Label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger id="year-filter"><SelectValue /></SelectTrigger>
                            <SelectContent>
                               {uniqueYears.map(year => (
                                    <SelectItem key={year} value={year}>{year === 'all' ? 'Semua Tahun' : year}</SelectItem>
                               ))}
                            </SelectContent>
                        </Select>
                      </div>
                       <div className="flex-shrink-0">
                         <Button onClick={handleDownloadHistoryExcel} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Unduh Excel
                        </Button>
                      </div>
                   </div>
                </CardHeader>
                <CardContent>
                  <RequestHistory 
                    history={filteredHistory} 
                    viewType={viewType}
                    employeeSummary={employeeSummary}
                    departmentSummary={departmentSummary}
                  />
                </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="infographics">
                 <Card>
                    <CardHeader>
                       <CardTitle>Infografis Gudang</CardTitle>
                       <CardDescription>Visualisasi data untuk analisis stok dan pengambilan barang.</CardDescription>
                       <div className="flex flex-wrap gap-4 pt-4">
                           <div className="flex-1 min-w-[200px] space-y-2">
                                <Label>Pilih Gudang</Label>
                                <Select value={infoSelectedWarehouse} onValueChange={setInfoSelectedWarehouse}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(wh => <SelectItem key={wh} value={wh}>{wh}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                          <div className="flex-1 min-w-[150px] space-y-2">
                             <Label htmlFor="info-month-filter">Filter Bulan</Label>
                            <Select value={infoSelectedMonth} onValueChange={setInfoSelectedMonth}>
                                <SelectTrigger id="info-month-filter"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {uniqueMonths.map((month, index) => (
                                        <SelectItem key={month} value={month}>{monthNames[index]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                          </div>
                           <div className="flex-1 min-w-[150px] space-y-2">
                             <Label htmlFor="info-year-filter">Filter Tahun</Label>
                            <Select value={infoSelectedYear} onValueChange={setInfoSelectedYear}>
                                <SelectTrigger id="info-year-filter"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                   {uniqueYears.map(year => (
                                        <SelectItem key={year} value={year}>{year === 'all' ? 'Semua Tahun' : year}</SelectItem>
                                   ))}
                                </SelectContent>
                            </Select>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent>
                        <InfographicsTab 
                            history={history} 
                            proposals={proposals}
                            selectedWarehouse={infoSelectedWarehouse}
                            selectedMonth={infoSelectedMonth} 
                            selectedYear={infoSelectedYear} 
                        />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="recap">
              <Card>
                <CardHeader>
                  <CardTitle>Rekapitulasi Kartu Stok</CardTitle>
                  <CardDescription>
                    Lacak riwayat pergerakan setiap barang (stok awal, masuk, keluar) berdasarkan periode waktu.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecapTab 
                    historyData={history}
                    stockData={stock}
                    uniqueMonths={uniqueMonths}
                    monthNames={monthNames}
                    uniqueYears={uniqueYears}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="text-center text-xs text-muted-foreground p-4">
        Tata Usaha Biro, Biro Umum, Sekretariat Jenderal, Kementerian Ketenagakerjaan © 2025
      </footer>
    </div>
  );
}

    