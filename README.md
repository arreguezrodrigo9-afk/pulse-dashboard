# Pulse — CloudScale Analytics Dashboard

Dashboard B2B SaaS con React + Vite + Express + SQLite.

## Correr en local

```bash
npm install
npm run dev
```
Abrir: http://localhost:3000

**Credenciales por defecto:**
- Usuario: `demo`
- Contraseña: `cloudscale2024`

---

## Deploy en Railway (paso a paso)

### 1. Crear cuenta en Railway
Entrar a https://railway.app y registrarse con GitHub.

### 2. Subir el código a GitHub
```bash
git init
git add .
git commit -m "first commit"
# Crear repo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/pulse-dashboard.git
git push -u origin main
```

### 3. Crear proyecto en Railway
- Click en "New Project" → "Deploy from GitHub repo"
- Seleccionar tu repositorio
- Railway lo detecta automáticamente con el Dockerfile

### 4. Configurar variables de entorno en Railway
En el panel de Railway → tu servicio → "Variables", agregar:

| Variable | Valor |
|----------|-------|
| `GEMINI_API_KEY` | Tu clave de Gemini |
| `DEMO_USER` | El usuario que quieras (ej: `cloudscale`) |
| `DEMO_PASS` | La contraseña que quieras (ej: `MiPassword2024`) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

### 5. Deploy
Railway hace el deploy automáticamente. En 2-3 minutos tenés una URL pública tipo:


---

## Estructura del proyecto

```
pulse-dashboard/
├── src/
│   ├── components/
│   │   ├── LoginScreen.tsx    # Pantalla de login
│   │   ├── AIInsights.tsx
│   │   ├── ChurnAnalysis.tsx
│   │   ├── CustomerTable.tsx
│   │   ├── PlanBreakdown.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatCard.tsx
│   ├── utils/cn.ts
│   ├── App.tsx
│   ├── LanguageContext.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── translations.ts
│   └── types.ts
├── server.ts         # Backend Express + auth + Vite
├── Dockerfile        # Para Railway
├── railway.json      # Config Railway
├── index.html
├── vite.config.ts
└── package.json
```
