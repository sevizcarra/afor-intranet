// ============================================
// SERVICIO DE FIRESTORE
// ============================================
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion
} from 'firebase/firestore';

// Nombres de las colecciones
const COLLECTIONS = {
  PROYECTOS: 'proyectos',
  COLABORADORES: 'colaboradores',
  HORAS: 'horas',
  STATUS_DATA: 'statusData',
  CONFIG: 'config',
  TAREAS: 'tareas',
  PRESENCIA: 'presencia',
  COTIZACIONES: 'cotizaciones',
  USUARIOS: 'usuarios',
  MOVIMIENTOS: 'movimientos'
};

// ============================================
// MOVIMIENTOS FINANCIEROS (BH, compras, ventas)
// ============================================
export const saveMovimiento = async (mov) => {
  try {
    if (mov._docId) {
      const { _docId, ...data } = mov;
      await setDoc(doc(db, COLLECTIONS.MOVIMIENTOS, _docId), data);
    } else {
      await addDoc(collection(db, COLLECTIONS.MOVIMIENTOS), mov);
    }
    return true;
  } catch (error) {
    console.error('Error saving movimiento:', error);
    return false;
  }
};

export const deleteMovimiento = async (docId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MOVIMIENTOS, docId));
    return true;
  } catch (error) {
    console.error('Error deleting movimiento:', error);
    return false;
  }
};

export const subscribeToMovimientos = (callback, onError) => {
  return onSnapshot(collection(db, COLLECTIONS.MOVIMIENTOS), (snapshot) => {
    const movs = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }));
    callback(movs);
  }, (error) => {
    console.error('Error en suscripción movimientos:', error);
    if (onError) onError(error);
  });
};

// Configuración tributaria del módulo de finanzas (tasas editables)
export const saveFinanzasConfig = async (config) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'finanzas'), { ...config, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving finanzas config:', error);
    return false;
  }
};

export const subscribeToFinanzasConfig = (callback, onError) => {
  return onSnapshot(doc(db, COLLECTIONS.CONFIG, 'finanzas'), (docSnap) => {
    callback(docSnap.exists() ? docSnap.data() : null);
  }, (error) => {
    console.error('Error en suscripción finanzas config:', error);
    if (onError) onError(error);
  });
};

// ============================================
// PERFILES DE USUARIO (Firebase Auth)
// ============================================
export const getUsuarioPerfil = async (uid) => {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USUARIOS, uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error getting usuario perfil:', error);
    return null;
  }
};

export const saveUsuarioPerfil = async (uid, perfil) => {
  try {
    await setDoc(doc(db, COLLECTIONS.USUARIOS, uid), perfil, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving usuario perfil:', error);
    return false;
  }
};

// ============================================
// PROYECTOS
// ============================================
export const getProyectos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PROYECTOS));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  } catch (error) {
    console.error('Error getting proyectos:', error);
    return [];
  }
};

export const saveProyecto = async (proyecto) => {
  try {
    // Usar el ID del proyecto como ID del documento
    await setDoc(doc(db, COLLECTIONS.PROYECTOS, proyecto.id), proyecto);
    return true;
  } catch (error) {
    console.error('Error saving proyecto:', error);
    return false;
  }
};

export const updateProyectoField = async (proyectoId, fields) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.PROYECTOS, proyectoId), fields);
    return true;
  } catch (error) {
    console.error('Error updating proyecto field:', error);
    return false;
  }
};

export const deleteProyecto = async (proyectoId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PROYECTOS, proyectoId));
    return true;
  } catch (error) {
    console.error('Error deleting proyecto:', error);
    return false;
  }
};

// Listener en tiempo real para proyectos
export const subscribeToProyectos = (callback, onError) => {
  return onSnapshot(collection(db, COLLECTIONS.PROYECTOS), (snapshot) => {
    const proyectos = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(proyectos, snapshot.metadata.fromCache);
  }, (error) => {
    console.error('Error en subscripción proyectos:', error);
    if (onError) onError(error);
  });
};

// ============================================
// COLABORADORES
// ============================================
export const getColaboradores = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COLABORADORES));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  } catch (error) {
    console.error('Error getting colaboradores:', error);
    return [];
  }
};

export const saveColaborador = async (colaborador) => {
  try {
    // Usar el ID del colaborador como ID del documento
    await setDoc(doc(db, COLLECTIONS.COLABORADORES, String(colaborador.id)), colaborador);
    return true;
  } catch (error) {
    console.error('Error saving colaborador:', error);
    return false;
  }
};

export const deleteColaborador = async (colaboradorId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.COLABORADORES, String(colaboradorId)));
    return true;
  } catch (error) {
    console.error('Error deleting colaborador:', error);
    return false;
  }
};

export const getColaborador = async (id) => {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.COLABORADORES, String(id)));
    return snap.exists() ? { ...snap.data(), _docId: snap.id } : null;
  } catch (error) {
    console.error('Error getting colaborador:', error);
    return null;
  }
};

export const subscribeToColaboradores = (callback, onError) => {
  return onSnapshot(collection(db, COLLECTIONS.COLABORADORES), (snapshot) => {
    const colaboradores = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(colaboradores, snapshot.metadata.fromCache);
  }, (error) => {
    console.error('Error en subscripción colaboradores:', error);
    if (onError) onError(error);
  });
};

// ============================================
// HORAS REGISTRADAS
// ============================================
export const getHoras = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.HORAS));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  } catch (error) {
    console.error('Error getting horas:', error);
    return [];
  }
};

export const saveHora = async (hora) => {
  try {
    // Para horas, usamos addDoc para generar IDs automáticos
    if (hora._docId) {
      await setDoc(doc(db, COLLECTIONS.HORAS, hora._docId), hora);
    } else {
      await addDoc(collection(db, COLLECTIONS.HORAS), hora);
    }
    return true;
  } catch (error) {
    console.error('Error saving hora:', error);
    return false;
  }
};

export const deleteHora = async (horaDocId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.HORAS, horaDocId));
    return true;
  } catch (error) {
    console.error('Error deleting hora:', error);
    return false;
  }
};

export const subscribeToHoras = (callback, onError) => {
  return onSnapshot(collection(db, COLLECTIONS.HORAS), (snapshot) => {
    const horas = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(horas);
  }, (error) => {
    console.error('Error en suscripción horas:', error);
    if (onError) onError(error);
  });
};

// ============================================
// STATUS DATA (para el dashboard de proyectos)
// ============================================
export const getStatusData = async () => {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, 'statusData');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().data || {};
    }
    return {};
  } catch (error) {
    console.error('Error getting statusData:', error);
    return {};
  }
};

export const saveStatusData = async (statusData) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'statusData'), { data: statusData });
    return true;
  } catch (error) {
    console.error('Error saving statusData:', error);
    return false;
  }
};

// Actualiza SOLO las claves modificadas de statusData (merge profundo).
// Evita el last-writer-wins global: dos usuarios marcando checkboxes a la vez ya no se pisan.
export const updateStatusDataFields = async (fields) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'statusData'), { data: fields }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating statusData fields:', error);
    return false;
  }
};

export const subscribeToStatusData = (callback, onError) => {
  return onSnapshot(doc(db, COLLECTIONS.CONFIG, 'statusData'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().data || {});
    } else {
      callback({});
    }
  }, (error) => {
    console.error('Error en suscripción statusData:', error);
    if (onError) onError(error);
  });
};

// ============================================
// TAREAS
// ============================================
export const getTareas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TAREAS));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  } catch (error) {
    console.error('Error getting tareas:', error);
    return [];
  }
};

export const saveTarea = async (tarea) => {
  try {
    if (tarea._docId) {
      // Actualizar tarea existente
      await setDoc(doc(db, COLLECTIONS.TAREAS, tarea._docId), tarea);
    } else {
      // Nueva tarea - generar ID automático
      await addDoc(collection(db, COLLECTIONS.TAREAS), tarea);
    }
    return true;
  } catch (error) {
    console.error('Error saving tarea:', error);
    return false;
  }
};

export const deleteTarea = async (tareaDocId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TAREAS, tareaDocId));
    return true;
  } catch (error) {
    console.error('Error deleting tarea:', error);
    return false;
  }
};

export const subscribeToTareas = (callback, onError) => {
  return onSnapshot(collection(db, COLLECTIONS.TAREAS), (snapshot) => {
    const tareas = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(tareas);
  }, (error) => {
    console.error('Error en suscripción tareas:', error);
    if (onError) onError(error);
  });
};

// ============================================
// COTIZACIONES (COT)
// ============================================
export const saveCotizacion = async (cotizacion) => {
  try {
    if (cotizacion._docId) {
      const docId = cotizacion._docId;
      const { _docId, ...data } = cotizacion;
      await setDoc(doc(db, COLLECTIONS.COTIZACIONES, docId), data, { merge: true });
      return docId;
    } else {
      const docRef = await addDoc(collection(db, COLLECTIONS.COTIZACIONES), cotizacion);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving cotizacion:', error);
    return null;
  }
};

// entradaLog: objeto único que se AGREGA al historial con arrayUnion —
// dos usuarios cambiando estados a la vez ya no se pisan el historial (M6)
export const updateCotEstado = async (cotDocId, estado, entradaLog, firmada) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.COTIZACIONES, cotDocId), {
      estado,
      historial: arrayUnion(entradaLog),
      firmada
    });
    return true;
  } catch (error) {
    console.error('Error updating cotizacion estado:', error);
    return false;
  }
};

export const deleteCotizacion = async (cotDocId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.COTIZACIONES, cotDocId));
    return true;
  } catch (error) {
    console.error('Error deleting cotizacion:', error);
    return false;
  }
};

export const subscribeToCotizaciones = (callback, onError) => {
  return onSnapshot(collection(db, COLLECTIONS.COTIZACIONES), (snapshot) => {
    const cotizaciones = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(cotizaciones);
  }, (error) => {
    console.error('Error en suscripción cotizaciones:', error);
    if (onError) onError(error);
  });
};

// ============================================
// ARCHIVOS ADJUNTOS DE COTIZACIONES (Firebase Storage)
// ============================================
export const uploadCotArchivo = async (cotDocId, file) => {
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `cotizaciones/${cotDocId}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    // Agregar referencia al documento de la COT
    const cotRef = doc(db, COLLECTIONS.COTIZACIONES, cotDocId);
    const cotSnap = await getDoc(cotRef);
    const archivos = cotSnap.exists() ? (cotSnap.data().archivos || []) : [];
    archivos.push({ nombre: file.name, url, path: storagePath, fecha: new Date().toISOString(), size: file.size });
    await updateDoc(cotRef, { archivos });
    return { nombre: file.name, url, path: storagePath };
  } catch (error) {
    console.error('Error uploading archivo:', error);
    return null;
  }
};

export const deleteCotArchivo = async (cotDocId, archivoPath) => {
  try {
    // Eliminar de Storage
    const storageRef = ref(storage, archivoPath);
    await deleteObject(storageRef);
    // Quitar referencia del documento
    const cotRef = doc(db, COLLECTIONS.COTIZACIONES, cotDocId);
    const cotSnap = await getDoc(cotRef);
    if (cotSnap.exists()) {
      const archivos = (cotSnap.data().archivos || []).filter(a => a.path !== archivoPath);
      await updateDoc(cotRef, { archivos });
    }
    return true;
  } catch (error) {
    console.error('Error deleting archivo:', error);
    return false;
  }
};

// ============================================
// PRESENCIA (Usuarios en línea)
// ============================================
export const updatePresencia = async (profesionalId, datos) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PRESENCIA, String(profesionalId)), {
      ...datos,
      profesionalId,
      ultimaActividad: new Date().toISOString(),
      online: true
    });
    return true;
  } catch (error) {
    console.error('Error updating presencia:', error);
    return false;
  }
};

export const setOffline = async (profesionalId) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PRESENCIA, String(profesionalId)), {
      profesionalId,
      ultimaActividad: new Date().toISOString(),
      online: false
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting offline:', error);
    return false;
  }
};

export const subscribeToPresencia = (callback, onError) => {
  return onSnapshot(collection(db, COLLECTIONS.PRESENCIA), (snapshot) => {
    const presencia = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(presencia);
  }, (error) => {
    console.error('Error en suscripción presencia:', error);
    if (onError) onError(error);
  });
};

// ============================================
// UTILIDADES
// ============================================

// Guardar todos los proyectos de una vez (útil para migración inicial)
export const saveAllProyectos = async (proyectos) => {
  try {
    for (const proyecto of proyectos) {
      await saveProyecto(proyecto);
    }
    return true;
  } catch (error) {
    console.error('Error saving all proyectos:', error);
    return false;
  }
};

// Guardar todos los colaboradores de una vez
export const saveAllColaboradores = async (colaboradores) => {
  try {
    for (const colaborador of colaboradores) {
      await saveColaborador(colaborador);
    }
    return true;
  } catch (error) {
    console.error('Error saving all colaboradores:', error);
    return false;
  }
};

// Guardar todas las horas de una vez
export const saveAllHoras = async (horas) => {
  try {
    for (const hora of horas) {
      await saveHora(hora);
    }
    return true;
  } catch (error) {
    console.error('Error saving all horas:', error);
    return false;
  }
};

// ============================================
// BACKUP Y RESTAURACIÓN
// ============================================

// Exportar TODOS los datos como un objeto JSON completo
export const exportFullBackup = async () => {
  try {
    const [proyectos, colaboradores, horas, tareas, statusData, cotizaciones, tarifasDoc, recetasDoc, duracionesDoc, usuarios] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.PROYECTOS)),
      getDocs(collection(db, COLLECTIONS.COLABORADORES)),
      getDocs(collection(db, COLLECTIONS.HORAS)),
      getDocs(collection(db, COLLECTIONS.TAREAS)),
      getDoc(doc(db, COLLECTIONS.CONFIG, 'statusData')),
      getDocs(collection(db, COLLECTIONS.COTIZACIONES)),
      getDoc(doc(db, COLLECTIONS.CONFIG, 'tarifas')),
      getDoc(doc(db, COLLECTIONS.CONFIG, 'recetas')),
      getDoc(doc(db, COLLECTIONS.CONFIG, 'duraciones')),
      getDocs(collection(db, COLLECTIONS.USUARIOS))
    ]);
    const movimientosSnap = await getDocs(collection(db, COLLECTIONS.MOVIMIENTOS));
    const finConfigSnap = await getDoc(doc(db, COLLECTIONS.CONFIG, 'finanzas'));

    const backup = {
      _meta: {
        version: '2.0',
        fecha: new Date().toISOString(),
        totalProyectos: proyectos.docs.length,
        totalColaboradores: colaboradores.docs.length,
        totalHoras: horas.docs.length,
        totalTareas: tareas.docs.length,
        totalCotizaciones: cotizaciones.docs.length,
        totalUsuarios: usuarios.docs.length,
      },
      proyectos: proyectos.docs.map(d => ({ _docId: d.id, ...d.data() })),
      colaboradores: colaboradores.docs.map(d => ({ _docId: d.id, ...d.data() })),
      horas: horas.docs.map(d => ({ _docId: d.id, ...d.data() })),
      tareas: tareas.docs.map(d => ({ _docId: d.id, ...d.data() })),
      statusData: statusData.exists() ? statusData.data().data || {} : {},
      cotizaciones: cotizaciones.docs.map(d => ({ _docId: d.id, ...d.data() })),
      config: {
        tarifas: tarifasDoc.exists() ? tarifasDoc.data() : null,
        recetas: recetasDoc.exists() ? recetasDoc.data() : null,
        duraciones: duracionesDoc.exists() ? duracionesDoc.data() : null,
        finanzas: finConfigSnap.exists() ? finConfigSnap.data() : null,
      },
      movimientos: movimientosSnap.docs.map(d => ({ _docId: d.id, ...d.data() })),
      usuarios: usuarios.docs.map(d => ({ _docId: d.id, ...d.data() })),
    };

    return backup;
  } catch (error) {
    console.error('Error exportando backup:', error);
    throw error;
  }
};

// Restaurar datos desde un backup JSON
export const restoreFromBackup = async (backup) => {
  try {
    let restored = { proyectos: 0, colaboradores: 0, horas: 0, tareas: 0, statusData: false, cotizaciones: 0, config: 0, usuarios: 0 };

    // Restaurar cotizaciones
    if (backup.cotizaciones && backup.cotizaciones.length > 0) {
      for (const c of backup.cotizaciones) {
        const { _docId, ...data } = c;
        if (_docId) {
          await setDoc(doc(db, COLLECTIONS.COTIZACIONES, _docId), data);
        } else {
          await addDoc(collection(db, COLLECTIONS.COTIZACIONES), data);
        }
        restored.cotizaciones++;
      }
    }

    // Restaurar movimientos financieros
    if (backup.movimientos && backup.movimientos.length > 0) {
      for (const m of backup.movimientos) {
        const { _docId, ...data } = m;
        if (_docId) {
          await setDoc(doc(db, COLLECTIONS.MOVIMIENTOS, _docId), data);
        } else {
          await addDoc(collection(db, COLLECTIONS.MOVIMIENTOS), data);
        }
      }
    }

    // Restaurar configuración (tarifas, recetas, duraciones, finanzas)
    if (backup.config) {
      for (const key of ['tarifas', 'recetas', 'duraciones', 'finanzas']) {
        if (backup.config[key]) {
          await setDoc(doc(db, COLLECTIONS.CONFIG, key), backup.config[key]);
          restored.config++;
        }
      }
    }

    // Restaurar perfiles de usuario
    if (backup.usuarios && backup.usuarios.length > 0) {
      for (const u of backup.usuarios) {
        const { _docId, ...data } = u;
        if (_docId) {
          await setDoc(doc(db, COLLECTIONS.USUARIOS, _docId), data);
          restored.usuarios++;
        }
      }
    }

    // Restaurar proyectos
    if (backup.proyectos && backup.proyectos.length > 0) {
      for (const p of backup.proyectos) {
        const id = p._docId || p.id;
        if (id) {
          const { _docId, ...data } = p;
          await setDoc(doc(db, COLLECTIONS.PROYECTOS, id), data);
          restored.proyectos++;
        }
      }
    }

    // Restaurar colaboradores
    if (backup.colaboradores && backup.colaboradores.length > 0) {
      for (const c of backup.colaboradores) {
        const id = c._docId || String(c.id);
        if (id) {
          const { _docId, ...data } = c;
          await setDoc(doc(db, COLLECTIONS.COLABORADORES, id), data);
          restored.colaboradores++;
        }
      }
    }

    // Restaurar horas
    if (backup.horas && backup.horas.length > 0) {
      for (const h of backup.horas) {
        if (h._docId) {
          const { _docId, ...data } = h;
          await setDoc(doc(db, COLLECTIONS.HORAS, _docId), data);
        } else {
          await addDoc(collection(db, COLLECTIONS.HORAS), h);
        }
        restored.horas++;
      }
    }

    // Restaurar tareas
    if (backup.tareas && backup.tareas.length > 0) {
      for (const t of backup.tareas) {
        if (t._docId) {
          const { _docId, ...data } = t;
          await setDoc(doc(db, COLLECTIONS.TAREAS, _docId), data);
        } else {
          await addDoc(collection(db, COLLECTIONS.TAREAS), t);
        }
        restored.tareas++;
      }
    }

    // Restaurar statusData
    if (backup.statusData && Object.keys(backup.statusData).length > 0) {
      await setDoc(doc(db, COLLECTIONS.CONFIG, 'statusData'), { data: backup.statusData });
      restored.statusData = true;
    }

    return restored;
  } catch (error) {
    console.error('Error restaurando backup:', error);
    throw error;
  }
};

// Guardar auto-backup en Firestore (colección backups)
export const saveAutoBackup = async (backup) => {
  const fecha = new Date();
  const backupId = `backup_${fecha.toISOString().split('T')[0]}`;
  try {
    await setDoc(doc(db, 'backups', backupId), {
      ...backup,
      _meta: { ...backup._meta, tipo: 'auto', fecha: fecha.toISOString() }
    });
    return true;
  } catch (error) {
    // Si el documento supera el límite de Firestore (1MB), reintentar sin cotizaciones
    console.warn('Auto-backup completo falló, reintentando sin cotizaciones:', error);
    try {
      const { cotizaciones, ...resto } = backup;
      await setDoc(doc(db, 'backups', backupId), {
        ...resto,
        _meta: { ...backup._meta, tipo: 'auto', fecha: fecha.toISOString(), cotizacionesOmitidas: true }
      });
      return true;
    } catch (error2) {
      console.error('Error guardando auto-backup:', error2);
      return false;
    }
  }
};

// Obtener lista de backups disponibles
export const getBackupsList = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'backups'));
    return querySnapshot.docs.map(d => ({
      id: d.id,
      fecha: d.data()._meta?.fecha,
      tipo: d.data()._meta?.tipo,
      totalProyectos: d.data()._meta?.totalProyectos,
      totalColaboradores: d.data()._meta?.totalColaboradores,
      totalHoras: d.data()._meta?.totalHoras,
    })).sort((a, b) => b.fecha?.localeCompare(a.fecha));
  } catch (error) {
    console.error('Error obteniendo backups:', error);
    return [];
  }
};

// Obtener un backup específico para restaurar
export const getBackup = async (backupId) => {
  try {
    const docSnap = await getDoc(doc(db, 'backups', backupId));
    if (docSnap.exists()) return docSnap.data();
    return null;
  } catch (error) {
    console.error('Error obteniendo backup:', error);
    return null;
  }
};

// ============================================
// DURACIONES POR TIPO DE DOCUMENTO
// ============================================

// Guardar duraciones en Firestore
export const saveDuraciones = async (duracionesPorTipo, duracionRevision) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'duraciones'), {
      duracionesPorTipo,
      duracionRevision,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error guardando duraciones:', error);
    return false;
  }
};

// Suscribirse a cambios de duraciones
export const subscribeToDuraciones = (callback, onError) => {
  return onSnapshot(doc(db, COLLECTIONS.CONFIG, 'duraciones'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  }, (error) => {
    console.error('Error en suscripción duraciones:', error);
    if (onError) onError(error);
  });
};

// Guardar tarifas y recetas (motor paramétrico COT)
export const saveTarifas = async (tarifas) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'tarifas'), {
      tarifas: JSON.stringify(tarifas),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error guardando tarifas:', error);
    return false;
  }
};

export const saveRecetas = async (recetas) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'recetas'), {
      recetas: JSON.stringify(recetas),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error guardando recetas:', error);
    return false;
  }
};

export const subscribeToTarifas = (callback, onError) => {
  return onSnapshot(doc(db, COLLECTIONS.CONFIG, 'tarifas'), (docSnap) => {
    if (docSnap.exists()) {
      try {
        callback(JSON.parse(docSnap.data().tarifas));
      } catch { callback(null); }
    }
  }, (error) => {
    console.error('Error en suscripción tarifas:', error);
    if (onError) onError(error);
  });
};

export const subscribeToRecetas = (callback, onError) => {
  return onSnapshot(doc(db, COLLECTIONS.CONFIG, 'recetas'), (docSnap) => {
    if (docSnap.exists()) {
      try {
        callback(JSON.parse(docSnap.data().recetas));
      } catch { callback(null); }
    }
  }, (error) => {
    console.error('Error en suscripción recetas:', error);
    if (onError) onError(error);
  });
};
