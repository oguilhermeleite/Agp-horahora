import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  blue: "#003A8C", blueLight: "#0057D9", bluePale: "#E8F0FB",
  gray: "#F4F6FA", grayMid: "#C8D0DE", grayDark: "#6B7A99",
  success: "#0A7A4B", successLight: "#E6F4EF",
  danger: "#C0392B", dangerLight: "#FDECEA",
  warning: "#D97706", warningLight: "#FFF7ED",
  text: "#0D1B3E", purple: "#6B21A8",
};

const INTERVALOS = [
  "07h → 08h","08h → 09h","09h → 10h","10h → 11h",
  "11h → 12h","12h → 13h","13h → 14h","14h → 15h",
  "15h → 16h","16h → 17h","17h → 18h","18h → 19h",
  "19h → 20h","20h → 21h","21h → 22h","22h → 23h",
];

const dadosDia = [
  { hora: "07-08h", aprovados: 5, reprovados: 1 },
  { hora: "08-09h", aprovados: 0, reprovados: 0 },
  { hora: "09-10h", aprovados: 6, reprovados: 2 },
  { hora: "10-11h", aprovados: 9, reprovados: 1 },
  { hora: "11-12h", aprovados: 5, reprovados: 2 },
  { hora: "12-13h", aprovados: 4, reprovados: 1 },
];
const dadosSemana = [
  { dia: "Seg", aprovados: 42, reprovados: 8 },
  { dia: "Ter", aprovados: 38, reprovados: 12 },
  { dia: "Qua", aprovados: 45, reprovados: 5 },
  { dia: "Qui", aprovados: 30, reprovados: 20 },
  { dia: "Sex", aprovados: 40, reprovados: 10 },
];
const dadosMes = [
  { semana: "S1", aprovados: 180, reprovados: 40 },
  { semana: "S2", aprovados: 195, reprovados: 25 },
  { semana: "S3", aprovados: 160, reprovados: 55 },
  { semana: "S4", aprovados: 210, reprovados: 20 },
];

const totais = { cortados: 52, embolsados: 45, autoclave: 45, aprovados: 37, reprovados: 8, amostras: 14 };
const taxaAprovacao = Math.round((totais.aprovados / totais.autoclave) * 100);
const taxaRejeicao = 100 - taxaAprovacao;

const paineisMock = [
  { codigo: "35002456", data: "10/04/2025", turno: "1º", intervalo: "07h → 08h", tipo: "novo", status: "aprovado", defeito: null, descricaoRetrabalho: null, amostras: 2, matricula: "3789" },
  { codigo: "35002457", data: "10/04/2025", turno: "1º", intervalo: "09h → 10h", tipo: "novo", status: "reprovado", defeito: "dobras", descricaoRetrabalho: null, amostras: 0, matricula: "3789" },
  { codigo: "35002457", data: "10/04/2025", turno: "2º", intervalo: "14h → 15h", tipo: "retrabalho", status: "aprovado", defeito: null, descricaoRetrabalho: "Painel apresentou dobras na região central, possivelmente por empilhamento excessivo antes do embolsamento.", amostras: 1, matricula: "3789", motivoRetrabalho: "dobras" },
  { codigo: "35002458", data: "10/04/2025", turno: "1º", intervalo: "09h → 10h", tipo: "novo", status: "reprovado", defeito: "mole", descricaoRetrabalho: null, amostras: 0, matricula: "3789" },
  { codigo: "35002459", data: "10/04/2025", turno: "1º", intervalo: "10h → 11h", tipo: "novo", status: "aprovado", defeito: null, descricaoRetrabalho: null, amostras: 3, matricula: "3789" },
];

const registrosHoraMock = [
  { intervalo: "07h → 08h", turno: "1º", cortados: 8, embolsados: 6, autoclave: 6, aprovados: 5, reprovados: 1, amostras: 2, matricula: "3789", observacao: null, data: "10/04/2025" },
  { intervalo: "08h → 09h", turno: "1º", cortados: 0, embolsados: 0, autoclave: 0, aprovados: 0, reprovados: 0, amostras: 0, matricula: "3789", observacao: "Reunião de alinhamento de produção com supervisor.", data: "10/04/2025" },
  { intervalo: "09h → 10h", turno: "1º", cortados: 10, embolsados: 9, autoclave: 9, aprovados: 8, reprovados: 1, amostras: 3, matricula: "3789", observacao: null, data: "10/04/2025" },
];

const ciclosMock = [
  {
    id: "C001", dataEnvio: "10/04/2025", dataRetorno: "11/04/2025",
    matricula: "3789", fimDeSemana: false, observacao: null,
    paineis: [
      { codigo: "35002456", reprocesso: false, resultado: "aprovado", defeito: null },
      { codigo: "35002457", reprocesso: false, resultado: "reprovado", defeito: "dobras" },
      { codigo: "35002458", reprocesso: true, resultado: "aprovado", defeito: null },
      { codigo: "35002459", reprocesso: false, resultado: "aprovado", defeito: null },
      { codigo: "35002460", reprocesso: false, resultado: "reprovado", defeito: "mole" },
    ],
    avaliado: true,
  },
  {
    id: "C002", dataEnvio: "11/04/2025", dataRetorno: "12/04/2025",
    matricula: "3789", fimDeSemana: false, observacao: null,
    paineis: [
      { codigo: "35002461", reprocesso: false, resultado: null, defeito: null },
      { codigo: "35002462", reprocesso: false, resultado: null, defeito: null },
      { codigo: "35002463", reprocesso: true, resultado: null, defeito: null },
    ],
    avaliado: false,
  },
];

const FORM_CICLO_INICIAL = { matricula: "", dataEnvio: "", fimDeSemana: false, observacao: "", paineis: [] };

const FORM_HORA_INICIAL = { matricula: "", turno: "1º", intervalo: "07h → 08h", cortados: "", embolsados: "", autoclave: "", aprovados: "", reprovados_dobras: "", reprovados_mole: "", amostras: "", observacao: "" };
const FORM_PAINEL_INICIAL = { matricula: "", turno: "1º", codigo: "", tipo: "novo", intervalo: "07h → 08h", reprovados_dobras: "", reprovados_mole: "", amostras: "", motivoRetrabalho: "", descricaoRetrabalho: "" };

export default function AGPHoraHora() {
  const [tela, setTela] = useState("dashboard");
  const [abaReg, setAbaReg] = useState("hora");
  const [abaHist, setAbaHist] = useState("hora");
  const [periodo, setPeriodo] = useState("dia");
  const [painelSelecionado, setPainelSelecionado] = useState(null);
  const [buscaCodigo, setBuscaCodigo] = useState("");
  const [registrosPaineis, setRegistrosPaineis] = useState(paineisMock);
  const [registrosHora, setRegistrosHora] = useState(registrosHoraMock);
  const [sucesso, setSucesso] = useState(false);
  const [errosHora, setErrosHora] = useState({});
  const [errosPainel, setErrosPainel] = useState({});
  const [ciclos, setCiclos] = useState(ciclosMock);
  const [formCiclo, setFormCiclo] = useState(FORM_CICLO_INICIAL);
  const [novoCodigo, setNovoCodigo] = useState("");
  const [cicloAvaliando, setCicloAvaliando] = useState(null);
  const [abaAutoclave, setAbaAutoclave] = useState("dashboard");

  const [formPainel, setFormPainel] = useState(FORM_PAINEL_INICIAL);
  const hoje = new Date().toLocaleDateString("pt-BR");

  const zeroProd = !formHora.cortados && !formHora.embolsados && !formHora.autoclave && !formHora.aprovados;

  const validarHora = () => {
    const e = {};
    if (!formHora.matricula) e.matricula = "Informe a matrícula";
    if (zeroProd && !formHora.observacao) e.observacao = "Produção zerada — informe o motivo";
    setErrosHora(e);
    return Object.keys(e).length === 0;
  };

  const validarPainel = () => {
    const e = {};
    if (!formPainel.matricula) e.matricula = "Informe a matrícula";
    if (!/^\d{8}$/.test(formPainel.codigo)) e.codigo = "Código deve ter exatamente 8 números";
    setErrosPainel(e);
    return Object.keys(e).length === 0;
  };

  const handleRegistroHora = () => {
    if (!validarHora()) return;
    const reprovados = (Number(formHora.reprovados_dobras) || 0) + (Number(formHora.reprovados_mole) || 0);
    setRegistrosHora([...registrosHora, {
      intervalo: formHora.intervalo, turno: formHora.turno,
      cortados: Number(formHora.cortados) || 0,
      embolsados: Number(formHora.embolsados) || 0,
      autoclave: Number(formHora.autoclave) || 0,
      aprovados: Number(formHora.aprovados) || 0,
      reprovados, amostras: Number(formHora.amostras) || 0,
      matricula: formHora.matricula,
      observacao: formHora.observacao || null,
      data: hoje,
    }]);
    setFormHora(FORM_HORA_INICIAL);
    setErrosHora({});
    setSucesso("hora");
    setTimeout(() => setSucesso(false), 3000);
  };

  const handleRegistroPainel = () => {
    if (!validarPainel()) return;
    const reprovados_d = Number(formPainel.reprovados_dobras) || 0;
    const reprovados_m = Number(formPainel.reprovados_mole) || 0;
    const reprovados = reprovados_d + reprovados_m;
    const status = reprovados > 0 ? "reprovado" : "aprovado";
    const defeito = reprovados_d > 0 && reprovados_m > 0 ? "dobras e mole" : reprovados_d > 0 ? "dobras" : reprovados_m > 0 ? "mole" : null;
    setRegistrosPaineis([...registrosPaineis, {
      codigo: formPainel.codigo, data: hoje,
      turno: formPainel.turno, intervalo: formPainel.intervalo,
      tipo: formPainel.tipo, status, defeito,
      descricaoRetrabalho: formPainel.tipo === "retrabalho" ? formPainel.descricaoRetrabalho : null,
      motivoRetrabalho: formPainel.tipo === "retrabalho" ? formPainel.motivoRetrabalho : null,
      amostras: Number(formPainel.amostras) || 0,
      matricula: formPainel.matricula,
    }]);
    setFormPainel(FORM_PAINEL_INICIAL);
    setErrosPainel({});
    setSucesso("painel");
    setTimeout(() => setSucesso(false), 3000);
  };

  const codigosUnicos = [...new Set(registrosPaineis.map(r => r.codigo))];
  const codigosFiltrados = codigosUnicos.filter(c => c.includes(buscaCodigo));
  const historicoDoPanel = painelSelecionado ? registrosPaineis.filter(r => r.codigo === painelSelecionado) : [];
  const dadosGrafico = periodo === "dia" ? dadosDia : periodo === "semana" ? dadosSemana : dadosMes;
  const xKey = periodo === "dia" ? "hora" : periodo === "semana" ? "dia" : "semana";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: COLORS.gray, minHeight: "100vh", color: COLORS.text, overflowX: "hidden", maxWidth: "100vw" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,58,140,0.07); }
        .nav-btn { background: none; border: none; cursor: pointer; padding: 10px 16px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; }
        .input-field { width: 100%; padding: 10px 14px; border: 1.5px solid ${COLORS.grayMid}; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px; color: ${COLORS.text}; outline: none; background: white; transition: border 0.2s; }
        .input-field:focus { border-color: ${COLORS.blueLight}; }
        .input-error { border-color: ${COLORS.danger} !important; }
        .btn-primary { background: ${COLORS.blue}; color: white; border: none; padding: 12px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; }
        .btn-primary:hover { background: ${COLORS.blueLight}; }
        .periodo-btn { background: none; border: 1.5px solid ${COLORS.grayMid}; cursor: pointer; padding: 7px 16px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: ${COLORS.grayDark}; }
        .periodo-btn.active { background: ${COLORS.blue}; border-color: ${COLORS.blue}; color: white; }
        .tag { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        .toggle-btn { flex: 1; padding: 10px; border: 1.5px solid ${COLORS.grayMid}; background: white; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; color: ${COLORS.grayDark}; }
        .toggle-btn.active-novo { background: ${COLORS.successLight}; border-color: ${COLORS.success}; color: ${COLORS.success}; }
        .toggle-btn.active-retrabalho { background: ${COLORS.warningLight}; border-color: ${COLORS.warning}; color: ${COLORS.warning}; }
        .erro-msg { font-size: 11px; color: ${COLORS.danger}; margin-top: 4px; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 12px 20px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; border-bottom: 2.5px solid transparent; color: ${COLORS.grayDark}; }
        .tab-btn.active { border-bottom-color: ${COLORS.blue}; color: ${COLORS.blue}; font-weight: 600; }
        .painel-row { padding: 12px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border: 1.5px solid transparent; transition: all 0.15s; }
        .painel-row:hover { background: ${COLORS.bluePale}; border-color: ${COLORS.blueLight}; }
        .painel-row.selected { background: ${COLORS.bluePale}; border-color: ${COLORS.blue}; }
        .timeline-item { position: relative; padding-left: 24px; padding-bottom: 20px; }
        .timeline-item::before { content: ''; position: absolute; left: 7px; top: 20px; bottom: 0; width: 2px; background: ${COLORS.grayMid}; }
        .timeline-item:last-child::before { display: none; }
        .timeline-dot { position: absolute; left: 0; top: 6px; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; }
        .section-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        tr.clickable:hover td { background: ${COLORS.bluePale} !important; cursor: pointer; }
      `}</style>

      {/* Header */}
      <div style={{ background: COLORS.blue, overflowX: "hidden" }}>
        {/* Top bar */}
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", padding: "10px 16px", gap: 14 }}>
          {/* AGP sGlass real logo */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="https://agpglass.com/wp-content/themes/agp/assets/images/logo_sglass_2026_white.png" alt="AGP sGlass" style={{ height: 40, width: "auto" }} />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>HoraHora Opaco</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Controle de Produção — Mantas de Aramida</div>
          </div>
        </div>
        {/* Nav tabs */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.15)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {[["dashboard","📊 Dashboard"],["registro","✏️ Registrar"],["historico","📋 Histórico"],["paineis","🔲 Painéis"],["autoclave","🔥 Autoclave"]].map(([k,v]) => (
            <button key={k} onClick={() => setTela(k)}
              style={{ flex: 1, background: "none", border: "none", borderBottom: tela === k ? "3px solid white" : "3px solid transparent", cursor: "pointer", padding: "10px 4px", fontFamily: "'DM Sans'", fontSize: 12, fontWeight: tela === k ? 700 : 500, color: tela === k ? "white" : "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 12px", width: "100%", boxSizing: "border-box" }}>

        {/* DASHBOARD */}
        {tela === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: "Cortados", valor: totais.cortados, cor: COLORS.blue },
                { label: "Embolsados", valor: totais.embolsados, cor: COLORS.blueLight },
                { label: "Autoclave", valor: totais.autoclave, cor: COLORS.warning },
                { label: "Aprovados", valor: totais.aprovados, cor: COLORS.success },
                { label: "Reprovados", valor: totais.reprovados, cor: COLORS.danger },
                { label: "Amostras", valor: totais.amostras, cor: COLORS.purple },
              ].map(({ label, valor, cor }) => (
                <div key={label} className="card" style={{ textAlign: "center", padding: "18px 12px", borderTop: `3px solid ${cor}` }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: cor }}>{valor}</div>
                  <div style={{ fontSize: 12, color: COLORS.grayDark, marginTop: 4, fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 13, color: COLORS.grayDark, fontWeight: 500 }}>Taxa de Aprovação — Autoclave</div>
                <div style={{ position: "relative", width: 120, height: 120 }}>
                  <svg viewBox="0 0 120 120" width="120" height="120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke={COLORS.dangerLight} strokeWidth="12" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={COLORS.success} strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 50 * taxaAprovacao / 100} ${2 * Math.PI * 50}`}
                      strokeLinecap="round" transform="rotate(-90 60 60)" />
                  </svg>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.success }}>{taxaAprovacao}%</div>
                    <div style={{ fontSize: 10, color: COLORS.grayDark }}>aprovação</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.success }}>{totais.aprovados}</div>
                    <div style={{ fontSize: 11, color: COLORS.grayDark }}>bons</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.danger }}>{totais.reprovados}</div>
                    <div style={{ fontSize: 11, color: COLORS.grayDark }}>ruins</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.grayDark, marginBottom: 20 }}>Fluxo de Produção — Turno Atual</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { label: "Corte", valor: totais.cortados, cor: COLORS.blue },
                    { seta: true },
                    { label: "Embolsa", valor: totais.embolsados, cor: COLORS.blueLight },
                    { seta: true },
                    { label: "Autoclave", valor: totais.autoclave, cor: COLORS.warning },
                    { seta: true },
                    { label: "Aprovados", valor: totais.aprovados, cor: COLORS.success },
                    { seta: true },
                    { label: "Amostras", valor: totais.amostras, cor: COLORS.purple },
                  ].map((item, i) => item.seta ? (
                    <div key={i} style={{ color: COLORS.grayMid, fontSize: 20 }}>→</div>
                  ) : (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: item.cor + "18", border: `2.5px solid ${item.cor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: item.cor }}>{item.valor}</span>
                      </div>
                      <span style={{ fontSize: 11, color: COLORS.grayDark, fontWeight: 500 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: "10px 16px", background: COLORS.dangerLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: COLORS.danger, fontWeight: 500 }}>⚠ Reprovados: {totais.reprovados} painéis ({taxaRejeicao}% de rejeição)</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className="tag" style={{ background: COLORS.dangerLight, color: COLORS.danger }}>Dobras: {Math.ceil(totais.reprovados * 0.6)}</span>
                    <span className="tag" style={{ background: COLORS.warningLight, color: COLORS.warning }}>Mole: {Math.floor(totais.reprovados * 0.4)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Produção por período</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["dia","Dia"],["semana","Semana"],["mes","Mês"]].map(([k,v]) => (
                    <button key={k} className={`periodo-btn ${periodo === k ? "active" : ""}`} onClick={() => setPeriodo(k)}>{v}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dadosGrafico} barGap={4} margin={{ bottom: 30 }}>
                  <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: COLORS.grayDark, angle: -35, textAnchor: "end", dy: 8 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 12, fill: COLORS.grayDark }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontFamily: "'DM Sans'" }} />
                  <Bar dataKey="aprovados" name="Aprovados" fill="#4A7FA5" radius={[6,6,0,0]} />
                  <Bar dataKey="reprovados" name="Reprovados" fill={COLORS.danger} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* REGISTRO */}
        {tela === "registro" && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.gray}`, padding: "0 24px" }}>
                <button className={`tab-btn ${abaReg === "hora" ? "active" : ""}`} onClick={() => setAbaReg("hora")}>📋 Registro por Hora</button>
                <button className={`tab-btn ${abaReg === "painel" ? "active" : ""}`} onClick={() => setAbaReg("painel")}>🔲 Registro de Painel</button>
              </div>

              <div style={{ padding: 24 }}>
                {sucesso && (
                  <div style={{ background: COLORS.successLight, border: `1.5px solid ${COLORS.success}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: COLORS.success, fontWeight: 500, fontSize: 14 }}>
                    ✓ Registro salvo com sucesso!
                  </div>
                )}

                {/* HORA */}
                {abaReg === "hora" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Matrícula + Turno */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Matrícula do Operador</label>
                        <input className={`input-field ${errosHora.matricula ? "input-error" : ""}`} placeholder="Ex: 3789"
                          value={formHora.matricula} onChange={e => setFormHora({ ...formHora, matricula: e.target.value.replace(/\D/g, "") })}
                          style={{ fontFamily: "'DM Mono'", fontWeight: 600, letterSpacing: 2 }} />
                        {errosHora.matricula && <div className="erro-msg">{errosHora.matricula}</div>}
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Turno</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[["1º","1º"],["2º","2º"]].map(([v,l]) => (
                            <button key={v} onClick={() => setFormHora({ ...formHora, turno: v })}
                              style={{ flex: 1, padding: "10px", border: `1.5px solid ${formHora.turno === v ? COLORS.blue : COLORS.grayMid}`, background: formHora.turno === v ? COLORS.bluePale : "white", borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer", color: formHora.turno === v ? COLORS.blue : COLORS.grayDark }}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Intervalo */}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Intervalo de Hora</label>
                      <select className="input-field" value={formHora.intervalo} onChange={e => setFormHora({ ...formHora, intervalo: e.target.value })}
                        style={{ fontFamily: "'DM Mono'", fontWeight: 600 }}>
                        {INTERVALOS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>

                    {/* Produção */}
                    <div style={{ borderTop: `1px solid ${COLORS.gray}`, paddingTop: 16 }}>
                      <div className="section-label" style={{ color: COLORS.blue }}>Produção</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[["cortados","Painéis Cortados"],["embolsados","Painéis Embolsados"],["autoclave","Enviados Autoclave"],["aprovados","Aprovados"],["amostras","Amostras Cortadas"]].map(([k,label]) => (
                          <div key={k}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>{label}</label>
                            <input className="input-field" type="number" min="0" placeholder="0"
                              value={formHora[k]} onChange={e => setFormHora({ ...formHora, [k]: e.target.value })} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reprovados */}
                    <div style={{ borderTop: `1px solid ${COLORS.gray}`, paddingTop: 16 }}>
                      <div className="section-label" style={{ color: COLORS.danger }}>Reprovados</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Defeito — Dobras</label>
                          <input className="input-field" type="number" min="0" placeholder="0"
                            value={formHora.reprovados_dobras} onChange={e => setFormHora({ ...formHora, reprovados_dobras: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Defeito — Mole</label>
                          <input className="input-field" type="number" min="0" placeholder="0"
                            value={formHora.reprovados_mole} onChange={e => setFormHora({ ...formHora, reprovados_mole: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    {/* Observação */}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: zeroProd ? COLORS.danger : COLORS.grayDark, display: "block", marginBottom: 6 }}>
                        {zeroProd ? "⚠ Motivo da parada (obrigatório)" : "Observação (opcional)"}
                      </label>
                      <textarea className={`input-field ${errosHora.observacao ? "input-error" : ""}`} rows={3}
                        placeholder={zeroProd ? "Ex: Reunião de turno, manutenção preventiva, aguardando material..." : "Ex: Início de turno com ritmo reduzido..."}
                        value={formHora.observacao} onChange={e => setFormHora({ ...formHora, observacao: e.target.value })}
                        style={{ resize: "vertical" }} />
                      {errosHora.observacao && <div className="erro-msg">{errosHora.observacao}</div>}
                    </div>

                    <div style={{ background: COLORS.gray, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: COLORS.grayDark }}>
                      📅 Data: <strong style={{ color: COLORS.text }}>{hoje}</strong>
                    </div>

                    <button className="btn-primary" onClick={handleRegistroHora}>Confirmar Registro</button>
                  </div>
                )}

                {/* PAINEL */}
                {abaReg === "painel" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Matrícula + Turno */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Matrícula do Operador</label>
                        <input className={`input-field ${errosPainel.matricula ? "input-error" : ""}`} placeholder="Ex: 3789"
                          value={formPainel.matricula} onChange={e => setFormPainel({ ...formPainel, matricula: e.target.value.replace(/\D/g, "") })}
                          style={{ fontFamily: "'DM Mono'", fontWeight: 600, letterSpacing: 2 }} />
                        {errosPainel.matricula && <div className="erro-msg">{errosPainel.matricula}</div>}
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Turno</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[["1º","1º"],["2º","2º"]].map(([v,l]) => (
                            <button key={v} onClick={() => setFormPainel({ ...formPainel, turno: v })}
                              style={{ flex: 1, padding: "10px", border: `1.5px solid ${formPainel.turno === v ? COLORS.blue : COLORS.grayMid}`, background: formPainel.turno === v ? COLORS.bluePale : "white", borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer", color: formPainel.turno === v ? COLORS.blue : COLORS.grayDark }}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Código */}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Código do Painel</label>
                      <input className={`input-field ${errosPainel.codigo ? "input-error" : ""}`} placeholder="Ex: 35002456" maxLength={8}
                        value={formPainel.codigo} onChange={e => setFormPainel({ ...formPainel, codigo: e.target.value.replace(/\D/g, "") })}
                        style={{ fontFamily: "'DM Mono'", fontSize: 18, fontWeight: 600, letterSpacing: 3 }} />
                      {errosPainel.codigo && <div className="erro-msg">{errosPainel.codigo}</div>}
                      <div style={{ fontSize: 11, color: COLORS.grayDark, marginTop: 4 }}>{formPainel.codigo.length}/8 dígitos</div>
                    </div>

                    {/* Intervalo */}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Intervalo de Hora</label>
                      <select className="input-field" value={formPainel.intervalo} onChange={e => setFormPainel({ ...formPainel, intervalo: e.target.value })}
                        style={{ fontFamily: "'DM Mono'", fontWeight: 600 }}>
                        {INTERVALOS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>

                    {/* Tipo */}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 8 }}>Tipo de Painel</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className={`toggle-btn ${formPainel.tipo === "novo" ? "active-novo" : ""}`} onClick={() => setFormPainel({ ...formPainel, tipo: "novo" })}>✦ Painel Novo</button>
                        <button className={`toggle-btn ${formPainel.tipo === "retrabalho" ? "active-retrabalho" : ""}`} onClick={() => setFormPainel({ ...formPainel, tipo: "retrabalho" })}>↺ Retrabalho</button>
                      </div>
                    </div>

                    {/* Retrabalho */}
                    {formPainel.tipo === "retrabalho" && (
                      <div style={{ background: COLORS.warningLight, borderRadius: 10, padding: 14, border: `1.5px solid ${COLORS.warning}`, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.warning, display: "block", marginBottom: 6 }}>Tipo do defeito anterior</label>
                          <select className="input-field" value={formPainel.motivoRetrabalho} onChange={e => setFormPainel({ ...formPainel, motivoRetrabalho: e.target.value })}>
                            <option value="">Selecione</option>
                            <option value="dobras">Dobras</option>
                            <option value="mole">Painel Mole</option>
                            <option value="dobras e mole">Dobras e Mole</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.warning, display: "block", marginBottom: 6 }}>Descrição do problema</label>
                          <textarea className="input-field" rows={3}
                            placeholder="Descreva o que aconteceu com esse painel e o que foi feito no retrabalho..."
                            value={formPainel.descricaoRetrabalho} onChange={e => setFormPainel({ ...formPainel, descricaoRetrabalho: e.target.value })}
                            style={{ resize: "vertical" }} />
                        </div>
                      </div>
                    )}

                    {/* Resultado */}
                    <div style={{ borderTop: `1px solid ${COLORS.gray}`, paddingTop: 16 }}>
                      <div className="section-label" style={{ color: COLORS.danger }}>Resultado</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {[["reprovados_dobras","Reprovado — Dobras"],["reprovados_mole","Reprovado — Mole"],["amostras","Amostras Cortadas"]].map(([k,label]) => (
                          <div key={k}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>{label}</label>
                            <input className="input-field" type="number" min="0" placeholder="0"
                              value={formPainel[k]} onChange={e => setFormPainel({ ...formPainel, [k]: e.target.value })} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: COLORS.gray, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: COLORS.grayDark }}>
                      📅 Data: <strong style={{ color: COLORS.text }}>{hoje}</strong>
                    </div>

                    <button className="btn-primary" onClick={handleRegistroPainel}>Confirmar Registro</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HISTÓRICO */}
        {tela === "historico" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.gray}`, padding: "0 24px" }}>
              <button className={`tab-btn ${abaHist === "hora" ? "active" : ""}`} onClick={() => setAbaHist("hora")}>📋 Por Hora</button>
              <button className={`tab-btn ${abaHist === "painel" ? "active" : ""}`} onClick={() => setAbaHist("painel")}>🔲 Por Painel</button>
            </div>
            <div style={{ padding: 24, overflowX: "auto" }}>
              {abaHist === "hora" && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${COLORS.gray}` }}>
                      {["Intervalo","Data","Turno","Matrícula","Cortados","Embolsados","Autoclave","Aprovados","Reprovados","Amostras","Observação"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: COLORS.grayDark, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrosHora.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${COLORS.gray}`, background: i % 2 === 0 ? "white" : COLORS.gray }}>
                        <td style={{ padding: "12px", fontFamily: "'DM Mono'", fontWeight: 600, color: COLORS.blue, whiteSpace: "nowrap" }}>{r.intervalo}</td>
                        <td style={{ padding: "12px" }}>{r.data}</td>
                        <td style={{ padding: "12px" }}><span className="tag" style={{ background: COLORS.bluePale, color: COLORS.blue }}>{r.turno}</span></td>
                        <td style={{ padding: "12px", fontFamily: "'DM Mono'" }}>#{r.matricula}</td>
                        <td style={{ padding: "12px" }}>{r.cortados}</td>
                        <td style={{ padding: "12px" }}>{r.embolsados}</td>
                        <td style={{ padding: "12px" }}>{r.autoclave}</td>
                        <td style={{ padding: "12px" }}><span style={{ color: COLORS.success, fontWeight: 600 }}>{r.aprovados}</span></td>
                        <td style={{ padding: "12px" }}><span style={{ color: r.reprovados > 0 ? COLORS.danger : COLORS.grayDark, fontWeight: r.reprovados > 0 ? 600 : 400 }}>{r.reprovados}</span></td>
                        <td style={{ padding: "12px" }}>{r.amostras || "—"}</td>
                        <td style={{ padding: "12px", maxWidth: 200 }}>
                          {r.observacao
                            ? <span style={{ fontSize: 12, color: COLORS.warning, background: COLORS.warningLight, padding: "3px 8px", borderRadius: 6 }}>📝 {r.observacao}</span>
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {abaHist === "painel" && (
                <>
                  <div style={{ fontSize: 13, color: COLORS.grayDark, marginBottom: 16 }}>Clique em um registro para ver o histórico completo do painel</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${COLORS.gray}` }}>
                        {["Código","Data","Turno","Intervalo","Matrícula","Tipo","Status","Defeito","Amostras"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: COLORS.grayDark, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {registrosPaineis.map((r, i) => (
                        <tr key={i} className="clickable" style={{ borderBottom: `1px solid ${COLORS.gray}` }}
                          onClick={() => { setPainelSelecionado(r.codigo); setTela("paineis"); }}>
                          <td style={{ padding: "12px" }}><span style={{ fontFamily: "'DM Mono'", fontWeight: 600, color: COLORS.blue }}>{r.codigo}</span></td>
                          <td style={{ padding: "12px" }}>{r.data}</td>
                          <td style={{ padding: "12px" }}><span className="tag" style={{ background: COLORS.bluePale, color: COLORS.blue }}>{r.turno}</span></td>
                          <td style={{ padding: "12px", fontFamily: "'DM Mono'", fontSize: 12, whiteSpace: "nowrap" }}>{r.intervalo}</td>
                          <td style={{ padding: "12px", fontFamily: "'DM Mono'" }}>#{r.matricula}</td>
                          <td style={{ padding: "12px" }}>
                            <span className="tag" style={{ background: r.tipo === "novo" ? COLORS.successLight : COLORS.warningLight, color: r.tipo === "novo" ? COLORS.success : COLORS.warning }}>
                              {r.tipo === "novo" ? "Novo" : "Retrabalho"}
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span className="tag" style={{ background: r.status === "aprovado" ? COLORS.successLight : COLORS.dangerLight, color: r.status === "aprovado" ? COLORS.success : COLORS.danger }}>
                              {r.status === "aprovado" ? "✓ Aprovado" : "✗ Reprovado"}
                            </span>
                          </td>
                          <td style={{ padding: "12px", color: r.defeito ? COLORS.danger : COLORS.grayMid }}>{r.defeito || "—"}</td>
                          <td style={{ padding: "12px" }}>{r.amostras || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}

        {/* PAINÉIS */}
        {tela === "paineis" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
            <div className="card" style={{ height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Buscar Painel</div>
              <input className="input-field" placeholder="Digite o código..." maxLength={8}
                value={buscaCodigo} onChange={e => setBuscaCodigo(e.target.value.replace(/\D/g, ""))}
                style={{ fontFamily: "'DM Mono'", marginBottom: 14, letterSpacing: 2 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {codigosFiltrados.map(codigo => {
                  const hist = registrosPaineis.filter(r => r.codigo === codigo);
                  const ultimo = hist[hist.length - 1];
                  const retrabalhos = hist.filter(r => r.tipo === "retrabalho").length;
                  return (
                    <div key={codigo} className={`painel-row ${painelSelecionado === codigo ? "selected" : ""}`}
                      onClick={() => setPainelSelecionado(codigo)}>
                      <div>
                        <div style={{ fontFamily: "'DM Mono'", fontWeight: 600, fontSize: 15, color: COLORS.blue }}>{codigo}</div>
                        <div style={{ fontSize: 11, color: COLORS.grayDark, marginTop: 2 }}>{hist[0]?.data} • {hist.length} registro{hist.length > 1 ? "s" : ""}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span className="tag" style={{ background: ultimo?.status === "aprovado" ? COLORS.successLight : COLORS.dangerLight, color: ultimo?.status === "aprovado" ? COLORS.success : COLORS.danger, fontSize: 11 }}>
                          {ultimo?.status === "aprovado" ? "✓ Aprovado" : "✗ Reprovado"}
                        </span>
                        {retrabalhos > 0 && <span className="tag" style={{ background: COLORS.warningLight, color: COLORS.warning, fontSize: 10 }}>↺ {retrabalhos}x retrabalho</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              {painelSelecionado ? (
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: 13, color: COLORS.grayDark, marginBottom: 4 }}>Histórico do Painel</div>
                      <div style={{ fontFamily: "'DM Mono'", fontSize: 26, fontWeight: 700, color: COLORS.blue, letterSpacing: 3 }}>{painelSelecionado}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12, textAlign: "center" }}>
                      <div style={{ background: COLORS.gray, borderRadius: 10, padding: "10px 16px" }}>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{historicoDoPanel.length}</div>
                        <div style={{ fontSize: 11, color: COLORS.grayDark }}>registros</div>
                      </div>
                      <div style={{ background: COLORS.warningLight, borderRadius: 10, padding: "10px 16px" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.warning }}>{historicoDoPanel.filter(r => r.tipo === "retrabalho").length}</div>
                        <div style={{ fontSize: 11, color: COLORS.warning }}>retrabalhos</div>
                      </div>
                      <div style={{ background: historicoDoPanel[historicoDoPanel.length-1]?.status === "aprovado" ? COLORS.successLight : COLORS.dangerLight, borderRadius: 10, padding: "10px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: historicoDoPanel[historicoDoPanel.length-1]?.status === "aprovado" ? COLORS.success : COLORS.danger }}>
                          {historicoDoPanel[historicoDoPanel.length-1]?.status === "aprovado" ? "✓ Aprovado" : "✗ Reprovado"}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.grayDark }}>status atual</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ paddingLeft: 8 }}>
                    {historicoDoPanel.map((r, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot" style={{ background: r.status === "aprovado" ? COLORS.success : r.tipo === "retrabalho" ? COLORS.warning : COLORS.danger }} />
                        <div style={{ background: COLORS.gray, borderRadius: 12, padding: "14px 16px", marginLeft: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <span className="tag" style={{ background: r.tipo === "novo" ? COLORS.successLight : COLORS.warningLight, color: r.tipo === "novo" ? COLORS.success : COLORS.warning }}>
                                {r.tipo === "novo" ? "✦ Novo" : "↺ Retrabalho"}
                              </span>
                              <span className="tag" style={{ background: r.status === "aprovado" ? COLORS.successLight : COLORS.dangerLight, color: r.status === "aprovado" ? COLORS.success : COLORS.danger }}>
                                {r.status === "aprovado" ? "✓ Aprovado" : "✗ Reprovado"}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: COLORS.grayDark }}>
                              {r.data} • {r.turno} turno • <span style={{ fontFamily: "'DM Mono'" }}>{r.intervalo}</span> • #{r.matricula}
                            </div>
                          </div>
                          {r.defeito && <div style={{ fontSize: 13, color: COLORS.danger, marginBottom: 6 }}>⚠ Defeito: <strong>{r.defeito}</strong></div>}
                          {r.motivoRetrabalho && <div style={{ fontSize: 13, color: COLORS.warning, marginBottom: 4 }}>↺ Defeito anterior: <strong>{r.motivoRetrabalho}</strong></div>}
                          {r.descricaoRetrabalho && (
                            <div style={{ fontSize: 13, color: COLORS.text, background: COLORS.warningLight, borderRadius: 8, padding: "8px 12px", marginTop: 6, borderLeft: `3px solid ${COLORS.warning}` }}>
                              📝 {r.descricaoRetrabalho}
                            </div>
                          )}
                          {r.amostras > 0 && <div style={{ fontSize: 13, color: COLORS.purple, marginTop: 6 }}>✂ Amostras cortadas: <strong>{r.amostras}</strong></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
                  <div style={{ textAlign: "center", color: COLORS.grayDark }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>Selecione um painel para ver o histórico</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Clique em um código na lista ao lado</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUTOCLAVE */}
        {tela === "autoclave" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Sub nav */}
            <div style={{ display: "flex", background: "white", borderRadius: 12, padding: 4, gap: 4, boxShadow: "0 1px 4px rgba(0,58,140,0.07)" }}>
              {[["dashboard","📊 Visão Geral"],["novo","➕ Novo Ciclo"],["avaliar","✅ Avaliar Retorno"]].map(([k,v]) => (
                <button key={k} onClick={() => setAbaAutoclave(k)}
                  style={{ flex: 1, padding: "10px 8px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 13, fontWeight: abaAutoclave === k ? 700 : 500, background: abaAutoclave === k ? COLORS.blue : "none", color: abaAutoclave === k ? "white" : COLORS.grayDark }}>
                  {v}
                </button>
              ))}
            </div>

            {/* VISÃO GERAL */}
            {abaAutoclave === "dashboard" && (() => {
              const totalPaineis = ciclos.reduce((s, c) => s + c.paineis.length, 0);
              const totalAvaliados = ciclos.filter(c => c.avaliado).reduce((s, c) => s + c.paineis.length, 0);
              const totalAprovados = ciclos.filter(c => c.avaliado).reduce((s, c) => s + c.paineis.filter(p => p.resultado === "aprovado").length, 0);
              const totalReprovados = ciclos.filter(c => c.avaliado).reduce((s, c) => s + c.paineis.filter(p => p.resultado === "reprovado").length, 0);
              const totalReprocesso = ciclos.reduce((s, c) => s + c.paineis.filter(p => p.reprocesso).length, 0);
              const taxaAuto = totalAvaliados > 0 ? Math.round((totalAprovados / totalAvaliados) * 100) : 0;

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {[
                      { label: "Total Ciclos", valor: ciclos.length, cor: COLORS.blue },
                      { label: "Painéis Enviados", valor: totalPaineis, cor: "#4A7FA5" },
                      { label: "Reprocessos", valor: totalReprocesso, cor: COLORS.warning },
                      { label: "Avaliados", valor: totalAvaliados, cor: COLORS.grayDark },
                      { label: "Aprovados", valor: totalAprovados, cor: COLORS.success },
                      { label: "Reprovados", valor: totalReprovados, cor: COLORS.danger },
                    ].map(({ label, valor, cor }) => (
                      <div key={label} className="card" style={{ textAlign: "center", padding: "14px 8px", borderTop: `3px solid ${cor}` }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: cor }}>{valor}</div>
                        <div style={{ fontSize: 11, color: COLORS.grayDark, marginTop: 4, fontWeight: 500 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Taxa de aprovação */}
                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                      <svg viewBox="0 0 90 90" width="90" height="90">
                        <circle cx="45" cy="45" r="38" fill="none" stroke={COLORS.dangerLight} strokeWidth="10" />
                        <circle cx="45" cy="45" r="38" fill="none" stroke={COLORS.success} strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 38 * taxaAuto / 100} ${2 * Math.PI * 38}`}
                          strokeLinecap="round" transform="rotate(-90 45 45)" />
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.success }}>{taxaAuto}%</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Taxa de Aprovação Geral</div>
                      <div style={{ fontSize: 13, color: COLORS.grayDark }}>Baseado em {ciclos.filter(c => c.avaliado).length} ciclo(s) avaliado(s)</div>
                      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                        <span style={{ fontSize: 13, color: COLORS.success, fontWeight: 600 }}>✓ {totalAprovados} aprovados</span>
                        <span style={{ fontSize: 13, color: COLORS.danger, fontWeight: 600 }}>✗ {totalReprovados} reprovados</span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de ciclos */}
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.gray}` }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>Ciclos Registrados</div>
                    </div>
                    {ciclos.map((c, i) => {
                      const aprov = c.paineis.filter(p => p.resultado === "aprovado").length;
                      const reprov = c.paineis.filter(p => p.resultado === "reprovado").length;
                      const repro = c.paineis.filter(p => p.reprocesso).length;
                      return (
                        <div key={c.id} style={{ padding: "16px 20px", borderBottom: i < ciclos.length - 1 ? `1px solid ${COLORS.gray}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontFamily: "'DM Mono'", fontWeight: 700, color: COLORS.blue, fontSize: 14 }}>{c.id}</span>
                              {c.fimDeSemana && <span className="tag" style={{ background: COLORS.purpleLight || "#F3E8FF", color: COLORS.purple, fontSize: 10 }}>Fim de semana</span>}
                              <span className="tag" style={{ background: c.avaliado ? COLORS.successLight : COLORS.warningLight, color: c.avaliado ? COLORS.success : COLORS.warning, fontSize: 10 }}>
                                {c.avaliado ? "✓ Avaliado" : "⏳ Aguardando"}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: COLORS.grayDark }}>
                              Enviado: {c.dataEnvio} → Retorno: {c.dataRetorno} • #{c.matricula}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span className="tag" style={{ background: COLORS.bluePale, color: COLORS.blue }}>{c.paineis.length} painéis</span>
                            {repro > 0 && <span className="tag" style={{ background: COLORS.warningLight, color: COLORS.warning }}>↺ {repro} reprocesso</span>}
                            {c.avaliado && <>
                              <span className="tag" style={{ background: COLORS.successLight, color: COLORS.success }}>✓ {aprov}</span>
                              <span className="tag" style={{ background: COLORS.dangerLight, color: COLORS.danger }}>✗ {reprov}</span>
                            </>}
                            {!c.avaliado && (
                              <button onClick={() => { setCicloAvaliando(c.id); setAbaAutoclave("avaliar"); }}
                                style={{ padding: "6px 12px", background: COLORS.blue, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>
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
            })()}

            {/* NOVO CICLO */}
            {abaAutoclave === "novo" && (
              <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Registrar Envio para Autoclave</div>
                    <div style={{ fontSize: 13, color: COLORS.grayDark }}>Preencha os dados do ciclo antes de enviar</div>
                  </div>

                  {/* Matrícula + Data */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Matrícula</label>
                      <input className="input-field" placeholder="Ex: 3789"
                        value={formCiclo.matricula} onChange={e => setFormCiclo({ ...formCiclo, matricula: e.target.value.replace(/\D/g, "") })}
                        style={{ fontFamily: "'DM Mono'", fontWeight: 600, letterSpacing: 2 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Data de Envio</label>
                      <input className="input-field" type="date"
                        value={formCiclo.dataEnvio} onChange={e => setFormCiclo({ ...formCiclo, dataEnvio: e.target.value })} />
                    </div>
                  </div>

                  {/* Fim de semana */}
                  <div>
                    <button onClick={() => setFormCiclo({ ...formCiclo, fimDeSemana: !formCiclo.fimDeSemana })}
                      style={{ padding: "10px 16px", border: `1.5px solid ${formCiclo.fimDeSemana ? COLORS.purple : COLORS.grayMid}`, background: formCiclo.fimDeSemana ? "#F3E8FF" : "white", borderRadius: 10, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500, cursor: "pointer", color: formCiclo.fimDeSemana ? COLORS.purple : COLORS.grayDark }}>
                      {formCiclo.fimDeSemana ? "✓" : "○"} Ciclo de Fim de Semana
                    </button>
                  </div>

                  {/* Adicionar painéis */}
                  <div style={{ borderTop: `1px solid ${COLORS.gray}`, paddingTop: 16 }}>
                    <div className="section-label" style={{ color: COLORS.blue }}>Painéis do Ciclo</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <input className="input-field" placeholder="Código do painel (8 dígitos)" maxLength={8}
                        value={novoCodigo} onChange={e => setNovoCodigo(e.target.value.replace(/\D/g, ""))}
                        style={{ fontFamily: "'DM Mono'", fontWeight: 600, letterSpacing: 2 }}
                        onKeyDown={e => {
                          if (e.key === "Enter" && novoCodigo.length === 8) {
                            setFormCiclo({ ...formCiclo, paineis: [...formCiclo.paineis, { codigo: novoCodigo, reprocesso: false, resultado: null, defeito: null }] });
                            setNovoCodigo("");
                          }
                        }} />
                      <button onClick={() => {
                        if (novoCodigo.length === 8) {
                          setFormCiclo({ ...formCiclo, paineis: [...formCiclo.paineis, { codigo: novoCodigo, reprocesso: false, resultado: null, defeito: null }] });
                          setNovoCodigo("");
                        }
                      }} style={{ padding: "10px 16px", background: COLORS.blue, color: "white", border: "none", borderRadius: 10, fontFamily: "'DM Sans'", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontSize: 14 }}>
                        + Adicionar
                      </button>
                    </div>

                    {formCiclo.paineis.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px", color: COLORS.grayDark, fontSize: 13, background: COLORS.gray, borderRadius: 10 }}>
                        Nenhum painel adicionado ainda
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {formCiclo.paineis.map((p, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.gray, borderRadius: 10, padding: "10px 14px" }}>
                            <span style={{ fontFamily: "'DM Mono'", fontWeight: 600, color: COLORS.blue, fontSize: 15 }}>{p.codigo}</span>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <button onClick={() => {
                                const updated = [...formCiclo.paineis];
                                updated[i] = { ...updated[i], reprocesso: !updated[i].reprocesso };
                                setFormCiclo({ ...formCiclo, paineis: updated });
                              }} style={{ padding: "5px 12px", border: `1.5px solid ${p.reprocesso ? COLORS.warning : COLORS.grayMid}`, background: p.reprocesso ? COLORS.warningLight : "white", borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer", color: p.reprocesso ? COLORS.warning : COLORS.grayDark }}>
                                {p.reprocesso ? "↺ Reprocesso" : "↺ Marcar reprocesso"}
                              </button>
                              <button onClick={() => {
                                const updated = formCiclo.paineis.filter((_, idx) => idx !== i);
                                setFormCiclo({ ...formCiclo, paineis: updated });
                              }} style={{ padding: "5px 10px", border: "none", background: COLORS.dangerLight, borderRadius: 8, color: COLORS.danger, cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600 }}>
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                        <div style={{ fontSize: 13, color: COLORS.grayDark, textAlign: "right", marginTop: 4 }}>
                          Total: <strong>{formCiclo.paineis.length} painel(is)</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Observação */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.grayDark, display: "block", marginBottom: 6 }}>Observação (opcional)</label>
                    <textarea className="input-field" rows={2} placeholder="Ex: Carrinho 1 e 2 enviados juntos..."
                      value={formCiclo.observacao} onChange={e => setFormCiclo({ ...formCiclo, observacao: e.target.value })}
                      style={{ resize: "vertical" }} />
                  </div>

                  <button className="btn-primary" onClick={() => {
                    if (!formCiclo.matricula || formCiclo.paineis.length === 0) return;
                    const id = `C${String(ciclos.length + 1).padStart(3, "0")}`;
                    const dataEnvio = formCiclo.dataEnvio ? new Date(formCiclo.dataEnvio).toLocaleDateString("pt-BR") : hoje;
                    const dataRetorno = formCiclo.dataEnvio ? new Date(new Date(formCiclo.dataEnvio).getTime() + 86400000).toLocaleDateString("pt-BR") : hoje;
                    setCiclos([...ciclos, { id, dataEnvio, dataRetorno, matricula: formCiclo.matricula, fimDeSemana: formCiclo.fimDeSemana, observacao: formCiclo.observacao || null, paineis: formCiclo.paineis, avaliado: false }]);
                    setFormCiclo(FORM_CICLO_INICIAL);
                    setAbaAutoclave("dashboard");
                  }}>
                    Confirmar Envio para Autoclave
                  </button>
                </div>
              </div>
            )}

            {/* AVALIAR RETORNO */}
            {abaAutoclave === "avaliar" && (() => {
              const ciclosPendentes = ciclos.filter(c => !c.avaliado);
              const cicloAtual = cicloAvaliando ? ciclos.find(c => c.id === cicloAvaliando) : null;

              const marcarResultado = (cicloId, codigoPainel, resultado, defeito) => {
                setCiclos(ciclos.map(c => {
                  if (c.id !== cicloId) return c;
                  return { ...c, paineis: c.paineis.map(p => p.codigo === codigoPainel ? { ...p, resultado, defeito } : p) };
                }));
              };

              const finalizarAvaliacao = (cicloId) => {
                setCiclos(ciclos.map(c => c.id === cicloId ? { ...c, avaliado: true } : c));
                setCicloAvaliando(null);
                setAbaAutoclave("dashboard");
              };

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {!cicloAtual ? (
                    <>
                      {ciclosPendentes.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: 40, color: COLORS.grayDark }}>
                          <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>Todos os ciclos já foram avaliados!</div>
                        </div>
                      ) : (
                        <div className="card">
                          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Ciclos Aguardando Avaliação</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {ciclosPendentes.map(c => (
                              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.gray, borderRadius: 12, padding: "14px 16px", flexWrap: "wrap", gap: 8 }}>
                                <div>
                                  <div style={{ fontFamily: "'DM Mono'", fontWeight: 700, color: COLORS.blue, fontSize: 15, marginBottom: 4 }}>{c.id}</div>
                                  <div style={{ fontSize: 12, color: COLORS.grayDark }}>Enviado: {c.dataEnvio} • {c.paineis.length} painéis • #{c.matricula}</div>
                                </div>
                                <button onClick={() => setCicloAvaliando(c.id)}
                                  style={{ padding: "8px 16px", background: COLORS.blue, color: "white", border: "none", borderRadius: 8, fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                                  Avaliar este ciclo
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, color: COLORS.grayDark, marginBottom: 2 }}>Avaliando ciclo</div>
                          <div style={{ fontFamily: "'DM Mono'", fontSize: 22, fontWeight: 700, color: COLORS.blue }}>{cicloAtual.id} — {cicloAtual.dataEnvio}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span className="tag" style={{ background: COLORS.bluePale, color: COLORS.blue }}>{cicloAtual.paineis.length} painéis</span>
                          <span className="tag" style={{ background: COLORS.successLight, color: COLORS.success }}>✓ {cicloAtual.paineis.filter(p => p.resultado === "aprovado").length}</span>
                          <span className="tag" style={{ background: COLORS.dangerLight, color: COLORS.danger }}>✗ {cicloAtual.paineis.filter(p => p.resultado === "reprovado").length}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                        {cicloAtual.paineis.map((p, i) => (
                          <div key={i} style={{ background: p.resultado === "aprovado" ? COLORS.successLight : p.resultado === "reprovado" ? COLORS.dangerLight : COLORS.gray, borderRadius: 12, padding: "12px 16px", border: `1.5px solid ${p.resultado === "aprovado" ? COLORS.success : p.resultado === "reprovado" ? COLORS.danger : COLORS.grayMid}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontFamily: "'DM Mono'", fontWeight: 700, color: COLORS.blue, fontSize: 15 }}>{p.codigo}</span>
                                {p.reprocesso && <span className="tag" style={{ background: COLORS.warningLight, color: COLORS.warning, fontSize: 10 }}>↺ Reprocesso</span>}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => marcarResultado(cicloAtual.id, p.codigo, "aprovado", null)}
                                  style={{ padding: "6px 12px", border: `1.5px solid ${COLORS.success}`, background: p.resultado === "aprovado" ? COLORS.success : "white", color: p.resultado === "aprovado" ? "white" : COLORS.success, borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                  ✓ Bom
                                </button>
                                <button onClick={() => marcarResultado(cicloAtual.id, p.codigo, "reprovado", "dobras")}
                                  style={{ padding: "6px 10px", border: `1.5px solid ${COLORS.danger}`, background: p.resultado === "reprovado" && p.defeito === "dobras" ? COLORS.danger : "white", color: p.resultado === "reprovado" && p.defeito === "dobras" ? "white" : COLORS.danger, borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                  Dobras
                                </button>
                                <button onClick={() => marcarResultado(cicloAtual.id, p.codigo, "reprovado", "mole")}
                                  style={{ padding: "6px 10px", border: `1.5px solid ${COLORS.warning}`, background: p.resultado === "reprovado" && p.defeito === "mole" ? COLORS.warning : "white", color: p.resultado === "reprovado" && p.defeito === "mole" ? "white" : COLORS.warning, borderRadius: 8, fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                  Mole
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setCicloAvaliando(null)}
                          style={{ flex: 1, padding: "12px", border: `1.5px solid ${COLORS.grayMid}`, background: "white", borderRadius: 10, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer", color: COLORS.grayDark }}>
                          Voltar
                        </button>
                        <button onClick={() => finalizarAvaliacao(cicloAtual.id)}
                          style={{ flex: 2, padding: "12px", background: COLORS.success, color: "white", border: "none", borderRadius: 10, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                          ✓ Finalizar Avaliação
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}

      </div>
    </div>
  );
}
