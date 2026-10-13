/**
 * VEIL — Interactive 3D Crystal Core Component
 * Implements the multi-layered faceted emerald crystal shield, illuminated stepped
 * pedestal base, orbital rings, cursor-responsive tilt, and live telemetry nodes.
 *
 * Built with Three.js (local assets/js/three.min.js).
 * Strictly compliant with Cyprus (#004741) & Sand (#F0EDE6) light mode aesthetic.
 */

'use strict';

(function () {
    let scene, camera, renderer;
    let crystalRootGroup, shieldGroup, pedestalGroup;
    let coreMesh, innerGlassMesh, outerGlassMesh, outerEdges, insigniaBadgeMesh;
    let orbitalRing1, orbitalRing2;
    let orbitalNodes = [];
    let raycaster, mouse2D;
    let animFrameId = null;
    let isRunning = false;

    // Motion & interaction state
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let baseTime = 0;
    let hoveredNode = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Palette tokens aligned with VEIL brand specification
    const COLORS = {
        cyprusDeep: 0x002B26,
        cyprus: 0x004741,
        cyprusMid: 0x0A5C52,
        emeraldBright: 0x00E5B8,
        emeraldGlow: 0x5CE7C8,
        glassOuter: 0xDDF5EE,
        pedestalDark: 0x00332D,
        pedestalSand: 0xE2DDD3,
        pedestalSandLight: 0xEAE5DC,
        goldTrim: 0xD4AF37
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

        const width = container.clientWidth || 540;
        const height = container.clientHeight || 440;

        // 1. Scene
        scene = new THREE.Scene();

        // 2. Camera: carefully angled to frame both the crystal shield & the illuminated pedestal base
        camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
        camera.position.set(0, 0.10, 5.5);
        camera.lookAt(0, 0.05, 0);

        // 3. Renderer with transparent background and high dynamic range tone mapping
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // 4. Lighting setup
        setupLighting();

        // 5. Build 3D Hierarchy
        crystalRootGroup = new THREE.Group();
        crystalRootGroup.position.set(0, 0, 0);
        scene.add(crystalRootGroup);

        buildShieldAssemblies();
        buildPedestal();
        buildOrbitalRings();
        buildOrbitalNodes();

        // 6. Raycasting & Event Listeners
        raycaster = new THREE.Raycaster();
        mouse2D = new THREE.Vector2(-999, -999);

        setupEventListeners(container);

        // 7. Start Animation Loop
        startLoop();
    }

    function setupLighting() {
        // Balanced ambient light tuned to warm Sand environment
        const ambientLight = new THREE.AmbientLight(0xFFFAF2, 0.45);
        scene.add(ambientLight);

        // Main key light from upper-right front (creates sharp specular facet highlights)
        const keyLight = new THREE.DirectionalLight(0xE6FFF6, 1.35);
        keyLight.position.set(3.2, 4.0, 4.0);
        scene.add(keyLight);

        // Rim light from rear-left to give crisp cyan edge contouring
        const rimLight = new THREE.DirectionalLight(0x50E0C8, 0.95);
        rimLight.position.set(-3.5, 2.5, -2.5);
        scene.add(rimLight);

        // Internal emerald point light positioned slightly behind core to glow from within
        const corePointLight = new THREE.PointLight(0x00E5B8, 1.2, 5.0);
        corePointLight.position.set(0, 0.25, -0.1);
        scene.add(corePointLight);

        // Soft bounce light from the sand floor/pedestal below
        const bounceLight = new THREE.DirectionalLight(0xF0EDE6, 0.35);
        bounceLight.position.set(0, -3.0, 2.0);
        scene.add(bounceLight);
    }

    function createShieldShape(scale = 1.0) {
        const shape = new THREE.Shape();
        const s = scale;

        // Authentic shield crest silhouette with top bevel, shoulders, and tapered point
        shape.moveTo(0, 1.48 * s);
        shape.lineTo(0.95 * s, 1.30 * s);
        shape.lineTo(1.08 * s, 0.45 * s);
        shape.quadraticCurveTo(0.92 * s, -0.65 * s, 0, -1.55 * s);
        shape.quadraticCurveTo(-0.92 * s, -0.65 * s, -1.08 * s, 0.45 * s);
        shape.lineTo(-0.95 * s, 1.30 * s);
        shape.closePath();
        return shape;
    }

    function createInsigniaTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 512, 512);

        // Technical Reticle Circle
        ctx.strokeStyle = 'rgba(230, 255, 248, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(256, 256, 175, 0, Math.PI * 2);
        ctx.stroke();

        // Corner framing brackets [ ]
        ctx.strokeStyle = 'rgba(92, 231, 200, 0.9)';
        ctx.lineWidth = 4;
        const bSize = 35;
        const bRad = 150;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(256 - bRad, 256 - bRad + bSize);
        ctx.lineTo(256 - bRad, 256 - bRad);
        ctx.lineTo(256 - bRad + bSize, 256 - bRad);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(256 + bRad - bSize, 256 - bRad);
        ctx.lineTo(256 + bRad, 256 - bRad);
        ctx.lineTo(256 + bRad, 256 - bRad + bSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(256 - bRad, 256 + bRad - bSize);
        ctx.lineTo(256 - bRad, 256 + bRad);
        ctx.lineTo(256 - bRad + bSize, 256 + bRad);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(256 + bRad - bSize, 256 + bRad);
        ctx.lineTo(256 + bRad, 256 + bRad);
        ctx.lineTo(256 + bRad, 256 + bRad - bSize);
        ctx.stroke();

        // Geometric V Icon
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(226, 175);
        ctx.lineTo(256, 222);
        ctx.lineTo(286, 175);
        ctx.stroke();

        // Crisp VEIL Wordmark
        ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 45, 38, 0.95)';
        ctx.shadowBlur = 14;
        ctx.fillText('VEIL', 256, 275);

        // Subtitle security indicator
        ctx.font = '600 15px -apple-system, monospace';
        ctx.fillStyle = '#A5F2DE';
        ctx.shadowBlur = 0;
        ctx.fillText('CORE INTELLIGENCE', 256, 318);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function buildShieldAssemblies() {
        shieldGroup = new THREE.Group();
        shieldGroup.position.set(0, 0.30, 0);
        crystalRootGroup.add(shieldGroup);

        // 1. Core Gemstone Crystal (Deep Cyprus Green with sharp flat-shaded facets)
        const coreShape = createShieldShape(0.90);
        const coreGeo = new THREE.ExtrudeGeometry(coreShape, {
            depth: 0.30,
            bevelEnabled: true,
            bevelSegments: 1, // Single segment produces crisp, diamond-cut crystal facets!
            steps: 1,
            bevelSize: 0.16,
            bevelThickness: 0.16
        });
        coreGeo.center();

        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x004741,
            emissive: 0x001A16,
            roughness: 0.12,
            metalness: 0.35,
            flatShading: true // Essential for cut-gemstone facet specular glints
        });

        coreMesh = new THREE.Mesh(coreGeo, coreMat);
        shieldGroup.add(coreMesh);

        // 2. High-Contrast Floating Front Insignia Emblem Badge
        const badgeTexture = createInsigniaTexture();
        const badgeGeo = new THREE.PlaneGeometry(1.35, 1.35);
        const badgeMat = new THREE.MeshBasicMaterial({
            map: badgeTexture,
            transparent: true,
            opacity: 0.98,
            depthWrite: false
        });
        insigniaBadgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        insigniaBadgeMesh.position.set(0, 0, 0.34);
        shieldGroup.add(insigniaBadgeMesh);

        // 3. Middle Emerald Glass Membrane Layer
        const midShape = createShieldShape(1.05);
        const midGeo = new THREE.ExtrudeGeometry(midShape, {
            depth: 0.22,
            bevelEnabled: true,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 0.10,
            bevelThickness: 0.10
        });
        midGeo.center();

        const midMat = new THREE.MeshStandardMaterial({
            color: 0x0A5C52,
            transparent: true,
            opacity: 0.18,
            roughness: 0.08,
            metalness: 0.15,
            depthWrite: false
        });

        innerGlassMesh = new THREE.Mesh(midGeo, midMat);
        innerGlassMesh.position.z = 0.02;
        shieldGroup.add(innerGlassMesh);

        // 4. Outer Translucent Crystal Glass Exoskeleton
        const outerShape = createShieldShape(1.20);
        const outerGeo = new THREE.ExtrudeGeometry(outerShape, {
            depth: 0.40,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.16,
            bevelThickness: 0.18
        });
        outerGeo.center();

        const outerMat = new THREE.MeshStandardMaterial({
            color: 0xE6F8F4,
            transparent: true,
            opacity: 0.22, // Crystal clear clarity so inner dark emerald core pops through with high contrast
            roughness: 0.05,
            metalness: 0.15,
            depthWrite: false
        });

        outerGlassMesh = new THREE.Mesh(outerGeo, outerMat);
        shieldGroup.add(outerGlassMesh);

        // 5. Crisp Glowing Mint Facet Edge Contours
        const edgesGeo = new THREE.EdgesGeometry(outerGeo, 24);
        const edgesMat = new THREE.LineBasicMaterial({
            color: COLORS.emeraldBright,
            transparent: true,
            opacity: 0.85
        });
        outerEdges = new THREE.LineSegments(edgesGeo, edgesMat);
        shieldGroup.add(outerEdges);
    }

    function buildPedestal() {
        pedestalGroup = new THREE.Group();
        // Positioned so the tiered structure and illuminated glowing rims are fully visible in the canvas
        pedestalGroup.position.set(0, -1.25, 0);
        crystalRootGroup.add(pedestalGroup);

        // Tier 1 (Top Glass / Cyprus Plinth)
        const topDiscGeo = new THREE.CylinderGeometry(1.45, 1.52, 0.08, 64);
        const topDiscMat = new THREE.MeshStandardMaterial({
            color: COLORS.pedestalDark,
            roughness: 0.15,
            metalness: 0.20
        });
        const topDisc = new THREE.Mesh(topDiscGeo, topDiscMat);
        topDisc.position.y = 0.04;
        pedestalGroup.add(topDisc);

        // Glowing Neon Cyan Rim on Tier 1
        const glowRing1Geo = new THREE.TorusGeometry(1.48, 0.022, 16, 64);
        glowRing1Geo.rotateX(Math.PI / 2);
        const glowRing1Mat = new THREE.MeshBasicMaterial({
            color: COLORS.emeraldBright
        });
        const glowRing1 = new THREE.Mesh(glowRing1Geo, glowRing1Mat);
        glowRing1.position.y = 0.08;
        pedestalGroup.add(glowRing1);

        // Tier 2 (Middle Stepped Sand Metallic Plinth)
        const midDiscGeo = new THREE.CylinderGeometry(1.85, 1.95, 0.10, 64);
        const midDiscMat = new THREE.MeshStandardMaterial({
            color: COLORS.pedestalSand,
            roughness: 0.30,
            metalness: 0.12
        });
        const midDisc = new THREE.Mesh(midDiscGeo, midDiscMat);
        midDisc.position.y = -0.05;
        pedestalGroup.add(midDisc);

        // Glowing Mint Rim on Tier 2
        const glowRing2Geo = new THREE.TorusGeometry(1.88, 0.016, 16, 64);
        glowRing2Geo.rotateX(Math.PI / 2);
        const glowRing2Mat = new THREE.MeshBasicMaterial({
            color: COLORS.emeraldGlow,
            transparent: true,
            opacity: 0.85
        });
        const glowRing2 = new THREE.Mesh(glowRing2Geo, glowRing2Mat);
        glowRing2.position.y = 0.0;
        pedestalGroup.add(glowRing2);

        // Tier 3 (Base Foundation Disc)
        const baseDiscGeo = new THREE.CylinderGeometry(2.25, 2.35, 0.08, 64);
        const baseDiscMat = new THREE.MeshStandardMaterial({
            color: COLORS.pedestalSandLight,
            roughness: 0.40,
            metalness: 0.05
        });
        const baseDisc = new THREE.Mesh(baseDiscGeo, baseDiscMat);
        baseDisc.position.y = -0.14;
        pedestalGroup.add(baseDisc);

        // Soft Radial Contact Shadow Ground Plane
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 256;
        shadowCanvas.height = 256;
        const sctx = shadowCanvas.getContext('2d');
        const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
        grad.addColorStop(0, 'rgba(0, 50, 45, 0.40)');
        grad.addColorStop(0.45, 'rgba(0, 50, 45, 0.15)');
        grad.addColorStop(1, 'rgba(240, 237, 230, 0)');
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, 256, 256);

        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        const shadowGeo = new THREE.PlaneGeometry(5.4, 5.4);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });
        const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.19;
        pedestalGroup.add(shadowPlane);
    }

    function buildOrbitalRings() {
        // Orbital Ring 1 (sweeping forward-diagonal in metallic Cyprus)
        const ring1Geo = new THREE.TorusGeometry(2.15, 0.016, 16, 100);
        const ring1Mat = new THREE.MeshStandardMaterial({
            color: COLORS.cyprusMid,
            roughness: 0.25,
            metalness: 0.80
        });
        orbitalRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
        orbitalRing1.position.y = 0.30;
        orbitalRing1.rotation.set(Math.PI * 0.36, 0.22, -0.18);
        crystalRootGroup.add(orbitalRing1);

        // Orbital Ring 2 (counter-tilted in glowing cyan)
        const ring2Geo = new THREE.TorusGeometry(1.80, 0.012, 16, 100);
        const ring2Mat = new THREE.MeshStandardMaterial({
            color: COLORS.emeraldGlow,
            transparent: true,
            opacity: 0.75,
            roughness: 0.30,
            metalness: 0.70
        });
        orbitalRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
        orbitalRing2.position.y = 0.30;
        orbitalRing2.rotation.set(-Math.PI * 0.32, 0.38, 0.30);
        crystalRootGroup.add(orbitalRing2);
    }

    function buildOrbitalNodes() {
        orbitalNodes = [];

        const nodeData = [
            { ring: 1, speed: 0.45, offset: 0.0, radius: 2.15, color: COLORS.emeraldBright, name: 'Active Bastion Sentinel', status: 'Online' },
            { ring: 1, speed: 0.45, offset: Math.PI, radius: 2.15, color: 0x228B22, name: 'Identity & MFA Broker', status: 'Secured' },
            { ring: 2, speed: -0.38, offset: 0.8, radius: 1.80, color: COLORS.emeraldBright, name: 'API Gateway Filter', status: 'Monitoring' },
            { ring: 2, speed: -0.38, offset: 0.8 + Math.PI, radius: 1.80, color: 0x1E7B6C, name: 'Cloud Storage Sentinel', status: 'Secured' }
        ];

        nodeData.forEach((data, index) => {
            const nodeGroup = new THREE.Group();

            // Glowing visible sphere
            const sphereGeo = new THREE.SphereGeometry(0.12, 24, 24);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.65,
                roughness: 0.20,
                metalness: 0.30
            });
            const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
            nodeGroup.add(sphereMesh);

            // Subtle glow halo
            const haloGeo = new THREE.SphereGeometry(0.18, 16, 16);
            const haloMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.28
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
        const stageWrapper = document.getElementById('crystal-stage-wrapper') || container;

        stageWrapper.addEventListener('mousemove', (e) => {
            const rect = stageWrapper.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const relY = (e.clientY - rect.top) / rect.height;

            targetTiltY = (relX - 0.5) * 0.42;
            targetTiltX = (relY - 0.5) * 0.32;

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

        window.addEventListener('resize', handleResize);

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
            hoveredNode.mesh.material.emissiveIntensity = 0.65;
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
            if (typeof window.showToast === 'function') {
                window.showToast(`Inspecting node: ${intersects[0].object.userData.data.name}`, 'info');
            }
            if (typeof window.switchView === 'function') {
                setTimeout(() => window.switchView('register'), 400);
            }
        } else {
            // Check if crystal shield was clicked
            const shieldIntersects = raycaster.intersectObject(coreMesh, false);
            if (shieldIntersects.length > 0) {
                pulseShield();
            }
        }
    }

    function pulseShield() {
        if (!coreMesh) return;
        const startTime = performance.now();

        function animatePulse(now) {
            const elapsed = (now - startTime) / 1000;
            if (elapsed < 0.35) {
                const progress = elapsed / 0.35;
                const factor = 1.0 + Math.sin(progress * Math.PI) * 0.05;
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

        const width = container.clientWidth || 540;
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
        const floatY = prefersReducedMotion ? 0 : Math.sin(time * 1.3) * 0.05;
        const floatRotZ = prefersReducedMotion ? 0 : Math.sin(time * 0.8) * 0.015;

        if (shieldGroup) {
            shieldGroup.position.y = 0.30 + floatY;
            shieldGroup.rotation.x = currentTiltX;
            shieldGroup.rotation.y = currentTiltY + (prefersReducedMotion ? 0 : Math.sin(time * 0.5) * 0.04);
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
                node.group.position.set(x * 0.92, 0.30 + y * 0.38 + floatY * 0.5, y * 0.85);
            } else {
                // Tilted to match ring 2 orientation
                node.group.position.set(x * 0.88, 0.30 + y * 0.52 + floatY * 0.5, -y * 0.78);
            }
        });

        renderer.render(scene, camera);
        animFrameId = requestAnimationFrame(renderFrame);
    }

    // High quality vector fallback when WebGL is unavailable
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCrystalCore);
    } else {
        initCrystalCore();
    }
})();
