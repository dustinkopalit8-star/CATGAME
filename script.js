// ========== SETUP CANVAS ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
// const d1 = dir(curr, prev);
// const d2 = dir(curr, next);
// ========== MODAL HELP HANDLERS ==========
// Tambahkan kode ini di bagian atas script.js Anda (setelah deklarasi variabel)

const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelp = document.getElementById('closeHelp');
// ================= ASSET LOADER =================
const images = {};
const sounds = {};

const ASSETS = {
    images: {
        background: 'assets/images/background.png',
        catDefault: 'assets/images/cat.png',
        catLeft: 'assets/images/cat_left.png',
        catRight: 'assets/images/cat_right.png',

        tailUp: 'assets/images/tail_up.png',
        tailDown: 'assets/images/tail_down.png',
        tailLeft: 'assets/images/tail_left.png',
        tailRight: 'assets/images/tail_right.png',

        tailCornerUpLeft: 'assets/images/tail_corner_up_left.png',
        tailCornerUpRight: 'assets/images/tail_corner_up_right.png',
        tailCornerDownLeft: 'assets/images/tail_corner_down_left.png',
        tailCornerDownRight: 'assets/images/tail_corner_down_right.png',

        salmon: 'assets/images/salmon.png',
        milk: 'assets/images/milk.png',
        water: 'assets/images/water.png',
        yarn: 'assets/images/yarn.png'
    },
    sounds: {
        eat: 'assets/sounds/nyam.mp3',
        grow: 'assets/sounds/blub.mp3',
        splash: 'assets/sounds/splosh.mp3',
        boost: 'assets/sounds/woosh.mp3',
        bgm: 'assets/sounds/bgm.mp3'
    }
};

let totalAssets = 0;
let loadedAssets = 0;
let currentScreen = 'loading'; // loading | start | game | gameover

function updateLoading() {
    const percent = Math.floor((loadedAssets / totalAssets) * 100);
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').innerText = percent + '%';
}

function assetLoaded() {
    loadedAssets++;
    updateLoading();

    if (loadedAssets >= totalAssets) {
        setTimeout(() => {

            // 🔒 JANGAN ganggu kalau game sudah jalan
            if (currentScreen !== 'loading') return;

            document.getElementById('loadingScreen').style.display = 'none';

            currentScreen = 'start';
            startScreen.style.display = 'flex';
            canvas.style.display = 'none';
            gameOverScreen.style.display = 'none';

        }, 300);
    }


}

function loadAssets() {
    // IMAGES
    for (const key in ASSETS.images) {
        totalAssets++;
        const img = new Image();
        img.src = ASSETS.images[key];
        img.onload = assetLoaded;
        img.onerror = assetLoaded;
        images[key] = img;
    }

    // SOUNDS
    for (const key in ASSETS.sounds) {
        totalAssets++;
        const audio = new Audio(ASSETS.sounds[key]);
        audio.preload = 'auto';
        audio.oncanplaythrough = assetLoaded;
        audio.onerror = assetLoaded;
        sounds[key] = audio;
    }

    sounds.bgm.loop = true;
    sounds.bgm.volume = 0.3;
}

loadAssets();

// Fungsi untuk membuka modal
function openHelpModal() {
    helpModal.classList.add('active');
    // Prevent scrolling pada body saat modal terbuka
    document.body.style.overflow = 'hidden';
}

// Fungsi untuk menutup modal
function closeHelpModal() {
    helpModal.classList.remove('active');
    // Restore scrolling pada body
    document.body.style.overflow = '';
}

// Event listener untuk tombol help
helpBtn.addEventListener('click', openHelpModal);

// Event listener untuk tombol close
closeHelp.addEventListener('click', closeHelpModal);

// Event listener untuk klik di luar modal (backdrop)
helpModal.addEventListener('click', (e) => {
    // Tutup modal hanya jika yang diklik adalah backdrop (bukan help-box)
    if (e.target === helpModal) {
        closeHelpModal();
    }
});

// Event listener untuk tombol ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal.classList.contains('active')) {
        closeHelpModal();
    }
});

// ========== TAMBAHAN: PREVENT SCROLL SAAT GAME BERJALAN ==========
// Prevent scrolling on mobile saat game berjalan
document.body.addEventListener('touchmove', (e) => {
    // Izinkan scroll hanya di dalam help-box
    if (!e.target.closest('.help-box')) {
        e.preventDefault();
    }
}, { passive: false });
// Set canvas size
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    // canvas.width = container.clientWidth;
    // canvas.height = container.clientHeight;
    canvas.width = 1600;
    canvas.height = 1200;

}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========== GAME CONSTANTS ==========
const GRID_SIZE = 110;
let moveInterval = 300; // normal
let moveAccumulator = 0;
// ms per frame
const SPEED_BOOST_MULTIPLIER = 0.5;
const SPEED_BOOST_DURATION = 5000; // 5 seconds

// ========== AUDIO SYSTEM (PLACEHOLDER) ==========

// sounds.grow.preload = 'auto';
// Set BGM to loop
sounds.bgm.loop = true;
sounds.bgm.volume = 0.3; // 30% volume
function stopAllSounds() {
    Object.values(sounds).forEach(sound => {
        try {
            sound.pause();
            sound.currentTime = 0;
        } catch (e) { }
    });
}


function playSound(soundName) {
    try {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.log('Sound not available:', soundName);
    }
}

// ========== IMAGE ASSETS (PLACEHOLDER) ==========



// ========== GAME STATE ==========
let gameState = {
    running: false,
    score: 0,
    cat: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    salmon: null,
    milk: null,
    milkTimer: 0,
    waterPuddles: [],
    yarnBall: null,
    yarnMoveTimer: 0,
    speedBoost: false,
    speedBoostTimer: 0,
    gridWidth: 40,
    gridHeight: 30,
    pendingTailGrow: 0,
    tailGrowTimer: 0

};

let lastFrameTime = 0;
let gameLoopId = null;

// ========== GAME FUNCTIONS ==========
function initGame() {
    gameState.pendingTailGrow = 0;
    gameState.tailGrowTimer = 0;

    gameState.gridWidth = Math.floor(canvas.width / GRID_SIZE);
    gameState.gridHeight = Math.floor(canvas.height / GRID_SIZE);

    // Initialize cat in the center
    const centerX = Math.floor(gameState.gridWidth / 2);
    const centerY = Math.floor(gameState.gridHeight / 2);
    gameState.cat = [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
    ];

    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.speedBoost = false;
    gameState.speedBoostTimer = 0;
    moveInterval = 300;

    // Spawn initial items
    spawnSalmon();
    spawnWaterPuddles();
    spawnYarnBall();

    updateScore();
}
function dir(from, to) {
    return { x: to.x - from.x, y: to.y - from.y };
}

function spawnSalmon() {
    let newPos;
    do {
        newPos = {
            x: Math.floor(Math.random() * gameState.gridWidth),
            y: Math.floor(Math.random() * gameState.gridHeight)
        };
    } while (isPositionOccupied(newPos));

    gameState.salmon = newPos;
}

function spawnMilk() {
    if (gameState.milk || Math.random() > 0.3) return;

    let newPos;
    do {
        newPos = {
            x: Math.floor(Math.random() * gameState.gridWidth),
            y: Math.floor(Math.random() * gameState.gridHeight)
        };
    } while (isPositionOccupied(newPos));

    gameState.milk = newPos;
    gameState.milkTimer = Date.now();
}

function spawnWaterPuddles() {
    gameState.waterPuddles = [];
    const puddleCount = 3 + Math.floor(gameState.score / 5);

    for (let i = 0; i < Math.min(puddleCount, 8); i++) {
        let newPos;
        do {
            newPos = {
                x: Math.floor(Math.random() * gameState.gridWidth),
                y: Math.floor(Math.random() * gameState.gridHeight)
            };
        } while (isPositionOccupied(newPos));

        gameState.waterPuddles.push(newPos);
    }
}

function spawnYarnBall() {
    let newPos;
    do {
        newPos = {
            x: Math.floor(Math.random() * gameState.gridWidth),
            y: Math.floor(Math.random() * gameState.gridHeight)
        };
    } while (isPositionOccupied(newPos));

    gameState.yarnBall = newPos;
    gameState.yarnMoveTimer = Date.now();
}
// function getTailSegmentImage(prev, curr, next) {
//     const d1 = { x: prev.x - curr.x, y: prev.y - curr.y };
//     const d2 = { x: next.x - curr.x, y: next.y - curr.y };

//     // =====================
//     // LURUS HORIZONTAL
//     // =====================
//     if (d1.x === d2.x && d1.x !== 0) {
//         return d1.x === 1 ? images.tailLeft : images.tailRight;
//     }

//     // =====================
//     // LURUS VERTIKAL
//     // =====================
//     if (d1.y === d2.y && d1.y !== 0) {
//         return d1.y === 1 ? images.tailUp : images.tailDown;
//     }

//     // =====================
//     // CORNER / SIKU
//     // =====================
//     if ((d1.x === 1 && d2.y === 1) || (d1.y === 1 && d2.x === 1))
//         return images.tailCornerUpLeft;

//     if ((d1.x === -1 && d2.y === 1) || (d1.y === 1 && d2.x === -1))
//         return images.tailCornerUpRight;

//     if ((d1.x === 1 && d2.y === -1) || (d1.y === -1 && d2.x === 1))
//         return images.tailCornerDownLeft;

//     if ((d1.x === -1 && d2.y === -1) || (d1.y === -1 && d2.x === -1))
//         return images.tailCornerDownRight;

//     return images.tailUp;
// }


function moveYarnBall() {
    if (!gameState.yarnBall) return;

    const directions = [
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 0, y: 1 }, { x: 0, y: -1 }
    ];

    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    const newPos = {
        x: gameState.yarnBall.x + randomDir.x,
        y: gameState.yarnBall.y + randomDir.y
    };

    // Keep yarn ball within bounds
    if (newPos.x >= 0 && newPos.x < gameState.gridWidth &&
        newPos.y >= 0 && newPos.y < gameState.gridHeight) {
        gameState.yarnBall = newPos;
    }
}

function isPositionOccupied(pos) {
    // Check cat
    if (gameState.cat.some(segment => segment.x === pos.x && segment.y === pos.y)) {
        return true;
    }

    // Check salmon
    if (gameState.salmon && gameState.salmon.x === pos.x && gameState.salmon.y === pos.y) {
        return true;
    }

    // Check milk
    if (gameState.milk && gameState.milk.x === pos.x && gameState.milk.y === pos.y) {
        return true;
    }

    // Check water puddles
    if (gameState.waterPuddles.some(puddle => puddle.x === pos.x && puddle.y === pos.y)) {
        return true;
    }

    // Check yarn ball
    if (gameState.yarnBall && gameState.yarnBall.x === pos.x && gameState.yarnBall.y === pos.y) {
        return true;
    }

    return false;
}

function updateGame(deltaTime) {

    // Update direction
    gameState.direction = { ...gameState.nextDirection };

    // Calculate new head position
    const head = gameState.cat[0];
    const newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y
    };

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= gameState.gridWidth ||
        newHead.y < 0 || newHead.y >= gameState.gridHeight) {
        gameOver();
        return;
    }

    // Check self collision
    // ❗️JANGAN cek kepala vs kepala
    if (
        gameState.cat.slice(1).some(
            segment => segment.x === newHead.x && segment.y === newHead.y
        )
    ) {
        gameOver('tail');
        return;
    }


    // Check water puddle collision
    if (gameState.waterPuddles.some(puddle => puddle.x === newHead.x && puddle.y === newHead.y)) {
        // playSound('splash');
        playSound('splash');
        gameOver('water');
        return;
    }

    // Check yarn ball collision
    if (gameState.yarnBall && gameState.yarnBall.x === newHead.x && gameState.yarnBall.y === newHead.y) {
        playSound('splash');
        gameOver('yarn');
        return;
    }

    // Add new head
    gameState.cat.unshift(newHead);

    // Check salmon collision
    // if (gameState.salmon && newHead.x === gameState.salmon.x && newHead.y === gameState.salmon.y) {
    //     playSound('eat');
    //     playSound('grow');
    //     gameState.score++;
    //     updateScore();
    //     spawnSalmon();
    //     spawnMilk();

    //     // Add more obstacles as score increases
    //     if (gameState.score % 5 === 0) {
    //         spawnWaterPuddles();
    //     }
    // } else {
    //     // Remove tail if not eating
    //     gameState.cat.pop();
    // }
    if (
        gameState.salmon &&
        newHead.x === gameState.salmon.x &&
        newHead.y === gameState.salmon.y
    ) {
        playSound('eat');

        // score tetap langsung naik
        gameState.score++;
        updateScore();

        // RENCANAKAN pertumbuhan ekor (delay)
        gameState.pendingTailGrow += 1;
        gameState.tailGrowTimer = 1000; // 2 detik

        spawnSalmon();
        spawnMilk();

        // Add more obstacles as score increases
        if (gameState.score % 5 === 0) {
            spawnWaterPuddles();
        }

        // ⚠️ JANGAN pop tail di sini
    } else {
        // normal move → hapus 1 segmen
        gameState.cat.pop();
    }


    // Check milk collision (speed boost)
    if (gameState.milk && newHead.x === gameState.milk.x && newHead.y === gameState.milk.y) {
        playSound('boost');
        gameState.speedBoost = true;
        gameState.speedBoostTimer = Date.now();
        moveInterval = 300 * SPEED_BOOST_MULTIPLIER;
        gameState.milk = null;
    }

    // Handle speed boost timer
    if (gameState.speedBoost && Date.now() - gameState.speedBoostTimer > SPEED_BOOST_DURATION) {
        gameState.speedBoost = false;
        moveInterval = 300;
    }

    // Remove milk if it's been there too long (10 seconds)
    if (gameState.milk && Date.now() - gameState.milkTimer > 10000) {
        gameState.milk = null;
    }

    // Move yarn ball every 2 seconds
    if (Date.now() - gameState.yarnMoveTimer > 1000) {
        moveYarnBall();
        gameState.yarnMoveTimer = Date.now();
    }
    // ===============================
    // DELAY TAIL GROW (2 DETIK)
    // ===============================
    if (gameState.running && gameState.pendingTailGrow > 0) {
        gameState.tailGrowTimer -= deltaTime;

        if (gameState.tailGrowTimer <= 0) {
            const last = gameState.cat[gameState.cat.length - 1];
            const beforeLast = gameState.cat[gameState.cat.length - 2];

            gameState.cat.push({
                x: last.x + (last.x - beforeLast.x),
                y: last.y + (last.y - beforeLast.y)
            });

            playSound('grow');
            gameState.pendingTailGrow--;
        }
    }

}
// function getTailSegmentImage(prev, curr, next) {
//     const dx1 = prev.x - curr.x;
//     const dy1 = prev.y - curr.y;
//     const dx2 = next.x - curr.x;
//     const dy2 = next.y - curr.y;

//     // ======================
//     // LURUS
//     // ======================
//     if (dx1 === dx2) {
//         return dx1 > 0 ? images.tailRight : images.tailLeft;
//     }

//     if (dy1 === dy2) {
//         return dy1 > 0 ? images.tailDown : images.tailUp;
//     }

//     // ======================
//     // CORNER (FIXED)
//     // ======================

//     // kanan + atas  (→ ↑)
//     // kiri + bawah
//     if (
//         (dx1 === 1 && dy2 === -1) ||
//         (dy1 === -1 && dx2 === 1)
//     ) return images.tailCornerLeftDown;

//     // kanan + bawah
//     if (
//         (dx1 === -1 && dy2 === -1) ||
//         (dy1 === -1 && dx2 === -1)
//     ) return images.tailCornerRightDown;

//     // kiri + atas
//     if (
//         (dx1 === 1 && dy2 === 1) ||
//         (dy1 === 1 && dx2 === 1)
//     ) return images.tailCornerLeftUp;

//     // kanan + atas
//     if (
//         (dx1 === -1 && dy2 === 1) ||
//         (dy1 === 1 && dx2 === -1)
//     ) return images.tailCornerRightUp;


//     return images.tailUp;
// }

function getTailSegmentImage(prev, curr, next) {
    const d1 = dir(curr, prev);
    const d2 = dir(curr, next);

    // ======================
    // LURUS HORIZONTAL
    // ======================
    if (d1.y === 0 && d2.y === 0) {
        return d1.x > 0 ? images.tailRight : images.tailLeft;
    }

    // ======================
    // LURUS VERTIKAL
    // ======================
    if (d1.x === 0 && d2.x === 0) {
        return d1.y > 0 ? images.tailDown : images.tailUp;
    }

    // ======================
    // SIKU / CORNER
    // ======================
    if (
        (d1.x > 0 && d2.y > 0) || (d1.y > 0 && d2.x > 0)
    ) return images.tailCornerUpLeft;

    if (
        (d1.x < 0 && d2.y > 0) || (d1.y > 0 && d2.x < 0)
    ) return images.tailCornerUpRight;

    if (
        (d1.x > 0 && d2.y < 0) || (d1.y < 0 && d2.x > 0)
    ) return images.tailCornerDownLeft;

    if (
        (d1.x < 0 && d2.y < 0) || (d1.y < 0 && d2.x < 0)
    ) return images.tailCornerDownRight;

    // fallback
    return images.tailUp;
}

function getTailImage(prev, curr) {
    if (prev.x > curr.x) return images.tailRight;
    if (prev.x < curr.x) return images.tailLeft;
    if (prev.y > curr.y) return images.tailDown;
    if (prev.y < curr.y) return images.tailUp;

    return images.tailUp;
}

function getCatHeadImage() {
    if (gameState.direction.x === -1) return images.catLeft;
    if (gameState.direction.x === 1) return images.catRight;
    return images.catDefault; // atas & bawah
}


function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded, otherwise use fallback color
    if (images.background.complete && images.background.naturalHeight !== 0) {
        ctx.drawImage(images.background, 0, 0);
    } else {
        // Fallback: Draw simple room background
        ctx.fillStyle = '#daa520';
        ctx.fillRect(0, canvas.height - GRID_SIZE * 2, canvas.width, GRID_SIZE * 2);
    }

    // Draw water puddles
    gameState.waterPuddles.forEach(puddle => {
        if (images.water.complete && images.water.naturalHeight !== 0) {
            ctx.drawImage(
                images.water,
                puddle.x * GRID_SIZE,
                puddle.y * GRID_SIZE,
                GRID_SIZE,
                GRID_SIZE
            );
        } else {
            // Fallback: Draw water puddle with shapes
            ctx.fillStyle = '#4169e1';
            ctx.beginPath();
            ctx.arc(
                puddle.x * GRID_SIZE + GRID_SIZE / 2,
                puddle.y * GRID_SIZE + GRID_SIZE / 2,
                GRID_SIZE / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.fillStyle = '#1e90ff';
            ctx.beginPath();
            ctx.arc(
                puddle.x * GRID_SIZE + GRID_SIZE / 2,
                puddle.y * GRID_SIZE + GRID_SIZE / 2,
                GRID_SIZE / 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });

    // Draw yarn ball
    if (gameState.yarnBall) {
        if (images.yarn.complete && images.yarn.naturalHeight !== 0) {
            ctx.drawImage(
                images.yarn,
                gameState.yarnBall.x * GRID_SIZE,
                gameState.yarnBall.y * GRID_SIZE,
                GRID_SIZE,
                GRID_SIZE
            );
        } else {
            // Fallback: Draw yarn ball with shapes
            ctx.fillStyle = '#ff69b4';
            ctx.beginPath();
            ctx.arc(
                gameState.yarnBall.x * GRID_SIZE + GRID_SIZE / 2,
                gameState.yarnBall.y * GRID_SIZE + GRID_SIZE / 2,
                GRID_SIZE / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.strokeStyle = '#ff1493';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(
                    gameState.yarnBall.x * GRID_SIZE + GRID_SIZE / 2,
                    gameState.yarnBall.y * GRID_SIZE + GRID_SIZE / 2,
                    (GRID_SIZE / 2) - i * 3,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }
        }
    }

    // Draw salmon
    if (gameState.salmon) {
        if (images.salmon.complete && images.salmon.naturalHeight !== 0) {
            ctx.drawImage(
                images.salmon,
                gameState.salmon.x * GRID_SIZE,
                gameState.salmon.y * GRID_SIZE,
                GRID_SIZE,
                GRID_SIZE
            );
        } else {
            // Fallback: Draw salmon with rectangles
            ctx.fillStyle = '#ff6347';
            ctx.fillRect(
                gameState.salmon.x * GRID_SIZE + 2,
                gameState.salmon.y * GRID_SIZE + 2,
                GRID_SIZE - 4,
                GRID_SIZE - 4
            );
            ctx.fillStyle = '#ff4500';
            ctx.fillRect(
                gameState.salmon.x * GRID_SIZE + 6,
                gameState.salmon.y * GRID_SIZE + 6,
                GRID_SIZE - 12,
                GRID_SIZE - 12
            );
        }
    }

    // Draw milk
    if (gameState.milk) {
        if (images.milk.complete && images.milk.naturalHeight !== 0) {
            ctx.drawImage(
                images.milk,
                gameState.milk.x * GRID_SIZE,
                gameState.milk.y * GRID_SIZE,
                GRID_SIZE,
                GRID_SIZE
            );
        } else {
            // Fallback: Draw milk box
            ctx.fillStyle = '#f0f8ff';
            ctx.fillRect(
                gameState.milk.x * GRID_SIZE + 3,
                gameState.milk.y * GRID_SIZE + 3,
                GRID_SIZE - 6,
                GRID_SIZE - 6
            );
            ctx.fillStyle = '#4169e1';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                '🥛',
                gameState.milk.x * GRID_SIZE + GRID_SIZE / 2,
                gameState.milk.y * GRID_SIZE + GRID_SIZE / 2 + 4
            );
        }
    }

    // Draw cat tail
    // for (let i = 1; i < gameState.cat.length; i++) {
    //     const segment = gameState.cat[i];
    //     if (images.tail.complete && images.tail.naturalHeight !== 0) {
    //         ctx.drawImage(
    //             images.tail,
    //             segment.x * GRID_SIZE,
    //             segment.y * GRID_SIZE,
    //             GRID_SIZE,
    //             GRID_SIZE
    //         );
    //     } else {
    //         // Fallback: Draw tail segments
    //         ctx.fillStyle = gameState.speedBoost ? '#ffa500' : '#d2691e';
    //         ctx.fillRect(
    //             segment.x * GRID_SIZE + 3,
    //             segment.y * GRID_SIZE + 3,
    //             GRID_SIZE - 6,
    //             GRID_SIZE - 6
    //         );
    //     }
    // }


    // for (let i = 1; i < gameState.cat.length - 1; i++) {
    //     const prev = gameState.cat[i - 1];
    //     const curr = gameState.cat[i];
    //     const next = gameState.cat[i + 1];

    //     const tailImg = getTailSegmentImage(prev, curr, next);

    //     if (tailImg.complete && tailImg.naturalHeight !== 0) {
    //         ctx.drawImage(
    //             tailImg,
    //             curr.x * GRID_SIZE,
    //             curr.y * GRID_SIZE,
    //             GRID_SIZE,
    //             GRID_SIZE
    //         );
    //     } else {
    //         ctx.fillStyle = '#d2691e';
    //         ctx.fillRect(
    //             curr.x * GRID_SIZE + 4,
    //             curr.y * GRID_SIZE + 4,
    //             GRID_SIZE - 8,
    //             GRID_SIZE - 8
    //         );
    //     }
    // }

    for (let i = 1; i < gameState.cat.length - 1; i++) {
        const prev = gameState.cat[i - 1];
        const curr = gameState.cat[i];
        const next = gameState.cat[i + 1];

        if (
            gameState.pendingTailGrow > 0 &&
            i === gameState.cat.length - 2
        ) {
            ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 100) * 0.4;
        } else {
            ctx.globalAlpha = 1;
        }

        const tailImg = getTailSegmentImage(prev, curr, next);

        ctx.drawImage(
            tailImg,
            curr.x * GRID_SIZE,
            curr.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
    }

    ctx.globalAlpha = 1;



    // Draw cat head
    // const head = gameState.cat[0];

    // if (images.cat.complete && images.cat.naturalHeight !== 0) {
    //     ctx.drawImage(
    //         images.cat,
    //         head.x * GRID_SIZE,
    //         head.y * GRID_SIZE,
    //         GRID_SIZE,
    //         GRID_SIZE
    //     );  

    // } else {
    //     ctx.fillStyle = '#ff8c69';
    //     ctx.beginPath();
    //     ctx.arc(
    //         pos.x + GRID_SIZE / 2,
    //         pos.y + GRID_SIZE / 2,
    //         GRID_SIZE / 2 - 1,
    //         0,
    //         Math.PI * 2
    //     );
    //     ctx.fill();
    // }
    const head = gameState.cat[0];

    const headImg = getCatHeadImage();

    if (headImg.complete && headImg.naturalHeight !== 0) {
        ctx.drawImage(
            headImg,
            head.x * GRID_SIZE,
            head.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
    }


}

function gameLoop(timestamp) {
    if (!gameState.running) return;

    if (!lastFrameTime) lastFrameTime = timestamp;

    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    moveAccumulator += deltaTime;

    if (moveAccumulator >= moveInterval) {
        updateGame(moveAccumulator);
        moveAccumulator = 0;
    }

    drawGame();
    gameLoopId = requestAnimationFrame(gameLoop);
}




function startGame() {
    if (loadedAssets < totalAssets) return;

    currentScreen = 'game'; // ⬅️ PINDAHKAN KE PALING ATAS

    cancelAnimationFrame(gameLoopId);
    stopAllSounds();

    moveAccumulator = 0;
    lastFrameTime = 0;

    initGame();
    gameState.running = true;

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';

    playSound('bgm');
    gameLoopId = requestAnimationFrame(gameLoop);
}



function gameOver(reason) {
    gameState.running = false;
    cancelAnimationFrame(gameLoopId);

    stopAllSounds();
     if (reason === 'water') {
        sounds.splash.play();
    }

    if (reason === 'yarn') {
        sounds.splash.play();
    }
    currentScreen = 'gameover';

    finalScoreDisplay.textContent = gameState.score;

    gameOverScreen.style.display = 'flex';
    startScreen.style.display = 'none';
    canvas.style.display = 'none';
}



// function gameOver() {
//     gameState.running = false;
//     cancelAnimationFrame(gameLoopId);
//     finalScoreDisplay.textContent = gameState.score;
//     gameOverScreen.style.display = 'flex';

//     // Stop BGM
//     try {
//         sounds.bgm.pause();
//         sounds.bgm.currentTime = 0;
//     } catch (e) { }
// }

function updateScore() {
    scoreDisplay.textContent = gameState.score;
}

// ========== INPUT HANDLING ==========
function changeDirection(newDir) {
    // Prevent reversing direction (can't go directly opposite)
    if (newDir.x === -gameState.direction.x && newDir.y === -gameState.direction.y) {
        return;
    }
    gameState.nextDirection = newDir;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameState.running) {
        if (e.code === 'Space') {
            if (startScreen.style.display !== 'none') {
                startGame();
            } else if (gameOverScreen.style.display !== 'none') {
                startGame();
            }
        }
        return;
    }

    switch (e.code) {
        case 'ArrowUp':
            e.preventDefault();
            changeDirection({ x: 0, y: -1 });
            break;
        case 'ArrowDown':
            e.preventDefault();
            changeDirection({ x: 0, y: 1 });
            break;
        case 'ArrowLeft':
            e.preventDefault();
            changeDirection({ x: -1, y: 0 });
            break;
        case 'ArrowRight':
            e.preventDefault();
            changeDirection({ x: 1, y: 0 });
            break;
    }
});

// Touch controls for mobile
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameState.running) return;

        const direction = btn.dataset.direction;
        switch (direction) {
            case 'up':
                changeDirection({ x: 0, y: -1 });
                break;
            case 'down':
                changeDirection({ x: 0, y: 1 });
                break;
            case 'left':
                changeDirection({ x: -1, y: 0 });
                break;
            case 'right':
                changeDirection({ x: 1, y: 0 });
                break;
        }
    });

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!gameState.running) return;

        const direction = btn.dataset.direction;
        switch (direction) {
            case 'up':
                changeDirection({ x: 0, y: -1 });
                break;
            case 'down':
                changeDirection({ x: 0, y: 1 });
                break;
            case 'left':
                changeDirection({ x: -1, y: 0 });
                break;
            case 'right':
                changeDirection({ x: 1, y: 0 });
                break;
        }
    });
});

// Button event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Prevent scrolling on mobile
document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });