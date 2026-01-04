import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "workout") {
      systemPrompt = `Você é um personal trainer carinhoso e motivador especializado em casais. 
Crie planos de treino simples, eficazes e que podem ser feitos juntos ou individualmente.
Foque em:
- Exercícios que não precisam de equipamentos caros
- Variações para diferentes níveis de condicionamento
- Sugestões de exercícios para fazer em casal
- Linguagem acolhedora e motivadora
- Duração de 20-45 minutos
Responda em português brasileiro. Use emojis moderadamente.`;

      userPrompt = `Crie um plano de treino personalizado com base nestas preferências:
${preferences.goal ? `Objetivo: ${preferences.goal}` : "Objetivo: Saúde geral e bem-estar"}
${preferences.duration ? `Duração preferida: ${preferences.duration}` : "Duração: 30 minutos"}
${preferences.level ? `Nível de condicionamento: ${preferences.level}` : "Nível: Iniciante"}
${preferences.equipment ? `Equipamentos disponíveis: ${preferences.equipment}` : "Equipamentos: Nenhum (treino funcional)"}
${preferences.together ? "Incluir exercícios para fazer em casal" : ""}

Formate a resposta com:
1. Nome criativo para o treino
2. Aquecimento (3-5 minutos)
3. Treino principal (exercícios com séries e repetições)
4. Relaxamento/alongamento
5. Uma mensagem motivacional para o casal`;

    } else if (type === "meal") {
      systemPrompt = `Você é um nutricionista gentil e prático especializado em alimentação para casais.
Crie sugestões de refeições saudáveis, saborosas e práticas.
Foque em:
- Receitas simples que podem ser preparadas juntos
- Ingredientes acessíveis
- Opções equilibradas sem extremismos
- Porções para 2 pessoas
- Linguagem acolhedora e sem julgamentos
Responda em português brasileiro. Use emojis moderadamente.`;

      userPrompt = `Crie um plano de refeição saudável com base nestas preferências:
${preferences.mealType ? `Tipo de refeição: ${preferences.mealType}` : "Tipo: Almoço"}
${preferences.restrictions ? `Restrições alimentares: ${preferences.restrictions}` : "Sem restrições"}
${preferences.cookingTime ? `Tempo de preparo: ${preferences.cookingTime}` : "Tempo: até 30 minutos"}
${preferences.cuisine ? `Estilo culinário preferido: ${preferences.cuisine}` : ""}

Formate a resposta com:
1. Nome da receita
2. Ingredientes (para 2 pessoas)
3. Modo de preparo simples
4. Dicas de preparo em casal
5. Informações nutricionais resumidas
6. Variações possíveis`;

    } else {
      systemPrompt = `Você é um coach de bem-estar acolhedor especializado em casais.
Dê dicas práticas e motivadoras sobre saúde, exercícios e alimentação.
Responda em português brasileiro com linguagem carinhosa.`;

      userPrompt = preferences.question || "Dê uma dica de bem-estar para casais.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione mais créditos em Configurações." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar conteúdo. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
