// ====== HELPERS ======
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function sanitizeText(v, max = 120) {
  return String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(v || '').trim());
}

function isValidPhone(v) {
  return /^[+\d\s().-]{6,20}$/.test(String(v || '').trim());
}

function getCookie(name) {
  const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
  return match ? match.split('=')[1] : '';
}

function formatEUR(value) {
  return `${Math.max(0, Math.round(Number(value) || 0))}€`;
}

// ====== CURSOR ======
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  if (cur) {
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  }
});

(function ar() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  if (ring) {
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
  }
  requestAnimationFrame(ar);
})();

document.addEventListener('mouseover', e => {
  if (e.target.closest('button,a,.cc,.vi,.sc2,.ndi,.rc')) {
    document.body.classList.add('ch');
  }
});

document.addEventListener('mouseout', e => {
  if (e.target.closest('button,a,.cc,.vi,.sc2,.ndi,.rc')) {
    document.body.classList.remove('ch');
  }
});

// ====== SCROLL ======
window.addEventListener('scroll', () => {
  const prog = document.getElementById('prog');
  if (prog) {
    const total = Math.max(1, document.body.scrollHeight - window.innerHeight);
    prog.style.width = ((window.scrollY / total) * 100) + '%';
  }
  document.getElementById('nav')?.classList.toggle('sc', window.scrollY > 20);
});

// ====== PARTICLES ======
(() => {
  const c = document.getElementById('hpart');
  if (!c) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'p';
    p.style.cssText =
      `left:${Math.random() * 100}%;width:${1 + Math.random() * 2.5}px;height:${1 + Math.random() * 2.5}px;animation-duration:${9 + Math.random() * 11}s;animation-delay:${-Math.random() * 14}s;opacity:${.2 + Math.random() * .55}`;
    c.appendChild(p);
  }
})();

// ====== REVEAL ======
const ob = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('on');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.rv,.rvl,.rvr').forEach(el => ob.observe(el));

// ====== DATA ======
const CARS = [
  {
    id: 0,
    name: 'AUDI RS3',
    price: 280,
    dep: 150,
    img: '/cars/RS3.png',
    desc: 'Berline compacte ultra sportive au design agressif et aux performances impressionnantes.',
    full: `L’Audi RS3 est une référence des compactes sportives. Grâce à sa transmission quattro et son moteur puissant, elle offre une accélération fulgurante et une tenue de route exceptionnelle. Parfaite pour une conduite dynamique tout en gardant un confort premium.`,
    tags: ['Quattro', 'Sport', 'GPS', 'Clim auto'],
    badge: 'Premium / Sport',
    bc: 'premium'
  },
  {
    id: 1,
    name: 'AUDI RSQ3',
    price: 260,
    dep: 150,
    img: '/cars/RSQ3.png',
    desc: 'SUV sportif alliant puissance, confort et espace.',
    full: `Le RSQ3 combine la sportivité Audi avec le confort d’un SUV. Idéal pour les longs trajets comme pour la ville, il offre puissance, stabilité et espace.`,
    tags: ['SUV', 'Sport', 'GPS'],
    badge: 'SUV / Sport',
    bc: 'suv'
  },
  {
    id: 2,
    name: 'PORSCHE CAYENNE',
    price: 220,
    dep: 100,
    img: '/cars/PORSHCAYENNE.png',
    desc: 'SUV de luxe puissant offrant un confort exceptionnel.',
    full: `Le Porsche Cayenne incarne le luxe et la performance. Confort haut de gamme, puissance et design élégant pour une expérience de conduite premium.`,
    tags: ['Luxe', 'SUV', 'Cuir'],
    badge: 'SUV / Luxe',
    bc: 'suv'
  },
  {
    id: 3,
    name: 'GOLF 8 R',
    price: 210,
    dep: 100,
    img: '/cars/GOLF8BLEU.png',
    desc: 'Compacte sportive 4Motion ultra performante.',
    full: `La Golf 8 R offre une conduite précise grâce à sa transmission intégrale. Parfaite pour ceux qui veulent performance et contrôle.`,
    tags: ['4Motion', 'Sport'],
    badge: 'Sport',
    bc: 'sport'
  },
  {
    id: 4,
    name: 'GOLF 8 GTI',
    price: 180,
    dep: 100,
    img: '/cars/Golf 8 GRIS.png',
    desc: 'Compacte sportive iconique et polyvalente.',
    full: `La Golf GTI est une référence. Sportive, fiable et agréable à conduire au quotidien.`,
    tags: ['Sport', 'Eco'],
    badge: 'Sport',
    bc: 'sport'
  },
  {
    id: 5,
    name: 'AUDI RS7',
    price: 300,
    dep: 150,
    img: '/cars/RS7.png',
    desc: 'Berline de luxe ultra performante et élégante.',
    full: `L’Audi RS7 allie puissance extrême et confort premium. Un véhicule haut de gamme pour une expérience unique.`,
    tags: ['Luxe', 'Sport', 'Cuir'],
    badge: 'Luxe',
    bc: 'luxury'
  },
  {
    id: 6,
    name: 'A45S AMG',
    price: 270,
    dep: 150,
    img: '/cars/A45.png',
    desc: 'Compacte AMG ultra nerveuse et performante.',
    full: `La A45S AMG est une machine de guerre compacte. Accélération brutale, tenue de route parfaite et sensations fortes garanties.`,
    tags: ['AMG', 'Sport'],
    badge: 'Sport',
    bc: 'sport'
  },
  {
    id: 7,
    name: 'CLIO V ALPINE',
    price: 150,
    dep: 100,
    img: '/cars/CLIO.png',
    desc: 'Citadine économique idéale pour la ville.',
    full: `La Clio Alpine est parfaite pour les déplacements quotidiens. Économique, pratique et moderne.`,
    tags: ['Eco', 'Ville'],
    badge: 'Citadine',
    bc: 'citadine'
  },
  {
    id: 8,
    name: 'BMW 128TI',
    price: 190,
    dep: 100,
    img: '/cars/BMW.png',
    desc: 'Compacte BMW sportive et agréable à conduire.',
    full: `La BMW 128ti offre une conduite dynamique avec un excellent confort. Idéale pour les amateurs de sensations.`,
    tags: ['BMW', 'Sport'],
    badge: 'Sport',
    bc: 'sport'
  },
  {
    id: 9,
    name: 'C63S AMG',
    price: 300,
    dep: 150,
    img: '/cars/C63.png',
    desc: 'Berline AMG puissante et luxueuse.',
    full: `La C63S AMG est une berline exceptionnelle combinant puissance brute et luxe intérieur.`,
    tags: ['AMG', 'Luxe'],
    badge: 'Luxe',
    bc: 'luxury'
  },
  {
    id: 10,
    name: 'PEUGEOT 308',
    price: 160,
    dep: 100,
    img: '/cars/308.png',
    desc: 'Compacte moderne économique et confortable.',
    full: `La Peugeot 308 est idéale pour un usage quotidien avec confort et faible consommation.`,
    tags: ['Eco', 'Compact'],
    badge: 'Économique',
    bc: 'compact'
  }
];

const REVIEWS = [
  { n: 'Ahmed M.', l: 'Paris', c: '#2563EB', s: 5, t: "Service impeccable du début à la fin. Aucune caution demandée comme promis. Le paiement en Paysafecard est vraiment pratique." },
  { n: 'Camille R.', l: 'Lyon', c: '#7C3AED', s: 5, t: "Réservation en moins de 5 minutes. L'équipe est réactive. La Clio était nickel, propre et bien entretenue." },
  { n: 'Sébastien D.', l: 'Marseille', c: '#059669', s: 5, t: "Excellent rapport qualité/prix. Sans caution c'est un plus énorme. Le SUV était spacieux." },
  { n: 'Inès B.', l: 'Bordeaux', c: '#DC2626', s: 5, t: "Très bonne expérience. La livraison à domicile est un vrai service premium." },
  { n: 'Kevin L.', l: 'Nantes', c: '#D97706', s: 5, t: "J'avais des doutes mais tout s'est très bien passé. La BMW était magnifique." },
  { n: 'Amira S.', l: 'Paris', c: '#0891B2', s: 5, t: "Service 5 étoiles. Réactivité exemplaire, véhicule en excellent état." }
];

// ====== RENDER CARS ======
const carsGrid = document.getElementById('carsGrid');
if (carsGrid) {
  carsGrid.innerHTML = CARS.map(c => `
    <div class="cc rv" style="transition-delay:${c.id * .09}s">
      <div class="ciw">
        <img src="${esc(c.img)}" alt="${esc(c.name)}" loading="lazy">
        <div class="cbadge ${esc(c.bc)}">${esc(c.badge)}</div>
        <div class="cprice">${formatEUR(c.price)}<span>/jour</span></div>
      </div>
      <div class="ci">
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.desc)}</p>
        <div class="ctags">
          ${c.tags.slice(0, 3).map(t => `<span class="ctag">${esc(t)}</span>`).join('')}
          ${c.tags.length > 3 ? `<span class="ctag">+${c.tags.length - 3}</span>` : ''}
        </div>
        <div class="cact">
          <button class="btnres" onclick="openResCar(${c.id})">Réserver</button>
          <button class="btneye" onclick="openDet(${c.id})">Voir</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ====== RENDER REVIEWS ======
const starSvg = '<svg viewBox="0 0 24 24" style="width:15px;height:15px;fill:#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

const reviewsGrid = document.getElementById('reviewsGrid');
if (reviewsGrid) {
  reviewsGrid.innerHTML = REVIEWS.map((r, i) => `
    <div class="rc rv" style="transition-delay:${i * .07}s">
      <div class="rq">"</div>
      <div class="rstars">${starSvg.repeat(r.s)}</div>
      <p class="rt">${esc(r.t)}</p>
      <div class="ra">
        <div class="rav" style="background:${esc(r.c)}">${esc(r.n.split(' ').map(x => x[0]).join(''))}</div>
        <div class="rai"><h5>${esc(r.n)}</h5><span>${esc(r.l)}</span></div>
      </div>
    </div>
  `).join('');
}

const rbs = document.getElementById('rbs');
if (rbs) rbs.innerHTML = starSvg.repeat(5);

document.querySelectorAll('.rv,.rvl,.rvr').forEach(el => ob.observe(el));

// ====== MODAL STATE ======
let step = 1;
let car = null;
let detId = null;
let sendingReservation = false;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getRentalDays() {
  const dStart = document.getElementById('dStart')?.value || '';
  const dEnd = document.getElementById('dEnd')?.value || '';

  if (!dStart || !dEnd) return 1;

  const start = new Date(`${dStart}T00:00:00`);
  const end = new Date(`${dEnd}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 1;
  }

  return Math.max(1, Math.floor((end - start) / MS_PER_DAY) + 1);
}

function getPriceSummary() {
  if (!car) return { days: 1, total: 0, dep: 0, balance: 0, discount: 0 };

  const days = getRentalDays();
  let total = car.price * days;

  // 🎁 REDUCTION
  let discount = 0;
  if (days >= 3) {
    discount = 200;
    total = total - discount;
  }

  const dep = Math.min(car.dep, total);
  const balance = Math.max(0, total - dep);

  return { days, total, dep, balance, discount };
}

function priceLine() {
  if (!car) return '—';

  const { days } = getPriceSummary();
  return `${formatEUR(car.price)} x ${days} jour${days > 1 ? 's' : ''}`;
}

function wirePriceInputs() {
  ['dStart', 'dEnd'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.priceWired) {
      el.addEventListener('change', () => {
        fillPsb();
        fillStep4();
      });
      el.addEventListener('input', () => {
        fillPsb();
        fillStep4();
      });
      el.dataset.priceWired = '1';
    }
  });
}

// ====== TOAST ======
function showToast(msg, title = 'Attention') {
  const container = document.getElementById('toast-container');
  if (!container) {
    alert(msg);
    return;
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <div class="toast-content">
      <div class="toast-title">${esc(title)}</div>
      <div class="toast-msg">${esc(msg)}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ====== RESERVATION MODAL ======
function closeRes() {
  if (sendingReservation) return;
  const modal = document.getElementById('resModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
}

function renderVlist() {
  const vlist = document.getElementById('vlist');
  if (!vlist) return;

  vlist.innerHTML = CARS.map(c => `
    <div class="vi" id="vi${c.id}" onclick="selCar(${c.id})">
      <img src="${esc(c.img)}" alt="${esc(c.name)}">
      <div class="vii">
        <h4>${esc(c.name)}</h4>
        <span>${esc(c.badge)} — Prix location : ${formatEUR(c.price)} / jour</span>
      </div>
      <div class="vip">${formatEUR(c.price)}/j</div>
    </div>
  `).join('');
}

function selCar(id) {
  document.querySelectorAll('.vi').forEach(v => v.classList.remove('sel'));

  const selected = document.getElementById('vi' + id);
  if (selected) selected.classList.add('sel');

  car = CARS.find(x => x.id === id) || null;

  if (step >= 2) fillStep2();

  fillPsb();
  fillStep4();
}

async function checkAvailability() {
  if (!car) return false;

  const csrfToken = getCookie('csrf');

  const res = await fetch('/api/check-availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'fetch',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      carId: car.id,
      dateStart: document.getElementById('dStart').value,
      dateEnd: document.getElementById('dEnd').value
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.available) {
    showToast(data.error || 'Ce véhicule est déjà réservé sur ces dates.', 'Déjà réservé');
    return false;
  }

  return true;
}

function updateStep() {
  for (let i = 1; i <= 5; i++) {
    document.getElementById('step' + i)?.classList.toggle('act', i === step);

    const d = document.getElementById('sd' + i);
    if (d) {
      d.classList.toggle('act', i === step);
      d.classList.toggle('dn', i < step);
    }
  }

  for (let i = 1; i <= 4; i++) {
    document.getElementById('sl' + i)?.classList.toggle('dn', i < step);
  }

  const bk = document.getElementById('btnBk');
  const nx = document.getElementById('btnNx');
  const mf = document.getElementById('mfoot');

  if (!bk || !nx || !mf) return;

  if (step === 5) {
    mf.style.justifyContent = 'center';
    bk.style.display = 'none';
    nx.textContent = 'Terminer';
    nx.onclick = closeRes;
    nx.disabled = false;
  } else {
    mf.style.justifyContent = 'space-between';
    bk.style.display = step === 1 ? 'none' : 'flex';
    nx.textContent = step === 4 ? 'Envoyer ma réservation' : 'Suivant';
    nx.onclick = nextStep;
    nx.disabled = sendingReservation;
  }
}

function validateStep(s) {
  if (s === 1) {
    if (!car) {
      showToast('Veuillez sélectionner un véhicule pour continuer.');
      return false;
    }
  }

  if (s === 2) {
    const dStart = document.getElementById('dStart')?.value;
    const dEnd = document.getElementById('dEnd')?.value;
    const rName = sanitizeText(document.getElementById('rName')?.value, 80);
    const rEmail = sanitizeText(document.getElementById('rEmail')?.value, 120);
    const rPhone = sanitizeText(document.getElementById('rPhone')?.value, 25);

    if (!dStart || !dEnd || !rName || !rEmail || !rPhone) {
      showToast('Tous les champs sont obligatoires pour votre réservation.');
      return false;
    }

    if (!isValidEmail(rEmail)) {
      showToast('Adresse email invalide.');
      return false;
    }

    if (!isValidPhone(rPhone)) {
      showToast('Numéro de téléphone invalide.');
      return false;
    }

    if (new Date(`${dEnd}T00:00:00`) < new Date(`${dStart}T00:00:00`)) {
      showToast('La date de fin doit être après la date de début.');
      return false;
    }
  }

  if (s === 3) {
    const docP = document.getElementById('docP')?.classList.contains('ok');
    const docI = document.getElementById('docI')?.classList.contains('ok');
    const docJ = document.getElementById('docJ')?.classList.contains('ok');

    if (!docP || !docI || !docJ) {
      showToast('Veuillez joindre les 3 documents demandés pour votre dossier.');
      return false;
    }
  }

  if (s === 4) {
    const img = document.getElementById('pimg');

    if (!img?.src || !img.src.startsWith('data:image/')) {
      showToast("La photo du code Paysafecard est nécessaire pour confirmer l'acompte.");
      return false;
    }
  }

  return true;
}

async function nextStep() {
  if (sendingReservation) return;
  if (!validateStep(step)) return;
  if (step === 2) {
    const ok = await checkAvailability();
    if (!ok) return;
  }
  if (step === 1) fillStep2();
  if (step === 3) fillStep4();

  if (step === 4) {
    const nx = document.getElementById('btnNx');

    sendingReservation = true;

    if (nx) {
      nx.disabled = true;
      nx.textContent = 'Envoi en cours...';
    }

    try {
      await sendTG();
      step = 5;
      sendingReservation = false;
      updateStep();
    } catch (err) {
      sendingReservation = false;
      showToast(err.message || "Erreur lors de l'envoi.", "Erreur");

      if (nx) {
        nx.disabled = false;
        nx.textContent = 'Envoyer ma réservation';
      }
    }

    return;
  }

  if (step < 5) {
    step++;
    updateStep();
  }
}

function prevStep() {
  if (sendingReservation) return;

  if (step > 1) {
    step--;
    updateStep();
  }
}

function fillStep2() {
  if (!car) return;

  wirePriceInputs();

  const scm = document.getElementById('scm');
  if (scm) {
    scm.innerHTML = `
      <img src="${esc(car.img)}" alt="${esc(car.name)}">
      <div>
        <h4>${esc(car.name)}</h4>
        <span>${formatEUR(car.price)} / jour</span>
      </div>
    `;
  }

  fillPsb();
}

function fillPsb() {
  if (!car) return;

  const { total, discount } = getPriceSummary();

  const carEl = document.getElementById('psb-car');
  const priceEl = document.getElementById('psb-price');
  const totalEl = document.getElementById('psb-total');

  if (carEl) carEl.textContent = car.name;
  if (priceEl) priceEl.textContent = priceLine();

  if (totalEl) {
    totalEl.textContent = formatEUR(total);
  }

  // BONUS affichage reduc
  let reducBox = document.getElementById('psb-reduc');
  if (!reducBox) {
    reducBox = document.createElement('div');
    reducBox.id = 'psb-reduc';
    reducBox.style.color = '#16a34a';
    reducBox.style.fontWeight = '700';
    reducBox.style.marginTop = '6px';
    totalEl?.parentNode?.appendChild(reducBox);
  }

  if (discount > 0) {
    reducBox.textContent = `Réduction appliquée : -${formatEUR(discount)}`;
  } else {
    reducBox.textContent = '';
  }
}

function fillStep4() {
  if (!car) return;

  const { total, dep, balance, discount } = getPriceSummary();

  document.getElementById('p4-car').textContent = car.name;
  document.getElementById('p4-price').textContent = priceLine();
  document.getElementById('p4-total').textContent = formatEUR(total);
  document.getElementById('p4-dep').textContent = formatEUR(dep);
  document.getElementById('p4-bal').textContent = formatEUR(balance);

  // affichage reduc
  let reduc = document.getElementById('p4-reduc');
  if (!reduc) {
    reduc = document.createElement('div');
    reduc.id = 'p4-reduc';
    reduc.style.color = '#16a34a';
    reduc.style.fontWeight = '700';
    reduc.style.marginTop = '6px';
    document.getElementById('p4-total').parentNode.appendChild(reduc);
  }

  if (discount > 0) {
    reduc.textContent = `Réduction : -${formatEUR(discount)}`;
  } else {
    reduc.textContent = '';
  }
}
// ====== SEND RESERVATION ======
async function sendTG() {
  if (!car) {
    throw new Error("Aucun véhicule sélectionné");
  }

  const pimgEl = document.getElementById("pimg");
  const payImg = pimgEl?.src?.startsWith("data:image/") ? pimgEl.src : "";

  const payload = {
    carId: car.id,
    carName: car.name,
    pricePerDay: car.price,
    deposit: car.dep,
    total: getPriceSummary().total,
    balance: getPriceSummary().balance,
    days: getPriceSummary().days,
    name: sanitizeText(document.getElementById("rName")?.value, 80),
    email: sanitizeText(document.getElementById("rEmail")?.value, 120),
    phone: sanitizeText(document.getElementById("rPhone")?.value, 25),
    dateStart: document.getElementById("dStart")?.value || "",
    dateEnd: document.getElementById("dEnd")?.value || "",
    delivery: Boolean(document.getElementById("dlvCheck")?.checked),
    website: document.getElementById("website")?.value || "",
    payImg: payImg,
    docP: docFiles.docP || "",
    docI: docFiles.docI || "",
    docJ: docFiles.docJ || ""
  };

  const csrfToken = getCookie('csrf');

  const res = await fetch("/api/reserve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "fetch",
      "X-CSRF-Token": csrfToken
    },
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Échec envoi réservation");
  }

  return data;
}

// ====== DOCS ======
const docFiles = {
  docP: null,
  docI: null,
  docJ: null
};

function okDoc(id, input) {
  const el = document.getElementById(id);
  if (!el) return;

  const inp = input || el.querySelector('input[type="file"]');
  if (!inp?.files?.[0]) return;

  const file = inp.files[0];
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxBytes = 5 * 1024 * 1024;

  if (!allowed.includes(file.type)) {
    showToast('Format invalide. Utilise JPG, PNG ou PDF.');
    inp.value = '';
    return;
  }

  if (file.size > maxBytes) {
    showToast('Fichier trop lourd. Maximum 5 Mo.');
    inp.value = '';
    return;
  }

  const r = new FileReader();

  r.onload = ev => {
    const result = String(ev.target?.result || '');
    docFiles[id] = result;
    el.classList.add('ok');
  };

  r.readAsDataURL(file);
}

function prevPay(inp) {
  if (!inp?.files?.[0]) return;

  const file = inp.files[0];
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  const maxBytes = 2 * 1024 * 1024;

  if (!allowed.includes(file.type)) {
    showToast('Format image invalide. Utilise JPG, PNG ou WEBP.');
    inp.value = '';
    return;
  }

  if (file.size > maxBytes) {
    showToast('Image trop lourde. Maximum 2 Mo.');
    inp.value = '';
    return;
  }

  const r = new FileReader();

  r.onload = ev => {
    const result = String(ev.target?.result || '');

    if (!result.startsWith('data:image/')) {
      showToast('Image invalide.');
      inp.value = '';
      return;
    }

    const pimg = document.getElementById('pimg');
    const pprev = document.getElementById('pprev');

    if (pimg) pimg.src = result;
    if (pprev) pprev.style.display = 'block';
  };

  r.readAsDataURL(file);
}

// ====== DETAIL MODAL ======
function openDet(id) {
  const c = CARS.find(x => x.id === id);
  if (!c) return;

  detId = id;

  const dimg = document.getElementById('dimg');
  const ddbadge = document.getElementById('ddbadge');
  const dprn = document.getElementById('dprn');
  const dname = document.getElementById('dname');
  const ddesc = document.getElementById('ddesc');
  const deq = document.getElementById('deq');
  const modal = document.getElementById('detailModal');

  if (dimg) {
    dimg.src = c.img;
    dimg.alt = c.name;
  }

  if (ddbadge) {
    ddbadge.textContent = c.badge;
    ddbadge.className = 'ddb ' + c.bc;
  }

  if (dprn) dprn.textContent = formatEUR(c.price);
  if (dname) dname.textContent = c.name;
  if (ddesc) ddesc.textContent = c.full;

  if (deq) {
    deq.innerHTML = c.tags.map(t => `
      <div class="ei">
        <div class="eck">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        ${esc(t)}
      </div>
    `).join('');
  }

  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden', 'false');
}

function closeDet() {
  const modal = document.getElementById('detailModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
}

function resFromDet() {
  closeDet();
  openResCar(detId);
}

window.openRes = function () {
  step = 1;
  car = null;
  sendingReservation = false;

  const modal = document.getElementById('resModal');
  const vlist = document.getElementById('vlist');

  if (!modal || !vlist) return;

  renderVlist();

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  updateStep();
};

window.openResCar = function (id) {
  window.openRes();
  selCar(id);
};

// ====== ACCESSIBILITY + INIT ======
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDet();
    closeRes();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().slice(0, 10);

  ['dStart', 'dEnd'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });

  wirePriceInputs();
});