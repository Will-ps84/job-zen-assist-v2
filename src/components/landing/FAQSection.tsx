import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cómo funciona el análisis de CVs?",
    answer:
      "Subes un ZIP con los CVs descargados de Bumeran, Computrabajo o cualquier portal. Nuestra IA extrae texto, identifica skills, experiencia y logros STAR. Luego compara contra tu job description y rankea los candidatos por compatibilidad.",
  },
  {
    question: "¿Qué es el análisis STAR automático?",
    answer:
      "STAR significa Situation-Task-Action-Result. Nuestra IA identifica en cada experiencia laboral del candidato estos 4 elementos para darte una visión clara de logros concretos, no solo responsabilidades genéricas.",
  },
  {
    question: "¿Cuántos CVs puedo analizar?",
    answer:
      "El trial gratuito permite 50 CVs. El plan Starter ($49/mes) incluye 500 CVs/mes. El plan Growth ($99/mes) sube a 2,000 CVs/mes. Para volúmenes mayores, contáctanos.",
  },
  {
    question: "¿Funciona para cualquier tipo de puesto?",
    answer:
      "Sí. El sistema está optimizado para perfiles técnicos (desarrolladores, data, etc.), comerciales, administrativos y operativos. La IA se adapta al lenguaje y requisitos de cada industria.",
  },
  {
    question: "¿Qué portales de empleo soportan?",
    answer:
      "Cualquier portal que permita descargar CVs en PDF. Los más comunes en LATAM: Bumeran, Computrabajo, Indeed, LinkedIn, OCC Mundial, Zona Jobs, entre otros.",
  },
  {
    question: "¿Mis datos y los CVs están seguros?",
    answer:
      "Absolutamente. Usamos encriptación enterprise, servidores en AWS, y cumplimos GDPR. Los CVs se eliminan automáticamente 30 días después del análisis. Nunca compartimos datos con terceros.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí, sin penalidad. Cancela desde tu dashboard y mantendrás acceso hasta el fin del período pagado. Ofrecemos garantía de devolución de 30 días si no estás satisfecho.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground">
            Todo lo que necesitas saber sobre HR Screener LATAM.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
