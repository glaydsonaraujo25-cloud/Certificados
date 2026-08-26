import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// API Routes & Middlewares
import certificateRoutes from './server/routes/certificates';
import studentRoutes from './server/routes/students';
import courseRoutes from './server/routes/courses';
import authRoutes from './server/routes/auth';
import docsRoutes from './server/routes/docs';
import { requestLogger, errorHandler } from './server/middleware/logger';
import { rateLimiter } from './server/middleware/rateLimiter';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Security Headers & CORS support
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Global Structured Request Logger
  app.use(requestLogger);

  // Global Rate Limiter (60 requests/minute default)
  app.use(rateLimiter({ defaultLimitPerMin: 60 }));

  // API Route: Health Check & System Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CertifyAI Secure API Gateway',
      version: '1.0.0',
      time: new Date().toISOString(),
    });
  });

  // API v1 Sub-routers
  app.use('/api/v1/certificates', certificateRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/courses', courseRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/docs', docsRoutes);

  // AI Generation Route (Gemini Model)
  app.post('/api/gemini/generate-certificate-text', async (req, res) => {
    const {
      studentName,
      courseName,
      hours,
      institution,
      instructor,
      modality,
      style = 'formal',
      customObjectives,
    } = req.body;

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const prompt = `Você é um redator acadêmico e jurídico especializado em emissão de certificados oficiais de conclusão de curso.
Escreva um parágrafo conciso, elegante e formal para o corpo de um certificado de conclusão com os seguintes dados:
- Aluno: ${studentName || 'o participante'}
- Curso: ${courseName || 'do curso'}
- Carga Horária: ${hours || '40'} horas
- Instituição: ${institution || 'Instituição de Ensino'}
- Instrutor: ${instructor || 'Instrutor responsável'}
- Modalidade: ${modality || 'online'}
- Estilo desejado: ${style} (${
          style === 'academic'
            ? 'estilo universitário solene'
            : style === 'corporate'
            ? 'estilo empresarial executivo'
            : style === 'modern'
            ? 'estilo moderno direto e dinâmico'
            : 'estilo formal tradicional brasileiro'
        })
${customObjectives ? `- Detalhes/Objetivos adicionais: ${customObjectives}` : ''}

Diretrizes:
- Escreva em português do Brasil impecável.
- Retorne APENAS o texto do certificado (1 parágrafo fluido de 2 a 4 frases).
- Não inclua títulos como "Certificado", nem assinaturas, nem cabeçalhos, apenas o corpo do texto que começa com "Certificamos que..." ou fórmula equivalente.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        const generatedText = response.text?.trim();
        if (generatedText) {
          return res.json({ text: generatedText, source: 'gemini-ai' });
        }
      }

      // Rule-based fallback if no API key is set
      let fallbackText = '';
      const modText = modality === 'online' ? 'Online' : modality === 'presencial' ? 'Presencial' : 'Híbrida';

      if (style === 'academic') {
        fallbackText = `A Reitoria e a Coordenação Acadêmica certificam que ${studentName || '[NOME DO ALUNO]'} concluiu com êxito e mérito acadêmico o curso ${courseName || '[NOME DO CURSO]'}, perfazendo a carga horária regulamentar de ${hours || 40} horas de atividades teóricas e práticas na modalidade ${modText}.`;
      } else if (style === 'corporate') {
        fallbackText = `Certificamos que ${studentName || '[NOME DO ALUNO]'} participou ativamente do programa corporativo de desenvolvimento profissional ${courseName || '[NOME DO CURSO]'}, cumprindo com excelência a carga horária de ${hours || 40} horas realizada na modalidade ${modText}.`;
      } else if (style === 'modern') {
        fallbackText = `Certificamos que ${studentName || '[NOME DO ALUNO]'} concluiu com sucesso a jornada formativa em ${courseName || '[NOME DO CURSO]'}, totalizando ${hours || 40} horas de imersão e projetos práticos na modalidade ${modText}.`;
      } else {
        fallbackText = `Certificamos que ${studentName || '[NOME DO ALUNO]'} concluiu com êxito o curso ${courseName || '[NOME DO CURSO]'}, ministrado por ${instructor || 'corpo docente credenciado'}, com carga horária total de ${hours || 40} horas, realizado na modalidade ${modText}.`;
      }

      return res.json({ text: fallbackText, source: 'template-engine' });
    } catch (err: any) {
      console.error('Error generating certificate text with AI:', err);
      return res.json({
        text: `Certificamos que ${studentName || '[NOME DO ALUNO]'} concluiu com êxito o curso ${courseName || '[NOME DO CURSO]'}, com carga horária total de ${hours || 40} horas.`,
        source: 'fallback',
      });
    }
  });

  // Standardized Error Handler (Mounted after API routes)
  app.use(errorHandler);

  // Vite middleware for development / Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CertifyAI Secure API Server running on http://localhost:${PORT}`);
  });
}

startServer();
