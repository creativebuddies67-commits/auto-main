"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Store,
  FileText,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  dealerGroups: number;
  rooftops: number;
  completedQuestionnaires: number;
  signedOffRulebooks: number;
}

interface RecentRooftop {
  id: string;
  name: string;
  brands: string[];
  questionnaire_status: string;
  dealer_groups: { name: string };
}

async function fetchStats(): Promise<Stats> {
  const [groups, rooftops, rulebooks] = await Promise.all([
    supabase.from("dealer_groups").select("id", { count: "exact" }),
    supabase
      .from("rooftops")
      .select("id, questionnaire_status", { count: "exact" }),
    supabase.from("rulebooks").select("id, status", { count: "exact" }),
  ]);

  const completed =
    rooftops.data?.filter((r) => r.questionnaire_status === "completed")
      .length ?? 0;
  const signedOff =
    rulebooks.data?.filter((r) => ["signed_off", "pushed"].includes(r.status))
      .length ?? 0;

  return {
    dealerGroups: groups.count ?? 0,
    rooftops: rooftops.count ?? 0,
    completedQuestionnaires: completed,
    signedOffRulebooks: signedOff,
  };
}

async function fetchRecentRooftops(): Promise<RecentRooftop[]> {
  const { data } = await supabase
    .from("rooftops")
    .select("id, name, brands, questionnaire_status, dealer_groups(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (data ?? []) as RecentRooftop[];
}

const STAT_CONFIG = [
  { key: "dealerGroups", label: "Dealer Groups", icon: Building2 },
  { key: "rooftops", label: "Rooftops", icon: Store },
  { key: "completedQuestionnaires", label: "Questionnaires", icon: FileText },
  { key: "signedOffRulebooks", label: "Signed Off", icon: CheckCircle },
] as const;

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStats,
  });

  const { data: recentRooftops, isLoading: loadingRooftops } = useQuery({
    queryKey: ["recent-rooftops"],
    queryFn: fetchRecentRooftops,
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-medium">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Onboarding progress overview
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon }) => (
          <div key={key} className="p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
              </span>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            {loadingStats ? (
              <Skeleton className="h-7 w-10" />
            ) : (
              <p className="text-2xl font-medium">{stats?.[key] ?? 0}</p>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent Rooftops</h2>
          <Link href="/dealer-groups">
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="border border-border">
          {loadingRooftops ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentRooftops?.length ? (
            <div className="divide-y divide-border">
              {recentRooftops.map((rooftop) => (
                <Link
                  key={rooftop.id}
                  href={`/rooftops/${rooftop.id}`}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 border border-border flex items-center justify-center">
                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm">{rooftop.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {rooftop.dealer_groups?.name} ·{" "}
                        {rooftop.brands?.join(", ")}
                      </p>
                    </div>
                  </div>
                  {rooftop.questionnaire_status === "completed" ? (
                    <span className="text-[10px] border border-border px-1.5 py-0.5">
                      Complete
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      Draft
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Store className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-3">
                No rooftops yet
              </p>
              <Link href="/dealer-groups">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Create dealer group
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
