# **App Name**: Gudang Biru

## Core Features:

- Login Authentication: Secure login page with options for regular employee and administrator access, using the password 'Sayasukaayamgoreng' for administrator access.
- Employee Dashboard: Dashboard for regular employees to select 'bagian' (department), 'nama pegawai' (employee name), 'tipe barang' (item type), 'tipe merk' (brand type), and the quantity of items to request, all stored in Google Sheets.
- Image Capture with Metadata: Capture images with embedded timestamps and GPS coordinates using the device's camera, all written as metadata on the file itself.
- Document Generation: Automatically generate documents containing data such as timestamps, GPS coordinates, department, employee name, item type, quantity, and brand from the data input on the Employee Dashboard.
- Stock Review Tool: Generate report from the integrated Google Sheet to automatically reviews the availability of each item in stock (Stock Opname). This is implemented as an AI tool within the admin portal: When presented with the live sheet data, the tool reasons about items with stock counts below a certain threshold, or stock counts that changed significantly from a prior audit.
- Administrator Dashboard: Administrator dashboard to add new items, item types, brand types, and adjust the quantity of items. This function can add multiple item types or brand types in a single submission.
- Google Sheets Integration: Seamless integration with Google Sheets to store and retrieve item requests, stock adjustments, and other relevant data.

## Style Guidelines:

- Primary color: Sky blue (#87CEEB) to align with the 'Gudang Biru' theme.
- Background color: Light blue (#E0FFFF), slightly desaturated.
- Accent color: Pale violet (#D8BFD8), for a contrasting yet harmonious effect.
- Body and headline font: 'PT Sans', a versatile humanist sans-serif suitable for both headlines and body text.
- Use clean, modern icons to represent item categories and actions within the application.
- Emphasize clear information hierarchy and easy navigation on both employee and administrator dashboards.
- Employ subtle transitions and animations for interactive elements to enhance user experience.