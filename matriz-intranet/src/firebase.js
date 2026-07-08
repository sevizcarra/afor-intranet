// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
// (ver instrucciones en README.md)

import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut as signOutSecondary } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDgBZEoRxd6TcTxfEDDs_60cj_Hq9mreJE",
  authDomain: "matriz-intranet.firebaseapp.com",
  projectId: "matriz-intranet",
  storageBucket: "matriz-intranet.firebasestorage.app",
  messagingSenderId: "454436525624",
  appId: "1:454436525624:web:037a178feb09de3f0138cd",
  measurementId: "G-9P4Y9XWG7X"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Habilitar persistencia offline - los datos se cachean en IndexedDB
// Así la app funciona incluso sin conexión y no pierde datos
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistencia offline no disponible: múltiples pestañas abiertas');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistencia offline no soportada en este navegador');
  }
});

// Crea un usuario en Firebase Auth usando una app secundaria,
// para NO reemplazar la sesión del admin que está creando al usuario.
export const createAuthUser = async (email, password) => {
  const secApp = initializeApp(firebaseConfig, 'secondary-' + Date.now());
  try {
    const secAuth = getAuth(secApp);
    const cred = await createUserWithEmailAndPassword(secAuth, email, password);
    await signOutSecondary(secAuth);
    return { uid: cred.user.uid };
  } catch (error) {
    return { error: (error && error.code) || String(error) };
  } finally {
    try { await deleteApp(secApp); } catch (e) { /* noop */ }
  }
};

export default app;
