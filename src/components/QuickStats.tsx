import { Dumbbell, Utensils, Smile, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  colorClass: string;
  bgClass: string;
}

const StatCard = ({ icon, label, value, subtext, colorClass, bgClass }: StatCardProps) => (
  <Card variant="elevated" className="group hover:scale-[1.02] transition-transform duration-300">
    <CardContent className="p-5">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface QuickStatsProps {
  exercisesThisWeek: number;
  healthyMeals: number;
  averageMood: string;
  togetherActivities: number;
}

export const QuickStats = ({ 
  exercisesThisWeek, 
  healthyMeals, 
  averageMood,
  togetherActivities 
}: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Dumbbell className="w-6 h-6 text-energy" />}
        label="Exercícios"
        value={exercisesThisWeek}
        subtext="esta semana"
        colorClass="text-energy-foreground"
        bgClass="bg-energy/15"
      />
      <StatCard
        icon={<Utensils className="w-6 h-6 text-success" />}
        label="Refeições saudáveis"
        value={healthyMeals}
        subtext="esta semana"
        colorClass="text-success"
        bgClass="bg-success/15"
      />
      <StatCard
        icon={<Smile className="w-6 h-6 text-calm" />}
        label="Humor médio"
        value={averageMood}
        subtext="do casal"
        colorClass="text-calm"
        bgClass="bg-calm/15"
      />
      <StatCard
        icon={<Heart className="w-6 h-6 text-love" />}
        label="Juntos"
        value={togetherActivities}
        subtext="atividades"
        colorClass="text-love"
        bgClass="bg-love/15"
      />
    </div>
  );
};
