const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function loadPokemonData() {
  try {
    const dataPath = path.join(__dirname, '../data/pokemons.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading Pokemon data:', error);
    return [];
  }
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = array.map((item, index) => ({
    ...item,
    originalIndex: index,
  }));

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

router.get('/', (req, res) => {
  const pokemons = loadPokemonData();
  const shuffledPokemons = shuffleArray(pokemons);
  res.render('index', {
    title: 'Pokémons Docker and LinkedIn',
    pokemons: shuffledPokemons, // Show randomly shuffled Pokemon
  });
});

router.get('/api/pokemon/all', (req, res) => {
  const pokemons = loadPokemonData();
  res.json(pokemons);
});

router.get('/api/pokemon/:index', (req, res) => {
  const pokemons = loadPokemonData();
  const index = parseInt(req.params.index);

  if (index >= 0 && index < pokemons.length) {
    res.json(pokemons[index]);
  } else {
    res.status(404).json({ error: 'Pokemon not found' });
  }
});

module.exports = router;
