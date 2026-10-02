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
