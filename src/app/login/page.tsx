
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Warehouse, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"pegawai" | "admin" | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const logoImage = PlaceHolderImages.find(p => p.id === 'gudang-biru-logo');


  const handleAdminLogin = () => {
    setIsLoading(true);
    setError("");

    // Simulate network delay
    setTimeout(() => {
      if (password === "Semogahaniefmasuksurga") {
        router.push("/admin/dashboard");
      } else {
        setError("Password yang Anda masukkan salah.");
      }
      setIsLoading(false);
    }, 500);
  };

  const handlePegawaiLogin = () => {
    setIsLoading(true);
    router.push("/employee/dashboard");
  }

  const renderContent = () => {
    if (loginType === "admin") {
      return (
        <>
          <CardHeader>
            <CardTitle>Login Administrator</CardTitle>
            <CardDescription>Masukkan password untuk melanjutkan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    placeholder="************"
                    className="pr-10"
                />
                 <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-muted-foreground"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
               </div>
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleAdminLogin} className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "Login"}
            </Button>
            <Button variant="link" onClick={() => setLoginType(null)}>Kembali</Button>
          </CardFooter>
        </>
      );
    }

    return (
      <>
        <CardHeader>
          <CardTitle>Selamat Datang</CardTitle>
          <CardDescription>Pilih tipe login untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handlePegawaiLogin} className="w-full" size="lg">Login sebagai Pegawai</Button>
          <Button onClick={() => setLoginType("admin")} className="w-full" variant="outline" size="lg">Login sebagai Administrator</Button>
        </CardContent>
      </>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
       <Image
          src="https://upload.wikimedia.org/wikipedia/commons/9/98/Logo_Kementerian_Ketenagakerjaan_%282016%29.png"
          alt="Latar Belakang Logo Kemenaker"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 w-full h-full object-contain opacity-5 dark:opacity-5 dark:invert scale-150"
          quality={100}
          priority
        />
       <div className="absolute top-4 right-4 z-10">
        <ThemeToggle buttonClassName="text-primary hover:bg-accent hover:text-accent-foreground dark:text-primary dark:hover:bg-accent dark:hover:text-accent-foreground" />
       </div>
       <div className="relative z-10 flex flex-col items-center gap-4 mb-8">
        <div className="bg-primary p-4 rounded-full">
            <Warehouse className="h-16 w-16 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-foreground">Gudang Biru</h1>
        <p className="text-muted-foreground">Manajemen Stok Biro Umum</p>
      </div>
      <Card className="w-full max-w-md shadow-2xl relative z-10">
        {renderContent()}
      </Card>
      
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground z-10">
        Tata Usaha Biro, Biro Umum, Sekretariat Jenderal, Kementerian Ketenagakerjaan © 2025
      </footer>
    </main>
  );
}
