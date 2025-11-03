// src/resume/scoring-system.service.ts
import { Injectable } from '@nestjs/common';

interface ScoringCriteria {
  weight: number;
  criteria: string;
  maxScore: number;
}

interface ResumeData {
  skills: string[];
  experience: number;
  education: string[];
  certifications: string[];
  projects: any[];
  languages: string[];
}

@Injectable()
export class ScoringSystemService {
  private readonly scoringCriteria: ScoringCriteria[] = [
    { weight: 0.3, criteria: 'technical_skills', maxScore: 30 },
    { weight: 0.25, criteria: 'professional_experience', maxScore: 25 },
    { weight: 0.15, criteria: 'education', maxScore: 15 },
    { weight: 0.1, criteria: 'certifications', maxScore: 10 },
    { weight: 0.1, criteria: 'projects', maxScore: 10 },
    { weight: 0.05, criteria: 'languages', maxScore: 5 },
    { weight: 0.05, criteria: 'clarity_presentation', maxScore: 5 },
  ];

  calculateScore(resumeData: ResumeData): number {
    let totalScore = 0;

    // 1. Habilidades Técnicas
    const techScore = this.calculateTechnicalSkillsScore(resumeData.skills);
    totalScore += techScore * 0.3;

    // 2. Experiência Profissional
    const expScore = this.calculateExperienceScore(resumeData.experience);
    totalScore += expScore * 0.25;

    // 3. Educação
    const eduScore = this.calculateEducationScore(resumeData.education);
    totalScore += eduScore * 0.15;

    // 4. Certificações
    const certScore = this.calculateCertificationsScore(
      resumeData.certifications,
    );
    totalScore += certScore * 0.1;

    // 5. Projetos
    const projectScore = this.calculateProjectsScore(resumeData.projects);
    totalScore += projectScore * 0.1;

    // 6. Idiomas
    const langScore = this.calculateLanguagesScore(resumeData.languages);
    totalScore += langScore * 0.05;

    // 7. Clareza e Apresentação
    const clarityScore = this.calculateClarityScore(resumeData);
    totalScore += clarityScore * 0.05;

    return Math.min(Math.round(totalScore), 100);
  }

  private calculateTechnicalSkillsScore(skills: string[]): number {
    if (!skills || skills.length === 0) return 0;

    const techSkills = this.getTechnologyWeights();
    let score = 0;

    skills.forEach((skill) => {
      const normalizedSkill = skill.toLowerCase().trim();
      const weight = techSkills[normalizedSkill] || 1;
      score += weight;
    });

    // Normalizar para máximo 30 pontos
    const maxPossible = Object.values(techSkills).reduce(
      (a: number, b: number) => a + b,
      0,
    );
    return (score / maxPossible) * 30;
  }

  private getTechnologyWeights(): { [key: string]: number } {
    return {
      // Tecnologias de alto valor (3 pontos)
      aws: 3,
      azure: 3,
      kubernetes: 3,
      docker: 3,
      'machine learning': 3,
      ai: 3,
      react: 2,
      'node.js': 2,
      python: 2,
      java: 2,
      typescript: 2,

      // Tecnologias médias (2 pontos)
      javascript: 2,
      sql: 2,
      nosql: 2,
      mongodb: 2,
      postgresql: 2,
      mysql: 2,
      vue: 2,
      angular: 2,

      // Tecnologias básicas (1 ponto)
      html: 1,
      css: 1,
      git: 1,
      'rest api': 1,
    };
  }

  private calculateExperienceScore(years: number): number {
    if (years <= 0) return 0;
    if (years >= 10) return 25; // Máximo
    return Math.min(years * 2.5, 25);
  }

  private calculateEducationScore(education: string[]): number {
    if (!education || education.length === 0) return 0;

    let score = 0;
    education.forEach((edu) => {
      const level = edu.toLowerCase();
      if (level.includes('doutor') || level.includes('phd')) score += 15;
      else if (level.includes('mestre') || level.includes('mestrado'))
        score += 12;
      else if (level.includes('graduação') || level.includes('bacharel'))
        score += 8;
      else if (level.includes('técnico') || level.includes('tecnólogo'))
        score += 5;
      else score += 2; // Cursos livres
    });

    return Math.min(score, 15);
  }

  private calculateCertificationsScore(certifications: string[]): number {
    if (!certifications) return 0;
    return Math.min(certifications.length * 2, 10);
  }

  private calculateProjectsScore(projects: any[]): number {
    if (!projects) return 0;

    let score = 0;
    projects.forEach((project) => {
      // Projetos complexos valem mais
      if (project.complexity === 'high') score += 3;
      else if (project.complexity === 'medium') score += 2;
      else score += 1;
    });

    return Math.min(score, 10);
  }

  private calculateLanguagesScore(languages: string[]): number {
    if (!languages) return 0;

    let score = 0;
    languages.forEach((lang) => {
      const level = lang.toLowerCase();
      if (level.includes('fluente') || level.includes('avançado')) score += 2;
      else if (level.includes('intermediário')) score += 1.5;
      else score += 1; // Básico
    });

    return Math.min(score, 5);
  }

  private calculateClarityScore(resumeData: ResumeData): number {
    // Avaliar estrutura e organização (simplificado)
    let score = 3; // Base

    if (resumeData.skills && resumeData.skills.length >= 5) score += 1;
    if (resumeData.experience >= 2) score += 1;

    return Math.min(score, 5);
  }
}
