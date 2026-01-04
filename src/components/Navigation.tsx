import { Home, Utensils, Dumbbell, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { id: "home", icon: Home, label: "Início" },
  { id: "meals", icon: Utensils, label: "Refeições" },
  { id: "exercise", icon: Dumbbell, label: "Exercícios" },
  { id: "connection", icon: Heart, label: "Conexão" },
  { id: "progress", icon: TrendingUp, label: "Evolução" },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 safe-area-pb">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex-col gap-1 h-auto py-2 px-3 min-w-[64px] transition-all duration-300 ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110" : ""
                }`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-0.5 w-8 h-1 rounded-full bg-primary" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
