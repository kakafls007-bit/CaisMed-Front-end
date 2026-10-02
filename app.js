// ---------- Sessão simulada (o back-end vai substituir por token/cookie) ----------
(function () {
  const pagina = location.pathname.split("/").pop() || "index.html";
  const cliente = ["home", "agendamento", "agendamento-confirmado", "consultas", "perfil", "perfil-editar", "pre-triagem", "pagamento", "carteirinha"];
  const prof = ["painel-profissional", "consulta-profissional", "cliente-form"];
  const nome = pagina.replace(".html", "");
  const sessao = sessionStorage.getItem("sessao");
  if (cliente.includes(nome) && sessao !== "cliente") location.replace("index.html");
  if (prof.includes(nome) && sessao !== "profissional") location.replace("login-profissional.html");
  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest(".logout-link")) sessionStorage.removeItem("sessao");
  });
})();

// Ícone (cruz + coração) usado em todas as telas
const LOGO_SVG = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M38 14 h24 a6 6 0 0 1 6 6 v14 h14 a6 6 0 0 1 6 6 v10 a6 6 0 0 1 -6 6 H68 v14 a6 6 0 0 1 -6 6 H38 a6 6 0 0 1 -6 -6 V56 H18 a6 6 0 0 1 -6 -6 V40 a6 6 0 0 1 6 -6 h14 V20 a6 6 0 0 1 6 -6 Z"
        stroke="#d62839" stroke-width="4.5" stroke-linejoin="round" fill="none"/>
  <path d="M58 30 c3.5-4 10-4 12.5 0.5 c2.5 4.5 -1 9 -12.5 17 c-11.5-8-15-12.5-12.5-17 c2.5-4.5 9-4.5 12.5-0.5Z"
        fill="#d62839"/>
</svg>`;

const PLANOS = {
  essencial: { nome: "Plano Essencial", valor: 89.9, desc: "Consultas básicas e telemedicina" },
  conforto: { nome: "Plano Conforto", valor: 149.9, desc: "Essencial + exames simples e especialistas" },
  premium: { nome: "Plano Premium", valor: 249.9, desc: "Conforto + exames de imagem e check-up anual" },
  familia: { nome: "Plano Família", valor: 399.9, desc: "Cobertura Premium para até 4 pessoas" },
};
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Preenche selects de plano com os nomes e valores oficiais
document.querySelectorAll("select#plano").forEach((sel) => {
  sel.innerHTML = '<option value="" disabled selected>Escolha o Plano</option>' +
    Object.entries(PLANOS).map(([k, p]) => `<option value="${k}">${p.nome} - ${brl(p.valor)}/mês</option>`).join("");
});

document.querySelectorAll(".logo-icon").forEach((el) => {
  el.innerHTML = LOGO_SVG;
});

// Ícone de seta para o botão "voltar"
const BACK_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15 18l-6-6 6-6"/>
</svg>`;

document.querySelectorAll(".back-btn").forEach((el) => {
  el.innerHTML = BACK_SVG;
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const fallback = el.getAttribute("data-fallback") || "home.html";
    if (document.referrer && document.referrer.includes(window.location.host)) {
      history.back();
    } else {
      window.location.href = fallback;
    }
  });
});

// Ícone de enviar (chatbot)
const SEND_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 12h14M13 6l6 6-6 6"/>
</svg>`;

// CPF: aceita apenas números
document.querySelectorAll('input[name="cpf"]').forEach((el) => {
  el.addEventListener("input", () => {
    el.value = el.value.replace(/\D/g, "").slice(0, 11);
  });
});

// Formulário de login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: trocar por POST /auth/login (back-end). Por enquanto confere com a conta salva no navegador.
    const salvo = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!salvo) return alert("Conta não encontrada. Toque em Criar Uma Conta.");
    if (salvo.cpf !== document.getElementById("cpf").value || salvo.senha !== document.getElementById("senha").value) {
      return alert("CPF ou senha incorretos.");
    }
    sessionStorage.setItem("sessao", "cliente");
    window.location.href = "home.html";
  });
}

// Formulário de cadastro
const cadastroForm = document.getElementById("cadastro-form");
if (cadastroForm) {
  cadastroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: integrar com a API de cadastro
    const dados = {
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      telefone: document.getElementById("telefone").value,
      email: document.getElementById("email").value,
      cidade: document.getElementById("cidade").value,
      plano: document.getElementById("plano").value,
    };
    dados.senha = document.getElementById("senha").value;
    localStorage.setItem("usuario", JSON.stringify(dados));
    window.location.href = "index.html";
  });
}

// Formulário de recuperação de senha
const recuperarForm = document.getElementById("recuperar-form");
if (recuperarForm) {
  recuperarForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: integrar com a API de recuperação de senha
    console.log("Recuperar senha para CPF:", document.getElementById("cpf-recuperar").value);
    window.location.href = "confirmacao.html";
  });
}

// Pré-triagem via chatbot
const chatMessages = document.getElementById("chat-messages");
const chatInputArea = document.getElementById("chat-input-area");
if (chatMessages && chatInputArea) {
  const perguntas = [
    {
      id: "motivo",
      tipo: "texto",
      pergunta:
        "Oi! Antes da sua consulta, vou te fazer algumas perguntas rápidas. Qual o motivo que te trouxe até aqui?",
      placeholder: "Ex.: dor de cabeça, retorno, exame...",
    },
    {
      id: "sintomas",
      tipo: "multipla",
      pergunta: "Você está sentindo algum desses sintomas? Pode marcar mais de um.",
      opcoes: [
        { value: "febre", label: "Febre" },
        { value: "tosse", label: "Tosse" },
        { value: "dor_cabeca", label: "Dor de cabeça" },
        { value: "dor_corpo", label: "Dor no corpo" },
        { value: "falta_ar", label: "Falta de ar" },
        { value: "nausea", label: "Náusea" },
      ],
    },
    {
      id: "urgencia",
      tipo: "unica",
      pergunta: "Como você classificaria a urgência disso?",
      opcoes: [
        { value: "baixa", label: "Baixa" },
        { value: "media", label: "Média" },
        { value: "alta", label: "Alta" },
      ],
    },
    {
      id: "observacoes",
      tipo: "texto-opcional",
      pergunta: "Quer contar mais algum detalhe? Se não tiver nada, é só pular.",
      placeholder: "Observações (opcional)",
    },
  ];

  const respostas = {};
  let passo = 0;

  function addAudio(url) {
    const el = document.createElement("div");
    el.className = "msg msg-user";
    el.innerHTML = `<audio controls src="${url}"></audio>`;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Gravação de áudio (MediaRecorder): clique para gravar e clique de novo para enviar
  function criarMic(onAudio) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chat-mic";
    b.title = "Enviar Áudio";
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
    let rec, chunks = [], t0, timer;
    b.addEventListener("click", async () => {
      if (rec && rec.state === "recording") { rec.stop(); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        rec = new MediaRecorder(stream);
        chunks = [];
        rec.ondataavailable = (e) => chunks.push(e.data);
        rec.onstop = () => {
          clearInterval(timer);
          stream.getTracks().forEach((t) => t.stop());
          b.classList.remove("rec");
          b.textContent = "";
          onAudio(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })));
        };
        rec.start();
        t0 = Date.now();
        b.classList.add("rec");
        timer = setInterval(() => { b.textContent = Math.floor((Date.now() - t0) / 1000) + "s"; }, 500);
      } catch (err) {
        alert("Não foi possível acessar o microfone. Libere a permissão no navegador.");
      }
    });
    return b;
  }

  function addMensagem(texto, autor) {
    const el = document.createElement("div");
    el.className = `msg msg-${autor}`;
    el.textContent = texto;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function labelSintomas(valores) {
    const mapa = Object.fromEntries(
      perguntas.find((p) => p.id === "sintomas").opcoes.map((o) => [o.value, o.label])
    );
    return valores.length
      ? valores.map((v) => mapa[v]).join(", ")
      : "Nenhum sintoma informado";
  }

  // Recomendação do especialista mais adequado a partir das respostas da pré-triagem.
  // TODO: substituir por uma chamada à IA de chatbot quando ela estiver disponível.
  // Por enquanto é uma regra simples (palavras-chave do motivo + sintomas marcados),
  // mas já recebe o objeto completo de respostas para facilitar a troca futura:
  // ex.: `async function escolherEspecialidadeIdeal(respostas) { return await iaChatbot.recomendar(respostas); }`
  function escolherEspecialidadeIdeal(respostas) {
    const texto = (respostas.motivo || "").toLowerCase();
    const sintomas = respostas.sintomas || [];

    if (
      texto.includes("crianc") ||
      texto.includes("filho") ||
      texto.includes("filha") ||
      texto.includes("bebe") ||
      texto.includes("bebê")
    ) {
      return "pediatria";
    }
    if (
      texto.includes("pele") ||
      texto.includes("mancha") ||
      texto.includes("alergia") ||
      texto.includes("coceira")
    ) {
      return "dermatologia";
    }
    if (sintomas.includes("falta_ar")) {
      return "cardiologia";
    }
    return "clinico_geral";
  }

  function renderPasso() {
    chatInputArea.innerHTML = "";

    if (passo >= perguntas.length) {
      const especialidadeRecomendada = escolherEspecialidadeIdeal(respostas);
      addMensagem(
        `Com base no que você me contou, o mais indicado é uma consulta de ${
          ESPECIALIDADES[especialidadeRecomendada]
        }. Já deixei essa sugestão registrada em "Minhas consultas" — é só escolher o dia e o horário por lá.`,
        "bot"
      );

      // TODO: integrar com a API de pré-triagem
      console.log("Pré-triagem:", respostas, "→ especialidade recomendada:", especialidadeRecomendada);
      sessionStorage.setItem("preTriagem", JSON.stringify(respostas));

      const consultas = JSON.parse(localStorage.getItem("consultas") || "[]");
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      consultas.push({
        id: Date.now(),
        especialidade: especialidadeRecomendada,
        data: "",
        horario: "",
        origem: "pre-triagem",
        paciente: usuario.nome || "Paciente",
        preTriagem: respostas,
        atendida: false,
      });
      localStorage.setItem("consultas", JSON.stringify(consultas));

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = "Ver Minhas Consultas";
      btn.addEventListener("click", () => {
        window.location.href = "consultas.html";
      });
      chatInputArea.appendChild(btn);
      return;
    }

    const p = perguntas[passo];
    addMensagem(p.pergunta, "bot");

    if (p.tipo === "texto" || p.tipo === "texto-opcional") {
      const row = document.createElement("div");
      row.className = "chat-send-row";

      const input = document.createElement("input");
      input.type = "text";
      input.className = "chat-text-input";
      input.placeholder = p.placeholder || "";

      const enviar = () => {
        const valor = input.value.trim();
        if (!valor && p.tipo === "texto") return;
        respostas[p.id] = valor;
        addMensagem(valor || "Pular", "user");
        passo++;
        renderPasso();
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") enviar();
      });

      const sendBtn = document.createElement("button");
      sendBtn.type = "button";
      sendBtn.className = "chat-send-btn";
      sendBtn.innerHTML = SEND_SVG;
      sendBtn.addEventListener("click", enviar);

      row.appendChild(input);
      const mic = criarMic((url) => {
        respostas[p.id] = "[Áudio enviado]";
        addAudio(url);
        passo++;
        renderPasso();
      });
      row.appendChild(mic);
      row.appendChild(sendBtn);
      chatInputArea.appendChild(row);

      if (p.tipo === "texto-opcional") {
        const pular = document.createElement("a");
        pular.href = "javascript:void(0)";
        pular.className = "secondary-link";
        pular.textContent = "Pular";
        pular.addEventListener("click", () => {
          respostas[p.id] = "";
          addMensagem("Pular", "user");
          passo++;
          renderPasso();
        });
        chatInputArea.appendChild(pular);
      }

      input.focus();
    }

    if (p.tipo === "multipla") {
      const selecionados = new Set();
      const chips = document.createElement("div");
      chips.className = "chat-chips";
      p.opcoes.forEach((o) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chat-chip";
        chip.textContent = o.label;
        chip.addEventListener("click", () => {
          if (selecionados.has(o.value)) {
            selecionados.delete(o.value);
            chip.classList.remove("selected");
          } else {
            selecionados.add(o.value);
            chip.classList.add("selected");
          }
        });
        chips.appendChild(chip);
      });
      chatInputArea.appendChild(chips);

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "btn";
      confirmBtn.textContent = "Confirmar";
      confirmBtn.addEventListener("click", () => {
        const valores = Array.from(selecionados);
        respostas[p.id] = valores;
        addMensagem(labelSintomas(valores), "user");
        passo++;
        renderPasso();
      });
      chatInputArea.appendChild(confirmBtn);
    }

    if (p.tipo === "unica") {
      const chips = document.createElement("div");
      chips.className = "chat-chips";
      p.opcoes.forEach((o) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chat-chip";
        chip.textContent = o.label;
        chip.addEventListener("click", () => {
          respostas[p.id] = o.value;
          addMensagem(o.label, "user");
          passo++;
          renderPasso();
        });
        chips.appendChild(chip);
      });
      chatInputArea.appendChild(chips);
    }
  }

  renderPasso();
}

// Seleção de horário (agendamento)
const slotButtons = document.querySelectorAll(".slot-btn");
const horarioInput = document.getElementById("horario");
if (slotButtons.length && horarioInput) {
  slotButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      slotButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      horarioInput.value = btn.textContent.trim();
    });
  });
}

// Formulário de agendamento
const agendamentoForm = document.getElementById("agendamento-form");
if (agendamentoForm) {
  const params = new URLSearchParams(window.location.search);
  const especialidadeParam = params.get("especialidade");
  const consultaId = params.get("consultaId");
  const especialidadeSelect = document.getElementById("especialidade");
  if (especialidadeParam && especialidadeSelect) {
    especialidadeSelect.value = especialidadeParam;
  }

  agendamentoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!horarioInput.value) {
      alert("Escolha um horário disponível.");
      return;
    }
    const consultas = JSON.parse(localStorage.getItem("consultas") || "[]");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    let dados;

    if (consultaId) {
      // Completa a consulta que já existia (sugerida pela pré-triagem), em vez de duplicar.
      const consulta = consultas.find((c) => String(c.id) === consultaId);
      if (consulta) {
        consulta.especialidade = document.getElementById("especialidade").value;
        consulta.data = document.getElementById("data").value;
        consulta.horario = horarioInput.value;
        dados = consulta;
      }
    }

    if (!dados) {
      dados = {
        id: Date.now(),
        especialidade: document.getElementById("especialidade").value,
        data: document.getElementById("data").value,
        horario: horarioInput.value,
        paciente: usuario.nome || "Paciente",
        atendida: false,
      };
      consultas.push(dados);
    }

    // TODO: integrar com a API de agendamento
    console.log("Agendamento:", dados);
    localStorage.setItem("consultas", JSON.stringify(consultas));
    sessionStorage.setItem("agendamento", JSON.stringify(dados));
    window.location.href = "agendamento-confirmado.html";
  });
}

const ESPECIALIDADES = {
  clinico_geral: "Clínico geral",
  pediatria: "Pediatria",
  cardiologia: "Cardiologia",
  dermatologia: "Dermatologia",
};

// Resumo do agendamento confirmado
const resumoAgendamento = document.getElementById("resumo-agendamento");
if (resumoAgendamento) {
  const dados = JSON.parse(sessionStorage.getItem("agendamento") || "{}");
  document.getElementById("resumo-especialidade").textContent =
    ESPECIALIDADES[dados.especialidade] || "—";
  document.getElementById("resumo-data").textContent = dados.data || "—";
  document.getElementById("resumo-horario").textContent = dados.horario || "—";
}

// Minhas consultas (histórico e próximas)
const tabsWrap = document.getElementById("consultas-tabs");
if (tabsWrap) {
  function formatarData(iso) {
    if (!iso) return "—";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function renderLista(container, lista, status) {
    if (!lista.length) {
      container.innerHTML = `<p class="empty-state">${
        status === "agendada"
          ? "Você não tem consultas marcadas."
          : "Ainda não há consultas realizadas."
      }</p>`;
      return;
    }
    container.innerHTML = lista
      .map((c) => {
        const pendente = status === "agendada" && !c.data;
        const statusClasse = pendente ? "pendente" : status;
        const statusLabel = pendente
          ? "aguardando horário"
          : status === "agendada"
          ? "agendada"
          : "realizada";
        const linhaData = pendente
          ? "Sugestão da pré-triagem"
          : `${formatarData(c.data)} às ${c.horario || "—"}`;
        const acao = pendente
          ? `<a class="consulta-action" href="agendamento.html?especialidade=${c.especialidade}&consultaId=${c.id}">marcar horário</a>`
          : "";
        return `
      <div class="consulta-card">
        <div class="consulta-top">
          <span class="consulta-especialidade">${
            ESPECIALIDADES[c.especialidade] || c.especialidade
          }</span>
          <span class="consulta-status ${statusClasse}">${statusLabel}</span>
        </div>
        <div class="consulta-data">${linhaData}</div>
        ${acao}
      </div>`;
      })
      .join("");
  }

  const consultas = JSON.parse(localStorage.getItem("consultas") || "[]");
  const hoje = new Date().toISOString().slice(0, 10);
  const proximas = consultas
    .filter((c) => !c.atendida && (!c.data || c.data >= hoje))
    .sort((a, b) => (a.data || "9999-99-99").localeCompare(b.data || "9999-99-99"));
  const historico = consultas
    .filter((c) => c.atendida || (c.data && c.data < hoje))
    .sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  renderLista(document.getElementById("lista-proximas"), proximas, "agendada");
  renderLista(document.getElementById("lista-historico"), historico, "realizada");

  const tabButtons = tabsWrap.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

// Login do profissional
const loginProfissionalForm = document.getElementById("login-profissional-form");
if (loginProfissionalForm) {
  loginProfissionalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: trocar por POST /auth/profissional/login (back-end). Conta de demonstração: 1001 / caismed123
    if (document.getElementById("registro").value !== "1001" || document.getElementById("senha").value !== "caismed123") {
      return alert("Matrícula ou senha incorretas.");
    }
    sessionStorage.setItem("sessao", "profissional");
    window.location.href = "painel-profissional.html";
  });
}

const SINTOMAS_LABELS = {
  febre: "Febre",
  tosse: "Tosse",
  dor_cabeca: "Dor de cabeça",
  dor_corpo: "Dor no corpo",
  falta_ar: "Falta de ar",
  nausea: "Náusea",
};

const URGENCIAS = { baixa: "Baixa", media: "Média", alta: "Alta" };

function formatarDataBR(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Painel do profissional (fila de atendimentos)
const painelTabs = document.getElementById("painel-tabs");
if (painelTabs) {
  function renderFila(container, lista, concluida) {
    if (!lista.length) {
      container.innerHTML = `<p class="empty-state">${
        concluida
          ? "Nenhum atendimento concluído ainda."
          : "Nenhuma consulta aguardando atendimento."
      }</p>`;
      return;
    }
    container.innerHTML = lista
      .map(
        (c) => `
      <a class="consulta-card consulta-card-link" href="consulta-profissional.html?consultaId=${c.id}">
        <div class="consulta-top">
          <span class="consulta-especialidade">${
            ESPECIALIDADES[c.especialidade] || c.especialidade
          }</span>
          <span class="consulta-status ${concluida ? "realizada" : "agendada"}">${
          concluida ? "concluída" : "aguardando"
        }</span>
        </div>
        <div class="consulta-data">${c.paciente || "Paciente"} · ${formatarDataBR(
          c.data
        )} às ${c.horario || "—"}</div>
      </a>`
      )
      .join("");
  }

  const consultasProfissional = JSON.parse(localStorage.getItem("consultas") || "[]");
  const aguardando = consultasProfissional
    .filter((c) => c.data && !c.atendida)
    .sort((a, b) => a.data.localeCompare(b.data));
  const concluidas = consultasProfissional
    .filter((c) => c.atendida)
    .sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  renderFila(document.getElementById("lista-aguardando"), aguardando, false);
  renderFila(document.getElementById("lista-concluidas"), concluidas, true);

  const painelTabButtons = painelTabs.querySelectorAll(".tab-btn");
  painelTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      painelTabButtons.forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

// Detalhe da consulta (visão do profissional)
const consultaDetalhe = document.getElementById("consulta-detalhe");
if (consultaDetalhe) {
  const params = new URLSearchParams(window.location.search);
  const consultaId = params.get("consultaId");
  const consultasDetalhe = JSON.parse(localStorage.getItem("consultas") || "[]");
  const consulta = consultasDetalhe.find((c) => String(c.id) === consultaId);

  if (!consulta) {
    document.getElementById("consulta-nao-encontrada").style.display = "block";
  } else {
    const triagem = consulta.preTriagem;
    const sintomasLabel =
      triagem && triagem.sintomas && triagem.sintomas.length
        ? triagem.sintomas.map((s) => SINTOMAS_LABELS[s] || s).join(", ")
        : "Nenhum sintoma informado";

    const info = document.createElement("div");
    info.innerHTML = `
      <div class="summary-box">
        <div class="summary-row"><span class="label">Paciente</span><span class="value">${
          consulta.paciente || "—"
        }</span></div>
        <div class="summary-row"><span class="label">Especialidade</span><span class="value">${
          ESPECIALIDADES[consulta.especialidade] || consulta.especialidade
        }</span></div>
        <div class="summary-row"><span class="label">Data</span><span class="value">${formatarDataBR(
          consulta.data
        )}</span></div>
        <div class="summary-row"><span class="label">Horário</span><span class="value">${
          consulta.horario || "—"
        }</span></div>
      </div>
      ${
        triagem
          ? `
      <p class="intro-text left" style="margin-bottom:16px;">Pré-triagem do paciente</p>
      <div class="summary-box">
        <div class="summary-row"><span class="label">Motivo</span><span class="value">${
          triagem.motivo || "—"
        }</span></div>
        <div class="summary-row"><span class="label">Sintomas</span><span class="value">${sintomasLabel}</span></div>
        <div class="summary-row"><span class="label">Urgência</span><span class="value">${
          URGENCIAS[triagem.urgencia] || "—"
        }</span></div>
        <div class="summary-row"><span class="label">Observações</span><span class="value">${
          triagem.observacoes || "—"
        }</span></div>
      </div>`
          : `<p class="empty-state">Esta consulta não veio de uma pré-triagem pelo chatbot.</p>`
      }
    `;
    consultaDetalhe.appendChild(info);

    const bottomArea = document.createElement("div");
    bottomArea.className = "bottom-area";

    if (consulta.atendida) {
      bottomArea.innerHTML = `<p class="empty-state">Atendimento já concluído.</p>`;
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = "Concluir Atendimento";
      btn.addEventListener("click", () => {
        // TODO: integrar com a API de atendimento
        consulta.atendida = true;
        localStorage.setItem("consultas", JSON.stringify(consultasDetalhe));
        window.location.href = "painel-profissional.html";
      });
      bottomArea.appendChild(btn);
    }
    consultaDetalhe.appendChild(bottomArea);
  }
}

// Tela de perfil (leitura dos dados salvos localmente)
const perfilInfo = document.getElementById("perfil-info");
if (perfilInfo) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  document.getElementById("info-nome").textContent = usuario.nome || "—";
  document.getElementById("info-cpf").textContent = usuario.cpf || "—";
  document.getElementById("info-telefone").textContent = usuario.telefone || "—";
  document.getElementById("info-email").textContent = usuario.email || "—";
  document.getElementById("info-cidade").textContent = usuario.cidade || "—";
  document.getElementById("info-plano").textContent = (PLANOS[usuario.plano] || {}).nome || "—";
}

// Excluir cadastro (Delete do CRUD de identidade)
const btnExcluir = document.getElementById("btn-excluir");
if (btnExcluir) {
  btnExcluir.addEventListener("click", () => {
    const confirmar = confirm(
      "Tem certeza que deseja excluir seu cadastro? Essa ação não pode ser desfeita."
    );
    if (confirmar) {
      // TODO: integrar com a API (DELETE do cadastro)
      localStorage.removeItem("usuario");
      window.location.href = "index.html";
    }
  });
}

// Formulário de edição de perfil (Update do CRUD de identidade)
const perfilEditarForm = document.getElementById("perfil-editar-form");
if (perfilEditarForm) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  if (usuario.nome) document.getElementById("nome").value = usuario.nome;
  if (usuario.cpf) document.getElementById("cpf").value = usuario.cpf;
  if (usuario.telefone) document.getElementById("telefone").value = usuario.telefone;
  if (usuario.email) document.getElementById("email").value = usuario.email;
  if (usuario.cidade) document.getElementById("cidade").value = usuario.cidade;
  if (usuario.plano) document.getElementById("plano").value = usuario.plano;

  perfilEditarForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = {
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      telefone: document.getElementById("telefone").value,
      email: document.getElementById("email").value,
      cidade: document.getElementById("cidade").value,
      plano: document.getElementById("plano").value,
    };
    // TODO: integrar com a API (PUT/PATCH do cadastro)
    localStorage.setItem("usuario", JSON.stringify({ ...usuario, ...dados }));
    window.location.href = "perfil.html";
  });
}

// ---------- Profissional: clientes ----------
const clientes = () => JSON.parse(localStorage.getItem("clientes") || "[]");
const listaClientes = document.getElementById("lista-clientes");
if (listaClientes) {
  const l = clientes();
  listaClientes.innerHTML = '<a class="btn" href="cliente-form.html">Cadastrar Novo Cliente</a>' +
    (l.length ? l.map((c) => `<a class="consulta-card" href="cliente-form.html?id=${c.id}">
      <div class="consulta-top"><span class="consulta-especialidade">${c.nome}</span><span class="consulta-status">${(PLANOS[c.plano] || {}).nome || "—"}</span></div>
      <div class="consulta-data">CPF ${c.cpf} · ${c.telefone}</div><span class="consulta-action">Alterar Dados</span></a>`).join("")
      : '<p class="empty-state">Nenhum cliente cadastrado ainda.</p>');
}

const clienteForm = document.getElementById("cliente-form");
if (clienteForm) {
  const id = new URLSearchParams(location.search).get("id");
  const lista = clientes();
  const atual = lista.find((c) => String(c.id) === id);
  const campos = ["nome", "cpf", "nascimento", "telefone", "email", "cidade", "pagamento"];
  const grade = document.getElementById("plan-grid");
  let plano = atual ? atual.plano : "";
  const desenhar = () => {
    grade.innerHTML = Object.entries(PLANOS).map(([k, p]) => `<div class="plan-card ${k === plano ? "sel" : ""}" data-k="${k}"><b><span>${p.nome}</span><span>${brl(p.valor)}/mês</span></b><small>${p.desc}</small></div>`).join("");
    grade.querySelectorAll(".plan-card").forEach((el) => el.addEventListener("click", () => { plano = el.dataset.k; desenhar(); }));
  };
  desenhar();
  if (atual) {
    campos.forEach((k) => (document.getElementById(k).value = atual[k] || ""));
    document.getElementById("titulo-cliente").textContent = "Alterar Dados do Cliente";
  }
  clienteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!plano) return alert("Escolha o plano do cliente.");
    if (atual && !confirm("Salvar as alterações deste cliente?")) return;
    const dados = { id: atual ? atual.id : Date.now(), plano, criadoEm: atual ? atual.criadoEm : new Date().toISOString() };
    campos.forEach((k) => (dados[k] = document.getElementById(k).value));
    const nova = atual ? lista.map((c) => (c.id === atual.id ? dados : c)) : [...lista, dados];
    localStorage.setItem("clientes", JSON.stringify(nova));
    alert(atual ? "Dados atualizados com sucesso!" : "Cliente cadastrado com sucesso!");
    location.href = "painel-profissional.html";
  });
}

// ---------- Cliente: pagamento ----------
const pagBox = document.getElementById("fatura");
if (pagBox) {
  const u = JSON.parse(localStorage.getItem("usuario") || "{}");
  const pl = PLANOS[u.plano];
  const hist = () => JSON.parse(localStorage.getItem("pagamentos") || "[]");
  const venc = new Date(); venc.setDate(venc.getDate() + 7);
  const pagoMes = hist().some((h) => h.mes === new Date().toISOString().slice(0, 7));
  pagBox.innerHTML = pl
    ? `<div class="summary-row"><span class="label">Plano</span><span class="value">${pl.nome}</span></div>
       <div class="summary-row"><span class="label">Valor</span><span class="value">${brl(pl.valor)}</span></div>
       <div class="summary-row"><span class="label">Vencimento</span><span class="value">${venc.toLocaleDateString("pt-BR")}</span></div>
       <div class="summary-row"><span class="label">Status</span><span class="consulta-status ${pagoMes ? "realizada" : "pendente"}">${pagoMes ? "Pago" : "Pendente"}</span></div>`
    : '<p class="empty-state">Escolha um plano no seu perfil para ver a fatura.</p>';
  const desenharHist = () => {
    document.getElementById("historico-pag").innerHTML = hist().length
      ? hist().map((h) => `<div class="consulta-card"><div class="consulta-top"><span class="consulta-especialidade">${h.plano}</span><span class="consulta-status realizada">Pago</span></div><div class="consulta-data">${h.data} · ${h.valor} · ${h.metodo}</div></div>`).join("")
      : '<p class="empty-state">Nenhum pagamento realizado.</p>';
  };
  desenharHist();
  document.getElementById("btn-pagar").addEventListener("click", () => {
    if (!pl || pagoMes) return alert(pl ? "A fatura deste mês já está paga." : "Nenhum plano contratado.");
    const metodo = document.getElementById("metodo").value;
    localStorage.setItem("pagamentos", JSON.stringify([...hist(), { mes: new Date().toISOString().slice(0, 7), plano: pl.nome, valor: brl(pl.valor), metodo, data: new Date().toLocaleDateString("pt-BR") }]));
    alert("Pagamento confirmado! Obrigado.");
    location.reload();
  });
}


// ---------- Validação e máscaras (front) ----------
function cpfValido(c) {
  c = (c || "").replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const dv = (n) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += +c[i] * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === +c[9] && dv(10) === +c[10];
}
document.querySelectorAll('input[type="tel"]').forEach((el) => {
  el.placeholder = "(81) 99999-9999";
  el.addEventListener("input", () => {
    const d = el.value.replace(/\D/g, "").slice(0, 11);
    el.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });
});
// Bloqueia envio com CPF inválido (cadastro, perfil e cliente)
["cadastro-form", "perfil-editar-form", "cliente-form"].forEach((fid) => {
  const f = document.getElementById(fid);
  if (!f) return;
  f.addEventListener("submit", (e) => {
    const cpf = f.querySelector('input[name="cpf"]');
    if (cpf && !cpfValido(cpf.value)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      alert("CPF inválido. Confira os 11 números.");
      cpf.focus();
    }
  }, true);
});

// ---------- Painel: resumo ----------
const resumo = document.getElementById("resumo-painel");
if (resumo) {
  const cs = JSON.parse(localStorage.getItem("clientes") || "[]");
  const cons = JSON.parse(localStorage.getItem("consultas") || "[]");
  const mes = new Date().toISOString().slice(0, 7);
  const receita = cs.reduce((t, c) => t + ((PLANOS[c.plano] || {}).valor || 0), 0);
  const dados = [
    ["Clientes", cs.length],
    ["Novos no Mês", cs.filter((c) => String(c.criadoEm || "").startsWith(mes)).length],
    ["Consultas Aguardando", cons.filter((c) => c.data && !c.atendida).length],
    ["Receita Mensal", brl(receita)],
  ];
  resumo.innerHTML = dados.map(([t, v]) => `<div class="stat"><b>${v}</b>${t}</div>`).join("");
}

// ---------- Carteirinha ----------
const cart = document.getElementById("carteirinha");
if (cart) {
  const u = JSON.parse(localStorage.getItem("usuario") || "{}");
  document.getElementById("cart-nome").textContent = u.nome || "Nome do Beneficiário";
  document.getElementById("cart-plano").textContent = (PLANOS[u.plano] || {}).nome || "Sem Plano";
  document.getElementById("cart-num").textContent = ("0000" + (u.cpf || "00000000000").slice(-9)).replace(/(\d{4})(\d{4})(\d{5})/, "$1 $2 $3");
}

// ---------- Pix simulado (QR decorativo + copia e cola) ----------
const metodoSel = document.getElementById("metodo");
if (metodoSel) {
  const pix = document.getElementById("pix-box");
  const qr = () => {
    let x = 7, r = "";
    for (let i = 0; i < 21; i++) for (let j = 0; j < 21; j++) {
      x = (x * 1103515245 + 12345) & 0x7fffffff;
      const canto = (i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7);
      if (canto ? (i % 6 === 0 || j % 6 === 0 || ((i % 6) % 6 > 1 && (i % 6) < 5 && (j % 6) > 1 && (j % 6) < 5) || [2,3,4].includes(i % 14) && [2,3,4].includes(j % 14)) : x % 3 === 0) r += `<rect x="${j}" y="${i}" width="1" height="1"/>`;
    }
    return `<svg viewBox="0 0 21 21" width="160" height="160" aria-label="QR Code Pix (simulado)">${r}</svg>`;
  };
  const atualizar = () => {
    pix.style.display = metodoSel.value === "Pix" ? "block" : "none";
  };
  pix.innerHTML = `${qr()}<p class="aviso">QR Code ilustrativo. A cobrança real virá do back-end.</p><code>00020126CAISMED-PIX-SIMULADO</code>`;
  metodoSel.addEventListener("change", atualizar);
  atualizar();
}
