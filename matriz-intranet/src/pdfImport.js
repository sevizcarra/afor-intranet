// ============================================
// IMPORTADOR DE DOCUMENTOS TRIBUTARIOS (PDF)
// Lee BHE y facturas electrónicas del SII EN EL NAVEGADOR,
// extrae los datos y DESCARTA el archivo (no se guarda copia).
// ============================================
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MESES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
};

const parseMonto = (str) => {
  if (!str) return null;
  const limpio = String(str).replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
  const n = parseFloat(limpio);
  return isNaN(n) ? null : Math.round(n);
};

const parseFechaTexto = (texto) => {
  let m = texto.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+(?:de\s+|del\s+)?(\d{4})/i);
  if (m) {
    const mes = MESES[m[2].toLowerCase()];
    if (mes) return `${m[3]}-${String(mes).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  }
  m = texto.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return `${m[3]}-${String(+m[2]).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  m = texto.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[0];
  return null;
};

// Extrae el texto del PDF agrupado por líneas (usa posición Y de cada fragmento)
export const extraerLineasPDF = async (file) => {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const lineas = [];
  for (let p = 1; p <= Math.min(pdf.numPages, 3); p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const porY = {};
    content.items.forEach(it => {
      const y = Math.round(it.transform[5] / 3) * 3;
      (porY[y] = porY[y] || []).push({ x: it.transform[4], str: it.str });
    });
    Object.keys(porY).map(Number).sort((a, b) => b - a).forEach(y => {
      const linea = porY[y].sort((a, b) => a.x - b.x).map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
      if (linea) lineas.push(linea);
    });
  }
  return lineas;
};

// Interpreta las líneas: tipo de documento, folio, fecha, tercero y montos
export const parsearDocumentoTributario = (lineas, rutEmpresa = '') => {
  const texto = lineas.join('\n');
  const avisos = [];
  const norm = (r) => String(r || '').toUpperCase().replace(/[^0-9K]/g, '');

  const esBHE = /BOLETA[S]?\s+DE\s+HONORARIOS/i.test(texto);
  const esNC = /NOTA\s+DE\s+CR[EÉ]DITO/i.test(texto);
  const esFactura = !esNC && /FACTURA/i.test(texto);

  let folio = null;
  let m = texto.match(/N[°ºO]?\s*[:.]?\s*(\d{1,10})/i);
  if (m) folio = m[1];

  const fecha = parseFechaTexto(texto);
  if (!fecha) avisos.push('No se detectó la fecha — revísala');

  const ruts = [...texto.matchAll(/(\d{1,2}\.?\d{3}\.?\d{3}\s?-\s?[\dkK])/g)].map(x => x[1].replace(/\s/g, ''));

  // Emisor: primera línea "con nombre" del documento; su RUT es el primero que aparece
  let lineaEmisor = lineas.find(l => /[A-ZÁÉÍÓÚÑ]{3,}/.test(l) && !/BOLETA|HONORARIOS|FACTURA|NOTA\s+DE|ELECTRONIC|SII|R\.?U\.?T|FECHA|N°|Nº|GIRO|CASA\s+MATRIZ|SE[NÑ]OR/i.test(l));
  if (!lineaEmisor && ruts.length) {
    // fallback: la línea vecina al primer RUT (recuadro del emisor en formatos SII)
    const idxRut = lineas.findIndex(l => l.includes(ruts[0]));
    for (const j of [idxRut - 1, idxRut + 1, idxRut - 2]) {
      if (j >= 0 && j < lineas.length && /[A-ZÁÉÍÓÚÑ]{3,}/.test(lineas[j]) && !/R\.?U\.?T|FACTURA|BOLETA|ELECTRONIC/i.test(lineas[j])) {
        lineaEmisor = lineas[j];
        break;
      }
    }
  }
  const emisor = lineaEmisor ? lineaEmisor.slice(0, 60).trim() : null;
  const rutEmisor = ruts[0] || null;
  if (ruts.length < 2) avisos.push('Solo se detectó un RUT en el documento — verifica el tipo y la contraparte');
  // Receptor: búsqueda POR LÍNEAS con validación anti-emisor.
  // Los formatos SII ponen la etiqueta (SEÑOR(ES)/RAZÓN SOCIAL/CLIENTE) y el nombre
  // puede venir en la misma línea o en la siguiente. El bloque superior del documento
  // es del EMISOR, así que un candidato similar al emisor se descarta.
  const limpiarNombre = (t) => String(t || '').replace(/R\.?U\.?T.*$/i, '').replace(/GIRO.*$/i, '').replace(/FECHA.*$/i, '').trim();
  const nucleo = (t) => String(t || '').toUpperCase().replace(/[^A-ZÑ0-9]/g, '');
  const pareceEmisor = (t) => {
    const a = nucleo(t); const b = nucleo(emisor);
    return a.length > 3 && b.length > 3 && (a.includes(b) || b.includes(a));
  };
  const esNombreValido = (t) => t && t.length >= 3 && /[A-ZÁÉÍÓÚÑa-z]{3,}/.test(t) && !pareceEmisor(t) && !/ELECTRONIC|FACTURA|BOLETA|NOTA\s+DE/i.test(t);
  const ETIQ_RECEPTOR = /(?:SE[NÑ]OR(?:\(ES\)|ES)?|RAZ[OÓ]N\s+SOCIAL|\bCLIENTE\b|\bSRES?\b)\s*\.?:?\s*(.*)$/i;
  let receptor = null;
  for (let i = 0; i < lineas.length && !receptor; i++) {
    const mm = lineas[i].match(ETIQ_RECEPTOR);
    if (!mm) continue;
    // candidato en la misma línea…
    let cand = limpiarNombre(mm[1]);
    if (esNombreValido(cand)) { receptor = cand.slice(0, 60); break; }
    // …o en las 2 líneas siguientes
    for (let j = 1; j <= 2 && i + j < lineas.length; j++) {
      cand = limpiarNombre(lineas[i + j]);
      if (esNombreValido(cand)) { receptor = cand.slice(0, 60); break; }
    }
  }
  // Receptor: primer RUT distinto del emisor (el RUT del emisor suele repetirse en el cuerpo)
  const rutReceptor = ruts.find(r => r.replace(/[.\s]/g, '') !== String(rutEmisor || '').replace(/[.\s]/g, '')) || null;

  if (esBHE) {
    if (!emisor) avisos.push('No se detectó el profesional emisor — complétalo');
    let bruto = null;
    m = texto.match(/TOTAL\s+HONORARIOS\s*:?\s*\$?\s*([\d.,]+)/i) ||
        texto.match(/MONTO\s+BRUTO\s*:?\s*\$?\s*([\d.,]+)/i) ||
        texto.match(/HONORARIOS\s*:?\s*\$\s*([\d.,]+)/i);
    if (m) bruto = parseMonto(m[1]);
    if (!bruto) avisos.push('No se detectó el monto bruto');
    return { tipo: 'bh', fecha, tercero: emisor, emisor, receptor, rutEmisor, rutReceptor, folio, bruto, neto: null, iva: null, total: null, avisos };
  }

  if (esFactura || esNC) {
    let neto = null, iva = null, total = null;
    m = texto.match(/(?:MONTO\s+)?NETO\s*:?\s*\$?\s*([\d.,]+)/i);
    if (m) neto = parseMonto(m[1]);
    // IVA: saltarse el "19%" de la etiqueta y capturar el MONTO
    m = texto.match(/I\.?\s?V\.?\s?A\.?\s*\(?\s*19\s*%?\s*\)?\s*:?\s*\$?\s*([\d.,]+)/i) ||
        texto.match(/I\.?\s?V\.?\s?A\.?[^0-9$%]{0,15}\$?\s*([\d.,]+)/i);
    if (m) {
      const cand = parseMonto(m[1]);
      if (cand !== 19) iva = cand; // "19" solo es el porcentaje de la etiqueta
    }
    const totales = [...texto.matchAll(/TOTAL\s*:?\s*\$?\s*([\d.,]+)/gi)].map(x => parseMonto(x[1])).filter(Boolean);
    if (totales.length) total = Math.max(...totales);

    // Cierres aritméticos entre neto/iva/total
    if (neto === null && total !== null && iva !== null) neto = total - iva;
    if (iva === null && total !== null && neto !== null) iva = total - neto;

    // Sanidad: el IVA debe ser ~19% del neto; si no, reconstruir desde el total
    const ivaEsperado = neto !== null ? neto * 0.19 : null;
    const ivaSospechoso = iva !== null && ivaEsperado !== null && Math.abs(iva - ivaEsperado) > Math.max(50, ivaEsperado * 0.05);
    if ((ivaSospechoso || iva === null || neto === null) && total !== null) {
      const netoCalc = Math.round(total / 1.19);
      const ivaCalc = total - netoCalc;
      if (neto === null || ivaSospechoso) {
        neto = netoCalc;
        iva = ivaCalc;
        avisos.push('Montos recalculados desde el total (neto = total ÷ 1,19) — verifícalos');
      }
    }
    if (neto !== null && iva === null) { iva = Math.round(neto * 0.19); avisos.push('IVA estimado al 19% — verifícalo'); }
    if (neto === null) avisos.push('No se detectó el monto neto');

    // Clasificación según quién emite (RUT del emisor vs RUT de AFOR)
    const propio = norm(rutEmpresa);
    const rutsNorm = ruts.map(norm);
    const emiteAfor = !!(propio && rutEmisor && norm(rutEmisor) === propio);
    if (!propio) avisos.push('Configura el RUT de AFOR para clasificar automáticamente');
    // (En una compra es NORMAL que el RUT de AFOR aparezca como receptor — sin aviso)
    if (propio && !rutsNorm.includes(propio)) {
      avisos.push('El RUT de AFOR no aparece en el documento — verifica que te corresponda');
    }

    let tipo, afecta = null, tercero;
    if (esNC) {
      tipo = 'nc';
      afecta = emiteAfor ? 'venta' : 'compra'; // NC emitida resta ventas; recibida resta compras
      tercero = emiteAfor ? (receptor || null) : emisor;
      if (!tercero) avisos.push('No se detectó la contraparte de la NC — complétala');
    } else if (emiteAfor) {
      tipo = 'venta';
      tercero = receptor || null; // NUNCA el emisor: en una venta el emisor eres tú
      if (!tercero) avisos.push('No se detectó el cliente en el documento — escríbelo antes de confirmar');
    } else {
      tipo = 'compra';
      tercero = emisor;
      if (!tercero) avisos.push('No se detectó el proveedor — complétalo');
    }
    return { tipo, afecta, fecha, tercero, emisor, receptor, rutEmisor, rutReceptor, folio, bruto: null, neto, iva, total, avisos };
  }

  return { tipo: 'compra', afecta: null, fecha, tercero: null, emisor, receptor, rutEmisor, rutReceptor, folio, bruto: null, neto: null, iva: null, total: null, avisos: ['Tipo de documento no reconocido — completa los datos a mano'] };
};
