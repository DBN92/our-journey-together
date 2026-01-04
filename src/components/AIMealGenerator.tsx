import { useState } from "react";
import { Utensils, Sparkles, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mealTypes = [
  { id: "breakfast", label: "Café da manhã", emoji: "🌅" },
  { id: "lunch", label: "Almoço", emoji: "🍽️" },
  { id: "dinner", label: "Jantar", emoji: "🌙" },
  { id: "snack", label: "Lanche saudável", emoji: "🍎" },
];

const cookingTimes = [
  { id: "15", label: "Até 15 min", emoji: "⚡" },
  { id: "30", label: "Até 30 min", emoji: "🕐" },
  { id: "60", label: "Até 1 hora", emoji: "👨‍🍳" },
];

const restrictions = [
  { id: "none", label: "Sem restrições" },
  { id: "vegetarian", label: "Vegetariano 🥬" },
  { id: "vegan", label: "Vegano 🌱" },
  { id: "low-carb", label: "Low carb 🥩" },
  { id: "gluten-free", label: "Sem glúten 🌾" },
  { id: "lactose-free", label: "Sem lactose 🥛" },
];

export const AIMealGenerator = () => {
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedRestriction, setSelectedRestriction] = useState<string>("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [meal, setMeal] = useState<string | null>(null);

  const generateMeal = async () => {
    setIsGenerating(true);
    setMeal("");

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
            type: "meal",
            preferences: {
              mealType: mealTypes.find((m) => m.id === selectedMealType)?.label,
              cookingTime: cookingTimes.find((t) => t.id === selectedTime)?.label,
              restrictions: restrictions.find((r) => r.id === selectedRestriction)?.label,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar receita");
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
                setMeal(fullText);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      toast.success("Receita gerada! 🥗");
    } catch (error) {
      console.error("Error generating meal:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar receita");
      setMeal(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-success" />
            Gerar refeição com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meal type */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Qual refeição?</p>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedMealType === type.id ? "success" : "soft"}
                  size="sm"
                  onClick={() => setSelectedMealType(type.id)}
                >
                  {type.emoji} {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Cooking time */}
          <div>
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Tempo de preparo
            </p>
            <div className="flex flex-wrap gap-2">
              {cookingTimes.map((time) => (
                <Button
                  key={time.id}
                  variant={selectedTime === time.id ? "default" : "soft"}
                  size="sm"
                  onClick={() => setSelectedTime(time.id)}
                >
                  {time.emoji} {time.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Restrições alimentares</p>
            <div className="flex flex-wrap gap-2">
              {restrictions.map((restriction) => (
                <Button
                  key={restriction.id}
                  variant={selectedRestriction === restriction.id ? "default" : "soft"}
                  size="sm"
                  onClick={() => setSelectedRestriction(restriction.id)}
                >
                  {restriction.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full gap-2"
            onClick={generateMeal}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando receita...
              </>
            ) : (
              <>
                <Utensils className="w-5 h-5" />
                Gerar receita saudável
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated meal */}
      {meal && (
        <Card variant="glass" className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              👨‍🍳 Sua Receita Personalizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {meal}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
