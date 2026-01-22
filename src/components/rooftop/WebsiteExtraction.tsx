"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, RefreshCw, Save, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { WebsiteExtraction as WebsiteExtractionType } from '@/types/database';

interface WebsiteExtractionProps {
  rooftopId: string;
  websiteUrl: string;
}

export function WebsiteExtraction({ rooftopId, websiteUrl }: WebsiteExtractionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState({
    service_address: '',
    weekday_hours: '',
    saturday_hours: '',
  });

  const { data: extraction, isLoading } = useQuery({
    queryKey: ['website-extraction', rooftopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_extractions')
        .select('*')
        .eq('rooftop_id', rooftopId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setFormData({
          service_address: data.service_address || '',
          weekday_hours: data.weekday_hours || '',
          saturday_hours: data.saturday_hours || '',
        });
      }
      return data as WebsiteExtractionType | null;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        rooftop_id: rooftopId,
        service_address: formData.service_address || null,
        weekday_hours: formData.weekday_hours || null,
        saturday_hours: formData.saturday_hours || null,
        extracted_by: user?.id,
        extracted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('website_extractions')
        .upsert(payload, { onConflict: 'rooftop_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-extraction', rooftopId] });
      queryClient.invalidateQueries({ queryKey: ['rooftop', rooftopId] });
      toast({ title: 'Saved', description: 'Website data has been saved.' });
    },
    onError: (error) => {
      toast({ title: 'Save Failed', description: error.message, variant: 'default' });
    },
  });

  const handleExtract = async () => {
    setExtracting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Manual Entry Required',
      description: 'Please enter the website data manually for MVP. Automated extraction coming soon.',
    });
    setExtracting(false);
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website Data
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Extract or manually enter service department information
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExtract}
          disabled={extracting}
          className="h-8 gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${extracting ? 'animate-spin' : ''}`} />
          {extracting ? 'Extracting...' : 'Extract'}
        </Button>
      </div>

      {/* Content */}
      <div className="px-5 py-5 space-y-5">
        <p className="text-xs text-muted-foreground">
          Source:{' '}
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
            {websiteUrl}
          </a>
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="service_address" className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Service Address
            </Label>
            <Input
              id="service_address"
              placeholder="123 Main St, City, State ZIP"
              value={formData.service_address}
              onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="weekday_hours" className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Weekday Hours
              </Label>
              <Input
                id="weekday_hours"
                placeholder="Mon-Fri: 7:00 AM - 6:00 PM"
                value={formData.weekday_hours}
                onChange={(e) => setFormData({ ...formData, weekday_hours: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="saturday_hours" className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Saturday Hours
              </Label>
              <Input
                id="saturday_hours"
                placeholder="Sat: 8:00 AM - 4:00 PM"
                value={formData.saturday_hours}
                onChange={(e) => setFormData({ ...formData, saturday_hours: e.target.value })}
                className="h-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-muted/30">
        <Button
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="h-8 gap-1.5"
        >
          <Save className="h-3.5 w-3.5" />
          {saveMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
        {extraction?.extracted_at && (
          <span className="text-xs text-muted-foreground">
            Last updated: {new Date(extraction.extracted_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
