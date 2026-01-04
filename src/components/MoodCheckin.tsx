import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const moods = [
  { emoji: "😊", label: "Ótimo", value: 5 },
  { emoji: "🙂", label: "Bem", value: 4 },
  { emoji: "😐", label: "Ok", value: 3 },
  { emoji: "😔", label: "Baixo", value: 2 },
  { emoji: "😢", label: "Difícil", value: 1 },
];

export const MoodCheckin = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const handleCheckin = () => {
    if (!selectedMood) {
      toast.error("Selecione como você está se sentindo");
      return;
    }

    const mood = moods.find(m => m.value === selectedMood);
    toast.success(`Check-in registrado! ${mood?.emoji}`, {
      description: "Que bom compartilhar como você está.",
    });
    setSelectedMood(null);
    setNote("");
  };

  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          💭 Como você está hoje?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between gap-2">
          {moods.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "calm" : "ghost"}
              size="icon-lg"
              className={`flex-1 h-16 text-3xl transition-all duration-300 ${
                selectedMood === mood.value ? "scale-110" : "hover:scale-105"
              }`}
              onClick={() => setSelectedMood(mood.value)}
            >
              {mood.emoji}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {selectedMood && (
            <p className="text-sm text-muted-foreground flex-1">
              Sentindo-se: <span className="font-medium text-foreground">
                {moods.find(m => m.value === selectedMood)?.label}
              </span>
            </p>
          )}
        </div>

        <textarea
          placeholder="Uma nota curta (opcional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-3 rounded-xl bg-muted/50 border border-border/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-calm/50 placeholder:text-muted-foreground"
          rows={2}
        />

        <Button
          variant="calm"
          size="lg"
          className="w-full"
          onClick={handleCheckin}
          disabled={!selectedMood}
        >
          Registrar check-in
        </Button>
      </CardContent>
    </Card>
  );
};
