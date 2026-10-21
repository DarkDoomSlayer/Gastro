require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    servicio: 'GastroProyect Backend API',
    version: '0.1.0',
    descripcion: 'Herramienta de software para administración de insumos y costeo de recetas gastronómicas',
    equipo: 'Morelosoft International Solutions',
    estandar: 'ISO/IEC 29110-5-1-1:2025',
    endpoints_disponibles: {
      health: '/api/health',
      database_health: '/api/health/db',
      architecture_info: '/api/architecture'
    }
  });
});

// Enrutador principal bajo prefijo /api
app.use('/api', routes);

// Middleware para manejo de 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Inicialización del servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Gastro Backend] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  console.log(`[Gastro Backend] Base de datos configurada en: ${process.env.DATABASE_URL || 'localhost:5432'}`);
});

module.exports = app;
