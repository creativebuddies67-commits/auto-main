"use client";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QUESTIONNAIRE_QUESTIONS } from '@/lib/constants';
import type { QuestionnaireAnswer } from '@/types/database';

interface QuestionnaireFormProps {
  rooftopId: string;
}

export function QuestionnaireForm({ rooftopId }: QuestionnaireFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const QUESTIONNAIRE_ID = '550e8400-e29b-41d4-a716-446655440000';

  const { data: savedAnswers, isLoading } = useQuery({
    queryKey: ['questionnaire-answers', rooftopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaire_answers')
        .select('*')
        .eq('rooftop_id', rooftopId);
      if (error) throw error;
      return data as QuestionnaireAnswer[];
    },
  });

  const { data: rooftopStatus } = useQuery({
    queryKey: ['rooftop-status', rooftopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooftops')
        .select('questionnaire_status')
        .eq('id', rooftopId)
        .single();
      if (error) throw error;
      return data.questionnaire_status;
    },
  });

  useEffect(() => {
    if (savedAnswers) {
      const answersMap: Record<string, string> = {};
      savedAnswers.forEach((a) => {
        answersMap[a.question_id] = a.answer || '';
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(answersMap);
    }
  }, [savedAnswers]);

 const saveMutation = useMutation({
  mutationFn: async (markComplete: boolean) => {
    const upserts = Object.entries(answers).map(([question_id, answer]) => ({
      rooftop_id: rooftopId,
      questionnaire_id: QUESTIONNAIRE_ID, // ✅ FIXED
      question_id,                        // ✅ FIXED
      answer: answer || null,
    }));

    const { error } = await supabase
      .from('questionnaire_answers')
      .upsert(upserts, {
        onConflict: 'rooftop_id,questionnaire_id,question_id', // ✅ FIXED
      });

    if (error) throw error;

    if (markComplete) {
      const { error } = await supabase
        .from('rooftops')
        .update({ questionnaire_status: 'completed' })
        .eq('id', rooftopId);

      if (error) throw error;
    }
  },

  onSuccess: (_, markComplete) => {
    queryClient.invalidateQueries({ queryKey: ['questionnaire-answers', rooftopId] });
    queryClient.invalidateQueries({ queryKey: ['rooftop-status', rooftopId] });
    queryClient.invalidateQueries({ queryKey: ['rooftop', rooftopId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

    setHasChanges(false);

    toast({
      title: markComplete ? 'Questionnaire Completed' : 'Answers Saved',
      description: markComplete
        ? 'All answers have been saved and marked as complete.'
        : 'Your answers have been saved as a draft.',
    });
  },

  onError: (error) => {
    toast({
      title: 'Save Failed',
      description: error.message,
      variant: 'default',
    });
  },
});

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setHasChanges(true);
  };

  const requiredQuestions = QUESTIONNAIRE_QUESTIONS.filter((q) => q.required);
  const allRequiredAnswered = requiredQuestions.every((q) => answers[q.id]?.trim());
  const answeredCount = QUESTIONNAIRE_QUESTIONS.filter((q) => answers[q.id]?.trim()).length;

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  return (
    <div className="rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-medium">Onboarding Questionnaire</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Answer these questions to generate the rulebook prompt
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rooftopStatus === 'completed' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-full">
              <CheckCircle className="h-3 w-3" /> Completed
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {answeredCount}/{QUESTIONNAIRE_QUESTIONS.length} answered
            </span>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="px-5 py-5 space-y-5">
        {QUESTIONNAIRE_QUESTIONS.map((question) => (
          <div key={question.id} className="space-y-1.5">
            <Label htmlFor={question.id} className="text-sm font-medium flex items-center gap-1">
              {question.question}
              {question.required && <span className="text-destructive">*</span>}
            </Label>
            
            {question.type === 'text' && (
              <Input
                id={question.id}
                placeholder={question.placeholder}
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
                className="h-9"
              />
            )}
            
            {question.type === 'textarea' && (
              <Textarea
                id={question.id}
                placeholder={question.placeholder}
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
                rows={3}
                className="resize-none"
              />
            )}
            
            {question.type === 'select' && question.options && (
              <Select
                value={answers[question.id] || ''}
                onValueChange={(value) => handleChange(question.id, value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {question.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveMutation.mutate(false)}
          disabled={saveMutation.isPending || !hasChanges}
          className="h-8 gap-1.5"
        >
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </Button>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate(true)}
          disabled={saveMutation.isPending || !allRequiredAnswered}
          className="h-8 gap-1.5"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Mark Complete
        </Button>
        {!allRequiredAnswered && (
          <span className="text-xs text-muted-foreground">
            Complete all required fields to mark as complete
          </span>
        )}
      </div>
    </div>
  );
}
