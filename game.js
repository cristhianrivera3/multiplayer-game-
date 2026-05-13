// ========== VARIABLES ==========
let gameCanvas, gameCtx;
let bgCanvas, bgCtx;
let gameRunning = true;
let paused = false;
let animationId = null;

// Estadísticas
let score = 0;
let lives = 3;
let wave = 1;
let highScore = localStorage.getItem('spaceHighScore') || 0;
let enemiesThisWave = 0;
let enemiesPerWave = 8;

// Nave
let shipX = 0;
let shipY = 0;
let shipSpeed = 5.5;
let targetX = 0;
let selectedShip = 'default';
let selectedMap = 'purple';

// Disparo
let bullets = [];
let bulletSpeed = 6;
let shootCooldown = 0;
let shootDelay = 10;
let mousePressed = false;

// Enemigos
let enemies = [];
let enemySpawnCounter = 0;
let enemySpawnDelay = 45;

// Power-ups
let powerups = [];
let hasShield = false;
let shieldTimer = 0;
let hasDoubleShot = false;
let doubleShotTimer = 0;

// Efectos
let particles = [];
let floatingTexts = [];
let damageEffect = 0;
let invincibilityTimer = 0;
let hitEffect = 0;

// Sonido
let audioCtx = null;

// Mouse
let mouseX = 0;
let mouseInside = true;

// Dimensiones
let canvasWidth = 0;
let canvasHeight = 0;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    gameCanvas = document.getElementById('gameCanvas');
    bgCanvas = document.getElementById('backgroundCanvas');
    gameCtx = gameCanvas.getContext('2d');
    bgCtx = bgCanvas.getContext('2d');
    
    gameCtx.imageSmoothingEnabled = false;
    bgCtx.imageSmoothingEnabled = false;
    
    resizeAll();
    window.addEventListener('resize', () => resizeAll());
    
    setupMenu();
    setupGameEvents();
    
    document.getElementById('menuHighScore').innerText = String(highScore).padStart(5, '0');
});

function resizeAll() {
    // Fondo pantalla completa
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    
    // Canvas del juego (dentro del área)
    const border = document.querySelector('.game-area-border');
    if (border) {
        const rect = border.getBoundingClientRect();
        gameCanvas.width = rect.width;
        gameCanvas.height = rect.height;
        canvasWidth = gameCanvas.width;
        canvasHeight = gameCanvas.height;
        
        shipY = canvasHeight - 80;
        shipX = canvasWidth / 2;
        targetX = shipX;
        
        // Dibujar fondo
        drawFullBackground();
    }
}

function drawFullBackground() {
    if (!bgCtx) return;
    
    if (selectedMap === 'purple') {
        const grad = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
        grad.addColorStop(0, '#1a0033');
        grad.addColorStop(1, '#0d001a');
        bgCtx.fillStyle = grad;
    } else if (selectedMap === 'fire') {
        const grad = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
        grad.addColorStop(0, '#3d0000');
        grad.addColorStop(1, '#1a0000');
        bgCtx.fillStyle = grad;
    } else {
        const grad = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
        grad.addColorStop(0, '#001a33');
        grad.addColorStop(1, '#000d1a');
        bgCtx.fillStyle = grad;
    }
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Estrellas en fondo completo
    bgCtx.fillStyle = '#fff';
    for (let i = 0; i < 200; i++) {
        if (Math.random() > 0.85) {
            bgCtx.fillRect((i * 131) % bgCanvas.width, (i * 253) % bgCanvas.height, 2, 2);
        }
    }
}

function setupMenu() {
    document.querySelectorAll('.pixel-card-ship').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.pixel-card-ship').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedShip = card.dataset.ship;
        });
    });
    
    document.querySelectorAll('.pixel-card-map').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.pixel-card-map').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedMap = card.dataset.map;
        });
    });
    
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    
    document.querySelector('.pixel-card-ship').classList.add('selected');
    document.querySelector('.pixel-card-map').classList.add('selected');
}

function setupGameEvents() {
    gameCanvas.addEventListener('mousemove', (e) => {
        const rect = gameCanvas.getBoundingClientRect();
        const scaleX = canvasWidth / rect.width;
        let rawX = (e.clientX - rect.left) * scaleX;
        targetX = Math.min(Math.max(rawX, 35), canvasWidth - 35);
        mouseInside = true;
    });
    
    gameCanvas.addEventListener('mouseleave', () => { mouseInside = false; });
    
    gameCanvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        mousePressed = true;
        if (!paused && gameRunning) shoot();
    });
    
    gameCanvas.addEventListener('mouseup', () => { mousePressed = false; });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') togglePause();
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            if (!paused && gameRunning) shoot();
        }
    });
    
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('menuBtn').addEventListener('click', goToMenu);
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('menuFromPauseBtn').addEventListener('click', goToMenu);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        resetGame();
        document.getElementById('gameOver').classList.add('hidden');
    });
    document.getElementById('menuFromGameOverBtn').addEventListener('click', goToMenu);
}

function startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').classList.remove('hidden');
    
    setTimeout(() => {
        resizeAll();
    }, 50);
    
    if (selectedShip === 'rapid') {
        shootDelay = 6;
        shipSpeed = 7;
    } else if (selectedShip === 'tank') {
        shootDelay = 14;
        shipSpeed = 4.5;
        lives = 5;
    } else {
        shootDelay = 10;
        shipSpeed = 5.5;
        lives = 3;
    }
    
    resetGame();
    gameLoop();
}

function resetGame() {
    score = 0;
    lives = selectedShip === 'tank' ? 5 : 3;
    wave = 1;
    enemiesThisWave = 0;
    enemiesPerWave = 8;
    bullets = [];
    enemies = [];
    powerups = [];
    particles = [];
    floatingTexts = [];
    enemySpawnCounter = 0;
    hasShield = false;
    hasDoubleShot = false;
    invincibilityTimer = 0;
    shootCooldown = 0;
    gameRunning = true;
    paused = false;
    
    shipX = canvasWidth / 2;
    targetX = shipX;
    
    updateUI();
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    drawFullBackground();
}

function togglePause() {
    if (!gameRunning) return;
    paused = !paused;
    document.getElementById('pauseScreen').classList.toggle('hidden', !paused);
}

function goToMenu() {
    gameRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    document.getElementById('gameContainer').classList.add('hidden');
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
}

function shoot() {
    if (!gameRunning || paused) return;
    if (shootCooldown <= 0) {
        playSound();
        
        if (hasDoubleShot) {
            bullets.push({ x: shipX - 14, y: shipY - 18, w: 4, h: 10 });
            bullets.push({ x: shipX + 14, y: shipY - 18, w: 4, h: 10 });
        }
        bullets.push({ x: shipX, y: shipY - 18, w: 4, h: 10 });
        
        shootCooldown = shootDelay;
    }
}

function playSound() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.value = 800;
        gain.gain.value = 0.05;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);
        osc.stop(audioCtx.currentTime + 0.15);
        audioCtx.resume();
    } catch(e) {}
}

function spawnEnemy() {
    const types = [
        { name: 'normal', speed: 1.0, health: 1, color: '#8e44ad', points: 10, size: 28 },
        { name: 'rapid', speed: 2.4, health: 1, color: '#e67e22', points: 15, size: 24 },
        { name: 'tank', speed: 0.55, health: 3, color: '#27ae60', points: 30, size: 32 }
    ];
    
    let type = types[0];
    const rand = Math.random();
    if (rand < 0.2) type = types[1];
    else if (rand < 0.35) type = types[2];
    
    enemies.push({
        x: Math.random() * (canvasWidth - 60) + 30,
        y: 30,
        w: type.size, h: type.size,
        health: type.health,
        maxHealth: type.health,
        type: type.name,
        speed: type.speed,
        color: type.color,
        points: type.points
    });
}

function update() {
    if (!gameRunning || paused) return;
    
    // Movimiento SUAVE
    if (mouseInside) {
        let diff = targetX - shipX;
        shipX += diff * 0.2;
        shipX = Math.min(Math.max(shipX, 30), canvasWidth - 30);
    }
    
    // Cooldowns
    if (shootCooldown > 0) shootCooldown--;
    if (invincibilityTimer > 0) invincibilityTimer--;
    if (shieldTimer > 0) { shieldTimer--; if (shieldTimer <= 0) hasShield = false; }
    if (doubleShotTimer > 0) { doubleShotTimer--; if (doubleShotTimer <= 0) hasDoubleShot = false; }
    if (damageEffect > 0) damageEffect--;
    if (hitEffect > 0) hitEffect--;
    
    // Disparo automático
    if (mousePressed && shootCooldown <= 0) shoot();
    
    // Mover balas
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y + bullets[i].h < 0) bullets.splice(i, 1);
    }
    
    // Mover enemigos
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += enemies[i].speed;
        if (enemies[i].y + enemies[i].h > canvasHeight - 50) {
            enemies.splice(i, 1);
            if (invincibilityTimer <= 0 && !hasShield) {
                lives--;
                damageEffect = 25;
                hitEffect = 15;
                invincibilityTimer = 50;
                updateUI();
                if (lives <= 0) gameOver();
            }
            i--;
        }
    }
    
    // Colisiones balas vs enemigos
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            const b = bullets[i], e = enemies[j];
            if (b.x < e.x + e.w/2 && b.x + b.w > e.x - e.w/2 &&
                b.y < e.y + e.h/2 && b.y + b.h > e.y - e.h/2) {
                bullets.splice(i, 1);
                e.health--;
                
                floatingTexts.push({ x: e.x, y: e.y, text: '💥', life: 20 });
                
                if (e.health <= 0) {
                    score += e.points;
                    enemiesThisWave++;
                    floatingTexts.push({ x: e.x, y: e.y, text: `+${e.points}`, life: 30, color: '#f39c12' });
                    createExplosion(e.x, e.y);
                    enemies.splice(j, 1);
                    updateUI();
                    
                    if (Math.random() < 0.12) {
                        powerups.push({
                            x: e.x, y: e.y, type: Math.random() < 0.5 ? 'doubleShot' : 'shield'
                        });
                    }
                }
                i--;
                break;
            }
        }
    }
    
    // Colisión nave vs enemigos
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (shipX - 22 < e.x + e.w/2 && shipX + 22 > e.x - e.w/2 &&
            shipY - 22 < e.y + e.h/2 && shipY + 15 > e.y - e.h/2) {
            if (invincibilityTimer <= 0 && !hasShield) {
                enemies.splice(i, 1);
                lives--;
                damageEffect = 25;
                hitEffect = 15;
                invincibilityTimer = 50;
                updateUI();
                createExplosion(shipX, shipY);
                if (lives <= 0) gameOver();
            } else {
                enemies.splice(i, 1);
                floatingTexts.push({ x: shipX, y: shipY, text: '🛡️', life: 20, color: '#0f0' });
            }
            i--;
        }
    }
    
    // Power-ups
    for (let i = 0; i < powerups.length; i++) {
        powerups[i].y += 1.5;
        if (Math.abs(powerups[i].x - shipX) < 25 && Math.abs(powerups[i].y - shipY) < 25) {
            if (powerups[i].type === 'doubleShot') {
                hasDoubleShot = true;
                doubleShotTimer = 300;
            } else {
                hasShield = true;
                shieldTimer = 300;
            }
            powerups.splice(i, 1);
            floatingTexts.push({ x: shipX, y: shipY, text: 'POWER!', life: 35, color: '#e67e22' });
        } else if (powerups[i].y > canvasHeight) {
            powerups.splice(i, 1);
        }
    }
    
    // Efectos visuales
    for (let i = 0; i < particles.length; i++) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life--;
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    
    for (let i = 0; i < floatingTexts.length; i++) {
        floatingTexts[i].life--;
        floatingTexts[i].y -= 1;
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }
    
    // Spawn enemigos
    if (enemies.length < 6) {
        enemySpawnCounter++;
        if (enemySpawnCounter >= enemySpawnDelay) {
            spawnEnemy();
            enemySpawnCounter = 0;
        }
    }
    
    // Waves
    if (enemiesThisWave >= enemiesPerWave) {
        wave++;
        enemiesPerWave += 5;
        enemiesThisWave = 0;
        floatingTexts.push({ x: canvasWidth/2, y: canvasHeight/2, text: `WAVE ${wave}`, life: 50, color: '#e67e22' });
        updateUI();
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 25 + Math.random() * 15
        });
    }
}

function updateUI() {
    document.getElementById('scoreText').innerText = String(score).padStart(4, '0');
    document.getElementById('highScoreText').innerText = String(highScore).padStart(4, '0');
    document.getElementById('waveText').innerText = String(wave).padStart(2, '0');
    
    let hearts = '';
    const maxLives = selectedShip === 'tank' ? 5 : 3;
    for (let i = 0; i < lives; i++) hearts += '❤️';
    for (let i = lives; i < maxLives; i++) hearts += '🖤';
    document.getElementById('livesText').innerHTML = hearts;
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceHighScore', highScore);
    }
    document.getElementById('finalScore').innerText = score;
    document.getElementById('finalHighScore').innerText = highScore;
    document.getElementById('gameOver').classList.remove('hidden');
}

// ========== DIBUJADO DEL JUEGO (dentro del canvas) ==========
function drawGameBackground() {
    if (selectedMap === 'purple') {
        const grad = gameCtx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, 'rgba(26, 0, 51, 0.3)');
        grad.addColorStop(1, 'rgba(13, 0, 26, 0.3)');
        gameCtx.fillStyle = grad;
    } else if (selectedMap === 'fire') {
        const grad = gameCtx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, 'rgba(61, 0, 0, 0.3)');
        grad.addColorStop(1, 'rgba(26, 0, 0, 0.3)');
        gameCtx.fillStyle = grad;
    } else {
        const grad = gameCtx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, 'rgba(0, 26, 51, 0.3)');
        grad.addColorStop(1, 'rgba(0, 13, 26, 0.3)');
        gameCtx.fillStyle = grad;
    }
    gameCtx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawShip() {
    if (hitEffect > 0) {
        gameCtx.fillStyle = 'rgba(255,255,255,0.3)';
        gameCtx.fillRect(shipX - 22, shipY - 22, 44, 44);
    }
    
    let color = '#c39bd3';
    if (selectedShip === 'rapid') color = '#e67e22';
    if (selectedShip === 'tank') color = '#2ecc71';
    
    gameCtx.fillStyle = color;
    gameCtx.fillRect(shipX - 12, shipY - 18, 24, 8);
    gameCtx.fillRect(shipX - 8, shipY - 22, 16, 4);
    gameCtx.fillRect(shipX - 17, shipY - 8, 34, 12);
    gameCtx.fillRect(shipX - 10, shipY + 4, 20, 6);
    
    gameCtx.fillStyle = '#f5eef8';
    gameCtx.fillRect(shipX - 5, shipY - 15, 10, 10);
    gameCtx.fillStyle = '#5b2c6f';
    gameCtx.fillRect(shipX - 3, shipY - 13, 6, 6);
    
    gameCtx.fillStyle = '#e67e22';
    gameCtx.fillRect(shipX - 5, shipY + 6, 10, 4);
    
    if (hasShield) {
        gameCtx.strokeStyle = '#00ff00';
        gameCtx.lineWidth = 2;
        gameCtx.strokeRect(shipX - 28, shipY - 28, 56, 56);
    }
}

function drawEnemies() {
    for (let e of enemies) {
        gameCtx.fillStyle = e.color;
        gameCtx.fillRect(e.x - e.w/2, e.y - e.h/2, e.w, e.h);
        
        gameCtx.fillStyle = '#fff';
        gameCtx.fillRect(e.x - 8, e.y - 6, 5, 5);
        gameCtx.fillRect(e.x + 3, e.y - 6, 5, 5);
        gameCtx.fillStyle = '#000';
        gameCtx.fillRect(e.x - 7, e.y - 5, 3, 3);
        gameCtx.fillRect(e.x + 4, e.y - 5, 3, 3);
        
        gameCtx.fillStyle = '#000';
        gameCtx.fillRect(e.x - 5, e.y + 2, 10, 3);
        
        if (e.health < e.maxHealth) {
            gameCtx.fillStyle = '#ff0000';
            gameCtx.fillRect(e.x - 18, e.y - 25, 36, 4);
            gameCtx.fillStyle = '#00ff00';
            gameCtx.fillRect(e.x - 18, e.y - 25, 36 * (e.health / e.maxHealth), 4);
        }
    }
}

function drawBullets() {
    gameCtx.fillStyle = '#e67e22';
    for (let b of bullets) {
        gameCtx.fillRect(b.x - 2, b.y - 4, 4, 8);
    }
}

function drawPowerups() {
    for (let p of powerups) {
        gameCtx.font = '20px monospace';
        gameCtx.fillStyle = '#e67e22';
        gameCtx.fillText(p.type === 'doubleShot' ? '🔫' : '🛡️', p.x - 10, p.y);
    }
}

function drawFloatingTexts() {
    for (let t of floatingTexts) {
        gameCtx.font = `bold ${14}px monospace`;
        gameCtx.fillStyle = t.color || '#ff3366';
        gameCtx.fillText(t.text, t.x - 12, t.y - 12);
    }
}

function drawParticles() {
    for (let p of particles) {
        gameCtx.fillStyle = `rgba(255, 102, 204, ${p.life / 25})`;
        gameCtx.fillRect(p.x, p.y, 3, 3);
    }
}

function drawUI() {
    if (hasDoubleShot) {
        gameCtx.font = '10px monospace';
        gameCtx.fillStyle = '#e67e22';
        gameCtx.fillText(`🔫 ${Math.ceil(doubleShotTimer / 60)}s`, 15, 70);
    }
    if (hasShield) {
        gameCtx.fillStyle = '#00ff00';
        gameCtx.fillText(`🛡️ ${Math.ceil(shieldTimer / 60)}s`, 15, 90);
    }
}

function drawDamage() {
    if (damageEffect > 0) {
        gameCtx.fillStyle = `rgba(255, 0, 0, ${damageEffect / 35})`;
        gameCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
}

function draw() {
    drawGameBackground();
    drawEnemies();
    drawPowerups();
    drawBullets();
    drawShip();
    drawParticles();
    drawFloatingTexts();
    drawUI();
    drawDamage();
}

// ========== LOOP PRINCIPAL ==========
function gameLoop() {
    if (!gameRunning) return;
    if (!paused) {
        update();
        draw();
    }
    animationId = requestAnimationFrame(gameLoop);
}