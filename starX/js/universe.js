/**
 * 3D Universe Engine with Natural Deep Space, Infinite Space Scrolling,
 * Atmospheric Stardust, Andromeda Spiral Galaxy, Accretion Vortex, and Floating Astronaut.
 */

class Universe {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Visual celestial objects
    this.starPoints = null;
    this.universeStars = [];
    this.dustPoints = null;
    this.dustPositions = null;
    this.galaxyGroup = null;
    this.vortexGroup = null;
    this.planetGroup = null;
    this.astronaut = null;
    this.comet = null;
    this.shootingStars = [];
    this.constellationGroup = null;

    // Infinite space scrolling & camera flight dynamics
    this.isAutoRotating = true;
    this.showGalaxy = true;
    this.baseRotationSpeed = 0.0003;
    this.clock = new THREE.Clock();

    // Smooth Infinite Scrolling Flight variables
    this.flightSpeed = 0;
    this.cruiseSpeed = 0.45; // Gentle natural forward drift
    this.isInfiniteWarp = true;
    this.scrollVelocity = 0;
    this.spaceDepth = 4000;

    // Infinite Space Voyage telemetry & steering
    this.voyageDistance = 4820;
    this.steerX = 0;
    this.steerY = 0;
    this.keys = {};
    this.currentMode = 'voyage'; // 'voyage' vs 'studio'

    this.onStarHover = null;
    this.onStarClick = null;
    this.hoveredObject = null;
    this.selectedStar = null;

    this.init();
  }

  init() {
    // 1. Natural Deep-Space Atmosphere & Volumetric Fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x01030d, 0.00022); // Deep rich velvet space void

    // 2. Realistic Celestial Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2640, 1.2);
    this.scene.add(ambientLight);

    const solarLight = new THREE.DirectionalLight(0xfff7e8, 2.2);
    solarLight.position.set(700, 500, 600);
    this.scene.add(solarLight);

    const cosmicFill = new THREE.DirectionalLight(0x35508a, 1.0);
    cosmicFill.position.set(-600, -300, -400);
    this.scene.add(cosmicFill);

    // 3. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 1, 10000);
    this.camera.position.set(0, 0, 850);

    // 4. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 5. Controls with Fallback
    if (typeof THREE.OrbitControls === 'function') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.rotateSpeed = 0.65;
      this.controls.zoomSpeed = 1.0;
      this.controls.minDistance = 100;
      this.controls.maxDistance = 3500;
      this.controls.enablePan = true;
    } else {
      this.setupFallbackControls();
    }

    // 6. Constellation Group
    this.constellationGroup = new THREE.Group();
    this.scene.add(this.constellationGroup);

    // 7. Build Natural Living Cosmos (NO Asteroid clutter)
    this.createNaturalStarfield();
    this.createSpaceAtmosphere();
    this.createAndromedaGalaxy();
    this.createCosmicAccretionVortex();
    this.create3DPlanets();
    this.createFloatingAstronaut();
    this.createComet();
    this.createNebulae();
    this.setupShootingStars();

    // 8. Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('click', (e) => this.onPointerClick(e));
    window.addEventListener('wheel', (e) => this.onWindowScroll(e), { passive: true });

    // Interactive Keyboard Flight Steering (WASD & Arrow Keys)
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // 9. Start render loop
    this.animate();
  }

  createStarGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.12, 'rgba(235, 245, 255, 0.9)');
    grad.addColorStop(0.35, 'rgba(120, 200, 255, 0.45)');
    grad.addColorStop(0.7, 'rgba(60, 120, 255, 0.1)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Authentic 4-Point Telescope Optical Diffraction Spikes (Hubble / JWST style)
   */
  createDiffractionSpikeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const cx = 128, cy = 128;

    // 1. Brilliant glowing stellar nucleus
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 48);
    coreGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    coreGrad.addColorStop(0.15, 'rgba(240, 250, 255, 0.95)');
    coreGrad.addColorStop(0.4, 'rgba(140, 210, 255, 0.45)');
    coreGrad.addColorStop(0.75, 'rgba(70, 140, 255, 0.12)');
    coreGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fill();

    // 2. Horizontal and Vertical Razor Cross Diffraction Spikes
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const spikeLen = 124;

    // Horizontal ray
    const hGrad = ctx.createLinearGradient(cx - spikeLen, cy, cx + spikeLen, cy);
    hGrad.addColorStop(0.0, 'rgba(160, 225, 255, 0.0)');
    hGrad.addColorStop(0.35, 'rgba(210, 240, 255, 0.4)');
    hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    hGrad.addColorStop(0.65, 'rgba(210, 240, 255, 0.4)');
    hGrad.addColorStop(1.0, 'rgba(160, 225, 255, 0.0)');
    ctx.fillStyle = hGrad;
    ctx.fillRect(cx - spikeLen, cy - 1.5, spikeLen * 2, 3);

    // Vertical ray
    const vGrad = ctx.createLinearGradient(cx, cy - spikeLen, cx, cy + spikeLen);
    vGrad.addColorStop(0.0, 'rgba(160, 225, 255, 0.0)');
    vGrad.addColorStop(0.35, 'rgba(210, 240, 255, 0.4)');
    vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    vGrad.addColorStop(0.65, 'rgba(210, 240, 255, 0.4)');
    vGrad.addColorStop(1.0, 'rgba(160, 225, 255, 0.0)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(cx - 1.5, cy - spikeLen, 3, spikeLen * 2);

    // 3. Faint 45-degree diagonal secondary rays
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    const dGrad = ctx.createLinearGradient(-42, 0, 42, 0);
    dGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
    dGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    dGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = dGrad;
    ctx.fillRect(-42, -0.8, 84, 1.6);
    ctx.fillRect(-0.8, -42, 1.6, 84);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Organic Multi-Scale Procedural Gaseous Nebula Puff Texture (Astrophotography Look)
   */
  createOrganicNebulaTexture(seed = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256, cy = 256;

    // Organic fractal gaseous cloud synthesis
    const puffCount = 20;
    for (let p = 0; p < puffCount; p++) {
      const angle = (p / puffCount) * Math.PI * 2 + Math.sin(p * 3.7 + seed) * 0.9;
      const dist = Math.pow(Math.sin(p * 2.1 + seed) * 0.5 + 0.5, 1.3) * 155;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const radius = 95 + Math.sin(p * 2.7 + seed) * 50;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.42)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.22)');
      grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  createNebulaTexture() {
    return this.createOrganicNebulaTexture(1);
  }

  /**
   * 1. Multi-Tier Natural Starfield with Continuous Depth Wrapping
   */
  createNaturalStarfield() {
    const starCount = 18000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const stellarColors = [
      new THREE.Color(0xaed8f2), // O/B: Blue Giant
      new THREE.Color(0xffffff), // A: Pure White
      new THREE.Color(0xf6f5e8), // F: Warm White
      new THREE.Color(0xffe6a3), // G: Solar Yellow
      new THREE.Color(0xffbb78), // K: Orange
      new THREE.Color(0xff7b6b)  // M: Red Dwarf
    ];

    this.universeStars = [];

    for (let i = 0; i < starCount; i++) {
      // Natural cylindrical-spherical volume for infinite forward streaming
      const radius = 250 + Math.random() * 2600;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * this.spaceDepth;

      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * (radius * 0.85);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const colorPick = stellarColors[Math.floor(Math.random() * stellarColors.length)];
      const brightness = 0.45 + Math.random() * 0.55;

      colors[i * 3] = colorPick.r * brightness;
      colors[i * 3 + 1] = colorPick.g * brightness;
      colors[i * 3 + 2] = colorPick.b * brightness;

      const r = Math.random();
      if (r > 0.99) sizes[i] = 11.0 + Math.random() * 8.0;     // Brilliant primary beacons
      else if (r > 0.92) sizes[i] = 5.5 + Math.random() * 3.5;  // Medium stars
      else sizes[i] = 1.8 + Math.random() * 2.2;               // Fine celestial dust stars

      this.universeStars.push({
        id: i,
        pos: new THREE.Vector3(x, y, z),
        color: colorPick,
        size: sizes[i]
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 4.2,
      vertexColors: true,
      map: this.createStarGlowTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.starPoints = new THREE.Points(geometry, starMaterial);
    this.scene.add(this.starPoints);

    // 1b. Optical 4-Point Cross Diffraction Spikes for Primary Beacon Stars (Hubble/JWST Telescope Aesthetics)
    const beaconPositions = [];
    const beaconColors = [];
    for (let i = 0; i < starCount; i++) {
      if (sizes[i] >= 11.0) {
        beaconPositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        beaconColors.push(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
      }
    }

    const spikeGeom = new THREE.BufferGeometry();
    spikeGeom.setAttribute('position', new THREE.Float32BufferAttribute(beaconPositions, 3));
    spikeGeom.setAttribute('color', new THREE.Float32BufferAttribute(beaconColors, 3));

    const spikeMat = new THREE.PointsMaterial({
      size: 38,
      vertexColors: true,
      map: this.createDiffractionSpikeTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.beaconSpikePoints = new THREE.Points(spikeGeom, spikeMat);
    this.scene.add(this.beaconSpikePoints);
  }

  /**
   * 2. Natural Space Atmosphere & Ambient Floating Stardust
   */
  createSpaceAtmosphere() {
    const dustCount = 4500;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    const col = new Float32Array(dustCount * 3);

    const atmosphereTones = [
      new THREE.Color(0x38bdf8), // Cyan stardust
      new THREE.Color(0x818cf8), // Soft periwinkle
      new THREE.Color(0xc084fc), // Gaseous violet
      new THREE.Color(0xfcd34d)  // Golden starlight refraction
    ];

    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2800;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * this.spaceDepth;

      const tone = atmosphereTones[Math.floor(Math.random() * atmosphereTones.length)];
      col[i * 3] = tone.r * 0.7;
      col[i * 3 + 1] = tone.g * 0.7;
      col[i * 3 + 2] = tone.b * 0.7;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      map: this.createStarGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.dustPoints = new THREE.Points(geom, mat);
    this.dustPositions = pos;
    this.scene.add(this.dustPoints);
  }

  /**
   * 3. Andromeda-Style Spiral Galaxy (Natural Astrophotography Look)
   */
  createAndromedaGalaxy() {
    this.galaxyGroup = new THREE.Group();
    const particleCount = 32000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const arms = 2;
    const maxRadius = 1800;
    const coreRadius = 320;

    const coreColor = new THREE.Color(0xfffaea);   // Radiant golden nucleus
    const innerColor = new THREE.Color(0xfdd586);  // Warm amber bulge
    const dustLaneColor = new THREE.Color(0x2d1b14);// Natural interstellar dust
    const armColor = new THREE.Color(0x76b4ef);    // Azure stellar arms
    const outerHalo = new THREE.Color(0x9d72d6);   // Violet halo

    for (let i = 0; i < particleCount; i++) {
      let x, y, z, r, angle;

      if (i < particleCount * 0.32) {
        r = Math.pow(Math.random(), 2.2) * coreRadius;
        angle = Math.random() * Math.PI * 2;
        x = Math.cos(angle) * r * 1.35;
        z = Math.sin(angle) * r * 0.75;
        y = (coreRadius - r) * 0.45 * (Math.random() - 0.5);

        const colorT = r / coreRadius;
        const pColor = coreColor.clone().lerp(innerColor, colorT);

        colors[i * 3] = pColor.r;
        colors[i * 3 + 1] = pColor.g;
        colors[i * 3 + 2] = pColor.b;
        sizes[i] = 4.0 + Math.random() * 4.5;
      } else {
        const armIndex = i % arms;
        const armOffset = (armIndex * Math.PI);
        const distFactor = Math.pow(Math.random(), 0.75);
        r = coreRadius + distFactor * (maxRadius - coreRadius);

        const spiralTightness = 1.9;
        angle = armOffset + Math.log(r / coreRadius + 0.1) * spiralTightness;

        const isDustLane = Math.random() < 0.16;
        const scatter = (Math.random() - 0.5) * (r * 0.2);
        const scatterAngle = Math.random() * Math.PI * 2;

        x = Math.cos(angle) * r * 1.25 + Math.cos(scatterAngle) * scatter;
        z = Math.sin(angle) * r * 0.75 + Math.sin(scatterAngle) * scatter;
        y = (Math.random() - 0.5) * Math.max(12, (maxRadius - r) * 0.07);

        let pColor;
        if (isDustLane) {
          pColor = dustLaneColor;
          sizes[i] = 1.5;
        } else {
          const t = (r - coreRadius) / (maxRadius - coreRadius);
          pColor = t < 0.5 ? innerColor.clone().lerp(armColor, t / 0.5) : armColor.clone().lerp(outerHalo, (t - 0.5) / 0.5);
          sizes[i] = 2.5 + Math.random() * 3.5;
        }

        colors[i * 3] = pColor.r;
        colors[i * 3 + 1] = pColor.g;
        colors[i * 3 + 2] = pColor.b;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const galaxyMat = new THREE.PointsMaterial({
      size: 4.2,
      vertexColors: true,
      map: this.createStarGlowTexture(),
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const mainDisk = new THREE.Points(geometry, galaxyMat);
    this.galaxyGroup.add(mainDisk);

    // Companion Dwarf Galaxies (M32 & M110)
    const dwarfM32 = this.createDwarfGalaxy(2200, 0xffe6a3, 60, new THREE.Vector3(380, 80, -280));
    const dwarfM110 = this.createDwarfGalaxy(1800, 0xaed8f2, 90, new THREE.Vector3(-450, -120, 320));
    this.galaxyGroup.add(dwarfM32);
    this.galaxyGroup.add(dwarfM110);

    this.galaxyGroup.rotation.x = THREE.MathUtils.degToRad(35);
    this.galaxyGroup.rotation.z = THREE.MathUtils.degToRad(22);
    this.galaxyGroup.position.set(0, -160, -320);

    this.scene.add(this.galaxyGroup);
  }

  createDwarfGalaxy(starCount, colorHex, radius, position) {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const baseColor = new THREE.Color(colorHex);

    for (let i = 0; i < starCount; i++) {
      const r = Math.pow(Math.random(), 2.0) * radius;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(ph);

      col[i * 3] = baseColor.r;
      col[i * 3 + 1] = baseColor.g;
      col[i * 3 + 2] = baseColor.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      map: this.createStarGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    const dwarf = new THREE.Points(geom, mat);
    dwarf.position.copy(position);
    return dwarf;
  }

  /**
   * 4. Cosmic Accretion Vortex
   */
  createCosmicAccretionVortex() {
    this.vortexGroup = new THREE.Group();
    const ringCount = 12000;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(ringCount * 3);
    const cols = new Float32Array(ringCount * 3);
    const sizes = new Float32Array(ringCount);

    const cyanColor = new THREE.Color(0x38ef7d);
    const tealColor = new THREE.Color(0x11998e);
    const magentaColor = new THREE.Color(0xe040fb);
    const blueColor = new THREE.Color(0x00d2ff);

    for (let i = 0; i < ringCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 180 + Math.pow(Math.random(), 0.8) * 850;
      const spiralWrap = angle + (r * 0.012);

      pos[i * 3] = Math.cos(spiralWrap) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = Math.sin(spiralWrap) * r;

      const t = (r - 180) / 850;
      let c;
      if (t < 0.3) c = blueColor.clone().lerp(tealColor, t / 0.3);
      else if (t < 0.7) c = tealColor.clone().lerp(cyanColor, (t - 0.3) / 0.4);
      else c = cyanColor.clone().lerp(magentaColor, (t - 0.7) / 0.3);

      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
      sizes[i] = 2.0 + Math.random() * 3.5;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      map: this.createStarGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });

    const vortexMesh = new THREE.Points(geom, mat);
    this.vortexGroup.add(vortexMesh);
    this.vortexGroup.rotation.x = THREE.MathUtils.degToRad(-55);
    this.vortexGroup.rotation.y = THREE.MathUtils.degToRad(25);
    this.vortexGroup.position.set(0, 50, -400);

    this.scene.add(this.vortexGroup);
  }

  /**
   * 5. 3D Celestial Planets (Subtle & Natural)
   */
  create3DPlanets() {
    this.planetGroup = new THREE.Group();

    // Distant Sapphire Exoplanet (Subtle deep-space celestial object)
    const exoGeom = new THREE.SphereGeometry(18, 32, 32);
    const exoMat = new THREE.MeshStandardMaterial({
      color: 0x1e88e5,
      roughness: 0.4,
      metalness: 0.2
    });
    const exoMesh = new THREE.Mesh(exoGeom, exoMat);
    exoMesh.position.set(820, -240, -750);
    this.planetGroup.add(exoMesh);

    this.scene.add(this.planetGroup);
  }

  /**
   * 6. Procedural 3D Floating Astronaut
   */
  createFloatingAstronaut() {
    const astroGroup = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.7 });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.1,
      metalness: 0.95
    });
    const packMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(7, 10, 5), suitMat);
    astroGroup.add(torso);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), suitMat);
    helmet.position.set(0, 8.5, 0);
    astroGroup.add(helmet);

    const visor = new THREE.Mesh(new THREE.SphereGeometry(3.6, 16, 16, 0, Math.PI), visorMat);
    visor.rotation.y = Math.PI / 2;
    visor.position.set(0, 8.5, 1.4);
    astroGroup.add(visor);

    const pack = new THREE.Mesh(new THREE.BoxGeometry(6.5, 8.5, 3.5), packMat);
    pack.position.set(0, 0.5, -3.8);
    astroGroup.add(pack);

    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.2, 7, 8), suitMat);
    leftArm.position.set(-5, 0, 0);
    leftArm.rotation.z = 0.5;
    astroGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.2, 7, 8), suitMat);
    rightArm.position.set(5, 2.5, 0);
    rightArm.rotation.z = -1.2;
    astroGroup.add(rightArm);

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 8, 8), suitMat);
    leftLeg.position.set(-2.2, -8.5, 0.5);
    leftLeg.rotation.x = 0.2;
    astroGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 8, 8), suitMat);
    rightLeg.position.set(2.2, -8.5, -0.5);
    rightLeg.rotation.x = -0.3;
    astroGroup.add(rightLeg);

    const tetherCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -5),
      new THREE.Vector3(-15, -10, -25),
      new THREE.Vector3(-30, 5, -50),
      new THREE.Vector3(-60, -20, -100)
    ]);
    const tetherGeom = new THREE.TubeGeometry(tetherCurve, 20, 0.4, 6, false);
    const tetherMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.65 });
    const tether = new THREE.Mesh(tetherGeom, tetherMat);
    astroGroup.add(tether);

    astroGroup.position.set(380, 180, 250);
    astroGroup.scale.set(1.4, 1.4, 1.4);

    this.scene.add(astroGroup);

    this.astronaut = {
      group: astroGroup,
      time: 0,
      rotSpeedX: 0.003,
      rotSpeedY: 0.004,
      rotSpeedZ: 0.002
    };
  }

  updateAstronaut(delta) {
    if (!this.astronaut) return;
    this.astronaut.time += delta;
    this.astronaut.group.rotation.x += this.astronaut.rotSpeedX;
    this.astronaut.group.rotation.y += this.astronaut.rotSpeedY;
    this.astronaut.group.rotation.z += this.astronaut.rotSpeedZ;
    this.astronaut.group.position.y = 180 + Math.sin(this.astronaut.time * 0.8) * 18;
    this.astronaut.group.position.x = 380 + Math.cos(this.astronaut.time * 0.4) * 12;
  }

  createComet() {
    const cometGroup = new THREE.Group();

    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    cometGroup.add(nucleus);

    const haloMat = new THREE.SpriteMaterial({
      map: this.createStarGlowTexture(),
      color: 0x64d2ff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(65, 65, 1);
    cometGroup.add(halo);

    const tailParticleCount = 60;
    const tailGeom = new THREE.BufferGeometry();
    const tailPositions = new Float32Array(tailParticleCount * 3);
    const tailColors = new Float32Array(tailParticleCount * 3);
    const tailSizes = new Float32Array(tailParticleCount);

    for (let t = 0; t < tailParticleCount; t++) {
      tailPositions[t * 3] = -t * 4.5;
      tailPositions[t * 3 + 1] = (Math.random() - 0.5) * (t * 0.5);
      tailPositions[t * 3 + 2] = (Math.random() - 0.5) * (t * 0.5);

      const fade = 1.0 - t / tailParticleCount;
      tailColors[t * 3] = 0.4 * fade;
      tailColors[t * 3 + 1] = 0.85 * fade;
      tailColors[t * 3 + 2] = 1.0 * fade;
      tailSizes[t * 3] = (1.0 - t / tailParticleCount) * 18 + 2;
    }

    tailGeom.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
    tailGeom.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));
    tailGeom.setAttribute('size', new THREE.BufferAttribute(tailSizes, 1));

    const tailMat = new THREE.PointsMaterial({
      size: 16,
      vertexColors: true,
      map: this.createStarGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });

    const tailMesh = new THREE.Points(tailGeom, tailMat);
    cometGroup.add(tailMesh);

    this.scene.add(cometGroup);

    this.comet = {
      group: cometGroup,
      t: 0,
      speed: 0.003,
      a: 1100,
      b: 650
    };
  }

  updateComet(delta) {
    if (!this.comet) return;
    this.comet.t += this.comet.speed;

    const x = Math.cos(this.comet.t) * this.comet.a;
    const z = Math.sin(this.comet.t) * this.comet.b;
    const y = Math.sin(this.comet.t * 2) * 220;

    const prevX = this.comet.group.position.x;
    const prevY = this.comet.group.position.y;
    const prevZ = this.comet.group.position.z;

    this.comet.group.position.set(x, y, z);

    const dir = new THREE.Vector3(x - prevX, y - prevY, z - prevZ).normalize();
    if (dir.lengthSq() > 0.0001) {
      this.comet.group.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    }
  }

  createNebulae() {
    this.nebulaGroup = new THREE.Group();
    this.nebulaSprites = [];
    const textures = [
      this.createOrganicNebulaTexture(1),
      this.createOrganicNebulaTexture(2),
      this.createOrganicNebulaTexture(3)
    ];

    // Rich astrophotography nebula cloud formations across deep space (Hubble / JWST aesthetic)
    const cloudCount = 44;
    const defaultHues = [0x7c3aed, 0x2563eb, 0xdb2777, 0x06b6d4, 0x9333ea, 0x3b82f6];

    for (let i = 0; i < cloudCount; i++) {
      const tex = textures[i % textures.length];
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: defaultHues[i % defaultHues.length],
        transparent: true,
        opacity: 0.2 + Math.random() * 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(mat);
      const dist = 750 + Math.random() * 1500;
      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.5) * 1200;
      const z = (Math.random() - 0.5) * (this.spaceDepth * 0.95);

      sprite.position.set(Math.cos(angle) * dist, elev, z);
      const scale = 1100 + Math.random() * 1400;
      sprite.scale.set(scale, scale, 1);
      
      this.nebulaGroup.add(sprite);
      this.nebulaSprites.push(sprite);
    }

    this.scene.add(this.nebulaGroup);
    this.currentNebulaTheme = 'purple';
  }

  setNebulaTheme(themeName) {
    this.currentNebulaTheme = themeName;
    const themes = {
      purple: {
        hues: [0x7c3aed, 0xdb2777, 0x9333ea, 0x4f46e5, 0xc084fc],
        fog: 0x060214,
        opacity: 0.28
      },
      blue: {
        hues: [0x0284c7, 0x2563eb, 0x06b6d4, 0x1d4ed8, 0x38bdf8],
        fog: 0x010818,
        opacity: 0.26
      },
      galaxy: {
        hues: [0x8b5cf6, 0xec4899, 0x0ea5e9, 0xf59e0b, 0x10b981],
        fog: 0x030616,
        opacity: 0.25
      },
      gold: {
        hues: [0xd97706, 0xf59e0b, 0xb45309, 0xfbbf24, 0x92400e],
        fog: 0x0d0702,
        opacity: 0.24
      },
      dark: {
        hues: [0x1e1b4b, 0x0f172a, 0x1e293b, 0x172554, 0x090d16],
        fog: 0x010206,
        opacity: 0.08
      }
    };

    const cfg = themes[themeName] || themes.purple;
    if (this.scene && this.scene.fog) {
      this.scene.fog.color.setHex(cfg.fog);
    }
    if (this.renderer) {
      this.renderer.setClearColor(cfg.fog, 1.0);
    }

    if (this.nebulaSprites) {
      this.nebulaSprites.forEach((sprite, idx) => {
        const hex = cfg.hues[idx % cfg.hues.length];
        sprite.material.color.setHex(hex);
        sprite.material.opacity = (cfg.opacity * (0.8 + (idx % 5) * 0.1));
      });
    }
  }

  setupShootingStars() {
    this.shootingStars = [];
    for (let i = 0; i < 4; i++) {
      const lineGeom = new THREE.BufferGeometry();
      const positions = new Float32Array(6);
      lineGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: 0x90f0ff,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        linewidth: 2
      });

      const meteor = new THREE.Line(lineGeom, lineMat);
      this.scene.add(meteor);

      this.shootingStars.push({
        mesh: meteor,
        active: false,
        timer: Math.random() * 4 + 2,
        pos: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        length: 140,
        progress: 0,
        maxLife: 0.7
      });
    }
  }

  spawnMeteor(meteor) {
    meteor.active = true;
    meteor.progress = 0;
    meteor.maxLife = 0.5 + Math.random() * 0.4;
    meteor.length = 120 + Math.random() * 80;

    meteor.pos.set((Math.random() - 0.5) * 1600, 400 + Math.random() * 600, (Math.random() - 0.5) * 1400);
    meteor.velocity.set((Math.random() - 0.5) * 800 - 400, -850 - Math.random() * 500, (Math.random() - 0.5) * 600);
  }

  updateShootingStars(delta) {
    this.shootingStars.forEach((m) => {
      if (!m.active) {
        m.timer -= delta;
        if (m.timer <= 0) {
          this.spawnMeteor(m);
          m.timer = 4 + Math.random() * 8;
        }
        return;
      }

      m.progress += delta;
      if (m.progress >= m.maxLife) {
        m.active = false;
        m.mesh.material.opacity = 0;
        return;
      }

      m.pos.addScaledVector(m.velocity, delta);
      const tailPos = m.pos.clone().addScaledVector(m.velocity.clone().normalize(), -m.length);

      const positions = m.mesh.geometry.attributes.position.array;
      positions[0] = m.pos.x; positions[1] = m.pos.y; positions[2] = m.pos.z;
      positions[3] = tailPos.x; positions[4] = tailPos.y; positions[5] = tailPos.z;
      m.mesh.geometry.attributes.position.needsUpdate = true;

      const halfLife = m.maxLife / 2;
      const opacity = m.progress < halfLife ? (m.progress / halfLife) : (1.0 - (m.progress - halfLife) / halfLife);
      m.mesh.material.opacity = Math.max(0, opacity * 0.9);
    });
  }

  /**
   * Infinite Space Scrolling & Continuous Star Flight
   */
  onWindowScroll(event) {
    // Scroll wheel accelerates forward or backward flight through the infinite cosmos
    this.scrollVelocity += event.deltaY * 0.15;
    // Cap scroll velocity for smoothness
    this.scrollVelocity = Math.max(-25, Math.min(25, this.scrollVelocity));
  }

  updateInfiniteSpaceFlight(delta) {
    // Total forward travel speed
    const currentSpeed = (this.cruiseSpeed + this.scrollVelocity) * (this.isInfiniteWarp ? 2.2 : 1.0);
    this.scrollVelocity *= 0.92; // Smooth friction decay

    // 1. Move stars with depth wrapping
    if (this.starPoints) {
      const pos = this.starPoints.geometry.attributes.position.array;
      const halfDepth = this.spaceDepth / 2;

      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 2] += currentSpeed;

        // Infinite wrapping: when star passes camera, wrap behind
        if (pos[i + 2] > 900) {
          pos[i + 2] -= this.spaceDepth;
        } else if (pos[i + 2] < -this.spaceDepth + 900) {
          pos[i + 2] += this.spaceDepth;
        }
      }
      this.starPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Move optical diffraction spike beacons
    if (this.beaconSpikePoints) {
      const bPos = this.beaconSpikePoints.geometry.attributes.position.array;
      for (let k = 0; k < bPos.length; k += 3) {
        bPos[k + 2] += currentSpeed;
        if (bPos[k + 2] > 900) {
          bPos[k + 2] -= this.spaceDepth;
        } else if (bPos[k + 2] < -this.spaceDepth + 900) {
          bPos[k + 2] += this.spaceDepth;
        }
      }
      this.beaconSpikePoints.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Move atmospheric cosmic dust particles
    if (this.dustPoints) {
      const dPos = this.dustPoints.geometry.attributes.position.array;
      for (let j = 0; j < dPos.length; j += 3) {
        dPos[j + 2] += currentSpeed * 1.4; // Parallax dust rush
        if (dPos[j + 2] > 900) {
          dPos[j + 2] -= this.spaceDepth;
        } else if (dPos[j + 2] < -this.spaceDepth + 900) {
          dPos[j + 2] += this.spaceDepth;
        }
      }
      this.dustPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Move volumetric nebula cloud sprites with subtle parallax wrapping
    if (this.nebulaSprites) {
      for (let s = 0; s < this.nebulaSprites.length; s++) {
        const sprite = this.nebulaSprites[s];
        sprite.position.z += currentSpeed * 0.35;
        if (sprite.position.z > 950) {
          sprite.position.z -= this.spaceDepth * 0.95;
        } else if (sprite.position.z < -this.spaceDepth * 0.95 + 950) {
          sprite.position.z += this.spaceDepth * 0.95;
        }
      }
    }

    // 5. Interactive Keyboard Steering in Infinite Space Flight (WASD & Arrow keys)
    const steerSpeed = 24;
    let targetSteerX = 0;
    let targetSteerY = 0;

    if (this.keys['KeyA'] || this.keys['ArrowLeft']) targetSteerX -= steerSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) targetSteerX += steerSpeed;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) targetSteerY += steerSpeed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) targetSteerY -= steerSpeed;

    this.steerX = THREE.MathUtils.lerp(this.steerX, targetSteerX, 0.08);
    this.steerY = THREE.MathUtils.lerp(this.steerY, targetSteerY, 0.08);

    if (this.camera && (Math.abs(this.steerX) > 0.01 || Math.abs(this.steerY) > 0.01)) {
      this.camera.position.x += this.steerX * 0.4;
      this.camera.position.y += this.steerY * 0.4;
      this.camera.rotation.z = -this.steerX * 0.012; // Banking tilt
    }

    // 6. Real-time Telemetry: Update Voyage Distance (Light-Years)
    this.voyageDistance += currentSpeed * 1.6;
    const distEl = document.getElementById('dash-distance-val');
    if (distEl) {
      distEl.textContent = `${Math.floor(this.voyageDistance).toLocaleString()} LY`;
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (this.constellationGroup && this.constellationGroup.children.length > 0) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const starSprites = [];
      this.constellationGroup.traverse((child) => {
        if (child.isSprite && child.userData && child.userData.isConstellationStar) {
          starSprites.push(child);
        }
      });

      const intersects = this.raycaster.intersectObjects(starSprites);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (this.hoveredObject !== hit) {
          this.hoveredObject = hit;
          document.body.style.cursor = 'pointer';
          if (this.onStarHover) this.onStarHover(hit.userData, event.clientX, event.clientY);
        }
      } else {
        if (this.hoveredObject) {
          this.hoveredObject = null;
          document.body.style.cursor = 'default';
          if (this.onStarHover) this.onStarHover(null);
        }
      }
    }
  }

  onPointerClick(event) {
    if (this.hoveredObject && this.onStarClick) {
      this.onStarClick(this.hoveredObject.userData, event.clientX, event.clientY);
    }
  }

  setupFallbackControls() {
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { radius: 850, theta: 0, phi: Math.PI / 2 };

    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        isDragging = true;
        prevMouse.x = e.clientX; prevMouse.y = e.clientY;
      }
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      prevMouse.x = e.clientX; prevMouse.y = e.clientY;

      spherical.theta -= deltaX * 0.005;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY * 0.005));

      this.camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      this.camera.position.y = spherical.radius * Math.cos(spherical.phi);
      this.camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      this.camera.lookAt(0, 0, 0);
    });

    this.controls = { target: new THREE.Vector3(0, 0, 0), update: () => {} };
  }

  resetCamera(duration = 1.4) {
    if (!this.camera || !this.controls) return;
    const targetPos = new THREE.Vector3(0, 0, 850);
    const startPos = this.camera.position.clone();
    const startTime = performance.now();

    const animateReset = (time) => {
      const elapsed = (time - startTime) / (duration * 1000);
      if (elapsed < 1.0) {
        const t = 1 - Math.pow(1 - elapsed, 3);
        this.camera.position.lerpVectors(startPos, targetPos, t);
        this.controls.target.set(0, 0, 0);
        requestAnimationFrame(animateReset);
      } else {
        this.camera.position.copy(targetPos);
        this.controls.target.set(0, 0, 0);
      }
    };
    requestAnimationFrame(animateReset);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Infinite Space Flight & Continuous Starfield Wrapping
    this.updateInfiniteSpaceFlight(delta);

    // Natural Cosmos & Andromeda Galaxy Rotation
    if (this.isAutoRotating) {
      if (this.galaxyGroup && this.showGalaxy) {
        this.galaxyGroup.rotation.y += this.baseRotationSpeed * 1.2;
      }
      if (this.vortexGroup) {
        this.vortexGroup.rotation.z += this.baseRotationSpeed * 2.2;
      }
      if (this.nebulaGroup) this.nebulaGroup.rotation.y += this.baseRotationSpeed * 0.6;
    }

    // Natural Star Scintillation
    if (this.starPoints && this.starPoints.material) {
      this.starPoints.material.size = 4.2 + Math.sin(elapsedTime * 2.2) * 0.35;
    }

    // Dynamic space simulations
    this.updateAstronaut(delta);
    this.updateComet(delta);
    this.updateShootingStars(delta);

    if (this.solarSystem) {
      this.solarSystem.update(delta);
    }

    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

window.Universe = Universe;
