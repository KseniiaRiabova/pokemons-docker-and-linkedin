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

  const collectionSearchInput = document.getElementById('collectionSearch');
  if (collectionSearchInput) {
    collectionSearchInput.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        searchInCollection();
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

  // Make sure allPokemonData is loaded
  if (allPokemonData.length === 0) {
    loadAllPokemonData();
  }

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

  setTimeout(() => {
    addPokemonCardEvents();
    animateCards();
    applyMissingNoEffect();
  }, 50);
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
    alert('Please enter a Pokémon name or person name');
    return;
  }

  if (allPokemonData.length === 0) {
    await loadAllPokemonData();
  }

  const pokemon = allPokemonData.find(
    (p) =>
      p.pokemonName.toLowerCase().includes(query) ||
      p.pokemonName.toLowerCase() === query ||
      p.userName.toLowerCase().includes(query) ||
      p.userName.toLowerCase() === query
  );

  if (pokemon) {
    showWelcome();
    document.getElementById('mainContent').style.display = 'none';

    showNotification(
      'Match found! Showing ' +
        pokemon.pokemonName +
        ' for ' +
        pokemon.userName,
      'success'
    );

    setTimeout(() => {
      showAllPokemon();

      setTimeout(() => {
        scrollToAndHighlightCard(pokemon);
      }, 300);
    }, 500);
  } else {
    showNotification(
      'No Pokémon or person found matching "' + query + '"',
      'error'
    );
    displayNoResult(query);
  }
}

function displaySearchResult(pokemon) {
  // This function is kept for compatibility but now uses the scroll method instead
  scrollToAndHighlightCard(pokemon);
}

function scrollToAndHighlightCard(pokemon) {
  const index = allPokemonData.findIndex(
    (p) => p.pokemonName === pokemon.pokemonName
  );

  if (index !== -1) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');

    if (welcomeScreen.style.display !== 'none') {
      welcomeScreen.style.display = 'none';
      mainContent.style.display = 'block';
    }

    const card = document.querySelector(`.pokemon-card[data-index="${index}"]`);

    if (card) {
      const allCards = document.querySelectorAll('.pokemon-card');
      allCards.forEach((c) => (c.style.display = 'block'));

      setTimeout(() => {
        const cardRect = card.getBoundingClientRect();
        const cardTop = window.pageYOffset + cardRect.top;
        window.scrollTo({
          top: cardTop - 100,
          behavior: 'smooth',
        });

        // Play a small animation before adding the highlight
        card.style.transition = 'transform 0.2s ease-out';
        card.style.transform = 'scale(0.95)';

        setTimeout(() => {
          card.style.transform = 'scale(1.15)';

          card.classList.add('card-highlight');

          setTimeout(() => {
            card.classList.remove('card-highlight');
            card.style.transform = '';
            card.style.transition = '';

            card.classList.add('card-found');

            const otherCards = document.querySelectorAll(
              '.pokemon-card:not(.card-found)'
            );
            otherCards.forEach((otherCard) => {
              otherCard.style.opacity = '0.7';
              otherCard.style.transform = 'scale(0.95)';
            });

            setTimeout(() => {
              card.classList.remove('card-found');
              otherCards.forEach((otherCard) => {
                otherCard.style.opacity = '';
                otherCard.style.transform = '';
              });
            }, 5000);
          }, 3000);
        }, 200);
      }, 100);
    }
  }
}

function displayNoResult(query) {
  const searchResult = document.getElementById('searchResult');
  searchResult.innerHTML = `
        <div class="pokemon-card-individual">
            <i class="fas fa-search" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
            <h3>No Results Found</h3>
            <p>Sorry, we couldn't find a Pokémon or person matching "${query}" in our collection.</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                Try searching for a Pokémon name (like Pikachu, Charizard) or a person's name (like Kseniia, Ahmed).
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

      // Special handling for MissingNo.
      if (pokemon.pokemonName === 'MissingNo.') {
        const modalGif = document.getElementById('modalGif');
        modalGif.classList.add('glitched-image');
        modalGif.style.animation = 'glitch-animation 3s infinite';
        modalGif.style.filter = 'contrast(1.5) brightness(1.2)';
        modalGif.style.imageRendering = 'pixelated';

        const modalContent = document.querySelector('.modal-content');
        modalContent.classList.add('glitched-content');
      } else {
        document.getElementById('modalGif').classList.remove('glitched-image');
        document.getElementById('modalGif').style = '';
        document
          .querySelector('.modal-content')
          .classList.remove('glitched-content');
      }

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

function searchInCollection() {
  const searchInput = document.getElementById('collectionSearch');
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    showAllCards();
    return;
  }

  filterCardsByQuery(query);
}

function showAllCards() {
  const pokemonCards = document.querySelectorAll('.pokemon-card');
  pokemonCards.forEach((card) => {
    card.style.display = 'block';
  });

  document
    .querySelector('.pokemon-grid')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterCardsByQuery(query) {
  if (allPokemonData.length === 0) {
    console.error('Pokemon data not loaded');
    return;
  }

  const pokemonCards = document.querySelectorAll('.pokemon-card');
  let foundAny = false;
  let firstMatchedPokemon = null;

  pokemonCards.forEach((card) => {
    const index = card.getAttribute('data-index');
    const pokemon = allPokemonData[index];

    if (
      pokemon &&
      (pokemon.pokemonName.toLowerCase().includes(query) ||
        pokemon.userName.toLowerCase().includes(query))
    ) {
      card.style.display = 'block';
      foundAny = true;

      if (!firstMatchedPokemon) {
        firstMatchedPokemon = pokemon;
      }
    } else {
      card.style.display = 'none';
    }
  });

  const gridContainer = document.querySelector('.grid-container');
  const noResultsEl = document.getElementById('noCollectionResults');

  if (!foundAny) {
    if (!noResultsEl) {
      const noResults = document.createElement('div');
      noResults.id = 'noCollectionResults';
      noResults.className = 'no-results';
      noResults.innerHTML = `
        <i class="fas fa-search" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
        <h3>No Results Found</h3>
        <p>No Pokémon or person matching "${query}" was found.</p>
        <button onclick="showAllCards()" class="show-all-btn">
          <i class="fas fa-undo"></i> Show All Cards
        </button>
      `;
      gridContainer.appendChild(noResults);
    }
  } else if (noResultsEl) {
    noResultsEl.remove();
  }

  if (foundAny && firstMatchedPokemon) {
    showNotification(
      'Match found! Scrolling to ' + firstMatchedPokemon.pokemonName + '...',
      'success'
    );

    setTimeout(() => {
      scrollToAndHighlightCard(firstMatchedPokemon);
    }, 500);
  } else {
    document
      .querySelector('.pokemon-grid')
      .scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function showNotification(message, type = 'info') {
  const existingNotification = document.getElementById('search-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'search-notification';
  notification.className = `notification ${type}`;

  let icon = '';
  if (type === 'success') {
    icon = '<i class="fas fa-check-circle"></i>';
  } else if (type === 'error') {
    icon = '<i class="fas fa-exclamation-circle"></i>';
  } else {
    icon = '<i class="fas fa-info-circle"></i>';
  }

  notification.innerHTML = `${icon} ${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(-50%) translateY(0)';
    notification.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    notification.style.transform = 'translateX(-50%) translateY(-100px)';
    notification.style.opacity = '0';

    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// Function to apply special effects to MissingNo. card
function applyMissingNoEffect() {
  if (allPokemonData.length === 0) {
    return;
  }

  // Find the index of MissingNo. in the data
  const missingNoIndex = allPokemonData.findIndex(
    (pokemon) => pokemon.pokemonName === 'MissingNo.'
  );

  if (missingNoIndex === -1) {
    return;
  }

  const allCards = document.querySelectorAll('.pokemon-card');
  allCards.forEach((card) => {
    const cardIndex = parseInt(card.getAttribute('data-index'));

    if (cardIndex === missingNoIndex) {
      card.classList.add('missingno-card');

      // Add some random glitchy behavior
      setInterval(() => {
        if (Math.random() > 0.98) {
          // Occasionally apply a more extreme glitch effect
          card.style.transform = `skew(${Math.random() * 10 - 5}deg)`;

          // Reset after a short time
          setTimeout(() => {
            card.style.transform = '';
          }, 200 + Math.random() * 300);
        }
      }, 1000);
    }
  });
}
