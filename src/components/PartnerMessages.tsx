import { useState } from "react";
import { Heart, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const quickMessages = [
  { id: 1, text: "Orgulho de você! 💪", emoji: "💪" },
  { id: 2, text: "Vamos juntos amanhã? 🏃", emoji: "🏃" },
  { id: 3, text: "Te amo! ❤️", emoji: "❤️" },
  { id: 4, text: "Você é incrível! ⭐", emoji: "⭐" },
  { id: 5, text: "Saudade de treinar juntos 🥺", emoji: "🥺" },
  { id: 6, text: "Bora comer saudável hoje? 🥗", emoji: "🥗" },
];

interface Message {
  id: number;
  text: string;
  from: "you" | "partner";
  time: string;
}

const mockMessages: Message[] = [
  { id: 1, text: "Bom dia amor! Já tomei meu café saudável ☕", from: "partner", time: "08:30" },
  { id: 2, text: "Que orgulho! Vou fazer o mesmo 💚", from: "you", time: "08:45" },
  { id: 3, text: "Vamos caminhar depois do trabalho?", from: "partner", time: "14:20" },
];

export const PartnerMessages = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSendQuickMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      from: "you",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMessage]);
    toast.success("Mensagem enviada! 💌", {
      description: "Seu amor vai adorar receber isso.",
    });
  };

  return (
    <Card variant="love">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-love fill-love" />
          Mensagens com seu amor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message history */}
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {messages.slice(-4).map((message) => (
            <div
              key={message.id}
              className={`flex ${message.from === "you" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.from === "you"
                    ? "bg-love text-love-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.from === "you" ? "text-love-foreground/70" : "text-muted-foreground"
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick messages */}
        <div>
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Mensagens rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {quickMessages.map((msg) => (
              <Button
                key={msg.id}
                variant="soft"
                size="sm"
                className="text-xs"
                onClick={() => handleSendQuickMessage(msg.text)}
              >
                {msg.emoji} {msg.text.replace(msg.emoji, "").trim()}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
