import { CONFIG } from './config.js';

// Never blocks UI; swallow all errors (PRD §9.3).
export function sendWhatsApp(text) {
  if (!CONFIG.whatsapp.ativo) return;
  const { phone, apikey } = CONFIG.whatsapp;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}`
            + `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  try { fetch(url, { mode: 'no-cors' }).catch(() => {}); } catch { /* ignore */ }
}
