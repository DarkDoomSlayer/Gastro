const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');

// Rutas de salud y arquitectura base
router.use('/', healthRoutes);

// Placeholder para futuras rutas de negocio (Sprint 1)
const placeholderHandler = (cuId, name) => (req, res) => {
  res.status(501).json({
    status: 'NOT_IMPLEMENTED',
    message: `El endpoint para ${name} (${cuId}) está contemplado en la arquitectura base pero su funcionalidad se construirá en el Sprint 1 conforme al plan de iteración.`,
    caso_de_uso: cuId,
    fase_actual: 'Arquitectura Base y Diseño de Base de Datos'
  });
};

router.all('/auth/*', placeholderHandler('CU-01', 'Gestión de Cuentas de Usuario'));
router.all('/ingredients/*', placeholderHandler('CU-02 / CU-03', 'Catálogo de Insumos'));
router.all('/recipes/*', placeholderHandler('CU-04 / CU-05 / CU-06 / CU-07', 'Recetas y Costeo'));

module.exports = router;
