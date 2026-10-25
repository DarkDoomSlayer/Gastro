import type { Insumo, Receta, CosteoReceta } from './types';

const API_BASE = '/api';

export const api = {
  // Insumos
  async getInsumos(search = ''): Promise<Insumo[]> {
    const res = await fetch(`${API_BASE}/insumos/?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  async createInsumo(insumo: Partial<Insumo>): Promise<Insumo> {
    const res = await fetch(`${API_BASE}/insumos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insumo),
    });
    return res.json();
  },

  async updateInsumo(id: number, insumo: Partial<Insumo>, forzar = false): Promise<{ bloqueado?: boolean; mensaje?: string; recetas?: string[]; [key: string]: unknown }> {
    const res = await fetch(`${API_BASE}/insumos/${id}/?forzar=${forzar}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...insumo, forzar }),
    });
    if (res.status === 409) {
      return res.json();
    }
    return res.json();
  },

  async importInsumosExcel(file: File): Promise<{ mensaje: string; creados: number; actualizados: number; total: number; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/insumos/importar-excel/`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async deleteInsumo(id: number, forzar = false): Promise<{ bloqueado?: boolean; mensaje?: string; recetas?: string[] } | null> {
    const res = await fetch(`${API_BASE}/insumos/${id}/?forzar=${forzar}`, {
      method: 'DELETE',
    });
    if (res.status === 409) {
      return res.json();
    }
    return null;
  },

  // Recetas
  async getRecetas(): Promise<Receta[]> {
    const res = await fetch(`${API_BASE}/recetas/`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  async getReceta(id: number): Promise<Receta> {
    const res = await fetch(`${API_BASE}/recetas/${id}/`);
    return res.json();
  },

  async createReceta(receta: Partial<Receta>): Promise<Receta> {
    const res = await fetch(`${API_BASE}/recetas/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receta),
    });
    return res.json();
  },

  async updateReceta(id: number, receta: Partial<Receta>): Promise<Receta> {
    const res = await fetch(`${API_BASE}/recetas/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receta),
    });
    return res.json();
  },

  async deleteReceta(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/recetas/${id}/`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  async addIngrediente(recetaId: number, data: { insumo_id: number; cantidad_neta: number; cantidad_bruta: number }) {
    const res = await fetch(`${API_BASE}/recetas/${recetaId}/agregar-ingrediente/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateIngrediente(recetaId: number, ingredienteId: number, data: { cantidad_neta?: number; cantidad_bruta?: number }) {
    const res = await fetch(`${API_BASE}/recetas/${recetaId}/editar-ingrediente/${ingredienteId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteIngrediente(recetaId: number, ingredienteId: number) {
    await fetch(`${API_BASE}/recetas/${recetaId}/eliminar-ingrediente/${ingredienteId}/`, {
      method: 'DELETE',
    });
  },

  // Costeo
  async getCosteo(recetaId: number): Promise<CosteoReceta> {
    const res = await fetch(`${API_BASE}/costeo/por-receta/${recetaId}/`);
    return res.json();
  },

  async updateCosteo(recetaId: number, data: { margen_deseado?: number | null; precio_real_con_iva?: number | null }): Promise<CosteoReceta> {
    const res = await fetch(`${API_BASE}/costeo/por-receta/${recetaId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Autenticación de Estudiantes y Profesores
  async login(username: string, password: string): Promise<{ ok?: boolean; mensaje?: string; error?: string; usuario?: { id: number; username: string; nombre: string; es_admin: boolean } }> {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async register(username: string, email: string, password: string): Promise<{ ok?: boolean; mensaje?: string; error?: string; usuario?: { id: number; username: string; nombre: string; es_admin: boolean } }> {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  },

  async logout(): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE}/auth/logout/`, {
      method: 'POST',
    });
    return res.json();
  },

  async getCurrentUser(): Promise<{ autenticado: boolean; usuario?: { id: number; username: string; email?: string; nombre: string; es_admin: boolean } }> {
    const res = await fetch(`${API_BASE}/auth/user/`);
    return res.json();
  },

  async updateProfile(data: { email?: string; current_password?: string; new_password?: string }): Promise<{ ok?: boolean; mensaje?: string; error?: string; usuario?: { id: number; username: string; email?: string; nombre: string; es_admin: boolean } }> {
    const res = await fetch(`${API_BASE}/auth/update-profile/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteAccount(password: string): Promise<{ ok?: boolean; mensaje?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/delete-account/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return res.json();
  },
};

