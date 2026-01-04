import { Target, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: string;
  title: string;
  emoji: string;
  current: number;
  target: number;
  unit: string;
}

const mockGoals: Goal[] = [
  { id: "1", title: "Treinos juntos", emoji: "🏃", current: 2, target: 3, unit: "esta semana" },
  { id: "2", title: "Refeições saudáveis", emoji: "🥗", current: 12, target: 14, unit: "esta semana" },
  { id: "3", title: "Check-ins diários", emoji: "💭", current: 5, target: 7, unit: "esta semana" },
];

export const CoupleGoals = () => {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Metas do casal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockGoals.map((goal) => {
          const progress = Math.round((goal.current / goal.target) * 100);
          const isComplete = goal.current >= goal.target;
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{goal.emoji}</span>
                  <span className="font-medium text-sm">{goal.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {goal.current}/{goal.target}
                  </span>
                  {isComplete && (
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                  )}
                </div>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">{goal.unit}</p>
            </div>
          );
        })}
        
        <p className="text-xs text-center text-muted-foreground pt-2 border-t border-border/50">
          Metas são para guiar, não para cobrar 💚
        </p>
      </CardContent>
    </Card>
  );
};
