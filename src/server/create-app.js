import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAIClient, normalizeProvider } from '../ai/openai-client.js';
import { DEFAULT_LOCALE, normalizeLocale } from '../config/runtime.js';
import { DEFAULT_SCENARIO, listAvailableScenarios, normalizeScenario } from '../config/scenario.js';
import { clamp } from '../utils/math.js';
import { ensureAcademicReportStructure, generatePdfBuffer } from '../report/pdf-report.js';
import { ReligionSimulation } from '../simulation/religion-simulation.js';
import { listAvailableProviders } from '../ai/providers.js';
import { SIMULATION_CONFIG } from '../../data/simulation-config.js';
import { GUIDE_BOOK } from '../content/guide-book.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const THREE_VENDOR_DIR = path.resolve(__dirname, '../../node_modules/three');
const DATA_DIR = path.resolve(__dirname, '../../data');

export function createApp() {
  const app = express();
  const openaiClient = new OpenAIClient();
  const simulation = new ReligionSimulation(openaiClient);

  app.use(express.json());
  app.use('/vendor/three', express.static(THREE_VENDOR_DIR));
  app.use('/data', express.static(DATA_DIR));
  app.use(express.static(PUBLIC_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      now: new Date().toISOString(),
      provider: openaiClient.provider,
      providerLabel: openaiClient.providerLabel,
      model: openaiClient.model,
      availableProviders: listAvailableProviders(),
      aiConfigured: Boolean(openaiClient.apiKey),
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      invariant: 'religion_total_constant'
    });
  });

  app.post('/api/simulation/start', async (req, res) => {
    try {
      const useAI = req.body?.useAI ?? req.body?.useOpenAI;
      const provider = normalizeProvider(req.body?.provider || openaiClient.provider);
      const locale = normalizeLocale(req.body?.locale || DEFAULT_LOCALE);
      const scenario = normalizeScenario(req.body?.scenario || DEFAULT_SCENARIO);
      const snapshot = await simulation.start({ useAI: useAI !== false, provider, locale, scenario });
      res.json(snapshot);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/simulation/tick', async (req, res) => {
    try {
      const locale = normalizeLocale(req.body?.locale || DEFAULT_LOCALE);
      const scenario = req.body?.scenario ? normalizeScenario(req.body?.scenario) : undefined;
      const snapshot = await simulation.tick({ locale, scenario });
      res.json(snapshot);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get('/api/guide', (req, res) => {
    const locale = normalizeLocale(req.query.locale || DEFAULT_LOCALE);
    const guide = GUIDE_BOOK[locale] || GUIDE_BOOK[DEFAULT_LOCALE];
    res.json(guide);
  });

  app.get('/api/simulation/scenarios', (_req, res) => {
    res.json({
      defaultScenario: DEFAULT_SCENARIO,
      scenarios: listAvailableScenarios(),
      configVersion: SIMULATION_CONFIG.version
    });
  });

  app.get('/api/simulation/state', (_req, res) => {
    try {
      const snapshot = simulation.snapshot();
      res.json(snapshot);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  });

  app.post('/api/simulation/signals', (req, res) => {
    try {
      const state = simulation.ensureState();
      const overrides = req.body?.overrides || {};
      for (const [key, val] of Object.entries(overrides)) {
        if (key in state.socialSignals) {
          const num = Number(val);
          if (Number.isFinite(num)) {
            state.manualSignalOverrides[key] = clamp(num, 0.1, 0.98);
            state.socialSignals[key] = clamp(num, 0.1, 0.98);
          }
        }
      }
      res.json({ ok: true, socialSignals: state.socialSignals });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post('/api/simulation/report', async (_req, res) => {
    try {
      const snapshot = simulation.snapshot();

      if (!openaiClient.enabled) {
        return res.status(400).json({ message: 'AI is not configured. Please set AI_API_KEY.' });
      }

      if (snapshot.round < 1) {
        return res
          .status(400)
          .json({ message: 'Simulation has not started or no rounds completed.' });
      }

      const markdown = await openaiClient.generateReport(snapshot);
      if (!markdown) {
        return res.status(500).json({ message: 'AI failed to generate report content.' });
      }
      const academicMarkdown = ensureAcademicReportStructure(markdown, snapshot);

      const title = `Religion Dynamics Analysis Report — Round ${snapshot.round}`;
      const pdfBuffer = await generatePdfBuffer(academicMarkdown, { title });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="religion-analysis-round-${snapshot.round}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
      return null;
    } catch (err) {
      console.error('Report generation error:', err);
      res.status(500).json({ message: err.message });
      return null;
    }
  });

  return {
    app,
    openaiClient,
    simulation
  };
}
