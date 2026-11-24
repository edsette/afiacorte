/* =========================================================
   AfiaCorte — scripts
   Desenvolvido por Eduardo Sette — https://edsette.github.io/edusettewebdev/
   ========================================================= */

/* ---------- CONFIGURAÇÃO DO FORMULÁRIO ----------
   whatsapp: número que recebe as mensagens (só dígitos, com 55 + DDD).
   formEndpoint: deixe vazio ('') para enviar pelo WhatsApp.
     Para receber também por e-mail, use o FormSubmit (grátis, sem servidor):
     'https://formsubmit.co/ajax/EMAIL_DA_EMPRESA'
     Na 1ª mensagem o FormSubmit manda um e-mail de ativação para a empresa;
     depois de ativar, troque o e-mail pelo código que ele fornece. */
const CONFIG = {
  whatsapp: '5511933633213',
  formEndpoint: '',
};

/* ---------- Menu mobile ---------- */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
  navLinks.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

menuToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('active')) {
    setMenu(false);
    menuToggle.focus();
  }
});

/* ---------- Revelar ao rolar ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Cards que viram ---------- */
document.querySelectorAll('[data-flip]').forEach((wrapper) => {
  const front = wrapper.querySelector('.front');
  const back = wrapper.querySelector('.back');
  const title = front.querySelector('h3')?.textContent.trim() ?? '';

  // Só o lado visível do card recebe foco do teclado
  back.inert = true;

  function flip(toBack) {
    wrapper.classList.toggle('flipped', toBack);
    front.inert = toBack;
    back.inert = !toBack;
    (toBack ? back.querySelector('.back-btn') : front.querySelector('.details-btn'))?.focus({ preventScroll: true });
  }

  wrapper.querySelector('.details-btn')?.addEventListener('click', () => flip(true));
  wrapper.querySelector('.back-btn')?.addEventListener('click', () => flip(false));

  // "Pedir orçamento" já escolhe o serviço no formulário
  wrapper.querySelector('.quote-btn')?.addEventListener('click', () => selectService(title));
});

/* ---------- Ver todos os serviços ---------- */
const loadMoreBtn = document.getElementById('loadMoreBtn');
const hiddenCards = document.querySelectorAll('.hidden-card');

loadMoreBtn?.addEventListener('click', () => {
  hiddenCards.forEach((card) => card.classList.add('show'));
  loadMoreBtn.setAttribute('aria-expanded', 'true');
  loadMoreBtn.parentElement.hidden = true;
  hiddenCards[0]?.querySelector('.details-btn')?.focus({ preventScroll: true });
});

/* ---------- Formulário ---------- */
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');
const serviceSelect = document.getElementById('servico');

function selectService(name) {
  const option = [...serviceSelect.options].find((o) => o.text === name);
  if (option) serviceSelect.value = option.value || option.text;
}

// Máscara de telefone: (11) 93363-3213 / (11) 3333-4444
const phoneInput = document.getElementById('telefone');
phoneInput.addEventListener('input', () => {
  let d = phoneInput.value.replace(/\D/g, '').slice(0, 11);
  if (d.length > 10) d = d.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
  else if (d.length > 6) d = d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  else if (d.length > 2) d = d.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  else if (d.length > 0) d = d.replace(/^(\d{0,2})$/, '($1');
  phoneInput.value = d;
});

const rules = {
  nome: (v) => (v.trim().length >= 2 ? '' : 'Informe seu nome.'),
  telefone: (v) => {
    const n = v.replace(/\D/g, '').length;
    return n === 10 || n === 11 ? '' : 'Informe um telefone com DDD, ex.: (11) 90000-0000.';
  },
  email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Confira o e-mail (ex.: nome@empresa.com.br).'),
  mensagem: (v) => (v.trim().length >= 10 ? '' : 'Conte um pouco mais (mínimo de 10 caracteres).'),
  lgpd: (_, el) => (el.checked ? '' : 'Marque para podermos responder seu contato.'),
};

function validateField(name) {
  const el = form.elements[name];
  const msg = rules[name](el.value, el);
  const errorEl = document.getElementById(`${name}-erro`);
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (errorEl) errorEl.textContent = msg;
  return !msg;
}

// Valida ao sair do campo e corrige em tempo real depois do 1º erro
Object.keys(rules).forEach((name) => {
  const el = form.elements[name];
  el.addEventListener('blur', () => { if (el.value || name === 'lgpd') validateField(name); });
  el.addEventListener(name === 'lgpd' ? 'change' : 'input', () => {
    if (el.getAttribute('aria-invalid') === 'true') validateField(name);
  });
});

function setStatus(type, html) {
  statusEl.className = `form-status ${type}`;
  statusEl.innerHTML = html;
}

function buildWhatsappText(data) {
  const lines = [
    'Olá! Vim pelo site da AfiaCorte e gostaria de um orçamento.',
    '',
    `*Nome:* ${data.nome}`,
    data.empresa ? `*Empresa:* ${data.empresa}` : null,
    `*Telefone:* ${data.telefone}`,
    data.email ? `*E-mail:* ${data.email}` : null,
    data.servico ? `*Serviço:* ${data.servico}` : null,
    '',
    data.mensagem,
  ];
  return lines.filter((l) => l !== null).join('\n');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setStatus('', '');

  const invalid = Object.keys(rules).filter((name) => !validateField(name));
  if (invalid.length) {
    form.elements[invalid[0]].focus();
    setStatus('erro', 'Confira os campos destacados.');
    return;
  }

  // Robôs preenchem o campo escondido; pessoas não
  if (form.elements._honey.value) return;

  const data = Object.fromEntries(
    ['nome', 'empresa', 'telefone', 'email', 'servico', 'mensagem'].map((k) => [k, form.elements[k].value.trim()]),
  );
  const waLink = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildWhatsappText(data))}`;

  // Modo WhatsApp (sem e-mail configurado)
  if (!CONFIG.formEndpoint) {
    window.open(waLink, '_blank', 'noopener');
    setStatus('ok', `Abrimos o WhatsApp com sua mensagem pronta. É só tocar em <strong>Enviar</strong>. Não abriu? <a href="${waLink}" target="_blank" rel="noopener">Clique aqui</a>.`);
    return;
  }

  // Modo e-mail (FormSubmit)
  submitBtn.setAttribute('aria-busy', 'true');
  submitBtn.disabled = true;
  try {
    const res = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...data,
        _subject: `Novo pedido de orçamento — ${data.nome}${data.empresa ? ` (${data.empresa})` : ''}`,
        _template: 'table',
        _captcha: 'false',
      }),
    });
    if (!res.ok) throw new Error(String(res.status));
    form.reset();
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    setStatus('ok', 'Mensagem enviada! Vamos responder em breve pelo telefone ou WhatsApp informado.');
  } catch {
    setStatus('erro', `Não conseguimos enviar agora. <a href="${waLink}" target="_blank" rel="noopener">Envie pelo WhatsApp</a> — sua mensagem já vai pronta.`);
  } finally {
    submitBtn.removeAttribute('aria-busy');
    submitBtn.disabled = false;
  }
});

if (!CONFIG.formEndpoint) {
  submitBtn.querySelector('.btn-label').textContent = 'Enviar pelo WhatsApp';
}

/* ---------- Ano no rodapé ---------- */
document.getElementById('ano').textContent = new Date().getFullYear();

/* ---------- Assinatura ---------- */
console.log(
  '%cAfiaCorte%c — site desenvolvido por Eduardo Sette\nhttps://edsette.github.io/edusettewebdev/',
  'background:#94b715;color:#231f20;font-weight:700;padding:2px 6px;border-radius:4px',
  'color:inherit',
);
