import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const motivationalQuotes = [
  {
    quote: "O progresso vem da constância, não da perfeição.",
    author: "Duoos",
  },
  {
    quote: "Juntos, cada passo pequeno se torna uma grande jornada.",
    author: "Duoos",
  },
  {
    quote: "Cuidar de si é também cuidar do outro.",
    author: "Duoos",
  },
  {
    quote: "Hoje é um novo dia para construir hábitos que amamos.",
    author: "Duoos",
  },
  {
    quote: "O amor cresce quando crescemos juntos.",
    author: "Duoos",
  },
];

export const DailyMotivation = () => {
  // Get quote based on day of year for consistency
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quote = motivationalQuotes[dayOfYear % motivationalQuotes.length];

  return (
    <Card className="gradient-primary border-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-love/20" />
      <CardContent className="p-6 relative">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">
              Mensagem do dia
            </p>
            <p className="text-primary-foreground text-lg font-semibold leading-relaxed">
              "{quote.quote}"
            </p>
            <p className="text-primary-foreground/70 text-sm mt-2">
              — {quote.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
