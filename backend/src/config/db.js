const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://gastro_user:gastro_password@localhost:5432/gastro_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB Pool Error] Error inesperado en el cliente inactivo de PostgreSQL:', err);
});

/**
 * Ejecuta una consulta SQL en el pool
 * @param {string} text - Consulta parametrizada
 * @param {Array} params - Parámetros de la consulta
 */
const query = (text, params) => pool.query(text, params);

/**
 * Valida el estado de conexión con la base de datos
 */
const checkConnection = async () => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, current_database() as database_name, version() as pg_version');
    const duration = Date.now() - start;
    
    // Obtener recuento de tablas iniciales creadas en el schema public
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    return {
      connected: true,
      latencyMs: duration,
      database: result.rows[0].database_name,
      serverTime: result.rows[0].current_time,
      tablesCount: tablesResult.rows.length,
      tables: tablesResult.rows.map(r => r.table_name)
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

module.exports = {
  pool,
  query,
  checkConnection
};
