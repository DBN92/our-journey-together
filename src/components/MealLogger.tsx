import { useState } from "react";
import { Salad, Scale, Cookie, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type MealType = "healthy" | "balanced" | "free";

interface MealOption {
  type: MealType;
  icon: React.ReactNode;
  label: string;
  emoji: string;
  description: string;
}

const mealOptions: MealOption[] = [
  {
    type: "healthy",
    icon: <Salad className="w-6 h-6" />,
    label: "Saudável",
    emoji: "🥗",
    description: "Nutritivo e equilibrado",
  },
  {
    type: "balanced",
    icon: <Scale className="w-6 h-6" />,
    label: "Equilibrado",
    emoji: "⚖️",
    description: "Um pouco de tudo",
  },
  {
    type: "free",
    icon: <Cookie className="w-6 h-6" />,
    label: "Livre consciente",
    emoji: "🍕",
    description: "Sem culpa!",
  },
];

export const MealLogger = () => {
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const handleLogMeal = (type: MealType) => {
    setSelectedMeal(type);
    setIsLogging(true);
    
    setTimeout(() => {
      setIsLogging(false);
      const option = mealOptions.find(o => o.type === type);
      toast.success(`Refeição registrada! ${option?.emoji}`, {
        description: "Continue assim, você está no caminho certo!",
      });
    }, 500);
  };

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          🍽️ Registrar refeição
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Como foi sua última refeição?
        </p>
        <div className="grid grid-cols-3 gap-3">
          {mealOptions.map((option) => (
            <Button
              key={option.type}
              variant={selectedMeal === option.type ? "success" : "soft"}
              size="lg"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => handleLogMeal(option.type)}
              disabled={isLogging}
            >
              {selectedMeal === option.type && isLogging ? (
                <Check className="w-6 h-6 animate-pulse" />
              ) : (
                <span className="text-2xl">{option.emoji}</span>
              )}
              <span className="text-xs font-medium">{option.label}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">
          Sem julgamentos, apenas consciência 💚
        </p>
      </CardContent>
    </Card>
  );
};
