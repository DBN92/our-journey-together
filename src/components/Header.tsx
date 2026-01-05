import { Infinity as InfinityIcon, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Header = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    const url = localStorage.getItem("app_logo_url");
    if (url) setLogoUrl(url);
  }, []);
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */
          }
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Duoos" className="h-8 w-auto" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                  <InfinityIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gradient">Duoos</h1>
                  <p className="text-xs text-muted-foreground -mt-0.5">Bem-estar a dois</p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-love" />
            </Button>
            <Button variant="soft" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
