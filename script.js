const MAX_HEARTS = 30;

let heartRainIntervalId = null;

function startHeartRain(ms) {
    if (heartRainIntervalId) {
        clearInterval(heartRainIntervalId);
        heartRainIntervalId = null;
    }

    const container = document.querySelector('.hearts-container');
    if (container) {
        const hearts = container.querySelectorAll('.heart');
        if (hearts.length > MAX_HEARTS) {
            for (let i = 0; i < hearts.length - MAX_HEARTS; i++) hearts[i].remove();
        }
    }

    heartRainIntervalId = setInterval(createHeart, ms);
}

function stopHeartRain() {
    if (!heartRainIntervalId) return;
    clearInterval(heartRainIntervalId);
    heartRainIntervalId = null;
}

function createHeart() {
    const container = document.querySelector('.hearts-container');
    if (!container) return;

    const currentHearts = container.querySelectorAll('.heart').length;
    if (currentHearts >= MAX_HEARTS) return;

    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's'; // 3-5 seconds

    container.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 5200);
}

startHeartRain(300);

function setupTeddyReactions() {
    const mainContainer = document.getElementById('mainContainer');
    const successContainer = document.getElementById('successContainer');
    const containers = [mainContainer, successContainer].filter(Boolean);

    for (const container of containers) {
        const teddy = container.querySelector('.teddy');
        if (!teddy) continue;

        const setLook = (clientX, clientY) => {
            const rect = teddy.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (clientX - cx) / 90;
            const dy = (clientY - cy) / 90;
            const lookX = Math.max(-1, Math.min(1, dx));
            const lookY = Math.max(-1, Math.min(1, dy));
            teddy.style.setProperty('--look-x', lookX);
            teddy.style.setProperty('--look-y', lookY);
        };

        container.addEventListener('pointermove', (e) => {
            if (container.classList.contains('hidden')) return;
            setLook(e.clientX, e.clientY);
        }, { passive: true });

        container.addEventListener('pointerleave', () => {
            teddy.style.setProperty('--look-x', 0);
            teddy.style.setProperty('--look-y', 0);
        }, { passive: true });
    }
}

setupTeddyReactions();

function setupYesAttentionNearNo() {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const yesBtn = document.querySelector('.yes-btn');
    const noBtn = document.getElementById('noBtn');
    if (!yesBtn || !noBtn) return;

    let lastX = window.innerWidth * 0.5;
    let lastY = window.innerHeight * 0.5;
    let raf = 0;
    let active = false;

    const setActive = (next) => {
        if (active === next) return;
        active = next;
        yesBtn.classList.toggle('attention', active);

        const mainTeddy = document.querySelector('#mainContainer .teddy');
        if (mainTeddy) mainTeddy.classList.toggle('happy', active);
    };

    const tick = () => {
        raf = 0;
        if (document.body.classList.contains('crashed')) {
            setActive(false);
            return;
        }

        const rect = noBtn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - lastX;
        const dy = cy - lastY;
        const d = Math.sqrt(dx * dx + dy * dy);
        setActive(d < 160);
    };

    window.addEventListener('pointermove', (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
        setActive(false);
    }, { passive: true });
}

setupYesAttentionNearNo();

let rainPointerX = window.innerWidth * 0.5;
let rainPointerY = window.innerHeight * 0.5;

window.addEventListener('pointermove', (e) => {
    rainPointerX = e.clientX;
    rainPointerY = e.clientY;
}, { passive: true });

window.addEventListener('pointerdown', (e) => {
    const container = document.querySelector('.hearts-container');
    if (!container) return;

    const hearts = Array.from(container.querySelectorAll('.heart'));
    if (hearts.length === 0) return;

    let best = null;
    let bestD2 = Infinity;
    const radius = 80;
    const r2 = radius * radius;

    for (const h of hearts) {
        const rect = h.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
            bestD2 = d2;
            best = h;
        }
    }

    if (best && bestD2 <= r2) {
        best.classList.add('pop');
        setTimeout(() => best.remove(), 240);
    }
}, { passive: true });

function tickLoveRainInteraction() {
    const container = document.querySelector('.hearts-container');
    if (container) {
        const hearts = container.querySelectorAll('.heart');
        const influenceRadius = 160;
        const ir2 = influenceRadius * influenceRadius;

        for (const h of hearts) {
            if (h.classList.contains('pop')) continue;

            const rect = h.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = cx - rainPointerX;
            const dy = cy - rainPointerY;
            const d2 = dx * dx + dy * dy;

            if (d2 < ir2) {
                const strength = 1 - d2 / ir2;
                const repel = strength * 18;
                const len = Math.max(1, Math.sqrt(d2));
                const ox = (dx / len) * repel;
                const oy = (dy / len) * repel;
                h.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
            } else {
                h.style.transform = 'translate3d(0px, 0px, 0)';
            }
        }
    }

    requestAnimationFrame(tickLoveRainInteraction);
}

requestAnimationFrame(tickLoveRainInteraction);

const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    const containers = [];
    const mainContainer = document.getElementById('mainContainer');
    const successContainer = document.getElementById('successContainer');
    if (mainContainer) containers.push(mainContainer);
    if (successContainer) containers.push(successContainer);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function updateTarget(clientX, clientY) {
        const x = (clientX / window.innerWidth) * 2 - 1;
        const y = (clientY / window.innerHeight) * 2 - 1;
        targetX = Math.max(-1, Math.min(1, x));
        targetY = Math.max(-1, Math.min(1, y));
    }

    window.addEventListener('pointermove', (e) => {
        updateTarget(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
        targetX = 0;
        targetY = 0;
    }, { passive: true });

    function tick() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        const translateX = currentX * 10;
        const translateY = currentY * 8;
        const rotateY = currentX * 2.2;
        const rotateX = -currentY * 2.0;

        for (const el of containers) {
            if (el.classList.contains('hidden')) continue;
            el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

let noBtnState = 0; // 0: initial, 1+: moved

function showChangeMind() {
    const prompt = document.getElementById('changeMindPrompt');
    if (prompt) prompt.classList.remove('hidden');
}

function hideChangeMind() {
    const prompt = document.getElementById('changeMindPrompt');
    if (prompt) prompt.classList.add('hidden');
}

function resetNoButton() {
    const noBtn = document.getElementById('noBtn');
    if (!noBtn) return;

    noBtn.classList.remove('crying');
    noBtn.classList.remove('scared');
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';

    const textNode = Array.from(noBtn.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (textNode) {
        textNode.textContent = ' No';
    }

    noBtnState = 0;
}

function changeMind() {
    hideChangeMind();

    const success = document.getElementById('successContainer');
    const main = document.getElementById('mainContainer');
    if (success) success.classList.add('hidden');
    if (main) main.classList.remove('hidden');

    resetNoButton();

    startHeartRain(300);
}

function moveButton(e) {
    if (e && e.type === 'touchstart') e.preventDefault();

    const noBtn = document.getElementById('noBtn');
    const container = document.querySelector('.container');

    const teddy = document.querySelector('#mainContainer .teddy');
    if (teddy) {
        teddy.classList.add('crying');
        clearTimeout(teddy._cryTimeout);
        teddy._cryTimeout = setTimeout(() => {
            teddy.classList.remove('crying');
        }, 1200);
    }

    // Add crying expression
    noBtn.classList.add('crying');

    // Logic to "hide" or change text
    const attempts = [
        'No', 'Are you sure?', 'Really?', 'Think again!', 'Last chance!',
        'Please?', 'Don\'t do this!', 'I\'m sad :(', 'You\'re breaking my heart',
        'Just click Yes!', 'I have cookies!', 'Pretty please?', 'Okay, I\'ll cry',
        'Look at me crying', 'Fine, I\'ll stay here', 'Can\'t catch me!',
        'After all that effort?', 'Why use the hard way?', 'Just give in!',
        'I can do this all day', 'You are persistent!', 'But I love you!',
        'Is the button broken?', 'Nope, still here!', 'Catch me if you can!'
    ];

    // Find the text node (usually the last child due to HTML structure)
    // We want to preserve the .face span
    let textNode = Array.from(noBtn.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length > 0);

    if (textNode) {
        textNode.textContent = ' ' + attempts[noBtnState % attempts.length];
    }

    // Recalculate dimensions after text change (in case width changed)
    // Force a reflow/recalc to get new dimensions with new text
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    // Get viewport dimensions cleanly
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    const padding = Math.max(12, Math.floor(Math.min(winWidth, winHeight) * 0.04)); // Safety buffer

    // Calculate max allowed position
    let maxX = winWidth - btnWidth - padding;
    let maxY = winHeight - btnHeight - padding;

    // If button is wider than screen (unlikely but possible on mobile), stick to left 0 + padding
    if (maxX < padding) maxX = padding;
    if (maxY < padding) maxY = padding;

    // Current position
    // If position is not yet fixed/absolute (first hover), get boundingRect
    // If it is fixed, use offsetLeft/Top
    let currentX = noBtn.offsetLeft;
    let currentY = noBtn.offsetTop;

    // Limit movement distance (radius)
    const moveRange = Math.min(200, Math.floor(Math.min(winWidth, winHeight) * 0.25)); // Responsive move range

    // Random offset between -moveRange and +moveRange
    let deltaX = (Math.random() - 0.5) * 2 * moveRange;
    let deltaY = (Math.random() - 0.5) * 2 * moveRange;

    // Ensure we move at least a little bit (avoid staying still)
    if (Math.abs(deltaX) < 50) deltaX = deltaX > 0 ? 50 : -50;
    if (Math.abs(deltaY) < 50) deltaY = deltaY > 0 ? 50 : -50;

    let newX = currentX + deltaX;
    let newY = currentY + deltaY;

    // Clamp values strict check to keep on screen
    newX = Math.max(padding, Math.min(newX, maxX));
    newY = Math.max(padding, Math.min(newY, maxY));

    // Update position
    noBtn.style.position = 'fixed'; // Switch to fixed on first move to escape container
    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';

    noBtnState++;

    // Reset expression after movement stops (simulated)
    setTimeout(() => {
        noBtn.classList.remove('crying');
    }, 1000); // Extended time for crying effect
}

function acceptProposal() {
    document.getElementById('mainContainer').classList.add('hidden');
    // document.getElementById('successContainer').classList.remove('hidden'); // Original success

    // Show Crash Screen
    document.body.classList.add('crashed'); // Hide hearts
    stopHeartRain();
    const crashScreen = document.getElementById('crashContainer');
    crashScreen.classList.remove('hidden');

    // Simulate BSOD progress
    let progress = 0;
    const progressEl = document.querySelector('.progress');
    const progressBarEl = document.getElementById('crashProgressBar');

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 100) progress = 100;
        progressEl.textContent = progress + '% complete';
        if (progressBarEl) progressBarEl.style.width = progress + '%';

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                // Show recovery option
                document.getElementById('recoveryOptions').classList.remove('hidden');
            }, 500);
        }
    }, 100); // Faster progress

    // Play error sound? (Browser might block)

    // Make heart interactive immediately
    const heart = document.querySelector('.bsod-face');
    heart.onclick = function () {
        if (heart.textContent === '💔') {
            heart.textContent = '❤️';
            heart.style.textShadow = '0 0 20px white';

            // Update progress text
            document.querySelector('.progress').textContent = 'Manual override detected...';
            if (progressBarEl) progressBarEl.style.width = '100%';

            setTimeout(() => {
                fixSystem();
            }, 1000);
        }
    };
}

function fixSystem() {
    // Hide crash screen
    document.getElementById('crashContainer').classList.add('hidden');
    document.body.classList.remove('crashed');

    // Show success
    document.getElementById('successContainer').classList.remove('hidden');

    // Intensify hearts
    startHeartRain(100);
}
