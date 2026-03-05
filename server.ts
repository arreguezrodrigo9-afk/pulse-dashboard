import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("pulse.db");

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    company TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    plan TEXT NOT NULL CHECK(plan IN ('Basic','Pro','Enterprise')),
    status TEXT NOT NULL CHECK(status IN ('active','churned','trial')),
    industry TEXT,
    team_size INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL,
    churned_at DATETIME,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    plan TEXT NOT NULL,
    amount REAL NOT NULL,
    billing_date DATETIME NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('paid','failed','refunded')),
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    event_type TEXT NOT NULL,
    metadata TEXT,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
  );
`);

// ─── Seed ─────────────────────────────────────────────────────────────────────
const customerCount = db.prepare("SELECT COUNT(*) as c FROM customers").get() as { c: number };

if (customerCount.c === 0) {
  console.log("🌱 Seeding CloudScale B2B database...");

  // Precios reales por plan
  const PLAN_PRICES: Record<string, number> = {
    Basic: 149,
    Pro: 499,
    Enterprise: 1499,
  };

  // Empresas realistas del ecosistema cloud/tech
  const companies = [
    { name: "Nexacloud Ventures", industry: "FinTech", size: 45 },
    { name: "DataBridge Corp", industry: "Analytics", size: 120 },
    { name: "Orbis Infrastructure", industry: "DevOps", size: 230 },
    { name: "Quanta Systems", industry: "AI/ML", size: 85 },
    { name: "Verilink Solutions", industry: "Telecom", size: 340 },
    { name: "Stackform Inc", industry: "SaaS", size: 67 },
    { name: "Corelight Technologies", industry: "Security", size: 150 },
    { name: "Aero Data Labs", industry: "Aerospace", size: 90 },
    { name: "PulseRetail Co", industry: "Retail", size: 200 },
    { name: "Mercado Digital SA", industry: "eCommerce", size: 310 },
    { name: "Apex Cloud Services", industry: "Cloud", size: 55 },
    { name: "Genomix Analytics", industry: "Biotech", size: 40 },
    { name: "Trident Logistics", industry: "Logistics", size: 175 },
    { name: "Silverline Media", industry: "Media", size: 95 },
    { name: "Helix Health IT", industry: "Healthcare", size: 260 },
    { name: "Nuvola Platforms", industry: "SaaS", size: 70 },
    { name: "Fastlane Payments", industry: "FinTech", size: 130 },
    { name: "Zenith Data Corp", industry: "Analytics", size: 185 },
    { name: "IronMesh Security", industry: "Security", size: 60 },
    { name: "BlueSky Innovations", industry: "AI/ML", size: 110 },
    { name: "Momentum Commerce", industry: "eCommerce", size: 290 },
    { name: "GreenGrid Energy", industry: "Energy", size: 145 },
    { name: "Crestview Capital", industry: "FinTech", size: 220 },
    { name: "Reflex Networks", industry: "Telecom", size: 380 },
    { name: "Cascade Software", industry: "SaaS", size: 48 },
    { name: "Optima Retail", industry: "Retail", size: 165 },
    { name: "FrontEdge Consulting", industry: "Consulting", size: 35 },
    { name: "Datura Robotics", industry: "Manufacturing", size: 195 },
    { name: "Polar Bear Analytics", industry: "Analytics", size: 78 },
    { name: "CloudNest Corp", industry: "Cloud", size: 420 },
    { name: "Tekton Systems", industry: "DevOps", size: 135 },
    { name: "OceanBase Ltd", industry: "Database", size: 88 },
    { name: "Vertex AI Labs", industry: "AI/ML", size: 52 },
    { name: "Quantum Fintech", industry: "FinTech", size: 143 },
    { name: "Starlight Media", industry: "Media", size: 67 },
    { name: "Evergreen Logistics", industry: "Logistics", size: 255 },
    { name: "BrightPath EdTech", industry: "EdTech", size: 41 },
    { name: "Fusion Cloud Inc", industry: "Cloud", size: 312 },
    { name: "Pinnacle Security", industry: "Security", size: 99 },
    { name: "Horizon Healthcare", industry: "Healthcare", size: 178 },
    { name: "AgileBuild Software", industry: "SaaS", size: 63 },
    { name: "NorthStar Commerce", industry: "eCommerce", size: 267 },
    { name: "Cobalt DevOps", industry: "DevOps", size: 82 },
    { name: "Radiant Analytics", industry: "Analytics", size: 115 },
    { name: "Ember Systems", industry: "Manufacturing", size: 198 },
    { name: "Capsule Biotech", industry: "Biotech", size: 37 },
    { name: "Ironclad Payments", industry: "FinTech", size: 155 },
    { name: "Skyline Telecom", industry: "Telecom", size: 445 },
    { name: "Prism Data Co", industry: "Analytics", size: 74 },
    { name: "Lunar Retail Group", industry: "Retail", size: 332 },
  ];

  // Función para asignar plan según tamaño de empresa (realista)
  const assignPlan = (size: number): string => {
    if (size >= 200) return "Enterprise";
    if (size >= 80) return "Pro";
    return "Basic";
  };

  const insertCustomer = db.prepare(`
    INSERT INTO customers (email, company, contact_name, plan, status, industry, team_size, created_at, churned_at, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSub = db.prepare(`
    INSERT INTO subscriptions (customer_id, plan, amount, billing_date, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = new Date();

  // Nombres de contacto realistas
  const contacts = [
    "María González", "Carlos Rodríguez", "Ana Martínez", "Luis García",
    "Sofía López", "Diego Hernández", "Valentina Torres", "Andrés Flores",
    "Camila Ramírez", "Mateo Reyes", "Isabela Castro", "Sebastián Morales",
    "Paula Jiménez", "Nicolás Vargas", "Daniela Romero", "Juan Medina",
    "Laura Suárez", "Ricardo Álvarez", "Natalia Díaz", "Alejandro Cruz",
    "Michelle Ortega", "Fernando Guerrero", "Valeria Mendez", "Eduardo Ríos",
    "Gabriela Santos", "Roberto Navarro", "Carolina Fuentes", "Miguel Herrera",
    "Andrea Peña", "Francisco Aguilar", "Sara Muñoz", "Ernesto Cabrera",
    "Claudia Rojas", "Julio Sandoval", "Patricia Vega", "Armando Luna",
    "Rebeca Salinas", "Héctor Estrada", "Mónica Figueroa", "Enrique Ibarra",
    "Lucía Parra", "Rafael Núñez", "Silvia Campos", "Oscar Acosta",
    "Verónica Espinoza", "Javier Guzmán", "Diana Montes", "César Delgado",
    "Adriana Ávila", "Marcos Velasco",
  ];

  const seedAll = db.transaction(() => {
    companies.forEach((company, i) => {
      const plan = assignPlan(company.size);
      const price = PLAN_PRICES[plan];

      // Fecha de creación: entre 1 y 18 meses atrás (distribuida)
      const monthsAgo = Math.floor(Math.random() * 18) + 1;
      const createdAt = new Date(now);
      createdAt.setMonth(createdAt.getMonth() - monthsAgo);
      createdAt.setDate(Math.floor(Math.random() * 28) + 1);

      // Churn: ~22% de los clientes (más realista para B2B SaaS)
      // Empresas más pequeñas tienen más churn
      const churnProbability = plan === "Basic" ? 0.35 : plan === "Pro" ? 0.18 : 0.08;
      const isChurned = Math.random() < churnProbability;

      let churnedAt: string | null = null;
      let lastLogin: string | null = null;

      if (isChurned) {
        // Churned entre 1 y (monthsAgo-1) meses atrás
        const churnMonthsAgo = Math.floor(Math.random() * Math.max(1, monthsAgo - 1)) + 1;
        const churnDate = new Date(now);
        churnDate.setMonth(churnDate.getMonth() - churnMonthsAgo);
        churnedAt = churnDate.toISOString();
      } else {
        // Último login entre hoy y 30 días atrás
        const loginDaysAgo = Math.floor(Math.random() * 30);
        const loginDate = new Date(now);
        loginDate.setDate(loginDate.getDate() - loginDaysAgo);
        lastLogin = loginDate.toISOString();
      }

      const status = isChurned ? "churned" : "active";

      const customer = insertCustomer.run(
        `${company.name.toLowerCase().replace(/\s+/g, ".")}@cloudscale.io`,
        company.name,
        contacts[i] || `Contact ${i}`,
        plan,
        status,
        company.industry,
        company.size,
        createdAt.toISOString(),
        churnedAt,
        lastLogin
      );

      const customerId = customer.lastInsertRowid as number;

      // Generar historial de pagos mes a mes desde creación hasta hoy (o hasta churn)
      const activeUntil = isChurned ? new Date(churnedAt!) : new Date(now);
      const billingDate = new Date(createdAt);

      while (billingDate <= activeUntil) {
        // Pequeña variación en el monto (upgrades/descuentos eventuales)
        const variation = (Math.random() - 0.5) * price * 0.05;
        const amount = parseFloat((price + variation).toFixed(2));

        // 3% de fallo de pago
        const paymentStatus = Math.random() < 0.03 ? "failed" : "paid";

        insertSub.run(customerId, plan, amount, billingDate.toISOString(), paymentStatus);
        billingDate.setMonth(billingDate.getMonth() + 1);
      }
    });
  });

  seedAll();
  console.log("✅ CloudScale database seeded with 50 B2B customers");
}


// ─── Auth ─────────────────────────────────────────────────────────────────────
const DEMO_USER = process.env.DEMO_USER || 'demo';
const DEMO_PASS = process.env.DEMO_PASS || 'cloudscale2024';
const sessions = new Map();

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { expires: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}

function isValidSession(token) {
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expires) { sessions.delete(token); return false; }
  return true;
}

function authMiddleware(req, res, next) {
  if (req.path === '/api/login' || req.path === '/api/logout') return next();
  if (req.path.startsWith('/api')) {
    const token = req.headers['x-session-token'];
    if (!isValidSession(token)) return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// ─── Server ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(authMiddleware);

  // ── POST /api/login ──────────────────────────────────────────────────────────
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === DEMO_USER && password === DEMO_PASS) {
      const token = createSession();
      res.json({ token, ok: true });
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  });

  // ── POST /api/logout ─────────────────────────────────────────────────────────
  app.post('/api/logout', (req, res) => {
    const token = req.headers['x-session-token'];
    if (token) sessions.delete(token);
    res.json({ ok: true });
  });

  // ── GET /api/summary ────────────────────────────────────────────────────────
  app.get("/api/summary", (_req, res) => {
    try {
      const activeCustomers = db
        .prepare("SELECT COUNT(*) as c FROM customers WHERE status = 'active'")
        .get() as { c: number };

      const totalCustomers = db
        .prepare("SELECT COUNT(*) as c FROM customers")
        .get() as { c: number };

      const churnedCustomers = db
        .prepare("SELECT COUNT(*) as c FROM customers WHERE status = 'churned'")
        .get() as { c: number };

      // MRR: mes actual
      const mrrCurrent = db
        .prepare(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM subscriptions
          WHERE status = 'paid'
            AND strftime('%Y-%m', billing_date) = strftime('%Y-%m', 'now')
        `)
        .get() as { total: number };

      // MRR: mes anterior (para calcular crecimiento real)
      const mrrPrev = db
        .prepare(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM subscriptions
          WHERE status = 'paid'
            AND strftime('%Y-%m', billing_date) = strftime('%Y-%m', date('now', '-1 month'))
        `)
        .get() as { total: number };

      // Nuevos clientes este mes
      const newThisMonth = db
        .prepare(`
          SELECT COUNT(*) as c FROM customers
          WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
        `)
        .get() as { c: number };

      // Nuevos clientes mes anterior
      const newLastMonth = db
        .prepare(`
          SELECT COUNT(*) as c FROM customers
          WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', date('now', '-1 month'))
        `)
        .get() as { c: number };

      // Churn rate: churned / total activos (metodología SaaS estándar)
      const churnRate =
        totalCustomers.c > 0
          ? parseFloat(((churnedCustomers.c / totalCustomers.c) * 100).toFixed(1))
          : 0;

      // Crecimiento MRR mes a mes
      const mrrGrowth =
        mrrPrev.total > 0
          ? parseFloat((((mrrCurrent.total - mrrPrev.total) / mrrPrev.total) * 100).toFixed(1))
          : 0;

      // ARPU
      const arpu =
        activeCustomers.c > 0
          ? parseFloat((mrrCurrent.total / activeCustomers.c).toFixed(2))
          : 0;

      // Crecimiento de clientes
      const customerGrowth =
        newLastMonth.c > 0
          ? parseFloat((((newThisMonth.c - newLastMonth.c) / newLastMonth.c) * 100).toFixed(1))
          : 0;

      res.json({
        activeCustomers: activeCustomers.c,
        mrr: parseFloat(mrrCurrent.total.toFixed(2)),
        mrrPrev: parseFloat(mrrPrev.total.toFixed(2)),
        mrrGrowth,
        churnRate,
        arpu,
        newThisMonth: newThisMonth.c,
        newLastMonth: newLastMonth.c,
        customerGrowth,
        totalCustomers: totalCustomers.c,
      });
    } catch (err) {
      console.error("/api/summary error:", err);
      res.status(500).json({ error: "Error al obtener resumen" });
    }
  });

  // ── GET /api/revenue-chart ──────────────────────────────────────────────────
  app.get("/api/revenue-chart", (_req, res) => {
    try {
      const months = db
        .prepare(`
          SELECT
            strftime('%Y-%m', billing_date) as month,
            ROUND(SUM(CASE WHEN plan = 'Basic' THEN amount ELSE 0 END), 2) as basic,
            ROUND(SUM(CASE WHEN plan = 'Pro' THEN amount ELSE 0 END), 2) as pro,
            ROUND(SUM(CASE WHEN plan = 'Enterprise' THEN amount ELSE 0 END), 2) as enterprise,
            ROUND(SUM(amount), 2) as total
          FROM subscriptions
          WHERE status = 'paid'
          GROUP BY strftime('%Y-%m', billing_date)
          ORDER BY month ASC
          LIMIT 12
        `)
        .all();

      res.json(months);
    } catch (err) {
      console.error("/api/revenue-chart error:", err);
      res.status(500).json({ error: "Error al obtener datos de revenue" });
    }
  });

  // ── GET /api/plan-breakdown ─────────────────────────────────────────────────
  app.get("/api/plan-breakdown", (_req, res) => {
    try {
      const breakdown = db
        .prepare(`
          SELECT
            plan,
            status,
            COUNT(*) as count,
            ROUND(AVG(team_size), 0) as avg_team_size
          FROM customers
          GROUP BY plan, status
          ORDER BY plan, status
        `)
        .all();

      // MRR por plan
      const mrrByPlan = db
        .prepare(`
          SELECT
            s.plan,
            ROUND(SUM(s.amount), 2) as mrr
          FROM subscriptions s
          WHERE s.status = 'paid'
            AND strftime('%Y-%m', s.billing_date) = strftime('%Y-%m', 'now')
          GROUP BY s.plan
        `)
        .all() as { plan: string; mrr: number }[];

      const mrrMap: Record<string, number> = {};
      mrrByPlan.forEach((r) => {
        mrrMap[r.plan] = r.mrr;
      });

      res.json({ breakdown, mrrByPlan: mrrMap });
    } catch (err) {
      console.error("/api/plan-breakdown error:", err);
      res.status(500).json({ error: "Error al obtener breakdown de planes" });
    }
  });

  // ── GET /api/churn-analysis ─────────────────────────────────────────────────
  app.get("/api/churn-analysis", (_req, res) => {
    try {
      // Churn por plan
      const churnByPlan = db
        .prepare(`
          SELECT
            plan,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) as churned,
            ROUND(
              100.0 * SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) / COUNT(*),
              1
            ) as churn_rate
          FROM customers
          GROUP BY plan
          ORDER BY churn_rate DESC
        `)
        .all();

      // Churn por industria
      const churnByIndustry = db
        .prepare(`
          SELECT
            industry,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) as churned,
            ROUND(
              100.0 * SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) / COUNT(*),
              1
            ) as churn_rate
          FROM customers
          WHERE industry IS NOT NULL
          GROUP BY industry
          HAVING total >= 2
          ORDER BY churn_rate DESC
          LIMIT 5
        `)
        .all();

      // Churn en los últimos 6 meses (mes a mes)
      const churnTrend = db
        .prepare(`
          SELECT
            strftime('%Y-%m', churned_at) as month,
            COUNT(*) as churned_count
          FROM customers
          WHERE status = 'churned'
            AND churned_at >= date('now', '-6 months')
          GROUP BY strftime('%Y-%m', churned_at)
          ORDER BY month ASC
        `)
        .all();

      res.json({ churnByPlan, churnByIndustry, churnTrend });
    } catch (err) {
      console.error("/api/churn-analysis error:", err);
      res.status(500).json({ error: "Error al obtener análisis de churn" });
    }
  });

  // ── GET /api/customers ──────────────────────────────────────────────────────
  app.get("/api/customers", (req, res) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const plan = req.query.plan as string | undefined;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      let query = "SELECT * FROM customers WHERE 1=1";
      const params: (string | number)[] = [];

      if (plan && plan !== "all") {
        query += " AND plan = ?";
        params.push(plan);
      }
      if (status && status !== "all") {
        query += " AND status = ?";
        params.push(status);
      }
      if (search) {
        query += " AND (company LIKE ? OR contact_name LIKE ? OR email LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += " ORDER BY created_at DESC LIMIT ?";
      params.push(limit);

      const customers = db.prepare(query).all(...params);
      res.json(customers);
    } catch (err) {
      console.error("/api/customers error:", err);
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  });

  // ── POST /api/ai-insights ───────────────────────────────────────────────────
  app.post("/api/ai-insights", async (_req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY no configurada");
      }

      // Recopilar datos ricos para el análisis
      const summary = db
        .prepare(`
          SELECT
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) as churned,
            COUNT(*) as total
          FROM customers
        `)
        .get() as { active: number; churned: number; total: number };

      const planBreakdown = db
        .prepare(`
          SELECT plan, status, COUNT(*) as count
          FROM customers
          GROUP BY plan, status
        `)
        .all();

      const mrrCurrent = db
        .prepare(`SELECT COALESCE(SUM(amount),0) as mrr FROM subscriptions WHERE status='paid' AND strftime('%Y-%m',billing_date)=strftime('%Y-%m','now')`)
        .get() as { mrr: number };

      const mrrPrev = db
        .prepare(`SELECT COALESCE(SUM(amount),0) as mrr FROM subscriptions WHERE status='paid' AND strftime('%Y-%m',billing_date)=strftime('%Y-%m',date('now','-1 month'))`)
        .get() as { mrr: number };

      const churnByPlan = db
        .prepare(`
          SELECT plan,
            ROUND(100.0 * SUM(CASE WHEN status='churned' THEN 1 ELSE 0 END) / COUNT(*), 1) as churn_rate,
            COUNT(*) as total
          FROM customers GROUP BY plan
        `)
        .all() as { plan: string; churn_rate: number; total: number }[];

      const topIndustries = db
        .prepare(`
          SELECT industry, COUNT(*) as count,
            SUM(CASE WHEN status='churned' THEN 1 ELSE 0 END) as churned
          FROM customers WHERE industry IS NOT NULL
          GROUP BY industry ORDER BY count DESC LIMIT 5
        `)
        .all();

      const recentChurn = db
        .prepare(`
          SELECT company, plan, industry, team_size
          FROM customers WHERE status='churned'
          ORDER BY churned_at DESC LIMIT 5
        `)
        .all();

      const failedPayments = db
        .prepare(`SELECT COUNT(*) as c FROM subscriptions WHERE status='failed'`)
        .get() as { c: number };

      const arpu =
        summary.active > 0
          ? (mrrCurrent.mrr / summary.active).toFixed(2)
          : "0";

      const mrrGrowth =
        mrrPrev.mrr > 0
          ? (((mrrCurrent.mrr - mrrPrev.mrr) / mrrPrev.mrr) * 100).toFixed(1)
          : "0";

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `Eres un analista de negocios B2B SaaS senior especializado en empresas de monitoreo de infraestructura cloud.

EMPRESA: CloudScale Solutions
PRODUCTO: Herramientas de monitoreo de infraestructura cloud (Basic $149/mes, Pro $499/mes, Enterprise $1499/mes)
PROBLEMA CLAVE: El equipo directivo nota fluctuaciones de ingreso y necesita saber si se debe a churn o a que nuevos clientes entran en planes básicos.

DATOS ACTUALES:
- Clientes activos: ${summary.active} | Churned: ${summary.churned} | Total: ${summary.total}
- MRR este mes: $${mrrCurrent.mrr.toFixed(0)} | Mes anterior: $${mrrPrev.mrr.toFixed(0)} | Crecimiento: ${mrrGrowth}%
- ARPU: $${arpu}/mes
- Pagos fallidos: ${failedPayments.c}
- Distribución por plan: ${JSON.stringify(planBreakdown)}
- Tasa de churn por plan: ${JSON.stringify(churnByPlan)}
- Top industrias: ${JSON.stringify(topIndustries)}
- Churn reciente (últimas 5 bajas): ${JSON.stringify(recentChurn)}

Analiza estos datos y genera exactamente 3 insights accionables y específicos para el equipo directivo de CloudScale.
Cada insight debe:
1. Identificar un patrón concreto de los datos (no genérico)
2. Proponer una acción específica con contexto B2B SaaS
3. Mencionar impacto estimado en revenue o retención

Responde SOLO con JSON válido, sin markdown, sin texto extra:
{ "insights": [{ "title": "string (máx 8 palabras, directo)", "description": "string (2-3 oraciones, datos concretos + acción)", "impact": "high|medium|low" }] }`;

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const text = result.text?.trim() || "{}";
      const parsed = JSON.parse(text);

      if (!parsed.insights || !Array.isArray(parsed.insights)) {
        throw new Error("Formato inválido de respuesta IA");
      }

      res.json(parsed);
    } catch (err) {
      console.error("AI insights error:", err);

      // Fallback contextualizado a CloudScale
      res.json({
        insights: [
          {
            title: "Plan Basic concentra la mayoría del churn",
            description:
              "Las empresas en plan Basic tienen una tasa de cancelación significativamente mayor. Implementa un programa de retención a los 60 días que incluya una demo 1:1 de las funciones Pro más relevantes para su industria.",
            impact: "high",
          },
          {
            title: "Upselling a Enterprise es tu mayor palanca de MRR",
            description:
              "Convertir un cliente Pro a Enterprise representa $1,000/mes adicionales vs $350 en Pro. Identifica los clientes Pro con equipos de +80 personas y contáctalos con un ROI calculado de monitoreo en producción.",
            impact: "high",
          },
          {
            title: "Fallos de pago representan ingresos recuperables",
            description:
              "Los pagos fallidos son churn involuntario. Automatiza reintentos de cobro a las 24h, 72h y 7 días, y envía notificaciones proactivas al administrador de cuenta para reducir la pérdida silenciosa de clientes activos.",
            impact: "medium",
          },
        ],
      });
    }
  });

  // ─── Vite Dev Middleware ───────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: __dirname,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Pulse v2 corriendo en http://localhost:${PORT}`);
    console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? "✅ configurada" : "❌ falta"}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
