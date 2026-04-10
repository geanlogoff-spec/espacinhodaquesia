/**
 * Input validation utilities for the Espacinho da Quesia platform.
 * Security layer to sanitize and validate data before sending to Supabase.
 */

// Maximum field lengths to prevent abuse
const MAX_LENGTHS = {
  nome: 150,
  email: 254,
  telefone: 20,
  endereco: 300,
  titulo: 200,
  text: 1000,
  link: 2000,
  observacao: 500,
  cargo: 50,
  emoji: 10,
};

/**
 * Sanitize a string: trim whitespace and enforce max length.
 */
export function sanitize(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

/**
 * Validate an email address format.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.trim().length <= MAX_LENGTHS.email;
}

/**
 * Validate a Brazilian phone number format (landline or mobile).
 * Accepts: (XX) XXXXX-XXXX, (XX) XXXX-XXXX, XX XXXXXXXXX, or empty.
 */
export function isValidTelefone(telefone) {
  if (!telefone || telefone.trim() === '') return true; // Optional field
  const cleaned = telefone.replace(/[\s\-\(\)\.]/g, '');
  return /^\d{10,11}$/.test(cleaned);
}

/**
 * Validate that a URL uses a safe protocol (https or http only).
 * Rejects javascript:, data:, and other dangerous protocols.
 */
export function isValidUrl(url) {
  if (!url || url.trim() === '' || url.trim() === '#') return true; // Optional
  try {
    const parsed = new URL(url.trim());
    return ['https:', 'http:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate a name field (not empty, reasonable length).
 */
export function isValidNome(nome) {
  if (!nome || typeof nome !== 'string') return false;
  const trimmed = nome.trim();
  return trimmed.length >= 2 && trimmed.length <= MAX_LENGTHS.nome;
}

/**
 * Validate a date string in YYYY-MM-DD format.
 */
export function isValidDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return true; // Optional
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Sanitize an object's string fields with appropriate max lengths.
 * Returns a new object with sanitized values.
 */
export function sanitizeObject(obj, fieldLengths = {}) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const maxLen = fieldLengths[key] || MAX_LENGTHS[key] || 500;
      result[key] = sanitize(value, maxLen);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Validate escola data before saving.
 */
export function validateEscola(escola) {
  const errors = [];
  if (!isValidNome(escola.nome)) errors.push('Nome da escola é obrigatório (2-150 caracteres).');
  if (escola.email && !isValidEmail(escola.email)) errors.push('Email inválido.');
  if (escola.telefone && !isValidTelefone(escola.telefone)) errors.push('Telefone inválido.');
  return errors;
}

/**
 * Validate professor data before saving.
 */
export function validateProfessor(prof) {
  const errors = [];
  if (!isValidNome(prof.nome)) errors.push('Nome do professor é obrigatório (2-150 caracteres).');
  if (prof.telefone && !isValidTelefone(prof.telefone)) errors.push('Telefone inválido.');
  return errors;
}

/**
 * Validate arquivo (file link) data before saving.
 */
export function validateArquivo(arquivo) {
  const errors = [];
  if (!isValidNome(arquivo.nome)) errors.push('Nome do arquivo é obrigatório.');
  if (arquivo.link && !isValidUrl(arquivo.link)) errors.push('Link inválido. Use apenas URLs https://.');
  return errors;
}

/**
 * Validate entrega (delivery) data before saving.
 */
export function validateEntrega(entrega) {
  const errors = [];
  if (!entrega.titulo || entrega.titulo.trim().length < 2) errors.push('Título da sequência é obrigatório.');
  if (!entrega.prazo) errors.push('Prazo é obrigatório.');
  if (entrega.prazo && !isValidDate(entrega.prazo)) errors.push('Data do prazo inválida.');
  if (entrega.execucaoInicio && !isValidDate(entrega.execucaoInicio)) errors.push('Data de início inválida.');
  if (entrega.execucaoFim && !isValidDate(entrega.execucaoFim)) errors.push('Data de fim inválida.');
  return errors;
}

export { MAX_LENGTHS };
