import { useState } from "react";
import { Dumbbell, Users, Clock, Zap, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Intensity = "light" | "moderate" | "intense";

const exerciseTypes = [
  { id: "walk", emoji: "🚶", label: "Caminhada" },
  { id: "run", emoji: "🏃", label: "Corrida" },
  { id: "gym", emoji: "🏋️", label: "Musculação" },
  { id: "yoga", emoji: "🧘", label: "Yoga" },
  { id: "bike", emoji: "🚴", label: "Bike" },
  { id: "swim", emoji: "🏊", label: "Natação" },
  { id: "dance", emoji: "💃", label: "Dança" },
  { id: "other", emoji: "⭐", label: "Outro" },
];

const durations = ["15 min", "30 min", "45 min", "1h", "1h30", "2h+"];

const intensities: { value: Intensity; label: string; emoji: string }[] = [
  { value: "light", label: "Leve", emoji: "😌" },
  { value: "moderate", label: "Moderado", emoji: "💪" },
  { value: "intense", label: "Intenso", emoji: "🔥" },
];

export const ExerciseLogger = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity | null>(null);
  const [withPartner, setWithPartner] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const handleLogExercise = () => {
    if (!selectedType || !selectedDuration || !selectedIntensity) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLogging(true);
    setTimeout(() => {
      setIsLogging(false);
      const exercise = exerciseTypes.find(e => e.id === selectedType);
      toast.success(`${exercise?.emoji} Exercício registrado!`, {
        description: withPartner 
          ? "Que legal fazer isso juntos! 💕" 
          : "Continue se movendo, você está incrível!",
      });
      // Reset form
      setSelectedType(null);
      setSelectedDuration(null);
      setSelectedIntensity(null);
      setWithPartner(false);
    }, 600);
  };

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dumbbell className="w-5 h-5 text-energy" />
          Registrar exercício
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exercise Type */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Tipo de exercício</p>
          <div className="grid grid-cols-4 gap-2">
            {exerciseTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? "energy" : "soft"}
                size="sm"
                className="h-auto py-2 flex-col gap-1"
                onClick={() => setSelectedType(type.id)}
              >
                <span className="text-lg">{type.emoji}</span>
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Duração
          </p>
          <div className="flex flex-wrap gap-2">
            {durations.map((duration) => (
              <Button
                key={duration}
                variant={selectedDuration === duration ? "default" : "soft"}
                size="sm"
                onClick={() => setSelectedDuration(duration)}
              >
                {duration}
              </Button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div>
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <Zap className="w-4 h-4" /> Intensidade
          </p>
          <div className="grid grid-cols-3 gap-2">
            {intensities.map((intensity) => (
              <Button
                key={intensity.value}
                variant={selectedIntensity === intensity.value ? "default" : "soft"}
                size="sm"
                className="gap-1"
                onClick={() => setSelectedIntensity(intensity.value)}
              >
                {intensity.emoji} {intensity.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Together toggle */}
        <Button
          variant={withPartner ? "love" : "soft"}
          className="w-full gap-2"
          onClick={() => setWithPartner(!withPartner)}
        >
          <Users className="w-4 h-4" />
          {withPartner ? "Fizemos juntos! 💕" : "Fizemos juntos?"}
        </Button>

        {/* Submit */}
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={handleLogExercise}
          disabled={isLogging || !selectedType || !selectedDuration || !selectedIntensity}
        >
          {isLogging ? (
            <Check className="w-5 h-5 animate-pulse" />
          ) : (
            "Registrar exercício"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
