import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentorProgressProps {
  title: string;
  description: string;
  progress: number;
  nextAction?: {
    label: string;
    href: string;
  };
  tips?: string[];
  variant?: "default" | "compact";
}

export function MentorProgress({
  title,
  description,
  progress,
  nextAction,
  tips,
  variant = "default",
}: MentorProgressProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{title}</span>
            <span className="text-sm text-muted-foreground">({progress}%)</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        {nextAction && (
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link to={nextAction.href}>
              {nextAction.label}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <span className="text-sm text-muted-foreground">({progress}%)</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <Progress value={progress} className="h-2 mb-3" />
            
            {tips && tips.length > 0 && (
              <div className="space-y-1 mb-3">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className={cn(
                      "w-3 h-3 mt-0.5 shrink-0",
                      i < Math.ceil(tips.length * (progress / 100)) ? "text-success" : "text-muted-foreground/50"
                    )} />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            
            {nextAction && (
              <Button size="sm" asChild>
                <Link to={nextAction.href}>
                  {nextAction.label}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NextActionBannerProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

export function NextActionBanner({ icon, title, description, href, ctaLabel }: NextActionBannerProps) {
  return (
    <Link to={href} className="block">
      <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0">
          {ctaLabel}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Link>
  );
}
