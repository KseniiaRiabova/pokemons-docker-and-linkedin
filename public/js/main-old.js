document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('pokemonModal');
  const closeBtn = document.querySelector('.close');
  const pokemonCards = document.querySelectorAll('.pokemon-card');

  pokemonCards.forEach((card) => {
    card.addEventListener('click', function () {
      const index = this.getAttribute('data-index');
      openModal(index);
    });
  });

  closeBtn.addEventListener('click', function () {
    closeModal();
  });

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });

  function openModal(index) {
    fetch(`/api/pokemon/${index}`)
      .then((response) => response.json())
      .then((pokemon) => {
        document.getElementById('modalName').textContent = pokemon.pokemonName;
        document.getElementById('modalPhrase').textContent = pokemon.phrase;
        document.getElementById('modalUserName').textContent = pokemon.userName;
        document.getElementById('modalUserLink').href = pokemon.userProfile;
        document.getElementById('modalGif').src = pokemon.gif;
        document.getElementById('modalGif').alt = `${pokemon.pokemonName} GIF`;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      })
      .catch((error) => {
        console.error('Error fetching Pokemon data:', error);
      });
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  const images = document.querySelectorAll('.pokemon-card img');
  images.forEach((img) => {
    img.addEventListener('load', function () {
      this.style.opacity = '1';
    });

    img.addEventListener('error', function () {
      this.src =
        'https://via.placeholder.com/150x150/667eea/white?text=Pokemon';
      this.style.opacity = '1';
    });

    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
  });

  document.documentElement.style.scrollBehavior = 'smooth';

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  pokemonCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${
      index * 0.1
    }s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));
  }
});
