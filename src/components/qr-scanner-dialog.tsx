
"use client";

import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode, type Html5QrcodeResult, type QrCodeError } from 'html5-qrcode';

interface QrScannerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScanSuccess: (data: any) => void;
}

export default function QrScannerDialog({ open, onOpenChange, onScanSuccess }: QrScannerDialogProps) {
    const { toast } = useToast();
    // scannerRef tidak lagi dibutuhkan karena kita akan mengelola instance di dalam useEffect
    const scannerRegionId = "qr-scanner-region";

    useEffect(() => {
        if (!open) {
            return;
        }

        const html5QrCode = new Html5Qrcode(scannerRegionId, /* verbose= */ false);

        const qrCodeSuccessCallback = (decodedText: string, result: Html5QrcodeResult) => {
            try {
                const data = JSON.parse(decodedText);
                if (data.itemType && data.brand) {
                    onScanSuccess(data);
                    toast({ title: "Scan Berhasil", description: `Barang ${data.itemType} - ${data.brand} ditambahkan.` });
                } else {
                    throw new Error("Invalid QR code data format.");
                }
            } catch (error) {
                console.error("Failed to parse QR code", error);
                toast({ variant: "destructive", title: "Scan Gagal", description: "Format kode QR tidak valid." });
            } finally {
                onOpenChange(false);
            }
        };

        const qrCodeErrorCallback = (errorMessage: string, error: QrCodeError) => {
            // Abaikan galat umum yang sering terjadi saat kamera mencari QR code
            if (errorMessage.includes('NotFoundException') || errorMessage.includes('QrCodeParseException')) {
                // Tidak melakukan apa-apa untuk galat ini
            } else {
                 console.error(`QR Code error: ${errorMessage}`, error);
            }
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // Memulai pemindai
        html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, qrCodeErrorCallback)
            .catch(err => {
                console.error("Unable to start scanning.", err);
                toast({ variant: "destructive", title: "Kamera Error", description: "Tidak dapat memulai pemindai QR. Mohon izinkan akses kamera." });
                onOpenChange(false);
            });

        // Fungsi cleanup untuk menghentikan pemindai saat komponen unmount atau dialog ditutup
        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop()
                    .then(() => console.log("QR Code scanning stopped."))
                    .catch(err => console.error("Failed to stop scanner neatly", err));
            }
        };
    }, [open, onOpenChange, onScanSuccess, toast]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pindai Kode QR Barang</DialogTitle>
                    <DialogDescription>Arahkan kamera ke kode QR yang tertempel pada barang di gudang.</DialogDescription>
                </DialogHeader>
                {/* Pastikan div ini selalu ada, bahkan saat kamera tidak aktif */}
                <div id={scannerRegionId} className="w-full aspect-square"></div>
            </DialogContent>
        </Dialog>
    );
}
