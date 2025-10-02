
'use client';

import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { Coordinator } from "@/lib/data";
import Image from "next/image";

type PrintableItem = {
    id: string;
    itemType: string;
    brand: string;
    quantity: number;
    unit: string;
};

type PrintableRequestFormProps = {
    department: string;
    unitKerja: string;
    items: PrintableItem[];
    coordinator: Coordinator;
};

export function PrintableRequestForm({ department, unitKerja, items, coordinator }: PrintableRequestFormProps) {
    const today = new Date();
    
    const nomor = "B.         /1301/RTP.TU/         /2024";
    const uakpb = "Sekretariat Jenderal Kemnaker";
    const year = today.getFullYear();
    const date = format(today, "d MMMM yyyy", { locale: id });

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black p-10 text-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <header className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-4">
                    <Image 
                        src="https://upload.wikimedia.org/wikipedia/commons/9/98/Logo_Kementerian_Ketenagakerjaan_%282016%29.png" 
                        alt="Logo Kemenaker" 
                        width={70} 
                        height={70} 
                        unoptimized
                    />
                </div>
                <div className="text-center -ml-20">
                    <p className="font-bold text-base">KEMENTERIAN KETENAGAKERJAAN REPUBLIK INDONESIA</p>
                    <p className="font-bold text-base">SEKRETARIAT JENDERAL</p>
                </div>
                 <div className="w-[70px]"></div>
            </header>
             <div className="w-full h-px bg-black mb-1"></div>
             <div className="w-full h-0.5 bg-black mb-6"></div>


            <div className="text-center mb-6">
                <h1 className="font-bold text-base underline">PERMINTAAN BARANG PERSEDIAAN DI GUDANG</h1>
                <p className="font-bold text-base">TAHUN ANGGARAN {year}</p>
            </div>

            <table className="w-1/2 mb-6 text-sm">
                <tbody>
                    <tr><td className="w-1/3">Nomor</td><td>: {nomor}</td></tr>
                    <tr><td>Tanggal</td><td>: {date}</td></tr>
                    <tr><td>UAKPB</td><td>: {uakpb}</td></tr>
                    <tr><td>Unit Kerja</td><td>: {unitKerja || "Biro Umum"}</td></tr>
                    <tr><td className="align-top">Bidang/Subbagian</td><td className="align-top">: {department || ""}</td></tr>
                </tbody>
            </table>

            <table className="w-full border-collapse border border-black text-center mb-6 text-sm">
                <thead className="bg-gray-200 font-bold">
                    <tr>
                        <th className="border border-black p-1 w-[5%]">NO</th>
                        <th className="border border-black p-1 w-[60%]">JENIS DAN URAIAN BARANG</th>
                        <th className="border border-black p-1 w-[15%]">JUMLAH</th>
                        <th className="border border-black p-1 w-[20%]">SATUAN</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id}>
                            <td className="border border-black p-1">{index + 1}.</td>
                            <td className="border border-black p-1 text-left">{item.brand ? `${item.itemType} ${item.brand}` : item.itemType}</td>
                            <td className="border border-black p-1">{item.quantity}</td>
                            <td className="border border-black p-1">{item.unit || "BUAH"}</td>
                        </tr>
                    ))}
                    {/* Add empty rows to fill up the table a bit */}
                    {Array.from({ length: Math.max(0, 15 - items.length) }).map((_, index) => (
                        <tr key={`empty-${index}`}>
                            <td className="border border-black p-1 h-6"></td>
                            <td className="border border-black p-1 h-6"></td>
                            <td className="border border-black p-1 h-6"></td>
                            <td className="border border-black p-1 h-6"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
             <div className="flex justify-between mt-8 text-sm">
                 <div className="w-2/5 text-center">
                    <p>Pemberi barang,</p>
                    <p className="mb-20">&nbsp;</p>
                    <p className="font-bold underline">(.......................................)</p>
                    <p>NIP. .......................................</p>
                </div>
                <div className="w-2/5 text-center">
                    <p>Penerima barang,</p>
                    <p className="mb-20">&nbsp;</p>
                    <p className="font-bold underline">(.......................................)</p>
                    <p>NIP. .......................................</p>
                </div>
            </div>

            <div className="flex justify-center mt-8 text-sm">
                <div className="w-2/5 text-center">
                    <p>Mengetahui,</p>
                    <p>{coordinator.status}</p>
                    <p className="mb-20">&nbsp;</p>
                    <p className="font-bold underline">{coordinator.name}</p>
                    <p>NIP. {coordinator.nip}</p>
                </div>
            </div>

            <footer className="absolute bottom-10 left-10 right-10 text-gray-600 text-[10px]">
                <p><span className="font-bold">Catatan:</span> Formulir ini disusun dengan mengadopsi ketentuan pada Permenaker nomor 15 tahun 2019 tentang Pedoman Penatausahaan Persediaan di Kementerian Ketenagakerjaan.</p>
            </footer>
        </div>
    );
}
