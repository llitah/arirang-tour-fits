@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #F6F1EA;
  --onyx: #171213;
  --wine: #4B0E20;
  --crimson: #93132E;
  --sand: #DED2C2;
  --gold: #B08D57;
}

html, body {
  padding: 0;
  margin: 0;
  background: var(--bg);
  color: var(--onyx);
}

.font-display { font-family: 'Playfair Display', serif; }
.font-body { font-family: 'Inter', sans-serif; }

.glass {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.7);
}
.glass-dark {
  background: linear-gradient(135deg, rgba(75,14,32,0.92), rgba(23,18,19,0.92));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.08);
  color: #F6F1EA;
}
.hairline { border-color: rgba(23,18,19,0.1); }

@keyframes fadeUp { from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }
.animate-fadeUp { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }

@keyframes popIn { from{opacity:0; transform:scale(.92);} to{opacity:1; transform:scale(1);} }
.animate-popIn { animation: popIn .35s cubic-bezier(.22,1,.36,1) both; }

@keyframes shimmer { 0%{background-position:-400px 0;} 100%{background-position:400px 0;} }
.skeleton {
  background: linear-gradient(90deg, rgba(23,18,19,0.06) 25%, rgba(23,18,19,0.12) 37%, rgba(23,18,19,0.06) 63%);
  background-size: 400px 100%;
  animation: shimmer 1.4s ease infinite;
}

.card-hover { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
.card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -18px rgba(75,14,32,0.35); }

.tap { transition: transform .15s ease; }
.tap:active { transform: scale(0.96); }

::-webkit-scrollbar { height:6px; width:6px; }
::-webkit-scrollbar-thumb { background: rgba(75,14,32,0.25); border-radius: 10px; }

.eyebrow { letter-spacing:.18em; text-transform:uppercase; font-size:11px; font-weight:600; }
