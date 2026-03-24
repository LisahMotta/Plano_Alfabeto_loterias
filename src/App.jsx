import { useState, useCallback, useMemo, useEffect } from "react";

// Helper to generate number range array
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const LOTTERIES = {
  lotofacil: {
    name: "Lotofácil",
    icon: "🍀",
    range: [1, 25],
    pick: 15,
    groups: {
      A: range(1,5), B: range(6,10), C: range(11,15),
      D: range(16,20), E: range(21,25),
    },
    color: "#7B2D8E",
    colorLight: "#F3E8F9",
    defaultDistribution: { A: 3, B: 3, C: 3, D: 3, E: 3 },
    description: "15 de 25 · 5 grupos",
    apiSlug: "lotofacil",
  },
  megasena: {
    name: "Mega-Sena",
    icon: "💰",
    range: [1, 60],
    pick: 6,
    groups: {
      A: range(1,10), B: range(11,20), C: range(21,30),
      D: range(31,40), E: range(41,50), F: range(51,60),
    },
    color: "#1E7A34",
    colorLight: "#E6F5EA",
    defaultDistribution: { A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 },
    description: "6 de 60 · 6 grupos",
    apiSlug: "mega-sena",
  },
  quina: {
    name: "Quina",
    icon: "🎯",
    range: [1, 80],
    pick: 5,
    groups: {
      A: range(1,10), B: range(11,20), C: range(21,30), D: range(31,40),
      E: range(41,50), F: range(51,60), G: range(61,70), H: range(71,80),
    },
    color: "#1A3A6B",
    colorLight: "#E8EFF8",
    defaultDistribution: { A: 1, B: 0, C: 1, D: 0, E: 1, F: 0, G: 1, H: 1 },
    description: "5 de 80 · 8 grupos",
    apiSlug: "quina",
  },
  lotomania: {
    name: "Lotomania",
    icon: "🎪",
    range: [0, 99],
    pick: 50,
    groups: {
      A: range(0,9), B: range(10,19), C: range(20,29), D: range(30,39),
      E: range(40,49), F: range(50,59), G: range(60,69), H: range(70,79),
      I: range(80,89), J: range(90,99),
    },
    color: "#D4540F",
    colorLight: "#FFF3E8",
    defaultDistribution: { A: 5, B: 5, C: 5, D: 5, E: 5, F: 5, G: 5, H: 5, I: 5, J: 5 },
    description: "50 de 100 · 10 grupos",
    apiSlug: "lotomania",
  },
  timemania: {
    name: "Timemania",
    icon: "⚽",
    range: [1, 80],
    pick: 10,
    groups: {
      A: range(1,10), B: range(11,20), C: range(21,30), D: range(31,40),
      E: range(41,50), F: range(51,60), G: range(61,70), H: range(71,80),
    },
    color: "#2D8E3A",
    colorLight: "#E8F9EC",
    defaultDistribution: { A: 1, B: 1, C: 2, D: 1, E: 1, F: 1, G: 2, H: 1 },
    description: "10 de 80 · 8 grupos",
    apiSlug: "timemania",
  },
  duplasena: {
    name: "Dupla Sena",
    icon: "🎲",
    range: [1, 50],
    pick: 6,
    groups: {
      A: range(1,10), B: range(11,20), C: range(21,30),
      D: range(31,40), E: range(41,50),
    },
    color: "#8E2D5A",
    colorLight: "#F9E8F1",
    defaultDistribution: { A: 1, B: 1, C: 2, D: 1, E: 1 },
    description: "6 de 50 · 5 grupos",
    apiSlug: "dupla-sena",
  },
  diadesorte: {
    name: "Dia de Sorte",
    icon: "☀️",
    range: [1, 31],
    pick: 7,
    groups: {
      A: range(1,8), B: range(9,16), C: range(17,24), D: range(25,31),
    },
    color: "#B8860B",
    colorLight: "#FFF8E8",
    defaultDistribution: { A: 2, B: 2, C: 2, D: 1 },
    description: "7 de 31 · 4 grupos",
    apiSlug: "dia-de-sorte",
  },
  supersete: {
    name: "Super Sete",
    icon: "7️⃣",
    range: [0, 9],
    pick: 7,
    groups: {
      "C1": range(0,9), "C2": range(0,9), "C3": range(0,9), "C4": range(0,9),
      "C5": range(0,9), "C6": range(0,9), "C7": range(0,9),
    },
    color: "#2D6B8E",
    colorLight: "#E8F4F9",
    defaultDistribution: { "C1": 1, "C2": 1, "C3": 1, "C4": 1, "C5": 1, "C6": 1, "C7": 1 },
    description: "7 colunas · 0 a 9 cada",
    apiSlug: "super-sete",
    isColumnBased: true,
  },
  maismilionaria: {
    name: "+Milionária",
    icon: "💎",
    range: [1, 50],
    pick: 6,
    groups: {
      A: range(1,10), B: range(11,20), C: range(21,30),
      D: range(31,40), E: range(41,50),
    },
    color: "#4A1A8E",
    colorLight: "#F0E8F9",
    defaultDistribution: { A: 1, B: 1, C: 2, D: 1, E: 1 },
    description: "6 de 50 + 2 trevos · 5 grupos",
    apiSlug: "mais-milionaria",
    hasTrevos: true,
    trevosRange: [1, 6],
    trevosPick: 2,
  },
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateGame = (lottery, distribution) => {
  // Super Sete: each group is a column, pick independently (numbers CAN repeat across columns)
  if (lottery.isColumnBased) {
    const columns = {};
    Object.keys(lottery.groups).forEach((key) => {
      const count = distribution[key] || 0;
      if (count > 0) {
        const shuffled = shuffle(lottery.groups[key]);
        columns[key] = shuffled.slice(0, count);
      }
    });
    return { columns, isColumnBased: true };
  }

  const game = [];
  const groupKeys = Object.keys(lottery.groups);
  groupKeys.forEach((key) => {
    const count = distribution[key] || 0;
    if (count > 0) {
      const shuffled = shuffle(lottery.groups[key]);
      game.push(...shuffled.slice(0, count));
    }
  });
  const sorted = game.sort((a, b) => a - b);

  // Generate trevos for +Milionária
  if (lottery.hasTrevos) {
    const allTrevos = range(lottery.trevosRange[0], lottery.trevosRange[1]);
    const trevos = shuffle(allTrevos).slice(0, lottery.trevosPick).sort((a, b) => a - b);
    return { numbers: sorted, trevos };
  }
  return sorted;
};

const analyzeGame = (game) => {
  const even = game.filter((n) => n % 2 === 0).length;
  const odd = game.length - even;
  const sum = game.reduce((a, b) => a + b, 0);
  const primes = game.filter((n) => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  }).length;
  return { even, odd, sum, primes };
};

function NumberBall({ number, color, size = "md", highlight = false, ghost = false }) {
  const sizes = {
    sm: { w: 28, h: 28, font: 11 },
    md: { w: 36, h: 36, font: 14 },
    lg: { w: 44, h: 44, font: 17 },
  };
  const s = sizes[size];
  return (
    <div
      style={{
        width: s.w,
        height: s.h,
        borderRadius: "50%",
        background: ghost ? "transparent" : highlight ? color : `${color}18`,
        border: ghost ? `1.5px dashed ${color}50` : highlight ? "none" : `1.5px solid ${color}40`,
        color: highlight ? "#fff" : color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: s.font,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        cursor: ghost ? "default" : "pointer",
        opacity: ghost ? 0.4 : 1,
      }}
    >
      {String(number).padStart(2, "0")}
    </div>
  );
}

function Tab({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        border: "none",
        borderBottom: active ? `3px solid ${color}` : "3px solid transparent",
        background: active ? `${color}12` : "transparent",
        color: active ? color : "#666",
        fontWeight: active ? 700 : 500,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </button>
  );
}

function GroupCard({ letter, numbers, count, onCountChange, color, maxCount }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "14px 16px",
        border: count > 0 ? `2px solid ${color}` : "2px solid #e8e8e8",
        transition: "all 0.3s",
        boxShadow: count > 0 ? `0 4px 20px ${color}20` : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: count > 0 ? color : "#f0f0f0",
            color: count > 0 ? "#fff" : "#999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 16,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {letter}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => onCountChange(Math.max(0, count - 1))}
            style={{
              width: 28, height: 28, borderRadius: 8, border: "1.5px solid #ddd",
              background: "#fafafa", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#666", fontWeight: 700,
            }}
          >
            −
          </button>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            fontSize: 16, minWidth: 24, textAlign: "center", color: count > 0 ? color : "#ccc",
          }}>
            {count}
          </span>
          <button
            onClick={() => onCountChange(Math.min(maxCount, count + 1))}
            style={{
              width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${color}40`,
              background: `${color}10`, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              color, fontWeight: 700,
            }}
          >
            +
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {numbers.map((n) => (
          <NumberBall key={n} number={n} color={color} size="sm" ghost={count === 0} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ game, index, color, lottery, onRemove }) {
  // Handle 3 formats: array, { numbers, trevos }, { columns, isColumnBased }
  const isCol = game && game.isColumnBased;
  const numbers = isCol ? Object.values(game.columns).flat() : (Array.isArray(game) ? game : game.numbers);
  const trevos = (!isCol && !Array.isArray(game)) ? game.trevos : null;
  const analysis = analyzeGame(numbers);
  const groupKeys = Object.keys(lottery.groups);

  const groupDistText = isCol
    ? Object.entries(game.columns).map(([k, v]) => `${k}:${v.join(",")}`).join(" · ")
    : groupKeys
        .map((k) => {
          const count = numbers.filter((n) => lottery.groups[k].includes(n)).length;
          return count > 0 ? `${k}:${count}` : null;
        })
        .filter(Boolean)
        .join(" · ");

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 18,
        border: `1px solid ${color}25`,
        boxShadow: `0 2px 12px ${color}10`,
        position: "relative",
      }}
    >
      {onRemove && (
        <button
          onClick={() => onRemove(index)}
          style={{
            position: "absolute", top: 8, right: 10, background: "none",
            border: "none", cursor: "pointer", color: "#ccc", fontSize: 18, fontWeight: 700,
          }}
        >
          ×
        </button>
      )}
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
        JOGO #{index + 1}
      </div>
      {isCol ? (
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {Object.entries(game.columns).map(([col, vals]) => (
            <div key={col} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>{col}</div>
              {vals.map((n, i) => (
                <NumberBall key={`${col}-${i}`} number={n} color={color} size="md" highlight />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: trevos ? 8 : 12 }}>
          {numbers.map((n, i) => (
            <NumberBall key={`${n}-${i}`} number={n} color={color} size="md" highlight />
          ))}
        </div>
      )}
      {trevos && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#B8860B", fontFamily: "'JetBrains Mono', monospace" }}>
            TREVOS:
          </span>
          {trevos.map((t) => (
            <div key={t} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#B8860B", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            }}>
              {t}
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: "#888", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
        <span style={{ fontWeight: 600 }}>Grupos:</span> {groupDistText}
        <br />
        <span style={{ fontWeight: 600 }}>Par/Ímpar:</span> {analysis.even}/{analysis.odd}
        {" · "}
        <span style={{ fontWeight: 600 }}>Soma:</span> {analysis.sum}
        {" · "}
        <span style={{ fontWeight: 600 }}>Primos:</span> {analysis.primes}
      </div>
    </div>
  );
}

function ResultsPanel({ color }) {
  const [searchLottery, setSearchLottery] = useState("megasena");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const slug = LOTTERIES[searchLottery].apiSlug;
      const res = await fetch(`https://loteriascaixa-api.herokuapp.com/api/${slug}/latest`);
      if (!res.ok) throw new Error("Erro na API");
      const data = await res.json();
      setResults(data);
    } catch {
      setError("Não foi possível carregar os resultados. A API pode estar indisponível.");
      setResults(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "#222", marginBottom: 16 }}>
        Consultar Último Resultado
      </h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(LOTTERIES).map(([key, l]) => (
          <button
            key={key}
            onClick={() => { setSearchLottery(key); setResults(null); setError(null); }}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: searchLottery === key ? `2px solid ${l.color}` : "2px solid #e0e0e0",
              background: searchLottery === key ? `${l.color}12` : "#fff",
              color: searchLottery === key ? l.color : "#666",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {l.icon} {l.name}
          </button>
        ))}
      </div>
      <button
        onClick={fetchResults}
        disabled={loading}
        style={{
          padding: "12px 28px",
          borderRadius: 10,
          border: "none",
          background: LOTTERIES[searchLottery].color,
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          cursor: loading ? "wait" : "pointer",
          fontFamily: "'DM Sans', sans-serif",
          opacity: loading ? 0.7 : 1,
          marginBottom: 20,
        }}
      >
        {loading ? "Buscando..." : "🔍 Buscar Resultado"}
      </button>

      {error && (
        <div style={{
          padding: 16, borderRadius: 12, background: "#FFF5F5", border: "1px solid #FED7D7",
          color: "#C53030", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
        }}>
          {error}
        </div>
      )}

      {results && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: 20,
          border: `1px solid ${LOTTERIES[searchLottery].color}25`,
          boxShadow: `0 4px 20px ${LOTTERIES[searchLottery].color}10`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#999", fontFamily: "'JetBrains Mono', monospace" }}>
                CONCURSO
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: LOTTERIES[searchLottery].color, fontFamily: "'Fraunces', serif" }}>
                #{results.concurso}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#999" }}>DATA</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#444" }}>{results.data}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {(results.dezenas || []).map((d, i) => (
              <NumberBall key={i} number={parseInt(d)} color={LOTTERIES[searchLottery].color} size="lg" highlight />
            ))}
          </div>

          {/* Group analysis of result */}
          <div style={{ fontSize: 13, color: "#666", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>
            <span style={{ fontWeight: 700, color: "#444" }}>Distribuição por Grupo:</span>
            <br />
            {Object.entries(LOTTERIES[searchLottery].groups).map(([letter, nums]) => {
              const hits = (results.dezenas || []).filter((d) => nums.includes(parseInt(d)));
              return hits.length > 0 ? (
                <span key={letter} style={{
                  display: "inline-block", margin: "2px 4px", padding: "3px 10px",
                  borderRadius: 8, background: `${LOTTERIES[searchLottery].color}12`,
                  color: LOTTERIES[searchLottery].color, fontWeight: 600, fontSize: 12,
                }}>
                  {letter}: {hits.join(", ")}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanoAlfabetoApp() {
  const [activeLottery, setActiveLottery] = useState("lotofacil");
  const [activeTab, setActiveTab] = useState("auto");
  const [distributions, setDistributions] = useState(
    Object.fromEntries(
      Object.entries(LOTTERIES).map(([k, v]) => [k, { ...v.defaultDistribution }])
    )
  );
  const [generatedGames, setGeneratedGames] = useState([]);
  const [gameCount, setGameCount] = useState(5);
  const [manualNumbers, setManualNumbers] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstallBanner(false);
      setInstallPrompt(null);
    }
  };

  const lottery = LOTTERIES[activeLottery];
  const distribution = distributions[activeLottery];
  const totalSelected = Object.values(distribution).reduce((a, b) => a + b, 0);
  const isValid = totalSelected === lottery.pick;

  const updateDistribution = useCallback((letter, value) => {
    setDistributions((prev) => ({
      ...prev,
      [activeLottery]: { ...prev[activeLottery], [letter]: value },
    }));
  }, [activeLottery]);

  const resetDistribution = useCallback(() => {
    setDistributions((prev) => ({
      ...prev,
      [activeLottery]: { ...lottery.defaultDistribution },
    }));
  }, [activeLottery, lottery]);

  const handleGenerate = useCallback(() => {
    const games = [];
    for (let i = 0; i < gameCount; i++) {
      games.push(generateGame(lottery, distribution));
    }
    setGeneratedGames(games);
  }, [lottery, distribution, gameCount]);

  const handleRemoveGame = useCallback((index) => {
    setGeneratedGames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleManualNumber = useCallback((num) => {
    setManualNumbers((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num);
      if (prev.length >= lottery.pick) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
  }, [lottery.pick]);

  const manualAnalysis = useMemo(() => {
    if (manualNumbers.length === 0) return null;
    return analyzeGame(manualNumbers);
  }, [manualNumbers]);

  const manualGroupDist = useMemo(() => {
    const dist = {};
    Object.entries(lottery.groups).forEach(([letter, nums]) => {
      dist[letter] = manualNumbers.filter((n) => nums.includes(n)).length;
    });
    return dist;
  }, [manualNumbers, lottery.groups]);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "#FAFAF8",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Offline Banner */}
      {!isOnline && (
        <div style={{
          background: "#E53E3E", color: "#fff", padding: "8px 16px",
          textAlign: "center", fontSize: 13, fontWeight: 600,
        }}>
          📡 Sem conexão — modo offline. Gerar jogos funciona, mas resultados não.
        </div>
      )}

      {/* Install PWA Banner */}
      {showInstallBanner && (
        <div style={{
          background: "linear-gradient(135deg, #1E7A34, #7B2D8E)",
          color: "#fff", padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            📲 Instale o app no seu celular para usar offline!
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleInstall} style={{
              padding: "6px 16px", borderRadius: 8, border: "2px solid #fff",
              background: "#fff", color: "#7B2D8E", fontWeight: 700,
              fontSize: 13, cursor: "pointer",
            }}>
              Instalar
            </button>
            <button onClick={() => setShowInstallBanner(false)} style={{
              padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.4)",
              background: "transparent", color: "#fff", fontWeight: 600,
              fontSize: 13, cursor: "pointer",
            }}>
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${lottery.color} 0%, ${lottery.color}CC 100%)`,
        padding: "28px 20px 20px",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 150, height: 150,
          borderRadius: "50%", background: "#ffffff10",
        }} />
        <div style={{
          position: "absolute", bottom: -20, left: -20, width: 100, height: 100,
          borderRadius: "50%", background: "#ffffff08",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", opacity: 0.7, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            GERADOR DE JOGOS
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em" }}>
            Plano Alfabeto
          </h1>
          <p style={{ fontSize: 13, opacity: 0.8, margin: "4px 0 0", fontWeight: 500 }}>
            Jogos equilibrados por distribuição em grupos
          </p>
        </div>
      </div>

      {/* Lottery Selector */}
      <div style={{
        display: "flex", gap: 8, padding: "16px 16px 0",
        overflowX: "auto", WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none", msOverflowStyle: "none",
      }}>
        {Object.entries(LOTTERIES).map(([key, l]) => (
          <button
            key={key}
            onClick={() => { setActiveLottery(key); setGeneratedGames([]); setManualNumbers([]); }}
            style={{
              flex: "0 0 auto",
              padding: "10px 12px",
              borderRadius: 12,
              border: activeLottery === key ? `2.5px solid ${l.color}` : "2px solid #e8e8e8",
              background: activeLottery === key ? l.colorLight : "#fff",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
              minWidth: 90,
            }}
          >
            <div style={{ fontSize: 20 }}>{l.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: activeLottery === key ? l.color : "#666", marginTop: 2 }}>
              {l.name}
            </div>
            <div style={{ fontSize: 9, color: "#999", marginTop: 2, whiteSpace: "nowrap" }}>{l.description}</div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee", margin: "16px 16px 0", gap: 0 }}>
        <Tab active={activeTab === "auto"} onClick={() => setActiveTab("auto")} color={lottery.color}>
          ⚡ Automático
        </Tab>
        <Tab active={activeTab === "manual"} onClick={() => setActiveTab("manual")} color={lottery.color}>
          ✏️ Manual
        </Tab>
        <Tab active={activeTab === "results"} onClick={() => setActiveTab("results")} color={lottery.color}>
          📊 Resultados
        </Tab>
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* AUTO TAB */}
        {activeTab === "auto" && (
          <div>
            {/* Distribution controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#222", margin: 0 }}>
                Distribuição por Grupo
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: isValid ? `${lottery.color}15` : "#FFF5F5",
                  color: isValid ? lottery.color : "#E53E3E",
                }}>
                  {totalSelected}/{lottery.pick}
                </span>
                <button
                  onClick={resetDistribution}
                  style={{
                    padding: "4px 12px", borderRadius: 8, border: "1px solid #ddd",
                    background: "#fafafa", cursor: "pointer", fontSize: 12,
                    fontWeight: 600, color: "#666", fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Resetar
                </button>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 10,
              marginBottom: 20,
            }}>
              {Object.entries(lottery.groups).map(([letter, numbers]) => (
                <GroupCard
                  key={letter}
                  letter={letter}
                  numbers={numbers}
                  count={distribution[letter]}
                  onCountChange={(v) => updateDistribution(letter, v)}
                  color={lottery.color}
                  maxCount={numbers.length}
                />
              ))}
            </div>

            {!isValid && (
              <div style={{
                padding: 14, borderRadius: 12, background: "#FFFAF0", border: "1px solid #FEEBC8",
                color: "#C05621", fontSize: 13, marginBottom: 16, fontWeight: 500,
              }}>
                ⚠️ A soma dos números por grupo deve ser <strong>{lottery.pick}</strong>. Atualmente: <strong>{totalSelected}</strong>.
                {totalSelected > lottery.pick ? " Reduza alguns grupos." : " Adicione mais números."}
              </div>
            )}

            {/* Generate controls */}
            <div style={{
              display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>Quantidade:</label>
                <select
                  value={gameCount}
                  onChange={(e) => setGameCount(Number(e.target.value))}
                  style={{
                    padding: "8px 12px", borderRadius: 8, border: "1.5px solid #ddd",
                    fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                    background: "#fff", color: "#333",
                  }}
                >
                  {[1, 3, 5, 10, 15, 20].map((n) => (
                    <option key={n} value={n}>{n} jogos</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!isValid}
                style={{
                  padding: "12px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: isValid ? lottery.color : "#ccc",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isValid ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: isValid ? `0 4px 16px ${lottery.color}30` : "none",
                  transition: "all 0.2s",
                }}
              >
                🎲 Gerar Jogos
              </button>
              {generatedGames.length > 0 && (
                <button
                  onClick={() => setGeneratedGames([])}
                  style={{
                    padding: "12px 20px", borderRadius: 12, border: "1.5px solid #ddd",
                    background: "#fff", color: "#666", fontWeight: 600, fontSize: 14,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Generated games */}
            {generatedGames.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#222", marginBottom: 12 }}>
                  {lottery.icon} Jogos Gerados ({generatedGames.length})
                </h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 12,
                }}>
                  {generatedGames.map((game, i) => (
                    <GameCard
                      key={i}
                      game={game}
                      index={i}
                      color={lottery.color}
                      lottery={lottery}
                      onRemove={handleRemoveGame}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MANUAL TAB */}
        {activeTab === "manual" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#222", margin: 0 }}>
                Monte seu Jogo
              </h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: manualNumbers.length === lottery.pick ? `${lottery.color}15` : "#FFF5F5",
                  color: manualNumbers.length === lottery.pick ? lottery.color : "#E53E3E",
                }}>
                  {manualNumbers.length}/{lottery.pick}
                </span>
                {manualNumbers.length > 0 && (
                  <button
                    onClick={() => setManualNumbers([])}
                    style={{
                      padding: "4px 12px", borderRadius: 8, border: "1px solid #ddd",
                      background: "#fafafa", cursor: "pointer", fontSize: 12,
                      fontWeight: 600, color: "#666",
                    }}
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Number grid organized by groups */}
            {Object.entries(lottery.groups).map(([letter, numbers]) => (
              <div key={letter} style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: lottery.color,
                  fontFamily: "'JetBrains Mono', monospace", marginBottom: 6,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 24, height: 24, borderRadius: 6, background: lottery.color,
                    color: "#fff", fontSize: 12,
                  }}>
                    {letter}
                  </span>
                  <span style={{ color: "#999", fontWeight: 500 }}>
                    ({numbers[0]}–{numbers[numbers.length - 1]})
                  </span>
                  {manualGroupDist[letter] > 0 && (
                    <span style={{
                      padding: "1px 8px", borderRadius: 10, background: `${lottery.color}15`,
                      fontSize: 11, fontWeight: 600, color: lottery.color,
                    }}>
                      {manualGroupDist[letter]} selecionado{manualGroupDist[letter] > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {numbers.map((n) => {
                    const selected = manualNumbers.includes(n);
                    return (
                      <div key={n} onClick={() => toggleManualNumber(n)}>
                        <NumberBall number={n} color={lottery.color} size="md" highlight={selected} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Analysis */}
            {manualNumbers.length > 0 && (
              <div style={{
                marginTop: 20, padding: 18, borderRadius: 14, background: "#fff",
                border: `1px solid ${lottery.color}25`, boxShadow: `0 2px 12px ${lottery.color}08`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 12, fontFamily: "'Fraunces', serif" }}>
                  Análise do Jogo
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {manualNumbers.map((n) => (
                    <NumberBall key={n} number={n} color={lottery.color} size="md" highlight />
                  ))}
                </div>

                {/* Group distribution bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6 }}>Distribuição por Grupo:</div>
                  <div style={{ display: "flex", gap: 2, height: 32, borderRadius: 8, overflow: "hidden" }}>
                    {Object.entries(manualGroupDist).map(([letter, count]) => {
                      if (count === 0) return null;
                      const pct = (count / manualNumbers.length) * 100;
                      return (
                        <div
                          key={letter}
                          style={{
                            flex: `${pct} 0 0%`,
                            background: `${lottery.color}${Math.round(40 + (count / lottery.pick) * 60).toString(16).padStart(2, "0")}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: 12, fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {letter}:{count}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {manualAnalysis && (
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
                  }}>
                    {[
                      { label: "Pares", value: manualAnalysis.even },
                      { label: "Ímpares", value: manualAnalysis.odd },
                      { label: "Soma", value: manualAnalysis.sum },
                      { label: "Primos", value: manualAnalysis.primes },
                    ].map((item) => (
                      <div key={item.label} style={{
                        textAlign: "center", padding: 10, borderRadius: 10,
                        background: `${lottery.color}08`,
                      }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: lottery.color, fontFamily: "'JetBrains Mono', monospace" }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginTop: 2 }}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Equilibrium check */}
                {manualNumbers.length === lottery.pick && (
                  <div style={{ marginTop: 14 }}>
                    {(() => {
                      const groupValues = Object.values(manualGroupDist).filter((v) => v > 0);
                      const groupCount = groupValues.length;
                      const totalGroups = Object.keys(lottery.groups).length;
                      const coverage = groupCount / totalGroups;
                      const maxInGroup = Math.max(...groupValues);
                      const isBalanced = coverage >= 0.6 && maxInGroup <= Math.ceil(lottery.pick / totalGroups) + 1;

                      return (
                        <div style={{
                          padding: 12, borderRadius: 10,
                          background: isBalanced ? "#F0FFF4" : "#FFFAF0",
                          border: `1px solid ${isBalanced ? "#C6F6D5" : "#FEEBC8"}`,
                          fontSize: 13, fontWeight: 500,
                          color: isBalanced ? "#276749" : "#C05621",
                        }}>
                          {isBalanced
                            ? "✅ Jogo bem distribuído! Boa cobertura dos grupos."
                            : `⚠️ Jogo concentrado — ${groupCount} de ${totalGroups} grupos usados. Considere espalhar mais.`}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === "results" && <ResultsPanel color={lottery.color} />}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "20px 16px 30px", color: "#bbb", fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        Plano Alfabeto v2.0 · PWA · Funciona offline
        <br />
        Ferramenta de organização · Não garante premiação
        <br />
        Jogue com responsabilidade 🍀
      </div>
    </div>
  );
}
