// src/resume/resume.service.ts - WITH pdfjs-dist
import { Injectable, BadRequestException } from '@nestjs/common';

import { OpenAI } from 'openai';
import { PrismaService } from 'prisma/prisma.service';

// Configure pdfjs-dist
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// File interface
interface ProcessedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class ResumeService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async extractTextFromPdf(file: ProcessedFile): Promise<string> {
    try {
      console.log('Starting PDF text extraction with pdfjs-dist...');
      console.log(
        `📁 File: ${file.originalname}, Size: ${file.buffer.length} bytes`,
      );

      // Convert Buffer to Uint8Array
      const uint8Array = new Uint8Array(
        file.buffer.buffer,
        file.buffer.byteOffset,
        file.buffer.byteLength,
      );

      console.log('📄 Loading PDF document...');

      // Load PDF
      const loadingTask = pdfjsLib.getDocument(uint8Array);
      const pdf = await loadingTask.promise;

      console.log(`✅ PDF loaded: ${pdf.numPages} pages`);

      let fullText = '';

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`📖 Processing page ${pageNum}/${pdf.numPages}...`);

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Extract text from items
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        fullText += pageText + '\n\n';

        console.log(`📝 Page ${pageNum}: ${pageText.length} characters`);

        // Partial content log for debug
        if (pageText.length > 0) {
          console.log(
            `🔍 Page ${pageNum} sample: "${pageText.substring(0, 100)}..."`,
          );
        }
      }

      console.log(
        `✅ Extraction completed: ${fullText.length} total characters`,
      );

      if (!fullText || fullText.trim().length === 0) {
        console.log('❌ PDF contains no extractable text');
        throw new Error(
          'Empty PDF or no extractable text. PDF may be an image or protected.',
        );
      }

      // Extracted text log for verification
      console.log(
        `🔍 Extracted text sample: "${fullText.substring(0, 200)}..."`,
      );

      return fullText;
    } catch (error) {
      console.error('❌ Detailed PDF extraction error:', error);

      if (error.message.includes('Password')) {
        throw new BadRequestException(
          'Password protected PDF. Cannot extract text.',
        );
      } else if (error.message.includes('Invalid')) {
        throw new BadRequestException('Invalid or corrupted PDF file.');
      } else {
        throw new BadRequestException(
          'Error extracting text from PDF: ' + error.message,
        );
      }
    }
  }

  async analyzeResume(text: string) {
    // Limit text size for OpenAI API
    const limitedText = text.substring(0, 12000);

    const prompt = `
You are a senior technical recruiter with over 10 years of experience in tech recruiting for global companies. Your analysis must be critical, evidence-based, and focused on alignment with the current technology market.

**GENERAL GUIDELINES:**
- Be extremely thorough and do not assume non-explicit information
- Base all evaluations strictly on what is documented in the resume
- Consider current trends in the Brazilian and global technology market
- Focus on highlighting real gaps and improvement opportunities
- **IMPORTANT: Your response must be in PORTUGUESE (Brazilian Portuguese)**

**DETAILED EVALUATION CRITERIA:**

1. **SPECIALIZED TECHNICAL ANALYSIS:**
   - Complete mapping of the technology stack (languages, frameworks, tools)
   - Technical depth assessment based on:
     * Time of experience with each technology
     * Complexity of mentioned projects
     * Application context (companies, scales, challenges)
   - Identification of critical technical gaps for the candidate's areas of activity
   - Analysis of technological evolution throughout the career
   - Verification of compatibility with modern stacks

2. **PROFESSIONAL EXPERIENCE AND IMPACT:**
   - Quantitative analysis of results and achievements (metrics, KPIs, numbers)
   - Career progression and professional leaps
   - Relevance of companies and sectors of activity
   - Temporal consistency and trajectory coherence
   - Measurement of real impact on organizations

3. **TECHNICAL COMPETENCIES AND EDUCATION:**
   - Assessment of balance between formal education and practical experience
   - Relevance of certifications and specialized courses
   - Identification of knowledge in emerging areas (AI, cloud, DevOps, etc.)
   - Analysis of learning continuity and technical updating

4. **COMMUNICATION, STRUCTURE AND PERSONAL MARKETING:**
   - Clarity in describing experiences and responsibilities
   - Objectivity and synthesis power
   - Logical structure and information hierarchy
   - Presence of strategic elements (professional summary, objectives)
   - Adaptation to ATS (Applicant Tracking Systems) format

**TECHNICAL SCORING MATRIX (0-100):**

- **technical_score** (Technical Mastery):
  90-100: Expert with modern stack, deep experience and advanced knowledge
  80-89: Solid technical mastery with good practices and relevant experience
  70-79: Adequate knowledge but with gaps in emerging technologies
  60-69: Basic or outdated knowledge
  <60: Limited or very generic knowledge

- **communication_score** (Communication):
  90-100: Exemplary resume, well structured, with clear metrics and results
  80-89: Good structure and communication of information
  70-79: Acceptable structure but with room for clarity improvements
  60-69: Difficulties in communicating experiences and results
  <60: Confusing structure or missing critical information

- **experience_score** (Experience):
  90-100: Solid trajectory in relevant companies with measurable impact
  80-89: Consistent experience with good results
  70-79: Adequate experience but with limited progression
  60-69: Insufficient or irrelevant experience
  <60: Very limited or unproven experience

- **overall_score** (Overall):
  Weighted average with emphasis on technical_score (40%), experience_score (35%), communication_score (25%)

**EXCLUSIVE RESPONSE FORMAT (VALID JSON IN PORTUGUESE):**

{
  "summary": "Professional objective summary (150-200 words) in Portuguese highlighting: main technical profile, specific expertise, relevant achievements and unique value for the market. Must capture the candidate's essence strategically.",
  
  "strengths": [
    "Specific technical strength with concrete evidence from the resume",
    "Competitive differential compared to other professionals",
    "Highlighted experience or project with measurable impact",
    "Unique characteristic or rare skill that adds value",
    "Soft skill proven by professional trajectory"
  ],
  
  "improvements": [
    "Critical technical gap identified with specific improvement suggestion",
    "Lack of metrics or quantifiable results in projects",
    "High-demand market skill that is missing",
    "Concrete suggestion to strengthen personal marketing"
  ],
  
  "score": {
    "technical": 0-100,
    "communication": 0-100,
    "experience": 0-100,
    "overall": 0-100
  },
  
  "technical_skills": {
    "programming_languages": ["list based only on what is explicit"],
    "frameworks_libraries": ["specific list of frameworks and libraries"],
    "tools_platforms": ["development tools, CI/CD, monitoring"],
    "databases": ["relational and non-relational databases"],
    "cloud_services": ["cloud providers services"],
    "methodologies": ["mentioned methodologies (Agile, Scrum, etc.)"]
  },
  
  "career_analysis": {
    "level_identification": "Junior/Mid-Level/Senior/Specialist based on evidence",
    "market_position": "Current positioning in the job market",
    "growth_trajectory": "Progression analysis and growth potential",
    "recommended_roles": ["List of most suitable roles for the profile"]
  }
}

**RESUME FOR ANALYSIS:**
${limitedText}

**FINAL NOTE:** Your analysis must be impartial, technical and fact-based. Do not invent skills or experiences not mentioned. Be direct in improvement points and strategic in recommendations. RESPOND IN PORTUGUESE.
`;

    try {
      console.log('🤖 Sending to AI analysis...');
      console.log(`📊 Text size sent: ${limitedText.length} characters`);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a technical headhunter specialized in resume analysis for the technology market. Be critical, objective and evidence-based. Return ONLY valid JSON, without markdown, comments or additional text. Your analysis must be technical and strategic.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Reduced for maximum consistency
        max_tokens: 2500, // Increased for more complete analysis
      });

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      console.log('✅ AI analysis completed successfully');

      const analysis = JSON.parse(content);

      // Expanded structure validation
      const requiredFields = [
        'summary',
        'strengths',
        'improvements',
        'score',
        'technical_skills',
        'career_analysis',
      ];
      const missingFields = requiredFields.filter((field) => !analysis[field]);

      if (missingFields.length > 0) {
        throw new Error(
          `Incomplete AI response. Missing fields: ${missingFields.join(', ')}`,
        );
      }

      return analysis;
    } catch (error) {
      console.error('❌ AI analysis error:', error);
      throw new BadRequestException('AI analysis error: ' + error.message);
    }
  }

  async createResumeAnalysis(file: ProcessedFile, analysis: any) {
    try {
      console.log('💾 Saving analysis to database...');

      const savedAnalysis = await this.prisma.resume.create({
        data: {
          fileName: file.originalname,
          originalText: analysis.originalText,
          summary: analysis.summary,
          strengths: JSON.stringify(analysis.strengths),
          improvements: JSON.stringify(analysis.improvements),
        },
      });

      console.log('✅ Analysis saved with ID:', savedAnalysis.id);
      return savedAnalysis;
    } catch (error) {
      console.error('❌ Database save error:', error);
      throw new BadRequestException(
        'Error saving analysis to database: ' + error.message,
      );
    }
  }

  async getAllResumes() {
    try {
      console.log('📋 Fetching analysis history...');

      const resumes = await this.prisma.resume.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          summary: true,
          strengths: true,
          improvements: true,
          analysisDate: true,
          createdAt: true,
        },
      });

      console.log(`✅ Found ${resumes.length} analyses`);
      return resumes;
    } catch (error) {
      console.error('❌ Error fetching analyses:', error);
      throw new BadRequestException('Error fetching history: ' + error.message);
    }
  }

  async getResumeById(id: string) {
    try {
      console.log(`🔍 Searching for analysis with ID: ${id}`);

      const resume = await this.prisma.resume.findUnique({
        where: { id },
      });

      if (!resume) {
        console.log('❌ Analysis not found');
        throw new Error('Analysis not found');
      }

      console.log('✅ Analysis found:', resume.fileName);
      return resume;
    } catch (error) {
      console.error('❌ Error fetching analysis:', error);
      throw new BadRequestException(
        'Error fetching analysis: ' + error.message,
      );
    }
  }
}
