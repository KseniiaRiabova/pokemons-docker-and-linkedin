let allPokemonData = [];

document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('pokemonModal');
  const closeBtn = document.querySelector('.close');

  initializeApp();

  loadAllPokemonData();

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

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

  const searchInput = document.getElementById('pokemonSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        searchPokemon();
      }
    });
  }

  preloadCriticalImages();
});

function preloadCriticalImages() {
  const images = document.querySelectorAll('.pokemon-card img');
  const firstBatch = Array.from(images).slice(0, 12);

  firstBatch.forEach((img) => {
    const preloadImg = new Image();
    preloadImg.src = img.src;

    img.style.opacity = '1';
  });
}

function initializeApp() {
  showWelcome();

  initializeImages();
}

function initializeImages() {
  const images = document.querySelectorAll('.pokemon-card img');

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;

          img.style.transition = 'opacity 0.15s ease';

          if (img.complete && img.naturalHeight !== 0) {
            img.style.opacity = '1';
          } else {
            const preloadImg = new Image();
            preloadImg.onload = function () {
              img.src = preloadImg.src;
              img.style.opacity = '1';
            };
            preloadImg.onerror = function () {
              img.src =
                'https://via.placeholder.com/150x150/667eea/white?text=Pokemon';
              img.style.opacity = '1';
            };
            preloadImg.src = img.src || img.dataset.src;
          }

          imageObserver.unobserve(img);
        }
      });
    },
    {
      rootMargin: '300px',
      threshold: 0,
    }
  );

  images.forEach((img) => {
    if (img.getBoundingClientRect().top < window.innerHeight * 2) {
      const preloadImg = new Image();
      preloadImg.src = img.src;
    }
    imageObserver.observe(img);
  });

  const firstImages = Array.from(images).slice(0, 6);
  firstImages.forEach((img) => {
    img.style.opacity = '1';
    const preloadImg = new Image();
    preloadImg.src = img.src;
  });
}

async function loadAllPokemonData() {
  try {
    const response = await fetch('/api/pokemon/all');
    if (response.ok) {
      allPokemonData = await response.json();
    } else {
      console.error('Failed to load Pokemon data');
    }
  } catch (error) {
    console.error('Error loading Pokemon data:', error);
  }
}

function showWelcome() {
  document.getElementById('welcomeScreen').style.display = 'flex';
  document.getElementById('mainContent').style.display = 'none';
  document.body.style.overflow = 'auto';
}

function generatePokemonOfTheDay() {
  if (allPokemonData.length === 0) {
    console.error('Pokemon data not loaded yet');
    return;
  }

  const randomIndex = Math.floor(Math.random() * allPokemonData.length);
  const randomPokemon = allPokemonData[randomIndex];

  openModal(randomIndex);

  const button = document.querySelector('.pokemon-day-btn');
  if (button) {
    button.style.transform = 'scale(0.95)';
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    setTimeout(() => {
      button.style.transform = 'scale(1)';
      button.innerHTML =
        '<i class="fas fa-dice"></i> Generate Pokémon of the Day';
    }, 500);
  }
}

function showAllPokemon() {
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';

  shuffleCardsOnDisplay();

  const images = document.querySelectorAll('.pokemon-card img');
  images.forEach((img, index) => {
    img.style.transition = 'opacity 0.1s ease';

    if (img.complete && img.naturalHeight !== 0) {
      // Image is already loaded
      img.style.opacity = '1';
    } else {
      // Force immediate loading
      const preloadImg = new Image();
      preloadImg.onload = function () {
        img.style.opacity = '1';
      };
      preloadImg.onerror = function () {
        img.src =
          'https://via.placeholder.com/150x150/667eea/white?text=Pokemon';
        img.style.opacity = '1';
      };
      preloadImg.src = img.src;
    }
  });

  // Add click events to pokemon cards and animate
  setTimeout(() => {
    addPokemonCardEvents();
    animateCards();
  }, 50); // Reduced timeout for faster responsiveness
}

// Shuffle cards when displaying the collection
function shuffleCardsOnDisplay() {
  const gridContainer = document.querySelector('.grid-container');
  if (!gridContainer) return;

  const cards = Array.from(gridContainer.children);

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  // Clear the container and re-append shuffled cards
  gridContainer.innerHTML = '';
  cards.forEach((card) => {
    gridContainer.appendChild(card);
  });
}

function addPokemonCardEvents() {
  const pokemonCards = document.querySelectorAll('.pokemon-card');
  pokemonCards.forEach((card) => {
    card.addEventListener('click', function () {
      const index = this.getAttribute('data-index');
      openModal(index);
    });
  });
}

async function searchPokemon() {
  const searchInput = document.getElementById('pokemonSearch');
  const searchResult = document.getElementById('searchResult');
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    alert('Please enter a Pokémon name');
    return;
  }

  if (allPokemonData.length === 0) {
    await loadAllPokemonData();
  }

  const pokemon = allPokemonData.find(
    (p) =>
      p.pokemonName.toLowerCase().includes(query) ||
      p.pokemonName.toLowerCase() === query
  );

  if (pokemon) {
    displaySearchResult(pokemon);
  } else {
    displayNoResult(query);
  }
}

function displaySearchResult(pokemon) {
  const index = allPokemonData.findIndex(
    (p) => p.pokemonName === pokemon.pokemonName
  );

  if (index !== -1) {
    openModal(index);
  }
}

function displayNoResult(query) {
  const searchResult = document.getElementById('searchResult');
  searchResult.innerHTML = `
        <div class="pokemon-card-individual">
            <i class="fas fa-search" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
            <h3>No Pokémon Found</h3>
            <p>Sorry, we couldn't find a Pokémon named "${query}" in our collection.</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                Try searching for: Pikachu, Charizard, Alakazam, Snorlax, or any other Pokémon from our collection.
            </p>
        </div>
    `;
  searchResult.style.display = 'block';
}

function openModal(index) {
  const modal = document.getElementById('pokemonModal');

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
  const modal = document.getElementById('pokemonModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function animateCards() {
  const pokemonCards = document.querySelectorAll('.pokemon-card');

  const images = document.querySelectorAll('.pokemon-card img');
  images.forEach((img) => {
    if (!img.hasAttribute('data-animated')) {
      img.setAttribute('data-animated', 'true');

      if (img.complete && img.naturalHeight !== 0) {
        img.style.opacity = '1';
      } else {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';

        img.addEventListener('load', function () {
          this.style.opacity = '1';
        });

        img.addEventListener('error', function () {
          this.src =
            'https://via.placeholder.com/150x150/667eea/white?text=Pokemon';
          this.style.opacity = '1';
        });
      }
    }
  });

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
    if (!card.hasAttribute('data-card-animated')) {
      card.setAttribute('data-card-animated', 'true');
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `opacity 0.6s ease ${
        index * 0.1
      }s, transform 0.6s ease ${index * 0.1}s`;
      observer.observe(card);
    }
  });
}

document.documentElement.style.scrollBehavior = 'smooth';

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
