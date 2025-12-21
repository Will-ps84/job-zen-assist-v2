// Simple PDF export using browser print functionality
import { CandidateResult } from "@/hooks/useCVAnalyses";

interface AnalysisCriteria {
  jobTitle: string;
  minExperience: number;
  keySkills: string;
  salaryRange: string;
}

// Generate interview questions based on STAR bullets
function generateInterviewQuestions(candidate: CandidateResult): string[] {
  const questions: string[] = [];
  
  if (candidate.starBullets.length > 0) {
    questions.push(`Cuéntame más sobre: "${candidate.starBullets[0]}". ¿Cuál fue tu rol específico y qué métricas lograste?`);
  }
  if (candidate.starBullets.length > 1) {
    questions.push(`Respecto a "${candidate.starBullets[1]}", ¿qué obstáculos enfrentaste y cómo los superaste?`);
  }
  questions.push(`¿Cómo describirías tu experiencia con las tecnologías clave del puesto y qué proyectos destacarías?`);
  
  return questions;
}

export function generateAnalysisHTML(
  jobTitle: string,
  jobDescription: string,
  totalCvs: number,
  candidates: CandidateResult[],
  poolQualityComment: string,
  date: string,
  criteria?: AnalysisCriteria
): string {
  const candidatesRows = candidates.map((c, i) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${c.name}</strong>
        ${c.email ? `<br><small style="color: #6b7280;">${c.email}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: bold;
          ${c.score >= 85 ? 'background: #dcfce7; color: #166534;' : 
            c.score >= 70 ? 'background: #fef9c3; color: #854d0e;' : 
            'background: #f3f4f6; color: #374151;'}
        ">${c.score}%</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${c.skillsMatch}%</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <ul style="margin: 0; padding-left: 16px;">
          ${c.starBullets.slice(0, 2).map(b => `<li style="margin-bottom: 4px;">${b}</li>`).join('')}
        </ul>
      </td>
    </tr>
  `).join('');

  const interviewSection = candidates.map((c, i) => {
    const questions = generateInterviewQuestions(c);
    return `
      <div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
        <h4 style="margin: 0 0 12px 0; color: #374151;">${i + 1}. ${c.name}</h4>
        <ol style="margin: 0; padding-left: 20px;">
          ${questions.map(q => `<li style="margin-bottom: 8px; color: #4b5563;">${q}</li>`).join('')}
        </ol>
      </div>
    `;
  }).join('');

  const criteriaSection = criteria ? `
    <div class="summary-box" style="margin-top: 16px;">
      <strong>Criterios de búsqueda:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        ${criteria.minExperience ? `<li>Experiencia mínima: ${criteria.minExperience} años</li>` : ''}
        ${criteria.keySkills ? `<li>Skills clave: ${criteria.keySkills}</li>` : ''}
        ${criteria.salaryRange ? `<li>Rango salarial: ${criteria.salaryRange}</li>` : ''}
      </ul>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Análisis de CVs - ${jobTitle}</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px;
        }
        h1 { color: #111827; margin-bottom: 8px; }
        h2 { color: #374151; margin-top: 32px; }
        .meta { color: #6b7280; margin-bottom: 24px; }
        .summary-box {
          background: #f3f4f6;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 16px;
        }
        th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #e5e7eb;
          font-weight: 600;
        }
        .quality-comment {
          background: linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%);
          border-radius: 8px;
          padding: 16px;
          margin-top: 32px;
        }
        .footer {
          margin-top: 48px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>📊 Análisis de CVs</h1>
      <p class="meta">
        <strong>Puesto:</strong> ${jobTitle}<br>
        <strong>Fecha:</strong> ${date}<br>
        <strong>CVs analizados:</strong> ${totalCvs}
      </p>

      <div class="summary-box">
        <strong>Resumen:</strong> De ${totalCvs} CVs analizados, estos son los ${candidates.length} mejores candidatos para el puesto de "${jobTitle}".
      </div>

      ${criteriaSection}

      <h2>🏆 Top ${candidates.length} Candidatos</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th style="width: 180px;">Candidato</th>
            <th style="width: 80px; text-align: center;">Score</th>
            <th style="width: 80px; text-align: center;">Skills</th>
            <th>Logros STAR</th>
          </tr>
        </thead>
        <tbody>
          ${candidatesRows}
        </tbody>
      </table>

      <div class="quality-comment">
        <strong>💡 Comentario sobre el pool:</strong>
        <p style="margin: 8px 0 0 0;">${poolQualityComment}</p>
      </div>

      <h2>🎯 Preguntas sugeridas de entrevista</h2>
      ${interviewSection}

      <div class="footer">
        Generado por HR Screener LATAM · ${new Date().toLocaleDateString('es-ES')}
      </div>
    </body>
    </html>
  `;
}

export function exportToPDF(
  jobTitle: string,
  jobDescription: string,
  totalCvs: number,
  candidates: CandidateResult[],
  poolQualityComment: string,
  criteria?: AnalysisCriteria
) {
  const date = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = generateAnalysisHTML(
    jobTitle,
    jobDescription,
    totalCvs,
    candidates,
    poolQualityComment,
    date,
    criteria
  );

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}
