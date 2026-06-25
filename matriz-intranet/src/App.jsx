import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home, FolderKanban, Clock, FileSpreadsheet, Users, Plus,
  ChevronRight, ChevronDown, ChevronLeft, TrendingUp, Calendar, Lock, Eye, EyeOff,
  Building2, User, DollarSign, FileText, Check, X, Pencil, Trash2, Settings,
  BarChart3, AlertTriangle, Printer, FileDown, UserPlus, Save, LogOut, Loader2,
  Moon, Sun, Snowflake, ClipboardList, MessageSquare, Send, Circle, Wifi, Download, Upload, Database, Shield, Edit3
} from 'lucide-react';
import {
  subscribeToProyectos,
  subscribeToColaboradores,
  subscribeToHoras,
  subscribeToStatusData,
  subscribeToTareas,
  subscribeToPresencia,
  saveProyecto,
  deleteProyecto as deleteProyectoFS,
  saveColaborador,
  deleteColaborador as deleteColaboradorFS,
  saveHora,
  deleteHora as deleteHoraFS,
  saveStatusData,
  saveTarea,
  deleteTarea as deleteTareaFS,
  updatePresencia,
  setOffline,
  saveAllProyectos,
  saveAllColaboradores,
  exportFullBackup,
  restoreFromBackup,
  saveAutoBackup,
  saveCotizacion,
  deleteCotizacion as deleteCotizacionFS,
  subscribeToCotizaciones,
  saveDuraciones,
  subscribeToDuraciones
} from './firestoreService';

// ============================================
// SISTEMA DE USUARIOS Y ROLES
// ============================================
const USUARIOS_INICIAL = [
  { id: 'admin', nombre: 'Sebastián Vizcarra', email: 'sebastianvizcarra@gmail.com', password: 'admin123', rol: 'admin', profesionalId: 3 },
  { id: 'user1', nombre: 'Cristóbal Ríos', email: 'cristobal@matriz.cl', password: 'crios123', rol: 'profesional', profesionalId: 1 },
  { id: 'user2', nombre: 'Dominique Thompson', email: 'dominique@matriz.cl', password: 'dthompson123', rol: 'profesional', profesionalId: 2 },
];

// Estilos de impresión
const PrintStyles = () => (
  <style>{`
    @media print {
      /* Ocultar todo excepto contenido de impresión */
      body * {
        visibility: hidden;
      }
      
      /* Mostrar solo el contenido del PDF */
      .print-content,
      .print-content * {
        visibility: visible;
      }
      
      /* Posicionar el contenido para impresión */
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white !important;
      }
      
      /* Ocultar elementos no imprimibles */
      .no-print {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Contenido de impresión - sin saltos de página */
      .print-page-1,
      .print-page-2 {
        page-break-after: avoid;
        page-break-before: avoid;
        padding: 0 !important;
        margin: 0 !important;
        background: white !important;
        box-shadow: none !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      
      /* Asegurar fondos y colores se impriman */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      /* Quitar fondos oscuros del modal */
      .fixed {
        position: static !important;
        background: transparent !important;
      }
      
      /* Tablas */
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      
      th, td {
        border: 1px solid #ccc !important;
      }
      
      /* Tamaño de página carta apaisada */
      @page {
        size: letter landscape;
        margin: 8mm 12mm;
      }
    }
  `}</style>
);

// ============================================
// DATOS BASE
// ============================================

const COLABORADORES_INICIAL = [
  { id: 1, nombre: 'Cristóbal Ríos', cargo: 'Arquitecto', categoria: 'Ingeniero Senior', tarifaInterna: 0.75, iniciales: 'CR', proyectosAsignados: [] },
  { id: 2, nombre: 'Dominique Thompson', cargo: 'Arquitecta', categoria: 'Proyectista', tarifaInterna: 0.5, iniciales: 'DT', proyectosAsignados: [] },
  { id: 3, nombre: 'Sebastián Vizcarra', cargo: 'Arquitecto', categoria: 'Líder de Proyecto', tarifaInterna: 1.0, iniciales: 'SV', proyectosAsignados: [] },
];

// Entregables del proyecto (35 documentos)
const ENTREGABLES_PROYECTO = [
  { id: 1, codigo: "", name: "CRITERIOS DE DISEÑO", weekStart: 2 },
  { id: 2, codigo: "", name: "PLANTA DISPOSICIÓN GENERAL", weekStart: 2 },
  { id: 3, codigo: "", name: "PLANTA DEMOLICIÓN 1 DE 2", weekStart: 3 },
  { id: 4, codigo: "", name: "PLANTA DEMOLICIÓN 2 DE 2", weekStart: 3 },
  { id: 5, codigo: "", name: "EETT DEMOLICIONES", weekStart: 4 },
  { id: 6, codigo: "", name: "PLANTA TERMINACIONES 1", weekStart: 5 },
  { id: 7, codigo: "", name: "PLANTA TERMINACIONES 2", weekStart: 5 },
  { id: 8, codigo: "", name: "PLANTA PAVIMENTOS 1", weekStart: 5 },
  { id: 9, codigo: "", name: "PLANTA PAVIMENTOS 2", weekStart: 6 },
  { id: 10, codigo: "", name: "TABIQUES VIDRIADOS 1", weekStart: 6 },
  { id: 11, codigo: "", name: "TABIQUES VIDRIADOS 2", weekStart: 6 },
  { id: 12, codigo: "", name: "TABIQUES VIDRIADOS 3", weekStart: 7 },
  { id: 13, codigo: "", name: "TABIQUES VIDRIADOS 4", weekStart: 7 },
  { id: 14, codigo: "", name: "CIELOS E ILUMINACIÓN 1", weekStart: 7 },
  { id: 15, codigo: "", name: "CIELOS E ILUMINACIÓN 2", weekStart: 8 },
  { id: 16, codigo: "", name: "DETALLES TABIQUES TIPO", weekStart: 8 },
  { id: 17, codigo: "", name: "DETALLES REVESTIMIENTOS 1", weekStart: 8 },
  { id: 18, codigo: "", name: "DETALLES REVESTIMIENTOS 2", weekStart: 9 },
  { id: 19, codigo: "", name: "DETALLES PAVIMENTOS", weekStart: 9 },
  { id: 20, codigo: "", name: "PUERTAS Y QUINCALLERÍA", weekStart: 9 },
  { id: 21, codigo: "", name: "DETALLES COCINA", weekStart: 10 },
  { id: 22, codigo: "", name: "DETALLES CAFETERÍA", weekStart: 10 },
  { id: 23, codigo: "", name: "DETALLES SALA CONTROL", weekStart: 10 },
  { id: 24, codigo: "", name: "ACCESIBILIDAD Y RAMPA", weekStart: 11 },
  { id: 25, codigo: "", name: "PLANTA SEÑALÉTICA", weekStart: 11 },
  { id: 26, codigo: "", name: "DETALLES SEÑALÉTICA", weekStart: 11 },
  { id: 27, codigo: "", name: "EETT GENERALES", weekStart: 12 },
  { id: 28, codigo: "", name: "MTO (MATERIALES)", weekStart: 13 },
  { id: 29, codigo: "", name: "MOBILIARIO 1", weekStart: 14 },
  { id: 30, codigo: "", name: "MOBILIARIO 2", weekStart: 14 },
  { id: 31, codigo: "", name: "ELEVACIÓN INT. NORTE/SUR", weekStart: 15 },
  { id: 32, codigo: "", name: "ELEVACIÓN INT. ORIE/PON", weekStart: 15 },
  { id: 33, codigo: "", name: "SECCIÓN A-A / B-B", weekStart: 16 },
  { id: 34, codigo: "", name: "SECCIÓN C-C / D-D", weekStart: 16 },
  { id: 35, codigo: "", name: "IMÁGENES OBJETIVO", weekStart: 17 },
];

// ============================================
// DURACIONES POR TIPO DE DOCUMENTO (en días hábiles)
// REV_A usa la duración del tipo; REV_B y REV_0 siempre son 3 días
// Entregables con misma secuencia se trabajan en PARALELO
// ============================================
const DURACION_POR_TIPO_DEFAULT = {
  DOC: 10,      // Documentos (criterios, EETT, MTO, informes)
  PLA: 7,       // Planos generales
  'PLA DET': 10, // Planos de detalle
  INF: 10,      // Informes
  'REU INT': 1,  // Reunión interna
  'REU CTTAL': 1, // Reunión contractual
  REU: 1,       // Reunión (genérico)
  VIS: 1,       // Visita
};

// Duración fija para REV_B y REV_0 (en días hábiles)
const DURACION_REVISION_DEFAULT = 3;

// Helper: obtener duración REV_A en días para un entregable según su tipo
const obtenerDuracionRevA = (entregable, duraciones = DURACION_POR_TIPO_DEFAULT) => {
  const cod = (entregable.codigo || '').toUpperCase();
  const nom = (entregable.nombre || entregable.name || '').toUpperCase();
  const tipoManual = entregable.tipo;

  // Si tiene tipo manual, usarlo
  if (tipoManual) {
    if (duraciones[tipoManual] !== undefined) return duraciones[tipoManual];
  }

  // Auto-detectar tipo desde código/nombre
  // DOC: CRD, SPE, MTO, ERD
  if (cod.includes('CRD') || cod.includes('SPE') || cod.includes('MTO') || cod.includes('ERD') ||
      nom.includes('CRITERIO') || nom.includes('EETT') || nom.includes('MTO')) {
    return duraciones['DOC'] || 10;
  }

  // PLA DET: Detalles
  if (cod.includes('DET') || nom.includes('DETALLE') || nom.includes('DETALLES')) {
    return duraciones['PLA DET'] || 10;
  }

  // REU
  if (cod.includes('REU') || nom.includes('REUNIÓN') || nom.includes('REUNION')) {
    if (nom.includes('CTTAL') || nom.includes('CONTRACTUAL')) return duraciones['REU CTTAL'] || 1;
    if (nom.includes('INT')) return duraciones['REU INT'] || 1;
    return duraciones['REU'] || 1;
  }

  // VIS
  if (cod.includes('VIS') || nom.includes('VISITA')) {
    return duraciones['VIS'] || 1;
  }

  // PLA (planos generales) - default
  return duraciones['PLA'] || 7;
};

const PROYECTOS_INICIALES = [
  {
    id: 'P2600',
    nombre: 'Spence SGO - Obras Tempranas',
    cliente: 'BHP Billiton',
    estado: 'Activo',
    inicio: '2026-01-06',
    avance: 8.6,
    tarifaVenta: 1.2,
    entregables: [
      { id: 1, codigo: 'P2600-CRD-001', nombre: 'CRITERIOS DE DISEÑO', secuencia: 1, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 2, codigo: 'P2600-ARQ-001', nombre: 'PLANTA DISPOSICIÓN GENERAL', secuencia: 2, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 3, codigo: 'P2600-ARQ-002', nombre: 'PLANTA DEMOLICIÓN 1 DE 2', secuencia: 3, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 4, codigo: 'P2600-ARQ-003', nombre: 'PLANTA DEMOLICIÓN 2 DE 2', secuencia: 4, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 5, codigo: 'P2600-SPE-001', nombre: 'EETT DEMOLICIONES', secuencia: 5, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 6, codigo: 'P2600-ARQ-004', nombre: 'PLANTA TERMINACIONES 1', secuencia: 6, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 7, codigo: 'P2600-ARQ-005', nombre: 'PLANTA TERMINACIONES 2', secuencia: 7, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 8, codigo: 'P2600-ARQ-006', nombre: 'PLANTA PAVIMENTOS 1', secuencia: 8, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 9, codigo: 'P2600-ARQ-007', nombre: 'PLANTA PAVIMENTOS 2', secuencia: 9, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 10, codigo: 'P2600-DET-001', nombre: 'DETALLES TABIQUES TIPO', secuencia: 10, valorRevA: 17.5, valorRevB: 5, valorRev0: 2.5, frozen: false },
      { id: 11, codigo: 'P2600-DET-002', nombre: 'DETALLES REVESTIMIENTOS', secuencia: 11, valorRevA: 17.5, valorRevB: 5, valorRev0: 2.5, frozen: false },
      { id: 12, codigo: 'P2600-DET-003', nombre: 'DETALLES PAVIMENTOS', secuencia: 12, valorRevA: 17.5, valorRevB: 5, valorRev0: 2.5, frozen: false },
      { id: 13, codigo: 'P2600-SPE-002', nombre: 'EETT GENERALES', secuencia: 13, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 14, codigo: 'P2600-MTO-001', nombre: 'MTO (MATERIALES)', secuencia: 14, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
    ]
  },
  {
    id: 'P2601',
    nombre: 'Escondida MEL - Fase 2',
    cliente: 'BHP Billiton',
    estado: 'Activo',
    inicio: '2026-02-01',
    avance: 0,
    tarifaVenta: 1.1,
    entregables: [
      { id: 1, codigo: 'P2601-CRD-001', nombre: 'CRITERIOS DE DISEÑO', secuencia: 1, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 2, codigo: 'P2601-ARQ-001', nombre: 'PLANTA GENERAL NIVEL 0', secuencia: 2, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 3, codigo: 'P2601-ARQ-002', nombre: 'PLANTA GENERAL NIVEL 1', secuencia: 3, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 4, codigo: 'P2601-SPE-001', nombre: 'EETT ARQUITECTURA', secuencia: 4, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 5, codigo: 'P2601-MTO-001', nombre: 'MTO ARQUITECTURA', secuencia: 5, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
    ]
  },
];

// Obtener número de semana del año (ISO 8601)
const getWeekOfYear = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Obtener semana actual del año
const getCurrentWeekOfYear = () => getWeekOfYear(new Date());

// Obtener semanas de un mes específico (con números de semana del año)
// Si no se pasa parámetro, usa el mes actual
const getWeeksOfMonth = (mesString = null) => {
  let year, month;
  if (mesString) {
    // Formato: "2026-02"
    const [y, m] = mesString.split('-').map(Number);
    year = y;
    month = m - 1; // JavaScript months are 0-indexed
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let weekStart = new Date(firstDay);
  // Ajustar al lunes
  const dayOfWeek = weekStart.getDay();
  if (dayOfWeek !== 1) {
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  }

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4); // Viernes
    const weekOfYear = getWeekOfYear(weekStart); // Usar número de semana del año
    weeks.push({
      num: weekOfYear, // Ahora es el número de semana del año
      start: new Date(weekStart),
      end: weekEnd,
      label: `S${weekOfYear} (${weekStart.getDate()}/${weekStart.getMonth()+1} - ${weekEnd.getDate()}/${weekEnd.getMonth()+1})`
    });
    weekStart.setDate(weekStart.getDate() + 7);
  }
  return weeks;
};

// ============================================
// COMPONENTES UI
// ============================================

const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm ${onClick ? 'cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md active:bg-neutral-50 dark:bg-neutral-800/50 dark:active:bg-neutral-700 active:scale-[0.98] transition-all touch-manipulation select-none' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white',
    secondary: 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 active:bg-neutral-400 dark:active:bg-neutral-50 dark:bg-neutral-800/500 text-neutral-700 dark:text-neutral-200 dark:text-neutral-200',
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 dark:active:bg-neutral-600 text-neutral-600 dark:text-neutral-300',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
  };
  const sizes = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button className={`rounded font-medium transition-colors inline-flex items-center justify-center touch-manipulation ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs text-neutral-600 dark:text-neutral-300 dark:text-neutral-400 font-medium">{label}</label>}
    <input
      className="w-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded px-3 py-2.5 sm:py-2 text-neutral-800 dark:text-neutral-100 text-base sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      {...props}
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs text-neutral-600 dark:text-neutral-300 dark:text-neutral-400 font-medium">{label}</label>}
    <select
      className="w-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded px-3 py-2.5 sm:py-2 text-neutral-800 dark:text-neutral-100 text-base sm:text-sm focus:outline-none focus:border-orange-500 appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '20px', paddingRight: '36px' }}
      {...props}
    >
      {children}
    </select>
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
    success: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
    warning: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400',
    danger: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Componentes del Dashboard
const DashboardCheckbox = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(!checked); }}
    disabled={disabled}
    className={`w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-orange-500 border-orange-500' : 'border-neutral-300 dark:border-neutral-600 hover:border-orange-400 active:border-orange-500'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {checked && <Check className="w-4 h-4 sm:w-3 sm:h-3 text-white" />}
  </button>
);

const DashboardBadge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
    success: 'bg-green-100 text-green-700 border border-green-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    warning: 'bg-orange-100 text-orange-700 border border-orange-200',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

const ProgressBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-neutral-800 dark:text-neutral-100">{value} / {total} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const Accordion = ({ title, count, color, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${color}`} />
          <span className="text-neutral-800 dark:text-neutral-100 text-sm">{title}</span>
          <span className="text-neutral-500 dark:text-neutral-400 text-xs">({count})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-3 bg-white dark:bg-neutral-800 text-sm">{children}</div>}
    </div>
  );
};

// Funciones helper para el dashboard
const addWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateShort = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
};

const formatDateFull = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

// calculateDeadlines: calcula plazos con duraciones por tipo
// duracionRevADias: duración de REV_A en días hábiles (default 10 = 2 semanas)
// duracionRevBDias: duración de REV_B en días hábiles (default 3)
// duracionRev0Dias: duración de REV_0 en días hábiles (default 3)
const calculateDeadlines = (projectStart, weekStart, duracionRevADias = 10, duracionRevBDias = 3, duracionRev0Dias = 3) => {
  const start = new Date(projectStart);
  // El entregable comienza en la semana weekStart (relativa al inicio del proyecto)
  const entregableStart = addWeeks(start, weekStart);
  // REV_A termina después de duracionRevADias días hábiles
  const deadlineRevA = addDays(entregableStart, duracionRevADias);
  // REV_B termina después de duracionRevBDias días desde fin REV_A
  const deadlineRevB = addDays(deadlineRevA, duracionRevBDias);
  // REV_0 termina después de duracionRev0Dias días desde fin REV_B
  const deadlineRev0 = addDays(deadlineRevB, duracionRev0Dias);
  return { deadlineRevA, deadlineRevB, deadlineRev0, entregableStart, duracionRevADias, duracionRevBDias, duracionRev0Dias };
};

const calculateStatus = (status, deadlines) => {
  const today = new Date();
  if (!status) return { status: 'Pendiente', color: 'bg-neutral-50 dark:bg-neutral-800/500' };
  if (status.sentRev0) return { status: 'TERMINADO', color: 'bg-green-500' };
  if (status.sentRevB || status.sentRevA || status.sentIniciado) {
    const nextDeadline = !status.sentRevA ? deadlines.deadlineRevA :
                       !status.sentRevB ? deadlines.deadlineRevB : deadlines.deadlineRev0;
    if (today > nextDeadline) return { status: 'ATRASADO', color: 'bg-red-500' };
    return { status: 'En Proceso', color: 'bg-orange-500' };
  }
  if (today > deadlines.deadlineRevA) return { status: 'ATRASADO', color: 'bg-red-500' };
  return { status: 'Pendiente', color: 'bg-neutral-50 dark:bg-neutral-800/500' };
};

const getDocumentSuffix = (status) => {
  if (!status) return "";
  if (status.sentRev0 || status.comentariosBRecibidos) return "_0";
  if (status.comentariosARecibidos) return "_B";
  if (status.sentIniciado || status.sentRevA) return "_A";
  return "";
};

// Logo AFOR (base64 embebido)
const LOGO_AFOR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABhIAAAR8CAYAAAB4yg4tAABAmElEQVR4nOzdffz+91z///vOZ8ZsGB4zZjYbYiNnc7qQDGWICpUlSZdKQr5JfeX7raT8QiopSSnJaUJEX5s5F2aoyMlGHhpj2DBmn8/vj+NNTj7v7fN5v4/jeB4n1+vlclw+l8vHyeXG5b3j/TqO++skAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJiTvUYHAADroaqOT3LHJDdOckySo5NcJcnBSQ5KsvewOGCY7vaZBAAAFty+owMAgNVUVXsn+b4kD05yjySHjy0CAAAAtsKQAABMVVVdKckjkvxikiMG5wAAAADbZEgAAKaiqg5I8ugkj83klkUAAADACjAkAADbVlV3TfLHSY4d3QIAAABMlyEBANiyqto3yW8neUwSD0wFAACAFWRIAAC2pKqumuQfktxudAsAAAAwO4YEAGCPVdURSV6X5IajWwAAAIDZMiQAAHukqq6V5Mwk1xvdAgAAAMze3qMDAIDlUVVXSvLqGBEAAABgbRgSAIDdUlV7JXlBkhMHpwAAAABzZEgAAHbXo5Lcc3QEAAAAMF+GBADgclXVCUl+Z3QHAAAAMH+GBABgdzwzyf6jIwAAAID5MyQAAJepqh6U5PajOwAAAIAxDAkAwKaqap8kTxrdAQAAAIxjSAAALsuPJDl6dAQAAAAwjiEBALgsjxkdAAAAAIxlSAAAdqmqbpLkZqM7AAAAgLEMCQDAZn58dAAAAAAwniEBANjMfUYHAAAAAOMZEgCA71JVRyQ5ZnQHAAAAMJ4hAQDYlZNHBwAAAACLwZAAAOzKiaMDAAAAgMVgSAAAduXY0QEAAADAYjAkAAC74vkIAAAAQBJDAgCwa1cdHQAAAAAsBkMCALArB48OAAAAABaDIQEA2JWDRgcAAAAAi8GQAADsimMEAAAAIIkvCQAAAAAAgMtgSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADZlSAAAAAAAADa17+gAAIABvpjkfaMjAAAAYBkYEgCAdfSe7j55dAQAAAAsA7c2AgAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANmVIAAAAAAAANrXv6ABg8VTVwUkuHN3B3H09ydc2XhcmuWDjdV6ST268PpbkP5N8pLu/PKgTAJiSqtovyVFJjkly/SRHbLyuleSwJFdJckiSA5Pst/Haa0Aql29H/udY7huvr2RyPPfZJJ/beJ2f5ONJzklybpKPd/clA3phaqpq7yTXTnJ0Ju9lRye5RpKrJzl8488rJjkgk/ezA+Lk2rXW3X6XwR4yJADwDftuvA7K5EuDIy/j37uzqs5N8t6N13uSvL27PzXrSABga6rq0CS3SvK9SW668To2Pheuir0z+YL0wD38z+2oqv9K8v5MjuvO3vjzQ9196XQTYfuq6rAkN0tywsbrpklumMk4AMCMOGAEYCv2yuTsxaOS3Psbf1lVH0/yliSnJ3lDd39oQBsAkKSqjk5ycpI7JblNJqOBMzD5Tnsnuc7G6x7f8vcXVdWbk7xx4/WO7v7agD7WXFVdL8ntv+V1w3gvA5g7QwIA0/SND6E/miRV1Un+Ock/Jfnn7v78uDQAWG0bVxzcNcndk9wtk9t8wFYdnOQHNl5J8pWqen2Slyf5x+7+zKgwVltV7Z/kjknuufE6dmwRAIkFF9gFz0hgRi5NcmaSFyd5qdsgLbaq2jm6YcbO6O6TR0cAbFdVXSfJfTdet02yz9gi1sSOJG9O8ndJ/tbJImzXxnhwjyQPTHJKJkMWzIxnJMCe8w8N8F0MCczBjiRvSvKXSf6+u780NofvZEgAWFwb9wd/YJKfSHLLwTlwcZKXJHlOktO7e9WPIZiiqjo5yYOS3C/JoWNrWCeGBNhz/qEBvoshgTm7KMnfJ/mj7n736BgmDAkAi6eq7prkZzJ5PtH+g3NgV/49yVOS/E13XzI6hsVUVVdJ8pAkP5vkuKExrC1DAuw5/9AA38WQwEBvTPIHSV7R3TtGx6wzQwLAYqiqKyR5cJJHJrnx4BzYXZ9I8v8leXZ3f3l0DIuhqm6SyXvZjyU5aHAOa86QAHtu79EBAPAt7pjkZUn+raoeXFXu8wzAWqqqK1bVryQ5N8mzY0RguRyZyckhH66qn3FMt96q6pZV9fIk703y0BgRAJaSIQGARXRckr/OZFB4YFU5WwSAtVBVV6iqxyU5J8nvJrn62CLYlmsl+dMk76+qe4+OYb6q6vZV9dok78jklmyO6QGWmCEBgEV2gyR/k+TtVXX70TEAMCtVtVdV/XiSDyV5cpKrDU6CaTo+ycur6rVVdezoGGarqo6tqpclOTPJ3Ub3ADAdhgQAlsEtk5xZVX9fVUeMjgGAaaqq2yT51yR/leTag3Nglu6W5H1V9X82nv/BCqmqw6rqaUk+kOTUsTUATJshAYBlcv9Mbnf0C1XldxgAS62qDqmqP07y5iQ3H90Dc3JAkickObuqbjc6humoqp9K8uFMHqa83+AcAGbAlzAALJsrJ3lGkrdV1fGjYwBgK6rq1CT/keQR8bmM9XRMkjdW1e9V1QGjY9iaqrp+Vf1LkuckOXR0DwCz44AVgGV1yyTvrqpHehgzAMuiqq5UVX+R5GVJrjm6BwbbO8ljMjmmu/HoGHZfVe1TVY9N8r4kdx7dA8DsGRIAWGZXSPK0JK+rqmsMbgGAy7RxG5ezk5w2ugUWzI2SvKOqfnJ0CJevqo5M8oYkT8nkeByANWBIAGAV3CXJWVV18ugQANiVqnp0ktOTHDW2BBbWQUn+sqr+oqoOHB3DrlXVfZK8N8kdRrcAMF+GBABWxTWTvL6qfnV0CAB8w8YDlV+W5PeT7Du6B5bAaUneUFWHjw7hf1TVgRsPh39pPAsBYC0ZEgBYJfsk+e2qer6H9gEwWlUdneStSU4dnALL5jZJ3u65CYuhqq6Zya2MHjG6BYBxDAkArKIHxZlsAAxUVXdI8vYkNxzdAkvqqCRvqao7jQ5ZZ1V1YpJ3ZDLuALDGDAkArKqTMvnwedToEADWS1U9IMnrk1xtdAssuSsn+aequsfokHW08TyENyU5cnQLAOMZEgBYZddP8qaqOn50CADroap+KskLkuw/ugVWxBWSvLyq7j86ZJ1U1cOTvCTJFUe3ALAYDAkArLojkryxqk4YHQLAaquqRyb58/icBdO2X5IXVNWpo0PWQVX9QpI/SbLX6BYAFocDXADWwdWT/HNVHTc6BIDVVFU/n+Rp8cUbzMo+Sf6uqu46OmSVVdUvJ3lGvJcB8B0MCQCsi8OTvN4zEwCYtqr6yUy+eANm64BMbnN00uiQVVRVv5LkqaM7AFhMhgQA1sm1k/xLVV19dAgAq6Gq7pfkOXH2LszLFZP8g5NDpquqTkvyu6M7AFhchgQA1s3RmXz4PHB0CADLrapuk+T5mdxyBZifqyd5ZVVdaXTIKqiqH0jy7NEdACw2QwIA6+ikJH9ZVc4eBWBLNs6G/ockhmkY48aZPDPB9xrbUFU3S/LiJPuObgFgsfmFC8C6+pEkTxgdAcDyqaorJ3llJs/fAca5R5LHj45YVlV17SSvSnLw6BYAFp8hAYB19sSquuvoCACWznMyORsaGO+JVXXy6IhlU1X7Jfn7JNca3QLAcjAkALDO9k7yt1V1xOgQAJZDVf1Skh8e3QF80z5JXlBVrhDaM7+bye0+AWC3GBIAWHdXz+TDp9+JAFymjYcrP2V0B/BdrhkPC95tVXWfJI8a3QHAcvGlCQAkd0jy2NERACyuqjo4yd8k2W90C7BL966q00ZHLLqqul6S547uAGD5GBIAYOJJVXWT0REALKw/SHL06AjgMj2tqq4zOmJRVdVemYwIh4xuAWD5GBIAYGL/JH+98eA5APimqrpnkp8e3QFcrisn+aPREQvsZ5LcaXQEAMvJkAAA/+OEJI8eHQHA4qiqQ5L82egOYLfdq6ruOzpi0VTVEZk8YBkAtsSQAADf7ter6qjREQAsjN9Ocq3REcAeeUZVXWl0xIL547ilEQDbYEgAgG93UJJnjo4AYLyqumWSnx3dAeyxI5L86uiIRbFxhcYPje4AYLkZEgDgu92zqu41OgKAcapq7yTPis9MsKwe5cHLSVXtm+R3RncAsPwcFAPArv3exgcvANbTaUluPjoC2LIDM7k12bp7aJIbjI4AYPkZEgBg145P8rDREQDMX1UdlORJozuAbXtgVd1kdMQoG+9l/3t0BwCrwZAAAJt7ogf1Aaylxyap0RHAtu2V9f4i/ZHxsHgApsSQAACbOzzJz42OAGB+qurwJI8Z3QFMzX3X8aqEqrpykl8Z3QHA6jAkAMBl++WqusLoCADm5lFJDh4dAUzNXkkePzpigIcmucroCABWhyEBAC7b4Ul+enQEALNXVVeJK9FgFf1wVR05OmJeqmqfJL84ugOA1WJIAIDL99iq2nd0BAAz9wtJrjw6Api6fZP8/OiIOTo1yVGDGwBYMYYEALh8Rya51+gIAGanqg6IM3hhlT2sqg4aHTEnjxodAMDqMSQAwO552OgAAGbqvkmuNjoCmJlDk/zw6IhZq6pbJLnd6A4AVo8hAQB2z93X6d66AGvIYAyr76dGB8zBaaMDAFhNhgQA2D17Zz0+fAKsnao6JsnJozuAmbtjVV1/dMSsVNV+SR4wugOA1WRIAIDd54MZwGo6LcleoyOAmdsryYNGR8zQ3eMWbQDMyL6jAwBgidyoqo7r7g+ODmGxVdXO0Q0wDd29Ll+u3290ADA390/ypNERM/Lg0QEArC5XJADAnrnP6AAApqeqbpTkuNEdwNx8T1UdPzpi2qrqSkl+cHQHAKvLkAAAe+a+owMAmCrv67B+VvEqpB9McoXREQCsLrc2Ar5Ld18U9wleO1V1YJIrJjkkyXWTHJXk5kluk+TE+J3xDbeoqqt292dHhwAwFaeODgDm7p5Jfmt0xJT9wOgAAFabL4UASJJ098VJLk7y2SQf3fjr5yZJVR2a5IeS/GgmH1LWeWjaK8kdk7xsdAgA21NVh2UymgPr5dYreGLIXUcHALDaDAkAXK7uviDJ85I8r6qOS/LoJD+VZJ+hYeOcHEMCwCq4U9Z7HN9dFyT5TCYnHHwlydfH5rCJfTO5tc2BSQ5PcpWhNYtt7yR3S/KC0SHTUFXfk6RGdyyBC5Ocl8n72MVJvjY2B2C5GBIA2CPd/cEkP1NVT0vy9Kzn2U8njw4AYCruNDpgwVya5O1JTk9yVpL3Jvn4xlWLLJmqOiiTW1WemORmSe688afxbOL7syJDQib/W/gfO5K8K9/+Xnbuxi18AdgiQwIAW9Ld/1ZVd0vyC0l+N5Oz39bFTarqkO7+wugQALbFkDDx5iR/luTlfretju7+cpJ/23j9bZJU1eGZ3KryoUluOq5uIXzf6IAputvogAXxziR/nuQlK3bbKoCF4EwEALatqm6R5B+TXHN0yxzdsbvPHB0xK1W1c3TDjJ3R3SfP6r98Df7/Y01098p+Xqiqg5N8IZNbnKyr1yV5fHf/6+gQ5q+q7p7k/yS5xeiWgY7u7o+NjtiOqto7k/eyg0e3DPSGJE/o7reMDgFYZet80AzAlGx8AXHrJB8a3TJHJ44OAGBbTsj6fh76dJL7dPfdjAjrq7tfk+RWSX4+yZcG54yyClclXT/rOyKcn+QB3X1nIwLA7K3rgTMAU9bdH8/keQkfH90yJyeMDgBgW9b1ffwtSb6nu18+OoTxuntnd/9Rku9N8uHRPQOcNDpgCtb1vextmbyXvWh0CMC6MCQAMDXd/YlM7tF64eiWOThxdAAA27KOX779Q5K7dPdnRoewWLr7g0luk8kDatfJKgwJ6/isi1cmuXN3nzc6BGCdGBIAmKqND6IPG90xB8ePDgBgW04cHTBnZyT5ke6+eHQIi2nj4bSnJPnP0S1zdOON56Uss3UbRc9Mcv/u/sroEIB1Y0gAYOq6+4VJXjC6Y8auWFVXGx0BwJYdNzpgjv4rk2cifHV0CItt42qV+yZZl8Fp7yz/Gf3rNCR0Ju9l6/LzCbBQDAkAzMpjklw0OmLGrjc6AIA9V1WHJTlkdMccPaS7LxgdwXLo7vcnefzojjla2i/iq+pKSa47umOOHrJx5QwAAxgSAJiJ7u4kTx/dMWNHjQ4AYEuOGh0wRy/q7n8ZHcHS+cOszy2OlnZISHKd0QFz9JLuft3oCIB1ZkgAYJb+MMkq30bBFQkAy+mo0QFzsiPJr42OYPl099eTPHF0x5zcaHTANtTogDnZkeRXR0cArDtDAgAz093nJXnx6I4ZusboAAC2ZF1uBfKq7l6Xs8qZvhcl+fToiDk4dnTANhwxOmBOXu29DGA8QwIAs7bKQ8JVRwcAsCXrchbvn44OYHl19yVJnje6Yw6uufGsgWXkvQyAuTEkADBrr0nyldERM3LY6AAAtmQdhuCLkrifONv1itEBc3LU6IAtWochwXsZwIIwJAAwU919cZJ/Hd0xI+vwRRTAKlqHIfj13f210REsvbcm+fzoiDlY1lsELWv3nnh9d6/yM9cAloYhAYB5eOvogBkxJAAsp3V4/37z6ACWX3dfmuSdozvmYFm/kD98dMAceC8DWBCGBADm4QOjA2bkiqMDANiSdRgS3j06gJVx1uiAObjW6IAtOmh0wBx4LwNYEIYEAObhnNEBM7L/6AAAtmRZH6y6J94/OoCV8b7RAXNw6OiALTpwdMAceC8DWBCGBADm4dzRATNiSABYTqv+/v21JJ8ZHcHK+OTogDkwJCwm72UAC8SQAMA8XDg6YEZW/YsogFW16u/fn+zunaMjWBnrMCQcMjpgi64wOmDGvJcBLBBDAgDz8OXRATOy6l9EAayqVX///uLoAFbKZ0cHzMEBowO2aNWvSPBeBrBADAkAzFx3Xzy6YUb2HR0AwJas+pDwldEBrJRVPY77Vsv6nrDqQ4L3MoAFYkgAAADWzaoPwV8dHcBKWYcvc/cbHbBFy3olxe7yXgawQFb9ABqYkao6LMn1khy18bpWksOSXHXjdViSK2Vyds+3vrzvLKYzuvvk0REAACyW7r60qkZnzNpeowMAYNH5Qg+4TFV1pSQ3TXLCxuvEJDfMZCQAAAAAAFacIQH4NlV1aJI7JDl543VC3AYNAAAAANaWIQFIVR2T5D4br1vHcAAAAAAAbDAkwJqqqiOSnJbkAUluMjgHAAAAAFhQhgRYI1W1T5J7JnlYklOS7DO2CAAAAABYdIYEWANVdWCShyZ5bJLrDs4BAAAAAJaIIQFWWFUdnOTnkvxykmsMzgEAAAAAlpAhAVbQxi2MfjrJb8aAAAAAAABsgyEBVkxV3SvJU5LccHQLAAAAALD8DAmwIqrqekn+MJOHKQMAAAAATIUhAZZcVe2f5NFJfj3JFQbnAAAAAAArxpAAS6yqTkjy10luMroFAAAAAFhNhgRYQhsPU35ckicm2W9sDQAAAACwygwJsGSq6sgkL0xy0ugWAAAAAGD17T06ANh9VXVKkvfEiAAAAAAAzIkrEmAJVNVeSZ6U5NeS7DU4BwAAAABYI4YEWHBVdVCS5ye5z+gWAAAAAGD9GBJggVVVJfnHJDcf3QIAAAAArCdDAiyoqjouyeuSHDm6BQAAAABYXx62DAuoqk5M8sYYEQAAAACAwQwJsGCq6jZJ3pDk8NEtAAAAAABubQQLpKpuluQ1SQ4Z3QIAAAAAkLgiARZGVd0wyT/HiAAAAAAALBBDAiyAqrpOktcnudroFgAAAACAb2VIgMGq6kpJXpmkRrcAAAAAAHwnQwIMVFX7JHlBkpuMbgEAAAAA2BUPW4axnpzknqMjAJi6N48OAAAAgGkxJMAgVXVqkseM7gBg+rr79qMbAAAAYFrc2ggGqKqjk/zl6A4AAAAAgMtjSIA5q6r9krwwySGjWwAAAAAALo8hAebvN5LcYnQEAAAAAMDuMCTAHFXVrZP86ugOAAAAAIDdZUiAOamqA5I8L8k+o1sAAAAAAHaXIQHm5/FJjhsdAQAAAACwJwwJMAdVdXyS/zW6AwAAAABgTxkSYD7+KMn+oyMAAAAAAPaUIQFmrKruneTOozsAAAAAALbCkAAzVFX7JnnK6A4AAAAAgK0yJMBsPTzJDUZHAAAAAABslSEBZqSqDkjy+NEdAAAAAADbYUiA2Xl4khodAQAAAACwHYYEmIGNqxEeN7oDAAAAAGC7DAkwGz8WVyMAAAAAACvAkACz8UujAwAAAAAApsGQAFNWVd+X5ITRHQAAAAAA02BIgOl7xOgAAAAAAIBpMSTAFFXVVZPce3QHAAAAAMC0GBJguh6cZP/REQAAAAAA02JIgOn6idEBAAAAAADTZEiAKamqo5PcfHQHAAAAAMA0GRJgeu4/OgAAAAAAYNoMCTA99xsdAAAAAAAwbYYEmIKqukaSW4zuAAAAAACYtn1HB8CKOCXJXqMjFsQXk7wjyVuTfDDJOUk+keSiJF/u7ovHpQEAAAAAe8qQANNxyuiAwT6f5IVJXpTk9O6+dGwOAAAAADAthgTYpqraK8ldR3cM8t9Jfj/Js7v7wtExAAAAAMD0GRJg+05IctjoiDm7NMkzk/xGd39xdAwAAAAAMDuGBNi+7xsdMGfnJXlAd79xdAgAAAAAMHuGBNi+O44OmKOzk5zS3T06BAAAAACYD0MCbN9JowPm5Owkd+nu80eHAAAAAADzs/foAFhmVXW9JNcY3TEHH0/y/UYEAAAAAFg/hgTYnluNDpiDryQ5tbs/PToEAAAAAJg/QwJsz81GB8zB47r7PaMjAAAAAIAxDAmwPSeMDpixNyZ55ugIAAAAAGAcQwJsz01GB8zQziSP7O6do0MAAAAAgHEMCbBFVXWlJEeM7pihF3T3WaMjAAAAAICxDAmwdTcYHTBjvzc6AAAAAAAYz5AAW3fs6IAZeourEQAAAACAxJAA23HU6IAZev7oAAAAAABgMRgSYOtW9fkIO5O8YnQEAAAAALAYDAmwdas6JLy/uz85OgIAAAAAWAyGBNi6w0cHzMg7RgcAAAAAAIvDkABbd+jogBl51+gAAAAAAGBxGBJg61Z1SPjI6AAAAAAAYHEYEmDrrjg6YEbOHR0AAAAAACwOQwJs3QGjA2bk/NEBAAAztnN0wIztNTqA1VFV6/C9waWjAwBg0a3DAQHMyn6jA2bkK6MDWD1V5QsNABbJ10cHzNiBowNYKevw83Tx6AAAWHSGBOA7OYhmFq4wOmBGnL0GsJy+Njpgxlb19y5jrMPPk89AAHA5DAmwdZeMDpiRVb1lE2MdNDpgRlb9iyiAVbXq79+HjQ5gpRw6OmAOXJUNAJfDkABbt6ofQFf1IdKMtapfaKzq+wDAqlv19+9rVtU+oyNYGUeMDpgDVyQAwOUwJMDWreoH0FX9wpexrjs6YEYuHB0AwJas6nHcN+yT9fjyl/k4cnTAHBgSAOByGBJg61b1A+jRowNYSdcbHTAjnx8dAMCWfGF0wBzcdHQAK+MmowPmwK2NAOByGBJg61b1YPP6owNYSd87OmBGLhgdAMCWfHZ0wBzcfHQAK+OE0QFz8KXRAQCw6AwJsHWfGx0wI7ccHcBKWtWfq/NGBwCwJat6HPetTh4dwPKrqn2TnDS6Yw4+NToAABadIQG2blU/gN5hdACrpaquntU9k+2TowMA2JJ1uCLh9lV15dERLL3bJlmHn6MeHQAAi86QAFu3qh9Aj66qG4yOYKX8YFb3940hAWA5repx3LfaL8mpoyNYevcdHTAnhgQAuByr+sUOzMMqfwB90OgAVsoDRwfM0DmjAwDYknW5jcnDRwewvKrqgCQ/PrpjTpwcAgCXw5AAW/fp0QEz9BMb90OFbamq45LcZXTHDP3n6AAAtuSc0QFzctuqus3oCJbWg5McNjpiDr6e1f5sBwBTYUiArTt3dMAMHRVXJTAdjx4dMGMfHh0AwJacMzpgjp48OoDlU1X7J/n10R1zcl537xgdAQCLzpAAW3fO6IAZe8LG5cywJRtXI5w2umOGPtHdF42OAGBLPjY6YI7uVFUPHh3B0nlckuuOjpiTdXo/AIAtMyTA1q36AecxWZ+zkJiNpyZZ5VtkvXd0AABb091fTHLB6I45emZVrcuXwmxTVZ2Y9foccPboAABYBoYE2LpPJrlkdMSMPc59ddmKqjotyT1Hd8yYD50Ay+3fRwfM0SFJXllVh4wOYbFV1TWSvCzJfqNb5sjJIQCwGwwJsEUb99H8yOiOGds3ycur6sjRISyPjVsaPW10xxy8Z3QAANuybl8efk+SV1XVVUaHsJiq6qpJXpXJ89LWiZNDAGA3GBJge9bhA+g1krymqq45OoTFt/HlxD8mufLglHl42+gAALZlHY7jvtPtkrypqo4aHcJi2fiZeFOS7x2cMm87krxvdAQALANDAmzPWaMD5uRGSc70oZPLUlVXTvLqJMeObpmDT3b3f42OAGBb1nFISJIbJ3lvVT1kdAiLYeNh3GclOX5wyggf6e4vjY4AgGVgSIDtOWt0wBwdk+Rfq+puo0NYPFV1tSSvS3LS6JY5eevoAAC27X1JLh0dMciVkzy3qt5cVXccHcMYVXVSVZ2R5K8zeY7GOjprdAAALAtDAmzPWaMD5uyqSf6pqp5cVQeOjmExVNWtkrwrya1Gt8zRGaMDANiejbOQzxrdMdhtk5xRVe+qqodvnBjACquqQ6vqtKp6a5K3JFn3IekNowMAYFnsOzoAlll3/3dVfSzJ9Ua3zNHeSR6X5H5V9Uvd/arRQYxRVQcleUKSRyfZf3DOvPnQCbAazsj63RN+V26e5FlJ/riq3pnJ77n3ZHL7p3O7++KRcWzNxok/10ly0yQnJrlTJleP7jMwa9G8bnQAACwLQwJs3+lZryHhG45J8sqqekuS/5vktd29Y3ATc7AxIJyWyaB05OCcET7d3R8YHQHAVJyR5JdHRyyQvZPceuP1TVX12STnJ/lKkouzvreEWnT7JDkwyRWSXC2Tq4nZ3Dnd/eHREQCwLAwJsH1nZPKl6rq6bSYP2P1YVf1lkpd399ljk5i2qto7ye2T3D/Jj2W9P5g6cw1gdZyZZEfc8vXyXDXr/buf1eSYDgD2gCEBtu/00QEL4npJfjPJb1bVJzJ5GO07k3wwyblJPpXky0m+4sqFxVRV+yc5KMnBSa6d5KgkxyW5TSZnJh46LG6xvHp0AADT0d0XVNW7ktxydAswd4YEANgDhgTYpu4+t6r+M8mxo1sWyJEbrwfs6l+sqvnWwPTsSPLa0REATNXLY0iAdXNpkn8ZHQEAy8QlvDAdLxsdAMzFW7v7s6MjAJgqx3Gwfl7f3Z8bHQEAy8SQANPx0tEBwFy8eHQAANPV3f+e5D9GdwBz9TejAwBg2RgSYDrekeSToyOAmdqZ5CWjIwCYCe/vsD6+ElciAcAeMyTAFHT3zjhTGVbd27r7E6MjAJiJ52YyGAOr7xXdfdHoCABYNoYEmJ7njA4AZup5owMAmI3u/kiS00d3AHPhtkYAsAWGBJiS7n5fkreP7gBm4stJXjA6AoCZ+rPRAcDMnZfkNaMjAGAZGRJgup49OgCYiZd09xdHRwAwUy9Ncv7oCGCm/qS7LxkdAQDLyJAA0/XCJBeMjgCm7o9HBwAwW9391STPGN0BzMzXkjxrdAQALCtDAkxRd38pyR+O7gCm6q3d/bbREQDMxR8mcQUarKa/6+7zRkcAwLIyJMD0PT3JRaMjgKn5g9EBAMxHd38+rkKDVfX00QEAsMwMCTBl3f25JH8yugOYio9mcs9sANbHHyT50ugIYKrO6O53j44AgGVmSIDZeGpclQCr4P9296WjIwCYn+7+dJLfG90BTNVvjA4AgGVnSIAZ2Lj35lNGdwDb8tEkfz06AoAhfj9Jj44ApuKfuvuNoyMAYNkZEmB2nprkk6MjgC37ze7++ugIAOavu78UZzDDKtiZ5NdGRwDAKjAkwIx095eTPGF0B7Al70ny/NERAAz13CTuqQ7L7UXd/Z7REQCwCgwJMFvPS/K20RHAHvvl7t4xOgKAcTZ+D/xsEr8PYDl9Lcmvj44AgFVhSIAZ6u6dSR6exO1RYHm8vLtPHx0BwHjd/c4kzxrdAWzJk7v7Q6MjAGBVGBJgxrr77CRPG90B7JYvJXnk6AgAFsrjk3xqdASwRz6Y5LdHRwDAKjEkwHw8McnHRkcAl+s3uvvjoyMAWBzd/YUkDxvdAey2nUl+pru/OjoEAFaJIQHmoLu/lOQn4x67sMjeneTpoyMAWDzd/aokfz66A9gtz+nuN46OAIBVY0iAOenuM5M8dXQHsEtfTfIT3X3p6BAAFtajknx0dARwmT6W5DGjIwBgFRkSYL5+PcnZoyOA7/L47v7A6AgAFld3X5TkQUkuGd0C7NIlSX5k43ZkAMCUGRJgjjbu03n/JBeObgG+6fQkfzA6AoDF191vS/LY0R3ALv1Kd79zdAQArCpDAsxZd38oyU+N7gCSJOcleWB37xwdAsBy6O6nJ3nR6A7g27yiu582OgIAVpkhAQbo7hfHGdAw2o5MRoRPjQ4BYOk8NIlb4sFi+M8kDxkdAQCrzpAA4zw2yWtHR8Aa+43u/n+jIwBYPt19YZJ7Jfn06BZYc+cnuUd3XzA6BABWnSEBBunuS5M8IMn7R7fAGnpBd//W6AgAlld3n5Pk3kkuHpwC6+riJD/U3R8eHQIA68CQAAN19xeT3DPJf49ugTXytnhOCQBTsPHw5QcluXR0C6yZnUke3N1vHR0CAOvCkACDdffHk3x/ks+OboE18NEkp3a3s0cBmIrufmkmz0zYOboF1sgvdPdLRkcAwDoxJMAC6O73J/mBJF8c3QIr7JNJ7tLd540OAWC1dPfzkvzi6A5YAzuTPKK7/2h0CACsG0MCLIjufleSeyS5cHQLrKDPJLnrxv2sAWDquvuZSX4prkyAWdmR5GHd/azRIQCwjgwJsEC6+81J7hy3OYJp+nQmI8J/jA4BYLV199OT/HQmX3gC07MjyWnd/ZzRIQCwrgwJsGC6+1+T3ClJj26BFfBfSe7Y3WePDgFgPXT3XyT5sSRfG90CK+LCJD/Y3X81OgQA1pkhARZQd38gyW2TvG90CyyxjyS5fXd/cHQIAOulu/8+yV3jKlPYro8lOam7Xz06BADWnSEBFlR3n5vkdkleNboFltCbM/nQee7oEADWU3efmeTWSf59dAssqTOT3GrjJCsAYDBDAiyw7r4wyQ8leUo8uA92198kuUt3f2Z0CADrrbs/kuSkJP8wugWWzDMyecbV+aNDAIAJQwIsuO7e0d2PS3JqkgsG58AiuzTJr3X3g7v7q6NjACBJuvsL3X1qkscm+frgHFh05ye5V3c/srs9ZwQAFoghAZZEd78iyc2TvH10Cyyg85J8f3f/9ugQANiV7v79JCcncds92LV/SXLT7nZrVwBYQIYEWCLdfU6S2yf530kuGVsDC+P0JCd29xtGhwDAZenuNye5aZLnjW6BBfKlJL+U5G7d/anBLQDAJgwJsGS6++vd/aRM7rfrwWOss4uTPCaT5yH89+gYANgd3f3F7n5IkvtmckUdrLPXJLlxdz+9u3eMjgEANmdIgCXV3e/K5FZHT8jkC1VYJ+9K8r3d/VQfOgFYRt39siTHJ/nTJDsH58C8fSbJj3f3Kd3tdl8AsAQMCbDEuvtr3f1bSb4nk7N5YNVdlMnDKm/T3f82OgYAtqO7P9/dP5vkdkneM7oH5uCrSX4vybHd/fzRMQDA7jMkwAro7o909ylJTkny/tE9MCMvT3Kj7v797v766BgAmJbufmuSWyR5SJJPjq2BmXlhkuO7+1e6+wujYwCAPWNIgBXS3a9JcmKSn07iEmFWxfuS3L2779PdnxgdAwCz0N07uvt5SW6Q5PFJPjs4CablVUlu3d0/2t3njI4BALbGkAArprsv7e7nJDk2yc/GoMDy+lSShyU5sbtfOzoGAOahu7/c3b+T5Kgkv5rk/LFFsCU7krw4yc26+17d/Y7RQQDA9hgSYEV19yXd/aeZDAo/nsnDaWEZfCrJY5Ic091/7mHKAKyj7r6ou5+c5LpJfi7JfwxOgt1xUSYPEL9xd9+/u88a3AMATMm+owOA2eruS5I8P8nzq+oOSR6R5D5JDhwaBt/tY0mekuS53f3V0TEAsAi6+8tJ/qSqnpXkbplccXrPJPsNDYNv94Ekf5Lkr7r7wtExAMD0GRJgjXT3mUnOrKpDkzwoyU8kueXYKtbcpUleneTPkry6uy8d3AMAC6m7dyZ5bZLXVtXVkzw4k6tObzY0jHV2fia3L3p+d795dAwAMFt7jQ4Axqqq6yX54ST3S3KreF9gPt6f5O8yufqgR8fw3apq5+iGGTuju08eHQGwXVV1dCbHcffN5FjO7WuZpS8meWWSFyR57cbVzwzieA2AefKFIfBNVXV4krsnOSXJXZNcbWwRK2RHknckeVmSl3b3hwf3cDl8MAVYPlV1tUxuf3T3TI7lrjW2iBXxH0letfF6k/FgcTheA2Ce3NoI+Kbu/nSSv0ryV1W1V5KbJDk5yZ2S3CZJjatjyexI8t4kpyc5I8kbu/uCoUUAsOK6+/wkf7vxSlUdl8lx3B2TnJTk6HF1LImdSf4tyZs2Xm/s7o+PTQIAFoEhAdiljfvwnr3xekaSVNV1ktw6k3vx3jSToeE6oxpZGBcl+fdMhoOzNv58rwftAcBY3f3BJB9M8uzkm1cs3CrJzTM5lrtpkmOS7DOqkaG+mv85hjt74893O/kDANgVQwKw2zbORvp4khd94++q6uBMPoAem+SoJEdsvK6R5NCN18FJDkiyX3xQXWSXJvnad7wuSvK5JJ/deH0uyaeSnJPkY0nO2Tj7EQBYcBu/s1+98UqSVNV+mVypcMzGn9fO5FjuWkkOS3KVJIdkciy3f3yGXGSXZjIOfON1YZLPfMvrvzM5fvvoxuu/unvHmFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPj/24NDAgAAAABB/1+7wQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAFX+7du5anA/8AAAAAElFTkSuQmCC';

const MatrizLogo = ({ size = 'md' }) => {
  const heights = { sm: 'h-6', md: 'h-8', lg: 'h-10' };
  return (
    <img src={LOGO_AFOR} alt="AFOR" className={heights[size]} />
  );
};

// ============================================
// COMPONENTE PRINCIPAL - INTRANET
// ============================================

export default function MatrizIntranet() {
  // ============================================
  // ESTADO DE MODO OSCURO
  // ============================================
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('matriz_darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Aplicar clase dark al documento
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('matriz_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // ============================================
  // ESTADOS DE AUTENTICACIÓN
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [usuarios, setUsuarios] = useState(USUARIOS_INICIAL);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Helpers de rol
  const isAdmin = currentUser?.rol === 'admin';
  const canEdit = () => currentUser?.rol === 'admin';

  // Login handlers
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Ingresa email y contraseña');
      setTimeout(() => setLoginError(''), 3000);
      return;
    }
    // Buscar usuario por email
    const user = usuarios.find(u => u.email === loginEmail);
    if (user) {
      // Para admin, verificar contra adminStoredPassword
      const passwordValid = user.rol === 'admin'
        ? loginPassword === adminStoredPassword
        : loginPassword === user.password;

      if (passwordValid) {
        setCurrentUser(user);
        setLoginEmail('');
        setLoginPassword('');
        setLoginError('');
        // Actualizar presencia al iniciar sesión
        await updatePresencia(user.profesionalId, {
          pagina: 'home',
          navegador: navigator.userAgent.includes('Mobile') ? 'Móvil' : 'Desktop'
        });
        // Auto-backup diario al login de admin
        if (user.rol === 'admin') {
          const lastBackup = localStorage.getItem('afor_last_auto_backup');
          const today = new Date().toISOString().split('T')[0];
          if (lastBackup !== today) {
            try {
              const backup = await exportFullBackup();
              await saveAutoBackup(backup);
              localStorage.setItem('afor_last_auto_backup', today);
              console.log('Auto-backup diario completado');
            } catch (err) {
              console.warn('Auto-backup falló:', err);
            }
          }
        }
      } else {
        setLoginError('Email o contraseña incorrectos');
        setTimeout(() => setLoginError(''), 3000);
      }
    } else {
      setLoginError('Email o contraseña incorrectos');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  const handleLogout = async () => {
    // Marcar como offline antes de cerrar sesión
    if (currentUser) {
      await setOffline(currentUser.profesionalId);
    }
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // ============================================
  // ESTADOS DE LA APP (con persistencia Firestore)
  // ============================================
  const [currentPage, setCurrentPage] = useState('home');
  const [proyectos, setProyectos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [horasRegistradas, setHorasRegistradas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [presenciaUsuarios, setPresenciaUsuarios] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreReady, setFirestoreReady] = useState(false);
  const [firestoreError, setFirestoreError] = useState(null);
  // Estado persistente para Facturación (evita reset al re-render)
  const [selectedProyectoFacturacion, setSelectedProyectoFacturacion] = useState('');

  // Helper para filtrar proyectos según rol y asignación
  const currentColaborador = currentUser ? profesionales.find(c => c.id === currentUser.profesionalId) : null;
  const proyectosVisibles = proyectos.filter(p => {
    if (isAdmin) return true; // Admin ve todos
    if (!currentColaborador) return false;
    const asignados = currentColaborador.proyectosAsignados || [];
    return asignados.includes(p.id); // Solo ve proyectos asignados
  });
  const proyectosActivosVisibles = proyectosVisibles.filter(p => !p.estado || p.estado?.toLowerCase() === 'activo');

  // ============================================
  // FIRESTORE SUBSCRIPTIONS
  // ============================================
  useEffect(() => {
    // Flag para saber si ya recibimos datos del servidor (no solo caché)
    let proyectosInitialized = false;
    let colaboradoresInitialized = false;

    // Subscribe to Firestore collections
    const unsubProyectos = subscribeToProyectos((data, fromCache) => {
      if (data.length > 0) {
        // Hay datos en Firestore — usarlos siempre
        const proyectosMerged = data.map(p => {
          if (!p.entregables || p.entregables.length === 0) {
            const inicial = PROYECTOS_INICIALES.find(pi => pi.id === p.id);
            if (inicial && inicial.entregables) {
              return { ...p, entregables: inicial.entregables };
            }
          }
          return p;
        });
        setProyectos(proyectosMerged);
        proyectosInitialized = true;
        // Guardar los proyectos actualizados con entregables si faltaban
        proyectosMerged.forEach(p => {
          const original = data.find(d => d.id === p.id);
          if (original && (!original.entregables || original.entregables.length === 0) && p.entregables) {
            saveProyecto(p);
          }
        });
      } else if (!fromCache) {
        // Firestore confirmó vacío — respetar el estado vacío (el usuario los eliminó)
        setProyectos([]);
        proyectosInitialized = true;
      }
      // Si fromCache && data.length === 0: NO hacer nada, esperar respuesta del servidor
    }, (error) => {
      console.error('Error conectando con proyectos:', error);
      setFirestoreError('Error de conexión con la base de datos');
    });

    const unsubProfesionales = subscribeToColaboradores((data, fromCache) => {
      if (data.length > 0) {
        setProfesionales(data);
        colaboradoresInitialized = true;
      } else if (!fromCache) {
        // Firestore confirmó vacío — respetar el estado vacío (el usuario los eliminó)
        setProfesionales([]);
        colaboradoresInitialized = true;
      }
    }, (error) => {
      console.error('Error conectando con colaboradores:', error);
      setFirestoreError('Error de conexión con la base de datos');
    });

    const unsubHoras = subscribeToHoras((data) => {
      setHorasRegistradas(data);
    });

    const unsubTareas = subscribeToTareas((data) => {
      setTareas(data);
    });

    const unsubPresencia = subscribeToPresencia((data) => {
      setPresenciaUsuarios(data);
    });

    const unsubCotizaciones = subscribeToCotizaciones((data) => {
      // Parsear excelDataJson → excelData (Firestore no acepta nested arrays)
      const parsed = data.map(cot => ({
        ...cot,
        excelData: cot.excelDataJson ? JSON.parse(cot.excelDataJson) : (cot.excelData || null)
      }));
      setCotizaciones(parsed);
    });

    // Suscripción a duraciones por tipo de documento
    const unsubDuraciones = subscribeToDuraciones((data) => {
      if (data.duracionesPorTipo) setDuracionesPorTipo(data.duracionesPorTipo);
      if (data.duracionRevision) setDuracionRevision(data.duracionRevision);
    });

    // Marcar como listo después de un momento
    setTimeout(() => {
      setIsLoading(false);
      setFirestoreReady(true);
    }, 1500);

    // Cleanup
    return () => {
      unsubProyectos();
      unsubProfesionales();
      unsubHoras();
      unsubTareas();
      unsubPresencia();
      unsubCotizaciones();
      unsubDuraciones();
    };
  }, []);

  // ============================================
  // PRESENCIA - Heartbeat y tracking de página
  // ============================================
  useEffect(() => {
    if (!currentUser) return;

    // Actualizar presencia cuando cambia la página
    const paginaLabel = {
      'home': 'Inicio',
      'proyectos': 'Proyectos',
      'proyecto-detail': 'Detalle Proyecto',
      'horas': 'Carga HsH',
      'tareas': 'Tareas',
      'facturacion': 'Adm. Proyectos',
      'config': 'Configuración'
    };

    updatePresencia(currentUser.profesionalId, {
      pagina: paginaLabel[currentPage] || currentPage,
      navegador: navigator.userAgent.includes('Mobile') ? 'Móvil' : 'Desktop'
    });

    // Heartbeat cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      updatePresencia(currentUser.profesionalId, {
        pagina: paginaLabel[currentPage] || currentPage,
        navegador: navigator.userAgent.includes('Mobile') ? 'Móvil' : 'Desktop'
      });
    }, 30000);

    // Detectar cuando el usuario cierra la pestaña/navegador
    const handleBeforeUnload = () => {
      setOffline(currentUser.profesionalId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, currentPage]);

  // Helper para determinar si un usuario está "online" (activo en los últimos 2 minutos)
  const isUsuarioOnline = (profesionalId) => {
    const presencia = presenciaUsuarios.find(p => p.profesionalId === profesionalId);
    if (!presencia || !presencia.online) return false;
    const ultimaActividad = new Date(presencia.ultimaActividad);
    const ahora = new Date();
    const diffMinutos = (ahora - ultimaActividad) / (1000 * 60);
    return diffMinutos < 2; // Considera online si la última actividad fue hace menos de 2 minutos
  };

  // Obtener usuarios online
  const usuariosOnline = profesionales.filter(p => isUsuarioOnline(p.id));

  // Estados para contraseña admin
  const [showPassword, setShowPassword] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState(''); // Para verificar antes de cambiar
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminStoredPassword, setAdminStoredPassword] = useState('admin123'); // Contraseña del admin
  
  // Estados para formularios
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    id: '',
    nombre: '',
    cliente: '',
    jefeProyecto: '',
    tarifaVenta: 1.2,
    entregables: [] // Array de { id, codigo, nombre, secuencia, valorRevA, valorRevB, valorRev0 }
  });
  const [excelFileName, setExcelFileName] = useState('');
  const [excelError, setExcelError] = useState('');
  const [mesHoras, setMesHoras] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Función para parsear Excel de entregables
  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Cargar xlsx dinámicamente si no está cargado
          if (!window.XLSX) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = () => processExcel(e.target.result, resolve, reject);
            script.onerror = () => reject('Error cargando librería Excel');
            document.head.appendChild(script);
          } else {
            processExcel(e.target.result, resolve, reject);
          }
        } catch (error) {
          reject('Error procesando archivo: ' + error.message);
        }
      };
      reader.onerror = () => reject('Error leyendo archivo');
      reader.readAsArrayBuffer(file);
    });
  };

  const processExcel = (data, resolve, reject) => {
    try {
      const workbook = window.XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = window.XLSX.utils.sheet_to_json(worksheet);

      // Validar columnas requeridas
      if (jsonData.length === 0) {
        reject('El archivo está vacío');
        return;
      }

      const firstRow = jsonData[0];
      const requiredCols = ['Código', 'Descripción', 'Secuencia'];
      const missingCols = requiredCols.filter(col => !(col in firstRow) && !(col.toLowerCase() in firstRow));

      if (missingCols.length > 0) {
        reject(`Faltan columnas: ${missingCols.join(', ')}`);
        return;
      }

      // Parsear datos
      const entregables = jsonData.map((row, index) => ({
        id: index + 1,
        codigo: row['Código'] || row['codigo'] || '',
        nombre: row['Descripción'] || row['descripción'] || row['Nombre'] || row['nombre'] || '',
        secuencia: parseInt(row['Secuencia'] || row['secuencia']) || 1,
        valorRevA: parseFloat(row['REV_A (UF)'] || row['REV_A'] || row['revA'] || 0) || 0,
        valorRevB: parseFloat(row['REV_B (UF)'] || row['REV_B'] || row['revB'] || 0) || 0,
        valorRev0: parseFloat(row['REV_0 (UF)'] || row['REV_0'] || row['rev0'] || 0) || 0,
      }));

      resolve(entregables);
    } catch (error) {
      reject('Error procesando Excel: ' + error.message);
    }
  };

  // Manejar carga de archivo Excel
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFileName(file.name);
    setExcelError('');

    try {
      const entregables = await parseExcelFile(file);
      setNewProject(prev => ({ ...prev, entregables }));
    } catch (error) {
      setExcelError(error);
      setNewProject(prev => ({ ...prev, entregables: [] }));
    }
  };
  
  // Estados para eliminar proyectos
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // Estados para editar proyectos
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editProjectData, setEditProjectData] = useState({ id: '', nombre: '', cliente: '', estado: '' });
  
  // Estados para configuración
  const [configTab, setConfigTab] = useState('profesionales');
  const [showNewProfesional, setShowNewProfesional] = useState(false);
  const [newProfesional, setNewProfesional] = useState({ nombre: '', cargo: '', categoria: 'Proyectista', tarifaInterna: 0.5, email: '', password: '' });
  const [editProfesionalOpen, setEditProfesionalOpen] = useState(false);
  const [profesionalToEdit, setProfesionalToEdit] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }
  
  // Función para mostrar notificación
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Estados para Dashboard del proyecto
  const [dashboardTab, setDashboardTab] = useState('resumen');
  const [dashboardStartDate, setDashboardStartDate] = useState('2026-01-05');

  // Estado para tab de facturación (debe estar aquí para persistir entre re-renders del heartbeat)
  const [facturacionTab, setFacturacionTab] = useState('entregables'); // 'entregables' | 'edp' | 'cot'

  // Estados COT a nivel de App para que persistan al re-montar (heartbeat cada 30s)
  const [cotLogo, setCotLogo] = useState(null);
  const [cotLogoPreview, setCotLogoPreview] = useState(null);
  const [cotExcelData, setCotExcelData] = useState(null);
  const [cotExcelFileName, setCotExcelFileName] = useState('');
  const [cotShowPreview, setCotShowPreview] = useState(false);
  const [cotGenerando, setCotGenerando] = useState(false);
  const [cotFirma, setCotFirma] = useState(null);
  // Refs para campos de texto COT: persisten entre remounts sin causar re-render de App al escribir
  const cotClienteRef = React.useRef('');
  const cotProyectoNombreRef = React.useRef('');
  // Lista de cotizaciones guardadas en Firestore
  const [cotizaciones, setCotizaciones] = useState([]);
  // COT seleccionada para ver preview (desde listado guardado)
  const [cotViewingId, setCotViewingId] = useState(null);
  // Modo: 'crear' = formulario nueva COT, 'lista' = listado guardadas, 'editar' = editando COT existente
  const [cotMode, setCotMode] = useState('lista');

  // Duraciones editables por tipo de documento (días hábiles para REV_A)
  const [duracionesPorTipo, setDuracionesPorTipo] = useState({ ...DURACION_POR_TIPO_DEFAULT });
  // Duración fija para REV_B y REV_0
  const [duracionRevision, setDuracionRevision] = useState(DURACION_REVISION_DEFAULT);

  const [statusData, setStatusData] = useState(() => {
    // Datos iniciales de ejemplo
    const status = {};
    // Inicializar para ENTREGABLES_PROYECTO (compatibilidad)
    ENTREGABLES_PROYECTO.forEach(d => {
      status[d.id] = {
        sentIniciado: d.id <= 4,
        sentRevA: d.id <= 3,
        sentRevADate: d.id <= 3 ? '2026-01-20' : null,
        comentariosARecibidos: d.id <= 2,
        comentariosARecibidosDate: d.id <= 2 ? '2026-01-22' : null,
        sentRevB: d.id <= 2,
        sentRevBDate: d.id <= 2 ? '2026-01-25' : null,
        comentariosBRecibidos: d.id === 1,
        comentariosBRecibidosDate: d.id === 1 ? '2026-01-26' : null,
        sentRev0: false,
        sentRev0Date: null,
      };
    });
    // Inicializar para entregables de cada proyecto
    PROYECTOS_INICIALES.forEach(proyecto => {
      if (proyecto.entregables) {
        proyecto.entregables.forEach((e, idx) => {
          const key = `${proyecto.id}_${e.id}`;
          status[key] = {
            sentIniciado: idx < 5,
            sentRevA: idx < 3,
            sentRevADate: idx < 3 ? '2026-01-20' : null,
            comentariosARecibidos: idx < 2,
            comentariosARecibidosDate: idx < 2 ? '2026-01-22' : null,
            sentRevB: idx < 2,
            sentRevBDate: idx < 2 ? '2026-01-25' : null,
            comentariosBRecibidos: idx === 0,
            comentariosBRecibidosDate: idx === 0 ? '2026-01-26' : null,
            sentRev0: false,
            sentRev0Date: null,
          };
        });
      }
    });
    return status;
  });
  const [editDateOpen, setEditDateOpen] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  // ============================================
  // FIRESTORE SUBSCRIPTION para statusData
  // ============================================
  useEffect(() => {
    const unsubStatusData = subscribeToStatusData((data) => {
      if (data && Object.keys(data).length > 0) {
        setStatusData(data);
      }
    });

    return () => unsubStatusData();
  }, []);

  // ============================================
  // PERSISTENCIA - Guardar datos en Firestore (debounced)
  // ============================================
  // Guardar statusData cuando cambie
  useEffect(() => {
    if (firestoreReady && Object.keys(statusData).length > 0) {
      const timer = setTimeout(() => {
        saveStatusData(statusData);
      }, 1000); // Debounce de 1 segundo
      return () => clearTimeout(timer);
    }
  }, [statusData, firestoreReady]);

  // Función para manejar checkboxes del dashboard
  const handleCheck = (id, field, value) => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    setStatusData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        ...((field.startsWith('sent') || field.startsWith('comentarios')) 
          ? { [`${field}Date`]: value ? localDate : null }
          : {})
      }
    }));
  };
  
  // Actualizar fecha de inicio cuando se selecciona un proyecto
  React.useEffect(() => {
    if (selectedProject) {
      const proyecto = proyectos.find(p => p.id === selectedProject);
      if (proyecto) {
        setDashboardStartDate(proyecto.inicio || '2026-01-05');
        setDashboardTab('resumen');
      }
    }
  }, [selectedProject]);

  // Función para eliminar proyecto
  const handleDeleteProject = async () => {
    if (projectToDelete) {
      try {
        // Eliminar de Firestore
        const success = await deleteProyectoFS(projectToDelete.id);
        if (!success) {
          showNotification('error', 'Error al eliminar el proyecto de la base de datos');
          return;
        }

        // Actualizar estado local inmediatamente (no depender solo de la suscripción)
        setProyectos(prev => prev.filter(p => p.id !== projectToDelete.id));

        // También eliminar horas registradas de ese proyecto de Firestore
        const horasDelProyecto = horasRegistradas.filter(h => h.proyecto === projectToDelete.id);
        for (const hora of horasDelProyecto) {
          if (hora._docId) {
            await deleteHoraFS(hora._docId);
          }
        }
        // Actualizar horas localmente
        setHorasRegistradas(prev => prev.filter(h => h.proyecto !== projectToDelete.id));

        // Si el proyecto eliminado era el seleccionado, deseleccionar
        if (selectedProject === projectToDelete.id) {
          setSelectedProject(null);
        }

        setDeleteConfirmOpen(false);
        setProjectToDelete(null);
        showNotification('success', 'Proyecto eliminado');
      } catch (error) {
        console.error('Error eliminando proyecto:', error);
        showNotification('error', 'Error al eliminar el proyecto');
      }
    }
  };

  // Función para abrir modal de edición
  const openEditProject = (proyecto) => {
    setProjectToEdit(proyecto);
    setEditProjectData({
      id: proyecto.id,
      nombre: proyecto.nombre,
      cliente: proyecto.cliente,
      estado: proyecto.estado
    });
    setEditProjectOpen(true);
  };

  // Función para guardar cambios del proyecto
  const handleSaveProject = async () => {
    if (projectToEdit && editProjectData.nombre.trim() && editProjectData.id.trim()) {
      const oldId = projectToEdit.id;
      const newId = editProjectData.id.trim().toUpperCase();

      // Si cambió el ID, eliminar el documento viejo
      if (oldId !== newId) {
        await deleteProyectoFS(oldId);
      }

      // Buscar el proyecto actual para preservar sus datos
      const proyectoActual = proyectos.find(p => p.id === oldId);
      const proyectoActualizado = {
        ...proyectoActual,
        id: newId,
        nombre: editProjectData.nombre.trim(),
        cliente: editProjectData.cliente.trim(),
        estado: editProjectData.estado
      };

      // Guardar en Firestore
      await saveProyecto(proyectoActualizado);

      // Si cambió el id, actualizar referencias en horas registradas
      if (oldId !== newId) {
        const horasActualizadas = horasRegistradas.filter(h => h.proyecto === oldId);
        for (const hora of horasActualizadas) {
          const horaActualizada = { ...hora, proyecto: newId };
          await saveHora(horaActualizada);
        }

        // Si era el proyecto seleccionado, actualizar selección
        if (selectedProject === oldId) {
          setSelectedProject(newId);
        }
      }

      setEditProjectOpen(false);
      setProjectToEdit(null);
      showNotification('success', 'Proyecto actualizado');
    }
  };

  // Categorías de profesionales
  const categoriasProfesional = ['Líder de Proyecto', 'Ingeniero Senior', 'Proyectista', 'Administrativo'];
  
  // Función para obtener iniciales
  const getIniciales = (nombre) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  // Funciones para gestión de profesionales
  const handleAddProfesional = async () => {
    // Validar campos obligatorios
    if (!newProfesional.nombre.trim() || !newProfesional.cargo.trim()) {
      showNotification('error', 'Nombre y cargo son obligatorios');
      return;
    }
    if (!newProfesional.email.trim() || !newProfesional.password.trim()) {
      showNotification('error', 'Email y contraseña son obligatorios');
      return;
    }

    // Verificar que el email no exista
    const emailExiste = usuarios.find(u => u.email === newProfesional.email.trim());
    if (emailExiste) {
      showNotification('error', 'Este email ya está registrado');
      return;
    }

    const newId = Math.max(...profesionales.map(c => c.id), 0) + 1;
    const nuevoProfesional = {
      id: newId,
      nombre: newProfesional.nombre.trim(),
      cargo: newProfesional.cargo.trim(),
      categoria: newProfesional.categoria,
      tarifaInterna: parseFloat(newProfesional.tarifaInterna) || 0.5,
      iniciales: getIniciales(newProfesional.nombre.trim())
    };

    // Crear usuario para login
    const nuevoUsuario = {
      id: `user${newId}`,
      nombre: newProfesional.nombre.trim(),
      email: newProfesional.email.trim(),
      password: newProfesional.password.trim(),
      rol: 'profesional',
      profesionalId: newId
    };

    // Guardar profesional en Firestore
    await saveColaborador(nuevoProfesional);

    // Agregar usuario al estado
    setUsuarios(prev => [...prev, nuevoUsuario]);

    setNewProfesional({ nombre: '', cargo: '', categoria: 'Proyectista', tarifaInterna: 0.5, email: '', password: '' });
    setShowNewProfesional(false);
    showNotification('success', 'Profesional y usuario creados');
  };

  const handleDeleteProfesional = async (id) => {
    const tieneHoras = horasRegistradas.some(h => h.profesionalId === id);
    if (tieneHoras) {
      showNotification('error', 'No se puede eliminar: este profesional tiene horas registradas.');
      return;
    }
    try {
      // Eliminar de Firestore
      const success = await deleteColaboradorFS(id);
      if (!success) {
        showNotification('error', 'Error al eliminar el profesional');
        return;
      }
      // Actualizar estado local inmediatamente
      setColaboradores(prev => prev.filter(c => String(c.id) !== String(id)));
      // También eliminar el usuario asociado
      setUsuarios(prev => prev.filter(u => u.profesionalId !== id));
      showNotification('success', 'Profesional y usuario eliminados');
    } catch (error) {
      console.error('Error eliminando profesional:', error);
      showNotification('error', 'Error al eliminar el profesional');
    }
  };
  
  const handleSaveProfesional = async () => {
    if (profesionalToEdit) {
      const profesionalActualizado = {
        ...profesionalToEdit,
        nombre: profesionalToEdit.nombre,
        cargo: profesionalToEdit.cargo,
        categoria: profesionalToEdit.categoria,
        tarifaInterna: parseFloat(profesionalToEdit.tarifaInterna) || 0.5,
        iniciales: getIniciales(profesionalToEdit.nombre)
      };

      // Si se proporcionó una nueva contraseña, actualizarla
      if (profesionalToEdit.newPassword && profesionalToEdit.newPassword.trim() !== '') {
        profesionalActualizado.password = profesionalToEdit.newPassword;
      }
      // Limpiar el campo temporal newPassword antes de guardar
      delete profesionalActualizado.newPassword;

      // Guardar en Firestore
      await saveColaborador(profesionalActualizado);

      setEditProfesionalOpen(false);
      setProfesionalToEdit(null);
      showNotification('success', 'Profesional actualizado');
    }
  };

  // Navegación (filtrada según rol)
  const allNavItems = [
    { id: 'home', label: 'Home', icon: Home, adminOnly: false },
    { id: 'proyectos', label: 'Proyectos', icon: FolderKanban, adminOnly: false },
    { id: 'horas', label: 'Carga HsH', icon: Clock, adminOnly: false },
    { id: 'tareas', label: 'Tareas', icon: ClipboardList, adminOnly: false },
    { id: 'facturacion', label: 'Adm. Proyectos', icon: FileSpreadsheet, adminOnly: true },
    { id: 'config', label: 'Config', icon: Settings, adminOnly: true },
  ];
  const navItems = isAdmin ? allNavItems : allNavItems.filter(item => !item.adminOnly);

  // Calcular resumen de horas del mes
  const resumenHorasMes = () => {
    const now = new Date();
    const horasMes = horasRegistradas.filter(h => {
      const fecha = new Date(h.fecha);
      return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
    });
    
    const totalHoras = horasMes.reduce((sum, h) => sum + h.horas, 0);
    const costoInterno = horasMes.reduce((sum, h) => {
      const profesional = profesionales.find(c => c.id === h.profesionalId);
      return sum + (h.horas * (profesional?.tarifaInterna || 0));
    }, 0);
    
    return { totalHoras, costoInterno, registros: horasMes.length };
  };

  const resumen = resumenHorasMes();

  // ============================================
  // PÁGINA: HOME
  // ============================================
  const HomePage = () => (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl text-neutral-800 dark:text-neutral-100 font-light mb-1">Bienvenido, {currentUser?.nombre}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">{isAdmin ? 'Administrador • Acceso completo' : 'Profesional • Carga HsH'}</p>
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{proyectosActivosVisibles.length}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Proyectos</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{profesionales.length}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Profesionales</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{resumen.totalHoras}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Horas mes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Usuarios en Línea */}
      {usuariosOnline.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <Wifi className="w-4 h-4 text-green-500" />
            </div>
            <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">En Línea Ahora</h2>
            <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{usuariosOnline.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {usuariosOnline.map(user => {
              const presencia = presenciaUsuarios.find(p => p.profesionalId === user.id);
              const esYo = user.id === currentUser?.profesionalId;
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                    esYo
                      ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700'
                      : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
                  }`}
                  title={`${user.nombre} - ${presencia?.pagina || 'Navegando'}`}
                >
                  <div className="relative">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      esYo ? 'bg-orange-500' : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}>
                      <span className={`text-xs font-medium ${esYo ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
                        {user.nombre?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${esYo ? 'text-orange-700 dark:text-orange-300' : 'text-neutral-700 dark:text-neutral-200'}`}>
                      {user.nombre?.split(' ')[0]}
                      {esYo && <span className="text-[10px] ml-1 opacity-60">(tú)</span>}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{presencia?.pagina || 'Navegando'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas de Vencimiento */}
      {(() => {
        const today = new Date();
        const alertas = [];

        proyectosActivosVisibles.forEach(proyecto => {
          const entregables = proyecto.entregables || [];
          entregables.forEach(ent => {
            if (ent.frozen) return;
            const deadlines = calculateDeadlines(proyecto.inicio || dashboardStartDate, ent.weekStart || ent.secuencia, obtenerDuracionRevA(ent, duracionesPorTipo), duracionRevision, duracionRevision);
            const statusKey = `${proyecto.id}_${ent.id}`;
            const status = statusData[statusKey] || {};

            // Determinar qué revisión está pendiente
            let pendingRev = null;
            let deadline = null;

            if (!status.sentRev0) {
              if (!status.sentRevA) {
                pendingRev = 'REV_A';
                deadline = new Date(deadlines.revA);
              } else if (!status.sentRevB && status.comentariosARecibidos) {
                pendingRev = 'REV_B';
                deadline = new Date(deadlines.revB);
              } else if (status.comentariosBRecibidos) {
                pendingRev = 'REV_0';
                deadline = new Date(deadlines.rev0);
              }
            }

            if (pendingRev && deadline) {
              const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
              if (diffDays <= 7) {
                alertas.push({
                  proyecto: proyecto.id,
                  proyectoNombre: proyecto.nombre,
                  entregable: ent.nombre || ent.codigo,
                  codigo: ent.codigo,
                  revision: pendingRev,
                  deadline: deadline,
                  diffDays: diffDays,
                  atrasado: diffDays < 0
                });
              }
            }
          });
        });

        // Ordenar: primero atrasados, luego por días restantes
        alertas.sort((a, b) => a.diffDays - b.diffDays);

        if (alertas.length === 0) return null;

        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Alertas de Vencimiento</h2>
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{alertas.length}</span>
            </div>
            <Card className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {alertas.slice(0, 5).map((alerta, i) => (
                <div key={i} className={`p-3 flex items-center justify-between ${alerta.atrasado ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-mono text-xs">{alerta.proyecto}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${alerta.atrasado ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}`}>
                        {alerta.revision}
                      </span>
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-100 text-sm truncate">{alerta.entregable}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">{alerta.codigo}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className={`text-sm font-medium ${alerta.atrasado ? 'text-red-600' : alerta.diffDays <= 3 ? 'text-orange-600' : 'text-neutral-600 dark:text-neutral-300'}`}>
                      {alerta.atrasado ? `${Math.abs(alerta.diffDays)}d atrasado` : alerta.diffDays === 0 ? 'Hoy' : `${alerta.diffDays}d restantes`}
                    </p>
                    <p className="text-neutral-400 text-xs">{alerta.deadline.toLocaleDateString('es-CL')}</p>
                  </div>
                </div>
              ))}
              {alertas.length > 5 && (
                <div className="p-2 text-center">
                  <span className="text-neutral-500 dark:text-neutral-400 text-xs">+{alertas.length - 5} alertas más</span>
                </div>
              )}
            </Card>
          </div>
        );
      })()}

      {/* Proyectos Activos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Proyectos Activos</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('proyectos')}>
            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {proyectosActivosVisibles.length === 0 ? (
          <Card className="p-6 text-center">
            <FolderKanban className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {!isAdmin ? 'No tienes proyectos asignados. Contacta al administrador.' : 'No hay proyectos activos.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {proyectosActivosVisibles.map(proyecto => (
              <Card
                key={proyecto.id}
                className="p-3 sm:p-4"
                onClick={() => {
                  setSelectedProject(proyecto.id);
                  setCurrentPage('proyecto-detail');
                }}
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-mono text-xs sm:text-sm">{proyecto.id}</span>
                      <Badge variant="success">Activo</Badge>
                    </div>
                    <h3 className="text-neutral-800 dark:text-neutral-100 font-medium mt-1 text-sm sm:text-base truncate">{proyecto.nombre}</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">{proyecto.cliente}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500 shrink-0 ml-2" />
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(proyecto.inicio).toLocaleDateString('es-CL')}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {proyecto.avance.toFixed(1)}%
                  </span>
                </div>

                {/* Barra de avance */}
                <div className="mt-2 sm:mt-3 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${proyecto.avance}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mis Tareas Pendientes */}
      {(() => {
        const misTareasPendientes = tareas.filter(t =>
          t.asignadoA === currentUser?.profesionalId &&
          t.estado !== 'completada'
        ).sort((a, b) => {
          // Primero por prioridad (alta > media > baja)
          const prioridadOrder = { alta: 0, media: 1, baja: 2 };
          return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
        });

        if (misTareasPendientes.length === 0) return null;

        const getPrioridadColor = (prioridad) => {
          switch (prioridad) {
            case 'alta': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'media': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'baja': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-neutral-100 text-neutral-700';
          }
        };

        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-purple-500" />
                <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Mis Tareas Pendientes</h2>
                <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{misTareasPendientes.length}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('tareas')}>
                Ver todas <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <Card className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {misTareasPendientes.slice(0, 4).map(tarea => {
                const proyecto = proyectos.find(p => p.id === tarea.proyectoId);
                return (
                  <div
                    key={tarea._docId}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => setCurrentPage('tareas')}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                          {tarea.prioridad}
                        </span>
                        {proyecto && (
                          <span className="text-orange-500 font-mono text-xs">{proyecto.id}</span>
                        )}
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-100 text-sm truncate mt-1">{tarea.titulo}</p>
                      {tarea.entregableId && (
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs">{tarea.entregableId}</p>
                      )}
                    </div>
                    <div className="text-right ml-3">
                      {tarea.fechaLimite && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(tarea.fechaLimite).toLocaleDateString('es-CL')}
                        </p>
                      )}
                      {(tarea.comentarios?.length || 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1 justify-end">
                          <MessageSquare className="w-3 h-3" />
                          {tarea.comentarios.length}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {misTareasPendientes.length > 4 && (
                <div className="p-2 text-center">
                  <span className="text-neutral-500 dark:text-neutral-400 text-xs">+{misTareasPendientes.length - 4} tareas más</span>
                </div>
              )}
            </Card>
          </div>
        );
      })()}

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-neutral-700 dark:text-neutral-200 text-sm font-medium mb-3">Accesos Rápidos</h2>
        <div className={`grid gap-2 sm:gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'}`}>
          <Card
            className="p-3 sm:p-4 text-center"
            onClick={() => setCurrentPage('horas')}
          >
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-neutral-800 dark:text-neutral-100 text-xs sm:text-sm">Cargar Horas</p>
          </Card>

          {isAdmin && (
            <Card
              className="p-3 sm:p-4 text-center"
              onClick={() => setShowNewProject(true)}
            >
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-neutral-800 dark:text-neutral-100 text-xs sm:text-sm">Nuevo Proyecto</p>
            </Card>
          )}

          {isAdmin && (
            <Card
              className="p-3 sm:p-4 text-center"
              onClick={() => setCurrentPage('facturacion')}
            >
              <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-neutral-800 dark:text-neutral-100 text-xs sm:text-sm">Adm. Proyectos</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================
  // PÁGINA: PROYECTOS
  // ============================================
  const ProyectosPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl text-neutral-800 dark:text-neutral-100 font-light">Proyectos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Gestión de proyectos activos e históricos</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowNewProject(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {proyectosVisibles.length === 0 ? (
        <Card className="p-8 text-center">
          <FolderKanban className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {!isAdmin ? 'No tienes proyectos asignados. Contacta al administrador para que te asigne acceso.' : 'No hay proyectos creados.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {proyectosVisibles.map(proyecto => (
            <Card
              key={proyecto.id}
              className="p-4"
              onClick={() => {
                setSelectedProject(proyecto.id);
                setCurrentPage('proyecto-detail');
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-mono">{proyecto.id}</span>
                      <Badge variant={proyecto.estado === 'Activo' ? 'success' : 'default'}>
                        {proyecto.estado}
                      </Badge>
                    </div>
                    <h3 className="text-neutral-800 dark:text-neutral-100 font-medium">{proyecto.nombre}</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">{proyecto.cliente}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-neutral-800 dark:text-neutral-100 font-medium">{proyecto.avance.toFixed(1)}%</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">Avance</p>
                  </div>
                  <div className="w-24 sm:w-32 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${proyecto.avance}%` }}
                    />
                  </div>
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditProject(proyecto);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Editar proyecto"
                      >
                        <Pencil className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-blue-500" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(proyecto);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-red-500" />
                      </button>
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ============================================
  // PÁGINA: CARGA DE HORAS
  // ============================================
  const HorasPage = () => {
    const [profesional, setProfesional] = useState('');
    const [proyecto, setProyecto] = useState('');
    const [semana, setSemana] = useState('');
    const [entregable, setEntregable] = useState('');
    const [horas, setHoras] = useState('');
    const [revision, setRevision] = useState('REV_A');
    const [tipoCarga, setTipoCarga] = useState('PLA'); // PLA, DOC, INF, REU, VIS
    const [descripcionCarga, setDescripcionCarga] = useState(''); // Para REU y VIS

    const weeks = getWeeksOfMonth(mesHoras);

    // Entregables dinámicos del proyecto seleccionado
    const proyectoSeleccionado = proyectos.find(p => p.id === proyecto);
    const entregables = proyectoSeleccionado?.entregables || [];

    const esReunionOVisita = ['REU', 'VIS'].includes(tipoCarga);

    const registrarHoras = async () => {
      // Validación diferente para REU/VIS vs otros tipos
      if (esReunionOVisita) {
        if (!profesional || !proyecto || !semana || !descripcionCarga || !horas) {
          showNotification('error', 'Por favor completa todos los campos');
          return;
        }
      } else {
        if (!profesional || !proyecto || !semana || !entregable || !horas) {
          showNotification('error', 'Por favor completa todos los campos');
          return;
        }
      }

      // Verificar duplicados (mismo proyecto + entregable + revisión)
      if (!esReunionOVisita) {
        const duplicado = horasRegistradas.find(h =>
          h.proyectoId === proyecto &&
          h.entregable === entregable &&
          h.revision === revision
        );
        if (duplicado) {
          const fechaDup = new Date(duplicado.fecha).toLocaleDateString('es-CL');
          const confirmar = window.confirm(
            `⚠️ ALERTA DE DUPLICADO\n\n` +
            `Ya existe un registro para:\n` +
            `• Proyecto: ${proyecto}\n` +
            `• Entregable: ${entregable}\n` +
            `• Revisión: ${revision}\n` +
            `• Fecha anterior: ${fechaDup}\n\n` +
            `¿Deseas registrar de todas formas?`
          );
          if (!confirmar) return;
        }
      }

      // Crear fecha basada en el mes seleccionado (día 15 del mes para evitar problemas de timezone)
      const [yearSel, monthSel] = mesHoras.split('-').map(Number);
      const fechaRegistro = new Date(yearSel, monthSel - 1, 15);

      const nuevoRegistro = {
        id: Date.now(),
        profesionalId: parseInt(profesional),
        proyectoId: proyecto,
        semana: parseInt(semana),
        tipo: tipoCarga,
        entregable: esReunionOVisita ? descripcionCarga : entregable,
        revision: esReunionOVisita ? null : revision,
        horas: parseFloat(horas),
        fecha: fechaRegistro.toISOString(),
        mesRegistro: mesHoras, // Guardar también el mes explícitamente
      };

      // Guardar en Firestore
      await saveHora(nuevoRegistro);

      setHoras('');
      setEntregable('');
      setDescripcionCarga('');
      setSemana('');
      showNotification('success', 'Horas registradas correctamente');
    };
    
    const horasDelMes = horasRegistradas.filter(h => {
      const fecha = new Date(h.fecha);
      const [yearSel, monthSel] = mesHoras.split('-').map(Number);
      // Filtrar por el mes seleccionado
      return fecha.getMonth() === (monthSel - 1) && fecha.getFullYear() === yearSel;
    });
    
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl text-neutral-800 dark:text-neutral-100 font-medium">Carga HsH</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Registro semanal por proyecto</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const [y, m] = mesHoras.split('-').map(Number);
                const prev = new Date(y, m - 2, 1);
                setMesHoras(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 min-w-[100px] text-center">
              {new Date(mesHoras + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => {
                const [y, m] = mesHoras.split('-').map(Number);
                const next = new Date(y, m, 1);
                setMesHoras(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Formulario */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm p-3 sm:p-4 lg:col-span-1">
            <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium mb-3 sm:mb-4">Registrar Horas</h2>
            <div className="space-y-3 sm:space-y-4">
              <Select label="Profesional" value={profesional} onChange={e => setProfesional(e.target.value)}>
                <option value="">Seleccionar...</option>
                {profesionales.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </Select>
              
              <Select label="Proyecto" value={proyecto} onChange={e => { setProyecto(e.target.value); setEntregable(''); }}>
                <option value="">{proyectosActivosVisibles.length === 0 ? 'Sin proyectos asignados' : 'Seleccionar...'}</option>
                {proyectosActivosVisibles.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                ))}
              </Select>
              
              <div className="grid grid-cols-2 gap-3">
                <Select label="Tipo" value={tipoCarga} onChange={e => setTipoCarga(e.target.value)}>
                  <option value="DOC">DOC</option>
                  <option value="PLA">PLA</option>
                  <option value="INF">INF</option>
                  <option value="REU">REU</option>
                  <option value="VIS">VIS</option>
                </Select>

                <Select label="Semana" value={semana} onChange={e => setSemana(e.target.value)}>
                  <option value="">Sem...</option>
                  {weeks.map(w => (
                    <option key={w.num} value={w.num}>S{w.num}</option>
                  ))}
                </Select>
              </div>

              {/* Revisión solo para DOC, PLA, INF */}
              {!esReunionOVisita && (
                <Select label="Revisión" value={revision} onChange={e => setRevision(e.target.value)}>
                  <option value="REV_A">REV_A</option>
                  <option value="REV_B">REV_B</option>
                  <option value="REV_0">REV_0</option>
                </Select>
              )}

              {/* Entregable solo para DOC, PLA, INF */}
              {!esReunionOVisita ? (
                <Select label="Entregable" value={entregable} onChange={e => setEntregable(e.target.value)}>
                  <option value="">
                    {!proyecto ? 'Primero selecciona un proyecto...' :
                     entregables.length === 0 ? 'Este proyecto no tiene entregables' :
                     'Seleccionar...'}
                  </option>
                  {entregables.map(ent => (
                    <option key={ent.id || ent.codigo} value={ent.nombre || ent}>
                      {ent.codigo ? `${ent.codigo} - ${ent.nombre}` : ent}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  label={tipoCarga === 'REU' ? 'Descripción Reunión' : 'Descripción Visita'}
                  type="text"
                  value={descripcionCarga}
                  onChange={e => setDescripcionCarga(e.target.value)}
                  placeholder={tipoCarga === 'REU' ? 'Ej: Reunión coordinación cliente' : 'Ej: Visita terreno fiscalización'}
                />
              )}
              
              <Input 
                label="Horas" 
                type="number" 
                step="0.5" 
                min="0" 
                value={horas}
                onChange={e => setHoras(e.target.value)}
                placeholder="Ej: 8"
              />
              
              <button 
                type="button"
                onClick={registrarHoras}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded font-medium text-sm transition-colors cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Plus className="w-4 h-4" />
                Registrar Horas
              </button>
            </div>
          </div>
          
          {/* Resumen del mes */}
          <Card className="p-3 sm:p-4 lg:col-span-2">
            <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium mb-3 sm:mb-4">
              Horas - {new Date(mesHoras + '-01').toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}
            </h2>
            
            {horasDelMes.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-neutral-500 dark:text-neutral-400">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                <p className="text-sm">No hay horas registradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-xs sm:text-sm" style={{ minWidth: '500px' }}>
                  <thead>
                    <tr className="text-neutral-500 dark:text-neutral-400 text-xs uppercase border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left p-2">Col</th>
                      <th className="text-left p-2">Proy</th>
                      <th className="text-left p-2">Entregable</th>
                      <th className="text-center p-2">Rev</th>
                      <th className="text-center p-2">Sem</th>
                      <th className="text-right p-2">Hrs</th>
                      <th className="text-right p-2">UF</th>
                      {isAdmin && <th className="text-center p-2 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {horasDelMes.map(h => {
                      // Para registros antiguos con 'admin', buscar a Sebastián (SV)
                      // Usar == para manejar "3" (string) y 3 (número)
                      const col = h.profesionalId === 'admin'
                        ? profesionales.find(c => c.iniciales === 'SV')
                        : profesionales.find(c => c.id == h.profesionalId);
                      return (
                        <tr key={h.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800/50">
                          <td className="p-2 text-neutral-800 dark:text-neutral-100">{col?.iniciales}</td>
                          <td className="p-2 text-orange-600 font-mono text-xs">{h.proyectoId}</td>
                          <td className="p-2 text-neutral-600 dark:text-neutral-300 truncate max-w-[120px]">{h.entregable}</td>
                          <td className="p-2 text-center"><Badge>{h.revision}</Badge></td>
                          <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">S{h.semana}</td>
                          <td className="p-2 text-right text-neutral-800 dark:text-neutral-100">{h.horas}</td>
                          <td className="p-2 text-right text-green-600">{(h.horas * (col?.tarifaInterna || 0)).toFixed(2)}</td>
                          {isAdmin && (
                            <td className="p-2 text-center">
                              <button
                                onClick={async () => {
                                  if (window.confirm(`¿Eliminar registro de ${col?.iniciales || 'N/A'}?\n${h.entregable} - ${h.horas}hrs`)) {
                                    await deleteHoraFS(h._docId || h.id);
                                    showNotification('success', 'Registro eliminado');
                                  }
                                }}
                                className="p-1 hover:bg-red-100 rounded text-neutral-400 hover:text-red-500 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-neutral-300 font-medium bg-neutral-50 dark:bg-neutral-800/50">
                      <td colSpan={5} className="p-2 text-right text-neutral-500 dark:text-neutral-400">Total:</td>
                      <td className="p-2 text-right text-neutral-800 dark:text-neutral-100">{horasDelMes.reduce((s, h) => s + parseFloat(h.horas), 0)}</td>
                      <td className="p-2 text-right text-green-600">
                        {horasDelMes.reduce((s, h) => {
                          // Manejar registros con 'admin' (buscar SV)
                          const col = h.profesionalId === 'admin'
                            ? profesionales.find(c => c.iniciales === 'SV')
                            : profesionales.find(c => c.id == h.profesionalId);
                          return s + (parseFloat(h.horas) * (col?.tarifaInterna || 0));
                        }, 0).toFixed(2)}
                      </td>
                      {isAdmin && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </div>
        
        {/* Resumen por profesional */}
        <Card className="p-3 sm:p-4">
          <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium mb-3 sm:mb-4">Resumen por Profesional</h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {profesionales.map(col => {
              // Para Sebastián (SV), incluir también registros antiguos con profesionalId 'admin'
              // Usar == para comparar números/strings y manejar 'admin'
              const horasCol = horasDelMes.filter(h =>
                h.profesionalId == col.id ||
                (col.iniciales === 'SV' && h.profesionalId === 'admin')
              );
              const totalHoras = horasCol.reduce((s, h) => s + parseFloat(h.horas), 0);
              const totalCosto = totalHoras * col.tarifaInterna;
              
              return (
                <div key={col.id} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-700">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-orange-500 font-bold text-sm sm:text-base">{col.iniciales}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-800 dark:text-neutral-100 font-medium text-sm truncate">{col.nombre}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">{col.categoria}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-neutral-800 dark:text-neutral-100 font-medium text-sm">{totalHoras} hrs</p>
                    <p className="text-green-600 text-xs">{totalCosto.toFixed(2)} UF</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  // ============================================
  // PÁGINA: TAREAS
  // ============================================
  const TareasPage = () => {
    const [showNewTarea, setShowNewTarea] = useState(false);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todas'); // todas, pendiente, en_progreso, completada

    // Estados para nueva tarea
    const [nuevaTarea, setNuevaTarea] = useState({
      titulo: '',
      descripcion: '',
      asignadoA: '',
      proyectoId: '',
      entregableId: '',
      prioridad: 'media', // baja, media, alta
      fechaLimite: ''
    });

    // Filtrar tareas según rol
    const misTareas = isAdmin
      ? tareas
      : tareas.filter(t => t.asignadoA === currentUser?.profesionalId);

    // Filtrar por estado
    const tareasFiltradas = filtroEstado === 'todas'
      ? misTareas
      : misTareas.filter(t => t.estado === filtroEstado);

    // Ordenar por fecha de creación (más recientes primero)
    const tareasOrdenadas = [...tareasFiltradas].sort((a, b) =>
      new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
    );

    const crearTarea = async () => {
      if (!nuevaTarea.titulo || !nuevaTarea.asignadoA) {
        showNotification('error', 'Título y asignado son requeridos');
        return;
      }

      const tarea = {
        ...nuevaTarea,
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        creadoPor: currentUser.profesionalId,
        comentarios: []
      };

      const success = await saveTarea(tarea);
      if (success) {
        showNotification('success', 'Tarea creada exitosamente');
        setShowNewTarea(false);
        setNuevaTarea({
          titulo: '',
          descripcion: '',
          asignadoA: '',
          proyectoId: '',
          entregableId: '',
          prioridad: 'media',
          fechaLimite: ''
        });
      } else {
        showNotification('error', 'Error al crear la tarea');
      }
    };

    const cambiarEstadoTarea = async (tarea, nuevoEstado) => {
      const tareaActualizada = { ...tarea, estado: nuevoEstado };
      if (nuevoEstado === 'completada') {
        tareaActualizada.fechaCompletada = new Date().toISOString();
      }
      const success = await saveTarea(tareaActualizada);
      if (success) {
        showNotification('success', `Tarea marcada como ${nuevoEstado.replace('_', ' ')}`);
        if (selectedTarea?._docId === tarea._docId) {
          setSelectedTarea(tareaActualizada);
        }
      }
    };

    const agregarComentario = async () => {
      if (!nuevoComentario.trim() || !selectedTarea) return;

      const comentario = {
        id: Date.now(),
        texto: nuevoComentario,
        autorId: currentUser.profesionalId,
        fecha: new Date().toISOString()
      };

      const tareaActualizada = {
        ...selectedTarea,
        comentarios: [...(selectedTarea.comentarios || []), comentario]
      };

      const success = await saveTarea(tareaActualizada);
      if (success) {
        setSelectedTarea(tareaActualizada);
        setNuevoComentario('');
        showNotification('success', 'Comentario agregado');
      }
    };

    const eliminarTarea = async (tareaId) => {
      if (!window.confirm('¿Eliminar esta tarea?')) return;
      const success = await deleteTareaFS(tareaId);
      if (success) {
        showNotification('success', 'Tarea eliminada');
        setSelectedTarea(null);
      }
    };

    const getPrioridadColor = (prioridad) => {
      switch (prioridad) {
        case 'alta': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'media': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'baja': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        default: return 'bg-neutral-100 text-neutral-700';
      }
    };

    const getEstadoColor = (estado) => {
      switch (estado) {
        case 'pendiente': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        case 'en_progreso': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'completada': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        default: return 'bg-neutral-100 text-neutral-700';
      }
    };

    const getEstadoLabel = (estado) => {
      switch (estado) {
        case 'pendiente': return 'Pendiente';
        case 'en_progreso': return 'En Progreso';
        case 'completada': return 'Completada';
        default: return estado;
      }
    };

    // Obtener entregables del proyecto seleccionado
    const proyectoSeleccionado = proyectos.find(p => p.id === nuevaTarea.proyectoId);
    const entregablesProyecto = proyectoSeleccionado?.entregables || [];

    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Tareas</h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                {isAdmin ? 'Gestiona las tareas del equipo' : 'Mis tareas asignadas'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Filtro de estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
            >
              <option value="todas">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completadas</option>
            </select>

            {isAdmin && (
              <Button onClick={() => setShowNewTarea(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </Button>
            )}
          </div>
        </div>

        {/* Grid de tareas */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Lista de tareas */}
          <Card className="p-4">
            <h3 className="font-medium mb-4 text-neutral-800 dark:text-neutral-200">
              {filtroEstado === 'todas' ? 'Todas las tareas' : `Tareas ${getEstadoLabel(filtroEstado).toLowerCase()}`}
              <span className="ml-2 text-sm text-neutral-500">({tareasOrdenadas.length})</span>
            </h3>

            {tareasOrdenadas.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No hay tareas para mostrar</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {tareasOrdenadas.map(tarea => {
                  const asignado = profesionales.find(p => p.id === tarea.asignadoA);
                  const proyecto = proyectos.find(p => p.id === tarea.proyectoId);
                  const isSelected = selectedTarea?._docId === tarea._docId;

                  return (
                    <div
                      key={tarea._docId}
                      onClick={() => setSelectedTarea(tarea)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                            {tarea.titulo}
                          </h4>
                          {tarea.descripcion && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                              {tarea.descripcion}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getPrioridadColor(tarea.prioridad)}`}>
                          {tarea.prioridad}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${getEstadoColor(tarea.estado)}`}>
                          {getEstadoLabel(tarea.estado)}
                        </span>
                        {proyecto && (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            📁 {proyecto.nombre}
                          </span>
                        )}
                        {asignado && (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            👤 {asignado.nombre?.split(' ')[0]}
                          </span>
                        )}
                        {(tarea.comentarios?.length || 0) > 0 && (
                          <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {tarea.comentarios.length}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Detalle de tarea seleccionada */}
          <Card className="p-4">
            {selectedTarea ? (
              <div className="h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">
                      {selectedTarea.titulo}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getEstadoColor(selectedTarea.estado)}`}>
                        {getEstadoLabel(selectedTarea.estado)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPrioridadColor(selectedTarea.prioridad)}`}>
                        Prioridad: {selectedTarea.prioridad}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => eliminarTarea(selectedTarea._docId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {selectedTarea.descripcion && (
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {selectedTarea.descripcion}
                  </p>
                )}

                {/* Info adicional */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <span className="text-neutral-500">Asignado a:</span>
                    <p className="font-medium">{profesionales.find(p => p.id === selectedTarea.asignadoA)?.nombre || '-'}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Proyecto:</span>
                    <p className="font-medium">{proyectos.find(p => p.id === selectedTarea.proyectoId)?.nombre || '-'}</p>
                  </div>
                  {selectedTarea.entregableId && (
                    <div>
                      <span className="text-neutral-500">Entregable:</span>
                      <p className="font-medium">{selectedTarea.entregableId}</p>
                    </div>
                  )}
                  {selectedTarea.fechaLimite && (
                    <div>
                      <span className="text-neutral-500">Fecha límite:</span>
                      <p className="font-medium">{new Date(selectedTarea.fechaLimite).toLocaleDateString('es-CL')}</p>
                    </div>
                  )}
                </div>

                {/* Botones de cambio de estado */}
                <div className="flex gap-2 mb-4">
                  {selectedTarea.estado !== 'pendiente' && (
                    <button
                      onClick={() => cambiarEstadoTarea(selectedTarea, 'pendiente')}
                      className="flex-1 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      Pendiente
                    </button>
                  )}
                  {selectedTarea.estado !== 'en_progreso' && (
                    <button
                      onClick={() => cambiarEstadoTarea(selectedTarea, 'en_progreso')}
                      className="flex-1 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      En Progreso
                    </button>
                  )}
                  {selectedTarea.estado !== 'completada' && (
                    <button
                      onClick={() => cambiarEstadoTarea(selectedTarea, 'completada')}
                      className="flex-1 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Completar
                    </button>
                  )}
                </div>

                {/* Comentarios */}
                <div className="flex-1 flex flex-col min-h-0">
                  <h4 className="font-medium text-sm mb-2 text-neutral-700 dark:text-neutral-300">
                    Comentarios ({selectedTarea.comentarios?.length || 0})
                  </h4>

                  <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[200px]">
                    {(selectedTarea.comentarios || []).map(comentario => {
                      const autor = profesionales.find(p => p.id === comentario.autorId);
                      return (
                        <div
                          key={comentario.id}
                          className={`p-2 rounded-lg text-sm ${
                            comentario.autorId === currentUser?.profesionalId
                              ? 'bg-purple-100 dark:bg-purple-900/30 ml-4'
                              : 'bg-neutral-100 dark:bg-neutral-800 mr-4'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-xs">
                              {autor?.nombre?.split(' ')[0] || 'Usuario'}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {new Date(comentario.fecha).toLocaleDateString('es-CL', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300">{comentario.texto}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input de nuevo comentario */}
                  <div className="flex gap-2 mt-auto">
                    <input
                      type="text"
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && agregarComentario()}
                      placeholder="Escribe un comentario..."
                      className="flex-1 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    />
                    <button
                      onClick={agregarComentario}
                      disabled={!nuevoComentario.trim()}
                      className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Selecciona una tarea para ver los detalles</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Modal Nueva Tarea */}
        {showNewTarea && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Nueva Tarea</h3>
                <button onClick={() => setShowNewTarea(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={nuevaTarea.titulo}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    placeholder="Ej: Revisar planos estructurales"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={nuevaTarea.descripcion}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 h-20 resize-none"
                    placeholder="Detalles adicionales..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Asignar a *</label>
                  <select
                    value={nuevaTarea.asignadoA}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, asignadoA: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                  >
                    <option value="">Seleccionar profesional</option>
                    {profesionales.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Proyecto</label>
                    <select
                      value={nuevaTarea.proyectoId}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, proyectoId: e.target.value, entregableId: ''})}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    >
                      <option value="">Opcional</option>
                      {proyectos.map(p => (
                        <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Entregable</label>
                    <select
                      value={nuevaTarea.entregableId}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, entregableId: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                      disabled={!nuevaTarea.proyectoId}
                    >
                      <option value="">Opcional</option>
                      {entregablesProyecto.map(e => (
                        <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prioridad</label>
                    <select
                      value={nuevaTarea.prioridad}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, prioridad: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha límite</label>
                    <input
                      type="date"
                      value={nuevaTarea.fechaLimite}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, fechaLimite: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowNewTarea(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={crearTarea} className="flex-1">
                  Crear Tarea
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // PÁGINA: FACTURACIÓN (PROTEGIDA) - Gestión de Entregables + EDP
  // ============================================
  // NUEVO MODELO: Entregables × Tipo × Revisión
  // Precios base: DOC = 40 UF, PLA DET = 25 UF, PLA GEN = 20 UF, REU INT/CTTAL = 1 UF, VIS = 25 UF
  // Revisiones: REV_A = 70%, REV_B = 20%, REV_0 = 10%
  // ============================================
  // Estados COT: archivos/preview en App (useState), texto en App (useRef) + local (useState)
  const FacturacionPage = () => {
    // Estados locales de texto inicializados desde refs (persisten sin causar re-render de App)
    const [cotCliente, setCotClienteLocal] = useState(cotClienteRef.current);
    const [cotProyectoNombre, setCotProyectoNombreLocal] = useState(cotProyectoNombreRef.current);
    const setCotCliente = (val) => { setCotClienteLocal(val); cotClienteRef.current = val; };
    const setCotProyectoNombre = (val) => { setCotProyectoNombreLocal(val); cotProyectoNombreRef.current = val; };

    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showPreview, setShowPreview] = useState(false);
    const [selectedProyectoEDP, setSelectedProyectoEDP] = useState('all');
    // Usar estado del padre para evitar reset al re-render
    const selectedProyectoEdit = selectedProyectoFacturacion || proyectos[0]?.id || '';
    const setSelectedProyectoEdit = setSelectedProyectoFacturacion;
    const [editingEntregable, setEditingEntregable] = useState(null);
    const [showAddEntregable, setShowAddEntregable] = useState(false);
    const [edpObservaciones, setEdpObservaciones] = useState({});

    // Precios base por tipo de documento (editables en el futuro)
    const PRECIOS_BASE = {
      CRD: 40,   // Criterios de Diseño
      EETT: 40,  // Especificaciones Técnicas (SPE)
      MTO: 40,   // Materiales Take Off
      DETALLE: 25, // Planos de Detalle
      GENERAL: 20  // Planos Generales
    };

    // Porcentajes por revisión
    const PORCENTAJES_REV = {
      A: 0.70,  // REV_A = 70%
      B: 0.20,  // REV_B = 20%
      '0': 0.10 // REV_0 = 10%
    };

    // Función para determinar el tipo de documento
    // Tipos de entregable
    const TIPOS_ENTREGABLE = [
      { id: 'DOC', nombre: 'Documento', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
      { id: 'PLA', nombre: 'Plano', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
      { id: 'INF', nombre: 'Informe', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
      { id: 'REU', nombre: 'Reunión', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
      { id: 'VIS', nombre: 'Visita', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' }
    ];

    const getTipoDocumento = (codigo, nombre, tipoManual) => {
      // Si tiene tipo manual asignado, usarlo
      if (tipoManual && ['DOC', 'PLA', 'INF', 'REU', 'VIS'].includes(tipoManual)) {
        return tipoManual;
      }

      const cod = (codigo || '').toUpperCase();
      const nom = (nombre || '').toUpperCase();

      // Auto-mapeo por código
      // CRD, EETT(SPE), MTO → DOC
      if (cod.includes('CRD') || cod.includes('SPE') || cod.includes('MTO') || cod.includes('ERD')) return 'DOC';

      // DET, PLA, ARQ → PLA
      if (cod.includes('DET') || cod.includes('PLA') || cod.includes('ARQ') || nom.includes('DETALLE') || nom.includes('PLANO')) return 'PLA';

      // Por defecto es Plano
      return 'PLA';
    };

    const getTipoColor = (tipo) => {
      const tipoObj = TIPOS_ENTREGABLE.find(t => t.id === tipo);
      return tipoObj?.color || 'bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-300';
    };

    // Nuevo estado para agregar entregable en línea
    const [nuevoEntregable, setNuevoEntregable] = useState({
      codigo: '',
      nombre: '',
      tipo: 'PLA',
      secuencia: 1,
      weekStart: 1,
      valorRevA: 0,
      valorRevB: 0,
      valorRev0: 0,
      hshDirecto: 0  // Para REU y VIS (sin revisiones)
    });

    // Estado para confirmación de congelamiento
    const [freezeConfirm, setFreezeConfirm] = useState({ show: false, proyectoId: null, entregableId: null, nombre: '' });

    // Estado para confirmación de eliminación de entregable
    const [deleteEntregableConfirm, setDeleteEntregableConfirm] = useState({ show: false, proyectoId: null, entregableId: null, nombre: '' });

    // Función para obtener entregables del proyecto seleccionado
    const getEntregablesProyecto = (proyectoId) => {
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return [];
      return proyecto.entregables?.length > 0 ? proyecto.entregables : [];
    };

    // Función para actualizar un entregable
    const updateEntregable = async (proyectoId, entregableId, updates) => {
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return;

      let entregablesActualizados = (proyecto.entregables || []).map(e =>
        e.id === entregableId ? { ...e, ...updates } : e
      );

      // Si se actualizó weekStart, reordenar por semana
      if (updates.weekStart !== undefined) {
        entregablesActualizados = entregablesActualizados
          .sort((a, b) => (a.weekStart || a.secuencia || 1) - (b.weekStart || b.secuencia || 1));
      }

      const proyectoActualizado = { ...proyecto, entregables: entregablesActualizados };
      await saveProyecto(proyectoActualizado);
      showNotification('success', 'Entregable actualizado');
    };

    // Función para agregar entregable en línea
    const addEntregable = async (proyectoId) => {
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return;

      const maxId = Math.max(0, ...(proyecto.entregables || []).map(e => e.id));
      const esHshDirecto = ['REU', 'VIS'].includes(nuevoEntregable.tipo);

      const nuevoEnt = {
        id: maxId + 1,
        codigo: nuevoEntregable.codigo,
        nombre: nuevoEntregable.nombre,
        tipo: nuevoEntregable.tipo,
        secuencia: parseInt(nuevoEntregable.secuencia) || 1,
        weekStart: parseInt(nuevoEntregable.weekStart) || 1,
        // Para REU/VIS: usar hshDirecto; para otros: usar REV_A, REV_B, REV_0
        valorRevA: esHshDirecto ? parseFloat(nuevoEntregable.hshDirecto) || 0 : parseFloat(nuevoEntregable.valorRevA) || 0,
        valorRevB: esHshDirecto ? 0 : parseFloat(nuevoEntregable.valorRevB) || 0,
        valorRev0: esHshDirecto ? 0 : parseFloat(nuevoEntregable.valorRev0) || 0,
        hshDirecto: esHshDirecto,
        frozen: false
      };

      // Agregar y ordenar por semana (weekStart)
      const entregablesActualizados = [...(proyecto.entregables || []), nuevoEnt]
        .sort((a, b) => (a.weekStart || a.secuencia || 1) - (b.weekStart || b.secuencia || 1));
      const proyectoActualizado = { ...proyecto, entregables: entregablesActualizados };
      await saveProyecto(proyectoActualizado);

      // Inicializar statusData para el nuevo entregable
      const key = `${proyectoId}_${nuevoEnt.id}`;
      setStatusData(prev => ({
        ...prev,
        [key]: {
          sentIniciado: false,
          sentRevA: false,
          sentRevADate: null,
          comentariosARecibidos: false,
          comentariosARecibidosDate: null,
          sentRevB: false,
          sentRevBDate: null,
          comentariosBRecibidos: false,
          comentariosBRecibidosDate: null,
          sentRev0: false,
          sentRev0Date: null,
        }
      }));

      // Limpiar formulario
      setNuevoEntregable({ codigo: '', nombre: '', tipo: 'PLA', secuencia: 1, weekStart: 1, valorRevA: 0, valorRevB: 0, valorRev0: 0, hshDirecto: 0 });
      setShowAddEntregable(false);
      showNotification('success', 'Entregable agregado');
    };

    // Función para mostrar confirmación de congelamiento
    const showFreezeConfirm = (proyectoId, entregableId, nombre) => {
      setFreezeConfirm({ show: true, proyectoId, entregableId, nombre });
    };

    // Función para congelar/descongelar entregable
    const toggleFreezeEntregable = async () => {
      const { proyectoId, entregableId } = freezeConfirm;
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return;

      const entregablesActualizados = (proyecto.entregables || []).map(e =>
        e.id === entregableId ? { ...e, frozen: !e.frozen } : e
      );

      const proyectoActualizado = { ...proyecto, entregables: entregablesActualizados };
      await saveProyecto(proyectoActualizado);
      showNotification('info', entregablesActualizados.find(e => e.id === entregableId)?.frozen ? 'Entregable congelado' : 'Entregable descongelado');
      setFreezeConfirm({ show: false, proyectoId: null, entregableId: null, nombre: '' });
    };

    // Función para mostrar confirmación de eliminación
    const showDeleteEntregableConfirm = (proyectoId, entregableId, nombre) => {
      setDeleteEntregableConfirm({ show: true, proyectoId, entregableId, nombre });
    };

    // Función para eliminar entregable
    const deleteEntregable = async () => {
      const { proyectoId, entregableId } = deleteEntregableConfirm;
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return;

      const entregablesActualizados = (proyecto.entregables || []).filter(e => e.id !== entregableId);
      const proyectoActualizado = { ...proyecto, entregables: entregablesActualizados };
      await saveProyecto(proyectoActualizado);
      showNotification('success', 'Entregable eliminado');
      setDeleteEntregableConfirm({ show: false, proyectoId: null, entregableId: null, nombre: '' });
    };

    // Función para calcular EDP por entregables del mes (usando valores del Excel)
    const calcularEDPEntregables = () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const entregablesDelMes = [];

      // Recorrer todos los proyectos
      proyectos.forEach(proyecto => {
        if (selectedProyectoEDP !== 'all' && proyecto.id !== selectedProyectoEDP) return;

        const entregablesProyecto = proyecto.entregables || [];
        if (entregablesProyecto.length === 0) return;

        entregablesProyecto.forEach(entregable => {
          // Ignorar entregables congelados
          if (entregable.frozen) return;

          const statusKey = `${proyecto.id}_${entregable.id}`;
          const status = statusData[statusKey];
          if (!status) return;

          const tipo = getTipoDocumento(entregable.codigo, entregable.nombre);

          // Verificar REV_A - usar valor del Excel
          if (status.sentRevADate && entregable.valorRevA > 0) {
            const fecha = new Date(status.sentRevADate);
            if (fecha.getMonth() === month - 1 && fecha.getFullYear() === year) {
              const obsKey = `${proyecto.id}_${entregable.id}_A`;
              entregablesDelMes.push({
                proyectoId: proyecto.id,
                proyectoNombre: proyecto.nombre,
                entregableId: entregable.id,
                codigo: entregable.codigo || '-',
                nombre: entregable.nombre,
                tipo,
                revision: 'A',
                fecha: status.sentRevADate,
                valor: entregable.valorRevA,
                observacion: edpObservaciones[obsKey] || ''
              });
            }
          }

          // Verificar REV_B - usar valor del Excel
          if (status.sentRevBDate && entregable.valorRevB > 0) {
            const fecha = new Date(status.sentRevBDate);
            if (fecha.getMonth() === month - 1 && fecha.getFullYear() === year) {
              const obsKey = `${proyecto.id}_${entregable.id}_B`;
              entregablesDelMes.push({
                proyectoId: proyecto.id,
                proyectoNombre: proyecto.nombre,
                entregableId: entregable.id,
                codigo: entregable.codigo || '-',
                nombre: entregable.nombre,
                tipo,
                revision: 'B',
                fecha: status.sentRevBDate,
                valor: entregable.valorRevB,
                observacion: edpObservaciones[obsKey] || ''
              });
            }
          }

          // Verificar REV_0 - usar valor del Excel
          if (status.sentRev0Date && entregable.valorRev0 > 0) {
            const fecha = new Date(status.sentRev0Date);
            if (fecha.getMonth() === month - 1 && fecha.getFullYear() === year) {
              const obsKey = `${proyecto.id}_${entregable.id}_0`;
              entregablesDelMes.push({
                proyectoId: proyecto.id,
                proyectoNombre: proyecto.nombre,
                entregableId: entregable.id,
                codigo: entregable.codigo || '-',
                nombre: entregable.nombre,
                tipo,
                revision: '0',
                fecha: status.sentRev0Date,
                valor: entregable.valorRev0,
                observacion: edpObservaciones[obsKey] || ''
              });
            }
          }
        });
      });

      // Agregar VIS y REU de Sebastián al EDP
      // Solo se incluyen las cargadas por Sebastián (profesionalId 3 o 'admin')
      horasRegistradas.forEach(hora => {
        // Solo VIS y REU
        if (hora.tipo !== 'VIS' && hora.tipo !== 'REU') return;

        // Solo de Sebastián
        const esDeSebastian = hora.profesionalId === 3 || hora.profesionalId === 'admin';
        if (!esDeSebastian) return;

        // Verificar que sea del mes seleccionado
        const fechaHora = new Date(hora.fecha);
        if (fechaHora.getMonth() !== month - 1 || fechaHora.getFullYear() !== year) return;

        // Filtrar por proyecto si hay uno seleccionado
        if (selectedProyectoEDP !== 'all' && hora.proyectoId !== selectedProyectoEDP) return;

        // Buscar el nombre del proyecto
        const proyecto = proyectos.find(p => p.id === hora.proyectoId);
        const proyectoNombre = proyecto ? proyecto.nombre : hora.proyectoId;

        const entregableId = `hsh_${hora.id}`;
        const revision = '-';
        const obsKey = `${hora.proyectoId}_${entregableId}_${revision}`;
        entregablesDelMes.push({
          proyectoId: hora.proyectoId,
          proyectoNombre: proyectoNombre,
          entregableId: entregableId,
          codigo: '-',
          nombre: hora.entregable || (hora.tipo === 'VIS' ? 'Visita' : 'Reunión'),
          tipo: hora.tipo,
          revision: revision,
          fecha: hora.fecha.split('T')[0], // Solo la fecha sin la hora
          valor: hora.horas,
          observacion: edpObservaciones[obsKey] || '',
          esHsH: true // Marcador para identificar que viene de HsH
        });
      });

      // Ordenar por fecha
      entregablesDelMes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      return entregablesDelMes;
    };

    // Agrupar por proyecto
    const agruparPorProyecto = (entregables) => {
      const grupos = {};
      entregables.forEach(e => {
        if (!grupos[e.proyectoId]) {
          grupos[e.proyectoId] = {
            nombre: e.proyectoNombre,
            entregables: [],
            totalUF: 0
          };
        }
        grupos[e.proyectoId].entregables.push(e);
        grupos[e.proyectoId].totalUF += e.valor;
      });
      return grupos;
    };

    // Exportar a XLSX (formato según Excel del usuario)
    const exportarXLSX = async () => {
      const entregables = calcularEDPEntregables();
      if (entregables.length === 0) {
        showNotification('warning', 'No hay datos para exportar');
        return;
      }

      // Cargar XLSX si no está disponible
      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const mesNombre = new Date(selectedMonth + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

      // Calcular totales para el resumen
      let totalProyectoHsH = 0;
      let mesAnteriorHsH = 0;
      const mesEnCursoHsH = entregables.reduce((s, e) => s + e.valor, 0);

      const porProyectoExcel = agruparPorProyecto(entregables);
      Object.entries(porProyectoExcel).forEach(([pid, pdata]) => {
        const proyecto = proyectos.find(p => p.id === pid);
        if (proyecto && proyecto.entregables) {
          proyecto.entregables.forEach(ent => {
            if (!ent.frozen) {
              totalProyectoHsH += (ent.valorRevA || 0) + (ent.valorRevB || 0) + (ent.valorRev0 || 0);
              const avanceAnterior = (ent.avanceAnterior || 0) / 100;
              const valorTotal = (ent.valorRevA || 0) + (ent.valorRevB || 0) + (ent.valorRev0 || 0);
              mesAnteriorHsH += valorTotal * avanceAnterior;
            }
          });
        }
      });
      const totalPendienteHsH = Math.max(0, totalProyectoHsH - mesAnteriorHsH - mesEnCursoHsH);

      // Obtener jefe de proyecto si hay un proyecto seleccionado
      const proyectoSelEDP = selectedProyectoEDP !== 'all' ? proyectos.find(p => p.id === selectedProyectoEDP) : null;
      const jefeProyectoNombre = proyectoSelEDP?.jefeProyecto || '';

      // Crear datos para Excel (formato del usuario: C.COSTO, TIPO, CODIGO, DESCRIPCIÓN, REV, FECHA, HsH, OBS)
      const data = [
        ['ESTADO DE PAGO - ' + mesNombre.toUpperCase()],
        [''],
        ['C. COSTO', 'TIPO', 'CÓDIGO', 'DESCRIPCIÓN', 'REV', 'FECHA ENVÍO', 'HsH', 'OBS'],
        ...entregables.map(e => [
          e.proyectoId,      // Centro de Costo = código proyecto
          e.tipo,
          e.codigo,
          e.nombre,
          e.esHsH ? '-' : 'REV_' + e.revision, // VIS/REU no tienen revisión
          e.fecha,
          e.valor.toFixed(2), // HsH directo
          e.observacion || ''
        ]),
        [''],
        ['', '', '', '', '', 'TOTAL:', mesEnCursoHsH.toFixed(2) + ' HsH', ''],
        [''],
        [''],
        ['RESUMEN DE HORAS'],
        ['Total Proyecto:', totalProyectoHsH.toFixed(1) + ' HsH'],
        ['Mes Anterior:', mesAnteriorHsH.toFixed(1) + ' HsH'],
        ['Mes en Curso:', mesEnCursoHsH.toFixed(1) + ' HsH'],
        ['Total Pendiente:', totalPendienteHsH.toFixed(1) + ' HsH'],
        [''],
        ['FACTURACIÓN'],
        ['HsH Mes en Curso:', mesEnCursoHsH.toFixed(1)],
        ['Factor:', '1,34'],
        ['Valor Bruto HsH:', (mesEnCursoHsH * 1.34).toFixed(1)],
        [''],
        [''],
        ['_______________________________', '', '', '_______________________________'],
        ['Jefe de Proyecto' + (selectedProyectoEDP !== 'all' ? ' ' + selectedProyectoEDP : ''), '', '', 'Líder de Arquitectura'],
        [jefeProyectoNombre, '', '', 'Sebastián A. Vizcarra']
      ];

      const ws = window.XLSX.utils.aoa_to_sheet(data);

      // Ajustar anchos de columnas
      ws['!cols'] = [
        { wch: 10 }, // C. Costo
        { wch: 10 }, // Tipo
        { wch: 18 }, // Código
        { wch: 40 }, // Descripción
        { wch: 8 },  // Rev
        { wch: 12 }, // Fecha
        { wch: 10 }, // UF
        { wch: 25 }  // OBS
      ];

      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'EDP ' + mesNombre);

      // Descargar archivo
      const fileName = `EDP_${selectedMonth}.xlsx`;
      window.XLSX.writeFile(wb, fileName);
      showNotification('success', 'Excel exportado correctamente');
    };

    // Obtener entregables del proyecto seleccionado para la pestaña de gestión
    const entregablesEditProyecto = getEntregablesProyecto(selectedProyectoEdit);
    const proyectoEdit = proyectos.find(p => p.id === selectedProyectoEdit);

    // Datos para EDP
    const edpData = calcularEDPEntregables();
    const porProyecto = agruparPorProyecto(edpData);
    const totalGeneral = edpData.reduce((s, e) => s + e.valor, 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl text-neutral-800 dark:text-neutral-100 font-light">Administración de Proyectos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Gestión de entregables, EDP y control de proyectos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-200 dark:bg-neutral-700 p-1 rounded-lg w-fit">
          <button
            onClick={() => setFacturacionTab('entregables')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              facturacionTab === 'entregables'
                ? 'bg-white dark:bg-neutral-800 text-orange-600 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
          >
            Entregables
          </button>
          <button
            onClick={() => setFacturacionTab('edp')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              facturacionTab === 'edp'
                ? 'bg-white dark:bg-neutral-800 text-orange-600 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
          >
            EDP
          </button>
          <button
            onClick={() => setFacturacionTab('cot')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              facturacionTab === 'cot'
                ? 'bg-white dark:bg-neutral-800 text-orange-600 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
          >
            COT
          </button>
        </div>

        {/* ==================== PESTAÑA ENTREGABLES ==================== */}
        {facturacionTab === 'entregables' && (
          <div className="space-y-4">
            {/* Selector de proyecto */}
            <Card className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <Select
                  label="Proyecto"
                  value={selectedProyectoEdit}
                  onChange={e => setSelectedProyectoEdit(e.target.value)}
                >
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                  ))}
                </Select>
                <Button onClick={() => setShowAddEntregable(true)} variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Entregable
                </Button>
              </div>
            </Card>

            {/* Lista de entregables */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">
                  Entregables de {selectedProyectoEdit}
                </h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {entregablesEditProyecto.filter(e => !e.frozen).length} activos / {entregablesEditProyecto.length} total
                </span>
              </div>

              {entregablesEditProyecto.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay entregables en este proyecto</p>
                  <p className="text-xs mt-2">Sube un Excel o agrega entregables manualmente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-600">
                        <th className="pb-2 w-8">#</th>
                        <th className="pb-2">Código</th>
                        <th className="pb-2">Descripción</th>
                        <th className="pb-2 text-center">Tipo</th>
                        <th className="pb-2 text-center">Sem</th>
                        <th className="pb-2 text-right">REV_A (HsH)</th>
                        <th className="pb-2 text-right">REV_B (HsH)</th>
                        <th className="pb-2 text-right">REV_0 (HsH)</th>
                        <th className="pb-2 text-center">Estado</th>
                        <th className="pb-2 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entregablesEditProyecto.map((ent, i) => (
                        <tr key={ent.id} className={`border-b border-neutral-200 dark:border-neutral-600 ${ent.frozen ? 'opacity-50 bg-neutral-100 dark:bg-neutral-800' : i % 2 === 0 ? '' : 'bg-neutral-50 dark:bg-neutral-800/30'}`}>
                          <td className="py-2 text-neutral-400">{ent.id}</td>
                          <td className="py-2">
                            {editingEntregable === ent.id ? (
                              <input
                                type="text"
                                defaultValue={ent.codigo}
                                className="w-24 px-1 py-0.5 border rounded text-xs dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { codigo: e.target.value })}
                              />
                            ) : (
                              <span className="font-mono text-neutral-600 dark:text-neutral-300">{ent.codigo || '-'}</span>
                            )}
                          </td>
                          <td className="py-2 text-neutral-800 dark:text-neutral-100 max-w-xs">
                            {editingEntregable === ent.id ? (
                              <input
                                type="text"
                                defaultValue={ent.nombre}
                                className="w-full px-1 py-0.5 border rounded text-xs dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { nombre: e.target.value })}
                              />
                            ) : (
                              <span className="truncate block">{ent.nombre}</span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTipoColor(getTipoDocumento(ent.codigo, ent.nombre, ent.tipo))}`}>
                              {getTipoDocumento(ent.codigo, ent.nombre, ent.tipo)}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            {editingEntregable === ent.id ? (
                              <input
                                type="number"
                                min="1"
                                max="52"
                                defaultValue={ent.weekStart || ent.secuencia || 1}
                                className="w-12 px-1 py-0.5 border rounded text-xs text-center dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { weekStart: parseInt(e.target.value) || 1 })}
                              />
                            ) : (
                              <span className="text-neutral-500">S{getWeekOfYear(new Date(proyectoEdit?.inicio || dashboardStartDate)) + (ent.weekStart || ent.secuencia || 1) - 1}</span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            {editingEntregable === ent.id ? (
                              <input
                                type="number"
                                step="0.1"
                                defaultValue={ent.valorRevA}
                                className="w-16 px-1 py-0.5 border rounded text-xs text-right dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { valorRevA: parseFloat(e.target.value) || 0 })}
                              />
                            ) : (
                              <span className="text-green-600">{ent.valorRevA?.toFixed(1) || '0'}</span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            {ent.hshDirecto || ['REU', 'VIS'].includes(getTipoDocumento(ent.codigo, ent.nombre, ent.tipo)) ? (
                              <span className="text-neutral-400">-</span>
                            ) : editingEntregable === ent.id ? (
                              <input
                                type="number"
                                step="0.1"
                                defaultValue={ent.valorRevB}
                                className="w-16 px-1 py-0.5 border rounded text-xs text-right dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { valorRevB: parseFloat(e.target.value) || 0 })}
                              />
                            ) : (
                              <span className="text-blue-600">{ent.valorRevB?.toFixed(1) || '0'}</span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            {ent.hshDirecto || ['REU', 'VIS'].includes(getTipoDocumento(ent.codigo, ent.nombre, ent.tipo)) ? (
                              <span className="text-neutral-400">-</span>
                            ) : editingEntregable === ent.id ? (
                              <input
                                type="number"
                                step="0.1"
                                defaultValue={ent.valorRev0}
                                className="w-16 px-1 py-0.5 border rounded text-xs text-right dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { valorRev0: parseFloat(e.target.value) || 0 })}
                              />
                            ) : (
                              <span className="text-purple-600">{ent.valorRev0?.toFixed(1) || '0'}</span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {ent.frozen ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded text-[10px] font-medium">
                                FREEZE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded text-[10px] font-medium">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setEditingEntregable(editingEntregable === ent.id ? null : ent.id)}
                                className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 ${editingEntregable === ent.id ? 'text-orange-500' : 'text-neutral-500'}`}
                                title={editingEntregable === ent.id ? 'Terminar edición' : 'Editar'}
                              >
                                {editingEntregable === ent.id ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => showFreezeConfirm(selectedProyectoEdit, ent.id, ent.nombre)}
                                className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 ${ent.frozen ? 'text-blue-400' : 'text-neutral-500'}`}
                                title={ent.frozen ? 'Descongelar' : 'Congelar'}
                              >
                                <Snowflake className={`w-3.5 h-3.5 ${ent.frozen ? 'fill-blue-200' : ''}`} />
                              </button>
                              <button
                                onClick={() => showDeleteEntregableConfirm(selectedProyectoEdit, ent.id, ent.nombre)}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-500"
                                title="Eliminar entregable"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totales */}
              {entregablesEditProyecto.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-600">
                  <div className="flex justify-end gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total REV_A</p>
                      <p className="text-green-600 font-medium">
                        {entregablesEditProyecto.filter(e => !e.frozen).reduce((s, e) => s + (e.valorRevA || 0), 0).toFixed(1)} HsH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total REV_B</p>
                      <p className="text-blue-600 font-medium">
                        {entregablesEditProyecto.filter(e => !e.frozen).reduce((s, e) => s + (e.valorRevB || 0), 0).toFixed(1)} HsH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total REV_0</p>
                      <p className="text-purple-600 font-medium">
                        {entregablesEditProyecto.filter(e => !e.frozen).reduce((s, e) => s + (e.valorRev0 || 0), 0).toFixed(1)} HsH
                      </p>
                    </div>
                    <div className="text-right border-l border-neutral-300 dark:border-neutral-600 pl-6">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total Proyecto</p>
                      <p className="text-orange-500 font-bold text-lg">
                        {entregablesEditProyecto.filter(e => !e.frozen).reduce((s, e) => s + (e.valorRevA || 0) + (e.valorRevB || 0) + (e.valorRev0 || 0), 0).toFixed(1)} HsH
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Modal Agregar Entregable */}
            {showAddEntregable && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h2 className="text-neutral-800 dark:text-neutral-100 font-medium mb-4">Agregar Entregable</h2>
                  <div className="space-y-3">
                    <Select
                      label="Tipo de Entregable"
                      value={nuevoEntregable.tipo}
                      onChange={e => setNuevoEntregable(prev => ({ ...prev, tipo: e.target.value }))}
                    >
                      {TIPOS_ENTREGABLE.map(t => (
                        <option key={t.id} value={t.id}>{t.id} - {t.nombre}</option>
                      ))}
                    </Select>
                    <Input
                      label="Código"
                      placeholder="Ej: P2600-ARQ-PLA-001"
                      value={nuevoEntregable.codigo}
                      onChange={e => setNuevoEntregable(prev => ({ ...prev, codigo: e.target.value }))}
                    />
                    <Input
                      label="Descripción"
                      placeholder="Ej: Planta General Nivel 1"
                      value={nuevoEntregable.nombre}
                      onChange={e => setNuevoEntregable(prev => ({ ...prev, nombre: e.target.value }))}
                    />
                    <Input
                      label="Semana de Entrega"
                      type="number"
                      min="1"
                      max="52"
                      value={nuevoEntregable.weekStart}
                      onChange={e => setNuevoEntregable(prev => ({ ...prev, weekStart: e.target.value }))}
                    />
                    {/* REU y VIS tienen HsH directo (sin revisiones) */}
                    {['REU', 'VIS'].includes(nuevoEntregable.tipo) ? (
                      <Input
                        label="HsH Directo"
                        type="number"
                        step="0.1"
                        value={nuevoEntregable.hshDirecto}
                        onChange={e => setNuevoEntregable(prev => ({ ...prev, hshDirecto: e.target.value }))}
                      />
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          label="REV_A (HsH)"
                          type="number"
                          step="0.1"
                          value={nuevoEntregable.valorRevA}
                          onChange={e => setNuevoEntregable(prev => ({ ...prev, valorRevA: e.target.value }))}
                        />
                        <Input
                          label="REV_B (HsH)"
                          type="number"
                          step="0.1"
                          value={nuevoEntregable.valorRevB}
                          onChange={e => setNuevoEntregable(prev => ({ ...prev, valorRevB: e.target.value }))}
                        />
                        <Input
                          label="REV_0 (HsH)"
                          type="number"
                          step="0.1"
                          value={nuevoEntregable.valorRev0}
                          onChange={e => setNuevoEntregable(prev => ({ ...prev, valorRev0: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button variant="ghost" onClick={() => setShowAddEntregable(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => addEntregable(selectedProyectoEdit)}
                      disabled={!nuevoEntregable.nombre}
                      className="flex-1"
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmación para congelar */}
            {freezeConfirm.show && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-sm w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Snowflake className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-neutral-800 dark:text-neutral-100 font-medium">Confirmar Acción</h2>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                    ¿Estás seguro que deseas {(() => {
                      const proyecto = proyectos.find(p => p.id === freezeConfirm.proyectoId);
                      const entregable = proyecto?.entregables?.find(e => e.id === freezeConfirm.entregableId);
                      return entregable?.frozen ? 'descongelar' : 'congelar';
                    })()} el entregable <strong>"{freezeConfirm.nombre}"</strong>?
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-4">
                    Los entregables congelados aparecerán tachados en Control, Log y Carta.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setFreezeConfirm({ show: false, proyectoId: null, entregableId: null, nombre: '' })} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={toggleFreezeEntregable} className="flex-1">
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmación para eliminar entregable */}
            {deleteEntregableConfirm.show && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-sm w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-neutral-800 dark:text-neutral-100 font-medium">Eliminar Entregable</h2>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                    ¿Estás seguro que deseas eliminar el entregable <strong>"{deleteEntregableConfirm.nombre}"</strong>?
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400 mb-4">
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setDeleteEntregableConfirm({ show: false, proyectoId: null, entregableId: null, nombre: '' })} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={deleteEntregable} className="flex-1 bg-red-500 hover:bg-red-600">
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PESTAÑA EDP ==================== */}
        {facturacionTab === 'edp' && (
          <div className="space-y-4">
            {/* Selector de mes y proyecto */}
            <Card className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <Input
                  label="Mes a facturar"
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                />
                <Select
                  label="Proyecto"
                  value={selectedProyectoEDP}
                  onChange={e => setSelectedProyectoEDP(e.target.value)}
                >
                  <option value="all">Todos los proyectos</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                  ))}
                </Select>
                <div className="flex gap-2">
                  <Button onClick={exportarXLSX} variant="secondary">
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar XLSX
                  </Button>
                  <Button onClick={() => setShowPreview(true)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Vista PDF
                  </Button>
                </div>
              </div>
            </Card>

            {/* Resumen EDP */}
            <Card className="p-4">
              <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium mb-4">
                EDP - {new Date(selectedMonth + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
              </h2>

              {edpData.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay entregables facturables en este período</p>
                  <p className="text-xs mt-2">Los entregables aparecen aquí cuando se marcan en Control de Avance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(porProyecto).map(([proyectoId, data]) => (
                    <div key={proyectoId} className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-orange-500 font-mono font-bold">{proyectoId}</span>
                          <span className="text-neutral-800 dark:text-neutral-100 ml-2">{data.nombre}</span>
                        </div>
                        <Badge variant="success">
                          {data.totalUF.toFixed(2)} UF
                        </Badge>
                      </div>

                      {/* Tabla de entregables con observaciones */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-600">
                              <th className="pb-2">Código</th>
                              <th className="pb-2">Descripción</th>
                              <th className="pb-2 text-center">Tipo</th>
                              <th className="pb-2 text-center">Rev</th>
                              <th className="pb-2 text-center">Fecha</th>
                              <th className="pb-2 text-right">HsH</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.entregables.map((e, i) => {
                              const obsKey = `${e.proyectoId}_${e.entregableId}_${e.revision}`;
                              return (
                                <tr key={`${e.entregableId}-${e.revision}`} className={`border-b border-neutral-200 dark:border-neutral-600 ${i % 2 === 0 ? '' : 'bg-white/50 dark:bg-neutral-800/30'}`}>
                                  <td className="py-2 font-mono text-neutral-600 dark:text-neutral-300">{e.codigo}</td>
                                  <td className="py-2 text-neutral-800 dark:text-neutral-100 max-w-xs truncate">{e.nombre}</td>
                                  <td className="py-2 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      e.tipo === 'CRD' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                      e.tipo === 'EETT' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                                      e.tipo === 'MTO' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                      e.tipo === 'DETALLE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                                      e.tipo === 'VIS' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' :
                                      e.tipo === 'REU' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                      'bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-300'
                                    }`}>
                                      {e.tipo}
                                    </span>
                                  </td>
                                  <td className="py-2 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      e.esHsH ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                      e.revision === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                      e.revision === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                      'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                    }`}>
                                      {e.esHsH ? e.tipo : `REV_${e.revision}`}
                                    </span>
                                  </td>
                                  <td className="py-2 text-center text-neutral-600 dark:text-neutral-300">{e.fecha}</td>
                                  <td className="py-2 text-right text-green-600 dark:text-green-400 font-medium">{e.valor.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="font-medium">
                              <td colSpan={5} className="pt-2 text-right text-neutral-600 dark:text-neutral-300">Subtotal {proyectoId}:</td>
                              <td className="pt-2 text-right text-green-600 dark:text-green-400">{data.totalUF.toFixed(2)} UF</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}

                  {/* Total general */}
                  <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-neutral-800 dark:text-neutral-100 font-medium">TOTAL EDP</span>
                        <span className="text-neutral-500 dark:text-neutral-400 text-sm ml-2">
                          ({edpData.length} registros)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">
                          {totalGeneral.toFixed(2)} HsH
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resumen con Factor */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">HsH Mes en Curso</p>
                      <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{totalGeneral.toFixed(1)}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">Markup</p>
                      <p className="text-xl font-bold text-blue-600">1,34</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                      <p className="text-orange-600 dark:text-orange-400 text-xs mb-1">Valor Bruto HsH</p>
                      <p className="text-xl font-bold text-orange-600">{(totalGeneral * 1.34).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Modal de Vista Previa PDF */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between no-print">
                <h2 className="text-neutral-800 dark:text-neutral-100 font-medium">Vista Previa EDP</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="ghost" onClick={() => setShowPreview(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] print-content">
                {/* Contenido para PDF - Una sola página */}
                <div className="bg-white text-black">
                  {/* Header con proyecto */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-orange-500">
                    <div>
                      <h1 className="text-xl font-bold text-neutral-800">ESTADO DE PAGO</h1>
                      <p className="text-sm text-neutral-600">{new Date(selectedMonth + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        {selectedProyectoEDP !== 'all'
                          ? `${selectedProyectoEDP} - ${proyectos.find(p => p.id === selectedProyectoEDP)?.nombre || ''}`
                          : 'Todos los proyectos'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-light tracking-widest">
                        <span className="text-neutral-800">M</span>
                        <span className="text-orange-500">A</span>
                        <span className="text-neutral-800">TRIZ</span>
                      </p>
                      <p className="text-[7px] text-neutral-400 tracking-wider">ASSETS FOR NON-PROCESS INFRASTRUCTURE</p>
                    </div>
                  </div>

                  {/* Tabla de entregables */}
                  <table className="w-full text-[8px] border-collapse mb-3">
                    <thead>
                      <tr className="bg-neutral-800 text-white">
                        <th className="border border-neutral-300 px-1.5 py-1 text-center">TIPO</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-left">CÓDIGO</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-left">DESCRIPCIÓN</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-center">REV</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-center">FECHA</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-right">HsH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edpData.map((e, i) => (
                        <tr key={`${e.entregableId}-${e.revision}`} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                          <td className="border border-neutral-300 px-1.5 py-0.5 text-center">{e.tipo}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5 font-mono">{e.codigo}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5">{e.nombre}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5 text-center">{e.esHsH ? '-' : `REV_${e.revision}`}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5 text-center">{e.fecha}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5 text-right font-medium">{e.valor.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-orange-100 font-bold">
                        <td colSpan={5} className="border border-neutral-300 px-1.5 py-1 text-right">TOTAL HsH:</td>
                        <td className="border border-neutral-300 px-1.5 py-1 text-right text-orange-600">{totalGeneral.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Resumen compacto */}
                  <div className="mt-3 p-2 bg-neutral-50 border border-neutral-200 rounded">
                    <div className="grid grid-cols-4 gap-2 text-[9px]">
                      {(() => {
                        // Calcular totales para el resumen
                        let totalProyectoHsH = 0;
                        let mesAnteriorHsH = 0;
                        const mesEnCursoHsH = totalGeneral;

                        Object.entries(porProyecto).forEach(([pid, pdata]) => {
                          const proyecto = proyectos.find(p => p.id === pid);
                          if (proyecto && proyecto.entregables) {
                            proyecto.entregables.forEach(ent => {
                              if (!ent.frozen) {
                                // Total presupuestado del proyecto
                                totalProyectoHsH += (ent.valorRevA || 0) + (ent.valorRevB || 0) + (ent.valorRev0 || 0);
                                // Mes anterior: lo que ya se facturó (avance anterior)
                                const avanceAnterior = (ent.avanceAnterior || 0) / 100;
                                const valorTotal = (ent.valorRevA || 0) + (ent.valorRevB || 0) + (ent.valorRev0 || 0);
                                mesAnteriorHsH += valorTotal * avanceAnterior;
                              }
                            });
                          }
                        });

                        const totalPendienteHsH = Math.max(0, totalProyectoHsH - mesAnteriorHsH - mesEnCursoHsH);

                        return (
                          <>
                            <div className="text-center p-1.5 bg-white rounded border">
                              <p className="text-neutral-500 text-[8px]">Total Proyecto</p>
                              <p className="font-bold text-neutral-800 text-xs">{totalProyectoHsH.toFixed(1)}</p>
                            </div>
                            <div className="text-center p-1.5 bg-white rounded border">
                              <p className="text-neutral-500 text-[8px]">Mes Anterior</p>
                              <p className="font-bold text-neutral-600 text-xs">{mesAnteriorHsH.toFixed(1)}</p>
                            </div>
                            <div className="text-center p-1.5 bg-orange-50 rounded border border-orange-200">
                              <p className="text-orange-600 text-[8px]">Mes en Curso</p>
                              <p className="font-bold text-orange-600 text-sm">{mesEnCursoHsH.toFixed(1)}</p>
                            </div>
                            <div className="text-center p-1.5 bg-orange-100 rounded border border-orange-300">
                              <p className="text-orange-700 text-[8px]">Total Pendiente</p>
                              <p className="font-bold text-orange-600 text-sm">{totalPendienteHsH.toFixed(1)}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Segunda fila: Factor y Valor Bruto */}
                    <div className="grid grid-cols-3 gap-2 text-[9px] mt-2">
                      <div className="text-center p-1.5 bg-white rounded border">
                        <p className="text-neutral-500 text-[8px]">HsH Mes en Curso</p>
                        <p className="font-bold text-neutral-800 text-xs">{totalGeneral.toFixed(1)}</p>
                      </div>
                      <div className="text-center p-1.5 bg-white rounded border">
                        <p className="text-neutral-500 text-[8px]">Markup</p>
                        <p className="font-bold text-blue-600 text-xs">1,34</p>
                      </div>
                      <div className="text-center p-1.5 bg-orange-50 rounded border border-orange-200">
                        <p className="text-orange-600 text-[8px]">Valor Bruto HsH</p>
                        <p className="font-bold text-orange-600 text-sm">{(totalGeneral * 1.34).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Firmas */}
                  <div className="mt-8 pt-4 border-t border-neutral-300">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Firma Jefe de Proyecto */}
                      <div className="text-center">
                        <div className="border-b border-neutral-400 h-12 mb-2"></div>
                        <p className="text-[10px] font-bold text-neutral-700">Jefe de Proyecto {selectedProyectoEDP !== 'all' ? selectedProyectoEDP : ''}</p>
                        <p className="text-[9px] text-neutral-600">{selectedProyectoEDP !== 'all' ? (proyectos.find(p => p.id === selectedProyectoEDP)?.jefeProyecto || '') : ''}</p>
                      </div>
                      {/* Firma Líder de Arquitectura */}
                      <div className="text-center">
                        <div className="border-b border-neutral-400 h-12 mb-2"></div>
                        <p className="text-[10px] font-bold text-neutral-700">Líder de Arquitectura</p>
                        <p className="text-[9px] text-neutral-600">Sebastián A. Vizcarra</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-neutral-200 text-[8px] text-neutral-400 flex justify-between">
                    <span>Generado: {new Date().toLocaleString('es-CL')}</span>
                    <span>AFOR Intranet v1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PESTAÑA COT (COTIZACIÓN) ==================== */}
        {facturacionTab === 'cot' && (
          <Card className="p-4 sm:p-6">
            {/* Header con botones de modo */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-neutral-800 dark:text-neutral-100 text-lg font-medium mb-1">
                  {cotMode === 'lista' ? 'Cotizaciones' : cotMode === 'editar' ? 'Editar Cotización' : 'Nueva Cotización'}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {cotMode === 'lista' ? `${cotizaciones.length} cotización${cotizaciones.length !== 1 ? 'es' : ''} guardada${cotizaciones.length !== 1 ? 's' : ''}` : 'Crea una propuesta comercial a partir de un listado de documentos'}
                </p>
              </div>
              {cotMode === 'lista' ? (
                <button
                  onClick={() => {
                    setCotCliente('');
                    setCotProyectoNombre('');
                    setCotExcelData(null);
                    setCotExcelFileName('');
                    setCotFirma(null);
                    setCotMode('crear');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Nueva COT
                </button>
              ) : (
                <button
                  onClick={() => { setCotMode('lista'); setCotShowPreview(false); }}
                  className="flex items-center gap-2 px-3 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg text-sm hover:bg-neutral-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Volver al listado
                </button>
              )}
            </div>

            {/* ===== MODO LISTA: Cotizaciones guardadas ===== */}
            {cotMode === 'lista' && (
              <div>
                {cotizaciones.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No hay cotizaciones guardadas</p>
                    <p className="text-sm mt-1">Crea una nueva cotización para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cotizaciones.sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || '')).map(cot => {
                      const subtotal = cot.excelData ? cot.excelData.slice(1).filter(r => r[0] && r[3]).reduce((sum, r) => {
                        const t = (r[1] || 'PLA GEN').toUpperCase();
                        const cant = parseInt(r[4]) || 1;
                        const p = t.includes('DOC') ? 30 : t.includes('PLA DET') ? 25 : t.includes('PLA GEN') ? 20 : t.includes('REU INT') ? 1 : t.includes('REU CTTAL') ? 1 : t.includes('VIS') ? 25 : 20;
                        return sum + (p * cant);
                      }, 0) : 0;
                      const total = (subtotal * 1.34 * 1.19);
                      const items = cot.excelData ? cot.excelData.slice(1).filter(r => r[0] && r[3]).length : 0;
                      return (
                        <div key={cot._docId} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-neutral-800 dark:text-neutral-100 font-semibold truncate">{cot.proyectoNombre || 'Sin nombre'}</h4>
                                {cot.firmada && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">Firmada</span>}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {cot.cliente || '—'}</span>
                                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {items} ítem{items !== 1 ? 's' : ''}</span>
                                <span className="font-semibold text-orange-600">{total.toFixed(1)} UF</span>
                              </div>
                              <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                {cot.fechaCreacion ? new Date(cot.fechaCreacion).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                {cot.excelFileName && <span className="ml-2 opacity-70">({cot.excelFileName})</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-3">
                              <button
                                onClick={() => {
                                  setCotCliente(cot.cliente || '');
                                  setCotProyectoNombre(cot.proyectoNombre || '');
                                  setCotExcelData(cot.excelData || null);
                                  setCotExcelFileName(cot.excelFileName || '');
                                  setCotFirma(cot.firmada || false);
                                  setCotShowPreview(true);
                                  setCotViewingId(cot._docId);
                                }}
                                className="p-2 text-neutral-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                title="Ver preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setCotCliente(cot.cliente || '');
                                  setCotProyectoNombre(cot.proyectoNombre || '');
                                  setCotExcelData(cot.excelData || null);
                                  setCotExcelFileName(cot.excelFileName || '');
                                  setCotFirma(cot.firmada || false);
                                  setCotViewingId(cot._docId);
                                  setCotMode('editar');
                                }}
                                className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('¿Eliminar esta cotización?')) {
                                    const ok = await deleteCotizacionFS(cot._docId);
                                    if (ok) showNotification('success', 'Cotización eliminada');
                                    else showNotification('error', 'Error al eliminar');
                                  }
                                }}
                                className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===== MODO CREAR / EDITAR: Formulario COT ===== */}
            {(cotMode === 'crear' || cotMode === 'editar') && (
            <div className="space-y-4">
              {/* Datos del Cliente */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={cotCliente}
                    onChange={e => setCotCliente(e.target.value)}
                    placeholder="Ej: BHP Billiton"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider mb-1">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={cotProyectoNombre}
                    onChange={e => setCotProyectoNombre(e.target.value)}
                    placeholder="Ej: Ampliación Planta Concentradora"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Carga de Excel */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider">
                    Listado de Documentos (Excel) *
                  </label>
                  <a
                    href="/Cotizacion_Plantilla.xlsx"
                    download="Cotizacion_Plantilla.xlsx"
                    className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <FileDown className="w-3 h-3" />
                    Descargar plantilla
                  </a>
                </div>
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCotExcelFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                          const processExcelCot = () => {
                            try {
                              const data = new Uint8Array(evt.target.result);
                              const workbook = window.XLSX.read(data, { type: 'array' });
                              const sheetName = workbook.SheetNames[0];
                              const worksheet = workbook.Sheets[sheetName];
                              const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                              setCotExcelData(jsonData);
                              showNotification('success', 'Excel cargado correctamente');
                            } catch (error) {
                              showNotification('error', 'Error al leer el archivo Excel');
                            }
                          };
                          if (!window.XLSX) {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                            script.onload = processExcelCot;
                            script.onerror = () => showNotification('error', 'Error cargando librería Excel');
                            document.head.appendChild(script);
                          } else {
                            processExcelCot();
                          }
                        };
                        reader.readAsArrayBuffer(file);
                      }
                    }}
                    className="hidden"
                    id="cotExcelInputAdmin"
                  />
                  <label htmlFor="cotExcelInputAdmin" className="cursor-pointer">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                    {cotExcelFileName ? (
                      <div>
                        <p className="text-neutral-800 dark:text-neutral-100 font-medium">{cotExcelFileName}</p>
                        <p className="text-green-600 text-sm mt-1">✓ Archivo cargado</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 font-medium">Haz clic para subir</p>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">o arrastra tu archivo Excel aquí</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Preview de datos */}
              {cotExcelData && (
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-neutral-800 dark:text-neutral-100 font-medium text-sm mb-2">Vista Previa</h4>
                  <div className="max-h-48 overflow-y-auto text-xs">
                    <table className="w-full">
                      <tbody>
                        {cotExcelData.slice(0, 10).map((row, i) => (
                          <tr key={i} className={i === 0 ? 'font-bold bg-neutral-200 dark:bg-neutral-700' : ''}>
                            {row.slice(0, 5).map((cell, j) => (
                              <td key={j} className="px-2 py-1 border-b border-neutral-200 dark:border-neutral-700 truncate max-w-[150px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {cotExcelData.length > 10 && (
                      <p className="text-neutral-500 text-center mt-2">... y {cotExcelData.length - 10} filas más</p>
                    )}
                  </div>
                </div>
              )}

              {/* Resumen de forma de pago */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="text-orange-800 dark:text-orange-300 font-medium text-sm mb-2">Forma de Pago (por revisiones)</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">70%</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">REV_A</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">20%</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">REV_B</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">10%</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">REV_0</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
                  Validez: 90 días | Revisiones posteriores mantienen valor REV_0
                </p>
              </div>

              {/* Botones Crear COT / Guardar + Ver Preview */}
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!cotCliente || !cotProyectoNombre || !cotExcelData) {
                      showNotification('error', 'Completa todos los campos requeridos');
                      return;
                    }
                    setCotGenerando(true);
                    // Serializar excelData como JSON string: Firestore no acepta nested arrays
                    const cleanExcelData = cotExcelData.map(row =>
                      row.map(cell => (cell === undefined || cell === null) ? '' : cell)
                    );
                    const cotData = {
                      cliente: cotCliente,
                      proyectoNombre: cotProyectoNombre,
                      excelDataJson: JSON.stringify(cleanExcelData),
                      excelFileName: cotExcelFileName || '',
                      firmada: !!cotFirma,
                      fechaCreacion: cotMode === 'editar' && cotViewingId ? (cotizaciones.find(c => c._docId === cotViewingId)?.fechaCreacion || new Date().toISOString()) : new Date().toISOString(),
                      fechaModificacion: new Date().toISOString(),
                    };
                    if (cotMode === 'editar' && cotViewingId) {
                      cotData._docId = cotViewingId;
                    }
                    const result = await saveCotizacion(cotData);
                    setCotGenerando(false);
                    if (result) {
                      showNotification('success', cotMode === 'editar' ? 'Cotización actualizada' : 'Cotización creada');
                      setCotMode('lista');
                      setCotCliente('');
                      setCotProyectoNombre('');
                      setCotExcelData(null);
                      setCotExcelFileName('');
                      setCotFirma(null);
                      setCotViewingId(null);
                    } else {
                      showNotification('error', 'Error al guardar la cotización');
                    }
                  }}
                  disabled={!cotCliente || !cotProyectoNombre || !cotExcelData || cotGenerando}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    !cotCliente || !cotProyectoNombre || !cotExcelData || cotGenerando
                      ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {cotGenerando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {cotMode === 'editar' ? 'Guardar Cambios' : 'Crear COT'}
                </button>
                <button
                  onClick={() => {
                    if (!cotCliente || !cotProyectoNombre || !cotExcelData) {
                      showNotification('error', 'Completa todos los campos requeridos');
                      return;
                    }
                    setCotShowPreview(true);
                  }}
                  disabled={!cotCliente || !cotProyectoNombre || !cotExcelData}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    !cotCliente || !cotProyectoNombre || !cotExcelData
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
              </div>
            </div>
            )}
          </Card>
        )}

        {/* ==================== MODAL PREVIEW COTIZACIÓN ==================== */}
        {cotShowPreview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-auto rounded-lg shadow-2xl">
              {/* Header del modal */}
              <div className="sticky top-0 bg-white border-b px-6 py-3 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-neutral-800">Preview de Cotización</h3>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const el = document.getElementById('cotizacion-preview');
                      let cotHtml = el.innerHTML;
                      const imgs = el.querySelectorAll('img');
                      const imgMap = {};
                      for (const img of imgs) { const s = img.getAttribute('src'); if (!imgMap[s]) { try { const c = document.createElement('canvas'); c.width = img.naturalWidth||200; c.height = img.naturalHeight||200; c.getContext('2d').drawImage(img,0,0); imgMap[s] = c.toDataURL('image/png'); } catch(e){} } }
                      const toB64 = (src) => new Promise(r => { const i = new Image(); i.crossOrigin='anonymous'; i.onload=()=>{ const c=document.createElement('canvas'); c.width=i.naturalWidth; c.height=i.naturalHeight; c.getContext('2d').drawImage(i,0,0); r(c.toDataURL('image/png')); }; i.onerror=()=>r(''); i.src=src; });
                      const logoB64 = await toB64('/logo-afor.png');
                      for (const [s,b] of Object.entries(imgMap)) cotHtml = cotHtml.split(s).join(b);
                      // Remove no-print elements
                      const tmp = document.createElement('div');
                      tmp.innerHTML = cotHtml;
                      tmp.querySelectorAll('.no-print').forEach(e => e.remove());
                      cotHtml = tmp.innerHTML;
                      const pw = window.open('','_blank');
                      pw.document.write(`<html><head><title>AFOR — Propuesta ${cotCliente}</title>
<style>
@page { size: A4 portrait; margin: 12mm 10mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.no-print { display: none !important; }
table { page-break-inside: auto; }
tr { page-break-inside: avoid; }
</style></head><body>
<div style="min-width:700px;max-width:900px;margin:0 auto;">
${cotHtml}
</div>
</body></html>`);
                      pw.document.close();
                      setTimeout(() => pw.print(), 600);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir / PDF
                  </button>
                  <button
                    onClick={() => setCotShowPreview(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cerrar
                  </button>
                </div>
              </div>

              {/* Contenido del Preview - formato apaisado AFOR */}
              <div id="cotizacion-preview" style={{ minWidth: '900px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                {/* Franja naranja superior */}
                <div style={{ height: '6px', background: 'linear-gradient(90deg, #E86B11, #D15E0E)' }}></div>
                {/* Header con logo real */}
                <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                  <img src="/logo-afor.png" alt="AFOR" style={{ height: '60px' }} />
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Fecha de emisión</div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>{new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Info proyecto y cliente */}
                <div style={{ padding: '20px 40px', background: '#fafafa', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Proyecto</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{cotProyectoNombre || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Cliente</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{cotCliente || '—'}</div>
                  </div>
                </div>

                {/* Título sección */}
                <div style={{ padding: '20px 40px 10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#E86B11', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', borderBottom: '2px solid #E86B11', paddingBottom: '6px', display: 'inline-block' }}>
                    Alcance y Valorización
                  </div>
                </div>

                {/* Tabla de items */}
                <div style={{ padding: '0 40px 16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th style={{ background: '#E86B11', color: 'white', padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '4px 0 0 0' }}>N°</th>
                        <th style={{ background: '#E86B11', color: 'white', padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descripción</th>
                        <th style={{ background: '#E86B11', color: 'white', padding: '8px 10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo</th>
                        <th style={{ background: '#E86B11', color: 'white', padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REV_A (70%)</th>
                        <th style={{ background: '#E86B11', color: 'white', padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REV_B (20%)</th>
                        <th style={{ background: '#E86B11', color: 'white', padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REV_0 (10%)</th>
                        <th style={{ background: '#E86B11', color: 'white', padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '0 4px 0 0' }}>Total UF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotExcelData && cotExcelData.slice(1).filter(row => row[0] && row[3]).map((row, idx) => {
                        const tipo = (row[1] || 'PLA GEN').toUpperCase();
                        const cantidad = parseInt(row[4]) || 1;
                        const precio = tipo.includes('DOC') ? 30 :
                                      tipo.includes('PLA DET') ? 25 :
                                      tipo.includes('PLA GEN') ? 20 :
                                      tipo.includes('REU INT') ? 1 :
                                      tipo.includes('REU CTTAL') ? 1 :
                                      tipo.includes('VIS') ? 25 : 20;
                        const precioTotal = precio * cantidad;
                        const esCobroUnico = tipo.includes('VIS') || tipo.includes('REU INT') || tipo.includes('REU CTTAL');
                        const bg = idx % 2 === 0 ? '#ffffff' : '#fafafa';
                        return (
                          <tr key={idx} style={{ background: bg }}>
                            <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', color: '#666', fontSize: '11px' }}>{row[0]}</td>
                            <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', fontWeight: '500' }}>{row[3]}</td>
                            <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                              <span style={{ background: esCobroUnico ? '#dbeafe' : '#fff7ed', color: esCobroUnico ? '#1e40af' : '#D15E0E', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600' }}>{tipo}</span>
                            </td>
                            {esCobroUnico ? (
                              <>
                                <td colSpan="3" style={{ padding: '7px 10px', borderBottom: '1px solid #eee', textAlign: 'center', color: '#888', fontSize: '10px', fontStyle: 'italic' }}>Cobro único</td>
                                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: '600' }}>{precioTotal}</td>
                              </>
                            ) : (
                              <>
                                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{(precioTotal * 0.7).toFixed(1)}</td>
                                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{(precioTotal * 0.2).toFixed(1)}</td>
                                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{(precioTotal * 0.1).toFixed(1)}</td>
                                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: '600' }}>{precioTotal}</td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                      {(() => {
                        const subtotal = cotExcelData ? cotExcelData.slice(1).filter(row => row[0] && row[3]).reduce((sum, row) => {
                          const tipo = (row[1] || 'PLA GEN').toUpperCase();
                          const cantidad = parseInt(row[4]) || 1;
                          const precio = tipo.includes('DOC') ? 30 :
                                        tipo.includes('PLA DET') ? 25 :
                                        tipo.includes('PLA GEN') ? 20 :
                                        tipo.includes('REU INT') ? 1 :
                                        tipo.includes('REU CTTAL') ? 1 :
                                        tipo.includes('VIS') ? 25 : 20;
                          return sum + (precio * cantidad);
                        }, 0) : 0;
                        const conFactor = subtotal * 1.34;
                        const iva = conFactor * 0.19;
                        const total = conFactor + iva;
                        return (
                          <>
                            <tr>
                              <td colSpan="6" style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', borderTop: '2px solid #E86B11', background: '#fff7ed', fontSize: '12px' }}>Subtotal</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', borderTop: '2px solid #E86B11', background: '#fff7ed', fontSize: '12px' }}>{subtotal} UF</td>
                            </tr>
                            <tr>
                              <td colSpan="6" style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', background: '#fff7ed', fontSize: '12px' }}>Markup 1,34</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', background: '#fff7ed', fontSize: '13px', color: '#E86B11' }}>{conFactor.toFixed(1)} UF</td>
                            </tr>
                            <tr>
                              <td colSpan="6" style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', background: '#fff7ed', fontSize: '12px' }}>IVA (19%)</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', background: '#fff7ed', fontSize: '12px' }}>{iva.toFixed(1)} UF</td>
                            </tr>
                            <tr className="total-row">
                              <td colSpan="6" style={{ padding: '10px', textAlign: 'right', fontWeight: '700', borderTop: '2px solid #E86B11', background: '#E86B11', color: 'white', fontSize: '13px' }}>TOTAL PROPUESTA</td>
                              <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', borderTop: '2px solid #E86B11', background: '#E86B11', color: 'white', fontSize: '15px' }}>{total.toFixed(1)} UF</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Condiciones Comerciales */}
                <div style={{ padding: '0 40px 20px' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '8px', padding: '16px 20px', border: '1px solid #e8e8e8' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#E86B11', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Condiciones Comerciales</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '11px', color: '#555' }}>
                      <div><strong style={{ color: '#333' }}>Forma de Pago:</strong> REV_A (70%) al envío, REV_B (20%) al envío, REV_0 (10%) al envío</div>
                      <div><strong style={{ color: '#333' }}>Validez de la Oferta:</strong> 90 días corridos desde la fecha de emisión</div>
                      <div><strong style={{ color: '#333' }}>Plazo de Entrega:</strong> A coordinar según alcance del proyecto</div>
                      <div><strong style={{ color: '#333' }}>Revisiones Adicionales:</strong> Se valorarán al valor de REV_0</div>
                    </div>
                  </div>
                </div>

                {/* Firma y footer */}
                <div style={{ padding: '16px 40px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    <div style={{ fontWeight: '600', color: '#666', marginBottom: '2px' }}>AFOR - Assets for Non-Process Infrastructure</div>
                    <div>www.afor.cl | contacto@afor.cl</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    {cotFirma ? (
                      <div>
                        <img src="/firma-sav.png" alt="Firma" style={{ height: '65px', marginBottom: '4px' }} className="firma-img" />
                        <div style={{ borderTop: '1.5px solid #333', paddingTop: '4px', paddingLeft: '16px', paddingRight: '16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a' }}>Sebastián A. Vizcarra B.</div>
                          <div style={{ fontSize: '10px', color: '#888' }}>Arquitecto Líder</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ height: '55px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                          <button
                            onClick={() => setCotFirma(true)}
                            className="no-print"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                          >
                            <Edit3 className="w-4 h-4" />
                            Firmar
                          </button>
                        </div>
                        <div style={{ borderTop: '1.5px solid #333', paddingTop: '4px', paddingLeft: '16px', paddingRight: '16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a' }}>Sebastián A. Vizcarra B.</div>
                          <div style={{ fontSize: '10px', color: '#888' }}>Arquitecto Líder</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Línea inferior naranja */}
                <div style={{ height: '4px', background: 'linear-gradient(135deg, #E86B11 0%, #D15E0E 100%)' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // Modal Nuevo Proyecto se renderiza inline (ver abajo)

  // ============================================
  // PANTALLA DE CARGA (mientras se conecta a Firestore)
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: '#ffffff'}}>
        <div className="text-center">
          <img src={LOGO_AFOR} alt="AFOR" className="h-24 mx-auto mb-4" />
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">Conectando con la base de datos...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // PANTALLA DE LOGIN (si no está autenticado)
  // ============================================
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden" style={{background: '#ffffff'}}>
        {/* Estilos de animación */}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
          .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .login-line {
            width: 200px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #ea580c, transparent);
          }
          .login-dot {
            width: 8px;
            height: 8px;
            background: #ea580c;
            border-radius: 50%;
          }
        `}</style>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 animate-fadeInDown">
            <img src={LOGO_AFOR} alt="AFOR" className="h-32 mx-auto mb-4 animate-float" />
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="login-line"></div>
              <div className="login-dot"></div>
              <div className="login-line"></div>
            </div>
            <p className="text-neutral-500 text-xs tracking-[0.3em] uppercase">Assets for Non-Process Infrastructure</p>
            <h1 className="text-lg text-neutral-700 font-medium mt-3">Intranet</h1>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-6 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <X className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-600 dark:text-neutral-300 font-medium block mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-3 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-600 dark:text-neutral-300 font-medium block mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-3 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-orange-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:text-neutral-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] text-white rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-md hover:shadow-orange-500/20"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL (usuario autenticado)
  // ============================================
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800/50 dark:bg-neutral-900 transition-colors duration-300">
      {/* Notificación Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Banner de error de conexión */}
      {firestoreError && (
        <div className="bg-red-600 text-white text-center text-sm py-2 px-4 sticky top-0 z-50 flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          <span>Sin conexión a la base de datos — Los cambios podrían no guardarse</span>
          <button onClick={() => setFirestoreError(null)} className="ml-2 hover:bg-red-700 rounded p-0.5"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-3 sm:px-4 py-3 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <img src={LOGO_AFOR} alt="AFOR" className="h-6 sm:h-8" />
            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] sm:text-xs">INTRANET</span>
          </div>

          <nav className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-end">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm transition-colors touch-manipulation ${
                  currentPage === item.id || (item.id === 'proyectos' && currentPage === 'proyecto-detail')
                    ? 'bg-orange-600 text-white active:bg-orange-700'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.locked && <Lock className="w-3 h-3" />}
              </button>
            ))}
            {/* Indicador de usuarios en línea */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 ml-1 transition-colors"
                title={`${usuariosOnline.length} usuario${usuariosOnline.length !== 1 ? 's' : ''} en línea`}
              >
                <div className="relative">
                  <Wifi className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1.5 bg-green-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-medium">
                    {usuariosOnline.length}
                  </span>
                </div>
                <span className="hidden sm:inline">En línea</span>
              </button>
              {/* Dropdown con usuarios */}
              <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Usuarios conectados</span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {usuariosOnline.length === 0 ? (
                    <p className="p-3 text-sm text-neutral-500 text-center">Nadie más está en línea</p>
                  ) : (
                    usuariosOnline.map(user => {
                      const presencia = presenciaUsuarios.find(p => p.profesionalId === user.id);
                      return (
                        <div key={user.id} className="px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                                {user.nombre?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                              {user.nombre?.split(' ')[0]}
                              {user.id === currentUser?.profesionalId && <span className="text-neutral-400 ml-1">(Tú)</span>}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {presencia?.pagina || 'Navegando'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            {/* Botón de modo oscuro */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 ml-1 transition-colors"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Botón de logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 ml-1 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'proyectos' && <ProyectosPage />}
        {currentPage === 'horas' && <HorasPage />}
        {currentPage === 'tareas' && <TareasPage />}
        {currentPage === 'facturacion' && <FacturacionPage />}
        {currentPage === 'config' && (
          <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Configuración</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Administra profesionales y ajustes del sistema</p>
              </div>
            </div>
            
            {/* Tabs de configuración */}
            <div className="flex gap-2 mb-6 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
              {[
                { id: 'profesionales', label: 'Profesionales', icon: Users },
                { id: 'plazos', label: 'Plazos', icon: Calendar },
                { id: 'seguridad', label: 'Seguridad', icon: Lock },
                { id: 'backup', label: 'Backup', icon: Database },
                { id: 'sistema', label: 'Sistema', icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    configTab === tab.id 
                      ? 'border-orange-500 text-orange-600' 
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab: Profesionales */}
            {configTab === 'profesionales' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                    {profesionales.length} profesional{profesionales.length !== 1 ? 'es' : ''} registrado{profesionales.length !== 1 ? 's' : ''}
                  </p>
                  <Button onClick={() => setShowNewProfesional(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                
                {/* Formulario nuevo profesional */}
                {showNewProfesional && (
                  <Card className="p-4 border-2 border-orange-200 bg-orange-50/50">
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-3">Nuevo Profesional</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          placeholder="Ej: Juan Pérez"
                          value={newProfesional.nombre}
                          onChange={e => setNewProfesional(prev => ({ ...prev, nombre: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Cargo</label>
                        <input
                          type="text"
                          placeholder="Ej: Arquitecto"
                          value={newProfesional.cargo}
                          onChange={e => setNewProfesional(prev => ({ ...prev, cargo: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Categoría</label>
                        <select
                          value={newProfesional.categoria}
                          onChange={e => setNewProfesional(prev => ({ ...prev, categoria: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                        >
                          {categoriasProfesional.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Tarifa Interna (UF/hr)</label>
                        <input
                          type="number"
                          step="0.05"
                          placeholder="0.5"
                          value={newProfesional.tarifaInterna}
                          onChange={e => setNewProfesional(prev => ({ ...prev, tarifaInterna: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Credenciales de acceso */}
                    <div className="border-t border-orange-200 pt-3 mt-3">
                      <p className="text-xs font-medium text-orange-600 mb-2">🔐 Credenciales de Acceso</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Email</label>
                          <input
                            type="email"
                            placeholder="usuario@matriz.cl"
                            value={newProfesional.email}
                            onChange={e => setNewProfesional(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Contraseña</label>
                          <input
                            type="text"
                            placeholder="Contraseña inicial"
                            value={newProfesional.password}
                            onChange={e => setNewProfesional(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-4">
                      <Button variant="secondary" onClick={() => setShowNewProfesional(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddProfesional} disabled={!newProfesional.nombre.trim() || !newProfesional.cargo.trim() || !newProfesional.email.trim() || !newProfesional.password.trim()}>
                        <Check className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </Card>
                )}
                
                {/* Lista de profesionales */}
                <div className="space-y-3">
                  {profesionales.map(col => {
                    const usuarioCol = usuarios.find(u => u.profesionalId === col.id);
                    const proyectosAsig = col.proyectosAsignados || [];
                    return (
                    <Card key={col.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-medium text-sm">{col.iniciales}</span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-100">{col.nombre}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{col.cargo} • {col.categoria}</p>
                            {usuarioCol && (
                              <p className="text-xs text-blue-500">🔐 {usuarioCol.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden sm:block">
                            {col.tarifaInterna} UF/hr
                          </span>
                          <button
                            onClick={() => {
                              setProfesionalToEdit({ ...col });
                              setEditProfesionalOpen(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 text-neutral-400 dark:text-neutral-500 hover:text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteProfesional(col.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-neutral-400 dark:text-neutral-500 hover:text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Proyectos asignados */}
                      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                        <p className="text-xs font-medium text-neutral-500 mb-2">📁 Proyectos asignados:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proyectosAsig.length === 0 ? (
                            <span className="text-xs text-neutral-400 italic">Sin proyectos asignados</span>
                          ) : (
                            proyectosAsig.map(pId => {
                              const proy = proyectos.find(p => p.id === pId);
                              return (
                                <span key={pId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {pId}
                                  <button
                                    onClick={async () => {
                                      const nuevosProyectos = proyectosAsig.filter(id => id !== pId);
                                      const colActualizado = { ...col, proyectosAsignados: nuevosProyectos };
                                      await saveColaborador(colActualizado);
                                      showNotification('success', `Proyecto ${pId} removido`);
                                    }}
                                    className="hover:text-red-500"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })
                          )}
                          {/* Selector para agregar proyecto */}
                          <select
                            className="text-xs border border-neutral-200 rounded px-1.5 py-0.5 bg-white dark:bg-neutral-700 dark:border-neutral-600"
                            value=""
                            onChange={async (e) => {
                              const pId = e.target.value;
                              if (pId && !proyectosAsig.includes(pId)) {
                                const nuevosProyectos = [...proyectosAsig, pId];
                                const colActualizado = { ...col, proyectosAsignados: nuevosProyectos };
                                await saveColaborador(colActualizado);
                                showNotification('success', `Proyecto ${pId} asignado`);
                              }
                            }}
                          >
                            <option value="">+ Agregar...</option>
                            {proyectos.filter(p => !proyectosAsig.includes(p.id)).map(p => (
                              <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </Card>
                  );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Plazos (Duraciones por tipo de documento) */}
            {configTab === 'plazos' && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-1">Duración REV_A por Tipo de Documento</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Días hábiles para completar la primera revisión (REV_A). Entregables con la misma secuencia se trabajan en paralelo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(duracionesPorTipo).map(([tipo, dias]) => (
                      <div key={tipo} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                        <div className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                          tipo === 'DOC' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                          tipo.includes('PLA') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                          tipo.includes('REU') ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                          tipo === 'VIS' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                          tipo === 'INF' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                          'bg-neutral-200 text-neutral-700'
                        }`}>
                          {tipo}
                        </div>
                        <div className="flex-1 text-sm text-neutral-600 dark:text-neutral-300">
                          {tipo === 'DOC' ? 'Documentos (Criterios, EETT, MTO)' :
                           tipo === 'PLA' ? 'Planos Generales' :
                           tipo === 'PLA DET' ? 'Planos de Detalle' :
                           tipo === 'INF' ? 'Informes' :
                           tipo === 'REU INT' ? 'Reunión Interna' :
                           tipo === 'REU CTTAL' ? 'Reunión Contractual' :
                           tipo === 'REU' ? 'Reunión (genérico)' :
                           tipo === 'VIS' ? 'Visita' : tipo}
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={dias}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 1;
                              setDuracionesPorTipo(prev => ({ ...prev, [tipo]: val }));
                            }}
                            className="w-16 text-center px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-sm bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100"
                          />
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">días</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-1">Duración REV_B y REV_0</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Días hábiles para completar la revisión después de recibir comentarios. Se aplica igual a REV_B y REV_0.
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div className="px-2 py-1 rounded text-xs font-mono font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      REV_B / REV_0
                    </div>
                    <div className="flex-1 text-sm text-neutral-600 dark:text-neutral-300">
                      Correcciones post-comentarios
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={duracionRevision}
                        onChange={e => setDuracionRevision(parseInt(e.target.value) || 3)}
                        className="w-16 text-center px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-sm bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100"
                      />
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">días</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">Entregables Simultáneos</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Los entregables que comparten la misma secuencia de entrega se trabajan en paralelo.
                        Por ejemplo: 3 PLA DET con secuencia 5 = {duracionesPorTipo['PLA DET']} días (no {duracionesPorTipo['PLA DET'] * 3} días).
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      const ok = await saveDuraciones(duracionesPorTipo, duracionRevision);
                      if (ok) {
                        showNotification('success', 'Duraciones guardadas correctamente');
                      } else {
                        showNotification('error', 'Error al guardar duraciones');
                      }
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                  <Button
                    onClick={async () => {
                      setDuracionesPorTipo({ ...DURACION_POR_TIPO_DEFAULT });
                      setDuracionRevision(DURACION_REVISION_DEFAULT);
                      await saveDuraciones({ ...DURACION_POR_TIPO_DEFAULT }, DURACION_REVISION_DEFAULT);
                      showNotification('success', 'Duraciones restauradas y guardadas');
                    }}
                    className="bg-neutral-500 hover:bg-neutral-600"
                  >
                    Restaurar Valores por Defecto
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Seguridad */}
            {configTab === 'seguridad' && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Cambiar Contraseña Admin
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Para cambiar tu contraseña de acceso a la intranet, ingresa tu contraseña actual.
                  </p>
                  <div className="space-y-3 max-w-sm">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Contraseña Actual</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentAdminPassword}
                        onChange={e => setCurrentAdminPassword(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Nueva Contraseña</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={e => setNewAdminPassword(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (currentAdminPassword !== adminStoredPassword) {
                          showNotification('error', 'La contraseña actual es incorrecta');
                          return;
                        }
                        if (newAdminPassword.trim().length < 4) {
                          showNotification('error', 'La nueva contraseña debe tener al menos 4 caracteres');
                          return;
                        }
                        setAdminStoredPassword(newAdminPassword.trim());
                        showNotification('success', 'Contraseña de admin actualizada correctamente');
                        setCurrentAdminPassword('');
                        setNewAdminPassword('');
                      }}
                      disabled={!currentAdminPassword.trim() || !newAdminPassword.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Contraseña
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Tab: Sistema */}
            {configTab === 'backup' && (
              <div className="space-y-4">
                {/* Backup Manual */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-5 h-5 text-orange-500" />
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-100">Respaldo de Datos</h3>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Descarga una copia completa de todos los datos de la intranet (proyectos, colaboradores, horas, tareas y avances).
                    Guárdala en un lugar seguro para poder restaurar en caso de emergencia.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={async () => {
                        try {
                          const backup = await exportFullBackup();
                          const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `backup_afor_intranet_${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          setNotification({ type: 'success', message: `Backup descargado — ${backup._meta.totalProyectos} proyectos, ${backup._meta.totalColaboradores} colaboradores, ${backup._meta.totalHoras} registros de horas` });
                          setTimeout(() => setNotification(null), 5000);
                        } catch (err) {
                          setNotification({ type: 'error', message: 'Error al generar backup: ' + err.message });
                          setTimeout(() => setNotification(null), 5000);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Backup
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const backup = await exportFullBackup();
                          await saveAutoBackup(backup);
                          setNotification({ type: 'success', message: `Backup guardado en la nube — ${backup._meta.totalProyectos} proyectos, ${backup._meta.totalHoras} horas` });
                          setTimeout(() => setNotification(null), 5000);
                        } catch (err) {
                          setNotification({ type: 'error', message: 'Error al guardar backup en la nube: ' + err.message });
                          setTimeout(() => setNotification(null), 5000);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Guardar en la Nube
                    </button>
                  </div>
                </Card>

                {/* Restaurar Backup */}
                <Card className="p-4 border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="w-5 h-5 text-amber-600" />
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-100">Restaurar Datos</h3>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Restaura datos desde un archivo de backup previamente descargado.
                    <strong className="text-amber-700"> Esto sobrescribirá los datos actuales.</strong>
                  </p>
                  <label className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer w-fit">
                    <Upload className="w-4 h-4" />
                    Seleccionar archivo de backup
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          const text = await file.text();
                          const backup = JSON.parse(text);
                          if (!backup._meta || !backup.proyectos) {
                            throw new Error('Archivo no es un backup válido de AFOR Intranet');
                          }
                          if (!confirm(`¿Restaurar backup del ${new Date(backup._meta.fecha).toLocaleDateString('es-CL')}?\n\nContenido:\n• ${backup._meta.totalProyectos} proyectos\n• ${backup._meta.totalColaboradores} colaboradores\n• ${backup._meta.totalHoras} registros de horas\n• ${backup._meta.totalTareas || 0} tareas\n\nEsto sobrescribirá los datos actuales.`)) return;
                          const result = await restoreFromBackup(backup);
                          setNotification({ type: 'success', message: `Restauración completa — ${result.proyectos} proyectos, ${result.colaboradores} colaboradores, ${result.horas} horas restauradas` });
                          setTimeout(() => setNotification(null), 6000);
                        } catch (err) {
                          setNotification({ type: 'error', message: 'Error al restaurar: ' + err.message });
                          setTimeout(() => setNotification(null), 5000);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </Card>
              </div>
            )}

            {configTab === 'sistema' && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-3">Información del Sistema</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Versión</span>
                      <span className="text-neutral-800 dark:text-neutral-100 font-mono">AFOR Intranet v1.1</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Proyectos</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{proyectos.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Profesionales</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{profesionales.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Horas Registradas</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{horasRegistradas.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-500 dark:text-neutral-400">Última actualización</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{new Date().toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 border-red-200 bg-red-50">
                  <h3 className="font-medium text-red-800 mb-2">Zona de Peligro</h3>
                  <p className="text-sm text-red-600 mb-3">
                    Estas acciones son irreversibles. Procede con precaución.
                  </p>
                  <Button 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => setResetConfirmOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reiniciar Datos
                  </Button>
                </Card>
              </div>
            )}
            
            {/* Modal editar profesional */}
            {editProfesionalOpen && profesionalToEdit && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Pencil className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Editar Profesional</h2>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={profesionalToEdit.nombre}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Cargo</label>
                      <input
                        type="text"
                        value={profesionalToEdit.cargo}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, cargo: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Categoría</label>
                      <select
                        value={profesionalToEdit.categoria}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, categoria: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {categoriasProfesional.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Tarifa Interna (UF/hr)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={profesionalToEdit.tarifaInterna}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, tarifaInterna: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Nueva Contraseña (opcional)</label>
                      <input
                        type="password"
                        placeholder="Dejar vacío para mantener actual"
                        value={profesionalToEdit.newPassword || ''}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Solo el admin puede establecer contraseñas</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => {
                      setEditProfesionalOpen(false);
                      setProfesionalToEdit(null);
                    }}>
                      Cancelar
                    </Button>
                    <Button className="flex-1" onClick={handleSaveProfesional}>
                      <Check className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Modal confirmar reinicio */}
            {resetConfirmOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">¿Reiniciar todos los datos?</h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      Se eliminarán permanentemente:
                    </p>
                    <ul className="text-sm text-red-600 mt-2 space-y-1">
                      <li>• Todos los proyectos ({proyectos.length})</li>
                      <li>• Todas las horas registradas ({horasRegistradas.length})</li>
                      <li>• Profesionales se restablecerán a valores iniciales</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => setResetConfirmOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        setProyectos([]);
                        setHorasRegistradas([]);
                        setProfesionales(COLABORADORES_INICIAL);
                        setResetConfirmOpen(false);
                        setCurrentPage('home');
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sí, Reiniciar
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
        {currentPage === 'proyecto-detail' && (() => {
          const proyecto = proyectos.find(p => p.id === selectedProject);
          if (!proyecto) {
            return (
              <div className="text-center py-12">
                <p className="text-neutral-500 dark:text-neutral-400">Proyecto no encontrado</p>
                <button onClick={() => setCurrentPage('home')} className="mt-4 px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
                  ← Volver al inicio
                </button>
              </div>
            );
          }
          return (
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-3">
                <button 
                  onClick={() => setCurrentPage('home')} 
                  className="flex items-center gap-1 px-3 py-2.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 active:bg-neutral-300 dark:active:bg-neutral-500 rounded text-sm text-neutral-700 dark:text-neutral-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-orange-500 font-mono text-sm sm:text-lg font-semibold">{proyecto.id}</span>
                      <Badge variant="success">{proyecto.estado}</Badge>
                    </div>
                    <h1 className="text-sm sm:text-xl text-neutral-800 dark:text-neutral-100 font-medium mt-1">{proyecto.nombre}</h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{proyecto.cliente}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setTempDate(dashboardStartDate); setEditDateOpen(true); }} 
                    className="flex items-center gap-1 px-2 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 active:bg-neutral-300 dark:active:bg-neutral-500 rounded text-xs text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
                  >
                    <Calendar className="w-3 h-3" />
                    <span className="hidden sm:inline">Inicio:</span>
                    <span>{dashboardStartDate.split('-').reverse().join('/')}</span>
                    <Pencil className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="grid grid-cols-4 gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                <button
                  onClick={() => setDashboardTab('resumen')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'resumen' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Resumen</span>
                </button>
                <button
                  onClick={() => setDashboardTab('control')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'control' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Control</span>
                </button>
                <button
                  onClick={() => setDashboardTab('log')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'log' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Log</span>
                </button>
                <button
                  onClick={() => setDashboardTab('gantt')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'gantt' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Carta</span>
                </button>
              </div>
              
              {/* Contenido de tabs */}
              {(() => {
                // Obtener entregables del proyecto específico o usar los por defecto
                const proyectoActual = proyectos.find(p => p.id === selectedProject);
                const entregablesProyecto = proyectoActual?.entregables || ENTREGABLES_PROYECTO;
                const usaEntregablesPersonalizados = proyectoActual?.entregables?.length > 0;

                // Calcular deliverables y stats
                const deliverables = entregablesProyecto.map(d => {
                  const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart || d.secuencia, obtenerDuracionRevA(d, duracionesPorTipo), duracionRevision, duracionRevision);
                  // Usar clave compuesta para proyectos con entregables personalizados
                  const statusKey = usaEntregablesPersonalizados ? `${selectedProject}_${d.id}` : d.id;
                  const status = statusData[statusKey];
                  const statusInfo = calculateStatus(status, deadlines);
                  return { ...d, ...deadlines, status, statusInfo, statusKey };
                });
                
                const stats = {
                  total: deliverables.length,
                  completed: deliverables.filter(d => d.statusInfo.status === 'TERMINADO').length,
                  inProgress: deliverables.filter(d => d.statusInfo.status === 'En Proceso').length,
                  delayed: deliverables.filter(d => d.statusInfo.status === 'ATRASADO').length,
                  pending: deliverables.filter(d => d.statusInfo.status === 'Pendiente').length,
                  frozen: deliverables.filter(d => d.frozen).length,
                };

                return (
                  <>
                    {/* Tab: Resumen */}
                    {dashboardTab === 'resumen' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600 dark:text-neutral-300" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{stats.total}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Total</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Listos</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-orange-500">{stats.inProgress}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Proceso</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-red-500">{stats.delayed}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Atrasados</p>
                              </div>
                            </div>
                          </Card>
                        </div>
                        
                        <Card className="p-3 sm:p-4">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm mb-1">Progreso General</h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-3">Estado de entregables</p>
                          <div className="space-y-2">
                            <ProgressBar label="Completados" value={stats.completed} total={stats.total} color="bg-green-500" />
                            <ProgressBar label="En Proceso" value={stats.inProgress} total={stats.total} color="bg-orange-500" />
                            <ProgressBar label="Atrasados" value={stats.delayed} total={stats.total} color="bg-red-500" />
                            <ProgressBar label="Pendientes" value={stats.pending} total={stats.total} color="bg-neutral-400" />
                          </div>
                        </Card>
                        
                        {/* Curva S */}
                        <Card className="p-3 sm:p-4">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm mb-1">Curva S - Avance del Proyecto</h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-3">Comparación avance proyectado vs real</p>
                          {(() => {
                            const weeksToShow = 20;
                            const chartWidth = 550;
                            const chartHeight = 150;
                            const padding = { top: 20, right: 70, bottom: 30, left: 35 };
                            
                            // Calcular avance proyectado (curva S típica)
                            const projectedData = [];
                            for (let w = 0; w <= weeksToShow; w++) {
                              // Curva S usando función sigmoide
                              const progress = 100 / (1 + Math.exp(-0.5 * (w - weeksToShow / 2)));
                              projectedData.push({ week: w, value: progress });
                            }
                            
                            // Calcular semanas del año (continuidad anual)
                            const startDate = new Date(dashboardStartDate);
                            const today = new Date();
                            const startWeekOfYear = getWeekOfYear(startDate); // Semana del año en que inició el proyecto
                            const currentWeekOfYearValue = getCurrentWeekOfYear(); // Semana actual del año

                            // Semana relativa al proyecto (para cálculos internos)
                            const diffTime = today - startDate;
                            const projectWeek = Math.max(1, Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000)));

                            // La posición en el gráfico es relativa al proyecto
                            const currentWeek = projectWeek;

                            // Calcular avance real basado en entregas completadas
                            const realData = [];
                            const totalEntregables = stats.total || deliverables.length || 1;
                            for (let w = 0; w <= Math.min(currentWeek, weeksToShow); w++) {
                              // Contar entregables completados hasta esta semana
                              const completedThisWeek = deliverables.filter(d => {
                                // Considerar completado si tiene Rev0, RevB o RevA
                                const hasProgress = d.status?.sentRev0 || d.status?.sentRevB || d.status?.sentRevA || d.status?.sentIniciado;
                                if (!hasProgress) return false;
                                // Si tiene fecha, verificar si es antes de esta semana
                                const completedDate = d.status?.sentRev0Date ? new Date(d.status.sentRev0Date) :
                                                     d.status?.sentRevBDate ? new Date(d.status.sentRevBDate) :
                                                     d.status?.sentRevADate ? new Date(d.status.sentRevADate) : today;
                                const weeksSinceStart = Math.floor((completedDate - startDate) / (7 * 24 * 60 * 60 * 1000));
                                return weeksSinceStart <= w;
                              }).length;
                              const cumulativeReal = (completedThisWeek / totalEntregables) * 100;
                              realData.push({ week: w, value: cumulativeReal });
                            }
                            
                            // Escalas
                            const xScale = (w) => padding.left + (w / weeksToShow) * (chartWidth - padding.left - padding.right);
                            const yScale = (v) => chartHeight - padding.bottom - (v / 100) * (chartHeight - padding.top - padding.bottom);
                            
                            // Generar path para curva proyectada
                            const projectedPath = projectedData.map((p, i) => 
                              `${i === 0 ? 'M' : 'L'} ${xScale(p.week)} ${yScale(p.value)}`
                            ).join(' ');
                            
                            // Generar path para curva real
                            const realPath = realData.length > 0 ? realData.map((p, i) => 
                              `${i === 0 ? 'M' : 'L'} ${xScale(p.week)} ${yScale(p.value)}`
                            ).join(' ') : null;
                            
                            // Valores para mostrar
                            const projectedAtCurrentWeek = currentWeek <= weeksToShow 
                              ? projectedData.find(p => p.week === currentWeek)?.value || 0 
                              : 100;
                            const realFinal = realData.length > 0 ? realData[realData.length - 1].value : 0;
                            const difference = realFinal - projectedAtCurrentWeek;
                            
                            return (
                              <div>
                                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                                  {/* Grid horizontal */}
                                  {[0, 25, 50, 75, 100].map(v => (
                                    <g key={v}>
                                      <line x1={padding.left} y1={yScale(v)} x2={chartWidth - padding.right} y2={yScale(v)} stroke="#e5e7eb" strokeWidth="1" />
                                      <text x={padding.left - 5} y={yScale(v) + 3} textAnchor="end" fontSize="8" fill="#9ca3af" fontWeight="300">{v}%</text>
                                    </g>
                                  ))}

                                  {/* Etiquetas semanas del año (continuidad anual) */}
                                  {Array.from({ length: weeksToShow + 1 }, (_, i) => i).map(w => (
                                    <text key={w} x={xScale(w)} y={chartHeight - 15} textAnchor="middle" fontSize="7" fill="#9ca3af" fontWeight="300">S{startWeekOfYear + w}</text>
                                  ))}
                                  
                                  {/* Línea vertical HOY - muestra semana del año */}
                                  {currentWeek >= 0 && currentWeek <= weeksToShow && (
                                    <>
                                      <line x1={xScale(currentWeek)} y1={padding.top} x2={xScale(currentWeek)} y2={chartHeight - padding.bottom} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
                                      <text x={xScale(currentWeek)} y={padding.top - 5} textAnchor="middle" fontSize="7" fill="#ef4444" fontWeight="500">S{currentWeekOfYearValue}</text>
                                    </>
                                  )}

                                  {/* Curva proyectada */}
                                  <path d={projectedPath} fill="none" stroke="#f97316" strokeWidth="2.5" />

                                  {/* Curva real - siempre mostrar si hay datos */}
                                  {realPath && realData.length > 0 && <path d={realPath} fill="none" stroke="#22c55e" strokeWidth="2.5" />}

                                  {/* Leyenda */}
                                  <g transform={`translate(${chartWidth - padding.right + 8}, ${padding.top + 10})`}>
                                    <line x1="0" y1="0" x2="12" y2="0" stroke="#f97316" strokeWidth="2" />
                                    <text x="16" y="3" fontSize="8" fill="#6b7280" fontWeight="300">Proyectado</text>
                                    <line x1="0" y1="16" x2="12" y2="16" stroke="#22c55e" strokeWidth="2" />
                                    <text x="16" y="19" fontSize="8" fill="#6b7280" fontWeight="300">Real</text>
                                  </g>
                                </svg>
                                
                                {/* Resumen numérico */}
                                <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                  <div className="text-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Proyectado</div>
                                    <div className="text-base font-medium text-orange-500">{projectedAtCurrentWeek.toFixed(1)}%</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Real</div>
                                    <div className="text-base font-medium text-green-500">{realFinal.toFixed(1)}%</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Diferencia</div>
                                    <div className={`text-base font-medium ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </Card>
                        
                        <div className="space-y-2">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm">Detalle por Estado</h3>
                          <Accordion title="Completados" count={stats.completed} color="bg-green-500">
                            {deliverables.filter(d => d.statusInfo.status === 'TERMINADO').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span>{d.nombre || d.name}<span className="text-green-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-green-600 text-xs">✓ Completado</span>
                              </div>
                            ))}
                            {stats.completed === 0 && <p className="text-neutral-500 dark:text-neutral-400">Ninguno</p>}
                          </Accordion>
                          <Accordion title="En Proceso" count={stats.inProgress} color="bg-orange-500">
                            {deliverables.filter(d => d.statusInfo.status === 'En Proceso').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span>{d.nombre || d.name}<span className="text-orange-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-orange-600 text-xs">En proceso</span>
                              </div>
                            ))}
                            {stats.inProgress === 0 && <p className="text-neutral-500 dark:text-neutral-400">Ninguno</p>}
                          </Accordion>
                          <Accordion title="Atrasados" count={stats.delayed} color="bg-red-500">
                            {deliverables.filter(d => d.statusInfo.status === 'ATRASADO').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span>{d.nombre || d.name}<span className="text-red-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-red-600 text-xs">⚠ Atrasado</span>
                              </div>
                            ))}
                            {stats.delayed === 0 && <p className="text-neutral-500 dark:text-neutral-400">Ninguno</p>}
                          </Accordion>
                          <Accordion title="Frozen" count={stats.frozen} color="bg-blue-500">
                            {deliverables.filter(d => d.frozen).map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span>{d.nombre || d.name}<span className="text-blue-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-blue-600 text-xs">❄ Frozen</span>
                              </div>
                            ))}
                            {stats.frozen === 0 && <p className="text-neutral-500 dark:text-neutral-400">Ninguno</p>}
                          </Accordion>
                        </div>
                      </div>
                    )}
                    
                    {/* Tab: Control de Avance */}
                    {dashboardTab === 'control' && (
                      <Card className="overflow-hidden">
                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Control de Avance</h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs">Marca los checkboxes para actualizar estados</p>
                          <p className="text-orange-500 text-xs mt-1 sm:hidden">← Desliza para ver más →</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs" style={{ minWidth: '900px' }}>
                            <thead>
                              <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                <th className="p-2 text-center font-medium">#</th>
                                <th className="p-2 text-left font-medium">Código</th>
                                <th className="p-2 text-left font-medium min-w-[120px]">Descripción</th>
                                <th className="p-2 text-center font-medium">Sem</th>
                                <th className="p-2 text-center font-medium">Dur</th>
                                <th className="p-2 text-center font-medium">Ini</th>
                                <th className="p-2 text-center font-medium">A</th>
                                <th className="p-2 text-center font-medium">Deadline</th>
                                <th className="p-2 text-center font-medium">Com</th>
                                <th className="p-2 text-center font-medium">B</th>
                                <th className="p-2 text-center font-medium">Deadline</th>
                                <th className="p-2 text-center font-medium">Com</th>
                                <th className="p-2 text-center font-medium">0</th>
                                <th className="p-2 text-center font-medium">Deadline</th>
                                <th className="p-2 text-center font-medium">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {deliverables.map((d, i) => (
                                <tr key={d.id} className={`border-b border-neutral-200 dark:border-neutral-700 ${d.frozen ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : i % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/50' : ''}`}>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{d.id}</td>
                                  <td className={`p-2 text-neutral-600 dark:text-neutral-300 font-mono text-xs ${d.frozen ? 'line-through' : ''}`}>{d.codigo || '-'}</td>
                                  <td className={`p-2 text-neutral-800 dark:text-neutral-100 font-medium text-xs ${d.frozen ? 'line-through' : ''}`}>
                                    {d.nombre || d.name}
                                    {d.frozen && <Snowflake className="w-3 h-3 inline ml-1 text-blue-400" />}
                                  </td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">S{getWeekOfYear(new Date(dashboardStartDate)) + (d.weekStart || d.secuencia) - 1}</td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400 font-mono text-[10px]">{d.frozen ? '-' : `${obtenerDuracionRevA(d, duracionesPorTipo)}d`}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.sentIniciado} onChange={v => handleCheck(d.statusKey, 'sentIniciado', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.sentRevA} onChange={v => handleCheck(d.statusKey, 'sentRevA', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{formatDateShort(d.deadlineRevA)}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.comentariosARecibidos} onChange={v => handleCheck(d.statusKey, 'comentariosARecibidos', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.sentRevB} onChange={v => handleCheck(d.statusKey, 'sentRevB', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{formatDateShort(d.deadlineRevB)}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.comentariosBRecibidos} onChange={v => handleCheck(d.statusKey, 'comentariosBRecibidos', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.sentRev0} onChange={v => handleCheck(d.statusKey, 'sentRev0', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{formatDateShort(d.deadlineRev0)}</td>
                                  <td className="p-2 text-center">
                                    {d.frozen ? (
                                      <DashboardBadge variant="default">CONGELADO</DashboardBadge>
                                    ) : (
                                      <DashboardBadge variant={d.statusInfo.status === 'TERMINADO' ? 'success' : d.statusInfo.status === 'ATRASADO' ? 'danger' : d.statusInfo.status === 'En Proceso' ? 'warning' : 'default'}>
                                        {d.statusInfo.status}
                                      </DashboardBadge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}
                    
                    {/* Tab: Log de Avance */}
                    {dashboardTab === 'log' && (
                      <Card className="overflow-hidden">
                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Log de Avance</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-xs">Fechas de envío por revisión</p>
                          </div>
                          <button 
                            onClick={() => setPdfPreviewOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded text-xs font-medium transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                            <span>Exportar PDF</span>
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                <th className="p-2 text-center font-medium">#</th>
                                <th className="p-2 text-left font-medium">Código</th>
                                <th className="p-2 text-left font-medium">Descripción</th>
                                <th className="p-2 text-center font-medium">REV_A</th>
                                <th className="p-2 text-center font-medium">REV_B</th>
                                <th className="p-2 text-center font-medium">REV_0</th>
                                <th className="p-2 text-center font-medium">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {deliverables.map((d, i) => (
                                <tr key={d.id} className={`border-b border-neutral-200 dark:border-neutral-700 ${d.frozen ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : i % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/50' : ''}`}>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{d.id}</td>
                                  <td className={`p-2 text-neutral-600 dark:text-neutral-300 font-mono text-xs ${d.frozen ? 'line-through' : ''}`}>{d.codigo || '-'}</td>
                                  <td className={`p-2 text-neutral-800 dark:text-neutral-100 ${d.frozen ? 'line-through' : ''}`}>
                                    {d.nombre || d.name}
                                    {d.frozen && <Snowflake className="w-3 h-3 inline ml-1 text-blue-400" />}
                                  </td>
                                  <td className={`p-2 text-center ${d.frozen ? 'text-neutral-400' : d.status?.sentRevADate ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {d.frozen ? '-' : d.status?.sentRevADate ? formatDateFull(d.status.sentRevADate) : '-'}
                                  </td>
                                  <td className={`p-2 text-center ${d.frozen ? 'text-neutral-400' : d.status?.sentRevBDate ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {d.frozen ? '-' : d.status?.sentRevBDate ? formatDateFull(d.status.sentRevBDate) : '-'}
                                  </td>
                                  <td className={`p-2 text-center ${d.frozen ? 'text-neutral-400' : d.status?.sentRev0Date ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {d.frozen ? '-' : d.status?.sentRev0Date ? formatDateFull(d.status.sentRev0Date) : '-'}
                                  </td>
                                  <td className="p-2 text-center">
                                    {d.frozen ? (
                                      <DashboardBadge variant="default">CONGELADO</DashboardBadge>
                                    ) : (
                                      <DashboardBadge variant={d.statusInfo.status === 'TERMINADO' ? 'success' : d.statusInfo.status === 'ATRASADO' ? 'danger' : d.statusInfo.status === 'En Proceso' ? 'warning' : 'default'}>
                                        {d.statusInfo.status}
                                      </DashboardBadge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}

                    {/* Tab: Gantt */}
                    {dashboardTab === 'gantt' && (
                      <Card className="overflow-hidden">
                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Carta Gantt</h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs">Visualización temporal del proyecto — desliza horizontalmente para ver más semanas</p>
                        </div>
                        <div className="p-3">
                          {(() => {
                            const startDate = new Date(dashboardStartDate);
                            const weeksToShow = 28;
                            const weekWidth = 34;
                            const rowHeight = 26;
                            const codeWidth = 120;
                            const nameWidth = 200;
                            const labelWidth = codeWidth + nameWidth;

                            // Usar semanas del año (continuidad anual)
                            const startWeekOfYear = getWeekOfYear(startDate);
                            const weeks = Array.from({ length: weeksToShow }, (_, i) => {
                              const weekDate = addWeeks(startDate, i);
                              return { num: startWeekOfYear + i, date: weekDate };
                            });

                            // Semana actual
                            const today = new Date();
                            const diffWeeks = Math.round((today - startDate) / (7 * 24 * 60 * 60 * 1000));
                            const currentWeekIdx = Math.min(Math.max(diffWeeks, 0), weeksToShow);

                            // Función para determinar el estado visual de cada entregable
                            const getGanttBars = (d) => {
                              const bars = [];
                              const revAWeek = d.weekStart || d.secuencia || 1;
                              const durRevA = obtenerDuracionRevA(d, duracionesPorTipo) / 5;
                              const durRevB = duracionRevision / 5;
                              const durRev0 = duracionRevision / 5;
                              const revBWeek = revAWeek + durRevA;
                              const rev0Week = revBWeek + durRevB;
                              const totalWidth = durRevA + durRevB + durRev0;

                              if (d.status?.sentRev0) {
                                bars.push({ start: revAWeek, width: totalWidth, color: 'bg-green-500', label: 'TERMINADO' });
                                return bars;
                              }
                              if (d.status?.sentIniciado || d.status?.sentRevA) {
                                bars.push({ start: revAWeek, width: Math.max(durRevA, 0.4), color: d.status?.sentRevA ? 'bg-green-500' : 'bg-orange-400', label: d.status?.sentRevA ? 'REV_A ✓' : 'REV_A en proceso' });
                              }
                              if (d.status?.comentariosARecibidos) {
                                bars.push({ start: revBWeek, width: Math.max(durRevB, 0.4), color: d.status?.sentRevB ? 'bg-green-500' : 'bg-blue-400', label: d.status?.sentRevB ? 'REV_B ✓' : 'REV_B en proceso' });
                              }
                              if (d.status?.comentariosBRecibidos) {
                                bars.push({ start: rev0Week, width: Math.max(durRev0, 0.4), color: 'bg-purple-400', label: 'REV_0 en proceso' });
                              }
                              return bars;
                            };

                            return (
                              <div className="relative">
                                {/* Contenedor con scroll horizontal - labels fijos */}
                                <div className="flex">
                                  {/* Columna fija: Código + Nombre */}
                                  <div className="flex-shrink-0 z-10" style={{ width: labelWidth }}>
                                    {/* Header fijo */}
                                    <div className="flex border-b border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800" style={{ height: '32px' }}>
                                      <div style={{ width: codeWidth }} className="px-2 flex items-center text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Código</div>
                                      <div style={{ width: nameWidth }} className="px-2 flex items-center text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Descripción</div>
                                    </div>
                                    {/* Filas fijas */}
                                    {deliverables.map((d, i) => (
                                      <div key={d.id} className={`flex border-b border-neutral-100 dark:border-neutral-700 ${d.frozen ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : i % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/50' : 'bg-white dark:bg-neutral-900'}`} style={{ height: rowHeight }}>
                                        <div style={{ width: codeWidth }} className={`px-2 flex items-center text-[9px] font-mono text-neutral-500 dark:text-neutral-400 truncate ${d.frozen ? 'line-through' : ''}`}>
                                          {d.codigo || '-'}
                                        </div>
                                        <div style={{ width: nameWidth }} className={`px-2 flex items-center gap-1 text-[10px] text-neutral-700 dark:text-neutral-200 ${d.frozen ? 'line-through' : ''}`}>
                                          {d.frozen ? (
                                            <Snowflake className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />
                                          ) : (
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.statusInfo.color}`} />
                                          )}
                                          <span className="truncate">{d.nombre || d.name}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Área de barras con scroll horizontal */}
                                  <div className="overflow-x-auto flex-1 border-l border-neutral-200 dark:border-neutral-700">
                                    <div style={{ width: weeksToShow * weekWidth }}>
                                      {/* Header de semanas */}
                                      <div className="flex border-b border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800" style={{ height: '32px' }}>
                                        {weeks.map(w => (
                                          <div key={w.num} style={{ width: weekWidth, minWidth: weekWidth }} className={`flex items-center justify-center text-[10px] border-l border-neutral-200 dark:border-neutral-700 ${w.num === startWeekOfYear + currentWeekIdx ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 font-bold' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                            S{w.num}
                                          </div>
                                        ))}
                                      </div>

                                      {/* Filas de barras */}
                                      {deliverables.map((d, i) => {
                                        const bars = d.frozen ? [] : getGanttBars(d);
                                        return (
                                          <div key={d.id} className={`flex relative border-b border-neutral-100 dark:border-neutral-700 ${d.frozen ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : i % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/50' : 'bg-white dark:bg-neutral-900'}`} style={{ height: rowHeight }}>
                                            {/* Grid de semanas */}
                                            {weeks.map(w => (
                                              <div key={w.num} style={{ width: weekWidth, minWidth: weekWidth }} className={`border-l ${w.num === startWeekOfYear + currentWeekIdx ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10' : 'border-neutral-100 dark:border-neutral-700'}`} />
                                            ))}

                                            {/* Barras de progreso */}
                                            {bars.map((bar, idx) => (
                                              bar.start <= weeksToShow && (
                                                <div
                                                  key={idx}
                                                  className={`absolute h-4 rounded-sm ${bar.color} flex items-center justify-center`}
                                                  style={{
                                                    left: (bar.start - 1) * weekWidth + 2,
                                                    width: Math.max(Math.min(bar.width, weeksToShow - bar.start + 1) * weekWidth - 4, 6),
                                                    top: (rowHeight - 16) / 2
                                                  }}
                                                  title={bar.label}
                                                >
                                                  {bar.width >= 1 && (
                                                    <span className="text-[7px] text-white font-medium truncate px-0.5">
                                                      {bar.color === 'bg-green-500' ? '✓' : ''}
                                                    </span>
                                                  )}
                                                </div>
                                              )
                                            ))}

                                            {/* Pendiente */}
                                            {bars.length === 0 && !d.frozen && (
                                              <div
                                                className="absolute h-4 rounded-sm bg-neutral-200 dark:bg-neutral-600 flex items-center"
                                                style={{
                                                  left: ((d.weekStart || d.secuencia || 1) - 1) * weekWidth + 2,
                                                  width: Math.max(obtenerDuracionRevA(d, duracionesPorTipo) / 5, 0.4) * weekWidth - 4,
                                                  top: (rowHeight - 16) / 2
                                                }}
                                                title={`Pendiente (${obtenerDuracionRevA(d, duracionesPorTipo)} días)`}
                                              >
                                                <span className="text-[7px] text-neutral-500 dark:text-neutral-300 px-0.5">{obtenerDuracionRevA(d, duracionesPorTipo)}d</span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Leyenda */}
                                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                  {[
                                    { color: 'bg-neutral-200', label: 'Pendiente' },
                                    { color: 'bg-orange-400', label: 'REV_A' },
                                    { color: 'bg-blue-400', label: 'REV_B' },
                                    { color: 'bg-purple-400', label: 'REV_0' },
                                    { color: 'bg-green-500', label: 'Completado' },
                                  ].map(l => (
                                    <div key={l.label} className="flex items-center gap-1">
                                      <div className={`w-4 h-2.5 ${l.color} rounded-sm`} />
                                      <span className="text-[10px] text-neutral-600 dark:text-neutral-300">{l.label}</span>
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-1 ml-2">
                                    <div className="w-4 h-2.5 bg-orange-100 border border-orange-300 rounded-sm" />
                                    <span className="text-[10px] text-neutral-600 dark:text-neutral-300">Semana actual</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </Card>
                    )}

                  </>
                );
              })()}
            </div>
          );
        })()}
      </main>

      {/* Modal Nuevo Proyecto - Inline para evitar pérdida de foco */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4">
          <Card className="w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neutral-800 dark:text-neutral-100 text-base sm:text-lg font-medium">Nuevo Proyecto</h2>
              <button
                onClick={() => setShowNewProject(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Código de Proyecto"
                placeholder="Ej: P2602"
                value={newProject.id}
                onChange={e => setNewProject(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
              />

              <Input
                label="Nombre del Proyecto"
                placeholder="Ej: Escondida - Fase 3"
                value={newProject.nombre}
                onChange={e => setNewProject(prev => ({ ...prev, nombre: e.target.value }))}
              />

              <Input
                label="Cliente"
                placeholder="Ej: BHP Billiton"
                value={newProject.cliente}
                onChange={e => setNewProject(prev => ({ ...prev, cliente: e.target.value }))}
              />

              <Input
                label="Jefe de Proyecto"
                placeholder="Ej: Juan Pérez"
                value={newProject.jefeProyecto}
                onChange={e => setNewProject(prev => ({ ...prev, jefeProyecto: e.target.value }))}
              />

              {/* Campo de carga de Excel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider">
                    Entregables (Excel) *
                  </label>
                  <a
                    href="/Entregables_Ejemplo.xlsx"
                    download="Entregables_Plantilla.xlsx"
                    className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <FileDown className="w-3 h-3" />
                    Descargar plantilla
                  </a>
                </div>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-neutral-400 dark:text-neutral-500 mb-2" />
                    {excelFileName ? (
                      <p className="text-sm text-green-600 font-medium">{excelFileName}</p>
                    ) : (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Click para subir Excel</p>
                    )}
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                      Columnas: Código, Descripción, Secuencia, REV_A (HsH), REV_B (HsH), REV_0 (HsH)
                    </p>
                  </label>
                </div>
                {excelError && (
                  <p className="text-xs text-red-500">{excelError}</p>
                )}
                {newProject.entregables.length > 0 && (
                  <p className="text-xs text-green-600">
                    ✓ {newProject.entregables.length} entregables cargados
                  </p>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowNewProject(false);
                    setExcelFileName('');
                    setExcelError('');
                  }}
                  className="flex-1 px-4 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-200 rounded font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  className={`flex-1 px-4 py-3 rounded font-medium text-sm transition-colors ${
                    newProject.id && newProject.nombre && newProject.entregables.length > 0
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-neutral-300 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                  }`}
                  disabled={!newProject.id || !newProject.nombre || newProject.entregables.length === 0}
                  onClick={async () => {
                    if (newProject.id && newProject.nombre && newProject.entregables.length > 0) {
                      // Crear proyecto con sus entregables personalizados
                      const nuevoProyecto = {
                        id: newProject.id,
                        nombre: newProject.nombre,
                        cliente: newProject.cliente,
                        jefeProyecto: newProject.jefeProyecto,
                        tarifaVenta: newProject.tarifaVenta,
                        estado: 'Activo',
                        inicio: new Date().toISOString().split('T')[0],
                        avance: 0,
                        entregables: newProject.entregables.map(e => ({
                          ...e,
                          weekStart: e.secuencia // Usar secuencia como weekStart
                        }))
                      };

                      // Guardar en Firestore
                      await saveProyecto(nuevoProyecto);

                      // Inicializar statusData para los nuevos entregables
                      const newStatusData = { ...statusData };
                      newProject.entregables.forEach(ent => {
                        const key = `${newProject.id}_${ent.id}`;
                        newStatusData[key] = {
                          sentIniciado: false,
                          sentRevA: false,
                          sentRevADate: null,
                          comentariosARecibidos: false,
                          comentariosARecibidosDate: null,
                          sentRevB: false,
                          sentRevBDate: null,
                          comentariosBRecibidos: false,
                          comentariosBRecibidosDate: null,
                          sentRev0: false,
                          sentRev0Date: null,
                        };
                      });
                      setStatusData(newStatusData);

                      // Limpiar formulario
                      setNewProject({ id: '', nombre: '', cliente: '', jefeProyecto: '', tarifaVenta: 1.2, entregables: [] });
                      setExcelFileName('');
                      setExcelError('');
                      setShowNewProject(false);
                      showNotification('success', 'Proyecto creado correctamente');
                    }
                  }}
                >
                  Crear Proyecto
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Editar Fecha de Inicio */}
      {editDateOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neutral-800 dark:text-neutral-100 text-lg font-medium">Editar Fecha de Inicio</h2>
              <button onClick={() => setEditDateOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full">
                <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            <Input 
              label="Fecha de Inicio del Proyecto"
              type="date"
              value={tempDate}
              onChange={e => setTempDate(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setEditDateOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={() => {
                setDashboardStartDate(tempDate);
                setEditDateOpen(false);
              }}>
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Preview PDF */}
      {pdfPreviewOpen && (
        <>
          <PrintStyles />
          <div className="fixed inset-0 bg-black/80 z-50 overflow-auto p-4">
            <div className="min-h-full flex flex-col items-center py-4">
              {/* Header del modal - sticky - NO IMPRIMIR */}
              <div className="no-print bg-white dark:bg-neutral-800 w-full max-w-5xl rounded-t-lg border-b border-neutral-200 dark:border-neutral-700 p-2 flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Vista Previa LOG (Horizontal)</h2>
                <div className="flex gap-2">
                  <Button onClick={() => window.print()}>
                    <FileDown className="w-4 h-4 mr-1" />
                    Imprimir
                  </Button>
                  <button
                    type="button"
                    onClick={() => setPdfPreviewOpen(false)}
                    className="p-1.5 hover:bg-neutral-200 rounded-full"
                  >
                    <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Contenedor de páginas para imprimir */}
              <div className="print-content">
                {/* CÁLCULOS COMPARTIDOS PARA TODAS LAS PÁGINAS */}
                {(() => {
                  const proyectoImpr = proyectos.find(p => p.id === selectedProject);
                  const entregablesImpr = proyectoImpr?.entregables || ENTREGABLES_PROYECTO;
                  const usaPersonalizados = proyectoImpr?.entregables?.length > 0;
                  const getStatusKey = (d) => usaPersonalizados ? `${selectedProject}_${d.id}` : d.id;

                  // Calcular datos para Curva S
                  const totalEntregables = entregablesImpr.filter(d => !d.frozen).length;
                  const startDate = new Date(dashboardStartDate);
                  const weeksToShow = 24;

                  // Curva programada: acumulado de entregables que deberían estar listos por semana
                  const programada = [];
                  // Curva real: acumulado de entregables efectivamente terminados por semana
                  const real = [];

                  for (let w = 0; w <= weeksToShow; w++) {
                    const weekDate = addWeeks(startDate, w);
                    // Programada: entregables cuyo deadline REV_0 es <= esta semana
                    let acumProg = 0;
                    entregablesImpr.forEach(d => {
                      if (d.frozen) return;
                      const dur = obtenerDuracionRevA(d, duracionesPorTipo);
                      const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart || d.secuencia, dur, duracionRevision, duracionRevision);
                      if (deadlines.deadlineRev0 <= weekDate) acumProg++;
                    });
                    programada.push(acumProg);

                    // Real: entregables que ya tienen sentRev0Date <= esta semana
                    let acumReal = 0;
                    entregablesImpr.forEach(d => {
                      if (d.frozen) return;
                      const status = statusData[getStatusKey(d)];
                      if (status?.sentRev0Date) {
                        const fecha = new Date(status.sentRev0Date);
                        if (fecha <= weekDate) acumReal++;
                      }
                    });
                    real.push(acumReal);
                  }

                  // Convertir a porcentaje
                  const progPct = programada.map(v => totalEntregables > 0 ? (v / totalEntregables * 100) : 0);
                  const realPct = real.map(v => totalEntregables > 0 ? (v / totalEntregables * 100) : 0);

                  // SVG dimensions
                  const svgW = 680;
                  const svgH = 200;
                  const padL = 35;
                  const padR = 10;
                  const padT = 15;
                  const padB = 25;
                  const chartW = svgW - padL - padR;
                  const chartH = svgH - padT - padB;

                  const xScale = (i) => padL + (i / weeksToShow) * chartW;
                  const yScale = (v) => padT + chartH - (v / 100) * chartH;

                  const progPath = progPct.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');
                  const realPath = realPct.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');

                  // Semana actual relativa al inicio
                  const today = new Date();
                  const diffWeeks = Math.round((today - startDate) / (7 * 24 * 60 * 60 * 1000));
                  const currentWeekIdx = Math.min(Math.max(diffWeeks, 0), weeksToShow);

                  // Stats
                  const statsCompleted = entregablesImpr.filter(d => !d.frozen && statusData[getStatusKey(d)]?.sentRev0).length;
                  const statsInProgress = entregablesImpr.filter(d => !d.frozen && statusData[getStatusKey(d)]?.sentIniciado && !statusData[getStatusKey(d)]?.sentRev0).length;
                  const statsDelayed = entregablesImpr.filter(d => {
                    if (d.frozen) return false;
                    const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart || d.secuencia, obtenerDuracionRevA(d, duracionesPorTipo), duracionRevision, duracionRevision);
                    return !statusData[getStatusKey(d)]?.sentRev0 && new Date() > deadlines.deadlineRevA;
                  }).length;
                  const avancePct = totalEntregables > 0 ? ((statsCompleted / totalEntregables) * 100).toFixed(0) : 0;

                  return (
                    <>
                {/* PÁGINA 1: Curva S + Resumen */}
                <div className="print-page-1 bg-white shadow-xl w-full max-w-5xl" style={{ padding: '20px 28px', aspectRatio: '11/8.5' }}>
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-orange-500 pb-2 mb-3">
                    <div>
                      <img src="/logo-afor.png" alt="AFOR" style={{ height: '36px' }} />
                      <span className="text-[7px] text-neutral-400 tracking-wider block">ASSETS FOR NON-PROCESS INFRASTRUCTURE</span>
                    </div>
                    <div className="text-right">
                      <h1 className="text-sm font-bold text-neutral-800 uppercase">Log de Avance</h1>
                      <p className="text-[8px] text-neutral-500">{selectedProject} • {new Date().toLocaleDateString('es-CL')}</p>
                    </div>
                  </div>

                  {/* Info del proyecto */}
                  <div className="flex gap-4 mb-3 p-2 bg-neutral-50 rounded text-[9px]">
                    <div className="flex-1">
                      <p><span className="text-neutral-500">Código:</span> <span className="font-bold text-orange-600">{selectedProject}</span></p>
                      <p><span className="text-neutral-500">Nombre:</span> {proyectoImpr?.nombre}</p>
                    </div>
                    <div className="flex-1">
                      <p><span className="text-neutral-500">Cliente:</span> {proyectoImpr?.cliente}</p>
                      <p><span className="text-neutral-500">Inicio:</span> {dashboardStartDate.split('-').reverse().join('/')}</p>
                    </div>
                    <div className="flex-1">
                      <p><span className="text-neutral-500">Fecha Informe:</span> {new Date().toLocaleDateString('es-CL')}</p>
                      <p><span className="text-neutral-500">Entregables:</span> {totalEntregables} documentos</p>
                    </div>
                  </div>

                  {/* Resumen cards */}
                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    <div className="text-center p-1.5 bg-neutral-100 rounded">
                      <p className="text-lg font-bold text-neutral-800">{totalEntregables}</p>
                      <p className="text-[7px] text-neutral-500">TOTAL</p>
                    </div>
                    <div className="text-center p-1.5 bg-green-50 rounded border border-green-200">
                      <p className="text-lg font-bold text-green-600">{statsCompleted}</p>
                      <p className="text-[7px] text-green-600">LISTOS</p>
                    </div>
                    <div className="text-center p-1.5 bg-orange-50 rounded border border-orange-200">
                      <p className="text-lg font-bold text-orange-500">{statsInProgress}</p>
                      <p className="text-[7px] text-orange-500">PROCESO</p>
                    </div>
                    <div className="text-center p-1.5 bg-red-50 rounded border border-red-200">
                      <p className="text-lg font-bold text-red-500">{statsDelayed}</p>
                      <p className="text-[7px] text-red-500">ATRASO</p>
                    </div>
                    <div className="text-center p-1.5 bg-blue-50 rounded border border-blue-200">
                      <p className="text-lg font-bold text-blue-600">{avancePct}%</p>
                      <p className="text-[7px] text-blue-600">AVANCE</p>
                    </div>
                  </div>

                  {/* CURVA S */}
                  <div className="border border-neutral-200 rounded p-2 mb-3">
                    <p className="text-[9px] font-semibold text-neutral-700 mb-1">Curva S — Avance Programado vs Real</p>
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto' }}>
                      {/* Grid horizontal */}
                      {[0, 25, 50, 75, 100].map(v => (
                        <g key={v}>
                          <line x1={padL} y1={yScale(v)} x2={svgW - padR} y2={yScale(v)} stroke="#e5e5e5" strokeWidth="0.5" />
                          <text x={padL - 3} y={yScale(v) + 3} textAnchor="end" fill="#999" fontSize="7">{v}%</text>
                        </g>
                      ))}
                      {/* Grid vertical (cada 4 semanas) */}
                      {Array.from({ length: Math.floor(weeksToShow / 4) + 1 }, (_, i) => i * 4).map(w => (
                        <g key={w}>
                          <line x1={xScale(w)} y1={padT} x2={xScale(w)} y2={padT + chartH} stroke="#e5e5e5" strokeWidth="0.5" />
                          <text x={xScale(w)} y={svgH - 5} textAnchor="middle" fill="#999" fontSize="7">S{w}</text>
                        </g>
                      ))}
                      {/* Línea hoy */}
                      {currentWeekIdx <= weeksToShow && (
                        <>
                          <line x1={xScale(currentWeekIdx)} y1={padT} x2={xScale(currentWeekIdx)} y2={padT + chartH} stroke="#f97316" strokeWidth="1" strokeDasharray="3,2" />
                          <text x={xScale(currentWeekIdx)} y={padT - 3} textAnchor="middle" fill="#f97316" fontSize="6" fontWeight="bold">HOY</text>
                        </>
                      )}
                      {/* Curva programada */}
                      <path d={progPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3" />
                      {/* Curva real */}
                      <path d={realPath} fill="none" stroke="#22c55e" strokeWidth="2.5" />
                      {/* Punto actual real */}
                      {currentWeekIdx <= weeksToShow && (
                        <circle cx={xScale(currentWeekIdx)} cy={yScale(realPct[currentWeekIdx] || 0)} r="3.5" fill="#22c55e" stroke="white" strokeWidth="1.5" />
                      )}
                      {/* Leyenda */}
                      <line x1={svgW - 180} y1={padT + 5} x2={svgW - 160} y2={padT + 5} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3" />
                      <text x={svgW - 155} y={padT + 8} fill="#3b82f6" fontSize="7">Programada</text>
                      <line x1={svgW - 100} y1={padT + 5} x2={svgW - 80} y2={padT + 5} stroke="#22c55e" strokeWidth="2.5" />
                      <text x={svgW - 75} y={padT + 8} fill="#22c55e" fontSize="7">Real</text>
                    </svg>
                  </div>

                  {/* Pie Página 1 */}
                  <div className="flex justify-between text-[7px] text-neutral-400 pt-1 border-t border-neutral-200">
                    <span>AFOR © 2026</span>
                    <span>Página 1 de 2</span>
                  </div>
                </div>

                {/* Separador entre páginas - NO IMPRIMIR */}
                <div className="no-print h-4 w-full max-w-5xl bg-neutral-50 flex items-center justify-center">
                  <span className="text-[8px] text-white">--- Corte de página ---</span>
                </div>

                {/* PÁGINA 2: Tabla completa de entregables */}
                <div className="print-page-2 bg-white shadow-xl w-full max-w-5xl" style={{ padding: '20px 28px', aspectRatio: '11/8.5' }}>
                  {/* Header Página 2 */}
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-2 mb-2">
                    <img src="/logo-afor.png" alt="AFOR" style={{ height: '28px' }} />
                    <div className="text-[8px] text-neutral-500">
                      {selectedProject} • Log de Avance • {new Date().toLocaleDateString('es-CL')}
                    </div>
                  </div>

                  {/* Tabla completa - aprovechando formato horizontal */}
                  <p className="text-[8px] font-semibold text-neutral-400 uppercase mb-1">Detalle de Entregables ({entregablesImpr.length})</p>
                  <table className="w-full text-[7px] border-collapse mb-3">
                    <thead>
                      <tr className="bg-neutral-800 text-white">
                        <th className="border border-neutral-600 px-1 py-0.5 text-center" style={{width: '20px'}}>#</th>
                        <th className="border border-neutral-600 px-1 py-0.5 text-left" style={{width: '110px'}}>Código</th>
                        <th className="border border-neutral-600 px-1 py-0.5 text-left">Descripción</th>
                        <th className="border border-neutral-600 px-1 py-0.5 text-center" style={{width: '30px'}}>Dur</th>
                        <th className="border border-neutral-600 px-1 py-0.5 text-center" style={{width: '25px'}}>Sec</th>
                        <th className="border border-neutral-600 px-1 py-0.5 text-center" style={{width: '62px'}}>REV_A</th>
                        <th className="border border-neutral-600 px-1 py-0.5 text-center" style={{width: '62px'}}>REV_B</th>
                        <th className="border border-neutral-600 px-1 py-0.5 text-center" style={{width: '62px'}}>REV_0</th>
                        <th className="border border-neutral-600 px-1 py-0.5 text-center" style={{width: '50px'}}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entregablesImpr.map((d, i) => {
                        const status = statusData[getStatusKey(d)];
                        const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart || d.secuencia, obtenerDuracionRevA(d, duracionesPorTipo), duracionRevision, duracionRevision);
                        const info = calculateStatus(status, deadlines);
                        return (
                          <tr key={d.id} className={d.frozen ? 'bg-blue-50 opacity-60' : i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                            <td className="border border-neutral-300 px-0.5 py-0 text-center">{d.id}</td>
                            <td className={`border border-neutral-300 px-1 py-0 font-mono ${d.frozen ? 'line-through' : ''}`}>{d.codigo || '-'}</td>
                            <td className={`border border-neutral-300 px-1 py-0 ${d.frozen ? 'line-through' : ''}`}>{d.nombre || d.name}{d.frozen ? ' ❄' : ''}</td>
                            <td className="border border-neutral-300 px-0.5 py-0 text-center">{d.frozen ? '-' : `${obtenerDuracionRevA(d, duracionesPorTipo)}d`}</td>
                            <td className="border border-neutral-300 px-0.5 py-0 text-center">{d.weekStart || d.secuencia}</td>
                            <td className={`border border-neutral-300 px-0.5 py-0 text-center ${status?.sentRevADate ? 'text-green-600' : 'text-neutral-400'}`}>
                              {d.frozen ? '-' : (status?.sentRevADate || '-')}
                            </td>
                            <td className={`border border-neutral-300 px-0.5 py-0 text-center ${status?.sentRevBDate ? 'text-green-600' : 'text-neutral-400'}`}>
                              {d.frozen ? '-' : (status?.sentRevBDate || '-')}
                            </td>
                            <td className={`border border-neutral-300 px-0.5 py-0 text-center ${status?.sentRev0Date ? 'text-green-600' : 'text-neutral-400'}`}>
                              {d.frozen ? '-' : (status?.sentRev0Date || '-')}
                            </td>
                            <td className="border border-neutral-300 px-0.5 py-0 text-center">
                              {d.frozen ? (
                                <span className="px-1 rounded text-[6px] bg-blue-100 text-blue-700">FROZEN</span>
                              ) : (
                                <span className={`px-1 rounded text-[6px] ${
                                  info.status === 'TERMINADO' ? 'bg-green-100 text-green-700' :
                                  info.status === 'ATRASADO' ? 'bg-red-100 text-red-700' :
                                  info.status === 'En Proceso' ? 'bg-orange-100 text-orange-700' :
                                  'bg-neutral-100 text-neutral-600'
                                }`}>{info.status === 'En Proceso' ? 'Proceso' : info.status}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Leyenda + Firmas en layout horizontal */}
                  <div className="flex justify-between items-end mb-3">
                    <div className="p-1.5 bg-neutral-50 rounded">
                      <div className="flex flex-wrap gap-3 text-[7px]">
                        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">TERMINADO</span>
                        <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Proceso</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">ATRASADO</span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">Pendiente</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">FROZEN</span>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="border-t border-neutral-300 pt-1" style={{width: '140px'}}>
                        <p className="text-[7px] text-neutral-500 text-center">Preparado por</p>
                      </div>
                      <div className="border-t border-neutral-300 pt-1" style={{width: '140px'}}>
                        <p className="text-[7px] text-neutral-500 text-center">Revisado por</p>
                      </div>
                    </div>
                  </div>

                  {/* Pie Página 2 */}
                  <div className="border-t-2 border-orange-500 pt-1">
                    <div className="flex justify-between text-[7px] text-neutral-400">
                      <div>
                        <p className="font-medium text-neutral-600">AFOR - Assets for Non-Process Infrastructure</p>
                        <p>www.afor.cl</p>
                      </div>
                      <p>Página 2 de 2</p>
                    </div>
                  </div>
                </div>
                    </>
                  );
                })()}
              </div>{/* Fin print-content */}

              {/* Botón cerrar al final - NO IMPRIMIR */}
              <div className="no-print bg-white dark:bg-neutral-800 w-full max-w-5xl rounded-b-lg p-2 flex justify-center">
                <Button variant="secondary" onClick={() => setPdfPreviewOpen(false)}>
                  Cerrar Vista Previa
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Confirmar Eliminación de Proyecto */}
      {deleteConfirmOpen && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Eliminar Proyecto</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                ¿Estás seguro de que deseas eliminar el siguiente proyecto?
              </p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded">
                  <Building2 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-mono text-orange-600 font-medium">{projectToDelete.id}</p>
                  <p className="text-neutral-800 dark:text-neutral-100">{projectToDelete.nombre}</p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs">{projectToDelete.cliente}</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-red-600 mb-4">
              ⚠️ Se eliminarán también todas las horas registradas asociadas a este proyecto.
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setProjectToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleDeleteProject}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Editar Proyecto */}
      {editProjectOpen && projectToEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Pencil className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Editar Proyecto</h2>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                  Código del Proyecto
                </label>
                <input
                  type="text"
                  value={editProjectData.id}
                  onChange={(e) => setEditProjectData(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ej: P2600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={editProjectData.nombre}
                  onChange={(e) => setEditProjectData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nombre del proyecto"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={editProjectData.cliente}
                  onChange={(e) => setEditProjectData(prev => ({ ...prev, cliente: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nombre del cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                  Estado
                </label>
                <select
                  value={editProjectData.estado}
                  onChange={(e) => setEditProjectData(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Terminado">Terminado</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => {
                  setEditProjectOpen(false);
                  setProjectToEdit(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSaveProject}
                disabled={!editProjectData.nombre.trim() || !editProjectData.id.trim()}
              >
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-700 py-4 text-center text-neutral-500 dark:text-neutral-400 text-xs">
        AFOR © 2026 • {currentUser?.nombre} ({isAdmin ? 'Admin' : 'Profesional'})
      </footer>
    </div>
  );
}
