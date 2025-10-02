
import { type LucideIcon, Package, FileText, Scissors, Battery, StickyNote, Pen, Pencil, Eraser, Paperclip, Ruler, Folder, Usb, FileType2 } from "lucide-react";

export const warehouses = [
    "Gudang Biro Umum",
    "Gudang Sekretaris Jenderal",
    "Gudang Menteri",
];

export const unitKerja = [
    "Kepala Biro Umum",
    "RT & Perlengkapan",
    "TU",
    "PBJ",
    "Arsiparis dan Persuratan"
];

export const bidangSubbagian: { [key: string]: string[] } = {
    "Kepala Biro Umum": [
        "Kepala Biro Umum"
    ],
    "RT & Perlengkapan": [
        "Kepala bagian RT & Perlengkapan",
        "Klinik",
        "Perlengkapan",
        "Rumah Tangga",
    ],
    "TU": [
        "Kepala Bagian TU",
        "Kasubbag Protokol",
        "Kasubbag TU Biro",
        "Kasubbag TU Menteri",
        "Kasubbag TU Setjen",
        "Protokol",
        "TU Biro",
        "TU Menteri",
        "TU Setjen"
    ],
    "PBJ": [
        "Kepala Bagian PBJ",
        "PBJ"
    ],
    "Arsiparis dan Persuratan": [
        "Arsiparis dan Persuratan"
    ]
};

export type Employee = {
    nip: string;
    name: string;
};

export const employeesByBidang: { [key: string]: Employee[] } = {
    "Kepala Biro Umum": [
        { nip: "197509082006042003", name: "Tuti Haryanti, S.T., M.Si." }
    ],
    "Kepala bagian RT & Perlengkapan": [
        { nip: "197904302011011012", name: "Luthfi Firdaus, S.E., M.M." }
    ],
    "Klinik": [
        { nip: "197712222008032002", name: "dr. Asthi Aryanti" },
        { nip: "198607142011012019", name: "Wa Ode Siti Fatimah, S.Farm, Apt." },
        { nip: "196902031999032001", name: "drg. Ratna Purnamasari" },
        { nip: "197703122006042020", name: "drg. Lia Irawati" },
        { nip: "197801082008122001", name: "Silvija Tupulapan, S.S.T." },
        { nip: "198203052009122001", name: "Hot Intan Ida Daomara" },
        { nip: "199906282025052004", name: "Ayu Pertiwi, S.Kep" },
        { nip: "199602242025052001", name: "Maria Ines Prasetya Ruma, A.Md.Farm." },
        { nip: "198312172024212009", name: "dr.. DESI ELVINO SIHOMBING" },
        { nip: "198711222024211009", name: "dr.. DEMMY NOVANDRY SUCIPTO PUTERA" },
        { nip: "198906302024211007", name: "Ns. RIMAL FIRDAUS ERANI, S.Kep" },
        { nip: "199511072024212027", name: "Apt.. MAHDIANA SITI FAHLANI, S.Farm." },
        { nip: "199704242024212030", name: "ELSA WIDI YASTUTI, A.Md.Kep." },
        { nip: "198812172025211012", name: "Muhamad Guntur Muhidin, ST" },
        { nip: "199709112025211009", name: "Wesnu Nafika Mukti" },
        { nip: "198008082024212017", name: "FITRIANA PUSPASARI, AMK." }
    ],
    "Perlengkapan": [
        { nip: "198904232020122020", name: "Anggraeni Puspitawati, A.Md.Far." },
        { nip: "197508061999031001", name: "Herry Susanto, S.E." },
        { nip: "197605071996031002", name: "Parno" },
        { nip: "198108092009122003", name: "Fitri Sugiarti, S.E." },
        { nip: "199606052025052004", name: "Ririn Anviani, S.Kom" },
        { nip: "199504022023111013", name: "Jaya Fradana Basunanda, A.Md." },
        { nip: "198508012024211011", name: "AGUSTAV SETHIO CAESARIA, S.E." },
        { nip: "199006232025212018", name: "Anie Junita, S.H." },
        { nip: "196711272025211005", name: "Suluh Rahmanto, S.E." }
    ],
    "Rumah Tangga": [
        { nip: "199008072019021005", name: "Moch. Lazuardi Ichsan Maruf, A.Md." },
        { nip: "196801211988031003", name: "Samadi" },
        { nip: "196908221998031002", name: "Yusuf" },
        { nip: "197003301996031001", name: "Suryantono" },
        { nip: "197009131999031001", name: "Budi Santoso" },
        { nip: "197010281998031002", name: "Joko Saputra" },
        { nip: "197209131998031003", name: "Ahmad Faruk" },
        { nip: "197211211999031001", name: "Muhamad Yunus" },
        { nip: "197503161998031003", name: "Suyahman" },
        { nip: "197610131999031002", name: "Aris Setiawan" },
        { nip: "197704251999031002", name: "Fajar Setiawan, S.E., M.M." },
        { nip: "197708261999031003", name: "Edi Junaedi Ismail, S.E." },
        { nip: "197808051999031002", name: "Tujino" },
        { nip: "197811061999031001", name: "Ade Supriadi" },
        { nip: "199105242025051001", name: "Jumaidi Pramalinto, S.S." },
        { nip: "199709032025051002", name: "Saptiadi, S.Tr.T." },
        { nip: "199506102025052004", name: "Yuniawati, S.Ars." },
        { nip: "198304232024211007", name: "MUHAMMAD ARIF, S.T" },
        { nip: "199212232024211017", name: "M. SYAIFULLOH ZUHRI. S.T." },
        { nip: "199101012025211051", name: "Yunata Pirnando, S.Pd" },
        { nip: "199105292025212019", name: "Ayu Purnamasari" },
        { nip: "199109012025211011", name: "Seftian Gardi Perdana, S.M." },
        { nip: "199210242025211015", name: "Teguh Sulistyo Hadi, S.T." },
        { nip: "198807262025211016", name: "Hariadi Serawa, S.H." },
        { nip: "198903212025212017", name: "Marini Puji Hartini, S.T" },
        { nip: "199004022025211015", name: "Rusmin, S.H" },
        { nip: "198910192025211012", name: "Oki Syaputra" },
        { nip: "199309132025211011", name: "Fiqri Taufiq Qurahman" },
        { nip: "199910102025211008", name: "Putra Ady Nanda" },
        { nip: "199508082025212017", name: "Ade Ayu Milahardika" },
        { nip: "199612132025211006", name: "La Ode Muh Iqbal Rabbani Polondu" },
        { nip: "197007052025211008", name: "Sumiran" },
        { nip: "197009232025212002", name: "Rahmawati Yusuf, S.T." },
        { nip: "198404082025212018", name: "Windri Fitrica Wanti, S.E." }
    ],
    "Kepala Bagian TU": [
        { nip: "198809202014031001", name: "Auditya Hermawan, S.E., M.M." }
    ],
    "Kasubbag Protokol": [
        { nip: "199111232015031001", name: "Sudarianto, S.Sos., M.M." }
    ],
    "Kasubbag TU Biro": [
        { nip: "198607312014031001", name: "Yogi Waldingga, S.Pi., M.M." }
    ],
    "Kasubbag TU Menteri": [
        { nip: "199002242011011003", name: "Indra Aditama Suderi, S.Kom." }
    ],
    "Kasubbag TU Setjen": [
        { nip: "199510102018031001", name: "Muhammad Fauzani Taufiq, S.I.P, M.A.P." }
    ],
    "Protokol": [
        { nip: "199604072018121001", name: "Rezky Aries Munandar, A.Md.Ak." },
        { nip: "199103062019021003", name: "Perananta Purba, S.E" },
        { nip: "198710172019021003", name: "Muhammad Isa, S.E., M.Sc." },
        { nip: "199405262019021003", name: "Mochamad Gufron, S.E." },
        { nip: "199410042019022008", name: "Imelda Anggraeni Sibarani, S.Psi." },
        { nip: "199409292019021005", name: "Bobby Rizky, S.H." },
        { nip: "199308122020122021", name: "Siti Munzayanah, S.T., M.Sc." },
        { nip: "198904042015031007", name: "Nurcahyo Purnomo, A.Md." },
        { nip: "199201062015032004", name: "Efi Kurniawati, S.E." },
        { nip: "200107282025052007", name: "Citra Anastasya, S.S." },
        { nip: "200101152025052002", name: "Nurin Nashfati, S.I.Kom" },
        { nip: "200206272025052004", name: "Regina Dwita Sari, S.Gz." },
        { nip: "198705182025211010", name: "Hendi Rionaldo, S.E" },
        { nip: "199505122025072042", name: "Syamazka Zakirni, S.H." },
        { nip: "198902132025211012", name: "Nico Kurniawan, S.E." }
    ],
    "TU Biro": [
        { nip: "199707222018121002", name: "Ardimas Perdana Putra, S.M." },
        { nip: "199503092020121014", name: "Muhammad Ridwan Mustofa, S.AP." },
        { nip: "200110092023022001", name: "Jesica Octavia Simamora, A.Md.M." },
        { nip: "198910142014032002", name: "apt.. Sisca Sutanto, S.Farm., M.Farm." },
        { nip: "197202251998031004", name: "Dwi Edi Santoso" },
        { nip: "200004082025051001", name: "Bangun Waizal Karniz, S.Pd." },
        { nip: "200212022025052001", name: "Nurul Syaharani Rasyid, S.Psi" },
        { nip: "199704232025051003", name: "Hanief Rifqi Murdaka, S.Si." },
        { nip: "199005162025211015", name: "Novianto Mawardi, A.Md" },
        { nip: "198807132025212014", name: "Dwi Alriyanti, SST" },
        { nip: "199312062023112033", name: "Sri Rahmawati, S.Kom" },
        { nip: "198203072024212013", name: "DAYOENA IVON MURIONO, A.Md" }
    ],
    "TU Menteri": [
        { nip: "198405272019021003", name: "Ketut Jatinegara, S.M.B., M.Si." },
        { nip: "199201132019021003", name: "Teuku Hidayatul Awwalin, S.I.P." },
        { nip: "199301092019022007", name: "Rahmi Sabrina, S.Kom." },
        { nip: "199007182020122020", name: "Dewi Setiyarini, S.Pd." },
        { nip: "199506242020122028", name: "Junita Wulandari, S.E." },
        { nip: "199706262017081001", name: "Fizham Fadlil Aldiansyah Fataruba, S.STP." },
        { nip: "198603272009121003", name: "Taufik Hidayat Sitompul, S.H." },
        { nip: "198704162011012014", name: "Ayu Hapsariningtyas, S.Ds." },
        { nip: "198801122015032002", name: "Astuti Wulan Yanuari, S.I.A." },
        { nip: "199706012025051004", name: "Bagas Winektu, S.Kom" },
        { nip: "199808042025052003", name: "Khalifatunnisa Ismi Shalikah, S.Ak." },
        { nip: "199805282025052002", name: "Rizka Putri Rumastari, A.Md.Bns." },
        { nip: "199308212025212018", name: "Lucy Kusuma Wardhani, S.Pd" },
        { nip: "199309162025211012", name: "Ahmad Hilwan, S.E." }
    ],
    "TU Setjen": [
        { nip: "200008012025051002", name: "Muhammad Naufal Zul Hazmi, S.Si." },
        { nip: "199506222018011001", name: "Raffi Wahyu Kusuma, S.S.T., M.M." },
        { nip: "199408172018011006", name: "Gilang Mahardika Muhammad, S.Par." },
        { nip: "199404112019021005", name: "Dhiky Pudya Gilangjati, S.Sos." },
        { nip: "199406302020122029", name: "Yunita Wini Damayanti, S.K.Pm." },
        { nip: "197508211998031003", name: "Agung Wahyudi Arso" },
        { nip: "198206032009122003", name: "Noki Yuniananingsih, A.Md." },
        { nip: "198307152009012004", name: "Juwita Adi Hariyanti, S.Psi." },
        { nip: "198610172014032002", name: "Bertyna, S.H., M.H." },
        { nip: "198812012014031001", name: "Husen Mauludin, S.H.Int., M.M." },
        { nip: "199402252025051003", name: "Azusa Rahman Wijaya, S.I.K" },
        { nip: "199803282025052005", name: "Nur Elsahbania, S.E." },
        { nip: "198806192025212013", name: "Anjani Listyaningsih, S.Pd" },
        { nip: "199709082025211011", name: "Dekanda Prada Canda Segap, S.Pt." },
        { nip: "199201192025211015", name: "Ivan Risqi Asyhari" }
    ],
    "Kepala Bagian PBJ": [
        { nip: "198604302011011011", name: "Irvan Ganeva, S.Ds." }
    ],
    "PBJ": [
        { nip: "197002131993032001", name: "Evi Jurpaidah, S.E., M.M." },
        { nip: "199802272018122002", name: "Jeihan Hannissa, A.Md.M." },
        { nip: "199706172018121002", name: "Labibul Ma'mul, S.Akun" },
        { nip: "198806302019022003", name: "Dina Arifiani, S.I.A" },
        { nip: "197304051999031002", name: "Samiyadi, S.E., M.M" },
        { nip: "197501091998031007", name: "Suhendra Saputra" },
        { nip: "197607122011012003", name: "Iffah Sofia Kusuma, A.Md." },
        { nip: "198701122014031002", name: "Muhammad Iqbal, Lc." },
        { nip: "198710232011012016", name: "R. Jayati Effendy, A.Md." },
        { nip: "199601072025051003", name: "Andi Hifzhuddin Rahman, S.T." },
        { nip: "199711082025052006", name: "Magdalena M.S. Siahaan, S.T." },
        { nip: "200010122025051002", name: "Aldiva Wibowo, S.Kom." },
        { nip: "199811212025051001", name: "Novendra David Rizaldy, S.Tr.T." },
        { nip: "197208272003121002", name: "Arief Hafidiyanto S.S., M.Si." },
        { nip: "199611222023212030", name: "Elsy Amelia Yuliansari, S.H." },
        { nip: "199309182024211019", name: "AGUNG SURYO PRABOWO, S.H." },
        { nip: "199403272024211015", name: "RIZA WARDHANA, S.T." },
        { nip: "199507272024211017", name: "MARIO TORANG SINAGA, S.T." },
        { nip: "199506262025212019", name: "Rati Kumala Dewi, S.E." },
        { nip: "199805042025211009", name: "Raden Ganis Fahmi" },
        { nip: "200110032025212004", name: "Davina Rhilla Cantika" }
    ],
    "Arsiparis dan Persuratan": [
        { nip: "197907162009011010", name: "Suprayitno, SIP., M.Hum." },
        { nip: "198812042011012013", name: "Dewi Purnawati, S.A.P." },
        { nip: "199609252025052003", name: "Ayu Rosefiani Syara, A.Md.Bns." },
        { nip: "196610221986031001", name: "Edi Tugiono, S.I.P., M.Si." },
        { nip: "198306032009012004", name: "Junita Haryani Purnaningtyas, S.A.P." },
        { nip: "198211122011011010", name: "Muh. Imal Arofat, S.T. , M.M." },
        { nip: "199408132025212018", name: "Ayu Puji Lestari, S.I.Kom" }
    ]
};

export const warehouseStaff: Employee[] = [
    { name: "Bangun Waizal Karniz, S.Pd.", nip: "200004082025051001" },
    { name: "Nur Elsahbania, S.E.", nip: "199803282025052005" },
    { name: "Rizka Putri Rumastari, A.Md.Bns.", nip: "199805282025052002" },
];


export type Coordinator = {
    name: string;
    nip: string;
    status: string;
}
export const coordinators: { [key: string]: Coordinator } = {
    "Rumah Tangga": { name: "Fajar Setiawan, S.E., M.M.", nip: "197704251999031002", status: "Kepala Subkoordinator" },
    "PBJ": { name: "Irvan Ganeva, S.E., M.M.", nip: "198412152003121001", status: "Kepala Bagian" },
    "RT & Perlengkapan": { name: "Luthfi Firdaus, S.E., M.M.", nip: "197904302011011012", status: "Kepala Bagian Rumah Tangga dan Perlengkapan" },
    "TU": { name: "Siti Zulaichah, S.A.P", nip: "197007051996032001", status: "Kepala Bagian Tata Usaha Pimpinan dan Protokol" },
    "default": { name: "(.......................................)", nip: ".......................................", status: "Kepala Subbagian Tata Usaha," }
};

export type ItemType = {
  name: string;
  icon: LucideIcon;
};

export const itemTypes: ItemType[] = [
    { name: "Amplop", icon: FileText },
    { name: "Baterai", icon: Battery },
    { name: "Cutter", icon: Scissors },
    { name: "Isi Cutter", icon: Scissors },
    { name: "Clip", icon: Paperclip },
    { name: "Double Tip", icon: Package },
    { name: "Flashdisk", icon: Usb },
    { name: "Gunting", icon: Scissors },
    { name: "Kertas", icon: FileType2 },
    { name: "Lakban", icon: Package },
    { name: "Lem", icon: StickyNote },
    { name: "Map", icon: Folder },
    { name: "Notes", icon: StickyNote },
    { name: "Pensil", icon: Pencil },
    { name: "Penghapus", icon: Eraser },
    { name: "Pena", icon: Pen },
    { name: "Penggaris", icon: Ruler },
];

export type Brand = {
  name: string;
  logoUrl?: string;
};

export const brands: Brand[] = [
  { name: "Joyko", logoUrl: "https://logo.clearbit.com/joyko.co.id" },
  { name: "Faber-Castell", logoUrl: "https://logo.clearbit.com/faber-castell.com" },
  { name: "Kenko", logoUrl: "https://logo.clearbit.com/kenko.co.id" },
  { name: "Sinar Dunia", logoUrl: "https://logo.clearbit.com/app.co.id" },
  { name: "PaperOne", logoUrl: "https://logo.clearbit.com/paperone.com" },
  { name: "Bantex", logoUrl: "https://logo.clearbit.com/bantex.co.id" },
  { name: "Pelikan", logoUrl: "https://logo.clearbit.com/pelikan.com" },
  { name: "3M", logoUrl: "https://logo.clearbit.com/3m.com" },
  { name: "Amplop PPL No 90" },
  { name: "ABC Alkaline Baterai A2 Isi 6" },
  { name: "Kenko Cutter Kecil A300" },
  { name: "Isi Cutter Kecil Kenko" },
  { name: "Paper Clip Warna Warni" },
  { name: "Binder Clip No.105" },
  { name: "Binder Clip 107" },
  { name: "Binder Clip No.111" },
  { name: "Trigonal Clips No.1" },
  { name: "Double Tip" },
  { name: "Flash Disk 8GB" },
  { name: "Flash Disk 16GB" },
  { name: "Flash Disk 32GB" },
  { name: "Flash Disk 64GB" },
  { name: "Gunting Kenko 838" },
  { name: "Kertas A4 Bola Dunia 80 Gr" },
  { name: "Kertas A4 80 Gram Paper One" },
  { name: "Kertas Bola Dunia B5" },
  { name: "Kertas F4 Bola Dunia 80Gr" },
  { name: "Kertas F4 80 Gram Paper One" },
  { name: "Lakban Hitam 2 inc" },
  { name: "Lakban Bening Daimastu" },
  { name: "Lem Stik 8 gr" },
  { name: "Lem Stik 25 gr" },
  { name: "Pocket PP Bantex" },
  { name: "Map Logo Dinas Biru" },
  { name: "Stop Map Diamond No.5002" },
  { "name": "Clear Sleeves Daichi A4" },
  { "name": "Clear Sleeves Daichi F4" },
  { name: "Post It 654 3M" },
  { name: "Post It 653 Kecil Warna" },
  { name: "Sign Here" },
  { name: "Pensil 2B Faber Castel" },
  { name: "Penghapus Pelikan" },
  { name: "Pulpen Bolliner Elite" },
  { name: "Ballpoint Uniball Signo" },
  { name: "Pulpen Sarasa 0.5" },
];


export const brandsByItemType: { [key: string]: string[] } = {
    "ATK": ["Joyko", "Faber-Castell", "Kenko"],
    "Kertas": ["Sinar Dunia", "PaperOne", "Natural", "Kertas A4 Bola Dunia 80 Gr", "Kertas A4 80 Gram Paper One", "Kertas Bola Dunia B5", "Kertas F4 Bola Dunia 80Gr", "Kertas F4 80 Gram Paper One"],
    "Binder Clip": ["Binder Clip No.105", "Binder Clip 107", "Binder Clip No.111"],
    "Post It": ["Post It 654 3M", "Post It 653 Kecil Warna"],
    "Amplop": ["Amplop PPL No 90"],
    "Baterai": ["ABC Alkaline Baterai A2 Isi 6"],
    "Cutter": ["Kenko Cutter Kecil A300", "Isi Cutter Kecil Kenko"],
    "Clip": ["Paper Clip Warna Warni", "Binder Clip No.105", "Binder Clip 107", "Binder Clip No.111", "Trigonal Clips No.1"],
    "Double Tip": ["Double Tip"],
    "Flashdisk": ["Flash Disk 8GB", "Flash Disk 16GB", "Flash Disk 32GB", "Flash Disk 64GB"],
    "Gunting": ["Gunting Kenko 838"],
    "Lakban": ["Lakban Hitam 2 inc", "Lakban Bening Daimastu"],
    "Lem": ["Lem Stik 8 gr", "Lem Stik 25 gr"],
    "Map": ["Pocket PP Bantex", "Map Logo Dinas Biru", "Stop Map Diamond No.5002", "Clear Sleeves Daichi A4", "Clear Sleeves Daichi F4"],
    "Notes": ["Post It 654 3M", "Post It 653 Kecil Warna", "Sign Here"],
    "Pensil": ["Pensil 2B Faber Castel"],
    "Penghapus": ["Penghapus Pelikan"],
    "Pena": ["Pulpen Bolliner Elite", "Ballpoint Uniball Signo", "Pulpen Sarasa 0.5"],
};

export type StockItem = {
    id: string;
    itemType: string;
    brand: string;
    quantity: number;
    price: number; // in IDR
    warehouse: string;
};

export type Proposal = {
    id: string;
    employee: string;
    employeeNip?: string;
    department: string;
    warehouse: string;
    items: {
        itemType: string;
        brand: string;
        quantity: number;
    }[];
    date: string; // ISO 8601 string format
    status: "pending" | "approved" | "rejected";
    photoUrl: string;
    gps: string;
    rejectionReason?: string;
};

export const stockItems: StockItem[] = [];
    
