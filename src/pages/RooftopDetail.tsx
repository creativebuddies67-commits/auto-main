"use client";
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { US_TIMEZONES } from '@/lib/constants';
import { QuestionnaireForm } from '@/components/rooftop/QuestionnaireForm';
import { WebsiteExtraction } from '@/components/rooftop/WebsiteExtraction';
import { RulebookEditor } from '@/components/rooftop/RulebookEditor';
import {
  Store,
  ChevronLeft,
  FileText,
  Globe,
  BookOpen,
  Upload,
  Trash2,
  ExternalLink,
  Link,
} from 'lucide-react';
import type { RooftopWithDetails, RooftopDocument } from '@/types/database';
import { useParams } from 'next/navigation';

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

export default function RooftopDetail() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : undefined;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: rooftop, isLoading } = useQuery({
    queryKey: ['rooftop', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooftops')
        .select(`
          *,
          dealer_groups(name),
          rooftop_documents(*),
          website_extractions(*),
          rulebooks(*),
          retell_agents(*)
        `)
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as unknown as RooftopWithDetails;
    },
  });

 const uploadMutation = useMutation({
  mutationFn: async (file: File) => {
    // List buckets
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (bucketErr) throw bucketErr;

    // Check if bucket exists safely
    if (!buckets || !buckets.find(b => b.name === 'rooftop-documents')) {
      throw new Error('Supabase bucket "rooftop-documents" does not exist. Please create it.');
    }

    const ext = file.name.split('.').pop();
    const path = `${id}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('rooftop-documents')
      .upload(path, file);
    if (uploadErr) throw uploadErr;

    const { error: dbErr } = await supabase.from('rooftop_documents').insert({
      rooftop_id: id!,
      file_name: file.name,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user?.id,
    });
    if (dbErr) throw dbErr;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['rooftop', id] });
    toast({ title: 'Uploaded', description: 'Document uploaded.', variant: 'default' });
  },
  onError: (err) => {
    toast({ title: 'Error', description: err.message, variant: 'default' });
  },
});


  const deleteMutation = useMutation({
    mutationFn: async (doc: RooftopDocument) => {
      const { error: storageErr } = await supabase.storage
        .from('rooftop-documents')
        .remove([doc.file_path]);
      if (storageErr) throw storageErr;

      const { error: dbErr } = await supabase
        .from('rooftop_documents')
        .delete()
        .eq('id', doc.id);
      if (dbErr) throw dbErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooftop', id] });
      toast({ title: 'Deleted', description: 'Document removed.' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'default' });
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: 'Error', description: 'PDF or image only.', variant: 'default' });
      return;
    }

    setUploading(true);
    await uploadMutation.mutateAsync(file);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const timezone = US_TIMEZONES.find(tz => tz.value === rooftop?.timezone)?.label ?? rooftop?.timezone;
  const documents = (rooftop?.rooftop_documents ?? []) as RooftopDocument[];
  const hasDocuments = documents.length > 0;

  if (isLoading) {
    return (
     
        <><Skeleton className="h-5 w-48 mb-4" /><Skeleton className="h-64 w-full" /></>
      
    );
  }

  return (
 
      <div className="space-y-6">
        <nav className="flex items-center gap-1.5 text-xs flex-wrap">
          <Link href="/dealer-groups" className="text-muted-foreground hover:text-foreground flex items-center gap-0.5">
            <ChevronLeft className="h-3 w-3" />
            Dealer Groups
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link
            to={`/dealer-groups/${rooftop?.dealer_group_id}`}
            className="text-muted-foreground hover:text-foreground"
          >
            {(rooftop?.dealer_groups as { name: string })?.name}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span>{rooftop?.name}</span>
        </nav>

        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 border border-border flex items-center justify-center">
              <Store className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-medium">{rooftop?.name}</h1>
              <p className="text-xs text-muted-foreground">
                {rooftop?.brands.join(', ')} · {timezone}
              </p>
            </div>
          </div>
          <a
            href={rooftop?.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Website
          </a>
        </header>

        <section className="p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Documents
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Upload at least one PDF or image (required)
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-7 gap-1 text-xs"
              >
                <Upload className="h-3 w-3" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-1.5">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-2 px-2.5 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs">{doc.file_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(doc)}
                    disabled={deleteMutation.isPending}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No documents uploaded
            </p>
          )}
        </section>

        <Tabs defaultValue="questionnaire" className="space-y-4">
          <TabsList className="h-8 p-0.5 bg-muted border border-border">
            <TabsTrigger value="questionnaire" className="h-7 gap-1 text-[11px] data-[state=active]:bg-background">
              <FileText className="h-3 w-3" />
              Questionnaire
            </TabsTrigger>
            <TabsTrigger value="extraction" className="h-7 gap-1 text-[11px] data-[state=active]:bg-background">
              <Globe className="h-3 w-3" />
              Website Data
            </TabsTrigger>
            <TabsTrigger
              value="rulebook"
              className="h-7 gap-1 text-[11px] data-[state=active]:bg-background"
              disabled={!hasDocuments}
            >
              <BookOpen className="h-3 w-3" />
              Rulebook
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questionnaire">
            <QuestionnaireForm rooftopId={id!} />
          </TabsContent>

          <TabsContent value="extraction">
            <WebsiteExtraction rooftopId={id!} websiteUrl={rooftop?.website_url ?? ''} />
          </TabsContent>

          <TabsContent value="rulebook">
            {hasDocuments ? (
              <RulebookEditor rooftopId={id!} />
            ) : (
              <div className="text-center py-10 border border-dashed border-border">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Upload a document to generate rulebook.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
   
  );
}
