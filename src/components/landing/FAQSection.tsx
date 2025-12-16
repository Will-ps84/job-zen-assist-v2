import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Qué diferencia a El Mentor Digital de otras herramientas de CV?",
    answer:
      "No solo optimizamos tu CV, te enseñamos a pensar estratégicamente. Nuestro Motor STAR guiado te hace preguntas para extraer logros cuantificables reales, y cada sugerencia de IA incluye el 'porqué' para que aprendas mientras mejoras.",
  },
  {
    question: "¿Cómo funciona el matching semántico del 90%?",
    answer:
      "Usamos embeddings de IA para analizar profundamente tu perfil y cada vacante. Solo te mostramos oportunidades donde hay una compatibilidad real de skills, seniority y expectativas. Nada de spam de vacantes irrelevantes.",
  },
  {
    question: "¿La postulación es automática?",
    answer:
      "No. Preparamos todo el paquete (CV adaptado, cover letter, respuestas sugeridas), pero tú decides cuándo y dónde aplicar. Creemos en el control total del candidato, no en el spam masivo.",
  },
  {
    question: "¿Funciona para mi país?",
    answer:
      "Sí. Actualmente soportamos México, Argentina, Colombia, Perú y Chile con portales de empleo locales, plantillas adaptadas y precios en moneda local.",
  },
  {
    question: "¿Puedo probar gratis antes de pagar?",
    answer:
      "Por supuesto. El plan Explorador es completamente gratis y te permite diagnosticar tu perfil, crear un CV optimizado y probar el Motor STAR con hasta 5 logros al mes.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Tu privacidad es prioridad. Usamos encriptación, Row Level Security en base de datos (solo tú ves tus datos), y nunca compartimos tu información con terceros sin tu consentimiento explícito.",
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
            Todo lo que necesitas saber antes de comenzar tu transformación
            profesional.
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
