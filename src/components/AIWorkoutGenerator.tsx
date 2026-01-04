import { useState } from "react";
import { Dumbbell, Sparkles, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const goals = [
  { id: "health", label: "Saúde geral", emoji: "💪" },
  { id: "weight-loss", label: "Perda de peso", emoji: "🏃" },
  { id: "muscle", label: "Ganho muscular", emoji: "💪" },
  { id: "flexibility", label: "Flexibilidade", emoji: "🧘" },
  { id: "endurance", label: "Resistência", emoji: "🚴" },
];

const durations = ["15 min", "30 min", "45 min", "1 hora"];

const levels = [
  { id: "beginner", label: "Iniciante", emoji: "🌱" },
  { id: "intermediate", label: "Intermediário", emoji: "🌿" },
  { id: "advanced", label: "Avançado", emoji: "🌳" },
];

export const AIWorkoutGenerator = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [withPartner, setWithPartner] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workout, setWorkout] = useState<string | null>(null);

  const generateWorkout = async () => {
    setIsGenerating(true);
    setWorkout("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type: "workout",
            preferences: {
              goal: goals.find((g) => g.id === selectedGoal)?.label,
              duration: selectedDuration,
              level: levels.find((l) => l.id === selectedLevel)?.label,
              together: withPartner,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar treino");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setWorkout(fullText);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      toast.success("Treino gerado! 💪");
    } catch (error) {
      console.error("Error generating workout:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar treino");
      setWorkout(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-energy" />
            Gerar treino com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Goal */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Qual seu objetivo?</p>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <Button
                  key={goal.id}
                  variant={selectedGoal === goal.id ? "energy" : "soft"}
                  size="sm"
                  onClick={() => setSelectedGoal(goal.id)}
                >
                  {goal.emoji} {goal.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Tempo disponível</p>
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

          {/* Level */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Nível de condicionamento</p>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <Button
                  key={level.id}
                  variant={selectedLevel === level.id ? "default" : "soft"}
                  size="sm"
                  onClick={() => setSelectedLevel(level.id)}
                >
                  {level.emoji} {level.label}
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
            {withPartner ? "Treino em casal! 💕" : "Incluir exercícios em casal?"}
          </Button>

          {/* Generate */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full gap-2"
            onClick={generateWorkout}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando treino...
              </>
            ) : (
              <>
                <Dumbbell className="w-5 h-5" />
                Gerar meu treino
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated workout */}
      {workout && (
        <Card variant="glass" className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              🏋️ Seu Treino Personalizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {workout}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
