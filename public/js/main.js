// Global variables
let allPokemonData = [];

// Welcome screen and search functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('pokemonModal');
    const closeBtn = document.querySelector('.close');
    
    // Initialize the application
    initializeApp();
    
    // Load all Pokemon data for search functionality
    loadAllPokemonData();
    
    // Add event listeners for modal
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Search input enter key support
    const searchInput = document.getElementById('pokemonSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchPokemon();
            }
        });
    }
});

function initializeApp() {
    // Show welcome screen by default
    showWelcome();
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

// Welcome screen functions
function showWelcome() {
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showAllPokemon() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // Add click events to pokemon cards
    setTimeout(() => {
        addPokemonCardEvents();
        animateCards();
    }, 100);
}

function addPokemonCardEvents() {
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    pokemonCards.forEach(card => {
        card.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            openModal(index);
        });
    });
}

// Search functionality
async function searchPokemon() {
    const searchInput = document.getElementById('pokemonSearch');
    const searchResult = document.getElementById('searchResult');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        alert('Please enter a Pokémon name');
        return;
    }
    
    // If we don't have the data yet, load it
    if (allPokemonData.length === 0) {
        await loadAllPokemonData();
    }
    
    // Search for the Pokemon
    const pokemon = allPokemonData.find(p => 
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
    const searchResult = document.getElementById('searchResult');
    searchResult.innerHTML = `
        <div class="pokemon-card-individual">
            <img src="${pokemon.image}" alt="${pokemon.pokemonName}" />
            <h3>${pokemon.pokemonName}</h3>
            <div class="message">${pokemon.phrase}</div>
            <div class="user-info">
                <a href="${pokemon.userProfile}" target="_blank" class="linkedin-link">
                    <i class="fab fa-linkedin"></i>
                    <span>${pokemon.userName}</span>
                </a>
                ${pokemon.userTitle ? `<p class="user-title">${pokemon.userTitle}</p>` : ''}
            </div>
            <button onclick="openModalFromSearch('${pokemon.pokemonName}')" class="view-gif-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 15px; cursor: pointer;">
                <i class="fas fa-play"></i> View GIF
            </button>
        </div>
    `;
    searchResult.style.display = 'block';
    
    // Scroll to result
    searchResult.scrollIntoView({ behavior: 'smooth' });
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

function openModalFromSearch(pokemonName) {
    const index = allPokemonData.findIndex(p => p.pokemonName === pokemonName);
    if (index !== -1) {
        openModal(index);
    }
}

// Modal functionality
function openModal(index) {
    const modal = document.getElementById('pokemonModal');
    
    fetch(`/api/pokemon/${index}`)
        .then(response => response.json())
        .then(pokemon => {
            // Update modal content
            document.getElementById('modalName').textContent = pokemon.pokemonName;
            document.getElementById('modalPhrase').textContent = pokemon.phrase;
            document.getElementById('modalUserName').textContent = pokemon.userName;
            document.getElementById('modalUserLink').href = pokemon.userProfile;
            document.getElementById('modalGif').src = pokemon.gif;
            document.getElementById('modalGif').alt = `${pokemon.pokemonName} GIF`;

            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        })
        .catch(error => {
            console.error('Error fetching Pokemon data:', error);
        });
}

function closeModal() {
    const modal = document.getElementById('pokemonModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Animation functions
function animateCards() {
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    
    // Add loading states for images
    const images = document.querySelectorAll('.pokemon-card img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/150x150/667eea/white?text=Pokemon';
            this.style.opacity = '1';
        });
        
        // Set initial opacity to 0 for smooth loading effect
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });

    // Add intersection observer for card animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to cards
    pokemonCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
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

    // Apply lazy loading to modal images when needed
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}
