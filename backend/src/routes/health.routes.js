const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Healthcheck general de la API
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GastroProyect Backend API',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Healthcheck de la Base de Datos PostgreSQL
router.get('/health/db', async (req, res) => {
  const dbStatus = await db.checkConnection();
  
  if (dbStatus.connected) {
    return res.status(200).json({
      status: 'UP',
      message: 'Conexión a PostgreSQL establecida con éxito',
      details: dbStatus
    });
  } else {
    return res.status(503).json({
      status: 'DOWN',
      message: 'Fallo al conectar con la base de datos PostgreSQL',
      error: dbStatus.error
    });
  }
});

// Endpoint de Especificación Arquitectónica (Trazabilidad)
router.get('/architecture', (req, res) => {
  res.json({
    proyecto: 'GastroProyect',
    equipo: 'Morelosoft International Solutions',
    estandar: 'ISO/IEC 29110-5-1-1:2025',
    fase: 'Sprint 0 — Arquitectura Base y Diseño de Persistencia',
    capas: {
      frontend: 'React 18 + Vite + Tailwind CSS (Puerto 3000)',
      backend: 'Node.js 20/22 + Express REST API (Puerto 4000)',
      database: 'PostgreSQL 16 Alpine Relacional (Puerto 5432)'
    },
    modulos_proyectados: [
      { id: 'CU-01', nombre: 'Gestionar cuenta de usuario', estado: 'ARQUITECTURA_BASE' },
      { id: 'CU-02', nombre: 'Registrar insumo', estado: 'ARQUITECTURA_BASE' },
      { id: 'CU-03', nombre: 'Administrar catálogo de insumos', estado: 'ARQUITECTURA_BASE' },
      { id: 'CU-04', nombre: 'Crear producto o receta', estado: 'ARQUITECTURA_BASE' },
      { id: 'CU-05', nombre: 'Gestionar productos o recetas', estado: 'ARQUITECTURA_BASE' },
      { id: 'CU-06', nombre: 'Calcular costo de producción', estado: 'ARQUITECTURA_BASE' },
      { id: 'CU-07', nombre: 'Calcular precio de venta', estado: 'ARQUITECTURA_BASE' },
      { id: 'CU-08', nombre: 'Actualizar costos en cascada', estado: 'ARQUITECTURA_BASE' },
      { id: 'CU-09', nombre: 'Consultar resumen de costeo', estado: 'ARQUITECTURA_BASE' }
    ]
  });
});

module.exports = router;
