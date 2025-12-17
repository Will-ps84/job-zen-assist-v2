import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFeedback } from '@/hooks/useFeedback';
import { toast } from 'sonner';
import { MessageSquarePlus, Bug, Lightbulb, Loader2, Send } from 'lucide-react';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'bug' | 'idea'>('idea');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { submitFeedback } = useFeedback();

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    setSubmitting(true);
    const result = await submitFeedback({
      type,
      severity: type === 'bug' ? severity : undefined,
      comment: comment.trim(),
      page_url: window.location.pathname,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success('¡Gracias por tu feedback!');
      setOpen(false);
      setComment('');
      setType('idea');
      setSeverity('medium');
    } else {
      toast.error('Error al enviar feedback');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg bg-background/95 backdrop-blur-sm border-primary/20 hover:border-primary/40"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-primary" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Ayúdanos a mejorar. Tu opinión es muy valiosa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type selection */}
          <div className="space-y-2">
            <Label>Tipo de feedback</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as 'bug' | 'idea')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bug" id="bug" />
                <Label htmlFor="bug" className="flex items-center gap-1.5 cursor-pointer">
                  <Bug className="w-4 h-4 text-red-500" />
                  Reportar bug
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="idea" id="idea" />
                <Label htmlFor="idea" className="flex items-center gap-1.5 cursor-pointer">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Sugerir mejora
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Severity (only for bugs) */}
          {type === 'bug' && (
            <div className="space-y-2">
              <Label>Severidad</Label>
              <RadioGroup
                value={severity}
                onValueChange={(v) => setSeverity(v as typeof severity)}
                className="flex flex-wrap gap-2"
              >
                {[
                  { value: 'low', label: 'Baja', color: 'text-gray-500' },
                  { value: 'medium', label: 'Media', color: 'text-amber-500' },
                  { value: 'high', label: 'Alta', color: 'text-orange-500' },
                  { value: 'critical', label: 'Crítica', color: 'text-red-500' },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-1.5">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <Label htmlFor={opt.value} className={`cursor-pointer text-sm ${opt.color}`}>
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              {type === 'bug' ? '¿Qué pasó?' : '¿Qué te gustaría mejorar?'}
            </Label>
            <Textarea
              id="comment"
              placeholder={type === 'bug' 
                ? 'Describe el problema que encontraste...' 
                : 'Comparte tu idea o sugerencia...'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Página actual: {window.location.pathname}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !comment.trim()}>
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
