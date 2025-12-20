// Hybrid CV processing utilities - Local heuristics before AI

export interface ParsedCV {
  filename: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  education: string[];
  rawText: string;
  preliminaryScore: number;
}

// Common skill keywords by category
const SKILL_KEYWORDS: Record<string, string[]> = {
  desarrollo: [
    'javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql', 'html', 'css',
    'angular', 'vue', 'next', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'git', 'mongodb', 'postgresql', 'mysql', 'redis', 'graphql',
    'rest', 'api', 'microservices', 'agile', 'scrum', 'ci/cd', 'devops', 'linux'
  ],
  ventas: [
    'crm', 'salesforce', 'hubspot', 'negociación', 'prospección', 'pipeline', 'b2b', 'b2c',
    'closing', 'cold calling', 'account management', 'key account', 'ventas consultivas',
    'forecast', 'quota', 'revenue', 'upselling', 'cross-selling', 'customer success'
  ],
  administracion: [
    'excel', 'powerpoint', 'word', 'outlook', 'sap', 'oracle', 'erp', 'contabilidad',
    'finanzas', 'presupuesto', 'nómina', 'recursos humanos', 'gestión', 'administración',
    'facturación', 'inventario', 'logística', 'compras', 'proveedores'
  ],
  marketing: [
    'seo', 'sem', 'google ads', 'facebook ads', 'meta', 'analytics', 'content marketing',
    'email marketing', 'social media', 'branding', 'copywriting', 'photoshop', 'figma',
    'canva', 'mailchimp', 'hubspot', 'wordpress', 'ecommerce', 'growth', 'leads'
  ],
  datos: [
    'python', 'r', 'sql', 'tableau', 'power bi', 'excel', 'machine learning', 'data science',
    'statistics', 'analytics', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'spark',
    'hadoop', 'etl', 'data warehouse', 'big data', 'visualization'
  ],
  general: [
    'liderazgo', 'comunicación', 'trabajo en equipo', 'problem solving', 'inglés',
    'gestión de proyectos', 'planificación', 'organización', 'atención al cliente',
    'microsoft office', 'presentaciones', 'negociación', 'análisis'
  ]
};

// Experience level patterns
const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*(?:años?|years?)\s*(?:de\s*)?(?:experiencia|experience)/gi,
  /experiencia\s*(?:de\s*)?(\d+)\s*años?/gi,
  /(\d+)\s*años?\s*(?:de\s*)?(?:trayectoria|carrera)/gi
];

// Education patterns
const EDUCATION_PATTERNS = [
  /(?:licenciatura|ingeniería|maestría|doctorado|técnico|bachelor|master|phd|mba)/gi,
  /(?:universidad|instituto|college|university)\s+[\w\s]+/gi,
  /(?:carrera|título|degree)\s+(?:en|in)\s+[\w\s]+/gi
];

// Name extraction patterns (typically at the start)
const NAME_PATTERNS = [
  /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/m,
  /nombre[:\s]*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/i
];

const EMAIL_PATTERN = /[\w.-]+@[\w.-]+\.\w+/gi;
const PHONE_PATTERN = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

export function extractName(text: string, filename: string): string {
  // Try to extract from text
  for (const pattern of NAME_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length > 3 && name.length < 60) {
        return name;
      }
    }
  }
  
  // Fallback to filename (remove extension and clean)
  const cleanName = filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/cv|resume|curriculum/gi, '')
    .replace(/\d+/g, '')
    .trim();
  
  if (cleanName.length > 2) {
    return cleanName
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  
  return 'Candidato';
}

export function extractEmail(text: string): string {
  const matches = text.match(EMAIL_PATTERN);
  return matches?.[0] || '';
}

export function extractPhone(text: string): string {
  const matches = text.match(PHONE_PATTERN);
  if (matches) {
    // Return the first valid-looking phone
    for (const phone of matches) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 8 && digits.length <= 15) {
        return phone;
      }
    }
  }
  return '';
}

export function extractExperience(text: string): string {
  for (const pattern of EXPERIENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const years = parseInt(match[1], 10);
      if (years > 0 && years < 50) {
        return `${years} años de experiencia`;
      }
    }
  }
  
  // Estimate from job history
  const jobYears = text.match(/20\d{2}/g);
  if (jobYears && jobYears.length >= 2) {
    const years = jobYears.map(y => parseInt(y, 10));
    const range = Math.max(...years) - Math.min(...years);
    if (range > 0 && range < 40) {
      return `~${range} años de experiencia`;
    }
  }
  
  return 'Experiencia no especificada';
}

export function extractSkills(text: string, category: string = 'general'): string[] {
  const textLower = text.toLowerCase();
  const foundSkills: string[] = [];
  
  // Get relevant skill categories
  const categories = category === 'general' 
    ? Object.keys(SKILL_KEYWORDS)
    : [category, 'general'];
  
  for (const cat of categories) {
    const skills = SKILL_KEYWORDS[cat] || [];
    for (const skill of skills) {
      if (textLower.includes(skill.toLowerCase())) {
        // Capitalize first letter
        const formatted = skill.charAt(0).toUpperCase() + skill.slice(1);
        if (!foundSkills.includes(formatted)) {
          foundSkills.push(formatted);
        }
      }
    }
  }
  
  return foundSkills.slice(0, 10);
}

export function extractEducation(text: string): string[] {
  const education: string[] = [];
  
  for (const pattern of EDUCATION_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const cleaned = match.trim();
        if (cleaned.length > 3 && cleaned.length < 100 && !education.includes(cleaned)) {
          education.push(cleaned);
        }
      }
    }
  }
  
  return education.slice(0, 3);
}

export function calculatePreliminaryScore(
  cvText: string, 
  jobDescription: string,
  roleCategory: string
): number {
  const cvLower = cvText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Extract keywords from job description
  const jobWords = jobLower
    .replace(/[^\w\sáéíóúñ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  
  // Count matches
  let matchCount = 0;
  const uniqueJobWords = [...new Set(jobWords)];
  
  for (const word of uniqueJobWords) {
    if (cvLower.includes(word)) {
      matchCount++;
    }
  }
  
  // Base keyword match score (0-40 points)
  const keywordScore = Math.min(40, (matchCount / Math.max(1, uniqueJobWords.length)) * 60);
  
  // Skills match score (0-30 points)
  const cvSkills = extractSkills(cvText, roleCategory);
  const jobSkills = extractSkills(jobDescription, roleCategory);
  const skillMatch = jobSkills.length > 0 
    ? cvSkills.filter(s => jobSkills.some(js => js.toLowerCase() === s.toLowerCase())).length / jobSkills.length
    : 0.5;
  const skillScore = skillMatch * 30;
  
  // Experience bonus (0-20 points)
  let expScore = 10; // default
  const expMatch = cvText.match(/(\d+)\s*(?:años?|years?)/i);
  if (expMatch) {
    const years = parseInt(expMatch[1], 10);
    if (years >= 5) expScore = 20;
    else if (years >= 3) expScore = 15;
    else if (years >= 1) expScore = 10;
    else expScore = 5;
  }
  
  // Education bonus (0-10 points)
  const education = extractEducation(cvText);
  const eduScore = Math.min(10, education.length * 5);
  
  return Math.round(keywordScore + skillScore + expScore + eduScore);
}

export function parseCV(
  filename: string, 
  content: string,
  jobDescription: string,
  roleCategory: string
): ParsedCV {
  return {
    filename,
    name: extractName(content, filename),
    email: extractEmail(content),
    phone: extractPhone(content),
    experience: extractExperience(content),
    skills: extractSkills(content, roleCategory),
    education: extractEducation(content),
    rawText: content,
    preliminaryScore: calculatePreliminaryScore(content, jobDescription, roleCategory)
  };
}

export function selectTopCandidates(cvs: ParsedCV[], topN: number = 20): ParsedCV[] {
  return [...cvs]
    .sort((a, b) => b.preliminaryScore - a.preliminaryScore)
    .slice(0, topN);
}
