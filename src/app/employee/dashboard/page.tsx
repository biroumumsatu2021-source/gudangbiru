
"use client";

import { useState, useEffect, useRef, useId, useMemo } from "react";
import AppHeader from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Camera, MapPin, CalendarDays, Loader2, PlusCircle, Trash2, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAddressFromCoordinates } from "@/lib/actions";
import { brands, unitKerja, bidangSubbagian, employeesByBidang, stockItems as initialStockData, itemTypes, type Employee, type Coordinator, coordinators, warehouses } from "@/lib/data";
import type { StockItem as StockItemData, Proposal } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type Location = {
  latitude: number;
  longitude: number;
} | null;

type RequestedItem = {
    id: string;
    itemType: string;
    brand: string;
    quantity: number;
};

// Helper functions for localStorage
const getFromLocalStorage = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) || (parsed !== null && typeof parsed === 'object')) return parsed;
        if (key === 'employeeName' && typeof parsed === 'string') return parsed;
        return fallback;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
        return fallback;
    }
}

const updateLocalStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
        const value = typeof data === 'string' ? data : JSON.stringify(data);
        localStorage.setItem(key, value);
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
    }
}

const getStock = (): StockItemData[] => getFromLocalStorage('stockItems', initialStockData) || [];

const getProposals = (): Proposal[] => getFromLocalStorage('proposals', []) || [];
const updateProposals = (newProposals: Proposal[]) => updateLocalStorage('proposals', newProposals);



function RequestForm({ onProposalSubmitted, stockData }: { onProposalSubmitted: () => void, stockData: StockItemData[] }) {
  const { toast } = useToast();
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [selectedBidang, setSelectedBidang] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const formId = useId();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  
  const [requestedItems, setRequestedItems] = useState<RequestedItem[]>([
    { id: `${formId}-0`, itemType: "", brand: "", quantity: 1 },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<Location>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<Date | null>(null);

  // Form step validation
  const isPemohonComplete = !!(selectedUnitKerja && selectedBidang && employeeName && selectedWarehouse);
  const isPermintaanComplete = requestedItems.every(item => item.itemType && item.brand && item.quantity > 0);
  const isFormComplete = isPemohonComplete && isPermintaanComplete && !!capturedImage;

  const stockInSelectedWarehouse = useMemo(() => {
    return stockData.filter(item => item.warehouse === selectedWarehouse);
  }, [stockData, selectedWarehouse]);


  // Get unique item types from current stock for the dropdown
  // If no stock data exists, use the default item types as fallback
  const availableItemTypes = stockInSelectedWarehouse.length > 0 
    ? Array.from(new Set(stockInSelectedWarehouse.map(item => item.itemType)))
        .map(type => ({ name: type }))
    : initialStockData.length > 0 
      ? Array.from(new Set(initialStockData.map(item => item.itemType)))
        .map(type => ({ name: type }))
      : itemTypes.map(it => ({ name: it.name }));

  // Get available brands for a selected item type from stock
  // If no stock exists, return empty array or brands from initial data
  const getBrandsForItemType = (itemType: string) => {
      const brandsFromCurrentStock = Array.from(new Set(stockInSelectedWarehouse
          .filter(item => item.itemType === itemType && item.quantity > 0)
          .map(item => item.brand)
      ));
      
      // If no brands found in current stock and it's an existing item type, try to get from initial stock
      if (brandsFromCurrentStock.length === 0) {
          const brandsFromInitialStock = Array.from(new Set(initialStockData
              .filter(item => item.itemType === itemType && item.quantity > 0)
              .map(item => item.brand)
          ));
          
          // If still no brands and the item type exists in default itemTypes, we can provide a fallback
          if (brandsFromInitialStock.length === 0) {
              // Return brands that are typically associated with this item type, if any
              const defaultBrands = Array.from(new Set(stockData
                  .filter(item => item.itemType === itemType)
                  .map(item => item.brand)
              ));
              return defaultBrands.length > 0 ? defaultBrands : [];
          }
          return brandsFromInitialStock;
      }
      return brandsFromCurrentStock;
  };


  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
      getLocation();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraOpen]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        variant: "destructive",
        title: "Kamera Error",
        description: "Tidak dapat mengakses kamera. Mohon izinkan akses kamera di browser Anda.",
      });
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    setIsFetchingAddress(true);
    setAddress(null);
    const result = await getAddressFromCoordinates({ latitude, longitude });
    if (result.success && result.address) {
      setAddress(result.address);
    } else {
      setAddress("Tidak dapat menemukan alamat.");
    }
    setIsFetchingAddress(false);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          fetchAddress(newLocation.latitude, newLocation.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Gagal mendapatkan lokasi. Pastikan GPS aktif dan diizinkan.");
        }
      );
    } else {
      setLocationError("Geolocation tidak didukung oleh browser ini.");
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
      setCapturedImage(canvas.toDataURL('image/jpeg'));
      setTimestamp(new Date());
      setIsCameraOpen(false);
    }
  };
  
  const handleItemChange = (id: string, field: keyof Omit<RequestedItem, 'id'>, value: string | number) => {
      setRequestedItems(prev => prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
           if (field === 'itemType') {
                updatedItem.brand = "";
            }
          return updatedItem;
        }
        return item;
      }));
  };

  const addNewItem = () => {
      setRequestedItems(prev => [...prev, { id: `${formId}-${prev.length}`, itemType: "", brand: "", quantity: 1 }]);
  };
  
  const removeItem = (id: string) => {
      setRequestedItems(prev => prev.filter(item => item.id !== id));
  };
  
  const resetForm = () => {
    setSelectedUnitKerja("");
    setSelectedBidang("");
    setEmployeeName("");
    setSelectedWarehouse("");
    setRequestedItems([{ id: `${formId}-0`, itemType: "", brand: "", quantity: 1 }]);
    setCapturedImage(null);
    setLocation(null);
    setAddress(null);
    setTimestamp(null);
  }

    const handleEmployeeChange = (name: string) => {
        setEmployeeName(name);
        if (typeof window !== 'undefined') {
            localStorage.setItem('employeeName', name);
             window.dispatchEvent(new StorageEvent('storage', { key: 'employeeName', newValue: name }));
        }
    };


  const handleSubmit = async () => {
    setIsLoading(true);
    
    if (!isFormComplete || !capturedImage || !timestamp || !address) {
        toast({
            variant: "destructive",
            title: "Data Tidak Lengkap",
            description: "Mohon lengkapi semua data sebelum mengajukan usulan.",
        });
        setIsLoading(false);
        return;
    }
    
    const selectedEmployee = (employeesByBidang[selectedBidang as keyof typeof employeesByBidang] || []).find(emp => emp.name === employeeName);

    // Create a new proposal
    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      employee: employeeName,
      employeeNip: selectedEmployee?.nip,
      department: selectedBidang,
      warehouse: selectedWarehouse,
      items: requestedItems.map(({id, ...rest}) => rest), // remove temporary id
      date: timestamp.toISOString(),
      status: "pending",
      photoUrl: capturedImage,
      gps: address
    }

    const currentProposals = getProposals();
    updateProposals([newProposal, ...currentProposals]);
    
    onProposalSubmitted();

    setIsLoading(false);
    toast({
      title: "Sukses",
      description: "Usulan permintaan berhasil diajukan. Mohon tunggu persetujuan dari admin.",
    });

    resetForm();
  };
  
  const showIncompleteDataToast = (message: string) => {
    toast({
      variant: "destructive",
      title: "Data Tidak Lengkap",
      description: message,
    });
  }

  const getCoordinator = (): Coordinator => {
    return coordinators[selectedBidang] 
      || coordinators[selectedUnitKerja] 
      || coordinators['default'];
  }

  return (
     <>
     <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Pemohon</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unit Kerja</Label>
              <Select value={selectedUnitKerja} onValueChange={setSelectedUnitKerja}>
                <SelectTrigger><SelectValue placeholder="Pilih Unit Kerja" /></SelectTrigger>
                <SelectContent>
                  {unitKerja.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bidang/Subbagian</Label>
              <Select value={selectedBidang} onValueChange={setSelectedBidang} disabled={!selectedUnitKerja}>
                <SelectTrigger><SelectValue placeholder="Pilih Bidang/Subbagian" /></SelectTrigger>
                <SelectContent>
                  {(bidangSubbagian[selectedUnitKerja as keyof typeof bidangSubbagian] || []).map(bidang => <SelectItem key={bidang} value={bidang}>{bidang}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nama Pegawai</Label>
               <Select value={employeeName} onValueChange={handleEmployeeChange} disabled={!selectedBidang}>
                    <SelectTrigger><SelectValue placeholder="Pilih Nama Pegawai" /></SelectTrigger>
                    <SelectContent>
                      {(employeesByBidang[selectedBidang as keyof typeof employeesByBidang] || []).map(emp => (
                          <SelectItem key={emp.nip} value={emp.name}>
                              <div className="flex flex-col">
                                  <span>{emp.name}</span>
                                  <span className="text-xs text-muted-foreground">{emp.nip}</span>
                              </div>
                          </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label>Sumber Gudang</Label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse} disabled={!employeeName}>
                    <SelectTrigger><SelectValue placeholder="Pilih Gudang" /></SelectTrigger>
                    <SelectContent>
                    {warehouses.map(wh => <SelectItem key={wh} value={wh}>{wh}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        <div className="relative">
             {!isPemohonComplete && (
                <div 
                    className="absolute inset-0 z-10 bg-black/10 dark:bg-white/5 cursor-not-allowed"
                    onClick={() => showIncompleteDataToast("Silahkan isi data pemohon dan pilih gudang.")}
                />
            )}
            <Card className={cn(!isPemohonComplete && "opacity-50")}>
                <CardHeader>
                    <CardTitle>Detail Permintaan Barang</CardTitle>
                    {!isPemohonComplete && <CardDescription>Lengkapi "Data Pemohon" dan pilih "Sumber Gudang" untuk melanjutkan.</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                    {requestedItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end p-2 border rounded-lg animate-in fade-in-30">
                            <div className="space-y-1">
                                <Label htmlFor={`itemType-${item.id}`}>Tipe Barang</Label>
                                <Select value={item.itemType} onValueChange={(value) => handleItemChange(item.id, 'itemType', value)}>
                                    <SelectTrigger id={`itemType-${item.id}`}><SelectValue placeholder="Pilih Tipe"/></SelectTrigger>
                                    <SelectContent>
                                        {availableItemTypes.map(it => <SelectItem key={it.name} value={it.name}>{it.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`brand-${item.id}`}>Merek</Label>
                                <Select value={item.brand} onValueChange={(value) => handleItemChange(item.id, 'brand', value)} disabled={!item.itemType}>
                                    <SelectTrigger id={`brand-${item.id}`}><SelectValue placeholder="Pilih Merek"/></SelectTrigger>
                                    <SelectContent>
                                        {getBrandsForItemType(item.itemType).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`quantity-${item.id}`}>Jumlah</Label>
                                <Input id={`quantity-${item.id}`} type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10))} min="1" className="w-20" />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={requestedItems.length <= 1} aria-label="Hapus item">
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={addNewItem}><PlusCircle className="mr-2 h-4 w-4"/> Tambah Barang</Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="relative">
            {(!isPemohonComplete || !isPermintaanComplete) && (
                 <div 
                    className="absolute inset-0 z-10 bg-black/10 dark:bg-white/5 cursor-not-allowed"
                    onClick={() => {
                        if (!isPemohonComplete) {
                            showIncompleteDataToast("Silahkan isi data pemohon.");
                        } else {
                            showIncompleteDataToast("Silahkan isi detail permintaan barang.");
                        }
                    }}
                />
            )}
            <Card className={cn((!isPemohonComplete || !isPermintaanComplete) && "opacity-50")}>
                <CardHeader>
                    <CardTitle>Dokumentasi</CardTitle>
                    <CardDescription>Ambil foto selfie sebagai bukti. Foto akan dilengkapi dengan waktu dan alamat secara otomatis.</CardDescription>
                    {isPemohonComplete && !isPermintaanComplete && <CardDescription className="text-destructive">Lengkapi "Detail Permintaan Barang" untuk melanjutkan.</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                    <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline"><Camera className="mr-2 h-4 w-4" /> Ambil Foto</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader><DialogTitle>Kamera</DialogTitle></DialogHeader>
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-md -scale-x-100"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <DialogFooter>
                        <Button onClick={handleCapture}>Ambil Gambar</Button>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>

                    {capturedImage && (
                    <div className="grid md:grid-cols-2 gap-4 rounded-lg border p-4 animate-in fade-in-50">
                        <Image src={capturedImage} alt="Captured" width={300} height={200} className="rounded-md object-cover" />
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                                <p><strong>Waktu:</strong> {timestamp?.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5"/>
                                <div>
                                    <strong>Lokasi:</strong>
                                    {isFetchingAddress && " Mencari alamat..."}
                                    {address && ` ${address}`}
                                    {locationError && ` ${locationError}`}
                                    {!isFetchingAddress && !address && !locationError && " Mendapatkan lokasi..."}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button disabled={isLoading || !isFormComplete} size="lg" className="flex-1">
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Mengajukan...</> : "Ajukan Permintaan"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Pengajuan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda sudah yakin dengan data pengajuan barang Anda? Usulan ini akan dikirim ke admin untuk persetujuan.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 my-4">
                        <h4 className="font-semibold">Ringkasan Permintaan:</h4>
                        <div className="rounded-md border max-h-40 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Barang</TableHead>
                                        <TableHead className="text-right">Jumlah</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requestedItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.itemType} - {item.brand}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                         <div className="text-sm">
                            <span className="font-semibold">Gudang:</span> {selectedWarehouse}
                        </div>
                        <h4 className="font-semibold">Foto Bukti:</h4>
                        {capturedImage && (
                            <Image src={capturedImage} alt="Bukti Foto" width={200} height={150} className="rounded-md object-cover mx-auto" />
                        )}
                    </div>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Mengajukan...</> : "Yakin & Ajukan"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    </>
  );
}

function ReviewStock({ stockData }: { stockData: StockItemData[] }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses[0]);

  const getItemIcon = (itemTypeName: string) => {
    const itemType = itemTypes.find(it => it.name === itemTypeName);
    return itemType ? itemType.icon : null;
  }
  
  const getBrandLogo = (brandName: string) => {
    const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
    return brand?.logoUrl;
  }
  
  const filteredStock = stockData.filter(item => item.warehouse === selectedWarehouse);

  return (
    <div>
        <div className="mb-4">
            <Label>Pilih Gudang</Label>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {warehouses.map(wh => <SelectItem key={wh} value={wh}>{wh}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
       {filteredStock.length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipe Barang</TableHead>
            <TableHead>Merek</TableHead>
            <TableHead className="text-right">Jumlah (Stok)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStock.map((item) => {
             const Icon = getItemIcon(item.itemType);
             const brandLogo = getBrandLogo(item.brand);
             const isOutOfStock = item.quantity === 0;
             return (
              <TableRow key={item.id} className={isOutOfStock ? "opacity-50" : "odd:bg-muted/20 hover:bg-muted/50"}>
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
              </TableRow>
             );
          })}
        </TableBody>
      </Table>
        ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Gudang ini kosong.</p>
             </div>
        )}
    </div>
  );
}

function ProposalTracker({ proposals }: { proposals: Proposal[] }) {
    const [currentUser, setCurrentUser] = useState<string | null>(null);

     useEffect(() => {
        const name = localStorage.getItem('employeeName');
        setCurrentUser(name);

        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'employeeName') {
                setCurrentUser(event.newValue);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const userProposals = useMemo(() => {
        if (!currentUser) return [];
        return proposals.filter(p => p.employee === currentUser).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [proposals, currentUser]);

    const getStatusBadge = (status: Proposal['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Menunggu</Badge>;
            case 'approved':
                return <Badge className="bg-green-600 text-white">Disetujui</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Ditolak</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    }
    
    const getItemIcon = (itemTypeName: string) => {
        const itemType = itemTypes.find(it => it.name === itemTypeName);
        return itemType ? itemType.icon : null;
    }

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID');

    return (
         <div>
            {userProposals.length > 0 ? (
                <div className="space-y-4">
                    {userProposals.map(proposal => (
                        <Card key={proposal.id} className="overflow-hidden">
                             <CardHeader className="flex flex-row items-start bg-muted/50 justify-between p-4">
                                <div className="grid gap-1.5">
                                    <CardTitle className="text-base font-semibold">{proposal.employee}</CardTitle>
                                    <CardDescription className="text-xs">
                                        {proposal.employeeNip && <>{proposal.employeeNip} &bull; </>}
                                        {proposal.department}
                                    </CardDescription>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-sm">{formatDate(proposal.date)}</span>
                                        <Badge variant="outline">{proposal.warehouse}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(proposal.status)}
                                </div>
                            </CardHeader>
                             <CardContent className="p-4 text-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Barang</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {proposal.items.map((item, index) => {
                                        const Icon = getItemIcon(item.itemType);
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                                        <span>{item.itemType} - {item.brand}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    </TableBody>
                                </Table>
                                {proposal.status === 'rejected' && proposal.rejectionReason && (
                                     <div className="mt-4 rounded-md border border-destructive bg-destructive/20 p-3 dark:bg-destructive/30">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-destructive">Alasan Penolakan</h4>
                                                <p className="text-sm text-destructive/90 dark:text-destructive-foreground">{proposal.rejectionReason}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Anda belum pernah mengajukan usulan.</p>
                     { !currentUser && <p className="text-sm mt-1">Silahkan pilih nama Anda di form "Ajukan Permintaan" terlebih dahulu.</p>}
                </div>
            )}
        </div>
    )
}

export default function EmployeeDashboardPage() {
  const [stock, setStock] = useState<StockItemData[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);


  const refreshData = () => {
    setStock(getStock());
    setProposals(getProposals());
  }

  useEffect(() => {
    refreshData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'stockItems' || event.key === 'proposals' || event.key === 'employeeName') {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto grid max-w-4xl gap-6">
          <h1 className="font-headline text-3xl font-bold">Dasbor Pegawai</h1>
           <Tabs defaultValue="request">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="request">Ajukan Permintaan</TabsTrigger>
              <TabsTrigger value="proposals">Pantau Usulan</TabsTrigger>
              <TabsTrigger value="review">Review Stok</TabsTrigger>
            </TabsList>
            <TabsContent value="request">
                <RequestForm onProposalSubmitted={refreshData} stockData={stock} />
            </TabsContent>
             <TabsContent value="proposals">
                <Card>
                    <CardHeader>
                        <CardTitle>Pantau Usulan Permintaan</CardTitle>
                        <CardDescription>Lacak status semua usulan permintaan barang yang telah Anda ajukan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProposalTracker proposals={proposals} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="review">
                 <Card>
                    <CardHeader>
                        <CardTitle>Review Stok Barang</CardTitle>
                        <CardDescription>Tinjau ketersediaan semua barang di dalam gudang.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReviewStock stockData={stock} />
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


    

    

