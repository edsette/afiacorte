// Menu mobile
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('active');
});

// Animação ao rolar
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.benefit-card, .product-card').forEach(card => {
  observer.observe(card);
});
// Animação de detalhes do produto
document.querySelectorAll('.info-btn').forEach(button => {
  button.addEventListener("click", function() {
    let description = this.parentElement.querySelector(".description");
    if (description.style.display === "block") {
      description.style.display = "none";
      this.textContent = "Details";
    } else {
      description.style.display = "block";
      this.textContent = "Hide details";
    }
  });
});