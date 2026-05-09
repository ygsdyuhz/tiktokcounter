require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const FormData = require('form-data');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  referrerPolicy: { policy: 'no-referrer' },
  hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  frameguard: { action: 'deny' },
  noSniff: true,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  }
}));

app.use(cookieParser());
app.use(express.json({ limit: '9mb', strict: true }));

app.use((req, res, next) => {
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use('/cars', express.static(path.join(__dirname, 'cars'), { maxAge: '7d' }));
app.use('/images', express.static(path.join(__dirname, 'images'), { maxAge: '7d' }));
app.use(express.static(__dirname, { index: false, maxAge: '1h' }));

// ====== RATE LIMITER ======
const reserveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessaie plus tard.' }
});

app.use('/api/reserve', reserveLimiter);

// ====== CARS ======
const CARS = [
  { id: 0,  name: 'AUDI RS3',               price: 280, dep: 150 },
  { id: 1,  name: 'AUDI RSQ3',              price: 260, dep: 150 },
  { id: 2,  name: 'Porsche Cayenne',        price: 220, dep: 100 },
  { id: 3,  name: 'Volkswagen Golf 8 R',    price: 210, dep: 100 },
  { id: 4,  name: 'Volkswagen Golf 8 GTI',  price: 180, dep: 100 },
  { id: 5,  name: 'Audi RS7',               price: 300, dep: 150 },
  { id: 6,  name: 'Mercedes-AMG A45 S',     price: 270, dep: 150 },
  { id: 7,  name: 'Renault Clio V ALPINE',  price: 150, dep: 100 },
  { id: 8,  name: 'BMW 128ti Bleu',         price: 190, dep: 100 },
  { id: 9,  name: 'Mercedes-AMG C63 S',     price: 300, dep: 150 },
  { id: 10, name: 'Peugeot 308',            price: 160, dep: 100 }
];

// ====== HOLD SYSTEM 10 MIN ======
const HOLDS = new Map();
const HOLD_MS = 10 * 60 * 1000;

function cleanExpiredHolds() {
  const now = Date.now();

  for (const [carId, holds] of HOLDS.entries()) {
    const active = holds.filter(h => h.expiresAt > now);

    if (active.length) {
      HOLDS.set(carId, active);
    } else {
      HOLDS.delete(carId);
    }
  }
}

function parseDateOnly(value) {
  if (!isValidISODate(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function datesOverlap(startA, endA, startB, endB) {
  return startA <= endB && startB <= endA;
}

function isHeld(carId, dateStart, dateEnd) {
  cleanExpiredHolds();

  const start = parseDateOnly(dateStart);
  const end = parseDateOnly(dateEnd);

  if (!start || !end || end < start) return false;

  const holds = HOLDS.get(String(carId)) || [];

  return holds.some(h => {
    const hStart = parseDateOnly(h.dateStart);
    const hEnd = parseDateOnly(h.dateEnd);

    if (!hStart || !hEnd) return false;

    return datesOverlap(start, end, hStart, hEnd);
  });
}

function addHold(carId, dateStart, dateEnd) {
  cleanExpiredHolds();

  const key = String(carId);
  const holds = HOLDS.get(key) || [];

  holds.push({
    carId: key,
    dateStart,
    dateEnd,
    expiresAt: Date.now() + HOLD_MS
  });

  HOLDS.set(key, holds);
}

// ====== HELPERS ======
function cleanText(v, max = 120) {
  return String(v || '')
    .replace(/[<>`$\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(v || '').trim());
}

function isValidPhone(v) {
  return /^[+\d\s().-]{6,20}$/.test(String(v || '').trim());
}

function isValidISODate(v) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
}

function decodeDataUri(data, allowedTypes, maxBytes) {
  const input = String(data || '');
  const match = input.match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match || !allowedTypes.includes(match[1])) return null;

  const buf = Buffer.from(match[2], 'base64');

  if (!buf.length || buf.length > maxBytes) return null;

  return { mimeType: match[1], buf };
}

function countRentalDays(dateStart, dateEnd) {
  const start = new Date(`${dateStart}T00:00:00Z`);
  const end = new Date(`${dateEnd}T00:00:00Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;

  return Math.max(1, Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1);
}

function getDiscount(days) {
  return days >= 3 ? 150 : 0;
}

// ====== MIDDLEWARES ======
function sameOriginOnly(req, res, next) {
  const origin = req.get('origin');
  const host = req.get('host');

  if (!origin) return next();

  try {
    const u = new URL(origin);
    if (u.host !== host) {
      return res.status(403).json({ error: 'Origine refusée' });
    }
  } catch {
    return res.status(403).json({ error: 'Origine invalide' });
  }

  next();
}

function requireAjaxHeader(req, res, next) {
  if (req.get('x-requested-with') !== 'fetch') {
    return res.status(400).json({ error: 'Requête invalide' });
  }

  next();
}

function verifyCsrf(req, res, next) {
  const csrfCookie = req.cookies['csrf'];
  const csrfHeader = req.get('x-csrf-token');

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'Token CSRF invalide' });
  }

  next();
}

// ====== ROUTES ======
app.get('/', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie('csrf', token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });

  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/check-availability', sameOriginOnly, requireAjaxHeader, verifyCsrf, (req, res) => {
  const carId = Number(req.body.carId);
  const dateStart = String(req.body.dateStart || '');
  const dateEnd = String(req.body.dateEnd || '');

  if (!Number.isInteger(carId) || !isValidISODate(dateStart) || !isValidISODate(dateEnd)) {
    return res.status(400).json({
      available: false,
      error: 'Données invalides'
    });
  }

  const car = CARS.find(c => c.id === carId);
  if (!car) {
    return res.status(400).json({
      available: false,
      error: 'Véhicule invalide'
    });
  }

  const days = countRentalDays(dateStart, dateEnd);
  if (!days) {
    return res.status(400).json({
      available: false,
      error: 'Dates incohérentes'
    });
  }

  if (isHeld(carId, dateStart, dateEnd)) {
    return res.status(409).json({
      available: false,
      error: 'Ce véhicule est déjà réservé sur ces dates. Réessaie dans quelques minutes.'
    });
  }

  return res.json({ available: true });
});

// Endpoint réservation
app.post(
  '/api/reserve',
  sameOriginOnly,
  requireAjaxHeader,
  verifyCsrf,
  async (req, res) => {
    try {
      const token = process.env.TG_TOK;
      const chatId = process.env.TG_CID;

      if (!token || !chatId || chatId === 'VOTRE_CHAT_ID_ICI') {
        return res.status(500).json({ error: 'Configuration Telegram manquante' });
      }

      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Payload invalide' });
      }

      // Honeypot anti-bot
      if (req.body.website) {
        return res.status(400).json({ error: 'Bot détecté' });
      }

      const carId = Number(req.body.carId);
      const car = CARS.find(c => c.id === carId);

      const name = cleanText(req.body.name, 80);
      const email = cleanText(req.body.email, 120);
      const phone = cleanText(req.body.phone, 25);
      const dateStart = String(req.body.dateStart || '');
      const dateEnd = String(req.body.dateEnd || '');
      const delivery = Boolean(req.body.delivery);
      const payImg = String(req.body.payImg || '');

      if (!car) {
        return res.status(400).json({ error: 'Véhicule invalide' });
      }

      if (!name || !email || !phone || !dateStart || !dateEnd) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Email invalide' });
      }

      if (!isValidPhone(phone)) {
        return res.status(400).json({ error: 'Téléphone invalide' });
      }

      if (!isValidISODate(dateStart) || !isValidISODate(dateEnd)) {
        return res.status(400).json({ error: 'Dates invalides' });
      }

      const days = countRentalDays(dateStart, dateEnd);
      if (!days) {
        return res.status(400).json({ error: 'Dates incohérentes' });
      }

      if (isHeld(carId, dateStart, dateEnd)) {
        return res.status(409).json({
          error: "Ce véhicule est déjà réservé sur ces dates. Veuillez sélectionner d'autres dates ou choisir un autre véhicule."
        });
      }

      const subtotal = car.price * days;
      const discount = getDiscount(days);
      const total = Math.max(0, subtotal - discount);
      const deposit = Math.min(car.dep, total);
      const balance = Math.max(0, total - deposit);

      const message =
        `🚗 Nouvelle réservation PL LOCATION\n\n` +
        `Véhicule : ${car.name}\n` +
        `Prix location : ${car.price}€ x ${days} jour${days > 1 ? 's' : ''} = ${subtotal}€\n` +
        (discount > 0 ? `Réduction 3 jours ou + : -${discount}€\n` : '') +
        `Total : ${total}€\n` +
        `Acompte : ${deposit}€\n` +
        `Reste sur place : ${balance}€\n\n` +
        `Client : ${name}\n` +
        `Email : ${email}\n` +
        `Téléphone : ${phone}\n` +
        `Du : ${dateStart}\n` +
        `Au : ${dateEnd}\n` +
        `Livraison : ${delivery ? 'Oui' : 'Non'}`;

      const ctrl1 = new AbortController();
      const timer1 = setTimeout(() => ctrl1.abort(), 10000);

      const tgRes = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            disable_web_page_preview: true
          }),
          signal: ctrl1.signal
        }
      ).finally(() => clearTimeout(timer1));

      const tgJson = await tgRes.json().catch(() => ({}));

      if (!tgRes.ok || !tgJson.ok) {
        console.error('Telegram text error:', tgJson);
        return res.status(502).json({
          error: tgJson.description || 'Échec envoi Telegram'
        });
      }

      // IMPORTANT :
      // Le blocage 10 min est ajouté SEULEMENT après réservation vraiment envoyée à Telegram.
      addHold(carId, dateStart, dateEnd);

      res.json({ success: true });

      // ====== ENVOI FICHIERS EN ARRIÈRE-PLAN ======
      (async () => {
        try {
          const allDocs = [
            { key: 'docP', label: '🪪 Permis de conduire' },
            { key: 'docI', label: "🪪 Carte d'identité" },
            { key: 'docJ', label: '🏠 Justificatif de domicile' }
          ];

          const mediaGroup = [];
          const mediaBuffers = [];
          const pdfPromises = [];

          for (const { key, label } of allDocs) {
            const docData = String(req.body[key] || '');
            if (!docData) continue;

            const decoded = decodeDataUri(docData, ['application/pdf', 'image/jpeg', 'image/png'], 5 * 1024 * 1024);
            if (!decoded) continue;

            const { mimeType, buf } = decoded;
            const isPdf = mimeType === 'application/pdf';
            const ext = isPdf ? 'pdf' : mimeType.split('/')[1];

            if (isPdf) {
              const formPdf = new FormData();
              formPdf.append('chat_id', chatId);
              formPdf.append('caption', label);
              formPdf.append('document', buf, { filename: `${key}.${ext}`, contentType: mimeType });

              pdfPromises.push(
                fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
                  method: 'POST',
                  headers: formPdf.getHeaders(),
                  body: formPdf
                }).catch(e => console.error(`PDF ${key} error:`, e))
              );
            } else {
              mediaGroup.push({ type: 'photo', media: `attach://${key}`, caption: label });
              mediaBuffers.push({ key, buf, mimeType, ext });
            }
          }

          let albumPromise = Promise.resolve();

          if (mediaGroup.length > 0) {
            const formAlbum = new FormData();
            formAlbum.append('chat_id', chatId);
            formAlbum.append('media', JSON.stringify(mediaGroup));

            for (const { key, buf, mimeType, ext } of mediaBuffers) {
              formAlbum.append(key, buf, { filename: `${key}.${ext}`, contentType: mimeType });
            }

            albumPromise = fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
              method: 'POST',
              headers: formAlbum.getHeaders(),
              body: formAlbum
            }).catch(e => console.error('Album error:', e));
          }

          let payPromise = Promise.resolve();

          const decodedPay = decodeDataUri(payImg, ['image/jpeg', 'image/png', 'image/webp'], 2 * 1024 * 1024);

          if (decodedPay) {
            const { mimeType, buf } = decodedPay;
            const ext = mimeType.split('/')[1];
            const formPay = new FormData();

            formPay.append('chat_id', chatId);
            formPay.append('caption', '💳 Paysafecard');
            formPay.append('photo', buf, { filename: `paysafecard.${ext}`, contentType: mimeType });

            payPromise = fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
              method: 'POST',
              headers: formPay.getHeaders(),
              body: formPay
            }).catch(e => console.error('Paysafecard error:', e));
          }

          await Promise.all([albumPromise, payPromise, ...pdfPromises]);

          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
              disable_notification: true
            })
          }).catch(e => console.error('Separator error:', e));

        } catch (e) {
          console.error('Background send error:', e);
        }
      })();

    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ error: 'Erreur interne serveur' });
    }
  }
);

// ====== START ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});