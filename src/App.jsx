import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const C = {
  blue: "#003A8C", blueLight: "#0057D9", bluePale: "#E8F0FB",
  gray: "#F4F6FA", grayMid: "#C8D0DE", grayDark: "#6B7A99",
  success: "#0A7A4B", successLight: "#E6F4EF",
  danger: "#C0392B", dangerLight: "#FDECEA",
  warning: "#D97706", warningLight: "#FFF7ED",
  text: "#0D1B3E", purple: "#6B21A8", purpleLight: "#F3E8FF",
  agpBlue: "#4A7FA5",
};

const INTERVALOS = [
  "07h → 08h","08h → 09h","09h → 10h","10h → 11h",
  "11h → 12h","12h → 13h","13h → 14h","14h → 15h",
  "15h → 16h","16h → 17h","17h → 18h","18h → 19h",
  "19h → 20h","20h → 21h","21h → 22h","22h → 23h",
];

const MOCK_HORA = [
  { intervalo: "07h → 08h", turno: "1º", cortados: 8, embolsados: 6, autoclave: 6, aprovados: 5, reprovados: 1, amostras: 2, matricula: "3789", observacao: null, data: "10/04/2025" },
  { intervalo: "08h → 09h", turno: "1º", cortados: 0, embolsados: 0, autoclave: 0, aprovados: 0, reprovados: 0, amostras: 0, matricula: "3789", observacao: "Reunião de turno com supervisor.", data: "10/04/2025" },
  { intervalo: "09h → 10h", turno: "1º", cortados: 10, embolsados: 9, autoclave: 9, aprovados: 8, reprovados: 1, amostras: 3, matricula: "3789", observacao: null, data: "10/04/2025" },
];

const MOCK_PAINEIS = [
  { codigo: "35002456", data: "10/04/2025", turno: "1º", intervalo: "07h → 08h", tipo: "novo", status: "aprovado", defeito: null, descricaoRetrabalho: null, motivoRetrabalho: null, amostras: 2, matricula: "3789" },
  { codigo: "35002457", data: "10/04/2025", turno: "1º", intervalo: "09h → 10h", tipo: "novo", status: "reprovado", defeito: "dobras", descricaoRetrabalho: null, motivoRetrabalho: null, amostras: 0, matricula: "3789" },
  { codigo: "35002457", data: "10/04/2025", turno: "2º", intervalo: "14h → 15h", tipo: "retrabalho", status: "aprovado", defeito: null, descricaoRetrabalho: "Dobras na região central por empilhamento excessivo.", motivoRetrabalho: "dobras", amostras: 1, matricula: "3789" },
  { codigo: "35002458", data: "10/04/2025", turno: "1º", intervalo: "09h → 10h", tipo: "novo", status: "reprovado", defeito: "mole", descricaoRetrabalho: null, motivoRetrabalho: null, amostras: 0, matricula: "3789" },
  { codigo: "35002459", data: "10/04/2025", turno: "1º", intervalo: "10h → 11h", tipo: "novo", status: "aprovado", defeito: null, descricaoRetrabalho: null, motivoRetrabalho: null, amostras: 3, matricula: "3789" },
];

// Estrutura do carrinho: 4 prateleiras x 2 lados x 3 slots
function carrinhoVazio() {
  const c = {};
  [1,2,3,4].forEach(p => {
    ["porta","fundo"].forEach(l => {
      c[`${p}-${l}`] = [null, null, null]; // até 3 painéis por espaço
    });
  });
  return c;
}

const MOCK_CICLOS = [
  {
    id: "C001", dataEnvio: "10/04/2025", dataRetorno: "11/04/2025",
    matricula: "3789", fimDeSemana: false, observacao: null, avaliado: true,
    paineis: [
      { codigo: "35002456", reprocesso: false, resultado: "aprovado", defeito: null },
      { codigo: "35002457", reprocesso: false, resultado: "reprovado", defeito: "dobras" },
      { codigo: "35002458", reprocesso: true, resultado: "aprovado", defeito: null },
      { codigo: "35002459", reprocesso: false, resultado: "aprovado", defeito: null },
      { codigo: "35002460", reprocesso: false, resultado: "reprovado", defeito: "mole" },
    ],
  },
  {
    id: "C002", dataEnvio: "11/04/2025", dataRetorno: "12/04/2025",
    matricula: "3789", fimDeSemana: false, observacao: null, avaliado: false,
    paineis: [
      { codigo: "35002461", reprocesso: false, resultado: null, defeito: null },
      { codigo: "35002462", reprocesso: false, resultado: null, defeito: null },
      { codigo: "35002463", reprocesso: true, resultado: null, defeito: null },
    ],
  },
];

const GRAFICO_DIA = [
  { hora: "07-08h", aprovados: 5, reprovados: 1 },
  { hora: "08-09h", aprovados: 0, reprovados: 0 },
  { hora: "09-10h", aprovados: 6, reprovados: 2 },
  { hora: "10-11h", aprovados: 9, reprovados: 1 },
  { hora: "11-12h", aprovados: 5, reprovados: 2 },
  { hora: "12-13h", aprovados: 4, reprovados: 1 },
];
const GRAFICO_SEMANA = [
  { dia: "Seg", aprovados: 42, reprovados: 8 },
  { dia: "Ter", aprovados: 38, reprovados: 12 },
  { dia: "Qua", aprovados: 45, reprovados: 5 },
  { dia: "Qui", aprovados: 30, reprovados: 20 },
  { dia: "Sex", aprovados: 40, reprovados: 10 },
];
const GRAFICO_MES = [
  { semana: "S1", aprovados: 180, reprovados: 40 },
  { semana: "S2", aprovados: 195, reprovados: 25 },
  { semana: "S3", aprovados: 160, reprovados: 55 },
  { semana: "S4", aprovados: 210, reprovados: 20 },
];

const TOTAIS = { cortados: 52, embolsados: 45, autoclave: 45, aprovados: 37, reprovados: 8, amostras: 14 };
const TAXA = Math.round((TOTAIS.aprovados / TOTAIS.autoclave) * 100);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,58,140,0.07); }
  .field { width: 100%; padding: 10px 14px; border: 1.5px solid #C8D0DE; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0D1B3E; outline: none; background: white; }
  .field:focus { border-color: #0057D9; }
  .field-err { border-color: #C0392B !important; }
  .btn { background: #003A8C; color: white; border: none; padding: 12px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; }
  .tag { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
  .tab { background: none; border: none; cursor: pointer; padding: 11px 18px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; border-bottom: 2.5px solid transparent; color: #6B7A99; }
  .tab.on { border-bottom-color: #003A8C; color: #003A8C; font-weight: 700; }
  .pbtn { background: none; border: 1.5px solid #C8D0DE; cursor: pointer; padding: 7px 14px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #6B7A99; }
  .pbtn.on { background: #003A8C; border-color: #003A8C; color: white; }
  .prow { padding: 12px 14px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border: 1.5px solid transparent; }
  .prow:hover { background: #E8F0FB; border-color: #0057D9; }
  .prow.sel { background: #E8F0FB; border-color: #003A8C; }
  .tl { position: relative; padding-left: 24px; padding-bottom: 20px; }
  .tl::before { content: ''; position: absolute; left: 7px; top: 20px; bottom: 0; width: 2px; background: #C8D0DE; }
  .tl:last-child::before { display: none; }
  .tldot { position: absolute; left: 0; top: 6px; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; }
  tr.cr:hover td { background: #E8F0FB !important; cursor: pointer; }
  .lbl { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .tog { flex: 1; padding: 10px; border: 1.5px solid #C8D0DE; background: white; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; color: #6B7A99; }
  .tog.novo { background: #E6F4EF; border-color: #0A7A4B; color: #0A7A4B; }
  .tog.ret { background: #FFF7ED; border-color: #D97706; color: #D97706; }
  .errmsg { font-size: 11px; color: #C0392B; margin-top: 4px; }
  .snav { flex: 1; padding: 10px 6px; border: none; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; }
`;

// ─── sub-components ───────────────────────────────────────────────

function Tag({ bg, color, children }) {
  return <span className="tag" style={{ background: bg, color }}>{children}</span>;
}

function Circulo({ valor, label, cor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ width: 54, height: 54, borderRadius: "50%", background: cor + "18", border: `2.5px solid ${cor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: cor }}>{valor}</span>
      </div>
      <span style={{ fontSize: 11, color: C.grayDark, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function CardNum({ label, valor, cor }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "14px 8px", borderTop: `3px solid ${cor}` }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: cor }}>{valor}</div>
      <div style={{ fontSize: 11, color: C.grayDark, marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function Carrinho({ carrinho, setCarrinho, soLeitura, resultados }) {
  const [editando, setEditando] = useState(null); // "p-lado-slot"
  const [inputCod, setInputCod] = useState("");

  function setCodigo(prat, lado, slot, valor) {
    const key = `${prat}-${lado}`;
    const slots = [...(carrinho[key] || [null,null,null])];
    slots[slot] = valor || null;
    setCarrinho(prev => ({ ...prev, [key]: slots }));
  }

  function getResultado(codigo) {
    if (!resultados || !codigo) return null;
    return resultados[codigo] || null;
  }

  function corResultado(res) {
    if (!res) return C.gray;
    if (res.resultado === "aprovado") return C.successLight;
    if (res.resultado === "reprovado") return C.dangerLight;
    return C.gray;
  }

  function bordaResultado(res) {
    if (!res) return C.grayMid;
    if (res.resultado === "aprovado") return C.success;
    if (res.resultado === "reprovado") return C.danger;
    return C.grayMid;
  }

  return (
    <div style={{ background: C.gray, borderRadius: 14, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div />
        <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: C.blue, background: C.bluePale, borderRadius: 8, padding: "6px 0" }}>🚪 Lado Porta</div>
        <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: C.grayDark, background: "white", borderRadius: 8, padding: "6px 0" }}>🏭 Lado Fundo</div>
      </div>

      {/* Prateleiras — de cima pra baixo (4 → 1) */}
      {[4,3,2,1].map(prat => (
        <div key={prat} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.grayDark, background: "white", borderRadius: 8, padding: "4px 0" }}>
            P{prat}
          </div>
          {["porta","fundo"].map(lado => {
            const key = `${prat}-${lado}`;
            const slots = carrinho[key] || [null,null,null];
            const preenchidos = slots.filter(s => s !== null).length;
            return (
              <div key={lado} style={{ background: "white", borderRadius: 10, padding: 8, border: `1.5px solid ${C.grayMid}`, display: "flex", flexDirection: "column", gap: 4 }}>
                {slots.map((cod, si) => {
                  const res = getResultado(cod);
                  const eKey = `${prat}-${lado}-${si}`;
                  const isEditando = editando === eKey;
                  return (
                    <div key={si} style={{ background: corResultado(res), border: `1.5px solid ${bordaResultado(res)}`, borderRadius: 8, padding: "5px 8px", minHeight: 34, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                      {isEditando && !soLeitura ? (
                        <input
                          autoFocus
                          value={inputCod}
                          maxLength={8}
                          onChange={e => setInputCod(e.target.value.replace(/\D/g,""))}
                          onBlur={() => { setCodigo(prat, lado, si, inputCod); setEditando(null); setInputCod(""); }}
                          onKeyDown={e => { if (e.key === "Enter") { setCodigo(prat, lado, si, inputCod); setEditando(null); setInputCod(""); } if (e.key === "Escape") { setEditando(null); setInputCod(""); } }}
                          style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'DM Mono'", fontSize: 12, fontWeight: 600, outline: "none", color: C.text }}
                          placeholder="00000000"
                        />
                      ) : (
                        <span
                          onClick={() => { if (!soLeitura) { setEditando(eKey); setInputCod(cod || ""); } }}
                          style={{ fontFamily: "'DM Mono'", fontSize: 12, fontWeight: cod ? 600 : 400, color: cod ? C.blue : C.grayMid, cursor: soLeitura ? "default" : "pointer", flex: 1 }}>
                          {cod || (soLeitura ? "—" : "Toque para adicionar")}
                        </span>
                      )}
                      {cod && !soLeitura && !isEditando && (
                        <button onClick={() => setCodigo(prat, lado, si, null)}
                          style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 12, fontWeight: 700, padding: "0 2px" }}>✕</button>
                      )}
                      {cod && res && res.resultado && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: res.resultado === "aprovado" ? C.success : C.danger }}>
                          {res.resultado === "aprovado" ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                  );
                })}
                <div style={{ fontSize: 10, color: C.grayDark, textAlign: "right", marginTop: 2 }}>{preenchidos}/3</div>
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ fontSize: 12, color: C.grayDark, textAlign: "center", marginTop: 8 }}>
        Total: <strong>{Object.values(carrinho).flat().filter(Boolean).length} painel(is)</strong>
      </div>
    </div>
  );
}


function AutoclaveVisao({ ciclos, setCicloAvaliando, setAba }) {
  const tot = ciclos.reduce((s, c) => s + c.paineis.length, 0);
  const aval = ciclos.filter(c => c.avaliado);
  const aprov = aval.reduce((s, c) => s + c.paineis.filter(p => p.resultado === "aprovado").length, 0);
  const reprov = aval.reduce((s, c) => s + c.paineis.filter(p => p.resultado === "reprovado").length, 0);
  const totAval = aval.reduce((s, c) => s + c.paineis.length, 0);
  const repro = ciclos.reduce((s, c) => s + c.paineis.filter(p => p.reprocesso).length, 0);
  const taxa = totAval > 0 ? Math.round((aprov / totAval) * 100) : 0;
  const r = 38;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        <CardNum label="Ciclos" valor={ciclos.length} cor={C.blue} />
        <CardNum label="Enviados" valor={tot} cor={C.agpBlue} />
        <CardNum label="Reprocessos" valor={repro} cor={C.warning} />
        <CardNum label="Avaliados" valor={totAval} cor={C.grayDark} />
        <CardNum label="Aprovados" valor={aprov} cor={C.success} />
        <CardNum label="Reprovados" valor={reprov} cor={C.danger} />
      </div>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg viewBox="0 0 90 90" width="90" height="90">
            <circle cx="45" cy="45" r={r} fill="none" stroke={C.dangerLight} strokeWidth="10" />
            <circle cx="45" cy="45" r={r} fill="none" stroke={C.success} strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * r * taxa / 100} ${2 * Math.PI * r}`}
              strokeLinecap="round" transform="rotate(-90 45 45)" />
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.success }}>{taxa}%</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Taxa de Aprovação</div>
          <div style={{ fontSize: 13, color: C.grayDark }}>{aval.length} ciclo(s) avaliado(s)</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>✓ {aprov}</span>
            <span style={{ fontSize: 13, color: C.danger, fontWeight: 600 }}>✗ {reprov}</span>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.gray}`, fontSize: 15, fontWeight: 700 }}>Ciclos Registrados</div>
        {ciclos.map((c, i) => {
          const ap = c.paineis.filter(p => p.resultado === "aprovado").length;
          const rp = c.paineis.filter(p => p.resultado === "reprovado").length;
          const re = c.paineis.filter(p => p.reprocesso).length;
          return (
            <div key={c.id} style={{ padding: "14px 18px", borderBottom: i < ciclos.length - 1 ? `1px solid ${C.gray}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'DM Mono'", fontWeight: 700, color: C.blue, fontSize: 14 }}>{c.id}</span>
                  {c.fimDeSemana && <Tag bg={C.purpleLight} color={C.purple}>Fim de semana</Tag>}
                  <Tag bg={c.avaliado ? C.successLight : C.warningLight} color={c.avaliado ? C.success : C.warning}>
                    {c.avaliado ? "✓ Avaliado" : "⏳ Aguardando"}
                  </Tag>
                </div>
                <div style={{ fontSize: 12, color: C.grayDark }}>Envio: {c.dataEnvio} → Retorno: {c.dataRetorno} • #{c.matricula}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <Tag bg={C.bluePale} color={C.blue}>{c.paineis.length} painéis</Tag>
                {re > 0 && <Tag bg={C.warningLight} color={C.warning}>↺ {re}</Tag>}
                {c.avaliado && <><Tag bg={C.successLight} color={C.success}>✓ {ap}</Tag><Tag bg={C.dangerLight} color={C.danger}>✗ {rp}</Tag></>}
                {!c.avaliado && (
                  <button onClick={() => { setCicloAvaliando(c.id); setAba("avaliar"); }}
                    style={{ padding: "6px 12px", background: C.blue, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>
                    Avaliar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AutoclaveAvaliar({ ciclos, setCiclos, cicloAvaliando, setCicloAvaliando, setAba }) {
  const pendentes = ciclos.filter(c => !c.avaliado);
  const atual = cicloAvaliando ? ciclos.find(c => c.id === cicloAvaliando) : null;

  function marcar(cicloId, codigo, resultado, defeito) {
    setCiclos(prev => prev.map(c => c.id !== cicloId ? c : {
      ...c, paineis: c.paineis.map(p => p.codigo === codigo ? { ...p, resultado, defeito } : p)
    }));
  }

  function finalizar(cicloId) {
    setCiclos(prev => prev.map(c => c.id === cicloId ? { ...c, avaliado: true } : c));
    setCicloAvaliando(null);
    setAba("dashboard");
  }

  if (!atual) {
    if (pendentes.length === 0) {
      return (
        <div className="card" style={{ textAlign: "center", padding: 40, color: C.grayDark }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Todos os ciclos foram avaliados!</div>
        </div>
      );
    }
    return (
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Ciclos Aguardando Avaliação</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pendentes.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.gray, borderRadius: 12, padding: "14px 16px", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "'DM Mono'", fontWeight: 700, color: C.blue, fontSize: 15, marginBottom: 4 }}>{c.id}</div>
                <div style={{ fontSize: 12, color: C.grayDark }}>Enviado: {c.dataEnvio} • {c.paineis.length} painéis • #{c.matricula}</div>
              </div>
              <button onClick={() => setCicloAvaliando(c.id)}
                style={{ padding: "8px 16px", background: C.blue, color: "white", border: "none", borderRadius: 8, fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Avaliar este ciclo
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, color: C.grayDark, marginBottom: 2 }}>Avaliando ciclo</div>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 20, fontWeight: 700, color: C.blue }}>{atual.id} — {atual.dataEnvio}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Tag bg={C.bluePale} color={C.blue}>{atual.paineis.length} painéis</Tag>
          <Tag bg={C.successLight} color={C.success}>✓ {atual.paineis.filter(p => p.resultado === "aprovado").length}</Tag>
          <Tag bg={C.dangerLight} color={C.danger}>✗ {atual.paineis.filter(p => p.resultado === "reprovado").length}</Tag>
        </div>
      </div>

      {/* Carrinho visual com resultados se disponível */}
      {atual.carrinho && (
        <div style={{ marginBottom: 20 }}>
          <div className="lbl" style={{ color: C.blue }}>Posição no Carrinho</div>
          <Carrinho
            carrinho={atual.carrinho}
            setCarrinho={() => {}}
            soLeitura={true}
            resultados={Object.fromEntries(atual.paineis.map(p => [p.codigo, p]))}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {atual.paineis.map((p, i) => {
          const bgColor = p.resultado === "aprovado" ? C.successLight : p.resultado === "reprovado" ? C.dangerLight : C.gray;
          const bdColor = p.resultado === "aprovado" ? C.success : p.resultado === "reprovado" ? C.danger : C.grayMid;
          const pos = p.posicao ? `P${p.posicao.prateleira} · ${p.posicao.lado === "porta" ? "Porta" : "Fundo"}` : null;
          return (
            <div key={i} style={{ background: bgColor, borderRadius: 12, padding: "12px 16px", border: `1.5px solid ${bdColor}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'DM Mono'", fontWeight: 700, color: C.blue, fontSize: 15 }}>{p.codigo}</span>
                  {p.reprocesso && <Tag bg={C.warningLight} color={C.warning}>↺ Reprocesso</Tag>}
                  {pos && <span style={{ fontSize: 11, color: C.grayDark, background: "white", padding: "2px 8px", borderRadius: 6 }}>{pos}</span>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => marcar(atual.id, p.codigo, "aprovado", null)}
                    style={{ padding: "6px 12px", border: `1.5px solid ${C.success}`, background: p.resultado === "aprovado" ? C.success : "white", color: p.resultado === "aprovado" ? "white" : C.success, borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    ✓ Bom
                  </button>
                  <button onClick={() => marcar(atual.id, p.codigo, "reprovado", "dobras")}
                    style={{ padding: "6px 10px", border: `1.5px solid ${C.danger}`, background: p.resultado === "reprovado" && p.defeito === "dobras" ? C.danger : "white", color: p.resultado === "reprovado" && p.defeito === "dobras" ? "white" : C.danger, borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Dobras
                  </button>
                  <button onClick={() => marcar(atual.id, p.codigo, "reprovado", "mole")}
                    style={{ padding: "6px 10px", border: `1.5px solid ${C.warning}`, background: p.resultado === "reprovado" && p.defeito === "mole" ? C.warning : "white", color: p.resultado === "reprovado" && p.defeito === "mole" ? "white" : C.warning, borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Mole
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setCicloAvaliando(null)}
          style={{ flex: 1, padding: "12px", border: `1.5px solid ${C.grayMid}`, background: "white", borderRadius: 10, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer", color: C.grayDark }}>
          Voltar
        </button>
        <button onClick={() => finalizar(atual.id)}
          style={{ flex: 2, padding: "12px", background: C.success, color: "white", border: "none", borderRadius: 10, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          ✓ Finalizar Avaliação
        </button>
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────

export default function App() {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const [tela, setTela] = useState("dashboard");
  const [abaReg, setAbaReg] = useState("hora");
  const [abaHist, setAbaHist] = useState("hora");
  const [abaAuto, setAbaAuto] = useState("dashboard");
  const [periodo, setPeriodo] = useState("dia");
  const [painelSel, setPainelSel] = useState(null);
  const [busca, setBusca] = useState("");
  const [paineis, setPaineis] = useState(MOCK_PAINEIS);
  const [horas, setHoras] = useState(MOCK_HORA);
  const [ciclos, setCiclos] = useState(MOCK_CICLOS);
  const [cicloAval, setCicloAval] = useState(null);
  const [novoCod, setNovoCod] = useState("");
  const [ok, setOk] = useState(false);

  const [fh, setFh] = useState({ matricula: "", turno: "1º", intervalo: "07h → 08h", cortados: "", embolsados: "", autoclave: "", aprovados: "", rep_dobras: "", rep_mole: "", amostras: "", obs: "" });
  const [fp, setFp] = useState({ matricula: "", turno: "1º", codigo: "", tipo: "novo", intervalo: "07h → 08h", rep_dobras: "", rep_mole: "", amostras: "", motivo: "", descricao: "" });
  const [fc, setFc] = useState({ matricula: "", dataEnvio: "", fimDeSemana: false, obs: "", paineis: [], carrinho: carrinhoVazio() });
  const [ehFh, setEhFh] = useState({});
  const [ehFp, setEhFp] = useState({});

  const zeroProd = !fh.cortados && !fh.embolsados && !fh.autoclave && !fh.aprovados;

  function flash() { setOk(true); setTimeout(() => setOk(false), 3000); }

  function salvarHora() {
    const e = {};
    if (!fh.matricula) e.matricula = "Informe a matrícula";
    if (zeroProd && !fh.obs) e.obs = "Produção zerada — informe o motivo";
    setEhFh(e);
    if (Object.keys(e).length) return;
    const rep = (Number(fh.rep_dobras) || 0) + (Number(fh.rep_mole) || 0);
    setHoras(prev => [...prev, { intervalo: fh.intervalo, turno: fh.turno, cortados: Number(fh.cortados) || 0, embolsados: Number(fh.embolsados) || 0, autoclave: Number(fh.autoclave) || 0, aprovados: Number(fh.aprovados) || 0, reprovados: rep, amostras: Number(fh.amostras) || 0, matricula: fh.matricula, observacao: fh.obs || null, data: hoje }]);
    setFh({ matricula: "", turno: "1º", intervalo: "07h → 08h", cortados: "", embolsados: "", autoclave: "", aprovados: "", rep_dobras: "", rep_mole: "", amostras: "", obs: "" });
    setEhFh({});
    flash();
  }

  function salvarPainel() {
    const e = {};
    if (!fp.matricula) e.matricula = "Informe a matrícula";
    if (!/^\d{8}$/.test(fp.codigo)) e.codigo = "Código deve ter exatamente 8 números";
    setEhFp(e);
    if (Object.keys(e).length) return;
    const rd = Number(fp.rep_dobras) || 0;
    const rm = Number(fp.rep_mole) || 0;
    const status = (rd + rm) > 0 ? "reprovado" : "aprovado";
    const defeito = rd > 0 && rm > 0 ? "dobras e mole" : rd > 0 ? "dobras" : rm > 0 ? "mole" : null;
    setPaineis(prev => [...prev, { codigo: fp.codigo, data: hoje, turno: fp.turno, intervalo: fp.intervalo, tipo: fp.tipo, status, defeito, descricaoRetrabalho: fp.tipo === "retrabalho" ? fp.descricao : null, motivoRetrabalho: fp.tipo === "retrabalho" ? fp.motivo : null, amostras: Number(fp.amostras) || 0, matricula: fp.matricula }]);
    setFp({ matricula: "", turno: "1º", codigo: "", tipo: "novo", intervalo: "07h → 08h", rep_dobras: "", rep_mole: "", amostras: "", motivo: "", descricao: "" });
    setEhFp({});
    flash();
  }

  function salvarCiclo() {
    if (!fc.matricula) return;
    // Collect paineis from carrinho
    const paineisDoCarro = Object.entries(fc.carrinho).flatMap(([key, slots]) => {
      const [prat, lado] = key.split("-");
      return slots.map((cod, si) => cod ? { codigo: cod, reprocesso: false, resultado: null, defeito: null, posicao: { prateleira: Number(prat), lado, slot: si } } : null).filter(Boolean);
    });
    if (paineisDoCarro.length === 0) return;
    const id = `C${String(ciclos.length + 1).padStart(3, "0")}`;
    const de = fc.dataEnvio ? new Date(fc.dataEnvio).toLocaleDateString("pt-BR") : hoje;
    const dr = fc.dataEnvio ? new Date(new Date(fc.dataEnvio).getTime() + 86400000).toLocaleDateString("pt-BR") : hoje;
    setCiclos(prev => [...prev, { id, dataEnvio: de, dataRetorno: dr, matricula: fc.matricula, fimDeSemana: fc.fimDeSemana, observacao: fc.obs || null, avaliado: false, paineis: paineisDoCarro, carrinho: fc.carrinho }]);
    setFc({ matricula: "", dataEnvio: "", fimDeSemana: false, obs: "", paineis: [], carrinho: carrinhoVazio() });
    setAbaAuto("dashboard");
  }

  const codsUnicos = [...new Set(paineis.map(p => p.codigo))];
  const codsFiltrados = codsUnicos.filter(c => c.includes(busca));
  const histPainel = painelSel ? paineis.filter(p => p.codigo === painelSel) : [];
  const grafico = periodo === "dia" ? GRAFICO_DIA : periodo === "semana" ? GRAFICO_SEMANA : GRAFICO_MES;
  const xKey = periodo === "dia" ? "hora" : periodo === "semana" ? "dia" : "semana";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.gray, minHeight: "100vh", color: C.text, overflowX: "hidden", maxWidth: "100vw" }}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{ background: C.blue, overflowX: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", padding: "10px 16px", gap: 14 }}>
          <img src="https://agpglass.com/wp-content/themes/agp/assets/images/logo_sglass_2026_white.png" alt="AGP" style={{ height: 38, width: "auto", flexShrink: 0 }} />
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>HoraHora Opaco</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Controle de Produção — Mantas de Aramida</div>
          </div>
        </div>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.15)", borderTop: "1px solid rgba(255,255,255,0.1)", overflowX: "auto" }}>
          {[["dashboard","📊"],["registro","✏️"],["historico","📋"],["paineis","🔲"],["autoclave","🔥"]].map(([k, ic]) => (
            <button key={k} onClick={() => setTela(k)}
              style={{ flex: 1, background: "none", border: "none", borderBottom: tela === k ? "3px solid white" : "3px solid transparent", cursor: "pointer", padding: "10px 4px", fontFamily: "'DM Sans'", fontSize: 11, fontWeight: tela === k ? 700 : 500, color: tela === k ? "white" : "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
              {ic} {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 12px", width: "100%", boxSizing: "border-box" }}>

        {/* ── DASHBOARD ── */}
        {tela === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              <CardNum label="Cortados" valor={TOTAIS.cortados} cor={C.blue} />
              <CardNum label="Embolsados" valor={TOTAIS.embolsados} cor={C.agpBlue} />
              <CardNum label="Autoclave" valor={TOTAIS.autoclave} cor={C.warning} />
              <CardNum label="Aprovados" valor={TOTAIS.aprovados} cor={C.success} />
              <CardNum label="Reprovados" valor={TOTAIS.reprovados} cor={C.danger} />
              <CardNum label="Amostras" valor={TOTAIS.amostras} cor={C.purple} />
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 13, color: C.grayDark, fontWeight: 500 }}>Taxa de Aprovação — Autoclave</div>
              <div style={{ position: "relative", width: 110, height: 110 }}>
                <svg viewBox="0 0 110 110" width="110" height="110">
                  <circle cx="55" cy="55" r="46" fill="none" stroke={C.dangerLight} strokeWidth="12" />
                  <circle cx="55" cy="55" r="46" fill="none" stroke={C.success} strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 46 * TAXA / 100} ${2 * Math.PI * 46}`}
                    strokeLinecap="round" transform="rotate(-90 55 55)" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.success }}>{TAXA}%</div>
                  <div style={{ fontSize: 10, color: C.grayDark }}>aprovação</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.success }}>{TOTAIS.aprovados} bons</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>{TOTAIS.reprovados} ruins</span>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: C.grayDark, marginBottom: 16 }}>Fluxo de Produção — Turno Atual</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
                <Circulo valor={TOTAIS.cortados} label="Corte" cor={C.blue} />
                <span style={{ color: C.grayMid, fontSize: 18 }}>→</span>
                <Circulo valor={TOTAIS.embolsados} label="Embolsa" cor={C.agpBlue} />
                <span style={{ color: C.grayMid, fontSize: 18 }}>→</span>
                <Circulo valor={TOTAIS.autoclave} label="Autoclave" cor={C.warning} />
                <span style={{ color: C.grayMid, fontSize: 18 }}>→</span>
                <Circulo valor={TOTAIS.aprovados} label="Aprovados" cor={C.success} />
                <span style={{ color: C.grayMid, fontSize: 18 }}>→</span>
                <Circulo valor={TOTAIS.amostras} label="Amostras" cor={C.purple} />
              </div>
              <div style={{ marginTop: 16, padding: "10px 14px", background: C.dangerLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 13, color: C.danger, fontWeight: 500 }}>⚠ {TOTAIS.reprovados} reprovados ({100 - TAXA}% rejeição)</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag bg={C.dangerLight} color={C.danger}>Dobras: {Math.ceil(TOTAIS.reprovados * 0.6)}</Tag>
                  <Tag bg={C.warningLight} color={C.warning}>Mole: {Math.floor(TOTAIS.reprovados * 0.4)}</Tag>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Produção por período</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["dia","Dia"],["semana","Semana"],["mes","Mês"]].map(([k,v]) => (
                    <button key={k} className={`pbtn ${periodo === k ? "on" : ""}`} onClick={() => setPeriodo(k)}>{v}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={grafico} barGap={4} margin={{ bottom: 30 }}>
                  <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: C.grayDark, angle: -35, textAnchor: "end", dy: 8 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 12, fill: C.grayDark }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontFamily: "'DM Sans'" }} />
                  <Bar dataKey="aprovados" name="Aprovados" fill={C.agpBlue} radius={[6,6,0,0]} />
                  <Bar dataKey="reprovados" name="Reprovados" fill={C.danger} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── REGISTRAR ── */}
        {tela === "registro" && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${C.gray}`, padding: "0 20px" }}>
                <button className={`tab ${abaReg === "hora" ? "on" : ""}`} onClick={() => setAbaReg("hora")}>📋 Por Hora</button>
                <button className={`tab ${abaReg === "painel" ? "on" : ""}`} onClick={() => setAbaReg("painel")}>🔲 Por Painel</button>
              </div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {ok && <div style={{ background: C.successLight, border: `1.5px solid ${C.success}`, borderRadius: 10, padding: "12px 16px", color: C.success, fontWeight: 500, fontSize: 14 }}>✓ Salvo com sucesso!</div>}

                {abaReg === "hora" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Matrícula</label>
                        <input className={`field ${ehFh.matricula ? "field-err" : ""}`} placeholder="Ex: 3789"
                          value={fh.matricula} onChange={e => setFh(p => ({ ...p, matricula: e.target.value.replace(/\D/g, "") }))}
                          style={{ fontFamily: "'DM Mono'", fontWeight: 600, letterSpacing: 2 }} />
                        {ehFh.matricula && <div className="errmsg">{ehFh.matricula}</div>}
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Turno</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {["1º","2º"].map(t => (
                            <button key={t} onClick={() => setFh(p => ({ ...p, turno: t }))}
                              style={{ flex: 1, padding: "10px", border: `1.5px solid ${fh.turno === t ? C.blue : C.grayMid}`, background: fh.turno === t ? C.bluePale : "white", borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer", color: fh.turno === t ? C.blue : C.grayDark }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Intervalo</label>
                      <select className="field" value={fh.intervalo} onChange={e => setFh(p => ({ ...p, intervalo: e.target.value }))} style={{ fontFamily: "'DM Mono'", fontWeight: 600 }}>
                        {INTERVALOS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div style={{ borderTop: `1px solid ${C.gray}`, paddingTop: 14 }}>
                      <div className="lbl" style={{ color: C.blue }}>Produção</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[["cortados","Cortados"],["embolsados","Embolsados"],["autoclave","Autoclave"],["aprovados","Aprovados"],["amostras","Amostras"]].map(([k,l]) => (
                          <div key={k}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 5 }}>{l}</label>
                            <input className="field" type="number" min="0" placeholder="0" value={fh[k]} onChange={e => setFh(p => ({ ...p, [k]: e.target.value }))} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${C.gray}`, paddingTop: 14 }}>
                      <div className="lbl" style={{ color: C.danger }}>Reprovados</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 5 }}>Dobras</label>
                          <input className="field" type="number" min="0" placeholder="0" value={fh.rep_dobras} onChange={e => setFh(p => ({ ...p, rep_dobras: e.target.value }))} />
                        </div>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 5 }}>Mole</label>
                          <input className="field" type="number" min="0" placeholder="0" value={fh.rep_mole} onChange={e => setFh(p => ({ ...p, rep_mole: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: zeroProd ? C.danger : C.grayDark, display: "block", marginBottom: 6 }}>
                        {zeroProd ? "⚠ Motivo da parada (obrigatório)" : "Observação (opcional)"}
                      </label>
                      <textarea className={`field ${ehFh.obs ? "field-err" : ""}`} rows={3} placeholder={zeroProd ? "Ex: Reunião, manutenção..." : "Ex: Ritmo reduzido no início..."} value={fh.obs} onChange={e => setFh(p => ({ ...p, obs: e.target.value }))} style={{ resize: "vertical" }} />
                      {ehFh.obs && <div className="errmsg">{ehFh.obs}</div>}
                    </div>
                    <div style={{ background: C.gray, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.grayDark }}>📅 Data: <strong style={{ color: C.text }}>{hoje}</strong></div>
                    <button className="btn" onClick={salvarHora}>Confirmar Registro</button>
                  </>
                )}

                {abaReg === "painel" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Matrícula</label>
                        <input className={`field ${ehFp.matricula ? "field-err" : ""}`} placeholder="Ex: 3789"
                          value={fp.matricula} onChange={e => setFp(p => ({ ...p, matricula: e.target.value.replace(/\D/g, "") }))}
                          style={{ fontFamily: "'DM Mono'", fontWeight: 600, letterSpacing: 2 }} />
                        {ehFp.matricula && <div className="errmsg">{ehFp.matricula}</div>}
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Turno</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {["1º","2º"].map(t => (
                            <button key={t} onClick={() => setFp(p => ({ ...p, turno: t }))}
                              style={{ flex: 1, padding: "10px", border: `1.5px solid ${fp.turno === t ? C.blue : C.grayMid}`, background: fp.turno === t ? C.bluePale : "white", borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer", color: fp.turno === t ? C.blue : C.grayDark }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Código do Painel</label>
                      <input className={`field ${ehFp.codigo ? "field-err" : ""}`} placeholder="Ex: 35002456" maxLength={8}
                        value={fp.codigo} onChange={e => setFp(p => ({ ...p, codigo: e.target.value.replace(/\D/g, "") }))}
                        style={{ fontFamily: "'DM Mono'", fontSize: 18, fontWeight: 600, letterSpacing: 3 }} />
                      {ehFp.codigo && <div className="errmsg">{ehFp.codigo}</div>}
                      <div style={{ fontSize: 11, color: C.grayDark, marginTop: 4 }}>{fp.codigo.length}/8 dígitos</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Intervalo</label>
                      <select className="field" value={fp.intervalo} onChange={e => setFp(p => ({ ...p, intervalo: e.target.value }))} style={{ fontFamily: "'DM Mono'", fontWeight: 600 }}>
                        {INTERVALOS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 8 }}>Tipo</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className={`tog ${fp.tipo === "novo" ? "novo" : ""}`} onClick={() => setFp(p => ({ ...p, tipo: "novo" }))}>✦ Novo</button>
                        <button className={`tog ${fp.tipo === "retrabalho" ? "ret" : ""}`} onClick={() => setFp(p => ({ ...p, tipo: "retrabalho" }))}>↺ Retrabalho</button>
                      </div>
                    </div>
                    {fp.tipo === "retrabalho" && (
                      <div style={{ background: C.warningLight, borderRadius: 10, padding: 14, border: `1.5px solid ${C.warning}`, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: C.warning, display: "block", marginBottom: 6 }}>Tipo do defeito anterior</label>
                          <select className="field" value={fp.motivo} onChange={e => setFp(p => ({ ...p, motivo: e.target.value }))}>
                            <option value="">Selecione</option>
                            <option value="dobras">Dobras</option>
                            <option value="mole">Painel Mole</option>
                            <option value="dobras e mole">Dobras e Mole</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: C.warning, display: "block", marginBottom: 6 }}>Descrição do problema</label>
                          <textarea className="field" rows={3} placeholder="Descreva o que aconteceu..." value={fp.descricao} onChange={e => setFp(p => ({ ...p, descricao: e.target.value }))} style={{ resize: "vertical" }} />
                        </div>
                      </div>
                    )}
                    <div style={{ borderTop: `1px solid ${C.gray}`, paddingTop: 14 }}>
                      <div className="lbl" style={{ color: C.danger }}>Resultado</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        {[["rep_dobras","Dobras"],["rep_mole","Mole"],["amostras","Amostras"]].map(([k,l]) => (
                          <div key={k}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 5 }}>{l}</label>
                            <input className="field" type="number" min="0" placeholder="0" value={fp[k]} onChange={e => setFp(p => ({ ...p, [k]: e.target.value }))} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: C.gray, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.grayDark }}>📅 Data: <strong style={{ color: C.text }}>{hoje}</strong></div>
                    <button className="btn" onClick={salvarPainel}>Confirmar Registro</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {tela === "historico" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: `1px solid ${C.gray}`, padding: "0 20px" }}>
              <button className={`tab ${abaHist === "hora" ? "on" : ""}`} onClick={() => setAbaHist("hora")}>📋 Por Hora</button>
              <button className={`tab ${abaHist === "painel" ? "on" : ""}`} onClick={() => setAbaHist("painel")}>🔲 Por Painel</button>
            </div>
            <div style={{ padding: 20, overflowX: "auto" }}>
              {abaHist === "hora" && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.gray}` }}>
                      {["Intervalo","Data","Turno","Matrícula","Cortados","Embolsados","Autoclave","Aprovados","Reprov.","Amostras","Observação"].map(h => (
                        <th key={h} style={{ padding: "10px 10px", textAlign: "left", color: C.grayDark, fontWeight: 600, fontSize: 11, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horas.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.gray}`, background: i % 2 === 0 ? "white" : C.gray }}>
                        <td style={{ padding: "10px", fontFamily: "'DM Mono'", fontWeight: 600, color: C.blue, whiteSpace: "nowrap" }}>{r.intervalo}</td>
                        <td style={{ padding: "10px" }}>{r.data}</td>
                        <td style={{ padding: "10px" }}><Tag bg={C.bluePale} color={C.blue}>{r.turno}</Tag></td>
                        <td style={{ padding: "10px", fontFamily: "'DM Mono'" }}>#{r.matricula}</td>
                        <td style={{ padding: "10px" }}>{r.cortados}</td>
                        <td style={{ padding: "10px" }}>{r.embolsados}</td>
                        <td style={{ padding: "10px" }}>{r.autoclave}</td>
                        <td style={{ padding: "10px" }}><span style={{ color: C.success, fontWeight: 600 }}>{r.aprovados}</span></td>
                        <td style={{ padding: "10px" }}><span style={{ color: r.reprovados > 0 ? C.danger : C.grayDark, fontWeight: r.reprovados > 0 ? 600 : 400 }}>{r.reprovados}</span></td>
                        <td style={{ padding: "10px" }}>{r.amostras || "—"}</td>
                        <td style={{ padding: "10px", maxWidth: 180 }}>{r.observacao ? <span style={{ fontSize: 12, color: C.warning, background: C.warningLight, padding: "3px 8px", borderRadius: 6 }}>📝 {r.observacao}</span> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {abaHist === "painel" && (
                <>
                  <div style={{ fontSize: 13, color: C.grayDark, marginBottom: 14 }}>Clique para ver histórico completo do painel</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.gray}` }}>
                        {["Código","Data","Turno","Intervalo","Matrícula","Tipo","Status","Defeito","Amostras"].map(h => (
                          <th key={h} style={{ padding: "10px", textAlign: "left", color: C.grayDark, fontWeight: 600, fontSize: 11, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paineis.map((r, i) => (
                        <tr key={i} className="cr" style={{ borderBottom: `1px solid ${C.gray}` }} onClick={() => { setPainelSel(r.codigo); setTela("paineis"); }}>
                          <td style={{ padding: "10px" }}><span style={{ fontFamily: "'DM Mono'", fontWeight: 600, color: C.blue }}>{r.codigo}</span></td>
                          <td style={{ padding: "10px" }}>{r.data}</td>
                          <td style={{ padding: "10px" }}><Tag bg={C.bluePale} color={C.blue}>{r.turno}</Tag></td>
                          <td style={{ padding: "10px", fontFamily: "'DM Mono'", fontSize: 12, whiteSpace: "nowrap" }}>{r.intervalo}</td>
                          <td style={{ padding: "10px", fontFamily: "'DM Mono'" }}>#{r.matricula}</td>
                          <td style={{ padding: "10px" }}><Tag bg={r.tipo === "novo" ? C.successLight : C.warningLight} color={r.tipo === "novo" ? C.success : C.warning}>{r.tipo === "novo" ? "Novo" : "Retrabalho"}</Tag></td>
                          <td style={{ padding: "10px" }}><Tag bg={r.status === "aprovado" ? C.successLight : C.dangerLight} color={r.status === "aprovado" ? C.success : C.danger}>{r.status === "aprovado" ? "✓ Aprovado" : "✗ Reprovado"}</Tag></td>
                          <td style={{ padding: "10px", color: r.defeito ? C.danger : C.grayMid }}>{r.defeito || "—"}</td>
                          <td style={{ padding: "10px" }}>{r.amostras || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PAINÉIS ── */}
        {tela === "paineis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Buscar Painel</div>
              <input className="field" placeholder="Digite o código..." maxLength={8}
                value={busca} onChange={e => setBusca(e.target.value.replace(/\D/g, ""))}
                style={{ fontFamily: "'DM Mono'", marginBottom: 14, letterSpacing: 2 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {codsFiltrados.map(codigo => {
                  const hist = paineis.filter(p => p.codigo === codigo);
                  const ult = hist[hist.length - 1];
                  const ret = hist.filter(p => p.tipo === "retrabalho").length;
                  return (
                    <div key={codigo} className={`prow ${painelSel === codigo ? "sel" : ""}`} onClick={() => setPainelSel(codigo)}>
                      <div>
                        <div style={{ fontFamily: "'DM Mono'", fontWeight: 600, fontSize: 15, color: C.blue }}>{codigo}</div>
                        <div style={{ fontSize: 11, color: C.grayDark, marginTop: 2 }}>{hist[0]?.data} • {hist.length} registro(s)</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <Tag bg={ult?.status === "aprovado" ? C.successLight : C.dangerLight} color={ult?.status === "aprovado" ? C.success : C.danger}>
                          {ult?.status === "aprovado" ? "✓ Aprovado" : "✗ Reprovado"}
                        </Tag>
                        {ret > 0 && <Tag bg={C.warningLight} color={C.warning}>↺ {ret}x retrabalho</Tag>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {painelSel ? (
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, color: C.grayDark, marginBottom: 4 }}>Histórico do Painel</div>
                    <div style={{ fontFamily: "'DM Mono'", fontSize: 22, fontWeight: 700, color: C.blue, letterSpacing: 3 }}>{painelSel}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, textAlign: "center" }}>
                    <div style={{ background: C.gray, borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{histPainel.length}</div>
                      <div style={{ fontSize: 11, color: C.grayDark }}>registros</div>
                    </div>
                    <div style={{ background: C.warningLight, borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.warning }}>{histPainel.filter(p => p.tipo === "retrabalho").length}</div>
                      <div style={{ fontSize: 11, color: C.warning }}>retrabalhos</div>
                    </div>
                  </div>
                </div>
                <div style={{ paddingLeft: 8 }}>
                  {histPainel.map((r, i) => (
                    <div key={i} className="tl">
                      <div className="tldot" style={{ background: r.status === "aprovado" ? C.success : r.tipo === "retrabalho" ? C.warning : C.danger }} />
                      <div style={{ background: C.gray, borderRadius: 12, padding: "14px 16px", marginLeft: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Tag bg={r.tipo === "novo" ? C.successLight : C.warningLight} color={r.tipo === "novo" ? C.success : C.warning}>{r.tipo === "novo" ? "✦ Novo" : "↺ Retrabalho"}</Tag>
                            <Tag bg={r.status === "aprovado" ? C.successLight : C.dangerLight} color={r.status === "aprovado" ? C.success : C.danger}>{r.status === "aprovado" ? "✓ Aprovado" : "✗ Reprovado"}</Tag>
                          </div>
                          <div style={{ fontSize: 12, color: C.grayDark }}>{r.data} • {r.turno} • <span style={{ fontFamily: "'DM Mono'" }}>{r.intervalo}</span> • #{r.matricula}</div>
                        </div>
                        {r.defeito && <div style={{ fontSize: 13, color: C.danger, marginBottom: 4 }}>⚠ Defeito: <strong>{r.defeito}</strong></div>}
                        {r.motivoRetrabalho && <div style={{ fontSize: 13, color: C.warning, marginBottom: 4 }}>↺ Defeito anterior: <strong>{r.motivoRetrabalho}</strong></div>}
                        {r.descricaoRetrabalho && <div style={{ fontSize: 13, color: C.text, background: C.warningLight, borderRadius: 8, padding: "8px 12px", marginTop: 6, borderLeft: `3px solid ${C.warning}` }}>📝 {r.descricaoRetrabalho}</div>}
                        {r.amostras > 0 && <div style={{ fontSize: 13, color: C.purple, marginTop: 6 }}>✂ Amostras: <strong>{r.amostras}</strong></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: 40, color: C.grayDark }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>Selecione um painel acima</div>
              </div>
            )}
          </div>
        )}

        {/* ── AUTOCLAVE ── */}
        {tela === "autoclave" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", background: "white", borderRadius: 12, padding: 4, gap: 4, boxShadow: "0 1px 4px rgba(0,58,140,0.07)" }}>
              {[["dashboard","📊 Visão Geral"],["novo","➕ Novo Ciclo"],["avaliar","✅ Avaliar Retorno"]].map(([k,v]) => (
                <button key={k} className="snav" onClick={() => setAbaAuto(k)}
                  style={{ fontWeight: abaAuto === k ? 700 : 500, background: abaAuto === k ? C.blue : "none", color: abaAuto === k ? "white" : C.grayDark }}>
                  {v}
                </button>
              ))}
            </div>

            {abaAuto === "dashboard" && <AutoclaveVisao ciclos={ciclos} setCicloAvaliando={setCicloAval} setAba={setAbaAuto} />}

            {abaAuto === "novo" && (
              <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Registrar Envio para Autoclave</div>
                    <div style={{ fontSize: 13, color: C.grayDark }}>Preencha os dados do ciclo</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Matrícula</label>
                      <input className="field" placeholder="Ex: 3789" value={fc.matricula} onChange={e => setFc(p => ({ ...p, matricula: e.target.value.replace(/\D/g, "") }))} style={{ fontFamily: "'DM Mono'", fontWeight: 600, letterSpacing: 2 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Data de Envio</label>
                      <input className="field" type="date" value={fc.dataEnvio} onChange={e => setFc(p => ({ ...p, dataEnvio: e.target.value }))} />
                    </div>
                  </div>
                  <button onClick={() => setFc(p => ({ ...p, fimDeSemana: !p.fimDeSemana }))}
                    style={{ padding: "10px 16px", border: `1.5px solid ${fc.fimDeSemana ? C.purple : C.grayMid}`, background: fc.fimDeSemana ? C.purpleLight : "white", borderRadius: 10, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500, cursor: "pointer", color: fc.fimDeSemana ? C.purple : C.grayDark, textAlign: "left" }}>
                    {fc.fimDeSemana ? "✓" : "○"} Ciclo de Fim de Semana
                  </button>
                  <div style={{ borderTop: `1px solid ${C.gray}`, paddingTop: 14 }}>
                    <div className="lbl" style={{ color: C.blue }}>Carrinho — Posição dos Painéis</div>
                    <div style={{ fontSize: 12, color: C.grayDark, marginBottom: 10 }}>Toque em cada espaço para adicionar o código do painel. P1 = prateleira de baixo, P4 = de cima.</div>
                    <Carrinho carrinho={fc.carrinho} setCarrinho={c => setFc(p => ({ ...p, carrinho: c }))} soLeitura={false} resultados={null} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: C.grayDark, display: "block", marginBottom: 6 }}>Observação (opcional)</label>
                    <textarea className="field" rows={2} placeholder="Ex: Carrinhos 1 e 2 enviados juntos..." value={fc.obs} onChange={e => setFc(p => ({ ...p, obs: e.target.value }))} style={{ resize: "vertical" }} />
                  </div>
                  <button className="btn" onClick={salvarCiclo}>Confirmar Envio para Autoclave</button>
                </div>
              </div>
            )}

            {abaAuto === "avaliar" && <AutoclaveAvaliar ciclos={ciclos} setCiclos={setCiclos} cicloAvaliando={cicloAval} setCicloAvaliando={setCicloAval} setAba={setAbaAuto} />}
          </div>
        )}

      </div>
    </div>
  );
}
