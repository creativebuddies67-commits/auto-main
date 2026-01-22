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
import { US_TIMEZONES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Store,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import type { DealerGroup, Rooftop } from "@/types/database";
import { useParams } from "next/navigation";
import Link from "next/link";

interface FormData {
  name: string;
  brands: string;
  website_url: string;
  timezone: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  brands: "",
  website_url: "",
  timezone: "America/New_York",
};

export default function DealerGroupDetail() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : undefined;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: group, isLoading: loadingGroup } = useQuery({
    queryKey: ["dealer-group", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dealer_groups")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as DealerGroup;
    },
  });

  const { data: rooftops, isLoading: loadingRooftops } = useQuery({
    queryKey: ["rooftops", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooftops")
        .select("*")
        .eq("dealer_group_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Rooftop[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const brands = form.brands
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      const { data, error } = await supabase
        .from("rooftops")
        .insert({
          dealer_group_id: id!,
          name: form.name,
          brands,
          website_url: form.website_url,
          timezone: form.timezone,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooftops", id] });
      queryClient.invalidateQueries({ queryKey: ["rooftop-counts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      setForm(INITIAL_FORM);
      toast({ title: "Created", description: "Rooftop created." });
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
    if (!form.name.trim()) {
      toast({
        title: "Error",
        description: "Name required.",
        variant: "default",
      });
      return;
    }
    if (!form.brands.trim()) {
      toast({
        title: "Error",
        description: "Brand(s) required.",
        variant: "default",
      });
      return;
    }
    if (!form.website_url.trim()) {
      toast({
        title: "Error",
        description: "Website required.",
        variant: "default",
      });
      return;
    }
    try {
      new URL(form.website_url);
    } catch {
      toast({
        title: "Error",
        description: "Invalid URL.",
        variant: "default",
      });
      return;
    }
    createMutation.mutate();
  }

  function updateForm(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loadingGroup) {
    return (
      <>
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-48 w-full" />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-xs">
        <Link
          href="/dealer-groups"
          className="text-muted-foreground hover:text-foreground flex items-center gap-0.5"
        >
          <ChevronLeft className="h-3 w-3" />
          Dealer Groups
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{group?.name}</span>
      </nav>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">{group?.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {rooftops?.length ?? 0} rooftop{rooftops?.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Rooftop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">Add Rooftop</DialogTitle>
              <DialogDescription className="text-xs">
                Create a rooftop under {group?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div>
                <Label className="text-xs">Rooftop Name *</Label>
                <Input
                  placeholder="e.g., Smith Toyota of Dallas"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="h-9 mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Brands * (comma-separated)</Label>
                <Input
                  placeholder="e.g., Toyota, Lexus"
                  value={form.brands}
                  onChange={(e) => updateForm("brands", e.target.value)}
                  className="h-9 mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Website URL *</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={form.website_url}
                  onChange={(e) => updateForm("website_url", e.target.value)}
                  className="h-9 mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Timezone</Label>
                <Select
                  value={form.timezone}
                  onValueChange={(v) => updateForm("timezone", v)}
                >
                  <SelectTrigger className="h-9 mt-1 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {US_TIMEZONES.map((tz) => (
                      <SelectItem
                        key={tz.value}
                        value={tz.value}
                        className="text-sm"
                      >
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

      {loadingRooftops ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : rooftops?.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {rooftops.map((rooftop) => (
            <Link key={rooftop.id} href={`/rooftops/${rooftop.id}`}>
              <div className="flex items-center justify-between p-3 border border-border hover:border-foreground/30 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 border border-border flex items-center justify-center">
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">{rooftop.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {rooftop.brands.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {rooftop.questionnaire_status === "completed" && (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border">
          <Store className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-sm mb-1">No rooftops</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Add your first rooftop.
          </p>
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Rooftop
          </Button>
        </div>
      )}
    </div>
  );
}
