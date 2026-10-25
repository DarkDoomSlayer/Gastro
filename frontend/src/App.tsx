import React, { useState, useEffect, useRef } from 'react';
import type { Insumo, Receta } from './types';
import { api } from './services';
import { 
  BookOpen, 
  Utensils, 
  Plus, 
  Search, 
  Trash2, 
  Layers, 
  Sun, 
  Moon, 
  FileSpreadsheet, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  AlertTriangle,
  Save,
  CheckCircle2,
  Calendar,
  DollarSign,
  Percent,
  TrendingUp,
  PieChart,
  Tag,
  Hash,
  Download,
  Lock,
  LogOut,
  User,
  Mail,
  Key,
  UserCog
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Normaliza texto eliminando acentos/tildes y convirtiendo a minúsculas
// Ej: 'Maíz' -> 'maiz', 'Árbol' -> 'arbol', 'limón' -> 'limon'
export const normalizarTexto = (texto: string = ''): string => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tab, setTab] = useState<'recetas' | 'insumos'>('recetas');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [selectedReceta, setSelectedReceta] = useState<Receta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 25;

  // Formulario / Edición de Receta Activa
  const [recetaNombre, setRecetaNombre] = useState('NOMBRE');
  const [recetaFecha, setRecetaFecha] = useState('');
  const [recetaClasificacion, setRecetaClasificacion] = useState<'ENTRADA' | 'PARA COMPARTIR'>('ENTRADA');
  const [recetaTamanoPorcion, setRecetaTamanoPorcion] = useState('');
  const [recetaTipo, setRecetaTipo] = useState<'Std.' | 'Comp.'>('Std.');
  const [recetaRendimiento, setRecetaRendimiento] = useState('');

  // Tabla Costeo (Superior Derecha / Panel Financiero)
  const [margenDeseado, setMargenDeseado] = useState('');
  const [precioVentaRealConIva, setPrecioVentaRealConIva] = useState('');
  const [guardandoReceta, setGuardandoReceta] = useState(false);
  const [notifGuardado, setNotifGuardado] = useState(false);

  // Estado de Autenticación (Estudiante / Docente)
  const [usuarioLogueado, setUsuarioLogueado] = useState<{ id: number; username: string; email?: string; nombre: string; es_admin: boolean } | null>(() => {
    const guardado = localStorage.getItem('gastro_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [modoAuth, setModoAuth] = useState<'login' | 'registro'>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginCargando, setLoginCargando] = useState(false);

  // Modal Perfil de Usuario (Editar correo, cambiar contraseña, eliminar cuenta)
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [perfilEmail, setPerfilEmail] = useState('');
  const [perfilCurrentPassword, setPerfilCurrentPassword] = useState('');
  const [perfilNewPassword, setPerfilNewPassword] = useState('');
  const [perfilConfirmNewPassword, setPerfilConfirmNewPassword] = useState('');
  const [perfilError, setPerfilError] = useState('');
  const [perfilExito, setPerfilExito] = useState('');
  const [perfilCargando, setPerfilCargando] = useState(false);
  const [mostrarConfirmarEliminarCuenta, setMostrarConfirmarEliminarCuenta] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [deleteAccountCargando, setDeleteAccountCargando] = useState(false);

  // Modal confirmación eliminación de receta
  const [recetaAEliminarConfirmar, setRecetaAEliminarConfirmar] = useState<Receta | null>(null);

  // Fila para agregar nuevo ingrediente
  const [nuevoInsumoId, setNuevoInsumoId] = useState<number | ''>('');
  const [busquedaInsumoReceta, setBusquedaInsumoReceta] = useState('');
  const [mostrarDropdownInsumos, setMostrarDropdownInsumos] = useState(false);
  const buscadorInsumosRef = useRef<HTMLDivElement>(null);
  const [nuevoNeto, setNuevoNeto] = useState('');
  const [nuevoBruto, setNuevoBruto] = useState('');

  // Edición en línea de ingrediente de receta (Neto y Bruto)
  const [editandoIngredienteId, setEditandoIngredienteId] = useState<number | null>(null);
  const [editNeto, setEditNeto] = useState('');
  const [editBruto, setEditBruto] = useState('');

  // Modal para Catálogo de Insumos (manual)
  const [mostrarModalInsumo, setMostrarModalInsumo] = useState(false);
  const [insumoAEditar, setInsumoAEditar] = useState<Insumo | null>(null);
  const [nuevoInsumoNombre, setNuevoInsumoNombre] = useState('');
  const [nuevoInsumoTipo, setNuevoInsumoTipo] = useState<'materia_prima' | 'complementaria'>('materia_prima');
  const [nuevoInsumoPresentacion, setNuevoInsumoPresentacion] = useState('1.000');
  const [nuevoInsumoUnidad, setNuevoInsumoUnidad] = useState<'Kg' | 'Lt'>('Kg');
  const [nuevoInsumoPrecio, setNuevoInsumoPrecio] = useState('');
  const [errorInsumoModal, setErrorInsumoModal] = useState('');
  const [errorReceta, setErrorReceta] = useState('');

  // Notificación de importación de Excel
  const [notifImportacion, setNotifImportacion] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  const [cargandoImportacion, setCargandoImportacion] = useState(false);

  // Auto-desaparecer notificaciones flotantes tras unos segundos
  useEffect(() => {
    if (notifImportacion) {
      const timer = setTimeout(() => setNotifImportacion(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [notifImportacion]);

  useEffect(() => {
    if (errorReceta) {
      const timer = setTimeout(() => setErrorReceta(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [errorReceta]);

  useEffect(() => {
    if (errorInsumoModal) {
      const timer = setTimeout(() => setErrorInsumoModal(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [errorInsumoModal]);

  // Conflictos de insumos con recetas
  const [conflictoRecetas, setConflictoRecetas] = useState<{
    tipo: 'eliminar' | 'editar';
    insumoId: number;
    insumoNombre: string;
    mensaje: string;
    recetas: string[];
    payloadEditar?: Partial<Insumo>;
  } | null>(null);

  // Confirmación estándar eliminación de insumo
  const [insumoAEliminarConfirmar, setInsumoAEliminarConfirmar] = useState<Insumo | null>(null);

  // Prevenir desplazamiento del fondo cuando cualquier ventana modal esté abierta
  const algunModalAbierto = Boolean(
    mostrarModalInsumo || 
    mostrarModalPerfil || 
    mostrarConfirmarEliminarCuenta || 
    recetaAEliminarConfirmar || 
    insumoAEliminarConfirmar || 
    conflictoRecetas
  );

  useEffect(() => {
    if (algunModalAbierto) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [algunModalAbierto]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const handleClickAfuera = (event: MouseEvent) => {
      if (buscadorInsumosRef.current && !buscadorInsumosRef.current.contains(event.target as Node)) {
        setMostrarDropdownInsumos(false);
      }
    };
    document.addEventListener('mousedown', handleClickAfuera);
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
    };
  }, []);

  useEffect(() => {
    if (selectedReceta) {
      setRecetaNombre(selectedReceta.nombre || 'NOMBRE');
      setRecetaFecha(selectedReceta.fecha_elaboracion || '');
      setRecetaClasificacion((selectedReceta.clasificacion as 'ENTRADA' | 'PARA COMPARTIR') || 'ENTRADA');
      setRecetaTamanoPorcion(selectedReceta.tamano_porcion || '');
      setRecetaTipo((selectedReceta.tipo_receta as 'Std.' | 'Comp.') || 'Std.');
      setRecetaRendimiento(selectedReceta.porciones && Number(selectedReceta.porciones) > 0 ? String(selectedReceta.porciones) : '');
      cargarCosteo(selectedReceta.id);
    }
  }, [selectedReceta?.id]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginCargando(true);
    try {
      const resp = await api.login(loginUsername, loginPassword);
      if (resp.ok && resp.usuario) {
        setUsuarioLogueado(resp.usuario);
        localStorage.setItem('gastro_usuario', JSON.stringify(resp.usuario));
        setLoginPassword('');
        setLoginError('');
        await cargarDatosIniciales();
      } else {
        setLoginError(resp.error || 'Credenciales inválidas');
      }
    } catch (err: any) {
      setLoginError('Error de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setLoginCargando(false);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (regPassword !== regConfirmPassword) {
      setLoginError('Las contraseñas no coinciden. Verifícalas.');
      return;
    }
    if (regPassword.length < 4) {
      setLoginError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoginCargando(true);
    try {
      const resp = await api.register(regUsername, regEmail, regPassword);
      if (resp.ok && resp.usuario) {
        setUsuarioLogueado(resp.usuario);
        localStorage.setItem('gastro_usuario', JSON.stringify(resp.usuario));
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setLoginError('');
        await cargarDatosIniciales();
      } else {
        setLoginError(resp.error || 'No se pudo crear la cuenta');
      }
    } catch (err: any) {
      setLoginError('Error al comunicarse con el servidor.');
    } finally {
      setLoginCargando(false);
    }
  };

  const handleAbrirModalPerfil = async () => {
    setPerfilEmail(usuarioLogueado?.email || '');
    setPerfilCurrentPassword('');
    setPerfilNewPassword('');
    setPerfilConfirmNewPassword('');
    setPerfilError('');
    setPerfilExito('');
    setMostrarConfirmarEliminarCuenta(false);
    setDeleteAccountPassword('');
    setDeleteAccountError('');
    setMostrarModalPerfil(true);

    try {
      const resp = await api.getCurrentUser();
      if (resp.autenticado && resp.usuario) {
        setPerfilEmail(resp.usuario.email || '');
        setUsuarioLogueado(resp.usuario);
        localStorage.setItem('gastro_usuario', JSON.stringify(resp.usuario));
      }
    } catch (err) {
      console.error('Error al sincronizar datos del perfil:', err);
    }
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setPerfilError('');
    setPerfilExito('');

    if (perfilNewPassword) {
      if (!perfilCurrentPassword) {
        setPerfilError('Debes ingresar tu contraseña actual para cambiarla');
        return;
      }
      if (perfilNewPassword.length < 4) {
        setPerfilError('La nueva contraseña debe tener al menos 4 caracteres');
        return;
      }
      if (perfilNewPassword !== perfilConfirmNewPassword) {
        setPerfilError('Las contraseñas nuevas no coinciden');
        return;
      }
    }

    setPerfilCargando(true);
    try {
      const resp = await api.updateProfile({
        email: perfilEmail,
        current_password: perfilCurrentPassword,
        new_password: perfilNewPassword
      });

      if (resp.ok && resp.usuario) {
        setUsuarioLogueado(resp.usuario);
        localStorage.setItem('gastro_usuario', JSON.stringify(resp.usuario));
        setPerfilExito('Perfil actualizado exitosamente');
        setPerfilCurrentPassword('');
        setPerfilNewPassword('');
        setPerfilConfirmNewPassword('');
        setTimeout(() => {
          setMostrarModalPerfil(false);
          setPerfilExito('');
        }, 1200);
      } else {
        setPerfilError(resp.error || 'No se pudo actualizar el perfil');
      }
    } catch (err: any) {
      setPerfilError('Error de conexión al guardar cambios.');
    } finally {
      setPerfilCargando(false);
    }
  };

  const handleEjecutarEliminarCuenta = async () => {
    setDeleteAccountError('');
    if (!deleteAccountPassword) {
      setDeleteAccountError('Ingresa tu contraseña para confirmar');
      return;
    }

    setDeleteAccountCargando(true);
    try {
      const resp = await api.deleteAccount(deleteAccountPassword);
      if (resp.ok) {
        setMostrarModalPerfil(false);
        setMostrarConfirmarEliminarCuenta(false);
        setUsuarioLogueado(null);
        localStorage.removeItem('gastro_usuario');
        setInsumos([]);
        setRecetas([]);
        setSelectedReceta(null);
      } else {
        setDeleteAccountError(resp.error || 'Contraseña incorrecta');
      }
    } catch (err: any) {
      setDeleteAccountError('Error de red al intentar eliminar la cuenta');
    } finally {
      setDeleteAccountCargando(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error(err);
    }
    setUsuarioLogueado(null);
    localStorage.removeItem('gastro_usuario');
    setInsumos([]);
    setRecetas([]);
    setSelectedReceta(null);
    setSearchTerm('');
    setPaginaActual(1);
    setBusquedaInsumoReceta('');
    setNuevoInsumoId('');
  };

  const cargarDatosIniciales = async () => {
    try {
      const [ins, recs] = await Promise.all([api.getInsumos(), api.getRecetas()]);
      setInsumos(ins);
      setRecetas(recs);
      if (recs.length > 0 && !selectedReceta) {
        setSelectedReceta(recs[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cargarCosteo = async (recetaId: number) => {
    try {
      const cost = await api.getCosteo(recetaId);
      if (cost) {
        setMargenDeseado(cost.margen_deseado !== null && cost.margen_deseado !== undefined ? String(Number(cost.margen_deseado)) : '');
        setPrecioVentaRealConIva(cost.precio_real_con_iva !== null && cost.precio_real_con_iva !== undefined && Number(cost.precio_real_con_iva) > 0 ? Number(cost.precio_real_con_iva).toFixed(2) : '');
      } else {
        setMargenDeseado('');
        setPrecioVentaRealConIva('');
      }
    } catch (err) {
      console.error(err);
      setMargenDeseado('');
      setPrecioVentaRealConIva('');
    }
  };

  const handleCrearNuevaReceta = async () => {
    try {
      const nueva = await api.createReceta({
        nombre: 'NUEVA RECETA',
        clasificacion: 'ENTRADA',
        tipo_receta: 'Std.',
        porciones: '0',
        tamano_porcion: '',
        fecha_elaboracion: new Date().toISOString().split('T')[0]
      });
      setRecetas([nueva, ...recetas]);
      setSelectedReceta(nueva);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuardarCambiosReceta = async () => {
    if (!selectedReceta) return;
    setGuardandoReceta(true);
    setErrorReceta('');
    try {
      const resp = await api.updateReceta(selectedReceta.id, {
        nombre: recetaNombre || 'NOMBRE',
        fecha_elaboracion: recetaFecha || null,
        clasificacion: recetaClasificacion,
        tamano_porcion: recetaTamanoPorcion,
        tipo_receta: recetaTipo,
        porciones: recetaRendimiento || '0'
      });

      if (!resp || (resp as any).error) {
        setErrorReceta((resp as any)?.error || 'No fue posible guardar los cambios de la receta.');
        return;
      }

      const margenNum = margenDeseado.trim() === '' ? null : Number(margenDeseado);
      const precioRealNum = precioVentaRealConIva.trim() === '' ? null : Number(precioVentaRealConIva);

      await api.updateCosteo(selectedReceta.id, {
        margen_deseado: isNaN(margenNum as number) ? null : margenNum,
        precio_real_con_iva: isNaN(precioRealNum as number) ? null : precioRealNum
      });

      // Asegurar que si la respuesta no trae ingredientes preservamos los existentes
      const recetaActualizada: Receta = {
        ...selectedReceta,
        ...resp,
        ingredientes: (resp.ingredientes && resp.ingredientes.length > 0) ? resp.ingredientes : (selectedReceta.ingredientes || [])
      };

      setSelectedReceta(recetaActualizada);
      setRecetas(prev => prev.map(r => r.id === recetaActualizada.id ? recetaActualizada : r));
      
      setNotifGuardado(true);
      setTimeout(() => setNotifGuardado(false), 2500);
    } catch (err) {
      console.error(err);
      setErrorReceta('Error de comunicación con el servidor al guardar receta.');
    } finally {
      setGuardandoReceta(false);
    }
  };

  const handleSolicitarEliminarReceta = (r: Receta) => {
    setRecetaAEliminarConfirmar(r);
  };

  const handleEjecutarEliminarReceta = async () => {
    if (!recetaAEliminarConfirmar) return;
    const rId = recetaAEliminarConfirmar.id;
    try {
      const ok = await api.deleteReceta(rId);
      if (ok) {
        const nuevasRecs = recetas.filter(r => r.id !== rId);
        setRecetas(nuevasRecs);
        if (selectedReceta?.id === rId) {
          setSelectedReceta(nuevasRecs.length > 0 ? nuevasRecs[0] : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecetaAEliminarConfirmar(null);
    }
  };

  const handleAgregarIngrediente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceta || !nuevoInsumoId || !nuevoNeto || !nuevoBruto) return;
    try {
      await api.addIngrediente(selectedReceta.id, {
        insumo_id: Number(nuevoInsumoId),
        cantidad_neta: Number(nuevoNeto),
        cantidad_bruta: Number(nuevoBruto),
      });
      const recAct = await api.getReceta(selectedReceta.id);
      setSelectedReceta(recAct);
      setRecetas(prev => prev.map(r => r.id === recAct.id ? recAct : r));
      await cargarCosteo(selectedReceta.id);
      setNuevoInsumoId('');
      setBusquedaInsumoReceta('');
      setMostrarDropdownInsumos(false);
      setNuevoNeto('');
      setNuevoBruto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarEditarIngrediente = (ingId: number, cantNeta: string, cantBruta: string) => {
    setEditandoIngredienteId(ingId);
    setEditNeto(String(Number(cantNeta)));
    setEditBruto(String(Number(cantBruta)));
  };

  const handleCancelarEditarIngrediente = () => {
    setEditandoIngredienteId(null);
    setEditNeto('');
    setEditBruto('');
  };

  const handleGuardarEditarIngrediente = async (ingId: number) => {
    if (!selectedReceta || !editNeto || !editBruto) return;
    try {
      await api.updateIngrediente(selectedReceta.id, ingId, {
        cantidad_neta: Number(editNeto),
        cantidad_bruta: Number(editBruto),
      });
      const recAct = await api.getReceta(selectedReceta.id);
      setSelectedReceta(recAct);
      setRecetas(prev => prev.map(r => r.id === recAct.id ? recAct : r));
      await cargarCosteo(selectedReceta.id);
      setEditandoIngredienteId(null);
      setEditNeto('');
      setEditBruto('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminarIngrediente = async (ingredienteId: number) => {
    if (!selectedReceta) return;
    try {
      await api.deleteIngrediente(selectedReceta.id, ingredienteId);
      const recAct = await api.getReceta(selectedReceta.id);
      setSelectedReceta(recAct);
      setRecetas(prev => prev.map(r => r.id === recAct.id ? recAct : r));
      await cargarCosteo(selectedReceta.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Insumos manuales
  const handleAbrirCrearInsumo = () => {
    setInsumoAEditar(null);
    setNuevoInsumoNombre('');
    setNuevoInsumoTipo('materia_prima');
    setNuevoInsumoPresentacion('1.000');
    setNuevoInsumoUnidad('Kg');
    setNuevoInsumoPrecio('');
    setErrorInsumoModal('');
    setMostrarModalInsumo(true);
  };

  const handleAbrirEditarInsumo = (item: Insumo) => {
    setInsumoAEditar(item);
    setNuevoInsumoNombre(item.nombre);
    setNuevoInsumoTipo(item.tipo);
    setNuevoInsumoPresentacion(item.presentacion !== null ? String(item.presentacion) : '');
    setNuevoInsumoUnidad(item.unidad === 'Lt' ? 'Lt' : 'Kg');
    setNuevoInsumoPrecio(item.precio !== null ? String(item.precio) : '');
    setErrorInsumoModal('');
    setMostrarModalInsumo(true);
  };

  const handleGuardarInsumoManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoInsumoNombre.trim()) return;
    setErrorInsumoModal('');
    try {
      const payload: Partial<Insumo> = {
        nombre: nuevoInsumoNombre.trim(),
        tipo: nuevoInsumoTipo,
        presentacion: nuevoInsumoPresentacion ? nuevoInsumoPresentacion : null,
        unidad: nuevoInsumoUnidad,
        precio: nuevoInsumoPrecio ? nuevoInsumoPrecio : null,
      };

      if (insumoAEditar) {
        const res = await api.updateInsumo(insumoAEditar.id, payload, false);
        if ((res as any)?.error) {
          setErrorInsumoModal((res as any).error);
          return;
        }
        if (res && res.bloqueado) {
          setConflictoRecetas({
            tipo: 'editar',
            insumoId: insumoAEditar.id,
            insumoNombre: insumoAEditar.nombre,
            mensaje: res.mensaje || 'Este ingrediente se encuentra en una o más recetas.',
            recetas: res.recetas || [],
            payloadEditar: payload,
          });
          return;
        }
      } else {
        const res = await api.createInsumo(payload);
        if ((res as any)?.error) {
          setErrorInsumoModal((res as any).error);
          return;
        }
      }

      setMostrarModalInsumo(false);
      setInsumoAEditar(null);
      setErrorInsumoModal('');
      const lista = await api.getInsumos();
      setInsumos(lista);
    } catch (err: any) {
      console.error(err);
      setErrorInsumoModal('Error al guardar el ingrediente. Inténtalo de nuevo.');
    }
  };

  const handleSolicitarEliminarInsumo = (item: Insumo) => {
    setInsumoAEliminarConfirmar(item);
  };

  const handleEjecutarEliminarInsumo = async () => {
    if (!insumoAEliminarConfirmar) return;
    const item = insumoAEliminarConfirmar;
    setInsumoAEliminarConfirmar(null);

    try {
      const res = await api.deleteInsumo(item.id, false);
      if (res && res.bloqueado) {
        setConflictoRecetas({
          tipo: 'eliminar',
          insumoId: item.id,
          insumoNombre: item.nombre,
          mensaje: res.mensaje || 'Este ingrediente se encuentra en una o más recetas.',
          recetas: res.recetas || [],
        });
        return;
      }
      const lista = await api.getInsumos();
      setInsumos(lista);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmarForzado = async () => {
    if (!conflictoRecetas) return;
    try {
      if (conflictoRecetas.tipo === 'eliminar') {
        await api.deleteInsumo(conflictoRecetas.insumoId, true);
      } else if (conflictoRecetas.tipo === 'editar' && conflictoRecetas.payloadEditar) {
        await api.updateInsumo(conflictoRecetas.insumoId, conflictoRecetas.payloadEditar, true);
        setMostrarModalInsumo(false);
        setInsumoAEditar(null);
      }

      setConflictoRecetas(null);
      const [listaIns, listaRecs] = await Promise.all([api.getInsumos(), api.getRecetas()]);
      setInsumos(listaIns);
      setRecetas(listaRecs);
      if (selectedReceta) {
        const recActualizada = await api.getReceta(selectedReceta.id);
        setSelectedReceta(recActualizada);
        cargarCosteo(selectedReceta.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubirExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNotifImportacion(null);
    setCargandoImportacion(true);

    try {
      const resp = await api.importInsumosExcel(file);
      if (resp && resp.error) {
        setNotifImportacion({ tipo: 'error', mensaje: resp.error });
      } else if (resp) {
        const msg = resp.mensaje 
          ? `${resp.mensaje}. Creados: ${resp.creados ?? 0}, Actualizados: ${resp.actualizados ?? 0}. Total procesados: ${resp.total ?? 0}`
          : 'Archivo importado exitosamente.';
        setNotifImportacion({ tipo: 'exito', mensaje: msg });
        const lista = await api.getInsumos();
        setInsumos(lista);
      }
    } catch (err: any) {
      console.error(err);
      setNotifImportacion({ tipo: 'error', mensaje: 'Error al enviar el archivo Excel al servidor.' });
    } finally {
      setCargandoImportacion(false);
      e.target.value = '';
    }
  };

  const termNorm = normalizarTexto(searchTerm);
  const filteredInsumos = insumos.filter(i => {
    if (!termNorm) return true;
    return (
      normalizarTexto(i.nombre).includes(termNorm) ||
      normalizarTexto(i.tipo).includes(termNorm) ||
      normalizarTexto(i.unidad).includes(termNorm)
    );
  });

  const totalPaginas = Math.ceil(filteredInsumos.length / itemsPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const insumosPaginados = filteredInsumos.slice(indiceInicio, indiceInicio + itemsPorPagina);

  // Cálculos reactivos de la Ficha en vivo
  const totalImporte = selectedReceta?.ingredientes
    ? selectedReceta.ingredientes.reduce((acc, ing) => acc + Number(ing.importe || 0), 0)
    : 0;

  const porcionesNum = Number(recetaRendimiento) || 0;
  const costoUnitarioCalc = porcionesNum > 0 ? (totalImporte / porcionesNum) : 0;
  const margenDeseadoNum = (Number(margenDeseado) || 0) / 100;
  const precioSugeridoSinIvaCalc = margenDeseadoNum < 1 && costoUnitarioCalc > 0 
    ? (costoUnitarioCalc / (1 - margenDeseadoNum)) 
    : 0;
  const precioSugeridoConIvaCalc = precioSugeridoSinIvaCalc * 1.16;

  const precioRealConIvaNum = Number(precioVentaRealConIva) || 0;
  const precioRealSinIvaCalc = precioRealConIvaNum > 0 ? (precioRealConIvaNum / 1.16) : 0;
  const gananciaRealCalc = precioRealSinIvaCalc > 0 
    ? ((precioRealSinIvaCalc - costoUnitarioCalc) / precioRealSinIvaCalc) * 100 
    : 0;

  // Generador centralizado de PDF: diseño idéntico, formal y de bajo consumo de tinta
  const generarDocumentoPDF = (modo: 'descargar' | 'imprimir') => {
    if (!selectedReceta) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const nombrePlatillo = recetaNombre || selectedReceta.nombre || 'Receta';

    // Encabezado Formal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('FICHA TÉCNICA Y COSTEO DE RECETA', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')} | Atelier Gastronómico`, 14, 23);

    // Línea divisoria sobria
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 26, 202, 26);

    // Bloque 1: Datos Generales de la Receta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('DATOS DE LA RECETA', 14, 32);

    const datosGenerales = [
      ['Platillo:', nombrePlatillo.toUpperCase(), 'Clasificación:', recetaClasificacion || selectedReceta.clasificacion || 'N/A'],
      ['Tipo de Receta:', recetaTipo || selectedReceta.tipo_receta || 'N/A', 'Tamaño Porción:', recetaTamanoPorcion || selectedReceta.tamano_porcion || 'N/A'],
      ['Rendimiento:', `${recetaRendimiento || selectedReceta.porciones || 1} porciones`, 'Fecha Elaboración:', recetaFecha || selectedReceta.fecha_elaboracion || 'N/A']
    ];

    autoTable(doc, {
      startY: 34,
      body: datosGenerales,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 1.8, textColor: [40, 40, 40] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 28, textColor: [80, 80, 80] },
        1: { cellWidth: 68 },
        2: { fontStyle: 'bold', cellWidth: 34, textColor: [80, 80, 80] },
        3: { cellWidth: 58 }
      },
      margin: { left: 14, right: 14 }
    });

    // Bloque 2: Resumen Financiero y Fijación de Precios
    let lastY = (doc as any).lastAutoTable.finalY + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('RESUMEN DE COSTOS Y FIJACIÓN DE PRECIO', 14, lastY);

    const datosFinancieros = [
      [
        'Costo Total:', `$${totalImporte.toFixed(2)}`,
        'Margen Deseado:', `${margenDeseado}%`,
        'P. Venta Sugerido (sin IVA):', porcionesNum > 0 && precioSugeridoSinIvaCalc > 0 ? `$${precioSugeridoSinIvaCalc.toFixed(2)}` : 'N/A'
      ],
      [
        'Porciones:', `${porcionesNum}`,
        'P. Venta Real (con IVA):', `$${precioRealConIvaNum.toFixed(2)}`,
        'P. Sugerido (+ IVA 16%):', porcionesNum > 0 && precioSugeridoConIvaCalc > 0 ? `$${precioSugeridoConIvaCalc.toFixed(2)}` : 'N/A'
      ],
      [
        'Costo Unitario:', `$${costoUnitarioCalc.toFixed(2)}`,
        'Precio sin IVA (Real):', `$${precioRealSinIvaCalc.toFixed(2)}`,
        '% Ganancia Real:', precioRealSinIvaCalc > 0 ? `${gananciaRealCalc.toFixed(1)}%` : 'N/A'
      ]
    ];

    autoTable(doc, {
      startY: lastY + 2,
      body: datosFinancieros,
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        cellPadding: 2, 
        lineColor: [210, 210, 210],
        lineWidth: 0.2,
        fillColor: [255, 255, 255],
        textColor: [30, 30, 30]
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 26 },
        1: { cellWidth: 32 },
        2: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 40 },
        5: { cellWidth: 25 }
      },
      margin: { left: 14, right: 14 }
    });

    // Bloque 3: Tabla Detallada de Ingredientes
    lastY = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`DESGLOSE DE INGREDIENTES (${selectedReceta.ingredientes?.length || 0})`, 14, lastY);

    const filasIngredientes = (selectedReceta.ingredientes || []).map(ing => {
      const ins = ing.insumo_detalle;
      const pres = ins?.presentacion ? Number(ins.presentacion).toFixed(3) : '-';
      const precio = ins?.precio ? `$${Number(ins.precio).toFixed(2)}` : '-';
      const pUnit = ing.p_unitario ? `$${Number(ing.p_unitario).toFixed(2)}` : '$0.00';
      const importe = ing.importe ? `$${Number(ing.importe).toFixed(2)}` : '$0.00';
      const tipo = ins?.tipo === 'materia_prima' ? 'Mat. Prima' : 'Complem.';

      return [
        ins?.nombre || 'Insumo',
        tipo,
        pres,
        Number(ing.cantidad_neta).toFixed(3),
        Number(ing.cantidad_bruta).toFixed(3),
        ins?.unidad || 'Kg',
        `${ing.rendimiento}%`,
        precio,
        pUnit,
        importe
      ];
    });

    autoTable(doc, {
      startY: lastY + 2,
      head: [[
        'Ingrediente', 
        'Tipo', 
        'Present.', 
        'Neto', 
        'Bruto', 
        'Unid.', 
        '% Rend.', 
        'Precio', 
        'P. Unit.', 
        'Importe'
      ]],
      body: filasIngredientes,
      foot: [[
        { content: 'TOTAL COSTO DE ELABORACIÓN', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `$${totalImporte.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } }
      ]],
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [20, 20, 20],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2,
        lineWidth: 0.3,
        lineColor: [180, 180, 180]
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        fillColor: [255, 255, 255],
        textColor: [30, 30, 30],
        lineColor: [220, 220, 220],
        lineWidth: 0.2
      },
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [10, 10, 10],
        fontSize: 8.5,
        cellPadding: 2.2,
        lineWidth: 0.3,
        lineColor: [160, 160, 160]
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'center' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    const safeFilename = nombrePlatillo.replace(/[^a-zA-Z0-9_\-]/g, '_');

    if (modo === 'descargar') {
      doc.save(`Receta_${safeFilename}.pdf`);
    } else {
      // Modo imprimir: abre el documento PDF directamente en el visor de impresión nativo
      doc.autoPrint();
      const pdfBlobUrl = doc.output('bloburl');
      window.open(pdfBlobUrl.toString(), '_blank');
    }
  };

  // Si no está autenticado, renderizar la pantalla de Login con estética Atelier Bistró
  if (!usuarioLogueado) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative'
      }}>
        {/* Botón flotante para alternar tema claro / oscuro */}
        <button 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo bistró claro'}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {theme === 'light' ? <Moon size={18} color="var(--primary-accent)" /> : <Sun size={18} color="#f59e0b" />}
        </button>

        <div className="card-gourmet" style={{
          maxWidth: '430px',
          width: '100%',
          padding: '36px 32px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Logo y Encabezado del Login */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-subtle)',
              color: 'var(--primary-accent)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px'
            }}>
              <Utensils size={32} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              Atelier Gastronómico
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Portal Académico de Costeo y Fichas Técnicas
            </p>
          </div>

          {/* Selector de Modo: Iniciar Sesión o Registrarse */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => { setModoAuth('login'); setLoginError(''); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.86rem',
                background: modoAuth === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: modoAuth === 'login' ? 'var(--primary-accent)' : 'var(--text-muted)',
                boxShadow: modoAuth === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s'
              }}>
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setModoAuth('registro'); setLoginError(''); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.86rem',
                background: modoAuth === 'registro' ? 'var(--bg-surface)' : 'transparent',
                color: modoAuth === 'registro' ? 'var(--primary-accent)' : 'var(--text-muted)',
                boxShadow: modoAuth === 'registro' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s'
              }}>
              Registrarse
            </button>
          </div>

          {loginError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          {modoAuth === 'login' ? (
            /* Formulario de Login */
            <form onSubmit={handleLogin} name="login_form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="login-username" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Usuario o Matrícula
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="login-username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Ingresa tu usuario"
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loginCargando}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.95rem',
                  marginTop: '8px',
                  justifyContent: 'center'
                }}>
                {loginCargando ? 'Iniciando sesión...' : 'Ingresar al Atelier'}
              </button>
            </form>
          ) : (
            /* Formulario de Registro de Nuevo Estudiante */
            <form onSubmit={handleRegistro} name="register_form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label htmlFor="reg-username" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Nombre de Usuario o Matrícula *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="reg-username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Elige tu nombre de usuario"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="reg-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Ingresa tu contraseña"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm-password" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Confirmar Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="reg-confirm-password"
                    name="confirm_password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Correo Electrónico (opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loginCargando}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.95rem',
                  marginTop: '8px',
                  justifyContent: 'center'
                }}>
                {loginCargando ? 'Creando cuenta...' : 'Crear Mi Cuenta'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1420px', margin: '0 auto', padding: '16px' }}>
      {/* Barra de Navegación Principal Responsiva */}
      <header className="app-header">
        <div className="app-header-brand">
          <div style={{ 
            background: 'var(--primary-subtle)', 
            color: 'var(--primary-accent)', 
            padding: '10px', 
            borderRadius: 'var(--radius-lg)', 
            display: 'flex',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0
          }}>
            <Utensils size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, margin: 0 }}>
              Atelier Gastronómico
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.80rem', margin: '2px 0 0' }}>
              Fichas Técnicas & Costeo Culinario
            </p>
          </div>
        </div>

        {/* Acciones de usuario (Modo oscuro, Mi Perfil, Salir) */}
        <div className="app-header-actions no-print">
          <button 
            onClick={toggleTheme}
            title={theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo bistró claro'}
            style={{ 
              background: 'var(--bg-surface-elevated)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border-subtle)', 
              padding: '8px 10px', 
              borderRadius: 'var(--radius-md)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
            {theme === 'light' ? <Moon size={17} color="var(--primary-accent)" /> : <Sun size={17} color="#f59e0b" />}
          </button>

          {usuarioLogueado && (
            <>
              <button 
                onClick={handleAbrirModalPerfil}
                title="Configuración de Perfil"
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {usuarioLogueado.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {usuarioLogueado.username}
                    <UserCog size={13} style={{ color: 'var(--primary-accent)' }} />
                  </div>
                </div>
              </button>

              <button 
                onClick={handleLogout}
                title="Cerrar sesión"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.80rem',
                  fontWeight: 600
                }}>
                <LogOut size={15} />
                <span>Salir</span>
              </button>
            </>
          )}
        </div>

        {/* Pestañas de Navegación de Módulos (En PC a la derecha, en móvil abajo ocupando todo el ancho) */}
        <div className="app-header-tabs no-print">
          <nav style={{ 
            display: 'flex', 
            gap: '4px', 
            background: 'var(--bg-surface-elevated)', 
            padding: '4px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-subtle)',
            width: '100%'
          }}>
            <button 
              onClick={() => {
                setTab('recetas');
                setSearchTerm('');
                setPaginaActual(1);
              }} 
              style={{ 
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: tab === 'recetas' ? 'var(--bg-surface)' : 'transparent',
                color: tab === 'recetas' ? 'var(--primary-accent)' : 'var(--text-muted)',
                fontWeight: 600,
                boxShadow: tab === 'recetas' ? 'var(--shadow-sm)' : 'none',
                fontSize: '0.88rem',
                whiteSpace: 'nowrap'
              }}>
              <BookOpen size={16} /> Recetas y Fichas
            </button>
            <button 
              onClick={() => {
                setTab('insumos');
                setSearchTerm('');
                setPaginaActual(1);
              }} 
              style={{ 
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: tab === 'insumos' ? 'var(--bg-surface)' : 'transparent',
                color: tab === 'insumos' ? 'var(--primary-accent)' : 'var(--text-muted)',
                fontWeight: 600,
                boxShadow: tab === 'insumos' ? 'var(--shadow-sm)' : 'none',
                fontSize: '0.88rem',
                whiteSpace: 'nowrap'
              }}>
              <Layers size={16} /> Catálogo Insumos
            </button>
          </nav>
        </div>
      </header>

      {/* TAB 1: FORMATO RECETA ESTÁNDAR */}
      {tab === 'recetas' && (
        <div>
          {/* Barra de Gestión de Recetas: Selector + Acciones (Solo se muestra si existen recetas creadas) */}
          {recetas.length > 0 && selectedReceta && (
            <div className="card-gourmet no-print" style={{ 
              padding: '14px 18px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '12px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-accent)', fontWeight: 700, fontSize: '0.88rem' }}>
                  <BookOpen size={17} />
                  <span>Receta:</span>
                </div>
                <select 
                  value={selectedReceta?.id || ''} 
                  onChange={e => {
                    const r = recetas.find(x => x.id === Number(e.target.value));
                    if (r) setSelectedReceta(r);
                  }}
                  className="input-field"
                  style={{ maxWidth: '320px', fontWeight: 600, fontSize: '0.90rem' }}>
                  {recetas.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`badge-tag ${selectedReceta.tipo_receta === 'Std.' ? 'badge-materia-prima' : 'badge-complementaria'}`}>
                    {selectedReceta.tipo_receta}
                  </span>
                  <span className="badge-tag" style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    {selectedReceta.clasificacion}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                <button 
                  onClick={handleCrearNuevaReceta}
                  className="btn-secondary" 
                  title="Crear Nueva Receta"
                  style={{ padding: '7px 9px', fontSize: '0.80rem', whiteSpace: 'nowrap' }}>
                  <Plus size={14} color="var(--primary-accent)" /> Nueva
                </button>

                <button 
                  onClick={() => handleSolicitarEliminarReceta(selectedReceta)}
                  title={`Eliminar receta ${selectedReceta.nombre}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 9px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontWeight: 600,
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}>
                  <Trash2 size={14} /> Eliminar
                </button>

                <button 
                  onClick={() => generarDocumentoPDF('descargar')}
                  disabled={!selectedReceta}
                  className="btn-secondary" 
                  title="Descargar Ficha Técnica en PDF formal"
                  style={{
                    padding: '7px 10px',
                    fontSize: '0.80rem',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                  <Download size={14} color="var(--primary-accent)" /> PDF
                </button>

                <button 
                  onClick={handleGuardarCambiosReceta}
                  disabled={guardandoReceta || !selectedReceta}
                  className="btn-primary"
                  title="Guardar Cambios de la Receta"
                  style={{
                    padding: '7px 12px',
                    fontSize: '0.80rem',
                    gap: '4px',
                    background: notifGuardado ? '#16a34a' : 'var(--primary-accent)',
                    whiteSpace: 'nowrap'
                  }}>
                  {notifGuardado ? <CheckCircle2 size={14} /> : <Save size={14} />}
                  {notifGuardado ? '¡Guardada!' : guardandoReceta ? '...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}

          {selectedReceta ? (
            <>
              {/* SECCIÓN SUPERIOR: DATOS GENERALES + SIMULADOR FINANCIERO RESPONSIVE */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '20px',
                alignItems: 'stretch'
              }}>
                {/* TARJETA 1: IDENTIFICACIÓN Y PARÁMETROS CULINARIOS */}
                <div className="card-gourmet" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={18} color="var(--primary-accent)" />
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        Formato Receta Estándar
                      </h2>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, background: 'var(--bg-surface-elevated)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      Receta #{recetas.findIndex(r => r.id === selectedReceta.id) >= 0 ? recetas.length - recetas.findIndex(r => r.id === selectedReceta.id) : 1}
                    </span>
                  </div>

                  {/* Nombre del platillo */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Nombre del platillo
                    </label>
                    <input 
                      type="text" 
                      value={recetaNombre} 
                      onChange={e => setRecetaNombre(e.target.value)}
                      placeholder="Nombre del platillo..."
                      className="input-field no-print"
                      style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--highlight-title)', letterSpacing: '0.02em' }}
                    />
                    <div className="print-only-title" style={{ display: 'none', fontSize: '1.2rem', fontWeight: 800, color: '#1f1b18', padding: '2px 0' }}>
                      {recetaNombre || 'Sin nombre'}
                    </div>
                  </div>

                  {/* Grid de 2 columnas para campos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                    {/* Fecha de Elaboración */}
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        <Calendar size={13} /> Fecha de Elaboración
                      </label>
                      <input 
                        type="date" 
                        value={recetaFecha} 
                        onChange={e => setRecetaFecha(e.target.value)}
                        className="input-field"
                      />
                    </div>

                    {/* Tamaño de la Porción */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Tamaño de la porción
                      </label>
                      <input 
                        type="text" 
                        value={recetaTamanoPorcion} 
                        onChange={e => setRecetaTamanoPorcion(e.target.value)}
                        placeholder="Tamaño de la porción..."
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Clasificación y Tipo de Receta */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Clasificación
                      </label>
                      <div className="radio-pill-group" style={{ width: '100%', display: 'flex' }}>
                        <button 
                          type="button"
                          className={`radio-pill ${recetaClasificacion === 'ENTRADA' ? 'active' : ''}`}
                          onClick={() => setRecetaClasificacion('ENTRADA')}
                          style={{ flex: 1, justifyContent: 'center' }}>
                          ENTRADA
                        </button>
                        <button 
                          type="button"
                          className={`radio-pill ${recetaClasificacion === 'PARA COMPARTIR' ? 'active' : ''}`}
                          onClick={() => setRecetaClasificacion('PARA COMPARTIR')}
                          style={{ flex: 1, justifyContent: 'center' }}>
                          PARA COMPARTIR
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Tipo de receta
                      </label>
                      <div className="radio-pill-group" style={{ width: '100%', display: 'flex' }}>
                        <button 
                          type="button"
                          className={`radio-pill ${recetaTipo === 'Std.' ? 'active' : ''}`}
                          onClick={() => setRecetaTipo('Std.')}
                          style={{ flex: 1, justifyContent: 'center' }}>
                          Estándar
                        </button>
                        <button 
                          type="button"
                          className={`radio-pill ${recetaTipo === 'Comp.' ? 'active' : ''}`}
                          onClick={() => setRecetaTipo('Comp.')}
                          style={{ flex: 1, justifyContent: 'center' }}>
                          Complementaria
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rendimiento (enlazado con Porciones) */}
                  <div style={{ 
                    background: 'var(--bg-surface-elevated)', 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                        <Hash size={15} color="var(--primary-accent)" />
                        <span>Rendimiento Culinario</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Define el divisor de porciones para el costeo unitario.
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="number" 
                        step="0.5"
                        min="0"
                        placeholder="0"
                        value={recetaRendimiento} 
                        onChange={e => setRecetaRendimiento(e.target.value)}
                        className="input-field"
                        style={{ width: '90px', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-accent)' }}
                      />
                      <span className="notranslate" translate="no" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>porc.</span>
                    </div>
                  </div>
                </div>

                {/* TARJETA 2: TABLITA DE COSTEO Y FIJACIÓN CIENTÍFICA DE PRECIO (MODERNA & RESPONSIVE) */}
                <div className="card-gourmet" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                    <TrendingUp size={18} color="var(--primary-accent)" />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      Fijación Financiera & Márgenes
                    </h2>
                  </div>

                  {/* Resumen Métrico Primario: Costo Elaboración, Porciones, Costo Unitario */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div className="metric-tile">
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Costo elaboración
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginTop: '4px' }}>
                        ${totalImporte.toFixed(2)}
                      </strong>
                    </div>

                    <div className="metric-tile" style={{ background: 'var(--highlight-card-bg)', borderColor: 'var(--highlight-card-border)' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--highlight-number)', textTransform: 'uppercase' }}>
                        Porciones
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--highlight-number)', marginTop: '4px' }}>
                        {porcionesNum > 0 ? porcionesNum : '0'}
                      </strong>
                    </div>

                    <div className="metric-tile" style={{ background: 'var(--primary-subtle)', borderColor: 'var(--primary-border)' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-text)', textTransform: 'uppercase' }}>
                        Costo unitario
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--primary-accent)', marginTop: '4px' }}>
                        {porcionesNum > 0 ? `$${costoUnitarioCalc.toFixed(2)}` : '#N/A'}
                      </strong>
                    </div>
                  </div>

                  {/* Entradas del Usuario para la Simulación: % Deseado y Precio Real */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        <Percent size={13} color="var(--primary-accent)" /> Margen de ganancia deseado
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input 
                          type="number" 
                          placeholder="Ej. 60"
                          value={margenDeseado} 
                          onChange={e => setMargenDeseado(e.target.value)}
                          className="input-field"
                          style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary-accent)' }}
                        />
                        <span style={{ fontWeight: 800, color: 'var(--primary-accent)' }}>%</span>
                      </div>
                    </div>

                    <div style={{ background: 'var(--badge-mp-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--badge-mp-border)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--badge-mp-text)', marginBottom: '6px' }}>
                        <DollarSign size={13} /> P. venta real con IVA
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary-accent)' }}>$</span>
                        <input 
                          type="number" 
                          step="0.50"
                          placeholder="0.00"
                          value={precioVentaRealConIva} 
                          onChange={e => setPrecioVentaRealConIva(e.target.value)}
                          className="input-field"
                          style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary-accent)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Precios Sugeridos y Desglose de IVA */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                    gap: '10px', 
                    padding: '12px', 
                    background: 'var(--bg-surface-elevated)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)' 
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P. venta (sugerido)</span>
                      <strong style={{ fontSize: '0.95rem' }}>
                        {porcionesNum > 0 && precioSugeridoSinIvaCalc > 0 ? `$${precioSugeridoSinIvaCalc.toFixed(2)}` : '#N/A'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P. sugerido + IVA 16%</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--primary-accent)' }}>
                        {porcionesNum > 0 && precioSugeridoConIvaCalc > 0 ? `$${precioSugeridoConIvaCalc.toFixed(2)}` : '#N/A'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Precio sin IVA</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        ${precioRealSinIvaCalc.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>% ganancia real</span>
                      <strong style={{ fontSize: '0.95rem', color: gananciaRealCalc >= 50 ? 'var(--primary-accent)' : 'var(--badge-alert-text)' }}>
                        {precioRealSinIvaCalc > 0 ? `${gananciaRealCalc.toFixed(1)}%` : '#N/A'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN INFERIOR: TABLA DE INGREDIENTES MODERNA Y FLUIDA */}
              <div className="card-gourmet" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <PieChart size={18} color="var(--primary-accent)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Ingredientes e Insumos de la Receta ({selectedReceta.ingredientes?.length || 0})
                  </h3>
                </div>

                {/* Formulario / Barra rápida para agregar ingredientes */}
                <form onSubmit={handleAgregarIngrediente} className="no-print quick-add-grid" style={{ 
                  background: 'var(--bg-surface-elevated)', 
                  padding: '14px 16px', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '20px', 
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 2fr) minmax(110px, 1fr) minmax(110px, 1fr) 48px',
                  gap: '12px',
                  alignItems: 'end'
                }}>
                  <div ref={buscadorInsumosRef} className="search-col" style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Buscar Insumo del Catálogo
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text"
                        placeholder="Escribe para buscar ingrediente..."
                        value={busquedaInsumoReceta}
                        onChange={e => {
                          setBusquedaInsumoReceta(e.target.value);
                          setMostrarDropdownInsumos(true);
                          if (!e.target.value) setNuevoInsumoId('');
                        }}
                        onFocus={() => setMostrarDropdownInsumos(true)}
                        className="input-field"
                        style={{ paddingLeft: '34px', paddingRight: nuevoInsumoId ? '32px' : '12px', fontSize: '0.86rem', fontWeight: 600 }}
                      />
                      {nuevoInsumoId && (
                        <button
                          type="button"
                          onClick={() => {
                            setNuevoInsumoId('');
                            setBusquedaInsumoReceta('');
                          }}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex'
                          }}>
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    {/* Menú flotante de resultados filtrados */}
                    {mostrarDropdownInsumos && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-lg)',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          marginTop: '4px'
                        }}>
                        {insumos
                          .filter(i => {
                            const busqNorm = normalizarTexto(busquedaInsumoReceta);
                            if (!busqNorm) return true;
                            return normalizarTexto(i.nombre).includes(busqNorm);
                          })
                          .map(ins => (
                            <div 
                              key={ins.id}
                              onClick={() => {
                                setNuevoInsumoId(ins.id);
                                setBusquedaInsumoReceta(ins.nombre);
                                setMostrarDropdownInsumos(false);
                              }}
                              style={{
                                padding: '9px 14px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                borderBottom: '1px solid var(--border-subtle)',
                                background: nuevoInsumoId === ins.id ? 'var(--primary-subtle)' : 'transparent',
                                color: nuevoInsumoId === ins.id ? 'var(--primary-accent)' : 'var(--text-main)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'background-color 0.15s'
                              }}
                              onMouseEnter={e => {
                                if (nuevoInsumoId !== ins.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-elevated)';
                              }}
                              onMouseLeave={e => {
                                if (nuevoInsumoId !== ins.id) (e.currentTarget as HTMLElement).style.background = 'transparent';
                              }}>
                              <span style={{ fontWeight: 600 }}>{ins.nombre}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ins.unidad}</span>
                            </div>
                          ))}
                        {insumos.filter(i => {
                          const busqNorm = normalizarTexto(busquedaInsumoReceta);
                          if (!busqNorm) return true;
                          return normalizarTexto(i.nombre).includes(busqNorm);
                        }).length === 0 && (
                          <div style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            No se encontraron insumos con ese nombre.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Cant. Neta ({nuevoInsumoId ? insumos.find(i => i.id === nuevoInsumoId)?.unidad : 'Kg/Lt'})
                    </label>
                    <input 
                      type="number" 
                      step="0.001" 
                      placeholder="0.000"
                      value={nuevoNeto} 
                      onChange={e => setNuevoNeto(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Cant. Bruta ({nuevoInsumoId ? insumos.find(i => i.id === nuevoInsumoId)?.unidad : 'Kg/Lt'})
                    </label>
                    <input 
                      type="number" 
                      step="0.001" 
                      placeholder="0.000"
                      value={nuevoBruto} 
                      onChange={e => setNuevoBruto(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    title="Añadir a la Receta"
                    style={{ height: '38px', padding: 0, width: '48px', minWidth: '48px' }}>
                    <Plus size={18} />
                  </button>
                </form>

                {/* Tabla de Ficha Técnica Responsive y Ajustada */}
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <table className="table-compact-mobile" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.80rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '9px 10px', fontWeight: 700 }}>Ingrediente</th>
                        <th style={{ padding: '9px 6px', fontWeight: 700 }}>Tipo de ing.</th>
                        <th style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700 }}>Presentación</th>
                        <th style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700 }}>Neto</th>
                        <th style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700 }}>Bruto</th>
                        <th style={{ padding: '9px 6px', textAlign: 'center', fontWeight: 700 }}>Unid.</th>
                        <th style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700 }}>% Rend.</th>
                        <th style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700 }}>Precio</th>
                        <th style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700 }}>P. Unitario</th>
                        <th style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>Importe</th>
                        <th className="no-print" style={{ padding: '9px 6px', width: '38px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReceta.ingredientes && selectedReceta.ingredientes.length > 0 ? (
                        selectedReceta.ingredientes.map(ing => {
                          const ins = ing.insumo_detalle;
                          const presentacionNum = ins?.presentacion ? Number(ins.presentacion) : null;
                          const precioNum = ins?.precio ? Number(ins.precio) : null;
                          const pUnitarioNum = presentacionNum && precioNum ? (precioNum / presentacionNum) : Number(ing.p_unitario || 0);
                          const importeNum = Number(ing.importe || 0);

                          const isEditingThis = editandoIngredienteId === ing.id;
                          const rendimientoCalculado = isEditingThis && Number(editBruto) > 0
                            ? ((Number(editNeto) / Number(editBruto)) * 100).toFixed(2)
                            : ing.rendimiento;
                          const importeCalculado = isEditingThis && Number(editBruto) > 0
                            ? Number(editBruto) * pUnitarioNum
                            : importeNum;

                          return (
                            <tr key={ing.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: isEditingThis ? 'var(--primary-subtle)' : 'transparent', transition: 'background-color 0.15s' }}>
                              <td style={{ padding: '9px 10px', fontWeight: 700, color: 'var(--text-main)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ins?.nombre}>
                                {ins?.nombre || 'Insumo'}
                              </td>
                              <td style={{ padding: '9px 6px', whiteSpace: 'nowrap' }}>
                                <span className={`badge-tag ${ins?.tipo === 'materia_prima' ? 'badge-materia-prima' : 'badge-complementaria'}`} style={{ padding: '2px 7px', fontSize: '0.67rem' }}>
                                  {ins?.tipo === 'materia_prima' ? 'Materia prima' : 'Complementaria'}
                                </span>
                              </td>
                              <td style={{ padding: '9px 6px', textAlign: 'right', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {presentacionNum !== null ? presentacionNum.toFixed(3) : 'NONE'}
                              </td>

                              {/* Columna Neto: Modo Edición / Modo Lectura */}
                              <td style={{ padding: isEditingThis ? '4px 4px' : '9px 6px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {isEditingThis ? (
                                  <input 
                                    type="number" 
                                    step="0.001"
                                    value={editNeto}
                                    onChange={e => setEditNeto(e.target.value)}
                                    className="input-field"
                                    style={{ width: '65px', textAlign: 'right', padding: '3px 4px', fontSize: '0.78rem', fontWeight: 700 }}
                                    autoFocus
                                  />
                                ) : (
                                  Number(ing.cantidad_neta).toFixed(3)
                                )}
                              </td>

                              {/* Columna Bruto: Modo Edición / Modo Lectura */}
                              <td style={{ padding: isEditingThis ? '4px 4px' : '9px 6px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {isEditingThis ? (
                                  <input 
                                    type="number" 
                                    step="0.001"
                                    value={editBruto}
                                    onChange={e => setEditBruto(e.target.value)}
                                    className="input-field"
                                    style={{ width: '65px', textAlign: 'right', padding: '3px 4px', fontSize: '0.78rem', fontWeight: 700 }}
                                  />
                                ) : (
                                  Number(ing.cantidad_bruta).toFixed(3)
                                )}
                              </td>

                              <td style={{ padding: '9px 6px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {ins?.unidad || 'Kg'}
                              </td>

                              {/* Rendimiento Dinámico */}
                              <td style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700, color: Number(rendimientoCalculado) < 80 ? '#dc2626' : '#16a34a', whiteSpace: 'nowrap' }}>
                                {rendimientoCalculado}%
                              </td>

                              <td style={{ padding: '9px 6px', textAlign: 'right', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {precioNum !== null ? `$${precioNum.toFixed(2)}` : 'NONE'}
                              </td>
                              <td style={{ padding: '9px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                ${pUnitarioNum.toFixed(2)}
                              </td>

                              {/* Importe Dinámico */}
                              <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--primary-accent)', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                                ${importeCalculado.toFixed(2)}
                              </td>

                              {/* Acciones: Editar / Guardar / Cancelar / Eliminar */}
                              <td className="no-print" style={{ padding: '9px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  {isEditingThis ? (
                                    <>
                                      <button 
                                        onClick={() => ing.id && handleGuardarEditarIngrediente(ing.id)}
                                        title="Guardar cambios"
                                        style={{ background: 'var(--primary-accent)', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '3px', borderRadius: '4px', display: 'flex' }}>
                                        <Save size={13} />
                                      </button>
                                      <button 
                                        onClick={handleCancelarEditarIngrediente}
                                        title="Cancelar edición"
                                        style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', borderRadius: '4px', display: 'flex' }}>
                                        <X size={13} />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => ing.id && handleIniciarEditarIngrediente(ing.id, ing.cantidad_neta, ing.cantidad_bruta)}
                                        title="Editar cantidad neta y bruta"
                                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', padding: '3px', borderRadius: '4px', display: 'flex' }}>
                                        <Edit2 size={14} />
                                      </button>
                                      <button 
                                        onClick={() => ing.id && handleEliminarIngrediente(ing.id)}
                                        title="Eliminar ingrediente de la receta"
                                        style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '3px', borderRadius: '4px', display: 'flex' }}>
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={11} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No hay ingredientes agregados a esta receta todavía. Utiliza la barra superior para agregar insumos.
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* Pie de tabla con el TOTAL */}
                    <tfoot>
                      <tr style={{ background: 'var(--bg-surface-elevated)', borderTop: '2px solid var(--border-strong)' }}>
                        <td colSpan={9} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontSize: '0.84rem', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                          TOTAL COSTO DE ELABORACIÓN
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 900, fontSize: '1rem', color: 'var(--primary-accent)', whiteSpace: 'nowrap' }}>
                          ${totalImporte.toFixed(2)}
                        </td>
                        <td className="no-print"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="card-gourmet" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
              <Utensils size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
              <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>No hay recetas registradas.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Crea tu primera receta presionando el botón "Nueva Receta".</p>
              <button onClick={handleCrearNuevaReceta} className="btn-primary" style={{ marginTop: '16px', padding: '10px 20px' }}>
                <Plus size={16} /> Crear Primera Receta
              </button>
            </div>
          )}

          {/* Modal de Confirmación para Eliminar Receta */}
          {recetaAEliminarConfirmar && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px'
            }}>
              <div className="card-gourmet" style={{
                maxWidth: '480px',
                width: '100%',
                padding: '28px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#dc2626',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex'
                  }}>
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Eliminar Ficha de Receta
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.5 }}>
                  ¿Deseas eliminar la receta <strong>"{recetaAEliminarConfirmar.nombre}"</strong>?
                </p>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Esta acción retirará la receta junto con su costeo financiero y desglose de ingredientes. No se puede deshacer.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setRecetaAEliminarConfirmar(null)}
                    style={{
                      padding: '10px 18px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                    No, Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleEjecutarEliminarReceta}
                    style={{
                      padding: '10px 22px',
                      background: '#dc2626',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    Sí, Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BASE DE DATOS (CATÁLOGO DE INSUMOS) */}
      {tab === 'insumos' && (
        <section className="card-gourmet" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Catálogo de Insumos</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                Registro unificado de ingredientes, presentaciones y precios de compra
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '600px', justifyContent: 'flex-start' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setPaginaActual(1);
                  }} 
                  placeholder="Buscar ingrediente..."
                  className="input-field"
                  style={{ paddingLeft: '36px', paddingRight: searchTerm ? '32px' : '12px', fontSize: '0.85rem' }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setPaginaActual(1);
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex'
                    }}>
                    <X size={15} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
                <label className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.84rem', cursor: cargandoImportacion ? 'wait' : 'pointer', background: 'var(--bg-surface-elevated)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', opacity: cargandoImportacion ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                  <FileSpreadsheet size={15} color="var(--primary-accent)" /> 
                  <span>{cargandoImportacion ? '...' : 'Importar'}</span>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleSubirExcel} 
                    disabled={cargandoImportacion}
                    style={{ display: 'none' }} 
                  />
                </label>

                <button 
                  onClick={handleAbrirCrearInsumo} 
                  className="btn-primary" 
                  style={{ padding: '8px 12px', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                  <Plus size={15} /> Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Formulario Modal Emergente Agregar / Editar Insumo */}
          {mostrarModalInsumo && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
              backdropFilter: 'blur(3px)'
            }}>
              <form onSubmit={handleGuardarInsumoManual} style={{ 
                background: 'var(--bg-surface)', 
                padding: '26px', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border-strong)',
                boxShadow: 'var(--shadow-lg)',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                position: 'relative'
              }}>
                {errorInsumoModal && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 20,
                    width: 'calc(100% - 48px)',
                    animation: 'toastSlideInModal 0.25s ease-out forwards',
                    padding: '11px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1.5px solid #ef4444',
                    color: '#dc2626',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-main)' }}>{errorInsumoModal}</span>
                    <button 
                      type="button"
                      onClick={() => setErrorInsumoModal('')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary-accent)',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex'
                    }}>
                      <Edit2 size={18} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {insumoAEditar ? `Editar Ingrediente: ${insumoAEditar.nombre}` : 'Registrar Ingrediente'}
                    </h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setMostrarModalInsumo(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Ingrediente (Nombre) *
                    </label>
                    <input 
                      type="text" 
                      value={nuevoInsumoNombre} 
                      onChange={e => setNuevoInsumoNombre(e.target.value)} 
                      placeholder="Nombre del ingrediente..."
                      className="input-field"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Tipo de ingrediente
                    </label>
                    <select 
                      value={nuevoInsumoTipo} 
                      onChange={e => setNuevoInsumoTipo(e.target.value as 'materia_prima' | 'complementaria')}
                      className="input-field">
                      <option value="materia_prima">Materia prima</option>
                      <option value="complementaria">Complementaria</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Unidad (Kg o Lt)
                    </label>
                    <select 
                      value={nuevoInsumoUnidad} 
                      onChange={e => setNuevoInsumoUnidad(e.target.value as 'Kg' | 'Lt')}
                      className="input-field">
                      <option value="Kg">Kg</option>
                      <option value="Lt">Lt</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Presentación (Cantidad de compra)
                    </label>
                    <input 
                      type="number" 
                      step="0.001" 
                      value={nuevoInsumoPresentacion} 
                      onChange={e => setNuevoInsumoPresentacion(e.target.value)} 
                      placeholder="1.000 (o vacío para NONE)"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Precio ($ por presentación)
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={nuevoInsumoPrecio} 
                      onChange={e => setNuevoInsumoPrecio(e.target.value)} 
                      placeholder="61.00 (o vacío para NONE)"
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setMostrarModalInsumo(false)}
                    style={{ padding: '9px 18px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '9px 24px', fontWeight: 700 }}>
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabla de Insumos con las columnas exactas del Excel */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table-compact-mobile" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 700 }}>Ingrediente</th>
                  <th style={{ padding: '10px 6px', fontWeight: 700 }}>Tipo</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700 }}>Presentación</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 700 }}>Unidad</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700 }}>Precio</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Search size={28} style={{ opacity: 0.4 }} />
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {searchTerm ? `No se encontraron ingredientes para "${searchTerm}"` : 'El catálogo está vacío'}
                        </div>
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm('');
                              setPaginaActual(1);
                            }}
                            className="btn-primary"
                            style={{ marginTop: '6px', padding: '6px 14px', fontSize: '0.8rem' }}>
                            Limpiar búsqueda
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  insumosPaginados.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word', maxWidth: '140px' }}>{item.nombre}</td>
                      <td style={{ padding: '10px 6px' }}>
                        <span className={`badge-tag ${item.tipo === 'materia_prima' ? 'badge-materia-prima' : 'badge-complementaria'}`} style={{ padding: '2px 6px', fontSize: '0.70rem' }}>
                          {item.tipo === 'materia_prima' ? 'M. Prima' : 'Comp.'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {item.presentacion !== null ? item.presentacion : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NONE</span>}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600 }}>{item.unidad}</td>
                      <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700, color: item.precio !== null ? 'var(--primary-accent)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {item.precio !== null ? `$${Number(item.precio).toFixed(2)}` : <span style={{ fontStyle: 'italic', fontWeight: 400 }}>NONE</span>}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            onClick={() => handleAbrirEditarInsumo(item)}
                            title="Editar ingrediente"
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', padding: '2px' }}>
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => handleSolicitarEliminarInsumo(item)}
                            title="Eliminar ingrediente"
                            style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Barra de Paginación con Flechitas */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '20px', 
            paddingTop: '16px', 
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Mostrando <strong>{filteredInsumos.length > 0 ? indiceInicio + 1 : 0}</strong> a <strong>{Math.min(indiceInicio + itemsPorPagina, filteredInsumos.length)}</strong> de <strong>{filteredInsumos.length}</strong> ingredientes
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                title="Página anterior"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: paginaActual === 1 ? 'var(--text-light)' : 'var(--text-main)',
                  cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                  opacity: paginaActual === 1 ? 0.5 : 1
                }}>
                <ChevronLeft size={18} />
              </button>

              <span style={{ fontSize: '0.88rem', fontWeight: 600, padding: '0 8px', color: 'var(--text-main)' }}>
                Página {paginaActual} de {totalPaginas}
              </span>

              <button
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual >= totalPaginas}
                title="Página siguiente"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: paginaActual >= totalPaginas ? 'var(--text-light)' : 'var(--text-main)',
                  cursor: paginaActual >= totalPaginas ? 'not-allowed' : 'pointer',
                  opacity: paginaActual >= totalPaginas ? 0.5 : 1
                }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Modal Conflicto Recetas */}
          {conflictoRecetas && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px'
            }}>
              <div className="card-gourmet" style={{
                maxWidth: '520px',
                width: '100%',
                padding: '28px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#dc2626',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex'
                  }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Insumo vinculado a Receta(s)
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
                      Acción requerida
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '14px', lineHeight: 1.5 }}>
                  {conflictoRecetas.mensaje}
                </p>

                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem'
                }}>
                  <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--primary-accent)' }}>
                    Receta(s) afectadas:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)' }}>
                    {conflictoRecetas.recetas.map((r, idx) => (
                      <li key={idx}><strong>{r}</strong></li>
                    ))}
                  </ul>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                  ¿Deseas {conflictoRecetas.tipo === 'eliminar' ? 'eliminarlo' : 'editarlo'} de todas formas? 
                  <span style={{ display: 'block', marginTop: '4px', color: '#dc2626', fontWeight: 600 }}>
                    ⚠️ Primero se retirará automáticamente de esa(s) receta(s) para poder completar la acción.
                  </span>
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setConflictoRecetas(null)}
                    style={{
                      padding: '10px 18px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                    No, Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmarForzado}
                    style={{
                      padding: '10px 20px',
                      background: '#dc2626',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    Sí, {conflictoRecetas.tipo === 'eliminar' ? 'Eliminar de todas formas' : 'Proceder con la edición'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Confirmación Normal Insumo */}
          {insumoAEliminarConfirmar && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px'
            }}>
              <div className="card-gourmet" style={{
                maxWidth: '460px',
                width: '100%',
                padding: '28px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#dc2626',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex'
                  }}>
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Confirmar Eliminación
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '24px', lineHeight: 1.5 }}>
                  ¿Deseas eliminar <strong>"{insumoAEliminarConfirmar.nombre}"</strong>?
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setInsumoAEliminarConfirmar(null)}
                    style={{
                      padding: '10px 18px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                    No
                  </button>

                  <button
                    type="button"
                    onClick={handleEjecutarEliminarInsumo}
                    style={{
                      padding: '10px 22px',
                      background: '#dc2626',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    Sí
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
      {/* MODAL CONFIGURACIÓN DE PERFIL */}
      {mostrarModalPerfil && usuarioLogueado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Header del modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary-accent)',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex'
                }}>
                  <UserCog size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Mi Cuenta
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Usuario: <strong>{usuarioLogueado.username}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setMostrarModalPerfil(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Mensajes de error o éxito */}
            {perfilError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertTriangle size={16} />
                <span>{perfilError}</span>
              </div>
            )}

            {perfilExito && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#059669',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={16} />
                <span>{perfilExito}</span>
              </div>
            )}

            <form onSubmit={handleGuardarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Modificar Correo Electrónico */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email"
                    value={perfilEmail}
                    onChange={e => setPerfilEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="input-field"
                    style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              {/* Separador visual para Contraseña */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Key size={16} style={{ color: 'var(--primary-accent)' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Cambiar Contraseña
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(opcional)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Contraseña actual (requerida para cambiar contraseña)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password"
                        value={perfilCurrentPassword}
                        onChange={e => setPerfilCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field"
                        style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Nueva Contraseña
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password"
                        value={perfilNewPassword}
                        onChange={e => setPerfilNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field"
                        style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Confirmar Nueva Contraseña
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password"
                        value={perfilConfirmNewPassword}
                        onChange={e => setPerfilConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field"
                        style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Guardar Cambios */}
              <button 
                type="submit"
                disabled={perfilCargando}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '11px',
                  fontSize: '0.92rem',
                  marginTop: '8px',
                  justifyContent: 'center'
                }}>
                {perfilCargando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>

            {/* Zona de peligro: Eliminar Cuenta */}
            <div style={{
              marginTop: '28px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#dc2626' }}>
                    Eliminar mi cuenta
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Se borrarán permanentemente tus recetas e insumos privados.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteAccountPassword('');
                    setDeleteAccountError('');
                    setMostrarConfirmarEliminarCuenta(true);
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}>
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR CUENTA (PIDE CONTRASEÑA) */}
      {mostrarConfirmarEliminarCuenta && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#dc2626',
                padding: '10px',
                borderRadius: '50%',
                display: 'flex'
              }}>
                <Trash2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                ¿Eliminar tu cuenta por completo?
              </h3>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
              Esta acción es irreversible. Se eliminará tu usuario y todas tus recetas y fichas técnicas asociadas. Para confirmar, introduce tu contraseña actual:
            </p>

            {deleteAccountError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '14px'
              }}>
                <AlertTriangle size={15} />
                <span>{deleteAccountError}</span>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Contraseña Actual *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password"
                  value={deleteAccountPassword}
                  onChange={e => setDeleteAccountPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="input-field"
                  style={{ paddingLeft: '36px', fontSize: '0.92rem' }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setMostrarConfirmarEliminarCuenta(false);
                  setDeleteAccountPassword('');
                  setDeleteAccountError('');
                }}
                disabled={deleteAccountCargando}
                style={{
                  padding: '9px 16px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEjecutarEliminarCuenta}
                disabled={deleteAccountCargando}
                style={{
                  padding: '9px 18px',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}>
                {deleteAccountCargando ? 'Eliminando...' : 'Eliminar Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENEDOR FLOTANTE DE NOTIFICACIONES (TOASTS) GLOBALES */}
      <div className="toast-floating-container">
        {/* Notificación de resultado de importación de Excel */}
        {notifImportacion && (
          <div 
            className="toast-floating-item"
            style={{
              background: notifImportacion.tipo === 'exito' ? 'var(--bg-surface)' : 'var(--bg-surface)',
              border: `1.5px solid ${notifImportacion.tipo === 'exito' ? '#16a34a' : '#ef4444'}`,
              color: notifImportacion.tipo === 'exito' ? '#15803d' : '#dc2626',
            }}>
            {notifImportacion.tipo === 'exito' ? <CheckCircle2 size={19} color="#16a34a" /> : <AlertTriangle size={19} color="#ef4444" />}
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{notifImportacion.mensaje}</span>
            <button 
              type="button"
              onClick={() => setNotifImportacion(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', marginLeft: '6px' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Notificación de error en receta (ej. nombre duplicado) */}
        {errorReceta && (
          <div 
            className="toast-floating-item"
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid #ef4444',
              color: '#dc2626',
            }}>
            <AlertTriangle size={19} color="#ef4444" />
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{errorReceta}</span>
            <button 
              type="button"
              onClick={() => setErrorReceta('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', marginLeft: '6px' }}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
