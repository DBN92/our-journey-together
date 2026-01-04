import { useState } from "react";
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen gradient-hero pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {activeTab === "home" && (
          <div className="space-y-6 animate-fade-in">
            {/* Couple Streak */}
            <CoupleStreak streak={12} partnerName="Maria" />
            
            {/* Daily Motivation */}
            <DailyMotivation />
            
            {/* Quick Stats */}
            <QuickStats 
              exercisesThisWeek={5}
              healthyMeals={12}
              averageMood="😊"
              togetherActivities={3}
            />
            
            {/* Weekly Progress */}
            <WeeklyProgress />
            
            {/* Couple Goals */}
            <CoupleGoals />
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
            
            {/* Meal history placeholder */}
            <div className="space-y-3">
              <h3 className="font-semibold">Hoje</h3>
              <div className="space-y-2">
                {[
                  { time: "08:30", type: "Saudável", emoji: "🥗" },
                  { time: "12:45", type: "Equilibrado", emoji: "⚖️" },
                ].map((meal, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50"
                  >
                    <span className="text-2xl">{meal.emoji}</span>
                    <div>
                      <p className="font-medium">{meal.type}</p>
                      <p className="text-sm text-muted-foreground">{meal.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Evolução</h2>
            <p className="text-muted-foreground">
              Vejam como estão crescendo juntos 📈
            </p>
            
            <WeeklyProgress />
            <CoupleGoals />
            
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
