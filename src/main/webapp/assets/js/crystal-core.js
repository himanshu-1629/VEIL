/**
 * VEIL — Interactive 3D Crystal Core Component
 * Implements the layered emerald crystal shield with orbital rings,
 * cursor-responsive tilt, idle float, and live telemetry nodes.
 *
 * Designed with Three.js (local assets/js/three.min.js).
 * Compliant with Cyprus (#004741) & Sand (#F0EDE6) light mode aesthetic.
 */

'use strict';

(function () {
    let scene, camera, renderer;
    let crystalRootGroup, shieldGroup, pedestalGroup;
    let coreMesh, innerGlassMesh, outerGlassMesh, outerEdges;
    let orbitalRing1, orbitalRing2;
    let orbitalNodes = [];
    let raycaster, mouse2D;
    let animFrameId = null;
    let isRunning = false;
    let isHovered = false;

    // Motion state
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let baseTime = 0;
    let hoveredNode = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Palette tokens
    const COLORS = {
        cyprusDeep: 0x00332E,
        cyprus: 0x004741,
        cyprusMid: 0x0A5C52,
        emeraldBright: 0x00A887,
        emeraldGlow: 0x52B79A,
        glassOuter: 0xE0F3EE,
        pedestalGlass: 0x22786A,
        pedestalSand: 0xE8E3DA,
        goldEmboss: 0xD4AF37
    };

    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    function initCrystalCore() {
        const container = document.getElementById('crystal-canvas-container');
        if (!container) return;

        if (typeof THREE === 'undefined' || !isWebGLAvailable()) {
            initFallbackStage(container);
            return;
        }

        const width = container.clientWidth || 520;
        const height = container.clientHeight || 440;

        // 1. Scene
        scene = new THREE.Scene();

        // 2. Camera
        camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(0, 0.35, 6.4);

        // 3. Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // 4. Lighting
        setupLighting();

        // 5. Build Crystal Hierarchy
        crystalRootGroup = new THREE.Group();
        crystalRootGroup.position.set(0, -0.15, 0);
        scene.add(crystalRootGroup);

        buildShieldAssemblies();
        buildPedestal();
        buildOrbitalRings();
        buildOrbitalNodes();

        // 6. Interaction
        raycaster = new THREE.Raycaster();
        mouse2D = new THREE.Vector2(-999, -999);

        setupEventListeners(container);

        // 7. Start Animation Loop
        startLoop();
    }

    function setupLighting() {
        // Soft ambient light with warm Sand tone
        const ambientLight = new THREE.AmbientLight(0xFFFAF2, 0.9);
        scene.add(ambientLight);

        // Main key light from top-front
        const keyLight = new THREE.DirectionalLight(0xF0FFFA, 1.4);
        keyLight.position.set(3.5, 4.5, 4.0);
        scene.add(keyLight);

        // Cool rim light from rear-left
        const rimLight = new THREE.DirectionalLight(0x7CEAD8, 0.7);
        rimLight.position.set(-4.0, -1.5, -3.0);
        scene.add(rimLight);

        // Internal emerald point light inside crystal core
        const corePointLight = new THREE.PointLight(0x00E5B8, 1.2, 5);
        corePointLight.position.set(0, 0.2, 0.8);
        scene.add(corePointLight);

        // Soft warm bounce from pedestal
        const bounceLight = new THREE.DirectionalLight(0xF0EDE6, 0.4);
        bounceLight.position.set(0, -4, 2);
        scene.add(bounceLight);
    }

    function createShieldShape(scale = 1.0) {
        const shape = new THREE.Shape();
        const s = scale;
        // Crest / Shield outline
        shape.moveTo(0, 1.55 * s);
        shape.lineTo(1.05 * s, 1.35 * s);
        shape.lineTo(1.12 * s, 0.35 * s);
        shape.quadraticCurveTo(0.95 * s, -0.65 * s, 0, -1.65 * s);
        shape.quadraticCurveTo(-0.95 * s, -0.65 * s, -1.12 * s, 0.35 * s);
        shape.lineTo(-1.05 * s, 1.35 * s);
        shape.closePath();
        return shape;
    }

    function createVeilEmbossTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Transparent background
        ctx.clearRect(0, 0, 512, 512);

        // Technical decorative border
        ctx.strokeStyle = 'rgba(230, 248, 242, 0.25)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(256, 256, 170, 0, Math.PI * 2);
        ctx.stroke();

        // Subtle quadrant ticks
        ctx.strokeStyle = 'rgba(230, 248, 242, 0.4)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(256 + Math.cos(angle) * 160, 256 + Math.sin(angle) * 160);
            ctx.lineTo(256 + Math.cos(angle) * 180, 256 + Math.sin(angle) * 180);
            ctx.stroke();
        }

        // Geometric V Emblem
        ctx.strokeStyle = 'rgba(235, 245, 240, 0.85)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(216, 170);
        ctx.lineTo(256, 230);
        ctx.lineTo(296, 170);
        ctx.stroke();

        // VEIL Wordmark
        ctx.font = 'bold 54px -apple-system, "Aquire", "Inter", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '10px';
        ctx.shadowColor = 'rgba(0, 71, 65, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillText('VEIL', 256, 280);

        // Security subline
        ctx.font = '600 16px -apple-system, "Inter", monospace';
        ctx.fillStyle = 'rgba(210, 240, 232, 0.85)';
        ctx.shadowBlur = 0;
        ctx.fillText('CORE SENTINEL', 256, 320);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function buildShieldAssemblies() {
        shieldGroup = new THREE.Group();
        crystalRootGroup.add(shieldGroup);

        // 1. Core Faceted Crystal (Deep Cyprus Green)
        const coreShape = createShieldShape(0.92);
        const coreGeo = new THREE.ExtrudeGeometry(coreShape, {
            depth: 0.28,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.12,
            bevelThickness: 0.14
        });
        coreGeo.center();

        const embossTexture = createVeilEmbossTexture();
        const coreMat = new THREE.MeshStandardMaterial({
            color: COLORS.cyprus,
            roughness: 0.18,
            metalness: 0.15,
            map: embossTexture,
            bumpMap: embossTexture,
            bumpScale: 0.05
        });

        coreMesh = new THREE.Mesh(coreGeo, coreMat);
        shieldGroup.add(coreMesh);

        // 2. Middle Transparent Glass Shield Contour
        const midShape = createShieldShape(1.04);
        const midGeo = new THREE.ExtrudeGeometry(midShape, {
            depth: 0.14,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.08,
            bevelThickness: 0.08
        });
        midGeo.center();

        const midMat = new THREE.MeshStandardMaterial({
            color: COLORS.cyprusMid,
            transparent: true,
            opacity: 0.32,
            roughness: 0.12,
            metalness: 0.05
        });

        innerGlassMesh = new THREE.Mesh(midGeo, midMat);
        innerGlassMesh.position.z = 0.02;
        shieldGroup.add(innerGlassMesh);

        // 3. Outer Translucent Glass Shell
        const outerShape = createShieldShape(1.18);
        const outerGeo = new THREE.ExtrudeGeometry(outerShape, {
            depth: 0.38,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.14,
            bevelThickness: 0.16
        });
        outerGeo.center();

        const outerMat = new THREE.MeshStandardMaterial({
            color: COLORS.glassOuter,
            transparent: true,
            opacity: 0.26,
            roughness: 0.15,
            metalness: 0.08
        });

        outerGlassMesh = new THREE.Mesh(outerGeo, outerMat);
        shieldGroup.add(outerGlassMesh);

        // 4. Crisp Facet Edges Contour
        const edgesGeo = new THREE.EdgesGeometry(outerGeo, 24);
        const edgesMat = new THREE.LineBasicMaterial({
            color: COLORS.emeraldGlow,
            transparent: true,
            opacity: 0.55
        });
        outerEdges = new THREE.LineSegments(edgesGeo, edgesMat);
        outerGlassMesh.add(outerEdges);
    }

    function buildPedestal() {
        pedestalGroup = new THREE.Group();
        pedestalGroup.position.set(0, -1.85, 0);
        crystalRootGroup.add(pedestalGroup);

        // Top frosted glass disc
        const topDiscGeo = new THREE.CylinderGeometry(1.65, 1.72, 0.14, 48);
        const topDiscMat = new THREE.MeshStandardMaterial({
            color: COLORS.pedestalGlass,
            transparent: true,
            opacity: 0.45,
            roughness: 0.2,
            metalness: 0.15
        });
        const topDisc = new THREE.Mesh(topDiscGeo, topDiscMat);
        pedestalGroup.add(topDisc);

        // Illuminated Cyprus ring on rim
        const glowRingGeo = new THREE.TorusGeometry(1.7, 0.02, 16, 64);
        glowRingGeo.rotateX(Math.PI / 2);
        const glowRingMat = new THREE.MeshBasicMaterial({
            color: COLORS.emeraldBright,
            transparent: true,
            opacity: 0.75
        });
        const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
        glowRing.position.y = 0.07;
        pedestalGroup.add(glowRing);

        // Lower stepped Sand pedestal platform
        const baseDiscGeo = new THREE.CylinderGeometry(2.15, 2.25, 0.12, 48);
        const baseDiscMat = new THREE.MeshStandardMaterial({
            color: COLORS.pedestalSand,
            roughness: 0.35,
            metalness: 0.05
        });
        const baseDisc = new THREE.Mesh(baseDiscGeo, baseDiscMat);
        baseDisc.position.y = -0.12;
        pedestalGroup.add(baseDisc);

        // Soft contact shadow plane beneath
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 256;
        shadowCanvas.height = 256;
        const sctx = shadowCanvas.getContext('2d');
        const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
        grad.addColorStop(0, 'rgba(0, 50, 45, 0.35)');
        grad.addColorStop(0.5, 'rgba(0, 50, 45, 0.12)');
        grad.addColorStop(1, 'rgba(240, 237, 230, 0)');
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, 256, 256);

        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        const shadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });
        const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.22;
        pedestalGroup.add(shadowPlane);
    }

    function buildOrbitalRings() {
        // Orbital Ring 1 (tilted forward-right)
        const ring1Geo = new THREE.TorusGeometry(2.25, 0.016, 16, 100);
        const ring1Mat = new THREE.MeshStandardMaterial({
            color: COLORS.cyprusMid,
            roughness: 0.25,
            metalness: 0.8
        });
        orbitalRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
        orbitalRing1.rotation.set(Math.PI * 0.34, 0.25, -0.2);
        crystalRootGroup.add(orbitalRing1);

        // Orbital Ring 2 (tilted opposing)
        const ring2Geo = new THREE.TorusGeometry(1.9, 0.012, 16, 100);
        const ring2Mat = new THREE.MeshStandardMaterial({
            color: COLORS.emeraldGlow,
            transparent: true,
            opacity: 0.75,
            roughness: 0.3,
            metalness: 0.7
        });
        orbitalRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
        orbitalRing2.rotation.set(-Math.PI * 0.3, 0.4, 0.35);
        crystalRootGroup.add(orbitalRing2);
    }

    function buildOrbitalNodes() {
        orbitalNodes = [];

        const nodeData = [
            { ring: 1, speed: 0.45, offset: 0.0, radius: 2.25, color: COLORS.emeraldBright, name: 'Active Bastion Sentinel', status: 'Online' },
            { ring: 1, speed: 0.45, offset: Math.PI, radius: 2.25, color: 0x228B22, name: 'Identity & MFA Broker', status: 'Secured' },
            { ring: 2, speed: -0.38, offset: 0.8, radius: 1.9, color: COLORS.emeraldBright, name: 'API Gateway Filter', status: 'Monitoring' },
            { ring: 2, speed: -0.38, offset: 0.8 + Math.PI, radius: 1.9, color: 0x1E7B6C, name: 'Cloud Storage Monitor', status: 'Secured' }
        ];

        nodeData.forEach((data, index) => {
            const nodeGroup = new THREE.Group();

            // Glowing visible sphere
            const sphereGeo = new THREE.SphereGeometry(0.12, 24, 24);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.6,
                roughness: 0.2,
                metalness: 0.3
            });
            const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
            nodeGroup.add(sphereMesh);

            // Subtle glow halo
            const haloGeo = new THREE.SphereGeometry(0.18, 16, 16);
            const haloMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.25
            });
            const haloMesh = new THREE.Mesh(haloGeo, haloMat);
            nodeGroup.add(haloMesh);

            // Invisible interaction hit target
            const hitGeo = new THREE.SphereGeometry(0.35, 12, 12);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitMesh = new THREE.Mesh(hitGeo, hitMat);
            hitMesh.userData = { isNode: true, nodeIndex: index, data: data };
            nodeGroup.add(hitMesh);

            crystalRootGroup.add(nodeGroup);

            orbitalNodes.push({
                group: nodeGroup,
                mesh: sphereMesh,
                halo: haloMesh,
                hitTarget: hitMesh,
                data: data,
                angle: data.offset
            });
        });
    }

    function setupEventListeners(container) {
        // Mouse tilt
        const stageWrapper = document.getElementById('crystal-stage-wrapper') || container;

        stageWrapper.addEventListener('mousemove', (e) => {
            const rect = stageWrapper.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const relY = (e.clientY - rect.top) / rect.height;

            targetTiltY = (relX - 0.5) * 0.45;
            targetTiltX = (relY - 0.5) * 0.35;

            // Raycasting coords
            const cRect = container.getBoundingClientRect();
            mouse2D.x = ((e.clientX - cRect.left) / cRect.width) * 2 - 1;
            mouse2D.y = -((e.clientY - cRect.top) / cRect.height) * 2 + 1;

            checkRaycastHover(e);
        });

        stageWrapper.addEventListener('mouseleave', () => {
            targetTiltX = 0;
            targetTiltY = 0;
            mouse2D.set(-999, -999);
            clearNodeHover();
        });

        stageWrapper.addEventListener('click', (e) => {
            handleRaycastClick(e);
        });

        // Window resize
        window.addEventListener('resize', handleResize);

        // Visibility lifecycle (saves CPU when user switches tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopLoop();
            } else {
                startLoop();
            }
        });
    }

    function checkRaycastHover(e) {
        if (!raycaster || !camera) return;

        raycaster.setFromCamera(mouse2D, camera);
        const hitTargets = orbitalNodes.map(n => n.hitTarget);
        const intersects = raycaster.intersectObjects(hitTargets, false);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const nodeData = hit.object.userData;
            const nodeObj = orbitalNodes[nodeData.nodeIndex];

            if (hoveredNode !== nodeObj) {
                clearNodeHover();
                hoveredNode = nodeObj;
                nodeObj.mesh.scale.set(1.4, 1.4, 1.4);
                nodeObj.mesh.material.emissiveIntensity = 1.0;
            }
            showTooltip(nodeData.data, e.clientX, e.clientY);
        } else {
            clearNodeHover();
        }
    }

    function clearNodeHover() {
        if (hoveredNode) {
            hoveredNode.mesh.scale.set(1.0, 1.0, 1.0);
            hoveredNode.mesh.material.emissiveIntensity = 0.6;
            hoveredNode = null;
        }
        hideTooltip();
    }

    function showTooltip(data, clientX, clientY) {
        let tooltip = document.getElementById('crystal-3d-tooltip');
        if (!tooltip) return;

        tooltip.innerHTML = `
            <div style="font-weight: 700; color: var(--cyprus-deep); font-size: 0.82rem;">${data.name}</div>
            <div class="mono" style="font-size: 0.72rem; color: var(--success); margin-top: 2px;">
                ● ${data.status} &bull; Oracle Verified
            </div>
        `;
        tooltip.style.display = 'block';
        tooltip.style.left = `${clientX + 14}px`;
        tooltip.style.top = `${clientY - 12}px`;
    }

    function hideTooltip() {
        const tooltip = document.getElementById('crystal-3d-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    function handleRaycastClick(e) {
        if (!raycaster || !camera) return;

        raycaster.setFromCamera(mouse2D, camera);
        const hitTargets = orbitalNodes.map(n => n.hitTarget);
        const intersects = raycaster.intersectObjects(hitTargets, false);

        if (intersects.length > 0) {
            // Clicked an orbital node -> trigger toast or register switch
            if (typeof window.showToast === 'function') {
                window.showToast(`Inspecting node: ${intersects[0].object.userData.data.name}`, 'info');
            }
            if (typeof window.switchView === 'function') {
                setTimeout(() => window.switchView('register'), 400);
            }
        } else {
            // Check if shield was clicked
            const shieldIntersects = raycaster.intersectObject(coreMesh, false);
            if (shieldIntersects.length > 0) {
                pulseShield();
            }
        }
    }

    function pulseShield() {
        if (!coreMesh) return;
        let scale = 1.0;
        const startTime = performance.now();

        function animatePulse(now) {
            const elapsed = (now - startTime) / 1000;
            if (elapsed < 0.35) {
                const progress = elapsed / 0.35;
                const factor = 1.0 + Math.sin(progress * Math.PI) * 0.06;
                shieldGroup.scale.set(factor, factor, factor);
                requestAnimationFrame(animatePulse);
            } else {
                shieldGroup.scale.set(1.0, 1.0, 1.0);
            }
        }
        requestAnimationFrame(animatePulse);

        if (typeof window.showToast === 'function') {
            window.showToast('VEIL Crystal Core: Oracle Security Sentinel Active', 'success');
        }
    }

    function handleResize() {
        const container = document.getElementById('crystal-canvas-container');
        if (!container || !renderer || !camera) return;

        const width = container.clientWidth || 520;
        const height = container.clientHeight || 440;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function startLoop() {
        if (isRunning) return;
        isRunning = true;
        baseTime = performance.now() * 0.001;
        animFrameId = requestAnimationFrame(renderFrame);
    }

    function stopLoop() {
        isRunning = false;
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
    }

    function renderFrame(now) {
        if (!isRunning) return;

        const time = now * 0.001;
        const delta = time - baseTime;
        baseTime = time;

        // Smooth cursor tilt damping (lerp)
        const lerpFactor = prefersReducedMotion ? 0.03 : 0.06;
        currentTiltX += (targetTiltX - currentTiltX) * lerpFactor;
        currentTiltY += (targetTiltY - currentTiltY) * lerpFactor;

        // Idle floating (bobbing vertically)
        const floatY = prefersReducedMotion ? 0 : Math.sin(time * 1.3) * 0.06;
        const floatRotZ = prefersReducedMotion ? 0 : Math.sin(time * 0.8) * 0.02;

        if (shieldGroup) {
            shieldGroup.position.y = floatY;
            shieldGroup.rotation.x = currentTiltX;
            shieldGroup.rotation.y = currentTiltY + (prefersReducedMotion ? 0 : Math.sin(time * 0.5) * 0.05);
            shieldGroup.rotation.z = floatRotZ;
        }

        // Orbital rings slow rotation
        if (!prefersReducedMotion) {
            if (orbitalRing1) orbitalRing1.rotation.z += 0.003;
            if (orbitalRing2) orbitalRing2.rotation.z -= 0.0025;
        }

        // Animate orbital nodes along their 3D ring planes
        orbitalNodes.forEach(node => {
            if (!prefersReducedMotion) {
                node.angle += node.data.speed * delta;
            }

            const r = node.data.radius;
            const x = Math.cos(node.angle) * r;
            const y = Math.sin(node.angle) * r;

            if (node.data.ring === 1) {
                // Tilted to match ring 1 orientation
                node.group.position.set(x * 0.92, y * 0.38 + floatY * 0.5, y * 0.85);
            } else {
                // Tilted to match ring 2 orientation
                node.group.position.set(x * 0.88, y * 0.52 + floatY * 0.5, -y * 0.78);
            }
        });

        renderer.render(scene, camera);
        animFrameId = requestAnimationFrame(renderFrame);
    }

    // Fallback renderer when WebGL is unavailable
    function initFallbackStage(container) {
        container.innerHTML = `
            <div class="crystal-fallback-art" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <svg width="260" height="320" viewBox="0 0 260 320" fill="none" class="crystal-fallback-svg">
                    <defs>
                        <radialGradient id="fallbackGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#00A887" stop-opacity="0.35"/>
                            <stop offset="100%" stop-color="#004741" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <ellipse cx="130" cy="270" rx="90" ry="24" fill="rgba(0, 71, 65, 0.15)" />
                    <ellipse cx="130" cy="265" rx="75" ry="16" fill="#E8E3DA" stroke="#004741" stroke-width="2"/>
                    <path d="M130 35 L220 55 L226 145 C210 215 130 255 130 255 C130 255 50 215 34 145 L40 55 Z" 
                          fill="url(#fallbackGlow)" stroke="#52B79A" stroke-width="2"/>
                    <path d="M130 50 L205 68 L210 140 C195 200 130 238 130 238 C130 238 65 200 50 140 L55 68 Z" 
                          fill="#004741" stroke="#00A887" stroke-width="3"/>
                    <text x="130" y="150" font-family="'Aquire', 'Inter', sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">VEIL</text>
                    <text x="130" y="175" font-family="'Inter', monospace" font-size="9" font-weight="600" fill="#D2F0E8" text-anchor="middle" letter-spacing="2">CORE SENTINEL</text>
                </svg>
            </div>
        `;
    }

    // Public exposure for capability card actions
    window.highlightModule = function (moduleKey) {
        if (moduleKey === 'telemetry') {
            const feed = document.getElementById('recent-incidents-feed');
            if (feed) {
                feed.scrollIntoView({ behavior: 'smooth', block: 'center' });
                feed.style.outline = '2px solid var(--cyprus)';
                feed.style.borderRadius = 'var(--radius-medium)';
                feed.style.transition = 'outline 0.3s ease';
                setTimeout(() => { feed.style.outline = 'none'; }, 2000);
            }
        } else if (moduleKey === 'severity') {
            const bars = document.getElementById('severity-bars-container');
            if (bars) {
                bars.scrollIntoView({ behavior: 'smooth', block: 'center' });
                bars.style.outline = '2px solid var(--cyprus)';
                bars.style.borderRadius = 'var(--radius-medium)';
                bars.style.transition = 'outline 0.3s ease';
                setTimeout(() => { bars.style.outline = 'none'; }, 2000);
            }
        }
    };

    // Auto-init on DOM readiness
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCrystalCore);
    } else {
        initCrystalCore();
    }
})();
