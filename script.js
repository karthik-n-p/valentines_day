function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's'; // 3-5 seconds

    document.querySelector('.hearts-container').appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 5000);
}

setInterval(createHeart, 300);

let noBtnState = 0; // 0: initial, 1+: moved

function moveButton(e) {
    if (e && e.type === 'touchstart') e.preventDefault();

    const noBtn = document.getElementById('noBtn');
    const container = document.querySelector('.container');

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

    const padding = 20; // Safety buffer

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
    const moveRange = 200; // Move up to 200px from current spot

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
    const crashScreen = document.getElementById('crashContainer');
    crashScreen.classList.remove('hidden');

    // Simulate BSOD progress
    let progress = 0;
    const progressEl = document.querySelector('.progress');

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 100) progress = 100;
        progressEl.textContent = progress + '% complete';

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
    setInterval(createHeart, 100);
}
