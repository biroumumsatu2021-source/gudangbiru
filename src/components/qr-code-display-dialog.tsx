
"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from 'qrcode.react';

export interface QrCodeInfo {
    id: string;
    itemType: string;
    brand: string;
}

interface QrCodeDisplayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    qrInfo: QrCodeInfo;
}

export function QrCodeDisplayDialog({ open, onOpenChange, qrInfo }: QrCodeDisplayDialogProps) {
    
    const qrValue = JSON.stringify({
        id: qrInfo.id,
        itemType: qrInfo.itemType,
        brand: qrInfo.brand,
    });
    
    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=400,width=400');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print QR Code</title>');
            printWindow.document.write('<style>body { text-align: center; font-family: sans-serif; }</style>');
            printWindow.document.write('</head><body>');
            const svgElement = document.getElementById('qr-code-svg');
            if (svgElement) {
                printWindow.document.write(svgElement.outerHTML);
            }
            printWindow.document.write(`<p>ID: ${qrInfo.id}</p>`);
            printWindow.document.write(`<p>${qrInfo.itemType} - ${qrInfo.brand}</p>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>QR Code Barang</DialogTitle>
                    <DialogDescription>
                        Cetak dan tempelkan QR code ini pada barang yang bersangkutan di gudang.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center gap-4 py-4">
                    <QRCodeSVG id="qr-code-svg" value={qrValue} size={256} includeMargin={true} />
                    <div className="text-center text-sm text-muted-foreground">
                        <p className="font-semibold">{qrInfo.itemType} - {qrInfo.brand}</p>
                        <p className="font-mono text-xs">ID: {qrInfo.id}</p>
                    </div>
                </div>
                <DialogFooter className="sm:justify-end">
                     <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    <Button type="button" onClick={handlePrint}>
                        Cetak
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

