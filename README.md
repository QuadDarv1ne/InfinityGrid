# InfinityGrid: Умный менеджер для больших данных

**Объяснение названия:** `«Infinity»` подчеркивает работу с бесконечными наборами данных, `«Grid»` — табличную структуру с сортировкой и выбором.

## Для чего проект?

**Проект решает 4 ключевые проблемы современных веб-интерфейсов:**

- 📉 `Производительность` при работе с миллионами элементов.
- 🧩 `Сохранение состояния сложных взаимодействий` (выбор, сортировка, фильтры).
- 🔍 `Интуитивный поиск в реальном времени` по гигабайтам виртуальных данных.
- 📱 `Адаптивность` — одинаково работает на слабых устройствах и мощных рабочих станциях.

**Целевое применение:**

- - Админ-панели для `Big Data`
- - Системы управления инвентарем (склады, логистика)
- - Финансовые аналитические инструменты
- - `CRM` с огромными базами клиентов

**Философия проекта:**

```textline
 -------------------------------------------------------------------
| «Мы не грузим данные — мы их вызываем из цифровой пустоты,        |
| Не храним состояние — замораживаем момент в кристалле алгоритмов, |
| Не ищем — предугадываем,                                          |
| Потому что в мире, где каждая миллисекунда стоит доллара,         |
| InfinityGrid — ваш хронометр победы.»                             |
 -------------------------------------------------------------------
```

### 1. Подготовка окружения

**Необходимые инструменты:**

- Node.js v18+
- npm/yarn
- Git
- Docker (опционально для деплоя)
- IDE (VS Code, WebStorm)

```bash
# Проверка версий
node -v && npm -v
```

### 2. Инициализация проекта

```bash
mkdir infinilist && cd infinilist
mkdir server client

# Инициализация сервера
cd server && npm init -y
npm install express cors compression lodash trie-search

# Инициализация клиента
cd ../client
npx create-react-app . --template typescript
npm install react-virtuoso @dnd-kit/core zustand react-query axios lodash.debounce
```

### 3. Настройка сервера (Express)

- - **Файл:** `server/index.js`

```javascript
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
```

### 4. Реализация клиента (React)

- - **Файл:** `client/src/App.tsx`

```typescript
import {DndContext} from '@dnd-kit/core';
import {Virtuoso} from 'react-virtuoso';
import {useQueryClient, useInfiniteQuery} from 'react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

const fetchItems = async ({pageParam = 0, search = ''}) => {
  const res = await axios.get(`${API_URL}/items`, {
    params: {cursor: pageParam, search}
  });
  return res.data;
};

export default function List() {
  const [search, setSearch] = useState('');
  const {data, fetchNextPage} = useInfiniteQuery(
    ['items', search], 
    fetchItems,
    {getNextPageParam: (lastPage) => lastPage.nextCursor}
  );

  const handleSearch = useDebounce((value) => {
    setSearch(value);
    fetchNextPage({pageParam: 0});
  }, 300);

  return (
    <DndContext onDragEnd={handleDrag}>
      <input 
        type="text" 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search 1M items..."
      />
      
      <Virtuoso
        style={{height: '80vh'}}
        data={data?.pages.flatMap(p => p.items) || []}
        endReached={() => fetchNextPage()}
        itemContent={(index) => (
          <div className="item">
            <Checkbox />
            {data.pages.flatMap(p => p.items)[index]}
          </div>
        )}
      />
    </DndContext>
  );
}
```

### 5. Запуск локально

**В двух терминалах:**

```bash
# Сервер
cd server && node index.js

# Клиент
cd client && npm start
```

--

💼 **Автор:** Дуплей Максим Игоревич

📲 **Telegram:** @quadd4rv1n7

📅 **Дата:** 10.05.2025

▶️ **Версия 1.0**

```textline
※ Предложения по сотрудничеству можете присылать на почту ※
📧 maksimqwe42@mail.ru
```
