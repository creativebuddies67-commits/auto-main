"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, ChevronRight, Store } from "lucide-react";
import type { DealerGroup } from "@/types/database";
import Link from "next/link";

async function fetchDealerGroups(): Promise<DealerGroup[]> {
  const { data, error } = await supabase
    .from("dealer_groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as DealerGroup[];
}

async function fetchRooftopCounts(): Promise<Record<string, number>> {
  const { data } = await supabase.from("rooftops").select("dealer_group_id");

  const counts: Record<string, number> = {};
  data?.forEach((r) => {
    counts[r.dealer_group_id] = (counts[r.dealer_group_id] ?? 0) + 1;
  });

  return counts;
}

export default function DealerGroups() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["dealer-groups"],
    queryFn: fetchDealerGroups,
  });

  const { data: counts } = useQuery({
    queryKey: ["rooftop-counts"],
    queryFn: fetchRooftopCounts,
  });

  const createMutation = useMutation({
    mutationFn: async (groupName: string) => {
      const { data, error } = await supabase
        .from("dealer_groups")
        .insert({ name: groupName, created_by: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer-groups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      setName("");
      toast({ title: "Created", description: "Dealer group created." });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "default",
      });
    },
  });

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({
        title: "Error",
        description: "Name required.",
        variant: "default",
      });
      return;
    }
    createMutation.mutate(trimmed);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Dealer Groups</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage dealer groups
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">
                Create Dealer Group
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add a new dealer group.
              </DialogDescription>
            </DialogHeader>
            <div className="py-3">
              <Label htmlFor="group-name" className="text-xs">
                Group Name
              </Label>
              <Input
                id="group-name"
                placeholder="e.g., Smith Auto Group"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-9 mt-1.5 text-sm"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="h-8 text-xs"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : groups?.length ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/dealer-groups/${group.id}`}>
              <div className="flex items-center justify-between p-3 border border-border hover:border-foreground/30 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 border border-border flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">{group.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Store className="h-2.5 w-2.5" />
                      {counts?.[group.id] ?? 0} rooftops
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border">
          <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-sm mb-1">No dealer groups</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Create your first dealer group.
          </p>
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Create Group
          </Button>
        </div>
      )}
    </div>
  );
}
