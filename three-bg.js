import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('bg-canvas');
if (!canvas) {
    throw new Error('Missing #bg-canvas');
}

const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.z = 12;

const ambient = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambient);

const light = new THREE.PointLight(0xff8fa3, 1.2, 50);
light.position.set(8, 6, 10);
scene.add(light);

function createHeartTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);

    const gradient = ctx.createRadialGradient(size * 0.5, size * 0.45, 6, size * 0.5, size * 0.55, 60);
    gradient.addColorStop(0, 'rgba(255, 77, 109, 1)');
    gradient.addColorStop(0.55, 'rgba(255, 143, 163, 0.95)');
    gradient.addColorStop(1, 'rgba(255, 143, 163, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    const x = size * 0.5;
    const y = size * 0.55;
    const topCurveHeight = size * 0.27;

    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - topCurveHeight, x - size * 0.5, y - topCurveHeight, x - size * 0.5, y);
    ctx.bezierCurveTo(x - size * 0.5, y + size * 0.35, x, y + size * 0.38, x, y + size * 0.58);
    ctx.bezierCurveTo(x, y + size * 0.38, x + size * 0.5, y + size * 0.35, x + size * 0.5, y);
    ctx.bezierCurveTo(x + size * 0.5, y - topCurveHeight, x, y - topCurveHeight, x, y);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

const particleCount = Math.min(900, Math.floor((window.innerWidth * window.innerHeight) / 2500));
const positions = new Float32Array(particleCount * 3);
const speeds = new Float32Array(particleCount);
const phases = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 24;
    positions[i3 + 1] = (Math.random() - 0.5) * 14;
    positions[i3 + 2] = (Math.random() - 0.5) * 14;
    speeds[i] = 0.15 + Math.random() * 0.35;
    phases[i] = Math.random() * Math.PI * 2;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    color: 0xff4d6d,
    size: 0.08,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);
scene.add(points);

const heartTexture = createHeartTexture();
const burstMax = 160;
const burstGeo = new THREE.PlaneGeometry(1, 1);
const burstMat = new THREE.MeshBasicMaterial({
    map: heartTexture || null,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const burstMesh = new THREE.InstancedMesh(burstGeo, burstMat, burstMax);
burstMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
burstMesh.count = 0;
scene.add(burstMesh);

const burstPos = new Array(burstMax);
const burstVel = new Array(burstMax);
const burstLife = new Float32Array(burstMax);
const burstActive = new Uint8Array(burstMax);
for (let i = 0; i < burstMax; i++) {
    burstPos[i] = new THREE.Vector3();
    burstVel[i] = new THREE.Vector3();
    burstLife[i] = 0;
    burstActive[i] = 0;
}

const tmpMat = new THREE.Matrix4();
const tmpPos = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpScale = new THREE.Vector3();

function screenToWorld(clientX, clientY, zPlane = 0) {
    const ndc = new THREE.Vector3(
        (clientX / window.innerWidth) * 2 - 1,
        -((clientY / window.innerHeight) * 2 - 1),
        0.5
    );
    ndc.unproject(camera);

    const dir = ndc.sub(camera.position).normalize();
    const t = (zPlane - camera.position.z) / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(t));
}

function spawnBurstAt(clientX, clientY) {
    if (!running) return;

    const origin = screenToWorld(clientX, clientY, 0);
    const count = 22;

    for (let n = 0; n < count; n++) {
        let idx = -1;
        for (let i = 0; i < burstMax; i++) {
            if (!burstActive[i]) {
                idx = i;
                break;
            }
        }
        if (idx === -1) break;

        burstActive[idx] = 1;
        burstLife[idx] = 0.9 + Math.random() * 0.8;

        burstPos[idx].copy(origin);
        burstPos[idx].x += (Math.random() - 0.5) * 0.6;
        burstPos[idx].y += (Math.random() - 0.5) * 0.4;

        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 2.0;
        burstVel[idx].set(Math.cos(angle) * speed, Math.sin(angle) * speed + 1.2, (Math.random() - 0.5) * 0.8);
    }
}

let running = !prefersReducedMotion;

let targetPX = 0;
let targetPY = 0;
let currentPX = 0;
let currentPY = 0;

function setTargetFromClientXY(clientX, clientY) {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = (clientY / window.innerHeight) * 2 - 1;
    targetPX = Math.max(-1, Math.min(1, x));
    targetPY = Math.max(-1, Math.min(1, y));
}

window.addEventListener('pointermove', (e) => {
    if (!running) return;
    setTargetFromClientXY(e.clientX, e.clientY);
}, { passive: true });

window.addEventListener('pointerdown', (e) => {
    if (!running) return;
    spawnBurstAt(e.clientX, e.clientY);
}, { passive: true });

window.addEventListener('pointerleave', () => {
    targetPX = 0;
    targetPY = 0;
}, { passive: true });

function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

resize();
window.addEventListener('resize', resize, { passive: true });

document.addEventListener('visibilitychange', () => {
    running = !document.hidden && !prefersReducedMotion;
});

const clock = new THREE.Clock();
let lastClientX = window.innerWidth * 0.5;
let lastClientY = window.innerHeight * 0.5;

window.addEventListener('pointermove', (e) => {
    lastClientX = e.clientX;
    lastClientY = e.clientY;
}, { passive: true });

function animate() {
    requestAnimationFrame(animate);
    if (!running) return;

    const t = clock.getElapsedTime();
    const dt = Math.min(0.033, clock.getDelta());

    currentPX += (targetPX - currentPX) * 0.06;
    currentPY += (targetPY - currentPY) * 0.06;

    camera.position.x = currentPX * 0.9;
    camera.position.y = -currentPY * 0.6;
    camera.lookAt(0, 0, 0);

    const pointerWorld = screenToWorld(lastClientX, lastClientY, 0);

    const attr = geometry.getAttribute('position');

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const baseY = positions[i3 + 1];

        const px = x;
        const py = baseY;
        const dx = px - pointerWorld.x;
        const dy = py - pointerWorld.y;
        const d2 = dx * dx + dy * dy;
        const influence = 1.0 / (1.0 + d2 * 0.9);
        const repel = influence * 0.65;

        attr.array[i3] = x + Math.sin(t * speeds[i] + phases[i]) * 0.25 + dx * repel;
        attr.array[i3 + 1] = baseY + Math.cos(t * (speeds[i] * 0.9) + phases[i]) * 0.25 + dy * repel;
    }

    attr.needsUpdate = true;
    points.rotation.y = t * 0.04 + currentPX * 0.08;
    points.rotation.x = currentPY * 0.05;

    let activeCount = 0;
    for (let i = 0; i < burstMax; i++) {
        if (!burstActive[i]) continue;

        burstLife[i] -= dt;
        if (burstLife[i] <= 0) {
            burstActive[i] = 0;
            continue;
        }

        burstVel[i].y -= 1.9 * dt;
        burstVel[i].multiplyScalar(0.985);
        burstPos[i].addScaledVector(burstVel[i], dt);

        const life01 = Math.max(0, Math.min(1, burstLife[i] / 1.6));
        const s = 0.28 + (1 - life01) * 0.22;

        tmpPos.copy(burstPos[i]);
        tmpQuat.setFromEuler(new THREE.Euler(0, 0, (1 - life01) * 2.2, 'XYZ'));
        tmpScale.set(s, s, s);
        tmpMat.compose(tmpPos, tmpQuat, tmpScale);
        burstMesh.setMatrixAt(activeCount, tmpMat);
        activeCount++;
        if (activeCount >= burstMax) break;
    }
    burstMesh.count = activeCount;
    burstMesh.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
}

animate();
