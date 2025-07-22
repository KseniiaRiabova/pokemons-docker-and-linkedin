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

// Main route - Display all Pokemon cards
router.get('/', (req, res) => {
  const pokemons = loadPokemonData();
  res.render('index', { 
    title: 'Pokémons Docker and LinkedIn',
    pokemons: pokemons // Show all Pokemon now, not just 20
  });
});

// API route to get all Pokemon data (for search functionality)
router.get('/api/pokemon/all', (req, res) => {
  const pokemons = loadPokemonData();
  res.json(pokemons);
});

// API route to get Pokemon data by index (for modal)
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
