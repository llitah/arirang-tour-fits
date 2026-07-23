"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart, ThumbsUp, Star, Plus, X, ChevronLeft, Image as ImageIcon,
  Link2, MessageCircle, Check, ShoppingBag, Sparkles, LayoutGrid,
  Trash2, Pencil, ArrowLeftRight, Home as HomeIcon, RefreshCw,
  User, DollarSign, ListChecks, Send, Pin, Upload, Loader2
} from "lucide-react";

/* ---------------------------------------------------------------
   DATA
--------------------------------------------------------------- */

const PIECE_TYPES = [
  { key: "blusa", label: "Blusa" },
  { key: "baixo", label: "Parte de Baixo" },
  { key: "sapato", label: "Sapato" },
  { key: "bolsa", label: "Bolsa" },
  { key: "acessorios", label: "Acessórios" },
];

const emptyPiece = () => ({ img: "", link: "", preco: "", obs: "" });

const emptyPieces = () =>
  PIECE_TYPES.reduce((acc, p) => ({ ...acc, [p.key]: emptyPiece() }), {});

const DEFAULT_DATA = {
  peopleNames: { p1: "Letícia", p2: "Stella" },
  shows: [
    { id: "show28", title: "Show 28", subtitle: "Dia 01" },
    { id: "show30", title: "Show 30", subtitle: "Dia 02" },
    { id: "show31", title: "Show 31", subtitle: "Dia 03" },
  ],
  looks: {},
  votes: {},
  comments: {},
  wishlist: [],
  checklist: {},
  moodboard: [],
};

const VOTE_TYPES = [
  { key: "heart", icon: Heart, color: "#93132E" },
  { key: "thumb", icon: ThumbsUp, color: "#4B0E20" },
  { key: "star", icon: Star, color: "#B08D57" },
];

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ---------------------------------------------------------------
   API (substitui o window.storage do modo artifact)
--------------------------------------------------------------- */

async function apiGetData() {
  const res = await fetch("/api/data", { cache: "no-store" });
  const json = await res.json();
  return json.value || null;
}

async function apiSetData(data) {
  await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function apiGetImage(id) {
  const res = await fetch("/api/image?id=" + encodeURIComponent(id), { cache: "no-store" });
  const json = await res.json();
  return json.value || null;
}

async function apiUploadImage(dataUrl) {
  const res = await fetch("/api/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  const json = await res.json();
  return json.id;
}

const money = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return "R$ 0,00";
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
};

/* ---------------------------------------------------------------
   IMAGE UPLOAD (galeria do celular)
   Fotos são redimensionadas/comprimidas no aparelho e guardadas
   em uma chave própria no storage (referenciada como "store://id"),
   para não estourar o limite de tamanho do registro principal.
--------------------------------------------------------------- */

function resizeImageFile(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Não foi possível ler a imagem"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

const imageCache = {};

async function saveImageToStorage(dataUrl) {
  const id = await apiUploadImage(dataUrl);
  imageCache[id] = dataUrl;
  return "store://" + id;
}

function resolveImg(raw) {
  if (!raw) return "";
  if (!raw.startsWith("store://")) return raw;
  return imageCache[raw.slice(8)] || "";
}

function useImageSrc(raw) {
  const [src, setSrc] = useState(() => resolveImg(raw));
  useEffect(() => {
    if (!raw) { setSrc(""); return; }
    if (!raw.startsWith("store://")) { setSrc(raw); return; }
    const id = raw.slice(8);
    if (imageCache[id]) { setSrc(imageCache[id]); return; }
    let cancelled = false;
    setSrc("");
    (async () => {
      try {
        const value = await apiGetImage(id);
        if (value && !cancelled) {
          imageCache[id] = value;
          setSrc(value);
        }
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [raw]);
  return src;
}

function SmartImg({ src, className, alt, style }) {
  const resolved = useImageSrc(src);
  if (!resolved) return null;
  return <img src={resolved} alt={alt} className={className} style={style} onError={(e) => { e.target.style.display = "none"; }} />;
}

function ImageField({ value, onLocalChange, onCommit }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const isStored = value && value.startsWith("store://");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      const ref = await saveImageToStorage(dataUrl);
      onLocalChange(ref);
      onCommit(ref);
    } catch (ex) {
      setErr("Não foi possível enviar a imagem. Tente outra foto.");
    }
    setBusy(false);
  };

  const clearImage = () => {
    onLocalChange("");
    onCommit("");
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="tap flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg flex-shrink-0"
          style={{ background: "rgba(75,14,32,0.08)", color: WINE }}
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {busy ? "Enviando..." : "Galeria"}
        </button>
        <input
          value={isStored ? "" : value || ""}
          onChange={(e) => onLocalChange(e.target.value)}
          onBlur={(e) => onCommit(e.target.value)}
          placeholder={isStored ? "Imagem enviada da galeria" : "ou cole o link da imagem"}
          disabled={isStored}
          className="text-xs rounded-lg px-3 py-2 bg-white/70 outline-none border hairline flex-1 disabled:opacity-60"
        />
        {value ? (
          <button type="button" onClick={clearImage} className="tap opacity-50 hover:opacity-90 flex-shrink-0" title="Remover imagem">
            <X size={15} />
          </button>
        ) : null}
      </div>
      {err && <span className="text-[11px]" style={{ color: CRIMSON }}>{err}</span>}
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
--------------------------------------------------------------- */

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [view, setView] = useState({ type: "home" });
  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const value = await apiGetData();
        if (value) setData(value);
        else {
          setData(DEFAULT_DATA);
          await apiSetData(DEFAULT_DATA);
        }
      } catch (e) {
        setData(DEFAULT_DATA);
      }
      try {
        const savedMe = window.localStorage.getItem("arirang:me");
        if (savedMe) setMe(savedMe);
        else setShowPersonPicker(true);
      } catch (e) {
        setShowPersonPicker(true);
      }
      setLoading(false);
    })();
  }, []);

  // Mantém as duas telas sincronizadas: atualiza ao focar a aba/app
  // e periodicamente em segundo plano.
  useEffect(() => {
    const sync = async () => {
      try {
        const value = await apiGetData();
        if (value) setData(value);
      } catch (e) {}
    };
    const onFocus = () => sync();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") sync();
    });
    const interval = setInterval(sync, 20000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, []);

  const persist = useCallback(async (next) => {
    try {
      await apiSetData(next);
    } catch (e) {
      console.error("Falha ao salvar", e);
    }
  }, []);

  const update = useCallback(
    (fn) => {
      setData((prev) => {
        const next = fn(JSON.parse(JSON.stringify(prev)));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const refreshData = async () => {
    setSyncing(true);
    try {
      const value = await apiGetData();
      if (value) setData(value);
    } catch (e) {}
    setSyncing(false);
  };

  const choosePerson = (key) => {
    const name = data.peopleNames[key];
    setMe(name);
    setShowPersonPicker(false);
    try {
      window.localStorage.setItem("arirang:me", name);
    } catch (e) {}
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: BG }}>
        <style>{FONT_IMPORT}</style>
        <div className="font-display italic text-2xl" style={{ color: WINE }}>
          carregando o closet…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-body" style={{ background: BG, color: ONYX }}>
      <style>{GLOBAL_STYLE}</style>

      {showPersonPicker && (
        <PersonPicker data={data} onChoose={choosePerson} />
      )}

      <TopBar
        me={me}
        view={view}
        setView={setView}
        onRefresh={refreshData}
        syncing={syncing}
        onSwitchPerson={() => setShowPersonPicker(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 pt-6">
        {view.type === "home" && <HomeView data={data} setView={setView} />}
        {view.type === "show" && (
          <ShowView
            data={data}
            update={update}
            showId={view.showId}
            me={me}
            setView={setView}
          />
        )}
        {view.type === "look" && (
          <LookDetailView
            data={data}
            update={update}
            showId={view.showId}
            lookId={view.lookId}
            me={me}
            setView={setView}
          />
        )}
        {view.type === "compare" && <CompareView data={data} setView={setView} />}
        {view.type === "wishlist" && (
          <WishlistView data={data} update={update} me={me} />
        )}
        {view.type === "moodboard" && (
          <MoodboardView data={data} update={update} me={me} />
        )}
      </main>

      <BottomNav view={view} setView={setView} />
    </div>
  );
}

/* ---------------------------------------------------------------
   THEME TOKENS
--------------------------------------------------------------- */

const BG = "#F6F1EA";
const ONYX = "#171213";
const WINE = "#4B0E20";
const CRIMSON = "#93132E";
const SAND = "#DED2C2";
const GOLD = "#B08D57";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700;800&display=swap');`;

const GLOBAL_STYLE = `
${FONT_IMPORT}
.font-display{ font-family:'Playfair Display', serif; }
.font-body{ font-family:'Inter', sans-serif; }
.glass{
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.7);
}
.glass-dark{
  background: linear-gradient(135deg, rgba(75,14,32,0.92), rgba(23,18,19,0.92));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.08);
  color: #F6F1EA;
}
.hairline{ border-color: rgba(23,18,19,0.1); }
@keyframes fadeUp{ from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }
.animate-fadeUp{ animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
@keyframes popIn{ from{opacity:0; transform:scale(.92);} to{opacity:1; transform:scale(1);} }
.animate-popIn{ animation: popIn .35s cubic-bezier(.22,1,.36,1) both; }
.card-hover{ transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
.card-hover:hover{ transform: translateY(-6px); box-shadow: 0 20px 40px -18px rgba(75,14,32,0.35); }
.tap{ transition: transform .15s ease; }
.tap:active{ transform: scale(0.96); }
::-webkit-scrollbar{ height:6px; width:6px; }
::-webkit-scrollbar-thumb{ background: rgba(75,14,32,0.25); border-radius: 10px; }
input, textarea{ font-family:'Inter', sans-serif; }
.eyebrow{ letter-spacing:.18em; text-transform:uppercase; font-size:11px; font-weight:600; }
`;

/* ---------------------------------------------------------------
   PERSON PICKER
--------------------------------------------------------------- */

function PersonPicker({ data, onChoose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(23,18,19,0.55)", backdropFilter: "blur(6px)" }}>
      <style>{FONT_IMPORT}</style>
      <div className="glass rounded-3xl max-w-sm w-full p-8 animate-popIn text-center shadow-2xl">
        <Sparkles className="mx-auto mb-3" size={26} color={WINE} />
        <p className="eyebrow" style={{ color: CRIMSON }}>tour capsule</p>
        <h2 className="font-display text-3xl italic mt-1 mb-6" style={{ color: ONYX }}>
          Quem é você?
        </h2>
        <div className="flex flex-col gap-3">
          {["p1", "p2"].map((k) => (
            <button
              key={k}
              onClick={() => onChoose(k)}
              className="tap rounded-2xl py-4 px-5 font-semibold text-lg font-display"
              style={{ background: `linear-gradient(135deg, ${WINE}, ${CRIMSON})`, color: "#F6F1EA" }}
            >
              {data.peopleNames[k]}
            </button>
          ))}
        </div>
        <p className="text-xs mt-5 opacity-50">Isso fica salvo apenas neste dispositivo.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TOP BAR + BOTTOM NAV
--------------------------------------------------------------- */

function TopBar({ me, view, setView, onRefresh, syncing, onSwitchPerson }) {
  const NAV = [
    { key: "home", label: "Início", icon: HomeIcon },
    { key: "compare", label: "Comparar", icon: ArrowLeftRight },
    { key: "wishlist", label: "Wishlist", icon: ShoppingBag },
    { key: "moodboard", label: "Moodboard", icon: LayoutGrid },
  ];
  return (
    <header
      className="sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between"
      style={{ background: `linear-gradient(120deg, ${ONYX}, ${WINE} 65%, ${CRIMSON})`, color: "#F6F1EA" }}
    >
      <button className="flex items-center gap-2 tap" onClick={() => setView({ type: "home" })}>
        <Sparkles size={20} color={GOLD} />
        <span className="font-display italic text-xl tracking-wide">Arirang Looks</span>
      </button>

      <nav className="hidden md:flex items-center gap-1 rounded-full glass-dark px-1.5 py-1.5">
        {NAV.map((n) => {
          const active = view.type === n.key || (n.key === "home" && (view.type === "show" || view.type === "look"));
          return (
            <button
              key={n.key}
              onClick={() => setView({ type: n.key })}
              className="tap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{ background: active ? "rgba(255,255,255,0.18)" : "transparent" }}
            >
              <n.icon size={15} />
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button onClick={onRefresh} className="tap p-2 rounded-full glass-dark" title="Atualizar dados">
          <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
        </button>
        <button onClick={onSwitchPerson} className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark text-sm font-medium">
          <User size={14} />
          <span className="hidden sm:inline">{me}</span>
        </button>
      </div>
    </header>
  );
}

function BottomNav({ view, setView }) {
  const NAV = [
    { key: "home", label: "Início", icon: HomeIcon },
    { key: "compare", label: "Comparar", icon: ArrowLeftRight },
    { key: "wishlist", label: "Wishlist", icon: ShoppingBag },
    { key: "moodboard", label: "Mood", icon: LayoutGrid },
  ];
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] glass-dark"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      {NAV.map((n) => {
        const active = view.type === n.key || (n.key === "home" && (view.type === "show" || view.type === "look"));
        return (
          <button
            key={n.key}
            onClick={() => setView({ type: n.key })}
            className="tap flex flex-col items-center gap-0.5 py-2.5 px-3"
            style={{ color: active ? "#F6F1EA" : "rgba(246,241,234,0.5)" }}
          >
            <n.icon size={19} />
            <span className="text-[10px] font-medium">{n.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------------------------------------------------------
   HOME VIEW
--------------------------------------------------------------- */

function HomeView({ data, setView }) {
  return (
    <div className="animate-fadeUp">
      <section className="rounded-3xl overflow-hidden relative mb-8 p-8 sm:p-12" style={{ background: `linear-gradient(135deg, ${ONYX}, ${WINE} 60%, ${CRIMSON})` }}>
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full opacity-20" style={{ background: GOLD, filter: "blur(40px)" }} />
        <p className="eyebrow" style={{ color: GOLD }}>tour capsule wardrobe</p>
        <h1 className="font-display italic text-4xl sm:text-5xl mt-2 mb-3" style={{ color: "#F6F1EA" }}>
          Três noites, três looks perfeitos.
        </h1>
        <p className="text-sm sm:text-base max-w-md" style={{ color: "rgba(246,241,234,0.75)" }}>
          Escolham, comentem e votem juntos em cada peça até fechar o look ideal para cada show.
        </p>
      </section>

      <div className="grid sm:grid-cols-3 gap-5">
        {data.shows.map((s, i) => {
          const looks = data.looks[s.id] || [];
          return (
            <button
              key={s.id}
              onClick={() => setView({ type: "show", showId: s.id })}
              className="tap card-hover rounded-3xl glass p-6 text-left relative overflow-hidden"
              style={{ minHeight: 220 }}
            >
              <span className="absolute top-4 right-5 font-display italic text-6xl opacity-10" style={{ color: WINE }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="eyebrow" style={{ color: CRIMSON }}>{s.subtitle}</p>
              <h3 className="font-display text-3xl mt-1 mb-4" style={{ color: ONYX }}>{s.title}</h3>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: WINE }}>
                <LayoutGrid size={14} />
                {looks.length} {looks.length === 1 ? "look" : "looks"}
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-semibold" style={{ color: GOLD }}>
                Abrir prancheta →
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SHOW VIEW
--------------------------------------------------------------- */

function ShowView({ data, update, showId, me, setView }) {
  const show = data.shows.find((s) => s.id === showId);
  const looks = data.looks[showId] || [];
  const [tab, setTab] = useState("todos");
  const [showChecklist, setShowChecklist] = useState(false);
  const [newItem, setNewItem] = useState("");

  const names = Object.values(data.peopleNames);
  const filtered = tab === "todos" ? looks : looks.filter((l) => l.owner === tab);

  const addLook = () => {
    update((next) => {
      if (!next.looks[showId]) next.looks[showId] = [];
      const n = next.looks[showId].length + 1;
      next.looks[showId].push({
        id: uid(),
        showId,
        owner: me,
        name: `Look ${String(n).padStart(2, "0")}`,
        createdAt: Date.now(),
        pieces: emptyPieces(),
      });
      return next;
    });
  };

  const removeLook = (lookId) => {
    update((next) => {
      next.looks[showId] = (next.looks[showId] || []).filter((l) => l.id !== lookId);
      return next;
    });
  };

  const checklist = data.checklist[showId] || [];
  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    update((next) => {
      if (!next.checklist[showId]) next.checklist[showId] = [];
      next.checklist[showId].push({ id: uid(), text: newItem.trim(), done: false });
      return next;
    });
    setNewItem("");
  };
  const toggleChecklistItem = (id) => {
    update((next) => {
      next.checklist[showId] = next.checklist[showId].map((c) => (c.id === id ? { ...c, done: !c.done } : c));
      return next;
    });
  };
  const removeChecklistItem = (id) => {
    update((next) => {
      next.checklist[showId] = next.checklist[showId].filter((c) => c.id !== id);
      return next;
    });
  };

  return (
    <div className="animate-fadeUp">
      <button onClick={() => setView({ type: "home" })} className="tap flex items-center gap-1 text-sm font-medium mb-4" style={{ color: WINE }}>
        <ChevronLeft size={16} /> Voltar
      </button>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow" style={{ color: CRIMSON }}>{show.subtitle}</p>
          <h1 className="font-display italic text-4xl" style={{ color: ONYX }}>{show.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowChecklist((v) => !v)} className="tap flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold glass">
            <ListChecks size={15} color={WINE} /> Checklist do dia
          </button>
          <button onClick={addLook} className="tap flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold" style={{ background: `linear-gradient(135deg, ${WINE}, ${CRIMSON})`, color: "#F6F1EA" }}>
            <Plus size={15} /> Novo look
          </button>
        </div>
      </div>

      {showChecklist && (
        <div className="glass rounded-3xl p-5 mb-6 animate-popIn">
          <h4 className="font-display text-lg italic mb-3" style={{ color: WINE }}>Checklist para o dia do show</h4>
          <div className="flex gap-2 mb-3">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
              placeholder="Adicionar item (ex: carregar bateria, imprimir ingresso...)"
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm bg-white/70 outline-none border hairline"
            />
            <button onClick={addChecklistItem} className="tap px-4 rounded-xl text-sm font-semibold" style={{ background: WINE, color: "#fff" }}>
              Add
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {checklist.length === 0 && <p className="text-sm opacity-50">Nenhum item ainda.</p>}
            {checklist.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 group">
                <button onClick={() => toggleChecklistItem(c.id)} className="tap w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: c.done ? WINE : "transparent", border: `1.5px solid ${WINE}` }}>
                  {c.done && <Check size={13} color="#fff" />}
                </button>
                <span className={`text-sm flex-1 ${c.done ? "line-through opacity-40" : ""}`}>{c.text}</span>
                <button onClick={() => removeChecklistItem(c.id)} className="tap opacity-0 group-hover:opacity-60"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {["todos", ...names].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="tap px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
            style={{
              background: tab === t ? ONYX : "rgba(23,18,19,0.06)",
              color: tab === t ? "#F6F1EA" : ONYX,
            }}
          >
            {t === "todos" ? "Todos os looks" : t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <Sparkles className="mx-auto mb-3 opacity-40" size={26} />
          <p className="font-display italic text-xl mb-1">Ainda não há looks aqui.</p>
          <p className="text-sm opacity-60">Crie o primeiro look para começar a planejar este show.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((look, i) => (
            <LookCard
              key={look.id}
              look={look}
              index={i}
              votes={data.votes[look.id]}
              onOpen={() => setView({ type: "look", showId, lookId: look.id })}
              onRemove={() => removeLook(look.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LookCard({ look, index, votes, onOpen, onRemove }) {
  const totalVotes = votes ? Object.values(votes).reduce((a, arr) => a + arr.length, 0) : 0;
  return (
    <div className="glass rounded-3xl overflow-hidden card-hover relative animate-fadeUp" style={{ animationDelay: `${index * 60}ms` }}>
      <button onClick={onOpen} className="tap w-full text-left">
        <div className="px-5 pt-5 flex items-start justify-between">
          <div>
            <p className="eyebrow" style={{ color: CRIMSON }}>{look.owner}</p>
            <h4 className="font-display text-2xl italic" style={{ color: ONYX }}>{look.name}</h4>
          </div>
          {totalVotes > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(75,14,32,0.08)", color: WINE }}>
              {totalVotes} votos
            </span>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1.5 p-3 mt-3">
          {PIECE_TYPES.map((p) => (
            <div key={p.key} className="aspect-square rounded-lg overflow-hidden flex items-center justify-center" style={{ background: SAND + "60" }}>
              {look.pieces[p.key]?.img ? (
                <SmartImg src={look.pieces[p.key].img} alt={p.label} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={14} color={WINE} opacity={0.35} />
              )}
            </div>
          ))}
        </div>
      </button>
      <div className="flex items-center justify-between px-5 pb-4 pt-1">
        <div className="flex gap-1">
          {VOTE_TYPES.map((v) => {
            const count = votes?.[v.key]?.length || 0;
            if (!count) return null;
            return (
              <span key={v.key} className="flex items-center gap-0.5 text-xs font-medium" style={{ color: v.color }}>
                <v.icon size={12} fill={v.color} /> {count}
              </span>
            );
          })}
        </div>
        <button onClick={onRemove} className="tap opacity-40 hover:opacity-90"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   LOOK DETAIL VIEW
--------------------------------------------------------------- */

function LookDetailView({ data, update, showId, lookId, me, setView }) {
  const looks = data.looks[showId] || [];
  const look = looks.find((l) => l.id === lookId);
  const votes = data.votes[lookId] || { heart: [], thumb: [], star: [] };
  const comments = data.comments[lookId] || [];
  const [commentText, setCommentText] = useState("");

  if (!look) {
    return (
      <div className="text-center py-20">
        <p className="opacity-60">Este look não existe mais.</p>
        <button onClick={() => setView({ type: "show", showId })} className="mt-3 text-sm font-semibold" style={{ color: WINE }}>Voltar ao show</button>
      </div>
    );
  }

  const renameLook = (name) => {
    update((next) => {
      const l = next.looks[showId].find((x) => x.id === lookId);
      l.name = name;
      return next;
    });
  };

  const updatePiece = (key, field, value) => {
    update((next) => {
      const l = next.looks[showId].find((x) => x.id === lookId);
      l.pieces[key][field] = value;
      return next;
    });
  };

  const toggleVote = (type) => {
    update((next) => {
      if (!next.votes[lookId]) next.votes[lookId] = { heart: [], thumb: [], star: [] };
      const arr = next.votes[lookId][type];
      const idx = arr.indexOf(me);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(me);
      return next;
    });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    update((next) => {
      if (!next.comments[lookId]) next.comments[lookId] = [];
      next.comments[lookId].push({ id: uid(), author: me, text: commentText.trim(), ts: Date.now() });
      return next;
    });
    setCommentText("");
  };

  const addToWishlist = (piece, label) => {
    update((next) => {
      next.wishlist.push({
        id: uid(),
        name: `${label} · ${look.name}`,
        img: piece.img,
        link: piece.link,
        preco: piece.preco,
        obs: piece.obs,
        purchased: false,
        addedBy: me,
      });
      return next;
    });
  };

  return (
    <div className="animate-fadeUp">
      <button onClick={() => setView({ type: "show", showId })} className="tap flex items-center gap-1 text-sm font-medium mb-4" style={{ color: WINE }}>
        <ChevronLeft size={16} /> Voltar ao show
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <p className="eyebrow flex items-center gap-1.5" style={{ color: CRIMSON }}><User size={12} /> {look.owner}</p>
          <input
            defaultValue={look.name}
            onBlur={(e) => renameLook(e.target.value || look.name)}
            className="font-display italic text-4xl bg-transparent outline-none border-b border-transparent focus:border-current w-full"
            style={{ color: ONYX }}
          />
        </div>
        <div className="flex gap-2">
          {VOTE_TYPES.map((v) => {
            const active = votes[v.key]?.includes(me);
            return (
              <button
                key={v.key}
                onClick={() => toggleVote(v.key)}
                className="tap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold glass"
                style={{ color: v.color, background: active ? v.color + "22" : undefined, borderColor: active ? v.color : undefined }}
              >
                <v.icon size={15} fill={active ? v.color : "none"} /> {votes[v.key]?.length || 0}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {PIECE_TYPES.map((p) => (
          <PieceBlock
            key={p.key}
            label={p.label}
            piece={look.pieces[p.key]}
            onChange={(field, value) => updatePiece(p.key, field, value)}
            onWishlist={() => addToWishlist(look.pieces[p.key], p.label)}
          />
        ))}
      </div>

      <section className="glass rounded-3xl p-5 sm:p-6">
        <h4 className="font-display text-xl italic mb-4 flex items-center gap-2" style={{ color: WINE }}>
          <MessageCircle size={18} /> Conversa sobre este look
        </h4>
        <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto pr-1">
          {comments.length === 0 && <p className="text-sm opacity-50">Nenhum comentário ainda. Comecem a conversa!</p>}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: c.author === me ? WINE : GOLD, color: "#fff" }}>
                {c.author?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 rounded-2xl px-4 py-2.5" style={{ background: c.author === me ? "rgba(75,14,32,0.08)" : "rgba(23,18,19,0.05)" }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: WINE }}>{c.author}</p>
                <p className="text-sm">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()}
            placeholder="Escreva um comentário..."
            className="flex-1 rounded-full px-4 py-2.5 text-sm bg-white/70 outline-none border hairline"
          />
          <button onClick={addComment} className="tap w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: WINE }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </section>
    </div>
  );
}

function PieceBlock({ label, piece, onChange, onWishlist }) {
  const [img, setImg] = useState(piece.img);
  const [link, setLink] = useState(piece.link);
  const [preco, setPreco] = useState(piece.preco);
  const [obs, setObs] = useState(piece.obs);

  useEffect(() => { setImg(piece.img); setLink(piece.link); setPreco(piece.preco); setObs(piece.obs); }, [piece.img, piece.link, piece.preco, piece.obs]);

  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="aspect-[4/3] w-full flex items-center justify-center relative" style={{ background: SAND + "50" }}>
        {img ? (
          <SmartImg src={img} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-40">
            <ImageIcon size={22} color={WINE} />
            <span className="text-xs">sem imagem</span>
          </div>
        )}
        <span className="absolute top-3 left-3 eyebrow px-2.5 py-1 rounded-full" style={{ background: "rgba(23,18,19,0.65)", color: "#fff" }}>{label}</span>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        <ImageField value={img} onLocalChange={setImg} onCommit={(v) => onChange("img", v)} />
        <div className="flex gap-2">
          <div className="flex items-center flex-1 rounded-lg bg-white/70 border hairline px-2.5">
            <Link2 size={13} color={WINE} className="flex-shrink-0" />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={() => onChange("link", link)}
              placeholder="Link da loja"
              className="text-xs px-2 py-2 flex-1 outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center rounded-lg bg-white/70 border hairline px-2.5 w-28">
            <DollarSign size={13} color={WINE} className="flex-shrink-0" />
            <input
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              onBlur={() => onChange("preco", preco)}
              placeholder="0,00"
              inputMode="decimal"
              className="text-xs px-1.5 py-2 w-full outline-none bg-transparent"
            />
          </div>
        </div>
        <textarea
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          onBlur={() => onChange("obs", obs)}
          placeholder="Observações (caimento, tamanho, cor...)"
          rows={2}
          className="text-xs rounded-lg px-3 py-2 bg-white/70 outline-none border hairline resize-none"
        />
        <div className="flex items-center justify-between mt-0.5">
          {link ? (
            <a href={link} target="_blank" rel="noreferrer" className="text-xs font-semibold flex items-center gap-1" style={{ color: WINE }}>
              Ver na loja <Link2 size={11} />
            </a>
          ) : <span />}
          <button onClick={onWishlist} className="tap flex items-center gap-1 text-xs font-semibold" style={{ color: CRIMSON }}>
            <ShoppingBag size={12} /> Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   COMPARE VIEW
--------------------------------------------------------------- */

function CompareView({ data, setView }) {
  const allLooks = data.shows.flatMap((s) => (data.looks[s.id] || []).map((l) => ({ ...l, showTitle: s.title })));
  const [aId, setAId] = useState(allLooks[0]?.id || "");
  const [bId, setBId] = useState(allLooks[1]?.id || "");

  const a = allLooks.find((l) => l.id === aId);
  const b = allLooks.find((l) => l.id === bId);

  const total = (look) => {
    if (!look) return 0;
    return PIECE_TYPES.reduce((sum, p) => sum + (parseFloat(look.pieces[p.key]?.preco) || 0), 0);
  };
  const voteCount = (id) => {
    const v = data.votes[id];
    return v ? Object.values(v).reduce((s, arr) => s + arr.length, 0) : 0;
  };

  if (allLooks.length === 0) {
    return (
      <div className="glass rounded-3xl p-10 text-center animate-fadeUp">
        <ArrowLeftRight className="mx-auto mb-3 opacity-40" size={26} />
        <p className="font-display italic text-xl">Criem alguns looks primeiro para poder comparar.</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp">
      <p className="eyebrow mb-1" style={{ color: CRIMSON }}>lado a lado</p>
      <h1 className="font-display italic text-4xl mb-6" style={{ color: ONYX }}>Comparar looks</h1>

      <div className="grid sm:grid-cols-2 gap-5">
        {[{ id: aId, set: setAId, look: a }, { id: bId, set: setBId, look: b }].map((col, i) => (
          <div key={i} className="glass rounded-3xl p-5">
            <select
              value={col.id}
              onChange={(e) => col.set(e.target.value)}
              className="w-full mb-4 rounded-xl px-3 py-2.5 text-sm bg-white/70 border hairline outline-none font-medium"
            >
              {allLooks.map((l) => (
                <option key={l.id} value={l.id}>{l.showTitle} · {l.name} · {l.owner}</option>
              ))}
            </select>
            {col.look ? (
              <>
                <div className="grid grid-cols-5 gap-1.5 mb-4">
                  {PIECE_TYPES.map((p) => (
                    <div key={p.key} className="aspect-square rounded-lg overflow-hidden flex items-center justify-center" style={{ background: SAND + "60" }}>
                      {col.look.pieces[p.key]?.img ? (
                        <SmartImg src={col.look.pieces[p.key].img} alt={p.label} className="w-full h-full object-cover" />
                      ) : <ImageIcon size={13} color={WINE} opacity={0.35} />}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  {PIECE_TYPES.map((p) => (
                    <div key={p.key} className="flex justify-between border-b hairline pb-1.5">
                      <span className="opacity-60">{p.label}</span>
                      <span className="font-medium">{money(col.look.pieces[p.key]?.preco)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 font-semibold" style={{ color: WINE }}>
                    <span>Total</span>
                    <span>{money(total(col.look))}</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-60 pt-1">
                    <span>Votos</span>
                    <span>{voteCount(col.look.id)}</span>
                  </div>
                </div>
              </>
            ) : <p className="text-sm opacity-50">Sem look selecionado.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   WISHLIST VIEW
--------------------------------------------------------------- */

function WishlistView({ data, update, me }) {
  const [form, setForm] = useState({ name: "", img: "", link: "", preco: "", obs: "" });
  const wishlist = data.wishlist || [];

  const addItem = () => {
    if (!form.name.trim()) return;
    update((next) => {
      next.wishlist.push({ id: uid(), ...form, purchased: false, addedBy: me });
      return next;
    });
    setForm({ name: "", img: "", link: "", preco: "", obs: "" });
  };

  const togglePurchased = (id) => {
    update((next) => {
      next.wishlist = next.wishlist.map((w) => (w.id === id ? { ...w, purchased: !w.purchased } : w));
      return next;
    });
  };

  const removeItem = (id) => {
    update((next) => {
      next.wishlist = next.wishlist.filter((w) => w.id !== id);
      return next;
    });
  };

  const totalPending = wishlist.filter((w) => !w.purchased).reduce((s, w) => s + (parseFloat(w.preco) || 0), 0);

  return (
    <div className="animate-fadeUp">
      <p className="eyebrow mb-1" style={{ color: CRIMSON }}>lista de compras</p>
      <h1 className="font-display italic text-4xl mb-6" style={{ color: ONYX }}>Wishlist</h1>

      <div className="glass rounded-3xl p-5 mb-6">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: WINE }}><Plus size={15}/> Adicionar item</h4>
        <div className="grid sm:grid-cols-2 gap-2.5">
          <input placeholder="Nome do item" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg px-3 py-2.5 text-sm bg-white/70 border hairline outline-none" />
          <div className="sm:col-span-2">
            <ImageField value={form.img} onLocalChange={(v) => setForm((f) => ({ ...f, img: v }))} onCommit={(v) => setForm((f) => ({ ...f, img: v }))} />
          </div>
          <input placeholder="Link da loja" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="rounded-lg px-3 py-2.5 text-sm bg-white/70 border hairline outline-none" />
          <input placeholder="Preço" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} className="rounded-lg px-3 py-2.5 text-sm bg-white/70 border hairline outline-none" />
          <input placeholder="Observações" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} className="rounded-lg px-3 py-2.5 text-sm bg-white/70 border hairline outline-none sm:col-span-2" />
        </div>
        <button onClick={addItem} className="tap mt-3 px-4 py-2.5 rounded-full text-sm font-semibold" style={{ background: `linear-gradient(135deg, ${WINE}, ${CRIMSON})`, color: "#fff" }}>Adicionar à wishlist</button>
      </div>

      {wishlist.length > 0 && (
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-sm opacity-60">{wishlist.length} itens</span>
          <span className="text-sm font-semibold" style={{ color: WINE }}>Pendente: {money(totalPending)}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((w) => (
          <div key={w.id} className="glass rounded-2xl overflow-hidden flex" style={{ opacity: w.purchased ? 0.55 : 1 }}>
            <div className="w-24 flex-shrink-0" style={{ background: SAND + "50" }}>
              {w.img ? <SmartImg src={w.img} alt={w.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} color={WINE} opacity={0.35} /></div>}
            </div>
            <div className="p-3.5 flex-1 min-w-0">
              <p className={`text-sm font-semibold mb-0.5 ${w.purchased ? "line-through" : ""}`}>{w.name}</p>
              <p className="text-xs font-medium mb-1" style={{ color: WINE }}>{money(w.preco)}</p>
              {w.obs && <p className="text-xs opacity-60 mb-1.5 line-clamp-2">{w.obs}</p>}
              <div className="flex items-center gap-3">
                <button onClick={() => togglePurchased(w.id)} className="tap flex items-center gap-1 text-xs font-semibold" style={{ color: w.purchased ? GOLD : CRIMSON }}>
                  <Check size={12} /> {w.purchased ? "Comprado" : "Marcar comprado"}
                </button>
                {w.link && <a href={w.link} target="_blank" rel="noreferrer" className="text-xs opacity-60 flex items-center gap-1"><Link2 size={11}/>loja</a>}
                <button onClick={() => removeItem(w.id)} className="tap ml-auto opacity-40 hover:opacity-90"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {wishlist.length === 0 && <p className="text-sm opacity-50 text-center py-8">Nada na wishlist ainda.</p>}
    </div>
  );
}

/* ---------------------------------------------------------------
   MOODBOARD VIEW
--------------------------------------------------------------- */

function MoodboardView({ data, update, me }) {
  const [img, setImg] = useState("");
  const [note, setNote] = useState("");
  const board = data.moodboard || [];

  const addPin = () => {
    if (!img.trim()) return;
    update((next) => {
      next.moodboard.push({ id: uid(), img: img.trim(), note: note.trim(), addedBy: me });
      return next;
    });
    setImg("");
    setNote("");
  };

  const removePin = (id) => {
    update((next) => {
      next.moodboard = next.moodboard.filter((p) => p.id !== id);
      return next;
    });
  };

  return (
    <div className="animate-fadeUp">
      <p className="eyebrow mb-1" style={{ color: CRIMSON }}>referências visuais</p>
      <h1 className="font-display italic text-4xl mb-6" style={{ color: ONYX }}>Moodboard</h1>

      <div className="glass rounded-3xl p-5 mb-6">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: WINE }}><Pin size={15}/> Adicionar inspiração</h4>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-start">
          <div className="flex-1">
            <ImageField value={img} onLocalChange={setImg} onCommit={setImg} />
          </div>
          <input placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} className="flex-1 rounded-lg px-3 py-2.5 text-sm bg-white/70 border hairline outline-none" />
          <button onClick={addPin} className="tap px-4 py-2.5 rounded-full text-sm font-semibold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${WINE}, ${CRIMSON})`, color: "#fff" }}>Fixar</button>
        </div>
      </div>

      {board.length === 0 ? (
        <p className="text-sm opacity-50 text-center py-8">O moodboard está vazio. Adicionem imagens de inspiração!</p>
      ) : (
        <div className="columns-2 sm:columns-3 gap-4 [column-fill:_balance]">
          {board.map((p) => (
            <div key={p.id} className="glass rounded-2xl overflow-hidden mb-4 break-inside-avoid relative group">
              <SmartImg src={p.img} alt={p.note || "inspiração"} className="w-full object-cover" />
              {p.note && (
                <div className="px-3 py-2.5">
                  <p className="text-xs">{p.note}</p>
                  <p className="text-[10px] opacity-40 mt-0.5">{p.addedBy}</p>
                </div>
              )}
              <button onClick={() => removePin(p.id)} className="tap absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100" style={{ background: "rgba(23,18,19,0.65)" }}>
                <X size={13} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
