import React, { useState, useEffect } from 'react';
import { checkBackendHealth, checkDatabaseHealth, fetchArchitectureInfo } from './services/api';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ loading: true, data: null });
  const [dbStatus, setDbStatus] = useState({ loading: true, data: null });
  const [archInfo, setArchInfo] = useState(null);

  const refreshStatus = async () => {
    setBackendStatus({ loading: true, data: null });
    setDbStatus({ loading: true, data: null });

    const [bHealth, dHealth, aInfo] = await Promise.all([
      checkBackendHealth(),
      checkDatabaseHealth(),
      fetchArchitectureInfo()
    ]);

    setBackendStatus({ loading: false, data: bHealth });
    setDbStatus({ loading: false, data: dHealth });
    setArchInfo(aInfo);
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const modules = archInfo?.modulos_proyectados || [
    { id: 'CU-01', nombre: 'Gestionar cuenta de usuario', estado: 'ARQUITECTURA_BASE' },
    { id: 'CU-02', nombre: 'Registrar insumo', estado: 'ARQUITECTURA_BASE' },
    { id: 'CU-03', nombre: 'Administrar catálogo de insumos', estado: 'ARQUITECTURA_BASE' },
    { id: 'CU-04', nombre: 'Crear producto o receta', estado: 'ARQUITECTURA_BASE' },
    { id: 'CU-05', nombre: 'Gestionar productos o recetas', estado: 'ARQUITECTURA_BASE' },
    { id: 'CU-06', nombre: 'Calcular costo de producción', estado: 'ARQUITECTURA_BASE' },
    { id: 'CU-07', nombre: 'Calcular precio de venta', estado: 'ARQUITECTURA_BASE' },
    { id: 'CU-08', nombre: 'Actualizar costos en cascada', estado: 'ARQUITECTURA_BASE' },
    { id: 'CU-09', nombre: 'Consultar resumen de costeo', estado: 'ARQUITECTURA_BASE' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xl shadow">
              🍳
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">GastroProyect</h1>
              <p className="text-xs text-slate-500 font-medium">
                Morelosoft International Solutions &bull; Estándar ISO/IEC 29110-5-1-1
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshStatus}
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              🔄 Actualizar Estado
            </button>
            <span className="text-xs bg-orange-100 text-orange-800 font-semibold px-2.5 py-1 rounded-full border border-orange-200">
              Sprint 0 &bull; Arquitectura Base
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Banner de Estado de Arquitectura Base */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block text-xs uppercase tracking-wider font-bold bg-white/20 px-2.5 py-0.5 rounded mb-2">
                Punto de Control Inicial &bull; Tech Lead
              </span>
              <h2 className="text-2xl font-black">Arquitectura Base y Persistencia Desplegada</h2>
              <p className="text-orange-100 text-sm max-w-2xl mt-1">
                Estructura base multicapa (SPA React + API REST Node.js + Base de Datos Relacional PostgreSQL 16) orquestada en Docker Compose. 100% trazable con el Acuerdo de Proyecto y el Plan de Iteración.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-right">
              <div className="text-xs font-medium text-orange-100">Estado del Sistema</div>
              <div className="text-lg font-bold flex items-center justify-end gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                Operativo
              </div>
            </div>
          </div>
        </section>

        {/* Indicadores de Salud de las 3 Capas */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Capa Frontend */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capa Cliente</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Frontend Web (SPA)</h3>
              <p className="text-xs text-slate-500 mt-1">React 18 + Vite + Tailwind CSS</p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Puerto Host:</span>
                  <span className="font-mono font-medium">3000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Contenedor:</span>
                  <span className="font-mono font-medium">gastro_web</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Estado:</span>
                  <span className="font-semibold text-emerald-600">En Línea</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Capa Backend */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capa Servidor</span>
                <span className={`w-2.5 h-2.5 rounded-full ${backendStatus.loading ? 'bg-amber-400 animate-ping' : backendStatus.data?.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Backend API REST</h3>
              <p className="text-xs text-slate-500 mt-1">Node.js + Express (Modular Layered)</p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Puerto Host:</span>
                  <span className="font-mono font-medium">4000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Contenedor:</span>
                  <span className="font-mono font-medium">gastro_api</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Estado API:</span>
                  <span className={`font-semibold ${backendStatus.data?.status === 'healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {backendStatus.loading ? 'Consultando...' : backendStatus.data?.status === 'healthy' ? 'En Línea (Healthy)' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Capa Base de Datos */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capa Persistencia</span>
                <span className={`w-2.5 h-2.5 rounded-full ${dbStatus.loading ? 'bg-amber-400 animate-ping' : dbStatus.data?.status === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">PostgreSQL Relacional</h3>
              <p className="text-xs text-slate-500 mt-1">PostgreSQL 16 Alpine + pgdata volume</p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Puerto Host:</span>
                  <span className="font-mono font-medium">5432</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Base de Datos:</span>
                  <span className="font-mono font-medium">{dbStatus.data?.details?.database || 'gastro_db'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Conexión:</span>
                  <span className={`font-semibold ${dbStatus.data?.status === 'UP' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {dbStatus.loading ? 'Verificando...' : dbStatus.data?.status === 'UP' ? `Conectado (${dbStatus.data.details.latencyMs}ms)` : 'Esperando Servicio'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tablas Creadas y Persistencia */}
        {dbStatus.data?.details?.tables && (
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Tablas Creadas e Inicializadas en PostgreSQL ({dbStatus.data.details.tablesCount})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dbStatus.data.details.tables.map((tbl) => (
                <div key={tbl} className="bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-700 flex items-center justify-between">
                  <span>{tbl}</span>
                  <span className="text-emerald-500 font-bold">✓</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Matriz de Casos de Uso Contemplados (Trazabilidad 100%) */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Módulos y Casos de Uso Contemplados en la Arquitectura
              </h3>
              <p className="text-xs text-slate-500">
                Alineación 100% con Gastro-Agreement y Gastro-ProyectPlan (Sprint 0 listo para Sprint 1)
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded">
              Total: {modules.length} CUs
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {modules.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                    {m.id}
                  </span>
                  <span className="font-medium text-slate-800">{m.nombre}</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-100">
                  Arquitectura & Modelo Definidos
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
        GastroProyect &bull; Morelosoft International Solutions &bull; Universidad Autónoma de Zacatecas (UAZ) &bull; Ciclo 2026
      </footer>
    </div>
  );
}
