// Seu código (mantido)
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('active');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.benefit-card, .product-card-wrapper').forEach(card => {
  observer.observe(card);
});

// NOVO: Flip com clique
document.querySelectorAll('[data-flip]').forEach(wrapper => {
  const detailsBtn = wrapper.querySelector('.details-btn');
  const backBtn = wrapper.querySelector('.back-btn');

  detailsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapper.classList.add('flipped');
  });

  backBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapper.classList.remove('flipped');
  });

  // Fecha ao clicar fora (opcional)
  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper) {
      wrapper.classList.remove('flipped');
    }
  });
});

// === VEJA MAIS - EXPANDIR CARDS ===
const loadMoreBtn = document.getElementById('loadMoreBtn');
const hiddenCards = document.querySelectorAll('.hidden-card');

loadMoreBtn.addEventListener('click', () => {
  hiddenCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('show');
    }, index * 100); // Animação escalonada
  });

  loadMoreBtn.classList.add('hidden');
});