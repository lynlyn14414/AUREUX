const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5173;
const DATA_FILE = path.join(__dirname, 'shared-data.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const defaultData = {
  users: [],
  drafts: [],
  posts: [],
  ratings: [],
  conversations: [],
  following: {},
  notifications: []
};

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading data:', e.message);
  }
  return { ...defaultData };
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing data:', e.message);
  }
}

if (!fs.existsSync(DATA_FILE)) {
  writeData(defaultData);
}

app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const data = req.body;
  writeData(data);
  res.json({ ok: true });
});

app.post('/api/users/register', (req, res) => {
  const { username, password, email, isAdmin, adminCode } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  if (isAdmin && adminCode !== 'AUREUX2024') return res.status(403).json({ error: 'Invalid admin code' });

  const data = readData();
  const exists = data.users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Username taken' });

  const newUser = {
    id: (isAdmin ? 'admin_' : 'user_') + Date.now(),
    username,
    email: email || '',
    password,
    avatar: '',
    banner: '',
    status: '',
    isAdmin: !!isAdmin
  };
  data.users.push(newUser);
  writeData(data);
  res.json(newUser);
});

app.post('/api/users/login', (req, res) => {
  const { username, password, isAdmin } = req.body;
  const data = readData();
  const user = data.users.find(u =>
    u.username.toLowerCase() === username.toLowerCase() &&
    u.password === password &&
    u.isAdmin === !!isAdmin
  );
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const data = readData();
  const idx = data.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  data.users[idx] = { ...data.users[idx], ...req.body };
  writeData(data);
  res.json(data.users[idx]);
});

app.get('/api/users', (req, res) => {
  const data = readData();
  res.json(data.users);
});

app.get('/api/drafts', (req, res) => {
  const data = readData();
  res.json(data.drafts);
});

app.post('/api/drafts', (req, res) => {
  const data = readData();
  const draft = req.body;
  const idx = data.drafts.findIndex(d => d.id === draft.id);
  if (idx >= 0) {
    data.drafts[idx] = { ...draft, lastUpdated: new Date().toISOString() };
  } else {
    data.drafts.push({ ...draft, lastUpdated: new Date().toISOString() });
  }
  writeData(data);
  res.json({ ok: true });
});

app.delete('/api/drafts/:id', (req, res) => {
  const data = readData();
  data.drafts = data.drafts.filter(d => d.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

app.get('/api/posts', (req, res) => {
  const data = readData();
  res.json(data.posts);
});

app.post('/api/posts', (req, res) => {
  const data = readData();
  const post = req.body;
  const idx = data.posts.findIndex(p => p.id === post.id);
  if (idx >= 0) {
    data.posts[idx] = post;
  } else {
    data.posts.unshift(post);
  }
  writeData(data);
  res.json({ ok: true });
});

app.get('/api/ratings', (req, res) => {
  const data = readData();
  res.json(data.ratings);
});

app.post('/api/ratings', (req, res) => {
  const data = readData();
  const { storyId, userId, rating } = req.body;
  const idx = data.ratings.findIndex(r => r.storyId === storyId && r.userId === userId);
  if (idx >= 0) {
    data.ratings[idx].rating = rating;
  } else {
    data.ratings.push({ storyId, userId, rating });
  }
  writeData(data);
  res.json({ ok: true });
});

app.get('/api/conversations', (req, res) => {
  const data = readData();
  res.json(data.conversations);
});

app.post('/api/conversations', (req, res) => {
  const data = readData();
  data.conversations = req.body;
  writeData(data);
  res.json({ ok: true });
});

app.post('/api/following', (req, res) => {
  const data = readData();
  const { userId, following } = req.body;
  if (!data.following) data.following = {};
  data.following[userId] = following;
  writeData(data);
  res.json({ ok: true });
});

app.get('/api/following/:userId', (req, res) => {
  const data = readData();
  res.json(data.following?.[req.params.userId] || []);
});

app.get('/api/followers/:userId', (req, res) => {
  const data = readData();
  const userId = req.params.userId;
  // Find all users who have this userId in their following list
  const followers = [];
  for (const [uid, followingList] of Object.entries(data.following || {})) {
    if (Array.isArray(followingList) && followingList.includes(userId)) {
      followers.push(uid);
    }
  }
  res.json(followers);
});

app.post('/api/clear', (req, res) => {
  writeData({ ...defaultData });
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HECATE API server running on http://localhost:${PORT}`);
});
