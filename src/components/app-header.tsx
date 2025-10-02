import { Warehouse, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-primary px-4 sm:px-6 dark:border-border dark:bg-card">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Warehouse className="h-6 w-6 text-primary-foreground dark:text-primary" />
        <span className="text-lg font-headline text-primary-foreground dark:text-primary">Gudang Biru</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link href="/login">
            <Button variant="ghost" size="icon" aria-label="Logout" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:text-primary dark:hover:bg-primary/10">
                <LogOut className="h-5 w-5" />
            </Button>
        </Link>
      </div>
    </header>
  );
}
