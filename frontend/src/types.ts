export interface Insumo {
  id: number;
  nombre: string;
  tipo: 'materia_prima' | 'complementaria';
  presentacion: string | null;
  unidad: string;
  precio: string | null;
  costo_unitario: string;
  activo: boolean;
}

export interface RecetaIngrediente {
  id?: number;
  insumo: number;
  insumo_id?: number;
  insumo_detalle?: Insumo;
  cantidad_neta: string;
  cantidad_bruta: string;
  rendimiento?: string;
  p_unitario?: string;
  importe?: string;
}

export interface Receta {
  id: number;
  nombre: string;
  clasificacion: 'ENTRADA' | 'PARA COMPARTIR' | string;
  tipo_receta: 'Std.' | 'Comp.' | string;
  fecha_elaboracion: string | null;
  tamano_porcion: string;
  porciones: string;
  costo_total: string;
  ingredientes: RecetaIngrediente[];
}

export interface CosteoReceta {
  id: number;
  receta: number;
  costo_elaboracion: string;
  porciones: string;
  costo_unitario: string;
  margen_deseado: string;
  precio_sugerido_sin_iva: string;
  precio_sugerido_con_iva: string;
  tasa_iva: string;
  precio_real_con_iva: string;
  precio_real_sin_iva: string;
  margen_real: string;
}
