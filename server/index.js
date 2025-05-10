const express = require('express');
const cors = require('cors');
const Trie = require('trie-search');
const app = express();
app.use(express.json());
app.use(cors());

// Генерация 1M виртуальных элементов
const generateVirtualData = (size = 1e6) => 
  Array.from({length: size}, (_, i) => i + 1);

// Инициализация структур
const state = {
  data: generateVirtualData(),
  trie: new Trie('id'),
  order: new Map(),
  selected: new Set(),
  version: 0
};

// Построение Trie-индекса
state.trie.addAll(state.data.map(id => ({id: id.toString()})));

// Эндпоинты
app.get('/items', (req, res) => {
  const {cursor = 0, search} = req.query;
  let result = state.data;
  
  // Фильтрация
  if (search) {
    result = state.trie.get(search).map(x => parseInt(x.id));
  }
  
  // Пагинация
  const start = parseInt(cursor);
  res.json({
    items: result.slice(start, start + 20),
    nextCursor: start + 20 < result.length ? start + 20 : null
  });
});

app.post('/state', (req, res) => {
  // Сохранение порядка и выбранных элементов
  state.order = new Map(req.body.order);
  state.selected = new Set(req.body.selected);
  res.sendStatus(200);
});

app.listen(3001, () => 
  console.log('Server running on port 3001'));