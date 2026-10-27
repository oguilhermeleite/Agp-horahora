import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { C, CUSTO_POR_PAINEL, META_YIELD, VACUO_MIN } from "./theme";

// ═══════════════════════════════════════════════════════════════════
//  MODELO DO CARRINHO (igual à folha do engenheiro)
//  4 andares × 2 lados (Fundo / Porta) × 5 posições = 40 painéis
// ═══════════════════════════════════════════════════════════════════
export const ANDARES = [4, 3, 2, 1];          // de cima pra baixo
export const LADOS = ["fundo", "porta"];
export const POSICOES = [5, 4, 3, 2, 1];      // como na folha
export const CAPACIDADE = 40;
export const NOME_LADO = { fundo: "Fundo", porta: "Porta" };

export const MOTIVOS = [
  { id: "delaminado", nome: "Delaminado", cor: "#C0392B" },
  { id: "teste_feltro", nome: "Teste feltro", cor: "#6B21A8" },
  { id: "dobras", nome: "Dobras", cor: "#D97706" },
  { id: "mole", nome: "Mole", cor: "#B45309" },
  { id: "outro", nome: "Outro", cor: "#6B7A99" },
];
const nomeMotivo = (id) => MOTIVOS.find(m => m.id === id)?.nome || id || "—";

const STORAGE_KEY = "agp-horahora-autoclave-v2";

const chave = (andar, lado, pos) => `${andar}-${lado}-${pos}`;
const hojeISO = () => new Date().toISOString().slice(0, 10);
const fmtData = (iso) => (iso ? new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("pt-BR") : "—");
const fmtHora = (iso) => (iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");
const novoId = () => Math.random().toString(36).slice(2, 10);

export function ultimoVacuo(p) {
  const leituras = (p?.vacuo || []).filter(v => v !== "" && v !== null && v !== undefined).map(Number);
  return leituras.length ? leituras[leituras.length - 1] : null;
}

// Lista "achatada" dos painéis de um ciclo, com a posição
export function paineisDoCiclo(c) {
  return Object.entries(c.posicoes || {})
    .filter(([, p]) => p && p.codigo)
    .map(([k, p]) => {
      const [andar, lado, pos] = k.split("-");
      return { ...p, key: k, andar: Number(andar), lado, pos: Number(pos), cicloId: c.id, cicloNumero: c.numero };
    });
}

// ─── dados de exemplo (somem quando o usuário apaga) ───────────────
function gerarDemo() {
  const ciclos = [];
  let ordem = 512300;
  const hoje = new Date();
  for (let i = 12; i >= 1; i--) {
    const d = new Date(hoje); d.setDate(hoje.getDate() - i);
    const numero = 20 - i - 1 + 1; // ciclos 8..19
    const posicoes = {};
    const lancado = new Date(d); lancado.setHours(6, 0, 0, 0);
    const destapado = new Date(d); destapado.setHours(10, 30, 0, 0);
    let n = 0;
    for (const andar of [1, 2, 3, 4]) for (const lado of LADOS) for (const pos of [1, 2, 3, 4, 5]) {
      n++;
      const vac = 500 + Math.floor(Math.random() * 170);
      let prob = 0.06;
      if (andar === 2) prob = 0.18;
      if (andar === 4) prob = 0.12;
      if (pos === 1 || pos === 5) prob += 0.05; // bordas
      if (vac < 550) prob += 0.08;
      const rep = Math.random() < prob;
      const r = Math.random();
      const motivo = rep ? (r < 0.55 ? "delaminado" : r < 0.7 ? "teste_feltro" : r < 0.88 ? "dobras" : "mole") : null;
      const liberadoEm = !rep && i > 2 ? new Date(d.getTime() + 86400000).toISOString() : null;
      posicoes[chave(andar, lado, pos)] = {
        codigo: "20" + String(ordem++),
        camadas: i % 3 === 0 && n <= 20 ? 12 : 9,
        vacuo: [vac],
        resultado: rep ? "reprocesso" : "ok",
        motivo, motivoObs: "",
        amostra: !rep && Math.random() < 0.05,
        liberadoEm,
        reprocessoResolvidoEm: rep && i > 4 ? new Date(d.getTime() + 2 * 86400000).toISOString() : null,
      };
    }
    ciclos.push({
      id: novoId(), demo: true, numero, data: d.toISOString().slice(0, 10), turno: "1º", matricula: "3789",
      obs: "", status: "destapado", lancadoEm: lancado.toISOString(), destapadoEm: destapado.toISOString(), destapeMatricula: "3789", posicoes,
    });
  }
  // ciclo de hoje, na autoclave
  const posicoes = {};
  for (const andar of [1, 2, 3, 4]) for (const lado of LADOS) for (const pos of [1, 2, 3, 4, 5]) {
    posicoes[chave(andar, lado, pos)] = { codigo: "20" + String(ordem++), camadas: 9, vacuo: [500 + Math.floor(Math.random() * 160)], resultado: null, motivo: null, motivoObs: "", amostra: false, liberadoEm: null };
  }
  const l = new Date(); l.setHours(6, 0, 0, 0);
  ciclos.push({ id: novoId(), demo: true, numero: 20, data: hojeISO(), turno: "1º", matricula: "3789", obs: "", status: "autoclave", lancadoEm: l.toISOString(), destapadoEm: null, posicoes });
  return ciclos;
}

// ─── persistência no aparelho ───────────────────────────────────────
export function useCiclos() {
  const [ciclos, setCiclos] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) return JSON.parse(salvo);
    } catch { /* sem storage */ }
    return gerarDemo();
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ciclos)); } catch { /* sem storage */ }
  }, [ciclos]);
  return [ciclos, setCiclos];
}

// ─── exportar para Excel (CSV com ; e acentos) ─────────────────────
function exportarCSV(ciclos, nomeArquivo) {
  const cab = ["Ciclo", "Data", "Turno", "Matrícula", "Andar", "Lado", "Posição", "Código", "Camadas", "Vácuo 1ª", "Vácuo 2ª", "Vácuo 3ª", "Lançado em", "Destapado em", "Resultado", "Motivo", "Obs", "Amostra", "Liberado em"];
  const linhas = [cab];
  [...ciclos].sort((a, b) => a.numero - b.numero).forEach(c => {
    paineisDoCiclo(c).sort((a, b) => a.andar - b.andar || a.lado.localeCompare(b.lado) || a.pos - b.pos).forEach(p => {
      linhas.push([
        c.numero, fmtData(c.data), c.turno, c.matricula, p.andar, NOME_LADO[p.lado], p.pos, p.codigo, p.camadas,
        p.vacuo?.[0] ?? "", p.vacuo?.[1] ?? "", p.vacuo?.[2] ?? "",
        fmtHora(c.lancadoEm), fmtHora(c.destapadoEm),
        p.resultado === "ok" ? "OK" : p.resultado === "reprocesso" ? "Reprocesso" : "Aguardando",
        p.resultado === "reprocesso" ? nomeMotivo(p.motivo) : "", p.motivoObs || "",
        p.amostra ? "Sim" : "", p.liberadoEm ? fmtHora(p.liberadoEm) : "",
      ]);
    });
  });
  const csv = "﻿" + linhas.map(l => l.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nomeArquivo; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ═══════════════════════════════════════════════════════════════════
//  componentes pequenos
// ═══════════════════════════════════════════════════════════════════
function Tag({ bg, color, children }) {
  return <span className="tag" style={{ background: bg, color }}>{children}</span>;
}
function CardNum({ label, valor, cor }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "14px 8px", borderTop: `3px solid ${cor}` }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: cor }}>{valor}</div>
      <div style={{ fontSize: 11, color: C.grayDark, marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}
const btn = (bg, color, borda) => ({ padding: "10px 14px", background: bg, color, border: `1.5px solid ${borda || bg}`, borderRadius: 10, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer" });
const lbl = { fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 };

const STATUS = {
  montando: { nome: "Embolsando", bg: C.bluePale, cor: C.blue },
  autoclave: { nome: "Na autoclave", bg: C.warningLight, cor: C.warning },
  destapado: { nome: "Destapado", bg: C.successLight, cor: C.success },
};

function Folha({ titulo, onFechar, children }) {
  return (
    <div onClick={onFechar} style={{ position: "fixed", inset: 0, background: "rgba(13,27,62,0.45)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", width: "100%", maxWidth: 520, borderRadius: "18px 18px 0 0", padding: "18px 16px 24px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{titulo}</div>
          <button onClick={onFechar} aria-label="Fechar" style={{ background: C.gray, border: "none", width: 32, height: 32, borderRadius: 16, cursor: "pointer", fontSize: 16, color: C.grayDark }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Carrinho (grade igual à folha) ─────────────────────────────────
function CarrinhoGrade({ ciclo, modo, onSelecionar }) {
  function estilo(p) {
    if (!p || !p.codigo) return { bg: "white", borda: C.grayMid, txt: C.grayMid };
    if (modo === "destapar" || modo === "ver") {
      if (p.resultado === "ok") return { bg: C.successLight, borda: C.success, txt: C.success };
      if (p.resultado === "reprocesso") return { bg: C.dangerLight, borda: C.danger, txt: C.danger };
      return { bg: C.gray, borda: C.grayDark, txt: C.text };
    }
    const v = ultimoVacuo(p);
    if (v === null) return { bg: C.warningLight, borda: C.warning, txt: C.warning };
    if (v < VACUO_MIN) return { bg: C.dangerLight, borda: C.danger, txt: C.danger };
    return { bg: C.successLight, borda: C.success, txt: C.success };
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {ANDARES.map(andar => (
        <div key={andar} style={{ background: C.gray, borderRadius: 12, padding: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, margin: "2px 4px 6px" }}>Andar {andar}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {LADOS.map(lado => (
              <div key={lado} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.grayDark, textTransform: "uppercase", letterSpacing: 0.5 }}>{NOME_LADO[lado]}</div>
                {POSICOES.map(pos => {
                  const k = chave(andar, lado, pos);
                  const p = ciclo.posicoes?.[k];
                  const e = estilo(p);
                  const v = ultimoVacuo(p);
                  const clicavel = !!onSelecionar && (modo === "embolsar" || (p && p.codigo));
                  return (
                    <button key={pos} data-pos={k} disabled={!clicavel} onClick={() => clicavel && onSelecionar(k)}
                      style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 40, padding: "4px 6px", background: e.bg, border: `1.5px solid ${e.borda}`, borderRadius: 8, cursor: clicavel ? "pointer" : "default", fontFamily: "'DM Sans'", textAlign: "left", width: "100%" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.grayDark, width: 12, flexShrink: 0 }}>{pos}</span>
                      {p && p.codigo ? (
                        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                          <span style={{ fontFamily: "'DM Mono'", fontSize: 11.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.codigo}</span>
                          <span style={{ fontSize: 10.5, color: e.txt, fontWeight: 600 }}>
                            {modo === "embolsar" ? (v === null ? "sem vácuo" : `${v}${p.vacuo.filter(x => x !== "" && x != null).length > 1 ? " (reteste)" : ""}`)
                              : p.resultado === "ok" ? (p.amostra ? "OK · amostra" : "OK")
                              : p.resultado === "reprocesso" ? nomeMotivo(p.motivo)
                              : `vácuo ${v ?? "—"}`}
                            {p.camadas === 12 ? " · 12C" : ""}
                          </span>
                        </span>
                      ) : (
                        <span style={{ flex: 1, fontSize: 11, color: C.grayMid }}>{modo === "embolsar" ? "+ adicionar" : "vazio"}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  EMBOLSAMENTO
// ═══════════════════════════════════════════════════════════════════
function Embolsamento({ ciclos, setCiclos, cicloId, setCicloId, irPara }) {
  const ciclo = ciclos.find(c => c.id === cicloId && c.status === "montando");
  const montando = ciclos.filter(c => c.status === "montando");
  const proxNumero = Math.max(0, ...ciclos.map(c => Number(c.numero) || 0)) + 1;
  const [form, setForm] = useState({ numero: "", data: hojeISO(), turno: "1º", matricula: "" });
  const [erroForm, setErroForm] = useState("");
  const [editando, setEditando] = useState(null);
  const [rasc, setRasc] = useState(null);
  const [erroPos, setErroPos] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [aviso, setAviso] = useState("");

  function criar() {
    const numero = Number(form.numero || proxNumero);
    if (!form.matricula) return setErroForm("Informe a matrícula");
    if (ciclos.some(c => !c.demo && Number(c.numero) === numero)) return setErroForm(`Já existe o ciclo ${numero}`);
    const novo = { id: novoId(), numero, data: form.data, turno: form.turno, matricula: form.matricula, obs: "", status: "montando", lancadoEm: null, destapadoEm: null, posicoes: {} };
    setCiclos(prev => [...prev, novo]);
    setCicloId(novo.id);
    setErroForm("");
  }

  function abrir(k) {
    const p = ciclo.posicoes[k];
    setRasc({ codigo: p?.codigo || "", camadas: p?.camadas || 9, vacuo: [...(p?.vacuo || []), "", "", ""].slice(0, 3).map(v => v ?? "") });
    setErroPos("");
    setEditando(k);
  }

  function salvarPos() {
    const cod = rasc.codigo.trim();
    if (!/^\d{6,8}$/.test(cod)) return setErroPos("O código deve ter de 6 a 8 números");
    const dup = Object.entries(ciclo.posicoes).find(([k, p]) => k !== editando && p?.codigo === cod);
    if (dup) {
      const [a, l, ps] = dup[0].split("-");
      return setErroPos(`Esse código já está no Andar ${a} · ${NOME_LADO[l]} · posição ${ps}`);
    }
    const leituras = rasc.vacuo.map(v => (v === "" ? "" : Number(v)));
    // corta leituras depois da primeira que passou
    const corte = leituras.findIndex(v => v !== "" && v >= VACUO_MIN);
    const vacuo = (corte >= 0 ? leituras.slice(0, corte + 1) : leituras).filter((v, i, arr) => v !== "" || arr.slice(i).some(x => x !== ""));
    if (vacuo.some(v => v !== "" && (isNaN(v) || v < 0 || v > 760))) return setErroPos("Leitura de vácuo inválida");
    const anterior = ciclo.posicoes[editando] || {};
    setCiclos(prev => prev.map(c => c.id !== ciclo.id ? c : {
      ...c, posicoes: { ...c.posicoes, [editando]: { ...anterior, codigo: cod, camadas: rasc.camadas, vacuo, resultado: null, motivo: null, motivoObs: "", amostra: false, liberadoEm: null, registradoEm: new Date().toISOString() } },
    }));
    setEditando(null);
  }

  function limparPos() {
    setCiclos(prev => prev.map(c => {
      if (c.id !== ciclo.id) return c;
      const posicoes = { ...c.posicoes }; delete posicoes[editando];
      return { ...c, posicoes };
    }));
    setEditando(null);
  }

  function lancar() {
    const ps = paineisDoCiclo(ciclo);
    if (ps.length === 0) return setAviso("O carrinho está vazio.");
    const semVac = ps.filter(p => ultimoVacuo(p) === null);
    const baixo = ps.filter(p => ultimoVacuo(p) !== null && ultimoVacuo(p) < VACUO_MIN);
    if (semVac.length) return setAviso(`${semVac.length} painel(is) sem leitura de vácuo. Complete antes de lançar.`);
    if (baixo.length) return setAviso(`${baixo.length} painel(is) com vácuo abaixo de ${VACUO_MIN}. Refaça o vácuo ou retire do carrinho.`);
    if (!confirmar) { setAviso(""); return setConfirmar(true); }
    setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, status: "autoclave", lancadoEm: new Date().toISOString() } : c));
    setConfirmar(false);
    setCicloId(null);
    irPara("visao");
  }

  // ── sem ciclo aberto: criar ou continuar ──
  if (!ciclo) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600, margin: "0 auto", width: "100%" }}>
        {montando.length > 0 && (
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Continuar embolsamento</div>
            <div style={{ fontSize: 12, color: C.grayDark, marginBottom: 12 }}>Carrinhos que outro turno começou a montar</div>
            {montando.map(c => (
              <button key={c.id} onClick={() => setCicloId(c.id)} style={{ ...btn(C.bluePale, C.blue), width: "100%", display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Ciclo {c.numero} · {fmtData(c.data)}</span>
                <span>{paineisDoCiclo(c).length}/{CAPACIDADE} →</span>
              </button>
            ))}
          </div>
        )}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Novo carrinho</div>
            <div style={{ fontSize: 13, color: C.grayDark }}>Substitui a folha "Controle de vácuo"</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Nº do ciclo</label>
              <input className="field" inputMode="numeric" placeholder={String(proxNumero)} value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value.replace(/\D/g, "") }))} style={{ fontFamily: "'DM Mono'", fontWeight: 600 }} />
            </div>
            <div>
              <label style={lbl}>Data</label>
              <input className="field" type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Turno</label>
              <select className="field" value={form.turno} onChange={e => setForm(f => ({ ...f, turno: e.target.value }))}>
                {["1º", "2º", "3º"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Matrícula</label>
              <input className="field" inputMode="numeric" placeholder="Ex: 3789" value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value.replace(/\D/g, "") }))} style={{ fontFamily: "'DM Mono'", fontWeight: 600 }} />
            </div>
          </div>
          {erroForm && <div className="errmsg">{erroForm}</div>}
          <button className="btn" onClick={criar}>Começar carrinho</button>
        </div>
      </div>
    );
  }

  const ps = paineisDoCiclo(ciclo);
  const baixo = ps.filter(p => ultimoVacuo(p) !== null && ultimoVacuo(p) < VACUO_MIN).length;
  const semVac = ps.filter(p => ultimoVacuo(p) === null).length;
  const c12 = ps.filter(p => p.camadas === 12).length;
  const [ea, el, ep] = editando ? editando.split("-") : [];
  const v1 = rasc?.vacuo[0], v2 = rasc?.vacuo[1];
  const mostra2 = rasc && v1 !== "" && Number(v1) < VACUO_MIN;
  const mostra3 = mostra2 && v2 !== "" && Number(v2) < VACUO_MIN;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600, margin: "0 auto", width: "100%" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: C.grayDark }}>Embolsando</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.blue }}>Ciclo {ciclo.numero}</div>
            <div style={{ fontSize: 12, color: C.grayDark }}>{fmtData(ciclo.data)} · {ciclo.turno} turno · #{ciclo.matricula}</div>
          </div>
          <button onClick={() => setCicloId(null)} style={btn("white", C.grayDark, C.grayMid)}>Trocar</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 14 }}>
          <div style={{ background: C.bluePale, borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.blue }}>{ps.length}/{CAPACIDADE}</div>
            <div style={{ fontSize: 11, color: C.blue }}>painéis</div>
          </div>
          <div style={{ background: baixo + semVac ? C.dangerLight : C.successLight, borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: baixo + semVac ? C.danger : C.success }}>{baixo + semVac}</div>
            <div style={{ fontSize: 11, color: baixo + semVac ? C.danger : C.success }}>pendências vácuo</div>
          </div>
          <div style={{ background: C.purpleLight, borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.purple }}>{c12}</div>
            <div style={{ fontSize: 11, color: C.purple }}>de 12 camadas</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ fontSize: 12, color: C.grayDark, margin: "0 4px 10px" }}>Toque numa posição para registrar o código e o vácuo. Mínimo: <strong>{VACUO_MIN}</strong>.</div>
        <CarrinhoGrade ciclo={ciclo} modo="embolsar" onSelecionar={abrir} />
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ ...lbl, marginBottom: 0 }}>Observação do ciclo</label>
        <textarea className="field" rows={2} value={ciclo.obs} placeholder="Ex: mangueira trocada na posição 3"
          onChange={e => { const obs = e.target.value; setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, obs } : c)); }} />
        {aviso && <div style={{ background: C.dangerLight, color: C.danger, padding: "10px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>{aviso}</div>}
        {confirmar ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmar(false)} style={{ ...btn("white", C.grayDark, C.grayMid), flex: 1 }}>Voltar</button>
            <button onClick={lancar} style={{ ...btn(C.warning, "white"), flex: 2 }}>Confirmar: lançar {ps.length} painéis</button>
          </div>
        ) : (
          <button className="btn" onClick={lancar} style={{ background: C.warning }}>🔥 Lançar na autoclave</button>
        )}
        <div style={{ fontSize: 11, color: C.grayDark, textAlign: "center" }}>Tudo é salvo automaticamente. Outro turno pode continuar este carrinho.</div>
      </div>

      {editando && rasc && (
        <Folha titulo={`Andar ${ea} · ${NOME_LADO[el]} · posição ${ep}`} onFechar={() => setEditando(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={lbl}>Código do painel</label>
              <input className="field" autoFocus inputMode="numeric" maxLength={8} placeholder="20512485" value={rasc.codigo}
                onChange={e => setRasc(r => ({ ...r, codigo: e.target.value.replace(/\D/g, "") }))}
                style={{ fontFamily: "'DM Mono'", fontWeight: 600, fontSize: 18, letterSpacing: 2 }} />
            </div>
            {[0, 1, 2].filter(i => i === 0 || (i === 1 && mostra2) || (i === 2 && mostra3)).map(i => {
              const v = rasc.vacuo[i];
              const ok = v !== "" && Number(v) >= VACUO_MIN;
              const ruim = v !== "" && Number(v) < VACUO_MIN;
              return (
                <div key={i}>
                  <label style={lbl}>Vácuo — {i + 1}ª leitura {i > 0 && <span style={{ color: C.danger }}>(reteste)</span>}</label>
                  <input className="field" inputMode="numeric" placeholder={`mínimo ${VACUO_MIN}`} value={v}
                    onChange={e => { const val = e.target.value.replace(/\D/g, "").slice(0, 3); setRasc(r => { const vac = [...r.vacuo]; vac[i] = val; for (let j = i + 1; j < 3; j++) if (val === "" || Number(val) >= VACUO_MIN) vac[j] = ""; return { ...r, vacuo: vac }; }); }}
                    style={{ fontFamily: "'DM Mono'", fontWeight: 600, fontSize: 18, borderColor: ok ? C.success : ruim ? C.danger : undefined }} />
                  {ruim && <div className="errmsg">Abaixo de {VACUO_MIN}. {i < 2 ? "Refaça o vácuo e registre a próxima leitura." : "Retire o painel do carrinho."}</div>}
                </div>
              );
            })}
            <button onClick={() => setRasc(r => ({ ...r, camadas: r.camadas === 12 ? 9 : 12 }))}
              style={{ ...btn(rasc.camadas === 12 ? C.purpleLight : "white", rasc.camadas === 12 ? C.purple : C.grayDark, rasc.camadas === 12 ? C.purple : C.grayMid), textAlign: "left" }}>
              {rasc.camadas === 12 ? "✓ Painel de 12 camadas" : "○ Painel de 12 camadas (padrão: 9)"}
            </button>
            {erroPos && <div className="errmsg" style={{ fontSize: 13 }}>{erroPos}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              {ciclo.posicoes[editando]?.codigo && <button onClick={limparPos} style={{ ...btn("white", C.danger, C.danger), flex: 1 }}>Retirar</button>}
              <button onClick={salvarPos} style={{ ...btn(C.blue, "white"), flex: 2 }}>Salvar posição</button>
            </div>
          </div>
        </Folha>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  DESTAPE
// ═══════════════════════════════════════════════════════════════════
function Destape({ ciclos, setCiclos, cicloId, setCicloId, irPara }) {
  const naAutoclave = ciclos.filter(c => c.status === "autoclave").sort((a, b) => a.numero - b.numero);
  const ciclo = ciclos.find(c => c.id === cicloId && c.status === "autoclave");
  const [editando, setEditando] = useState(null);
  const [mat, setMat] = useState("");
  const [aviso, setAviso] = useState("");

  function atualizar(k, campos) {
    setCiclos(prev => prev.map(c => c.id !== ciclo.id ? c : { ...c, posicoes: { ...c.posicoes, [k]: { ...c.posicoes[k], ...campos } } }));
  }
  function restantesOk() {
    setCiclos(prev => prev.map(c => {
      if (c.id !== ciclo.id) return c;
      const posicoes = { ...c.posicoes };
      Object.keys(posicoes).forEach(k => { if (posicoes[k]?.codigo && !posicoes[k].resultado) posicoes[k] = { ...posicoes[k], resultado: "ok", motivo: null }; });
      return { ...c, posicoes };
    }));
  }
  function finalizar() {
    const ps = paineisDoCiclo(ciclo);
    const faltam = ps.filter(p => !p.resultado).length;
    if (faltam) return setAviso(`Faltam ${faltam} painel(is) sem resultado.`);
    if (ps.some(p => p.resultado === "reprocesso" && !p.motivo)) return setAviso("Informe o motivo de todos os reprocessos.");
    if (!mat) return setAviso("Informe a matrícula de quem destapou.");
    setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, status: "destapado", destapadoEm: new Date().toISOString(), destapeMatricula: mat } : c));
    setCicloId(null);
    irPara("liberacao");
  }

  if (!ciclo) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Ciclos na autoclave</div>
        {naAutoclave.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24, color: C.grayDark, fontSize: 14 }}>Nenhum carrinho na autoclave agora.</div>
        ) : naAutoclave.map(c => (
          <button key={c.id} onClick={() => setCicloId(c.id)} style={{ ...btn(C.warningLight, C.warning), width: "100%", display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Ciclo {c.numero} · lançado {fmtHora(c.lancadoEm)}</span>
            <span>{paineisDoCiclo(c).length} painéis →</span>
          </button>
        ))}
      </div>
    );
  }

  const ps = paineisDoCiclo(ciclo);
  const ok = ps.filter(p => p.resultado === "ok").length;
  const rep = ps.filter(p => p.resultado === "reprocesso").length;
  const falta = ps.length - ok - rep;
  const p = editando ? ciclo.posicoes[editando] : null;
  const [ea, el, ep] = editando ? editando.split("-") : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600, margin: "0 auto", width: "100%" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: C.grayDark }}>Destapando</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.blue }}>Ciclo {ciclo.numero}</div>
            <div style={{ fontSize: 12, color: C.grayDark }}>Lançado {fmtHora(ciclo.lancadoEm)}</div>
          </div>
          <button onClick={() => setCicloId(null)} style={btn("white", C.grayDark, C.grayMid)}>Trocar</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 14 }}>
          <div style={{ background: C.successLight, borderRadius: 10, padding: 10, textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.success }}>{ok}</div><div style={{ fontSize: 11, color: C.success }}>OK</div></div>
          <div style={{ background: C.dangerLight, borderRadius: 10, padding: 10, textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.danger }}>{rep}</div><div style={{ fontSize: 11, color: C.danger }}>reprocesso</div></div>
          <div style={{ background: C.gray, borderRadius: 10, padding: 10, textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.grayDark }}>{falta}</div><div style={{ fontSize: 11, color: C.grayDark }}>faltam</div></div>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ fontSize: 12, color: C.grayDark, margin: "0 4px 10px" }}>Toque em cada painel e marque o resultado.</div>
        <CarrinhoGrade ciclo={ciclo} modo="destapar" onSelecionar={setEditando} />
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {falta > 0 && <button onClick={restantesOk} style={btn("white", C.success, C.success)}>Marcar os {falta} restantes como OK</button>}
        <div>
          <label style={lbl}>Matrícula de quem destapou</label>
          <input className="field" inputMode="numeric" value={mat} onChange={e => setMat(e.target.value.replace(/\D/g, ""))} placeholder="Ex: 3789" style={{ fontFamily: "'DM Mono'", fontWeight: 600 }} />
        </div>
        {aviso && <div style={{ background: C.dangerLight, color: C.danger, padding: "10px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>{aviso}</div>}
        <button className="btn" onClick={finalizar} style={{ background: C.success }}>✓ Finalizar destape</button>
      </div>

      {editando && p && (
        <Folha titulo={`Andar ${ea} · ${NOME_LADO[el]} · posição ${ep}`} onFechar={() => setEditando(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: C.gray, borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontFamily: "'DM Mono'", fontWeight: 700, fontSize: 17, color: C.blue }}>{p.codigo}</span>
              <span style={{ fontSize: 12, color: C.grayDark }}>vácuo {ultimoVacuo(p)} · {p.camadas} camadas</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => { atualizar(editando, { resultado: "ok", motivo: null, motivoObs: "" }); setEditando(null); }}
                style={btn(p.resultado === "ok" ? C.success : "white", p.resultado === "ok" ? "white" : C.success, C.success)}>✓ OK</button>
              <button onClick={() => atualizar(editando, { resultado: "reprocesso", amostra: false })}
                style={btn(p.resultado === "reprocesso" ? C.danger : "white", p.resultado === "reprocesso" ? "white" : C.danger, C.danger)}>↺ Reprocesso</button>
            </div>
            {p.resultado === "reprocesso" && (
              <>
                <label style={{ ...lbl, marginBottom: 0 }}>Motivo</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {MOTIVOS.map(m => (
                    <button key={m.id} onClick={() => atualizar(editando, { motivo: m.id })}
                      style={{ ...btn(p.motivo === m.id ? m.cor : "white", p.motivo === m.id ? "white" : m.cor, m.cor), padding: "8px 12px", fontSize: 13 }}>{m.nome}</button>
                  ))}
                </div>
                <input className="field" placeholder="Detalhe (opcional)" value={p.motivoObs || ""} onChange={e => atualizar(editando, { motivoObs: e.target.value })} />
              </>
            )}
            {p.resultado !== "reprocesso" && (
              <button onClick={() => atualizar(editando, { amostra: !p.amostra, resultado: "ok" })}
                style={{ ...btn(p.amostra ? C.purpleLight : "white", p.amostra ? C.purple : C.grayDark, p.amostra ? C.purple : C.grayMid), textAlign: "left" }}>
                {p.amostra ? "✓ Retirado como amostra" : "○ Retirar como amostra"}
              </button>
            )}
            <button onClick={() => setEditando(null)} style={btn(C.blue, "white")}>Pronto</button>
          </div>
        </Folha>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  LIBERAÇÃO (as 3 colunas da folha de saída)
// ═══════════════════════════════════════════════════════════════════
function Liberacao({ ciclos, setCiclos }) {
  const destapados = ciclos.filter(c => c.status === "destapado");
  const todos = destapados.flatMap(c => paineisDoCiclo(c).map(p => ({ ...p, destapadoEm: c.destapadoEm })));
  const aguardando = todos.filter(p => p.resultado === "ok" && !p.liberadoEm);
  const reprocesso = todos.filter(p => p.resultado === "reprocesso" && !p.reprocessoResolvidoEm);
  const saidas = todos.filter(p => p.liberadoEm).sort((a, b) => b.liberadoEm.localeCompare(a.liberadoEm));
  const [sel, setSel] = useState({});
  const [verTodas, setVerTodas] = useState(false);
  const idDe = (p) => `${p.cicloId}|${p.key}`;
  const qtdSel = aguardando.filter(p => sel[idDe(p)]).length;

  function mexer(lista, campos) {
    const alvo = new Set(lista.map(idDe));
    setCiclos(prev => prev.map(c => {
      if (![...alvo].some(a => a.startsWith(c.id + "|"))) return c;
      const posicoes = { ...c.posicoes };
      Object.keys(posicoes).forEach(k => { if (alvo.has(`${c.id}|${k}`)) posicoes[k] = { ...posicoes[k], ...campos }; });
      return { ...c, posicoes };
    }));
  }
  function liberar() {
    const lista = aguardando.filter(p => sel[idDe(p)]);
    if (!lista.length) return;
    mexer(lista, { liberadoEm: new Date().toISOString() });
    setSel({});
  }

  const linha = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 4px", borderBottom: `1px solid ${C.gray}` };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 700, margin: "0 auto", width: "100%" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Ordens OK — aguardando liberação</div>
            <div style={{ fontSize: 12, color: C.grayDark }}>{aguardando.length} painel(is)</div>
          </div>
          {aguardando.length > 0 && (
            <button onClick={() => setSel(qtdSel === aguardando.length ? {} : Object.fromEntries(aguardando.map(p => [idDe(p), true])))} style={{ ...btn("white", C.blue, C.grayMid), padding: "6px 10px", fontSize: 12 }}>
              {qtdSel === aguardando.length ? "Desmarcar" : "Selecionar todas"}
            </button>
          )}
        </div>
        {aguardando.map(p => (
          <label key={idDe(p)} style={{ ...linha, cursor: "pointer" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={!!sel[idDe(p)]} onChange={e => setSel(s => ({ ...s, [idDe(p)]: e.target.checked }))} style={{ width: 20, height: 20 }} />
              <span>
                <span style={{ fontFamily: "'DM Mono'", fontWeight: 600, color: C.blue }}>{p.codigo}</span>
                <span style={{ display: "block", fontSize: 11, color: C.grayDark }}>Ciclo {p.cicloNumero} · A{p.andar} {NOME_LADO[p.lado]} {p.pos}</span>
              </span>
            </span>
            {p.amostra && <Tag bg={C.purpleLight} color={C.purple}>Amostra</Tag>}
          </label>
        ))}
        {aguardando.length > 0 && (
          <button className="btn" onClick={liberar} disabled={!qtdSel} style={{ marginTop: 12, opacity: qtdSel ? 1 : 0.5 }}>Liberar {qtdSel || ""} para produção</button>
        )}
        {aguardando.length === 0 && <div style={{ textAlign: "center", padding: 16, color: C.grayDark, fontSize: 13 }}>Nada aguardando liberação.</div>}
      </div>

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700 }}>Ordens em reprocesso</div>
        <div style={{ fontSize: 12, color: C.grayDark, marginBottom: 8 }}>{reprocesso.length} pendente(s)</div>
        {reprocesso.map(p => (
          <div key={idDe(p)} style={linha}>
            <span>
              <span style={{ fontFamily: "'DM Mono'", fontWeight: 600, color: C.blue }}>{p.codigo}</span>
              <span style={{ display: "block", fontSize: 11, color: C.grayDark }}>Ciclo {p.cicloNumero} · {fmtData(p.destapadoEm)}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Tag bg={C.dangerLight} color={C.danger}>{nomeMotivo(p.motivo)}</Tag>
              <button onClick={() => mexer([p], { reprocessoResolvidoEm: new Date().toISOString() })} style={{ ...btn("white", C.success, C.success), padding: "6px 10px", fontSize: 12 }}>Resolvido</button>
            </span>
          </div>
        ))}
        {reprocesso.length === 0 && <div style={{ textAlign: "center", padding: 16, color: C.grayDark, fontSize: 13 }}>Nenhum reprocesso pendente.</div>}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Saída para produção</div>
            <div style={{ fontSize: 12, color: C.grayDark }}>{saidas.length} liberado(s)</div>
          </div>
          <button onClick={() => exportarCSV(destapados, `autoclave-${hojeISO()}.csv`)} style={{ ...btn(C.success, "white"), padding: "8px 12px", fontSize: 13 }}>⬇ Exportar Excel</button>
        </div>
        {(verTodas ? saidas : saidas.slice(0, 15)).map(p => (
          <div key={idDe(p)} style={linha}>
            <span style={{ fontFamily: "'DM Mono'", fontWeight: 600, color: C.text }}>{p.codigo}</span>
            <span style={{ fontSize: 12, color: C.grayDark }}>Ciclo {p.cicloNumero} · {fmtHora(p.liberadoEm)}</span>
          </div>
        ))}
        {saidas.length > 15 && <button onClick={() => setVerTodas(v => !v)} style={{ ...btn("white", C.blue, C.grayMid), width: "100%", marginTop: 10, fontSize: 13 }}>{verTodas ? "Mostrar menos" : `Ver todas (${saidas.length})`}</button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  VISÃO GERAL
// ═══════════════════════════════════════════════════════════════════
function Visao({ ciclos, setCiclos, abrir }) {
  const temDemo = ciclos.some(c => c.demo);
  const [confirmaApagar, setConfirmaApagar] = useState(false);
  const ordenados = [...ciclos].sort((a, b) => (b.numero - a.numero) || (b.data || "").localeCompare(a.data || ""));
  const todos = ciclos.flatMap(paineisDoCiclo);
  const aguardando = todos.filter(p => p.resultado === "ok" && !p.liberadoEm).length;
  const repPend = todos.filter(p => p.resultado === "reprocesso" && !p.reprocessoResolvidoEm).length;
  const naAuto = ciclos.filter(c => c.status === "autoclave").reduce((s, c) => s + paineisDoCiclo(c).length, 0);
  const embolsando = ciclos.filter(c => c.status === "montando").reduce((s, c) => s + paineisDoCiclo(c).length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {temDemo && (
        <div className="card" style={{ background: C.warningLight, border: `1.5px solid ${C.warning}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.warning, marginBottom: 4 }}>Você está vendo dados de exemplo</div>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 10 }}>Os ciclos marcados "exemplo" servem só pra demonstração. Apague antes de usar com a produção real.</div>
          {confirmaApagar ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmaApagar(false)} style={{ ...btn("white", C.grayDark, C.grayMid), flex: 1 }}>Cancelar</button>
              <button onClick={() => { setCiclos(prev => prev.filter(c => !c.demo)); setConfirmaApagar(false); }} style={{ ...btn(C.danger, "white"), flex: 2 }}>Apagar exemplos</button>
            </div>
          ) : (
            <button onClick={() => setConfirmaApagar(true)} style={btn("white", C.warning, C.warning)}>Começar com dados reais</button>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        <CardNum label="Embolsando agora" valor={embolsando} cor={C.blue} />
        <CardNum label="Na autoclave" valor={naAuto} cor={C.warning} />
        <CardNum label="Aguardando liberação" valor={aguardando} cor={C.success} />
        <CardNum label="Reprocesso pendente" valor={repPend} cor={C.danger} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => abrir("embolsar")} style={btn(C.blue, "white")}>🧩 Embolsar</button>
        <button onClick={() => abrir("destapar")} style={btn(C.warning, "white")}>🔥 Destapar</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.gray}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Ciclos</span>
          <button onClick={() => exportarCSV(ciclos.filter(c => !c.demo).length ? ciclos.filter(c => !c.demo) : ciclos, `autoclave-ciclos-${hojeISO()}.csv`)} style={{ ...btn("white", C.success, C.success), padding: "6px 10px", fontSize: 12 }}>⬇ Excel</button>
        </div>
        {ordenados.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.grayDark, fontSize: 14 }}>Nenhum ciclo ainda. Toque em "Embolsar" para começar.</div>}
        {ordenados.map((c, i) => {
          const ps = paineisDoCiclo(c);
          const ok = ps.filter(p => p.resultado === "ok").length;
          const rp = ps.filter(p => p.resultado === "reprocesso").length;
          const st = STATUS[c.status];
          return (
            <div key={c.id} style={{ padding: "12px 16px", borderBottom: i < ordenados.length - 1 ? `1px solid ${C.gray}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontFamily: "'DM Mono'", fontWeight: 700, color: C.blue, fontSize: 14 }}>Ciclo {c.numero}</span>
                  <Tag bg={st.bg} color={st.cor}>{st.nome}</Tag>
                  {c.demo && <Tag bg={C.gray} color={C.grayDark}>exemplo</Tag>}
                </div>
                <div style={{ fontSize: 12, color: C.grayDark }}>{fmtData(c.data)} · {ps.length} painéis{c.status === "destapado" ? ` · ✓ ${ok} · ↺ ${rp}` : ""}</div>
              </div>
              {c.status === "montando" && <button onClick={() => abrir("embolsar", c.id)} style={{ ...btn(C.blue, "white"), padding: "6px 12px", fontSize: 12 }}>Continuar</button>}
              {c.status === "autoclave" && <button onClick={() => abrir("destapar", c.id)} style={{ ...btn(C.warning, "white"), padding: "6px 12px", fontSize: 12 }}>Destapar</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MÓDULO (abas internas)
// ═══════════════════════════════════════════════════════════════════
export function AutoclaveModulo({ ciclos, setCiclos }) {
  const [aba, setAba] = useState("visao");
  const [cicloEmb, setCicloEmb] = useState(null);
  const [cicloDest, setCicloDest] = useState(null);
  function abrir(destino, id = null) {
    if (destino === "embolsar") setCicloEmb(id);
    if (destino === "destapar") setCicloDest(id);
    setAba(destino);
  }
  const abas = [["visao", "Visão"], ["embolsar", "Embolsar"], ["destapar", "Destapar"], ["liberacao", "Liberação"]];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", background: "white", borderRadius: 12, padding: 4, gap: 4, boxShadow: "0 1px 4px rgba(0,58,140,0.07)" }}>
        {abas.map(([k, v]) => (
          <button key={k} className="snav" onClick={() => setAba(k)}
            style={{ fontWeight: aba === k ? 700 : 500, background: aba === k ? C.blue : "none", color: aba === k ? "white" : C.grayDark }}>{v}</button>
        ))}
      </div>
      {aba === "visao" && <Visao ciclos={ciclos} setCiclos={setCiclos} abrir={abrir} />}
      {aba === "embolsar" && <Embolsamento ciclos={ciclos} setCiclos={setCiclos} cicloId={cicloEmb} setCicloId={setCicloEmb} irPara={setAba} />}
      {aba === "destapar" && <Destape ciclos={ciclos} setCiclos={setCiclos} cicloId={cicloDest} setCicloId={setCicloDest} irPara={setAba} />}
      {aba === "liberacao" && <Liberacao ciclos={ciclos} setCiclos={setCiclos} />}
    </div>
  );
}

// Histórico de autoclave de um código (usado na aba Painéis)
export function historicoAutoclave(ciclos, codigo) {
  return ciclos.flatMap(c => paineisDoCiclo(c).filter(p => p.codigo === codigo).map(p => ({ ...p, ciclo: c })));
}

// ═══════════════════════════════════════════════════════════════════
//  ANALYTICS (agora lendo os ciclos reais)
// ═══════════════════════════════════════════════════════════════════
const corTaxa = (t) => (t >= 85 ? C.success : t >= 70 ? C.warning : C.danger);
function taxaDe(lista) {
  const ok = lista.filter(p => p.resultado === "ok").length;
  return { taxa: lista.length ? Math.round((ok / lista.length) * 100) : 0, aprov: ok, total: lista.length, reprov: lista.length - ok };
}
const tip = { borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" };

function Barras({ titulo, sub, dados }) {
  return (
    <div className="card">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{titulo}</div>
      <div style={{ fontSize: 12, color: C.grayDark, marginBottom: 14 }}>{sub}</div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.gray} vertical={false} />
          <XAxis dataKey="nome" tick={{ fontSize: 12, fill: C.grayDark }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.grayDark }} axisLine={false} tickLine={false} unit="%" width={42} />
          <Tooltip contentStyle={tip} formatter={(v, n, item) => [`${v}% (${item.payload.aprov}/${item.payload.total})`, "Aprovação"]} />
          <Bar dataKey="taxa" radius={[6, 6, 0, 0]}>
            {dados.map((d, i) => <Cell key={i} fill={d.total ? corTaxa(d.taxa) : C.grayMid} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Analytics({ ciclos }) {
  const destapados = ciclos.filter(c => c.status === "destapado").sort((a, b) => a.numero - b.numero);
  const todos = destapados.flatMap(paineisDoCiclo);

  if (todos.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40, color: C.grayDark }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📈</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Ainda não há ciclos destapados</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Os indicadores aparecem depois do primeiro destape.</div>
      </div>
    );
  }

  const geral = taxaDe(todos);
  const porAndar = [1, 2, 3, 4].map(a => ({ nome: `Andar ${a}`, ...taxaDe(todos.filter(p => p.andar === a)) }));
  const porLado = LADOS.map(l => ({ nome: NOME_LADO[l], ...taxaDe(todos.filter(p => p.lado === l)) }));
  const porPos = [1, 2, 3, 4, 5].map(n => ({ nome: `Pos ${n}`, ...taxaDe(todos.filter(p => p.pos === n)) }));
  const faixas = [["500–549", 500, 550], ["550–599", 550, 600], ["600+", 600, 9999]];
  const porVacuo = faixas.map(([nome, a, b]) => ({ nome, ...taxaDe(todos.filter(p => { const v = ultimoVacuo(p); return v !== null && v >= a && v < b; })) }));
  const porCamadas = [9, 12].map(n => ({ nome: `${n} camadas`, ...taxaDe(todos.filter(p => (p.camadas || 9) === n)) })).filter(d => d.total);
  const porCiclo = destapados.map(c => ({ dia: `C${c.numero}`, yield: taxaDe(paineisDoCiclo(c)).taxa }));

  const reps = todos.filter(p => p.resultado === "reprocesso");
  const pizza = [{ name: "OK", valor: geral.aprov, cor: C.success }, ...MOTIVOS.map(m => ({ name: m.nome, valor: reps.filter(p => p.motivo === m.id).length, cor: m.cor }))].filter(d => d.valor > 0);
  const principalMotivo = MOTIVOS.map(m => ({ ...m, n: reps.filter(p => p.motivo === m.id).length })).sort((a, b) => b.n - a.n)[0];

  const comDados = porAndar.filter(d => d.total);
  const pior = [...comDados].sort((a, b) => a.taxa - b.taxa)[0];
  const melhor = [...comDados].sort((a, b) => b.taxa - a.taxa)[0];

  const perdaTotal = geral.reprov * CUSTO_POR_PAINEL;
  const perdaMedia = destapados.length ? Math.round(perdaTotal / destapados.length) : 0;
  const economia = Math.max(0, (geral.reprov - Math.round(geral.total * (1 - META_YIELD / 100))) * CUSTO_POR_PAINEL);
  const fmtBRL = (v) => `R$ ${v.toLocaleString("pt-BR")}`;

  const meio = Math.floor(destapados.length / 2);
  const ult = destapados.slice(meio), ant = destapados.slice(0, meio);
  const yUlt = taxaDe(ult.flatMap(paineisDoCiclo)).taxa, yAnt = taxaDe(ant.flatMap(paineisDoCiclo)).taxa;
  const delta = yUlt - yAnt;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 13, color: C.grayDark, fontWeight: 500 }}>Yield da autoclave</div>
          <div style={{ fontSize: 11, color: C.grayDark, background: C.gray, padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>Meta: {META_YIELD}%</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: geral.taxa >= META_YIELD ? C.success : geral.taxa >= 70 ? C.warning : C.danger }}>{geral.taxa}%</div>
          <div style={{ fontSize: 13, color: C.grayDark }}>{geral.aprov} de {geral.total} painéis · {destapados.length} ciclos</div>
        </div>
        <div style={{ background: C.gray, height: 8, borderRadius: 4, overflow: "hidden", position: "relative", marginBottom: 12 }}>
          <div style={{ background: geral.taxa >= META_YIELD ? C.success : geral.taxa >= 70 ? C.warning : C.danger, width: `${geral.taxa}%`, height: "100%" }} />
          <div style={{ position: "absolute", top: 0, left: `${META_YIELD}%`, width: 2, height: 8, background: C.text }} />
        </div>
        {ant.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: delta >= 0 ? C.successLight : C.dangerLight, borderRadius: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: delta >= 0 ? C.success : C.danger, fontWeight: 600 }}>{delta >= 0 ? "▲ +" : "▼ "}{delta}% vs ciclos anteriores</span>
            <span style={{ fontSize: 11, color: C.grayDark, marginLeft: "auto" }}>{yAnt}% → {yUlt}%</span>
          </div>
        )}
        {pior && melhor && pior.nome !== melhor.nome && (
          <div style={{ padding: "10px 14px", background: C.bluePale, borderRadius: 10, fontSize: 13, color: C.text, lineHeight: 1.45 }}>
            <strong style={{ color: C.blue }}>Insight:</strong> o <strong>{pior.nome}</strong> tem a menor aprovação ({pior.taxa}%) e o <strong>{melhor.nome}</strong> a maior ({melhor.taxa}%).
            {principalMotivo?.n > 0 && <> O motivo de reprocesso mais comum é <strong>{principalMotivo.nome.toLowerCase()}</strong> ({principalMotivo.n} de {reps.length}).</>} Vale investigar essa altura do carrinho com o engenheiro.
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Impacto financeiro</div>
        <div style={{ fontSize: 12, color: C.grayDark, marginBottom: 14 }}>Estimativa com {fmtBRL(CUSTO_POR_PAINEL)} por painel em reprocesso</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: economia > 0 ? 12 : 0 }}>
          <div style={{ background: C.dangerLight, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.danger, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>No período</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.danger }}>{fmtBRL(perdaTotal)}</div>
            <div style={{ fontSize: 11, color: C.danger, marginTop: 4 }}>{geral.reprov} painéis</div>
          </div>
          <div style={{ background: C.warningLight, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.warning, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Média por ciclo</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.warning }}>{fmtBRL(perdaMedia)}</div>
            <div style={{ fontSize: 11, color: C.warning, marginTop: 4 }}>{destapados.length} ciclos</div>
          </div>
        </div>
        {economia > 0 && <div style={{ background: C.successLight, borderRadius: 10, padding: 12, fontSize: 13 }}>Batendo a meta de <strong>{META_YIELD}%</strong>, a economia seria de <strong style={{ color: C.success }}>{fmtBRL(economia)}</strong> no período.</div>}
      </div>

      <Barras titulo="Aprovação por andar" sub="Diferença entre andares pode indicar distribuição de calor desigual" dados={porAndar} />
      <Barras titulo="Aprovação por posição no andar" sub="Posições 1 e 5 ficam nas pontas do carrinho" dados={porPos} />
      <Barras titulo="Aprovação por faixa de vácuo" sub={`Confirma se o mínimo de ${VACUO_MIN} é suficiente`} dados={porVacuo} />

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Fundo × Porta {porCamadas.length > 1 ? "· 9 × 12 camadas" : ""}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          {[...porLado, ...(porCamadas.length > 1 ? porCamadas : [])].map(l => (
            <div key={l.nome} style={{ background: C.gray, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: C.grayDark, marginBottom: 4 }}>{l.nome}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: corTaxa(l.taxa) }}>{l.taxa}%</div>
              <div style={{ fontSize: 11, color: C.grayDark, marginTop: 4 }}>{l.aprov}/{l.total}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Yield por ciclo</div>
        <div style={{ fontSize: 12, color: C.grayDark, marginBottom: 14 }}>Linha tracejada = meta de {META_YIELD}%</div>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={porCiclo}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gray} vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: C.grayDark }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.grayDark }} axisLine={false} tickLine={false} unit="%" width={42} />
            <Tooltip contentStyle={tip} />
            <Line type="monotone" dataKey="yield" name="Yield" stroke={C.agpBlue} strokeWidth={2.5} dot={{ fill: C.agpBlue, r: 3 }} />
            <Line type="monotone" dataKey={() => META_YIELD} name="Meta" stroke={C.success} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Resultados e motivos de reprocesso</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          <ResponsiveContainer width={190} height={190}>
            <PieChart>
              <Pie data={pizza} dataKey="valor" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={46} stroke="white" strokeWidth={2}>
                {pizza.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Pie>
              <Tooltip contentStyle={tip} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pizza.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: d.cor }} />
                <span style={{ fontSize: 13 }}><strong>{d.valor}</strong> {d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
