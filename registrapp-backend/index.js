// index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simular una base de datos (en un proyecto real, usarías una base de datos real)
let users = [];
let attendances = [];

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de RegistrAPP');
});

// Registro de usuarios
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, name, email, password: hashedPassword, role };
    users.push(newUser);
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el registro' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey');
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } else {
      res.status(400).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el login' });
  }
});

// Generar código QR (para profesores)
app.post('/generate-qr', (req, res) => {
  const { professorId, className } = req.body;
  const qrCode = `class_${professorId}_${className}_${Date.now()}`;
  res.json({ qrCode });
});

// Registrar asistencia (para alumnos)
app.post('/register-attendance', (req, res) => {
  const { studentId, qrCode } = req.body;
  attendances.push({ studentId, qrCode, timestamp: new Date() });
  res.json({ message: 'Asistencia registrada con éxito' });
});

// Obtener asistencias (para profesores)
app.get('/attendances/:professorId', (req, res) => {
  const { professorId } = req.params;
  // En un caso real, filtrarías las asistencias por profesor
  res.json(attendances);
});

const PORT = process.env.PORT || 4000; // Cambiar a otro puerto como 4000
app.listen(PORT, () => {
  console.log(`Servidor de RegistrAPP escuchando en el puerto ${PORT}`);
});