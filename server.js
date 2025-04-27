const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});
const port = 3000;

const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';

const users = [];
const scenes = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('No token provided');
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid token');
    }
    req.user = user;
    next();
  });
};

const path = require('path');

app.use(express.json());

app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }
  if (users.find(user => user.username === username)) {
    return res.status(400).send('Username already exists');
  }
  const user = { id: users.length + 1, username, password };
  users.push(user);
  res.status(201).send({ message: 'User created' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
  res.send({ token });
});

app.post('/scenes', authenticateToken, (req, res) => {
  const { name, objects } = req.body;
  const scene = {
    id: `scene${scenes.length + 1}`,
    name,
    objects,
    ownerId: req.user.userId
  };
  scenes.push(scene);
  res.status(201).send(scene);
});

app.get('/scenes/:id', authenticateToken, (req, res) => {
  const sceneId = req.params.id;
  const scene = scenes.find(scene => scene.id === sceneId);
  if (!scene) {
    return res.status(404).send({ message: 'Scene not found' });
  }
  res.send(scene);
});

app.patch('/scenes/:id', authenticateToken, (req, res) => {
  const sceneId = req.params.id;
  const { name, objects } = req.body;
  const scene = scenes.find(scene => scene.id === sceneId);
  if (!scene) {
    return res.status(404).send({ message: 'Scene not found' });
  }
  if (name) {
    scene.name = name;
  }
  if (objects) {
    scene.objects = objects;
  }
  res.send(scene);
});

app.delete('/scenes/:id', authenticateToken, (req, res) => {
  const sceneId = req.params.id;
  const sceneIndex = scenes.findIndex(scene => scene.id === sceneId);
  if (sceneIndex === -1) {
    return res.status(404).send({ message: 'Scene not found' });
  }
  if (scenes[sceneIndex].ownerId !== req.user.userId) {
    return res.status(403).send({ message: 'You are not the owner of this scene' });
  }
  scenes.splice(sceneIndex, 1);
  res.status(204).send();
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket');

  socket.on('disconnect', () => {
    console.log('A user disconnected from WebSocket');
  });

  socket.on('joinScene', (sceneId) => {
    socket.join(sceneId);
    console.log(`User joined scene: ${sceneId}`);
  });

  socket.on('objectUpdated', (data) => {
    console.log('Received object update:', data);
    io.to(data.sceneId).emit('objectUpdated', data); // Broadcast to all in the scene
  });

  socket.on('objectCreated', (data) => {
    console.log('Server received object creation:', data);
    io.to(data.sceneId).emit('objectCreated', data); // Broadcast to all in the scene
  });

  socket.on('objectDeleted', (data) => {
    console.log('Server received object deletion:', data);
    io.to(data.sceneId).emit('objectDeleted', data); // Broadcast to all in the scene
  });
});

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});