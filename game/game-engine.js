// ═══════════════════════════════════════════
// PIXELBOO KONG — Full Game Engine
// ═══════════════════════════════════════════

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const T = 16; // tile size
const COLS = 28, ROWS = 24;
const GW = COLS * T, GH = ROWS * T;
canvas.width = GW; canvas.height = GH;

// ── AUDIO ──
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function ensureAudio() { if (!audioCtx) audioCtx = new AudioCtx(); }

function playSound(type) {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0.15, now);

  if (type === 'jump') {
    osc.type = 'square'; osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);
    osc.start(now); osc.stop(now + 0.15);
  } else if (type === 'coin') {
    osc.type = 'square'; osc.frequency.setValueAtTime(988, now);
    osc.frequency.setValueAtTime(1319, now + 0.08);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now); osc.stop(now + 0.2);
  } else if (type === 'die') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.6);
    gain.gain.linearRampToValueAtTime(0, now + 0.7);
    osc.start(now); osc.stop(now + 0.7);
  } else if (type === 'barrel_jump') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.08);
    gain.gain.linearRampToValueAtTime(0, now + 0.12);
    osc.start(now); osc.stop(now + 0.12);
  } else if (type === 'hammer') {
    osc.type = 'square'; osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);
  } else if (type === 'win') {
    osc.type = 'square';
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => { osc.frequency.setValueAtTime(f, now + i * 0.12); });
    gain.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.start(now); osc.stop(now + 0.6);
  } else if (type === 'levelup') {
    osc.type = 'square';
    const notes = [392, 494, 588, 784];
    notes.forEach((f, i) => { osc.frequency.setValueAtTime(f, now + i * 0.1); });
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(now); osc.stop(now + 0.5);
  }
}

// ── SPRITES ──
const SPR = {
  ghost: [
    [4,1,'#fff'],[5,1,'#fff'],[6,1,'#fff'],[7,1,'#fff'],[8,1,'#fff'],[9,1,'#fff'],[10,1,'#fff'],[11,1,'#fff'],
    [3,2,'#fff'],[4,2,'#fff'],[5,2,'#fff'],[6,2,'#fff'],[7,2,'#fff'],[8,2,'#fff'],[9,2,'#fff'],[10,2,'#fff'],[11,2,'#fff'],[12,2,'#fff'],
    [2,3,'#fff'],[3,3,'#fff'],[4,3,'#fff'],[5,3,'#fff'],[6,3,'#fff'],[7,3,'#fff'],[8,3,'#fff'],[9,3,'#fff'],[10,3,'#fff'],[11,3,'#fff'],[12,3,'#fff'],[13,3,'#fff'],
    [1,4,'#fff'],[2,4,'#fff'],[3,4,'#fff'],[4,4,'#fff'],[5,4,'#fff'],[6,4,'#fff'],[7,4,'#fff'],[8,4,'#fff'],[9,4,'#fff'],[10,4,'#fff'],[11,4,'#fff'],[12,4,'#fff'],[13,4,'#fff'],[14,4,'#fff'],
    [1,5,'#fff'],[2,5,'#fff'],[3,5,'#fff'],[4,5,'#fff'],[5,5,'#111'],[6,5,'#111'],[7,5,'#fff'],[8,5,'#fff'],[9,5,'#fff'],[10,5,'#111'],[11,5,'#111'],[12,5,'#fff'],[13,5,'#fff'],[14,5,'#fff'],
    [1,6,'#fff'],[2,6,'#fff'],[3,6,'#fff'],[4,6,'#fff'],[5,6,'#111'],[6,6,'#111'],[7,6,'#fff'],[8,6,'#fff'],[9,6,'#fff'],[10,6,'#111'],[11,6,'#111'],[12,6,'#fff'],[13,6,'#fff'],[14,6,'#fff'],
    [1,7,'#fff'],[2,7,'#fff'],[3,7,'#fff'],[4,7,'#e40'],[5,7,'#e40'],[6,7,'#e40'],[7,7,'#e40'],[8,7,'#fff'],[9,7,'#fff'],[10,7,'#fff'],[11,7,'#fff'],[12,7,'#fff'],[13,7,'#fff'],[14,7,'#fff'],
    [1,8,'#fff'],[2,8,'#fff'],[3,8,'#e40'],[4,8,'#e40'],[5,8,'#e40'],[6,8,'#e40'],[7,8,'#e40'],[8,8,'#e40'],[9,8,'#fff'],[10,8,'#fff'],[11,8,'#fff'],[12,8,'#fff'],[13,8,'#fff'],[14,8,'#fff'],
    [2,9,'#fff'],[3,9,'#fff'],[4,9,'#fff'],[5,9,'#fff'],[6,9,'#fff'],[7,9,'#fff'],[8,9,'#fff'],[9,9,'#fff'],[10,9,'#fff'],[11,9,'#fff'],[12,9,'#fff'],[13,9,'#fff'],
    [2,10,'#fff'],[3,10,'#fff'],[4,10,'#fff'],[5,10,'#fff'],[6,10,'#fff'],[7,10,'#fff'],[8,10,'#fff'],[9,10,'#fff'],[10,10,'#fff'],[11,10,'#fff'],[12,10,'#fff'],[13,10,'#fff'],
    [3,11,'#fff'],[4,11,'#fff'],[5,11,'#fff'],[7,11,'#fff'],[8,11,'#fff'],[10,11,'#fff'],[11,11,'#fff'],[12,11,'#fff'],
    [3,12,'#fff'],[4,12,'#fff'],[8,12,'#fff'],[11,12,'#fff'],[12,12,'#fff'],
  ],
  barrel: [
    [1,0,'#9c3800'],[2,0,'#c84c09'],[3,0,'#c84c09'],[4,0,'#c84c09'],[5,0,'#c84c09'],[6,0,'#9c3800'],
    [0,1,'#9c3800'],[1,1,'#c84c09'],[2,1,'#e8a200'],[3,1,'#c84c09'],[4,1,'#c84c09'],[5,1,'#e8a200'],[6,1,'#c84c09'],[7,1,'#9c3800'],
    [0,2,'#9c3800'],[1,2,'#c84c09'],[2,2,'#c84c09'],[3,2,'#c84c09'],[4,2,'#c84c09'],[5,2,'#c84c09'],[6,2,'#c84c09'],[7,2,'#9c3800'],
    [0,3,'#c84c09'],[1,3,'#e8a200'],[2,3,'#c84c09'],[3,3,'#e8a200'],[4,3,'#e8a200'],[5,3,'#c84c09'],[6,3,'#e8a200'],[7,3,'#c84c09'],
    [0,4,'#9c3800'],[1,4,'#c84c09'],[2,4,'#c84c09'],[3,4,'#c84c09'],[4,4,'#c84c09'],[5,4,'#c84c09'],[6,4,'#c84c09'],[7,4,'#9c3800'],
    [0,5,'#9c3800'],[1,5,'#c84c09'],[2,5,'#e8a200'],[3,5,'#c84c09'],[4,5,'#c84c09'],[5,5,'#e8a200'],[6,5,'#c84c09'],[7,5,'#9c3800'],
    [1,6,'#9c3800'],[2,6,'#c84c09'],[3,6,'#c84c09'],[4,6,'#c84c09'],[5,6,'#c84c09'],[6,6,'#9c3800'],
  ],
  coin: [
    [2,0,'#fbd000'],[3,0,'#fbd000'],
    [1,1,'#fbd000'],[2,1,'#fff'],[3,1,'#fbd000'],[4,1,'#e8a200'],
    [1,2,'#fbd000'],[2,2,'#fff'],[3,2,'#fbd000'],[4,2,'#e8a200'],
    [1,3,'#fbd000'],[2,3,'#fbd000'],[3,3,'#e8a200'],[4,3,'#e8a200'],
    [2,4,'#e8a200'],[3,4,'#e8a200'],
  ],
  hammer: [
    [0,0,'#8B4513'],[1,0,'#8B4513'],
    [0,1,'#8B4513'],[1,1,'#8B4513'],
    [0,2,'#8B4513'],[1,2,'#8B4513'],
    [2,0,'#888'],[3,0,'#888'],[4,0,'#888'],
    [2,1,'#aaa'],[3,1,'#ccc'],[4,1,'#aaa'],
    [2,2,'#888'],[3,2,'#888'],[4,2,'#888'],
  ],
  fire: [
    [2,0,'#ff6600'],[3,0,'#ff6600'],
    [1,1,'#ff0000'],[2,1,'#ff6600'],[3,1,'#ffd700'],[4,1,'#ff6600'],
    [0,2,'#ff0000'],[1,2,'#ff6600'],[2,2,'#ffd700'],[3,2,'#fff'],[4,2,'#ffd700'],[5,2,'#ff0000'],
    [0,3,'#ff0000'],[1,3,'#ff6600'],[2,3,'#ffd700'],[3,3,'#ffd700'],[4,3,'#ff6600'],[5,3,'#ff0000'],
    [1,4,'#ff0000'],[2,4,'#ff6600'],[3,4,'#ff6600'],[4,4,'#ff0000'],
    [2,5,'#ff0000'],[3,5,'#ff0000'],
  ],
};

function drawSpr(data, x, y, s) {
  s = s || 1;
  for (const [px, py, c] of data) { ctx.fillStyle = c; ctx.fillRect(x + px * s, y + py * s, s, s); }
}

// ── GAME STATE ──
let state = 'title';
let score = 0, lives = 3, level = 1, frame = 0;
let hiScore = parseInt(localStorage.getItem('pbk_hi') || '0');
let shakeX = 0, shakeY = 0, shakeDur = 0;
let deathTimer = 0, invincTimer = 0;
let levelTransTimer = 0;

// ── LEVEL DATA ──
// Each level has platforms, ladders, coins, hammer, fires
function getLevel(lvl) {
  // Platforms: { x, y, w, slope } in tile coords
  // slope = rise per tile-width of horizontal travel
  const platforms = [
    { x: 0, y: 23, w: 28, slope: 0 },       // ground
    { x: 2, y: 20, w: 24, slope: 0.04 },     // p1 slopes right
    { x: 2, y: 17, w: 24, slope: -0.04 },    // p2 slopes left
    { x: 2, y: 14, w: 24, slope: 0.04 },     // p3 slopes right
    { x: 2, y: 11, w: 24, slope: -0.04 },    // p4 slopes left
    { x: 2, y: 8, w: 24, slope: 0.04 },      // p5 slopes right
    { x: 9, y: 4, w: 10, slope: 0 },         // top goal
  ];

  const ladders = [
    { x: 24, y: 20, h: 3 },
    { x: 5, y: 17, h: 3 }, { x: 20, y: 17, h: 3 },
    { x: 10, y: 14, h: 3 }, { x: 24, y: 14, h: 3 },
    { x: 5, y: 11, h: 3 }, { x: 16, y: 11, h: 3 },
    { x: 12, y: 8, h: 3 }, { x: 22, y: 8, h: 3 },
    { x: 13, y: 4, h: 4 },
  ];

  // Add broken ladders per level for variety
  if (lvl >= 2) {
    ladders.push({ x: 8, y: 20, h: 3 });
    ladders.push({ x: 18, y: 14, h: 3 });
  }
  if (lvl >= 3) {
    ladders.push({ x: 14, y: 17, h: 3 });
  }

  const coins = [
    { x: 8, y: 19 }, { x: 16, y: 19 }, { x: 22, y: 19 },
    { x: 6, y: 16 }, { x: 14, y: 16 }, { x: 22, y: 16 },
    { x: 8, y: 13 }, { x: 18, y: 13 },
    { x: 6, y: 10 }, { x: 14, y: 10 }, { x: 22, y: 10 },
    { x: 10, y: 7 }, { x: 18, y: 7 },
  ];

  // Hammer pickup location
  const hammerPos = lvl === 1 ? { x: 12, y: 12.5 } : lvl === 2 ? { x: 8, y: 9.5 } : { x: 20, y: 6.5 };

  // Fire enemy count scales with level
  const fireCount = lvl;

  // Barrel timing
  const barrelMinInterval = Math.max(1200, 2800 - lvl * 600);
  const barrelMaxInterval = Math.max(2000, 4000 - lvl * 600);
  const barrelSpeed = 1.4 + lvl * 0.25;

  return { platforms, ladders, coins, hammerPos, fireCount, barrelMinInterval, barrelMaxInterval, barrelSpeed };
}

// ── ENTITIES ──
let player = {}, barrels = [], collectibles = [], particles = [], popups = [], fires = [];
let hammerPickup = null, hasHammer = false, hammerTimer = 0;
let levelConf = {};
let lastBarrelTime = 0, barrelInterval = 3000;
let bossAnim = 0;

function platYAt(p, px) {
  const local = px - p.x * T;
  return p.y * T + Math.round(p.slope * local);
}

function findPlatform(px, py, pw) {
  const feet = py + 14;
  const cx = px + pw / 2;
  for (const p of levelConf.platforms) {
    const l = p.x * T, r = (p.x + p.w) * T;
    if (cx >= l && cx <= r) {
      const pY = platYAt(p, cx);
      if (feet >= pY - 3 && feet <= pY + 6) return pY;
    }
  }
  return null;
}

function findLadder(px, py, pw, ph) {
  const cx = px + pw / 2, cy = py + ph / 2;
  for (const l of levelConf.ladders) {
    const lx = l.x * T, ly = l.y * T, lh = l.h * T;
    if (cx >= lx - 2 && cx <= lx + T + 2 && cy >= ly && cy <= ly + lh + 4) return l;
  }
  return null;
}

function findLadderBelow(px, py, pw) {
  const cx = px + pw / 2, feet = py + 14;
  for (const l of levelConf.ladders) {
    const lx = l.x * T, ly = l.y * T, lh = l.h * T;
    if (cx >= lx - 2 && cx <= lx + T + 2 && feet >= ly - 4 && feet <= ly + lh) return l;
  }
  return null;
}

function resetPlayer() {
  player = { x: 2 * T, y: 22 * T, w: 14, h: 14, vx: 0, vy: 0, onGround: false, climbing: false, facing: 1, jumpHeld: false, frame: 0, ft: 0 };
  invincTimer = 90;
}

function initLevel() {
  levelConf = getLevel(level);
  barrels = []; fires = []; particles = []; popups = [];
  collectibles = levelConf.coins.map(c => ({ x: c.x * T, y: c.y * T, alive: true, t: Math.random() * 100 }));
  hammerPickup = { x: levelConf.hammerPos.x * T, y: levelConf.hammerPos.y * T, alive: true };
  hasHammer = false; hammerTimer = 0;
  // Spawn fire enemies at ground level
  fires = [];
  for (let i = 0; i < levelConf.fireCount; i++) {
    fires.push({
      x: (6 + i * 7) * T, y: 22 * T,
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5),
      platIdx: 0, t: Math.random() * 100,
    });
  }
  lastBarrelTime = performance.now();
  barrelInterval = levelConf.barrelMaxInterval;
  resetPlayer();
}

function startGame() {
  ensureAudio();
  state = 'playing'; score = 0; lives = 3; level = 1;
  deathTimer = 0; levelTransTimer = 0;
  initLevel();
}

// ── INPUT ──
const keys = {};
const touch = { left: false, right: false, up: false, down: false, jump: false };
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['title','gameover','win'].includes(state) && (e.code === 'Space' || e.code === 'Enter')) startGame();
});
document.addEventListener('keyup', e => keys[e.code] = false);

function setupBtn(id, key) {
  const el = document.getElementById(id);
  const s = e => { e.preventDefault(); touch[key] = true; el.classList.add('pressed'); };
  const e2 = e => { e.preventDefault(); touch[key] = false; el.classList.remove('pressed'); };
  el.addEventListener('touchstart', s, { passive: false });
  el.addEventListener('touchend', e2, { passive: false });
  el.addEventListener('touchcancel', e2, { passive: false });
  el.addEventListener('mousedown', s); el.addEventListener('mouseup', e2); el.addEventListener('mouseleave', e2);
}
setupBtn('btn-left','left'); setupBtn('btn-right','right');
setupBtn('btn-up','up'); setupBtn('btn-down','down'); setupBtn('btn-jump','jump');

canvas.addEventListener('touchstart', () => { if (['title','gameover','win'].includes(state)) startGame(); });
canvas.addEventListener('click', () => { if (['title','gameover','win'].includes(state)) startGame(); });

const inL = () => keys['ArrowLeft'] || keys['KeyA'] || touch.left;
const inR = () => keys['ArrowRight'] || keys['KeyD'] || touch.right;
const inU = () => keys['ArrowUp'] || keys['KeyW'] || touch.up;
const inD = () => keys['ArrowDown'] || keys['KeyS'] || touch.down;
const inJ = () => keys['Space'] || touch.jump;

// ── PARTICLES ──
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 1) * 3,
      life: 20 + Math.random() * 20, color, size: 2 + Math.random() * 2,
    });
  }
}

function addPopup(x, y, text, color) {
  popups.push({ x, y, text, color: color || '#fbd000', life: 60 });
}

// ── UPDATE ──
function update() {
  if (state !== 'playing') { frame++; return; }
  frame++;

  // Death animation
  if (deathTimer > 0) {
    deathTimer--;
    if (deathTimer === 0) {
      if (lives <= 0) {
        state = 'gameover';
        if (score > hiScore) { hiScore = score; localStorage.setItem('pbk_hi', String(hiScore)); }
      } else {
        barrels = [];
        resetPlayer();
      }
    }
    return;
  }

  // Level transition
  if (levelTransTimer > 0) {
    levelTransTimer--;
    if (levelTransTimer === 0) {
      level++;
      if (level > 3) {
        state = 'win';
        playSound('win');
        if (score > hiScore) { hiScore = score; localStorage.setItem('pbk_hi', String(hiScore)); }
      } else {
        playSound('levelup');
        initLevel();
      }
    }
    return;
  }

  // Screen shake decay
  if (shakeDur > 0) { shakeDur--; shakeX = (Math.random() - 0.5) * 4; shakeY = (Math.random() - 0.5) * 4; }
  else { shakeX = 0; shakeY = 0; }

  if (invincTimer > 0) invincTimer--;

  const p = player;

  // ── PLAYER MOVEMENT ──
  const ladder = findLadder(p.x, p.y, p.w, p.h);
  const ladderBelow = findLadderBelow(p.x, p.y, p.w);

  if (p.climbing) {
    p.vy = 0; p.vx = 0;
    if (inU()) { p.y -= 1.8; p.ft++; }
    else if (inD()) { p.y += 1.8; p.ft++; }
    if (inL()) p.x -= 1;
    if (inR()) p.x += 1;

    if (!findLadder(p.x, p.y, p.w, p.h)) {
      p.climbing = false;
      const pY = findPlatform(p.x, p.y, p.w);
      if (pY !== null) { p.y = pY - 14; p.onGround = true; }
    }
  } else {
    if (inL()) { p.vx = -2; p.facing = -1; }
    else if (inR()) { p.vx = 2; p.facing = 1; }
    else p.vx = 0;

    if (inU() && ladder && !p.onGround === false) {
      p.climbing = true; p.x = ladder.x * T - p.w / 2 + T / 2; p.vy = 0;
    }
    if (inU() && ladder) {
      p.climbing = true; p.x = ladder.x * T - p.w / 2 + T / 2; p.vy = 0;
    }
    if (inD() && ladderBelow && p.onGround) {
      p.climbing = true; p.x = ladderBelow.x * T - p.w / 2 + T / 2; p.y += 4; p.vy = 0;
    }

    const jmp = inJ();
    if (jmp && p.onGround && !p.jumpHeld) {
      p.vy = -6.5; p.onGround = false; p.jumpHeld = true; playSound('jump');
    }
    if (!jmp) p.jumpHeld = false;

    if (!p.onGround) p.vy += 0.4;

    p.x += p.vx; p.y += p.vy;

    const pY = findPlatform(p.x, p.y, p.w);
    if (pY !== null && p.vy >= 0) { p.y = pY - 14; p.vy = 0; p.onGround = true; }
    else if (pY === null && !p.climbing) p.onGround = false;

    if (Math.abs(p.vx) > 0) p.ft++;
  }

  if (p.ft > 8) { p.frame = (p.frame + 1) % 2; p.ft = 0; }
  if (p.x < 0) p.x = 0;
  if (p.x > GW - p.w) p.x = GW - p.w;
  if (p.y > GH + 16) { die(); return; }

  // ── HAMMER ──
  if (hasHammer) {
    hammerTimer--;
    if (hammerTimer <= 0) hasHammer = false;
  }
  if (hammerPickup && hammerPickup.alive) {
    const dx = (p.x + 7) - (hammerPickup.x + 4);
    const dy = (p.y + 7) - (hammerPickup.y + 4);
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
      hammerPickup.alive = false;
      hasHammer = true; hammerTimer = 300; // ~5 seconds
      playSound('coin');
      addPopup(p.x, p.y - 8, 'HAMMER!', '#ffd700');
    }
  }

  // ── BARRELS ──
  const now = performance.now();
  if (now - lastBarrelTime > barrelInterval) {
    spawnBarrel();
    lastBarrelTime = now;
    barrelInterval = levelConf.barrelMinInterval + Math.random() * (levelConf.barrelMaxInterval - levelConf.barrelMinInterval);
  }

  for (let i = barrels.length - 1; i >= 0; i--) {
    const b = barrels[i];
    b.x += b.vx;
    b.vy += 0.25;
    b.y += b.vy;
    b.rot += b.vx * 0.04;

    // Platform collision
    const bY = findPlatform(b.x + 4, b.y, 8);
    if (bY !== null && b.vy >= 0) {
      b.y = bY - 12;
      b.vy = 0;

      // Chance to go down ladder
      if (Math.random() < 0.25) {
        const ld = findLadderBelow(b.x + 4, b.y, 8);
        if (ld) { b.x = ld.x * T; b.vy = 2; b.vx = 0; b.onLadder = true; }
      }
    }

    // Reverse at platform edges
    if (b.x < 2 * T) b.vx = Math.abs(b.vx);
    if (b.x > (COLS - 3) * T) b.vx = -Math.abs(b.vx);

    // Remove off-screen
    if (b.y > GH + 40) { barrels.splice(i, 1); continue; }

    // Player collision
    if (invincTimer <= 0 && deathTimer === 0) {
      const dx = (p.x + 7) - (b.x + 7);
      const dy = (p.y + 7) - (b.y + 6);
      if (Math.abs(dx) < 11 && Math.abs(dy) < 11) {
        if (hasHammer) {
          // Smash barrel
          barrels.splice(i, 1);
          score += 300;
          playSound('hammer');
          spawnParticles(b.x + 7, b.y + 6, '#c84c09', 8);
          addPopup(b.x, b.y - 8, '300', '#ff6600');
          shakeDur = 6;
          continue;
        } else {
          die(); return;
        }
      }
    }

    // Score for jumping over
    if (!b.scored) {
      const dx = (p.x + 7) - (b.x + 7);
      if (Math.abs(dx) < 24 && p.y + p.h < b.y && !p.onGround) {
        b.scored = true;
        score += 100;
        playSound('barrel_jump');
        addPopup(b.x, b.y - 12, '100');
      }
    }
  }

  // ── FIRE ENEMIES ──
  for (const f of fires) {
    f.t++;
    f.x += f.vx;
    // Stay on current platform section
    if (f.x < 1 * T || f.x > (COLS - 2) * T) f.vx = -f.vx;
    // Simple vertical chase: if player is above and near a ladder, move toward it
    const fY = findPlatform(f.x, f.y, 8);
    if (fY !== null) f.y = fY - 10;

    // Collision with player
    if (invincTimer <= 0 && deathTimer === 0) {
      const dx = (p.x + 7) - (f.x + 4);
      const dy = (p.y + 7) - (f.y + 4);
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        if (hasHammer) {
          f.x = -100; f.vx = 0;
          score += 200;
          playSound('hammer');
          spawnParticles(f.x + 4, f.y + 4, '#ff6600', 6);
          addPopup(f.x, f.y - 8, '200', '#ff6600');
        } else {
          die(); return;
        }
      }
    }
  }

  // ── COINS ──
  for (const c of collectibles) {
    if (!c.alive) continue;
    c.t += 0.08;
    const dx = (p.x + 7) - (c.x + 3);
    const dy = (p.y + 7) - (c.y + 3);
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      c.alive = false; score += 50;
      playSound('coin');
      spawnParticles(c.x + 3, c.y + 3, '#fbd000', 5);
      addPopup(c.x, c.y - 8, '50');
    }
  }

  // ── PARTICLES ──
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.15; pt.life--;
    if (pt.life <= 0) particles.splice(i, 1);
  }

  // ── POPUPS ──
  for (let i = popups.length - 1; i >= 0; i--) {
    popups[i].y -= 0.8; popups[i].life--;
    if (popups[i].life <= 0) popups.splice(i, 1);
  }

  // ── WIN CONDITION ──
  const top = levelConf.platforms[levelConf.platforms.length - 1];
  if (p.y + p.h < top.y * T + 4 && p.x + 7 > top.x * T && p.x + 7 < (top.x + top.w) * T) {
    score += 500 * level;
    addPopup(p.x, p.y - 16, String(500 * level), '#43b047');
    levelTransTimer = 90;
  }

  // Boss animation
  bossAnim = Math.sin(frame * 0.06) * 3;
}

function die() {
  lives--; deathTimer = 60;
  playSound('die');
  spawnParticles(player.x + 7, player.y + 7, '#fff', 15);
  shakeDur = 15;
}

function spawnBarrel() {
  const p5 = levelConf.platforms[5]; // platform 5
  barrels.push({
    x: 4 * T, y: (p5.y - 1) * T,
    vx: levelConf.barrelSpeed * (Math.random() > 0.3 ? 1 : -1),
    vy: 0, rot: 0, scored: false, onLadder: false,
  });
}

// ── DRAW ──
function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, GW, GH);

  if (state === 'title') { drawTitle(); return; }
  if (state === 'gameover') { drawGameOver(); return; }
  if (state === 'win') { drawWin(); return; }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Platforms
  for (const p of levelConf.platforms) {
    for (let tx = 0; tx < p.w; tx++) {
      const px = (p.x + tx) * T;
      const py = p.y * T + Math.round(p.slope * tx * T);
      ctx.fillStyle = '#e4000f'; ctx.fillRect(px, py, T, 4);
      ctx.fillStyle = '#b00'; ctx.fillRect(px, py + 4, T, 4);
      if (tx % 3 === 0) { ctx.fillStyle = '#fbd000'; ctx.fillRect(px + 6, py + 1, 4, 2); }
    }
  }

  // Ladders
  for (const l of levelConf.ladders) {
    const lx = l.x * T, ly = l.y * T;
    for (let i = 0; i < l.h * T; i += 2) {
      ctx.fillStyle = '#5cf';
      ctx.fillRect(lx + 2, ly + i, 2, 2);
      ctx.fillRect(lx + T - 4, ly + i, 2, 2);
    }
    for (let r = 0; r < l.h; r++) {
      ctx.fillStyle = '#5cf';
      ctx.fillRect(lx + 2, ly + r * T + 8, T - 4, 2);
    }
  }

  // Coins
  for (const c of collectibles) {
    if (!c.alive) continue;
    const sx = Math.sin(c.t) > 0 ? 1 : 0.5;
    ctx.save();
    ctx.translate(c.x + 3, c.y + 2);
    ctx.scale(sx, 1);
    drawSpr(SPR.coin, -3, -2);
    ctx.restore();
  }

  // Hammer pickup
  if (hammerPickup && hammerPickup.alive) {
    const hBob = Math.sin(frame * 0.1) * 2;
    drawSpr(SPR.hammer, hammerPickup.x, hammerPickup.y + hBob, 2);
  }

  // Barrels
  for (const b of barrels) {
    ctx.save();
    ctx.translate(b.x + 7, b.y + 6);
    ctx.rotate(b.rot);
    drawSpr(SPR.barrel, -7, -6, 2);
    ctx.restore();
  }

  // Fire enemies
  for (const f of fires) {
    if (f.x < 0) continue;
    const flicker = Math.floor(f.t / 4) % 2;
    ctx.save();
    ctx.translate(f.x, f.y + (flicker ? -1 : 1));
    drawSpr(SPR.fire, 0, 0, 2);
    ctx.restore();
  }

  // Boss
  drawBoss();

  // Goal flag
  const top = levelConf.platforms[levelConf.platforms.length - 1];
  const fx = (top.x + top.w / 2) * T, fy = top.y * T - 22;
  ctx.fillStyle = '#fbd000'; ctx.fillRect(fx, fy, 2, 22);
  ctx.fillStyle = '#e4000f'; ctx.fillRect(fx + 2, fy, 10, 7);
  ctx.fillStyle = '#fff'; ctx.font = '6px "Press Start 2P"'; ctx.fillText('★', fx + 4, fy + 6);

  // Player
  if (deathTimer > 0) {
    // Death flash
    if (Math.floor(deathTimer / 3) % 2) {
      ctx.save();
      ctx.translate(player.x + 7, player.y + 7);
      ctx.rotate(deathTimer * 0.15);
      ctx.globalAlpha = deathTimer / 60;
      drawSpr(SPR.ghost, -7, -7);
      ctx.restore();
    }
  } else {
    const vis = invincTimer > 0 ? (Math.floor(invincTimer / 3) % 2 === 0) : true;
    if (vis) {
      ctx.save();
      ctx.translate(player.x + 7, player.y + 7);
      if (player.facing < 0) ctx.scale(-1, 1);
      const bob = player.climbing ? (Math.floor(player.ft / 4) % 2) * 2 : player.frame;
      drawSpr(SPR.ghost, -7, -7 + bob);

      // Draw hammer if held
      if (hasHammer) {
        const hSwing = Math.sin(frame * 0.3) * 0.8;
        ctx.save();
        ctx.rotate(hSwing);
        ctx.fillStyle = '#8B4513'; ctx.fillRect(8, -12, 3, 10);
        ctx.fillStyle = '#aaa'; ctx.fillRect(6, -16, 8, 6);
        ctx.restore();

        // Hammer timer flash
        if (hammerTimer < 60 && Math.floor(frame / 4) % 2) {
          ctx.globalAlpha = 0.5;
        }
      }

      ctx.restore();
    }
  }

  // Particles
  for (const pt of particles) {
    ctx.globalAlpha = pt.life / 30;
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;

  // Popups
  for (const pu of popups) {
    ctx.globalAlpha = Math.min(1, pu.life / 20);
    ctx.fillStyle = pu.color;
    ctx.font = '7px "Press Start 2P"';
    ctx.fillText(pu.text, pu.x, pu.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore(); // end shake

  // Level transition overlay
  if (levelTransTimer > 0) {
    ctx.fillStyle = `rgba(0,0,0,${(90 - levelTransTimer) / 90 * 0.8})`;
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#fbd000';
    ctx.font = '14px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL ' + (level + 1) + '!', GW / 2, GH / 2);
    ctx.textAlign = 'left';
  }

  // HUD (outside shake)
  drawHUD();
}

function drawBoss() {
  const bx = 3 * T, by = 4 * T - 24;
  ctx.save();
  ctx.translate(bx, by + bossAnim);
  for (const [px, py, c] of SPR.ghost) { ctx.fillStyle = c; ctx.fillRect(px * 2, py * 2, 2, 2); }
  // Barrel stack
  for (let i = 0; i < 3; i++) drawSpr(SPR.barrel, 34, 8 + i * 10, 1);
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff'; ctx.font = '7px "Press Start 2P"';
  ctx.fillText('SCORE', 6, 10);
  ctx.fillStyle = '#fbd000'; ctx.fillText(String(score).padStart(6, '0'), 6, 20);

  ctx.fillStyle = '#fff'; ctx.fillText('HI', GW / 2 - 16, 10);
  ctx.fillStyle = '#fbd000'; ctx.fillText(String(hiScore).padStart(6, '0'), GW / 2 - 24, 20);

  ctx.fillStyle = '#fff'; ctx.fillText('L' + level, GW - 40, 10);

  // Lives as small ghosts
  for (let i = 0; i < lives; i++) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(GW - 60 + i * 14, 14, 8, 8);
    ctx.fillStyle = '#e40';
    ctx.fillRect(GW - 58 + i * 14, 18, 2, 2);
    ctx.fillRect(GW - 55 + i * 14, 18, 2, 2);
  }

  // Hammer timer bar
  if (hasHammer) {
    const bw = 40;
    const fill = (hammerTimer / 300) * bw;
    ctx.fillStyle = '#333'; ctx.fillRect(GW / 2 - bw / 2, 24, bw, 4);
    ctx.fillStyle = hammerTimer < 60 ? '#e4000f' : '#fbd000';
    ctx.fillRect(GW / 2 - bw / 2, 24, fill, 4);
  }
}

function drawTitle() {
  // Ground girder
  for (let x = 0; x < COLS; x++) {
    ctx.fillStyle = '#e4000f'; ctx.fillRect(x * T, GH - T, T, 4);
    ctx.fillStyle = '#b00'; ctx.fillRect(x * T, GH - T + 4, T, 4);
  }

  const pulse = Math.sin(frame * 0.05) * 0.15 + 0.85;
  ctx.save(); ctx.globalAlpha = pulse;
  ctx.fillStyle = '#fbd000'; ctx.font = '18px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('PIXELBOO', GW / 2, 80);
  ctx.fillStyle = '#e4000f'; ctx.font = '26px "Press Start 2P"';
  ctx.fillText('KONG', GW / 2, 116);
  ctx.restore();

  // Ghost
  ctx.save();
  ctx.translate(GW / 2, 175 + Math.sin(frame * 0.04) * 8);
  for (const [px, py, c] of SPR.ghost) { ctx.fillStyle = c; ctx.fillRect((px - 7) * 4, (py - 6) * 4, 4, 4); }
  ctx.restore();

  ctx.fillStyle = '#fff'; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'center';
  const blink = Math.floor(frame / 30) % 2;
  if (blink) { ctx.fillText('PRESS SPACE / TAP', GW / 2, 266); ctx.fillText('TO START', GW / 2, 282); }

  ctx.fillStyle = '#5cf'; ctx.font = '7px "Press Start 2P"';
  ctx.fillText('ARROWS/WASD TO MOVE', GW / 2, 310);
  ctx.fillText('SPACE TO JUMP', GW / 2, 326);
  ctx.fillText('GRAB THE HAMMER!', GW / 2, 346);

  ctx.fillStyle = '#fbd000'; ctx.fillText('HI-SCORE: ' + String(hiScore).padStart(6, '0'), GW / 2, GH - 24);
  ctx.textAlign = 'left';
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, GW, GH);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#e4000f'; ctx.font = '18px "Press Start 2P"';
  ctx.fillText('GAME OVER', GW / 2, GH / 2 - 44);

  ctx.fillStyle = '#fbd000'; ctx.font = '10px "Press Start 2P"';
  ctx.fillText('SCORE: ' + score, GW / 2, GH / 2 - 4);
  ctx.fillText('LEVEL: ' + level, GW / 2, GH / 2 + 16);

  if (score >= hiScore && score > 0) {
    ctx.fillStyle = '#43b047'; ctx.fillText('NEW HI-SCORE!', GW / 2, GH / 2 + 38);
  }

  if (Math.floor(frame / 30) % 2) {
    ctx.fillStyle = '#fff'; ctx.font = '8px "Press Start 2P"';
    ctx.fillText('TAP / SPACE TO RETRY', GW / 2, GH / 2 + 70);
  }
  ctx.textAlign = 'left';
}

function drawWin() {
  ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, GW, GH);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#fbd000'; ctx.font = '16px "Press Start 2P"';
  ctx.fillText('YOU WIN!', GW / 2, GH / 2 - 60);

  ctx.fillStyle = '#43b047'; ctx.font = '9px "Press Start 2P"';
  ctx.fillText('BOO CONQUERED', GW / 2, GH / 2 - 30);
  ctx.fillText('ALL 3 WORLDS!', GW / 2, GH / 2 - 14);

  ctx.fillStyle = '#fbd000'; ctx.font = '10px "Press Start 2P"';
  ctx.fillText('FINAL SCORE: ' + score, GW / 2, GH / 2 + 14);

  // Celebrating ghost
  ctx.save();
  ctx.translate(GW / 2, GH / 2 + 65 + Math.sin(frame * 0.08) * 6);
  for (const [px, py, c] of SPR.ghost) { ctx.fillStyle = c; ctx.fillRect((px - 7) * 3, (py - 6) * 3, 3, 3); }
  ctx.restore();

  // Firework particles
  if (frame % 15 === 0) {
    spawnParticles(80 + Math.random() * (GW - 160), 60 + Math.random() * 100,
      ['#e4000f','#fbd000','#43b047','#5cf','#ff69b4'][Math.floor(Math.random() * 5)], 10);
  }
  for (const pt of particles) {
    ctx.globalAlpha = pt.life / 30;
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.1; pt.life--;
  }
  particles = particles.filter(p => p.life > 0);
  ctx.globalAlpha = 1;

  if (Math.floor(frame / 30) % 2) {
    ctx.fillStyle = '#fff'; ctx.font = '8px "Press Start 2P"';
    ctx.fillText('TAP / SPACE TO PLAY AGAIN', GW / 2, GH - 30);
  }
  ctx.textAlign = 'left';
}

// ── SCALING ──
function resize() {
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const ch = isMobile ? 170 : 0;
  const s = Math.min(window.innerWidth / GW, (window.innerHeight - ch) / GH);
  canvas.style.width = Math.floor(GW * s) + 'px';
  canvas.style.height = Math.floor(GH * s) + 'px';
}
window.addEventListener('resize', resize); resize();

// ── GAME LOOP ──
function loop() {
  update(); draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
