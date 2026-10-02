/* Ahninat Studio: comportamento da página.
   Os contatos ficam aqui, num lugar só. */
const CONFIG = {
  email: "contato@ahninat.com.br", // trocar pelo e-mail real do estúdio
  instagram: "", // ex.: "https://www.instagram.com/ahninat.studio"; vazio esconde o link
  linkedin: "", // ex.: "https://www.linkedin.com/company/ahninat"; vazio esconde o link
};

(function () {
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));

  // Contatos configuráveis: os links de rede só aparecem quando preenchidos.
  $$("[data-email]").forEach((a) => {
    a.href = "mailto:" + CONFIG.email;
  });
  $$("[data-email-texto]").forEach((el) => {
    el.textContent = CONFIG.email;
  });
  [["instagram", CONFIG.instagram], ["linkedin", CONFIG.linkedin]].forEach(([rede, url]) => {
    $$(`[data-${rede}]`).forEach((a) => {
      if (url) a.href = url;
      else a.hidden = true;
    });
  });

  // Ano do rodapé
  const ano = $("#ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  // Cabeçalho ganha borda ao rolar
  const topo = $("#topo");
  const aoRolar = () => topo.classList.toggle("rolou", window.scrollY > 8);
  aoRolar();
  window.addEventListener("scroll", aoRolar, { passive: true });

  // Menu móvel
  const toggle = $(".nav-toggle");
  const nav = $("#nav");
  if (toggle && nav) {
    const fechar = () => {
      nav.classList.remove("aberta");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    };
    toggle.addEventListener("click", () => {
      const aberta = nav.classList.toggle("aberta");
      toggle.setAttribute("aria-expanded", String(aberta));
      toggle.setAttribute("aria-label", aberta ? "Fechar menu" : "Abrir menu");
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", fechar));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fechar();
    });
  }

  // Link ativo na navegação conforme a seção visível
  const secoes = $$("main section[id]");
  const links = $$("#nav a[href^='#']");
  if ("IntersectionObserver" in window && secoes.length) {
    const marcar = (id) => links.forEach((a) => a.classList.toggle("ativo", a.getAttribute("href") === "#" + id));
    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visivel) marcar(visivel.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.5] },
    );
    secoes.forEach((s) => obs.observe(s));
  }

  // Entrada suave dos blocos ao rolar (respeita "reduzir movimento")
  const movimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revelar = $$("[data-revelar]");
  if (!movimento.matches && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entradas, o) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revelado");
            o.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    revelar.forEach((el) => obs.observe(el));
  } else {
    revelar.forEach((el) => el.classList.add("revelado"));
  }

  // Cada filete acumula volume e se rompe na direcao escolhida para o fluxo.
  const logo = document.querySelector(".logo-liquido");
  const desloc = document.getElementById("desloc");
  const ondas = document.getElementById("liquido-ondas");
  if (logo && desloc && ondas) {
    const sortear = (minimo, maximo) => minimo + Math.random() * (maximo - minimo);
    const direcoes = [
      { dx: 0, dy: 1, angulo: 0 },
      { dx: 1, dy: 0, angulo: -90 },
      { dx: -1, dy: 0, angulo: 90 }
    ];
    const partes = logo.querySelectorAll(".liquido > g > path");
    const coral = logo.querySelector(".conexao");
    const gotas = Array.from(logo.querySelectorAll(".liquido__gotas > g"), (grupo) => {
      const parte = partes[Number(grupo.dataset.parte)];
      const caixa = parte.getBBox();
      const perimetro = parte.getTotalLength();
      const bordas = [];
      // Cada origem precisa ter massa atras e espaco livre na direcao do fluxo.
      for (let distancia = 0; distancia < perimetro; distancia += 1.5) {
        const ponto = parte.getPointAtLength(distancia);
        const dentro = (x, y) => parte.isPointInFill(new DOMPoint(x, y));
        direcoes.forEach((direcao) => {
          const { dx, dy } = direcao;
          const projecao = (ponto.x - caixa.x - caixa.width / 2) * dx + (ponto.y - caixa.y - caixa.height / 2) * dy;
          if (projecao < (dx ? caixa.width : caixa.height) * 0.05) return;
          if (dentro(ponto.x - dx * 3 - dy * 2, ponto.y - dy * 3 + dx * 2)
              && dentro(ponto.x - dx * 3 + dy * 2, ponto.y - dy * 3 - dx * 2)
              && !dentro(ponto.x + dx * 2, ponto.y + dy * 2)) {
            bordas.push({ x: ponto.x, y: ponto.y, direcao });
          }
        });
      }
      return {
        grupo,
        filete: grupo.querySelector("path"),
        gota: grupo.querySelector("ellipse"),
        bordas,
        separacao: caixa.width * 0.2,
        base: {
          raio: Number(grupo.dataset.raio),
          comprimento: Number(grupo.dataset.comprimento),
          queda: Number(grupo.dataset.queda),
          periodo: Number(grupo.dataset.periodo)
        }
      };
    });
    const prepararGota = (estado, inicio, direcaoInicial) => {
      const outrasDirecoes = estado.bordas.filter((ponto) => direcaoInicial ? ponto.direcao === direcaoInicial : ponto.direcao !== estado.direcao);
      const disponiveis = outrasDirecoes.length ? outrasDirecoes : estado.bordas;
      const candidatas = disponiveis.filter((ponto) => estado.x === undefined || Math.hypot(ponto.x - estado.x, ponto.y - estado.y) > estado.separacao);
      const bordas = candidatas.length ? candidatas : disponiveis;
      if (!bordas.length) {
        estado.inicio = Infinity;
        return;
      }
      const ponto = bordas[Math.floor(Math.random() * bordas.length)];
      estado.x = ponto.x;
      estado.y = ponto.y;
      estado.direcao = ponto.direcao;
      estado.raio = estado.base.raio * sortear(0.75, 1.15);
      const margem = estado.direcao.dx > 0 ? 208 - estado.x : estado.direcao.dx < 0 ? estado.x - 3 : 191 - estado.y;
      const espaco = Math.max(0, margem - estado.raio * 1.5);
      estado.comprimento = Math.min(estado.base.comprimento * sortear(0.75, 1.25), espaco * 0.55);
      estado.queda = Math.min(estado.base.queda * sortear(0.8, 1.2), espaco - estado.comprimento);
      estado.periodo = estado.base.periodo * sortear(0.75, 1.35);
      estado.inicio = inicio;
      // Desenha a gota em coordenadas locais e orienta tambem seu pescoco.
      estado.grupo.setAttribute("transform", `translate(${estado.x} ${estado.y}) rotate(${estado.direcao.angulo})`);
    };
    gotas.forEach((estado, indice) => prepararGota(estado, indice * 0.35 + sortear(0, 0.5), direcoes[indice % direcoes.length]));
    const suavizar = (valor) => {
      const t = Math.max(0, Math.min(1, valor));
      return t * t * (3 - 2 * t);
    };
    const desenhoCoral = coral?.getAttribute("d");
    const perimetroCoral = coral?.getTotalLength() || 0;
    const contornoCoral = coral ? Array.from({ length: 72 }, (_, indice) => {
      const ponto = coral.getPointAtLength(perimetroCoral * indice / 72);
      return {
        x: ponto.x,
        y: ponto.y,
        baixo: suavizar((ponto.y - 78) / 16) * Math.exp(-(((ponto.x - 112) / 11) ** 2)),
        cima: suavizar((76 - ponto.y) / 20) * Math.exp(-(((ponto.x - 104) / 9) ** 2))
      };
    }) : [];
    const deformarPontoCoral = (ponto, baixo, cima) => ({
      x: ponto.x + ponto.baixo * baixo * 10 + ponto.cima * cima * 3,
      y: ponto.y + ponto.baixo * baixo * 20 - ponto.cima * cima * 13
    });
    const escorrerCoral = (baixo, cima) => {
      if (!coral) return;
      if (baixo + cima < 0.001) {
        coral.setAttribute("d", desenhoCoral);
        return;
      }
      // Deforma o proprio contorno fechado: a ponta nunca se separa do corpo.
      const pontos = contornoCoral.map((ponto) => deformarPontoCoral(ponto, baixo, cima));
      const coordenadas = (ponto) => `${ponto.x.toFixed(3)} ${ponto.y.toFixed(3)}`;
      let desenho = `M ${coordenadas(pontos[0])}`;
      pontos.forEach((ponto, indice) => {
        const anterior = pontos[(indice + pontos.length - 1) % pontos.length];
        const proximo = pontos[(indice + 1) % pontos.length];
        const seguinte = pontos[(indice + 2) % pontos.length];
        const controle1 = { x: ponto.x + (proximo.x - anterior.x) / 6, y: ponto.y + (proximo.y - anterior.y) / 6 };
        const controle2 = { x: proximo.x - (seguinte.x - ponto.x) / 6, y: proximo.y - (seguinte.y - ponto.y) / 6 };
        desenho += ` C ${coordenadas(controle1)} ${coordenadas(controle2)} ${coordenadas(proximo)}`;
      });
      coral.setAttribute("d", desenho + " Z");
    };
    const pontasCoral = [
      { valor: 0, velocidade: 0, alvo: sortear(0.7, 1), esticada: true, proxima: sortear(3.2, 4.8), resposta: 1.8 },
      { valor: 0, velocidade: 0, alvo: 0, esticada: false, proxima: sortear(1.5, 2.8), resposta: 2 }
    ];
    const atualizarPonta = (ponta, tempo, delta) => {
      if (tempo >= ponta.proxima) {
        ponta.esticada = !ponta.esticada;
        ponta.alvo = ponta.esticada ? sortear(0.5, 1) : sortear(0, 0.1);
        ponta.proxima = tempo + (ponta.esticada ? sortear(2.5, 4.8) : sortear(1.2, 3.8));
        ponta.resposta = sortear(1.4, 2.4);
      }
      // Amortecimento preserva a velocidade quando o alvo muda, sem reiniciar o gesto.
      const erro = ponta.valor - ponta.alvo;
      const impulso = (ponta.velocidade + ponta.resposta * erro) * delta;
      const amortecimento = Math.exp(-ponta.resposta * delta);
      ponta.valor = ponta.alvo + (erro + impulso) * amortecimento;
      ponta.velocidade = (ponta.velocidade - ponta.resposta * impulso) * amortecimento;
    };
    const grupoBolha = logo.querySelector(".liquido__bolha-coral");
    const bolhaCoral = grupoBolha && contornoCoral.length ? {
      grupo: grupoBolha,
      filete: grupoBolha.querySelector("path"),
      gota: grupoBolha.querySelector("ellipse"),
      ativa: false
    } : null;
    const extremosCoral = contornoCoral.length ? [
      contornoCoral.reduce((a, b) => a.y > b.y ? a : b),
      contornoCoral.reduce((a, b) => a.y < b.y ? a : b)
    ] : [];
    let proximaBolha = sortear(1.1, 2.2);
    const repousarCoral = () => {
      pontasCoral.forEach((ponta) => { ponta.valor = 0; ponta.velocidade = 0; });
      if (bolhaCoral) {
        bolhaCoral.ativa = false;
        bolhaCoral.grupo.setAttribute("opacity", "0");
      }
      escorrerCoral(0, 0);
    };
    let visivel = false, quadro = 0, anterior = 0, tempo = 0;
    let ponteiroX = 0, arrastoX = 0;
    const passo = (agora) => {
      if (movimento.matches || !visivel || document.hidden) {
        if (movimento.matches) repousarCoral();
        quadro = 0;
        return;
      }
      quadro = requestAnimationFrame(passo);
      if (agora - anterior < 1000 / 30) return;
      const delta = anterior ? Math.min((agora - anterior) / 1000, 0.1) : 0;
      anterior = agora;
      tempo += delta;
      const suavidade = 1 - Math.exp(-delta * 3);
      arrastoX += (ponteiroX - arrastoX) * suavidade;
      pontasCoral.forEach((ponta) => atualizarPonta(ponta, tempo, delta));
      const baixo = Math.max(0, pontasCoral[0].valor * (1 - pontasCoral[1].valor * 0.18));
      const cima = Math.max(0, pontasCoral[1].valor * (1 - pontasCoral[0].valor * 0.18));
      escorrerCoral(baixo, cima);

      if (bolhaCoral) {
        if (bolhaCoral.ativa && tempo >= bolhaCoral.inicio + bolhaCoral.periodo) {
          bolhaCoral.ativa = false;
          bolhaCoral.grupo.setAttribute("opacity", "0");
        }
        const esticando = pontasCoral[0].velocidade > pontasCoral[1].velocidade ? 0 : 1;
        if (!bolhaCoral.ativa && tempo >= proximaBolha && pontasCoral[esticando].velocidade > 0.08 && pontasCoral[esticando].valor > 0.2) {
          proximaBolha = tempo + sortear(6, 11);
          if (Math.random() < 0.75) {
            const lado = 1 - esticando;
            Object.assign(bolhaCoral, {
              ativa: true, lado, inicio: tempo, periodo: sortear(2.5, 3.5),
              raio: sortear(2, 2.7), comprimento: sortear(4.5, 6.5), queda: sortear(9, 14),
              angulo: (lado === 0 ? -27 : 190) + sortear(-4, 4)
            });
            // O lado principal continua fluindo enquanto o oposto cede uma pequena gota.
            pontasCoral[esticando].proxima = Math.max(pontasCoral[esticando].proxima, tempo + bolhaCoral.periodo * 0.85);
          }
        }
        if (bolhaCoral.ativa) {
          const fase = (tempo - bolhaCoral.inicio) / bolhaCoral.periodo;
          if (fase < 0.68 || !bolhaCoral.solta) {
            const origem = deformarPontoCoral(extremosCoral[bolhaCoral.lado], baixo, cima);
            bolhaCoral.grupo.setAttribute("transform", `translate(${origem.x} ${origem.y}) rotate(${bolhaCoral.angulo})`);
          }
          bolhaCoral.solta = fase >= 0.68;
        }
      }
      const gotasVisiveis = bolhaCoral?.ativa ? [...gotas, bolhaCoral] : gotas;
      gotasVisiveis.forEach((estado) => {
        if (estado !== bolhaCoral && tempo >= estado.inicio + estado.periodo) {
          prepararGota(estado, tempo + sortear(0.3, 2.3));
        }
        const { grupo, filete, gota, raio, comprimento, queda, periodo, inicio } = estado;
        if (tempo < inicio) {
          grupo.setAttribute("opacity", "0");
          return;
        }
        const fase = (tempo - inicio) / periodo;
        const x = 0, y = 0;
        const volume = suavizar(fase / 0.3);
        const esticar = suavizar((fase - 0.2) / 0.46);
        const livre = Math.max(0, (fase - 0.68) / 0.32);
        const r = raio * volume;
        const pontaX = x + (estado === bolhaCoral ? 0 : arrastoX) * esticar;
        const pontaY = y - raio * 0.7 + comprimento * esticar + queda * livre * livre;
        const alongamento = 1 + 0.42 * Math.sin(esticar * Math.PI / 2) * (1 - suavizar(livre / 0.5));
        grupo.setAttribute("opacity", (1 - suavizar((fase - 0.91) / 0.09)).toFixed(3));
        gota.setAttribute("cx", pontaX.toFixed(3));
        gota.setAttribute("cy", pontaY.toFixed(3));
        gota.setAttribute("rx", (r / Math.sqrt(alongamento)).toFixed(3));
        gota.setAttribute("ry", (r * alongamento).toFixed(3));

        // Duas curvas concavas formam o pescoco que afina antes da separacao.
        if (fase < 0.68 && volume > 0) {
          const base = r * 1.45;
          const pescoco = r * 0.65 * (1 - suavizar((fase - 0.42) / 0.26));
          const meioY = y + (pontaY - y) * 0.55;
          filete.setAttribute("d", `M ${x - base} ${y - 2} C ${x - base} ${y + 1}, ${pontaX - pescoco} ${meioY - 1}, ${pontaX - pescoco} ${meioY} C ${pontaX - pescoco} ${meioY + 1}, ${pontaX - r * 0.65} ${pontaY - 1}, ${pontaX - r * 0.65} ${pontaY} L ${pontaX + r * 0.65} ${pontaY} C ${pontaX + r * 0.65} ${pontaY - 1}, ${pontaX + pescoco} ${meioY + 1}, ${pontaX + pescoco} ${meioY} C ${pontaX + pescoco} ${meioY - 1}, ${x + base} ${y + 1}, ${x + base} ${y - 2} Z`);
        } else if (livre > 0 && livre < 0.3) {
          const recuo = raio * (1 - suavizar(livre / 0.3));
          filete.setAttribute("d", `M ${x - recuo} ${y - 2} Q ${x} ${y + recuo * 2} ${x + recuo} ${y - 2} Z`);
        } else {
          filete.removeAttribute("d");
        }
      });
      ondas.setAttribute("baseFrequency", `${(0.006 + Math.sin(tempo * 0.4) * 0.001).toFixed(5)} ${(0.008 + Math.cos(tempo * 0.3) * 0.001).toFixed(5)}`);
      desloc.setAttribute("scale", (6 + Math.sin(tempo * 0.8) * 2).toFixed(2));
    };
    const sincronizar = () => {
      cancelAnimationFrame(quadro);
      quadro = 0;
      anterior = 0;
      if (movimento.matches) {
        ponteiroX = arrastoX = 0;
        repousarCoral();
      }
      if (visivel && !document.hidden && !movimento.matches) quadro = requestAnimationFrame(passo);
    };
    new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting;
      sincronizar();
    }).observe(logo);
    document.addEventListener("visibilitychange", sincronizar);
    movimento.addEventListener("change", sincronizar);
    logo.addEventListener("pointermove", (evento) => {
      if (evento.pointerType === "touch" || movimento.matches) return;
      const caixa = logo.getBoundingClientRect();
      ponteiroX = ((evento.clientX - caixa.left) / caixa.width - 0.5) * 4;
    });
    const repousar = () => { ponteiroX = 0; };
    logo.addEventListener("pointerleave", repousar);
    logo.addEventListener("pointercancel", repousar);
  }

  // "Quero saber mais" pré-seleciona o assunto do formulário
  const assunto = $("#assunto");
  $$("[data-produto]").forEach((link) => {
    link.addEventListener("click", () => {
      if (assunto) assunto.value = link.dataset.produto;
    });
  });

  // Formulário: monta um e-mail pronto (sem servidor)
  const form = $("#form-contato");
  const status = $("#form-status");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const mensagem = form.mensagem.value.trim();
      const tema = form.assunto.value;

      if (!nome || !email || !mensagem) {
        status.textContent = "Preencha nome, e-mail e mensagem para continuar.";
        (!nome ? form.nome : !email ? form.email : form.mensagem).focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = "Confira o e-mail: ele parece incompleto.";
        form.email.focus();
        return;
      }

      const subject = encodeURIComponent(`[Site] ${tema}: ${nome}`);
      const body = encodeURIComponent(`${mensagem}\n\n${nome}\n${email}`);
      window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
      status.textContent = "Abrimos seu aplicativo de e-mail com a mensagem pronta.";
    });
  }
})();
