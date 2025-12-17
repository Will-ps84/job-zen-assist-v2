import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Trophy,
  Users,
  Code,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewType = "hr" | "technical" | "leadership";

interface Question {
  id: number;
  text: string;
  type: InterviewType;
  tips: string[];
}

interface Message {
  role: "interviewer" | "user";
  content: string;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
}

const interviewTypes = [
  {
    id: "hr" as InterviewType,
    label: "HR / Cultural",
    icon: Users,
    description: "Preguntas sobre motivación, cultura y fit organizacional",
    color: "text-info",
  },
  {
    id: "technical" as InterviewType,
    label: "Técnica",
    icon: Code,
    description: "Preguntas sobre habilidades y conocimientos específicos",
    color: "text-warning",
  },
  {
    id: "leadership" as InterviewType,
    label: "Liderazgo",
    icon: Briefcase,
    description: "Preguntas situacionales sobre gestión y liderazgo",
    color: "text-success",
  },
];

const questions: Record<InterviewType, Question[]> = {
  hr: [
    { id: 1, text: "Cuéntame sobre ti y tu trayectoria profesional.", type: "hr", tips: ["Usa el formato elevator pitch", "Menciona logros relevantes", "Conecta con el rol"] },
    { id: 2, text: "¿Por qué estás buscando un cambio laboral en este momento?", type: "hr", tips: ["Sé honesto pero positivo", "Enfócate en crecimiento", "No hables mal de empleadores anteriores"] },
    { id: 3, text: "¿Qué sabes sobre nuestra empresa y por qué te interesa trabajar aquí?", type: "hr", tips: ["Investiga antes", "Menciona valores/misión", "Conecta con tus objetivos"] },
    { id: 4, text: "¿Cuáles consideras que son tus principales fortalezas y áreas de mejora?", type: "hr", tips: ["Sé específico con ejemplos", "Muestra autoconocimiento", "Para debilidades, menciona qué haces para mejorar"] },
    { id: 5, text: "¿Dónde te ves en 5 años?", type: "hr", tips: ["Muestra ambición realista", "Alinea con el rol", "Demuestra compromiso"] },
  ],
  technical: [
    { id: 1, text: "Describe un proyecto técnico desafiante que hayas liderado. ¿Cuál fue tu enfoque?", type: "technical", tips: ["Usa método STAR", "Detalla tecnologías", "Cuantifica resultados"] },
    { id: 2, text: "¿Cómo te mantienes actualizado con las nuevas tecnologías y tendencias de la industria?", type: "technical", tips: ["Menciona fuentes específicas", "Habla de proyectos personales", "Demuestra curiosidad"] },
    { id: 3, text: "Cuéntame sobre una vez que tuviste que resolver un problema técnico complejo bajo presión.", type: "technical", tips: ["Describe el contexto", "Explica tu proceso de pensamiento", "Menciona el resultado"] },
    { id: 4, text: "¿Cómo aseguras la calidad en tu trabajo técnico?", type: "technical", tips: ["Menciona testing", "Habla de code review", "Incluye documentación"] },
    { id: 5, text: "¿Qué herramientas y metodologías prefieres usar y por qué?", type: "technical", tips: ["Justifica tus preferencias", "Muestra flexibilidad", "Conecta con resultados"] },
  ],
  leadership: [
    { id: 1, text: "Describe una situación donde tuviste que liderar un equipo a través de un cambio difícil.", type: "leadership", tips: ["Describe el cambio", "Explica tu estrategia", "Menciona el impacto en el equipo"] },
    { id: 2, text: "¿Cómo manejas los conflictos dentro de tu equipo?", type: "leadership", tips: ["Da un ejemplo concreto", "Muestra empatía", "Enfócate en la resolución"] },
    { id: 3, text: "Cuéntame sobre una decisión difícil que tomaste y cómo llegaste a ella.", type: "leadership", tips: ["Explica el contexto", "Describe tu proceso", "Comparte el resultado y aprendizajes"] },
    { id: 4, text: "¿Cómo motivas y desarrollas a los miembros de tu equipo?", type: "leadership", tips: ["Menciona técnicas específicas", "Da ejemplos de desarrollo", "Habla de feedback"] },
    { id: 5, text: "Describe un proyecto que fracasó. ¿Qué aprendiste?", type: "leadership", tips: ["Sé honesto sobre el fracaso", "Enfócate en aprendizajes", "Muestra crecimiento"] },
  ],
};

const analyzeResponse = (response: string, question: Question): Message["feedback"] => {
  // Simple rule-based analysis for MVP
  const words = response.trim().split(/\s+/).length;
  const hasSTARElements = {
    situation: /situación|contexto|cuando|proyecto|empresa/i.test(response),
    task: /objetivo|meta|responsabilidad|tarea|encargado/i.test(response),
    action: /hice|implementé|desarrollé|lideré|creé|diseñé|acción/i.test(response),
    result: /resultado|logré|aumenté|reduje|mejoré|conseguí|impacto|\d+%/i.test(response),
  };
  
  const starScore = Object.values(hasSTARElements).filter(Boolean).length;
  const lengthScore = words >= 50 ? 25 : words >= 30 ? 15 : 5;
  const specificityScore = /\d+/.test(response) ? 20 : 5;
  
  const totalScore = Math.min(100, starScore * 15 + lengthScore + specificityScore);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (hasSTARElements.situation) strengths.push("Buen contexto inicial");
  else improvements.push("Agrega más contexto sobre la situación");
  
  if (hasSTARElements.action) strengths.push("Acciones claras");
  else improvements.push("Describe más tus acciones específicas");
  
  if (hasSTARElements.result) strengths.push("Resultados mencionados");
  else improvements.push("Incluye resultados cuantificables");

  if (words >= 50) strengths.push("Respuesta completa");
  else improvements.push("Desarrolla más tu respuesta");

  if (/\d+/.test(response)) strengths.push("Datos específicos");
  else improvements.push("Agrega números o métricas");

  return {
    score: totalScore,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
  };
};

export default function InterviewSimulator() {
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestions = selectedType ? questions[selectedType] : [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const progress = selectedType ? ((currentQuestionIndex + (messages.length > currentQuestionIndex * 2 ? 1 : 0)) / currentQuestions.length) * 100 : 0;

  const startInterview = (type: InterviewType) => {
    setSelectedType(type);
    setCurrentQuestionIndex(0);
    setMessages([
      {
        role: "interviewer",
        content: questions[type][0].text,
      },
    ]);
    setIsComplete(false);
  };

  const handleSubmit = () => {
    if (!userInput.trim() || !currentQuestion) return;

    const feedback = analyzeResponse(userInput, currentQuestion);
    
    // Add user message with feedback
    const userMessage: Message = {
      role: "user",
      content: userInput,
      feedback,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    // Check if there are more questions
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setMessages((prev) => [
          ...prev,
          {
            role: "interviewer",
            content: currentQuestions[nextIndex].text,
          },
        ]);
      }, 1000);
    } else {
      setIsComplete(true);
    }
  };

  const resetSimulator = () => {
    setSelectedType(null);
    setCurrentQuestionIndex(0);
    setMessages([]);
    setUserInput("");
    setIsComplete(false);
  };

  // Calculate overall score
  const overallScore = messages
    .filter((m) => m.role === "user" && m.feedback)
    .reduce((acc, m) => acc + (m.feedback?.score || 0), 0) / 
    Math.max(1, messages.filter((m) => m.role === "user").length);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Simulador de Entrevistas
          </h1>
          <p className="text-muted-foreground">
            Practica tus respuestas y recibe feedback instantáneo para mejorar.
          </p>
        </div>

        {!selectedType ? (
          // Type Selection
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interviewTypes.map((type) => (
              <Card
                key={type.id}
                className="border-border hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => startInterview(type.id)}
              >
                <CardContent className="pt-6">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-muted group-hover:bg-primary/10 transition-colors", type.color)}>
                    <type.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {type.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {questions[type.id].length} preguntas
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isComplete ? (
          // Results
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                ¡Entrevista completada!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-primary mb-2">
                  {Math.round(overallScore)}%
                </div>
                <p className="text-muted-foreground">Puntuación general</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-success/10 rounded-xl p-4">
                  <h4 className="font-medium text-success mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Fortalezas
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {messages
                      .filter((m) => m.feedback?.strengths)
                      .flatMap((m) => m.feedback?.strengths || [])
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .slice(0, 4)
                      .map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                  </ul>
                </div>
                <div className="bg-warning/10 rounded-xl p-4">
                  <h4 className="font-medium text-warning mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Áreas de mejora
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {messages
                      .filter((m) => m.feedback?.improvements)
                      .flatMap((m) => m.feedback?.improvements || [])
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .slice(0, 4)
                      .map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button variant="outline" onClick={resetSimulator}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Nueva entrevista
                </Button>
                <Button onClick={() => startInterview(selectedType)}>
                  Repetir esta entrevista
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Interview Chat
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Area */}
            <Card className="lg:col-span-2 border-border flex flex-col h-[600px]">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    {interviewTypes.find((t) => t.id === selectedType)?.label}
                  </CardTitle>
                  <Badge variant="secondary">
                    Pregunta {currentQuestionIndex + 1} de {currentQuestions.length}
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5 mt-2" />
              </CardHeader>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}>
                      <div className={cn(
                        "max-w-[80%] rounded-2xl p-4",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.feedback && (
                          <div className="mt-3 pt-3 border-t border-primary-foreground/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn(
                                "text-xs font-semibold px-2 py-0.5 rounded",
                                message.feedback.score >= 70 
                                  ? "bg-success/20 text-success"
                                  : message.feedback.score >= 50
                                  ? "bg-warning/20 text-warning"
                                  : "bg-destructive/20 text-destructive"
                              )}>
                                {message.feedback.score}%
                              </span>
                            </div>
                            {message.feedback.strengths.length > 0 && (
                              <div className="text-xs opacity-90">
                                <span className="font-medium">✓ </span>
                                {message.feedback.strengths[0]}
                              </div>
                            )}
                            {message.feedback.improvements.length > 0 && (
                              <div className="text-xs opacity-75 mt-1">
                                <span className="font-medium">→ </span>
                                {message.feedback.improvements[0]}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Escribe tu respuesta aquí..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={3}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) {
                        handleSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!userInput.trim()}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Presiona Cmd/Ctrl + Enter para enviar
                </p>
              </div>
            </Card>

            {/* Tips Panel */}
            <Card className="border-border h-fit">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Tips para esta pregunta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion?.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2 text-sm">
                    Usa el método STAR:
                  </h4>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p><strong>S</strong>ituación - Describe el contexto</p>
                    <p><strong>T</strong>area - Tu responsabilidad</p>
                    <p><strong>A</strong>cción - Qué hiciste específicamente</p>
                    <p><strong>R</strong>esultado - El impacto medible</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={resetSimulator}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cambiar tipo de entrevista
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}