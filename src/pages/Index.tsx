import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { CoupleStreak } from "@/components/CoupleStreak";
import { QuickStats } from "@/components/QuickStats";
import { DailyMotivation } from "@/components/DailyMotivation";
import { MealLogger } from "@/components/MealLogger";
import { ExerciseLogger } from "@/components/ExerciseLogger";
import { MoodCheckin } from "@/components/MoodCheckin";
import { PartnerMessages } from "@/components/PartnerMessages";
import { WeeklyProgress } from "@/components/WeeklyProgress";
import { CoupleGoals } from "@/components/CoupleGoals";
import { AIWorkoutGenerator } from "@/components/AIWorkoutGenerator";
import { AIMealGenerator } from "@/components/AIMealGenerator";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();
  const [coupleId, setCoupleId] = useState<string | null>(null);
  type CoupleProfile = Pick<Tables<"couples">, "your_name" | "partner_name" | "main_goal">;
  const [coupleProfile, setCoupleProfile] = useState<CoupleProfile | null>(null);
  const [mealHistory, setMealHistory] = useState<Tables<"meal_logs">[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<Tables<"exercise_logs">[]>([]);
  const [moodHistory, setMoodHistory] = useState<Tables<"mood_checkins">[]>([]);
  const [mealRange, setMealRange] = useState<"today" | "7d" | "30d" | "all">("today");
  const [exerciseRange, setExerciseRange] = useState<"today" | "7d" | "30d" | "all">("today");
  const [moodRange, setMoodRange] = useState<"today" | "7d" | "30d" | "all">("today");
  const [mealPage, setMealPage] = useState(1);
  const [exercisePage, setExercisePage] = useState(1);
  const [moodPage, setMoodPage] = useState(1);
  const [resetting, setResetting] = useState(false);
  const [targets, setTargets] = useState<{ workout: number; meals: number; mood: number }>({ workout: 3, meals: 14, mood: 7 });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [appLogoUrl, setAppLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        navigate("/onboarding");
        return;
      }
      const { data: membership } = await supabase
        .from("couple_members")
        .select("couple_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (membership?.couple_id) {
        setCoupleId(membership.couple_id as string);
        return;
      }
      const { data } = await supabase
        .from("couples")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle();
      if (data?.id) {
        setCoupleId(data.id as string);
      } else {
        navigate("/onboarding");
      }
    };
    checkOnboarding();
  }, [navigate]);

  useEffect(() => {
    const loadCoupleProfile = async () => {
      if (!coupleId) return;
      const { data } = await supabase
        .from("couples")
        .select("your_name, partner_name, main_goal")
        .eq("id", coupleId)
        .maybeSingle();
      if (data) {
        setCoupleProfile(data as CoupleProfile);
      }
      const { data: settingsRow } = await supabase
        .from("goals")
        .select("id, description")
        .eq("couple_id", coupleId)
        .eq("goal_type", "settings")
        .maybeSingle();
      if (settingsRow?.description) {
        try {
          const parsed = JSON.parse(settingsRow.description as string);
          setTargets({
            workout: Number(parsed.workout) || 3,
            meals: Number(parsed.meals) || 14,
            mood: Number(parsed.mood) || 7,
          });
        } catch (e) {
          console.error("Erro ao ler metas do Supabase", e);
        }
      }
    };
    loadCoupleProfile();
    const saved = localStorage.getItem(`couple_targets_${coupleId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTargets({
          workout: Number(parsed.workout) || 3,
          meals: Number(parsed.meals) || 14,
          mood: Number(parsed.mood) || 7,
        });
      } catch (e) {
        console.error("Erro ao carregar metas salvas", e);
      }
    }
  }, [coupleId]);

  useEffect(() => {
    const loadAvatar = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;
      const meta = user.user_metadata as Record<string, unknown>;
      const url = meta?.["avatar_url"] as string | undefined;
      if (url) setAvatarUrl(url);
    };
    loadAvatar();
  }, []);

  useEffect(() => {
    const savedLogo = localStorage.getItem("app_logo_url");
    if (savedLogo) setAppLogoUrl(savedLogo);
  }, []);

  const UserAvatarSettings = () => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFile = async (file: File) => {
      setUploading(true);
      setFileName(file.name);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        toast.error("Faça login para atualizar a imagem");
        setUploading(false);
        return;
      }
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
      const path = `avatars/${user.id}-${Date.now()}.${ext}`;
      const { error: upError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upError) {
        toast.error("Falha ao enviar imagem");
        setUploading(false);
        return;
      }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      const { error: metaError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (metaError) {
        toast.error("Falha ao salvar imagem");
        setUploading(false);
        return;
      }
      setAvatarUrl(publicUrl);
      toast.success("Imagem atualizada");
      setUploading(false);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
            <AvatarFallback>
              {(coupleProfile?.your_name || "U").slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs text-muted-foreground">
            {fileName ? `Selecionado: ${fileName}` : "PNG/JPG até 2MB"}
          </div>
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="w-full text-sm"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const { data: userData } = await supabase.auth.getUser();
              if (!userData.user) return;
              await supabase.auth.signOut();
              navigate("/auth");
            }}
          >
            Deslogar
          </Button>
        </div>
      </div>
    );
  };

  const BrandLogoSettings = () => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFile = async (file: File) => {
      setUploading(true);
      setFileName(file.name);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        toast.error("Faça login para atualizar o logo");
        setUploading(false);
        return;
      }
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
      const path = `avatars/brand-logo-${Date.now()}.${ext}`;
      const { error: upError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upError) {
        toast.error("Falha ao enviar logo");
        setUploading(false);
        return;
      }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      localStorage.setItem("app_logo_url", publicUrl);
      setAppLogoUrl(publicUrl);
      if (coupleId) {
        const { data: existing } = await supabase
          .from("goals")
          .select("id")
          .eq("couple_id", coupleId)
          .eq("goal_type", "branding")
          .maybeSingle();
        const payload: TablesInsert<"goals"> = {
          couple_id: coupleId,
          goal_type: "branding",
          description: JSON.stringify({ logo_url: publicUrl }),
          status: "active",
          updated_at: new Date().toISOString(),
        };
        if (existing?.id) {
          await supabase.from("goals").update(payload).eq("id", existing.id);
        } else {
          payload["created_at"] = new Date().toISOString();
          await supabase.from("goals").insert(payload);
        }
      }
      toast.success("Logo atualizado");
      setUploading(false);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {appLogoUrl ? (
            <img src={appLogoUrl} alt="Logo" className="h-8 w-auto rounded" />
          ) : (
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft" />
          )}
          <div className="text-xs text-muted-foreground">
            {fileName ? `Selecionado: ${fileName}` : "PNG/JPG até 2MB"}
          </div>
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="w-full text-sm"
        />
      </div>
    );
  };

  const limit = 10;

  const fromDateFor = (range: "today" | "7d" | "30d" | "all") => {
    const now = new Date();
    if (range === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return start.toISOString();
    }
    if (range === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d.toISOString();
    }
    if (range === "30d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d.toISOString();
    }
    return null;
  };

  useEffect(() => {
    const loadMeals = async () => {
      if (!coupleId) return;
      const from = fromDateFor(mealRange);
      let q = supabase
        .from("meal_logs")
        .select("*")
        .eq("couple_id", coupleId)
        .order("occurred_at", { ascending: false });
      if (from) q = q.gte("occurred_at", from);
      q = q.range((mealPage - 1) * limit, mealPage * limit - 1);
      const { data } = await q;
      if (data) setMealHistory(data as Tables<"meal_logs">[]);
    };
    loadMeals();
  }, [coupleId, mealRange, mealPage]);

  useEffect(() => {
    const loadExercises = async () => {
      if (!coupleId) return;
      const from = fromDateFor(exerciseRange);
      let q = supabase
        .from("exercise_logs")
        .select("*")
        .eq("couple_id", coupleId)
        .order("occurred_at", { ascending: false });
      if (from) q = q.gte("occurred_at", from);
      q = q.range((exercisePage - 1) * limit, exercisePage * limit - 1);
      const { data } = await q;
      if (data) setExerciseHistory(data as Tables<"exercise_logs">[]);
    };
    loadExercises();
  }, [coupleId, exerciseRange, exercisePage]);

  useEffect(() => {
    const loadMoods = async () => {
      if (!coupleId) return;
      const from = fromDateFor(moodRange);
      let q = supabase
        .from("mood_checkins")
        .select("*")
        .eq("couple_id", coupleId)
        .order("occurred_at", { ascending: false });
      if (from) q = q.gte("occurred_at", from);
      q = q.range((moodPage - 1) * limit, moodPage * limit - 1);
      const { data } = await q;
      if (data) setMoodHistory(data as Tables<"mood_checkins">[]);
    };
    loadMoods();
  }, [coupleId, moodRange, moodPage]);

  return (
    <div className="min-h-screen gradient-hero pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {activeTab === "home" && (
          <div className="space-y-6 animate-fade-in">
            {/* Couple Streak */}
            <CoupleStreak
              streak={(function computeStreak() {
                const byDay = new Map<string, number>();
                const all: { occurred_at: string }[] = [
                  ...mealHistory.map(m => ({ occurred_at: m.occurred_at })),
                  ...exerciseHistory.map(e => ({ occurred_at: e.occurred_at })),
                  ...moodHistory.map(m => ({ occurred_at: m.occurred_at })),
                ];
                all.forEach((r) => {
                  const d = new Date(r.occurred_at);
                  const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
                  byDay.set(key, (byDay.get(key) || 0) + 1);
                });
                let streak = 0;
                const today = new Date();
                for (let i = 0; i < 30; i++) {
                  const d = new Date(today);
                  d.setDate(d.getDate() - i);
                  const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
                  if ((byDay.get(key) || 0) > 0) streak++;
                  else break;
                }
                return streak;
              })()}
              partnerName={coupleProfile?.partner_name || "Parceiro(a)"}
            />
            {coupleProfile && (
              <div className="p-4 rounded-xl bg-card border border-border/50">
                <p className="text-sm">
                  Bem-vindos, <span className="font-semibold">{coupleProfile.your_name}</span> e {coupleProfile.partner_name}.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Objetivo: {({
                    health: "Saúde e bem-estar",
                    weight_loss: "Emagrecimento",
                    muscle: "Ganho de massa",
                    cardio: "Resistência cardiovascular",
                  } as Record<string, string>)[coupleProfile.main_goal] || coupleProfile.main_goal}
                </p>
              </div>
            )}
            
            {/* Daily Motivation */}
            <DailyMotivation />
            
            {/* Weekly numbers */}
            {(() => {
              const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
              const exercisesThisWeek = exerciseHistory.filter(e => new Date(e.occurred_at) >= cutoff).length;
              const healthyMealsThisWeek = mealHistory.filter(m => new Date(m.occurred_at) >= cutoff && m.healthy === true).length;
              const togetherActivities = exerciseHistory.filter(e => new Date(e.occurred_at) >= cutoff && e.together).length;
              const moods = moodHistory.filter(m => new Date(m.occurred_at) >= cutoff).map(m => m.mood);
              const freq = new Map<string, number>();
              moods.forEach((m) => freq.set(m, (freq.get(m) || 0) + 1));
              let top: string | null = null; let best = 0;
              freq.forEach((v, k) => { if (v > best) { best = v; top = k; } });
              const map: Record<string, string> = { "Ótimo": "😊", "Bem": "🙂", "Ok": "😐", "Baixo": "😔", "Difícil": "😢" };
              const averageMood = (top && map[top]) || "😊";

              return (
                <>
                  <QuickStats 
                    exercisesThisWeek={exercisesThisWeek}
                    healthyMeals={healthyMealsThisWeek}
                    averageMood={averageMood}
                    togetherActivities={togetherActivities}
                  />
                  <CoupleGoals 
                    exercisesThisWeek={togetherActivities}
                    healthyMealsThisWeek={healthyMealsThisWeek}
                    checkinsThisWeek={moodHistory.filter(m => new Date(m.occurred_at) >= cutoff).length}
                    targets={targets}
                  />
                </>
              );
            })()}

            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!coupleId) {
                    toast.error("Conclua o onboarding para resetar");
                    return;
                  }
                  setResetting(true);
                  const ops = [
                    supabase.from("meal_logs").delete().eq("couple_id", coupleId),
                    supabase.from("exercise_logs").delete().eq("couple_id", coupleId),
                    supabase.from("mood_checkins").delete().eq("couple_id", coupleId),
                    supabase.from("partner_messages").delete().eq("couple_id", coupleId),
                  ];
                  try {
                    await Promise.all(ops);
                    setMealHistory([]);
                    setExerciseHistory([]);
                    setMoodHistory([]);
                    toast.success("Dados do casal resetados");
                  } catch (error) {
                    console.error("Erro ao resetar dados", error);
                    toast.error("Falha ao resetar dados");
                  } finally {
                    setResetting(false);
                  }
                }}
                disabled={resetting || !coupleId}
              >
                {resetting ? "Resetando..." : "Resetar dados"}
              </Button>
              <p className="text-xs text-muted-foreground">Remove históricos de refeições, exercícios, check-ins e mensagens.</p>
            </div>
            
            {/* Weekly Progress */}
            <WeeklyProgress />
            
            {/* Couple Goals are included above with real data */}
          </div>
        )}

        {activeTab === "meals" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Alimentação</h2>
            <p className="text-muted-foreground">
              Registre suas refeições sem culpa ou obsessão 💚
            </p>
            
            {/* AI Meal Generator */}
            <AIMealGenerator />
            
            <MealLogger />
            
            <div className="space-y-3">
              <h3 className="font-semibold">Últimas refeições</h3>
              <div className="flex items-center gap-2">
                {(["today","7d","30d","all"] as const).map((r) => (
                  <Button key={r} variant={mealRange === r ? "default" : "soft"} size="sm" onClick={() => { setMealRange(r); setMealPage(1); }}>
                    {r === "today" ? "Hoje" : r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : "Tudo"}
                  </Button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="soft" size="sm" disabled={mealPage === 1} onClick={() => setMealPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                  <Button variant="soft" size="sm" onClick={() => setMealPage((p) => p + 1)}>Próxima</Button>
                </div>
              </div>
              <div className="space-y-2">
                {mealHistory.map((m) => {
                  const emoji = m.healthy === true ? "🥗" : m.healthy === false ? "🍕" : "⚖️";
                  const label = m.type === "healthy" ? "Saudável" : m.type === "free" ? "Livre consciente" : "Equilibrado";
                  const time = new Date(m.occurred_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{time}</p>
                      </div>
                    </div>
                  );
                })}
                {mealHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem registros ainda</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Configurações</h2>
            <p className="text-muted-foreground">Ajuste as metas e gerencie dados do casal</p>
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
              <p className="text-sm font-medium">Logo da aplicação</p>
              <BrandLogoSettings />
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
              <p className="text-sm font-medium">Perfil</p>
              <UserAvatarSettings />
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
              <p className="text-sm font-medium">Metas da semana</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Treinos juntos</label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={targets.workout}
                    onChange={(e) => setTargets((t) => ({ ...t, workout: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Refeições saudáveis</label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={targets.meals}
                    onChange={(e) => setTargets((t) => ({ ...t, meals: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Check-ins</label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={targets.mood}
                    onChange={(e) => setTargets((t) => ({ ...t, mood: Number(e.target.value) }))}
                  />
                </div>
              </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const defaults = { workout: 3, meals: 14, mood: 7 };
                        setTargets(defaults);
                        if (coupleId) localStorage.setItem(`couple_targets_${coupleId}`, JSON.stringify(defaults));
                      }}
                    >
                      Restaurar padrão
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!coupleId) return;
                        localStorage.setItem(`couple_targets_${coupleId}`, JSON.stringify(targets));
                        const { data: existing } = await supabase
                          .from("goals")
                          .select("id")
                          .eq("couple_id", coupleId)
                          .eq("goal_type", "settings")
                          .maybeSingle();
                        const payload: TablesInsert<"goals"> = {
                          couple_id: coupleId,
                          goal_type: "settings",
                          description: JSON.stringify(targets),
                          status: "active",
                          updated_at: new Date().toISOString(),
                        };
                        if (existing?.id) {
                          await supabase.from("goals").update(payload).eq("id", existing.id);
                        } else {
                          payload["created_at"] = new Date().toISOString();
                          await supabase.from("goals").insert(payload);
                        }
                        toast.success("Metas atualizadas");
                      }}
                    >
                      Salvar metas
                    </Button>
                  </div>
                </div>
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!coupleId) {
                    toast.error("Conclua o onboarding para resetar");
                    return;
                  }
                  setResetting(true);
                  const ops = [
                    supabase.from("meal_logs").delete().eq("couple_id", coupleId),
                    supabase.from("exercise_logs").delete().eq("couple_id", coupleId),
                    supabase.from("mood_checkins").delete().eq("couple_id", coupleId),
                    supabase.from("partner_messages").delete().eq("couple_id", coupleId),
                  ];
                  try {
                    await Promise.all(ops);
                    setMealHistory([]);
                    setExerciseHistory([]);
                    setMoodHistory([]);
                    toast.success("Dados do casal resetados");
                  } catch (error) {
                    console.error("Erro ao resetar dados", error);
                    toast.error("Falha ao resetar dados");
                  } finally {
                    setResetting(false);
                  }
                }}
                disabled={resetting || !coupleId}
              >
                {resetting ? "Resetando..." : "Resetar dados"}
              </Button>
              <p className="text-xs text-muted-foreground">Remove históricos de refeições, exercícios, check-ins e mensagens.</p>
            </div>
          </div>
        )}

        {activeTab === "exercise" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Exercícios</h2>
            <p className="text-muted-foreground">
              Cada movimento conta, especialmente os feitos juntos 💪
            </p>
            
            {/* AI Workout Generator */}
            <AIWorkoutGenerator />
            
            <ExerciseLogger />

            <div className="space-y-3">
              <h3 className="font-semibold">Últimos exercícios</h3>
              <div className="flex items-center gap-2">
                {(["today","7d","30d","all"] as const).map((r) => (
                  <Button key={r} variant={exerciseRange === r ? "default" : "soft"} size="sm" onClick={() => { setExerciseRange(r); setExercisePage(1); }}>
                    {r === "today" ? "Hoje" : r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : "Tudo"}
                  </Button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="soft" size="sm" disabled={exercisePage === 1} onClick={() => setExercisePage((p) => Math.max(1, p - 1))}>Anterior</Button>
                  <Button variant="soft" size="sm" onClick={() => setExercisePage((p) => p + 1)}>Próxima</Button>
                </div>
              </div>
              <div className="space-y-2">
                {exerciseHistory.map((e) => {
                  const time = new Date(e.occurred_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={e.id} className="p-3 bg-card rounded-xl border border-border/50">
                      <p className="font-medium">{e.type} • {e.duration_minutes ?? 0} min • {e.intensity ?? ""}</p>
                      <p className="text-sm text-muted-foreground">{e.together ? "Feito juntos" : "Solo"} • {time}</p>
                    </div>
                  );
                })}
                {exerciseHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem registros ainda</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "connection" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Conexão</h2>
            <p className="text-muted-foreground">
              Motivem-se e cuidem um do outro 💕
            </p>
            <PartnerMessages />
            <MoodCheckin />

            <div className="space-y-3">
              <h3 className="font-semibold">Últimos check-ins</h3>
              <div className="flex items-center gap-2">
                {(["today","7d","30d","all"] as const).map((r) => (
                  <Button key={r} variant={moodRange === r ? "default" : "soft"} size="sm" onClick={() => { setMoodRange(r); setMoodPage(1); }}>
                    {r === "today" ? "Hoje" : r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : "Tudo"}
                  </Button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="soft" size="sm" disabled={moodPage === 1} onClick={() => setMoodPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                  <Button variant="soft" size="sm" onClick={() => setMoodPage((p) => p + 1)}>Próxima</Button>
                </div>
              </div>
              <div className="space-y-2">
                {moodHistory.map((m) => {
                  const time = new Date(m.occurred_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={m.id} className="p-3 bg-card rounded-xl border border-border/50">
                      <p className="font-medium">{m.mood}</p>
                      <p className="text-sm text-muted-foreground">{time}</p>
                    </div>
                  );
                })}
                {moodHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem registros ainda</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Evolução</h2>
            <p className="text-muted-foreground">
              Vejam como estão crescendo juntos 📈
            </p>
            
            <WeeklyProgress />
            {(() => {
              const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
              const togetherActivities = exerciseHistory.filter(e => new Date(e.occurred_at) >= cutoff && e.together).length;
              const healthyMealsThisWeek = mealHistory.filter(m => new Date(m.occurred_at) >= cutoff && m.healthy === true).length;
              const checkinsThisWeek = moodHistory.filter(m => new Date(m.occurred_at) >= cutoff).length;
              return (
                <CoupleGoals 
                  exercisesThisWeek={togetherActivities}
                  healthyMealsThisWeek={healthyMealsThisWeek}
                  checkinsThisWeek={checkinsThisWeek}
                  targets={targets}
                />
              );
            })()}
            
            {/* Streak History */}
            <div className="space-y-3">
              <h3 className="font-semibold">Histórico de streaks</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Atual", value: 12, icon: "🔥" },
                  { label: "Melhor", value: 28, icon: "🏆" },
                  { label: "Total dias", value: 156, icon: "📅" },
                ].map((stat) => (
                  <div 
                    key={stat.label}
                    className="text-center p-4 bg-card rounded-xl border border-border/50"
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
