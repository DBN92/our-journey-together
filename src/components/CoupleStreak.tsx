import { Heart, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CoupleStreakProps {
  streak: number;
  partnerName: string;
}

export const CoupleStreak = ({ streak, partnerName }: CoupleStreakProps) => {
  return (
    <Card variant="love" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-love/20 flex items-center justify-center">
                <Flame className="w-8 h-8 text-love animate-pulse-soft" />
              </div>
              <Heart className="absolute -bottom-1 -right-1 w-6 h-6 text-love fill-love animate-heart-beat" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Streak do casal
              </p>
              <p className="text-4xl font-bold text-love">
                {streak} <span className="text-lg">dias</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Juntos com
            </p>
            <p className="text-lg font-semibold text-foreground">
              {partnerName} 💕
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-love/10">
          <p className="text-sm text-muted-foreground text-center italic">
            "Cada dia juntos é uma vitória. Vocês estão incríveis!"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
