import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface DayProgress {
  day: string;
  you: { exercise: boolean; meals: number; mood: number };
  partner: { exercise: boolean; meals: number; mood: number };
  together: boolean;
}

const mockWeekData: DayProgress[] = weekDays.map((day, i) => ({
  day,
  you: {
    exercise: Math.random() > 0.3,
    meals: Math.floor(Math.random() * 3) + 1,
    mood: Math.floor(Math.random() * 3) + 3,
  },
  partner: {
    exercise: Math.random() > 0.4,
    meals: Math.floor(Math.random() * 3) + 1,
    mood: Math.floor(Math.random() * 3) + 3,
  },
  together: Math.random() > 0.6,
}));

export const WeeklyProgress = () => {
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          Semana do casal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {mockWeekData.map((dayData, index) => {
            const isToday = index === todayIndex;
            const isFuture = index > todayIndex;
            const bothExercised = dayData.you.exercise && dayData.partner.exercise;
            
            return (
              <div
                key={dayData.day}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isToday 
                    ? "bg-primary/10 ring-2 ring-primary/30" 
                    : isFuture 
                      ? "opacity-40" 
                      : "hover:bg-muted/50"
                }`}
              >
                <span className={`text-xs font-medium ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}>
                  {dayData.day}
                </span>
                
                {/* Activity indicators */}
                <div className="flex flex-col gap-0.5">
                  {/* You */}
                  <div className={`w-6 h-1.5 rounded-full ${
                    isFuture 
                      ? "bg-muted" 
                      : dayData.you.exercise 
                        ? "bg-energy" 
                        : "bg-muted"
                  }`} />
                  {/* Partner */}
                  <div className={`w-6 h-1.5 rounded-full ${
                    isFuture 
                      ? "bg-muted" 
                      : dayData.partner.exercise 
                        ? "bg-calm" 
                        : "bg-muted"
                  }`} />
                </div>

                {/* Together indicator */}
                {!isFuture && dayData.together && (
                  <span className="text-xs">💕</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full bg-energy" />
            <span className="text-xs text-muted-foreground">Você</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full bg-calm" />
            <span className="text-xs text-muted-foreground">Parceiro(a)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">💕</span>
            <span className="text-xs text-muted-foreground">Juntos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
