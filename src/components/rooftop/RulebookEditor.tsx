"use client";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Wand2, Save, CheckCircle, Send, History, AlertTriangle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { RULEBOOK_TEMPLATE, QUESTIONNAIRE_QUESTIONS } from '@/lib/constants';
import type { Rulebook, RulebookEdit, QuestionnaireAnswer, WebsiteExtraction } from '@/types/database';

interface RulebookEditorProps {
  rooftopId: string;
}

export function RulebookEditor({ rooftopId }: RulebookEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [editNote, setEditNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSignOff, setShowSignOff] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: rulebook, isLoading: loadingRulebook } = useQuery({
    queryKey: ['rulebook', rooftopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rulebooks')
        .select('*')
        .eq('rooftop_id', rooftopId)
        .maybeSingle();
      if (error) throw error;
      return data as Rulebook | null;
    },
  });
  if (!user?.id) {
  throw new Error('User not authenticated');
}

  const { data: edits } = useQuery({
    queryKey: ['rulebook-edits', rulebook?.id],
    queryFn: async () => {
      if (!rulebook?.id) return [];
      const { data, error } = await supabase
        .from('rulebook_edits')
        .select('*')
        .eq('rulebook_id', rulebook.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RulebookEdit[];
    },
    enabled: !!rulebook?.id,
  });

  const { data: answers } = useQuery({
    queryKey: ['questionnaire-answers', rooftopId],
    queryFn: async () => {
      const { data } = await supabase
        .from('questionnaire_answers')
        .select('*')
        .eq('rooftop_id', rooftopId);
      return data as QuestionnaireAnswer[];
    },
  });

  const { data: extraction } = useQuery({
    queryKey: ['website-extraction', rooftopId],
    queryFn: async () => {
      const { data } = await supabase
        .from('website_extractions')
        .select('*')
        .eq('rooftop_id', rooftopId)
        .maybeSingle();
      return data as WebsiteExtraction | null;
    },
  });

  useEffect(() => {
    if (rulebook?.content) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(rulebook.content);
    }
  }, [rulebook]); 

  const generateRulebook = () => {
    let generated = RULEBOOK_TEMPLATE;
    const answersMap: Record<string, string> = {};
    answers?.forEach((a) => {
      answersMap[a.question_id] = a.answer || '';
    });

    QUESTIONNAIRE_QUESTIONS.forEach((q) => {
      const value = answersMap[q.id];
      const placeholder = `{{${q.id}}}`;
      if (value) {
        generated = generated.replace(new RegExp(placeholder, 'g'), value);
      } else if (q.required) {
        generated = generated.replace(new RegExp(placeholder, 'g'), '**MISSING - REQUIRED**');
      } else {
        generated = generated.replace(new RegExp(placeholder, 'g'), 'Not provided');
      }
    });

    const extractionFields: Record<string, string | null | undefined> = {
      service_address: extraction?.service_address,
      weekday_hours: extraction?.weekday_hours,
      saturday_hours: extraction?.saturday_hours,
    };

    Object.entries(extractionFields).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      if (value) {
        generated = generated.replace(new RegExp(placeholder, 'g'), value);
      } else {
        generated = generated.replace(new RegExp(placeholder, 'g'), '**MISSING - REQUIRED**');
      }
    });

    return generated;
  };

  const hasMissingRequired = content.includes('**MISSING - REQUIRED**');
  const isSignedOff = rulebook?.status === 'signed_off' || rulebook?.status === 'pushed';
  const isPushed = rulebook?.status === 'pushed';

  const generateMutation = useMutation({
    mutationFn: async () => {
      const generated = generateRulebook();
      const payload = {
        rooftop_id: rooftopId,
        content: generated,
        status: 'draft' as const,
      };

      if (rulebook) {
        const { error } = await supabase
          .from('rulebooks')
          .update({ content: generated, status: 'draft' })
          .eq('id', rulebook.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rulebooks').insert(payload);
        if (error) throw error;
      }

      return generated;
    },
    onSuccess: (generated) => {
      setContent(generated);
      queryClient.invalidateQueries({ queryKey: ['rulebook', rooftopId] });
      toast({ title: 'Rulebook Generated', description: 'The rulebook has been generated from your data.' });
    },
    onError: (error) => {
      toast({ title: 'Generation Failed', description: error.message, variant: 'default' });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!rulebook) throw new Error('No rulebook to save');

      const { error: editError } = await supabase
        .from("rulebook_edits")
        .insert({
          rulebook_id: rulebook.id,
          user_id: user.id,
          content_snapshot: content,
          edit_note: editNote || null,
        });
      if (editError) throw editError;

      const { error } = await supabase
        .from('rulebooks')
        .update({ content })
        .eq('id', rulebook.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rulebook', rooftopId] });
      queryClient.invalidateQueries({ queryKey: ['rulebook-edits', rulebook?.id] });
      setHasChanges(false);
      setEditNote('');
      toast({ title: 'Saved', description: 'Your changes have been saved.' });
    },
    onError: (error) => {
      toast({ title: 'Save Failed', description: error.message, variant: 'default' });
    },
  });

  const signOffMutation = useMutation({
    mutationFn: async () => {
      if (!rulebook) throw new Error('No rulebook to sign off');
      const { error } = await supabase
        .from('rulebooks')
        .update({
          status: 'signed_off',
          signed_off_at: new Date().toISOString(),
          signed_off_by: user?.id,
        })
        .eq('id', rulebook.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rulebook', rooftopId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowSignOff(false);
      toast({ title: 'Signed Off', description: 'The rulebook has been signed off.' });
    },
    onError: (error) => {
      toast({ title: 'Sign-Off Failed', description: error.message, variant: 'default' });
    },
  });

  const pushMutation = useMutation({
  mutationFn: async () => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    if (!rulebook?.id) {
      throw new Error('Rulebook not found');
    }

    if (!rooftopId) {
      throw new Error('Rooftop ID missing');
    }

    const agentId = `retell_${Date.now()}`;

    const { error: agentError } = await supabase
      .from('retell_agents')
      .upsert(
        {
          rooftop_id: rooftopId,
          agent_id: agentId,
          push_status: 'success',
          pushed_at: new Date().toISOString(),
          pushed_by: user.id, // ✅ string
        },
        { onConflict: 'rooftop_id' }
      );

    if (agentError) throw agentError;

    const { error } = await supabase
      .from('rulebooks')
      .update({ status: 'pushed' })
      .eq('id', rulebook.id); // ✅ string

    if (error) throw error;

    return agentId;
  },

  onSuccess: (agentId) => {
    queryClient.invalidateQueries({ queryKey: ['rulebook', rooftopId] });
    queryClient.invalidateQueries({ queryKey: ['rooftop', rooftopId] });
    setShowPush(false);
    toast({
      title: 'Pushed to Retell',
      description: `Agent created with ID: ${agentId}`,
    });
  },

  onError: (error) => {
    toast({
      title: 'Push Failed',
      description: error.message,
      variant: 'default',
    });
  },
});


  if (loadingRulebook) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Rulebook
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate and edit the rulebook prompt for Retell AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            {rulebook && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isPushed ? 'bg-foreground text-background' : isSignedOff ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}>
                {isPushed ? (
                  <><Send className="h-3 w-3" /> Pushed</>
                ) : isSignedOff ? (
                  <><Lock className="h-3 w-3" /> Signed Off</>
                ) : (
                  'Draft'
                )}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="h-8 gap-1.5">
              <History className="h-3.5 w-3.5" />
              History
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          {!rulebook ? (
            <div className="text-center py-12">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No rulebook generated yet. Generate one from your questionnaire and website data.
              </p>
              <Button size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="gap-1.5">
                <Wand2 className="h-3.5 w-3.5" />
                {generateMutation.isPending ? 'Generating...' : 'Generate Rulebook'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {hasMissingRequired && (
                <div className="flex items-center gap-2 p-3 bg-muted border border-border rounded-md text-foreground">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs">
                    Some required fields are missing. Complete the questionnaire and website data before signing off.
                  </span>
                </div>
              )}

              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setHasChanges(true);
                }}
                rows={20}
                className="font-mono text-xs resize-none"
                disabled={isSignedOff}
              />

              {!isSignedOff && hasChanges && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-note" className="text-xs font-medium">Edit Note (optional)</Label>
                  <Input
                    id="edit-note"
                    placeholder="Describe your changes..."
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {rulebook && (
          <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-muted/30">
            {!isSignedOff && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="h-8 gap-1.5"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !hasChanges}
                  className="h-8 gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowSignOff(true)}
                  disabled={hasMissingRequired || hasChanges}
                  className="h-8 gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Sign Off
                </Button>
              </>
            )}

            {isSignedOff && !isPushed && (
              <Button size="sm" onClick={() => setShowPush(true)} className="h-8 gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Push to Retell
              </Button>
            )}

            {isPushed && (
              <span className="text-xs text-muted-foreground">
                This rulebook has been pushed to Retell and is now locked.
              </span>
            )}
          </div>
        )}
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit History</DialogTitle>
            <DialogDescription>
              View all changes made to this rulebook
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-80">
            {edits && edits.length > 0 ? (
              <div className="space-y-2">
                {edits.map((edit) => (
                  <div key={edit.id} className="p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">
                        {new Date(edit.created_at).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {edit.user_id.slice(0, 8)}...
                      </span>
                    </div>
                    {edit.edit_note && (
                      <p className="text-xs text-muted-foreground">{edit.edit_note}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No edit history yet.</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Sign-Off Dialog */}
      <Dialog open={showSignOff} onOpenChange={setShowSignOff}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Off Rulebook</DialogTitle>
            <DialogDescription>
              Once signed off, the rulebook will be locked for editing. You can then push it to Retell.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignOff(false)}>Cancel</Button>
            <Button onClick={() => signOffMutation.mutate()} disabled={signOffMutation.isPending}>
              {signOffMutation.isPending ? 'Signing Off...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Push Dialog */}
      <Dialog open={showPush} onOpenChange={setShowPush}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Push to Retell</DialogTitle>
            <DialogDescription>
              This will create a Retell AI agent with this rulebook. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPush(false)}>Cancel</Button>
            <Button onClick={() => pushMutation.mutate()} disabled={pushMutation.isPending}>
              {pushMutation.isPending ? 'Pushing...' : 'Push'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
