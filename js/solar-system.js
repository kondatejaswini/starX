/**
 * StarX — Interactive 3D Solar System & Astronaut Guided Tour
 * Features realistic 3D planets with textures, orbits, Sun with glowing corona,
 * Saturn rings, asteroid belt, space station, interactive click-to-focus,
 * detailed educational data, and a 9-step guided tour with Commander Nova.
 */

class SolarSystemManager {
  constructor(universe) {
    this.universe = universe;
    this.scene = universe.scene;
    this.camera = universe.camera;
    this.controls = universe.controls;

    this.group = new THREE.Group();
    this.group.name = 'solarSystemGroup';
    this.scene.add(this.group);
    this.group.visible = false; // Hidden until Explore view is active

    this.planets = {};
    this.orbitLines = [];
    this.showOrbits = true;
    this.focusedBody = null;
    this.isTourActive = false;
    this.tourStep = 0;
    this.isTourPaused = false;
    this.cameraTarget = null;
    this.cameraLerpSpeed = 0.04;

    this.celestialData = this.initCelestialData();
    this.tourSteps = this.initTourSteps();

    this.buildSolarSystem();
  }

  initCelestialData() {
    return {
      sun: {
        name: 'The Sun',
        type: 'Yellow Dwarf Star (G2V)',
        distance: '0 km (Center of Solar System)',
        diameter: '1,392,700 km (109 × Earth)',
        dayLength: '27 Earth days (at equator)',
        yearLength: '~230 Million years (Galactic orbit)',
        moons: '8 planets, 5 dwarf planets, millions of asteroids & comets',
        description: 'The luminous heart of our solar system. The Sun contains 99.86% of all mass in the entire solar system and powers all life on Earth through nuclear fusion.',
        facts: [
          'Every second, the Sun fuses 600 million tons of hydrogen into helium.',
          'Light from the Sun takes roughly 8 minutes and 20 seconds to reach Earth.',
          'The Sun is hot enough that its core temperature reaches 15 million degrees Celsius.'
        ],
        radius: 54,
        orbitRadius: 0,
        color: 0xffaa00,
        speed: 0.002
      },
      mercury: {
        name: 'Mercury',
        type: 'Terrestrial Rocky Planet',
        distance: '57.9 Million km (0.39 AU)',
        diameter: '4,879 km (0.38 × Earth)',
        dayLength: '59 Earth days',
        yearLength: '88 Earth days',
        moons: '0',
        description: 'The smallest planet and closest to the Sun. Mercury experiences extreme temperatures from 430°C in sunlight to -180°C in shadow.',
        facts: [
          'Mercury is shrinking as its iron core slowly cools down.',
          'Despite being closest to the Sun, Venus is actually hotter due to its greenhouse effect.',
          'Mercury has no atmosphere, only a thin exosphere of solar wind particles.'
        ],
        radius: 7,
        orbitRadius: 105,
        color: 0x9ca3af,
        speed: 0.024
      },
      venus: {
        name: 'Venus',
        type: 'Terrestrial Rocky Planet',
        distance: '108.2 Million km (0.72 AU)',
        diameter: '12,104 km (0.95 × Earth)',
        dayLength: '243 Earth days (spins backward!)',
        yearLength: '225 Earth days',
        moons: '0',
        description: 'Earth’s twin in size, but a runaway greenhouse furnace. Its thick toxic carbon dioxide atmosphere traps heat, creating surface temperatures of 475°C.',
        facts: [
          'Venus rotates clockwise (retrograde), opposite to most planets.',
          'A day on Venus is longer than its entire year!',
          'Its atmospheric pressure is 92 times that of Earth, equivalent to 900 meters underwater.'
        ],
        radius: 11,
        orbitRadius: 155,
        color: 0xeab308,
        speed: 0.018
      },
      earth: {
        name: 'Earth',
        type: 'Terrestrial Ocean Planet',
        distance: '149.6 Million km (1.0 AU)',
        diameter: '12,742 km',
        dayLength: '24 Hours',
        yearLength: '365.25 Days',
        moons: '1 (The Moon / Luna)',
        description: 'Our home oasis. Earth is the only known celestial body in the universe confirmed to harbor life, with liquid oceans covering 71% of its surface.',
        facts: [
          'Earth’s magnetic field shields our atmosphere from deadly cosmic radiation.',
          'Plate tectonics keep Earth’s carbon cycle balanced and climate habitable.',
          'Earth is moving around the Sun at a blistering speed of 107,000 km/h (67,000 mph).'
        ],
        radius: 12,
        orbitRadius: 215,
        color: 0x38bdf8,
        speed: 0.014
      },
      moon: {
        name: 'The Moon (Luna)',
        type: 'Natural Satellite',
        distance: '384,400 km from Earth',
        diameter: '3,474 km (0.27 × Earth)',
        dayLength: '27.3 Earth days (Tidally locked)',
        yearLength: 'Orbits Earth in 27.3 days',
        moons: '0',
        description: 'Earth’s only natural satellite. The Moon stabilizes Earth’s axial tilt, driving the oceanic tides and providing natural nighttime illumination.',
        facts: [
          'The Moon is tidally locked, meaning the exact same face always points toward Earth.',
          'Footprints left by Apollo astronauts will remain preserved for millions of years due to lack of wind.',
          'The Moon is slowly drifting away from Earth at roughly 3.8 cm per year.'
        ],
        radius: 3.5,
        orbitRadius: 26,
        color: 0xd1d5db,
        speed: 0.05
      },
      mars: {
        name: 'Mars',
        type: 'Terrestrial Desert Planet',
        distance: '227.9 Million km (1.52 AU)',
        diameter: '6,779 km (0.53 × Earth)',
        dayLength: '24 Hours, 37 Minutes',
        yearLength: '687 Earth days',
        moons: '2 (Phobos & Deimos)',
        description: 'The Red Planet, colored by iron oxide (rust) on its surface. Mars holds the tallest volcano and deepest canyon system in the entire solar system.',
        facts: [
          'Olympus Mons on Mars is 21.9 km high, nearly 3 times taller than Mount Everest!',
          'Valles Marineris canyon is 4,000 km long, spanning the width of North America.',
          'Evidence suggests Mars once had rivers, lakes, and perhaps an ocean billions of years ago.'
        ],
        radius: 9,
        orbitRadius: 285,
        color: 0xf97316,
        speed: 0.011
      },
      jupiter: {
        name: 'Jupiter',
        type: 'Gas Giant',
        distance: '778.5 Million km (5.2 AU)',
        diameter: '139,820 km (11 × Earth)',
        dayLength: '9 Hours, 56 Minutes',
        yearLength: '11.86 Earth years',
        moons: '95 confirmed moons (including Ganymede & Europa)',
        description: 'The colossus of our solar system. Jupiter has more than twice the mass of all other planets combined and acts as a cosmic shield against comets.',
        facts: [
          'The Great Red Spot is an anticyclonic storm larger than Earth that has raged for over 350 years.',
          'Ganymede, Jupiter’s largest moon, is bigger than the planet Mercury.',
          'Europa harbors a deep subsurface liquid ocean with twice the water of all Earth’s oceans.'
        ],
        radius: 30,
        orbitRadius: 400,
        color: 0xfbbf24,
        speed: 0.007
      },
      saturn: {
        name: 'Saturn',
        type: 'Ringed Gas Giant',
        distance: '1.43 Billion km (9.58 AU)',
        diameter: '116,460 km (9 × Earth)',
        dayLength: '10 Hours, 33 Minutes',
        yearLength: '29.4 Earth years',
        moons: '146 confirmed moons (including Titan & Enceladus)',
        description: 'The jewel of the solar system, surrounded by a glorious ring system made of billions of ice crystals, rocks, and dust particles.',
        facts: [
          'Saturn’s rings span 282,000 km wide, but are incredibly thin—often only 10 to 30 meters thick!',
          'Saturn has the lowest density of any planet; it would float if placed in a giant bathtub of water.',
          'Titan is the only moon with a dense atmosphere and liquid methane lakes on its surface.'
        ],
        radius: 25,
        orbitRadius: 520,
        color: 0xfde047,
        speed: 0.005,
        hasRings: true
      },
      uranus: {
        name: 'Uranus',
        type: 'Ice Giant',
        distance: '2.87 Billion km (19.2 AU)',
        diameter: '50,724 km (4 × Earth)',
        dayLength: '17 Hours, 14 Minutes',
        yearLength: '84 Earth years',
        moons: '28 confirmed moons',
        description: 'An ice giant tilted completely on its side with a 98-degree axial tilt. It rotates like a rolling bowling ball along its orbital plane.',
        facts: [
          'Uranus holds the coldest planetary atmosphere recorded in the solar system at -224°C.',
          'Its unusual sideways tilt is thought to be the result of a collision with an Earth-sized protoplanet.',
          'Uranus has 13 faint rings composed of dark, organic stardust.'
        ],
        radius: 18,
        orbitRadius: 640,
        color: 0x67e8f9,
        speed: 0.0035
      },
      neptune: {
        name: 'Neptune',
        type: 'Ice Giant',
        distance: '4.50 Billion km (30.1 AU)',
        diameter: '49,244 km (3.9 × Earth)',
        dayLength: '16 Hours, 6 Minutes',
        yearLength: '165 Earth years',
        moons: '16 confirmed moons (including Triton)',
        description: 'The outermost major planet. An azure world of supersonic supersonic winds, cold methane clouds, and intense raging storm systems.',
        facts: [
          'Neptune features the fastest winds in the solar system, reaching over 2,100 km/h (1,300 mph).',
          'Triton orbits Neptune backward (retrograde) and shoots nitrogen geysers into space.',
          'Neptune was the first planet predicted mathematically before ever being observed through a telescope.'
        ],
        radius: 17,
        orbitRadius: 760,
        color: 0x3b82f6,
        speed: 0.0028
      }
    };
  }

  initTourSteps() {
    return [
      {
        step: 1,
        target: 'sun',
        cameraOffset: { x: 0, y: 70, z: 220 },
        title: 'Welcome to the Solar System Tour!',
        guideLine: 'Greetings voyager! I am Commander Nova, your chief astronaut guide. Welcome to our home cosmic neighborhood—a stunning collection of worlds orbiting our life-giving star. Let us begin our grand tour!'
      },
      {
        step: 2,
        target: 'sun',
        cameraOffset: { x: 60, y: 35, z: 160 },
        title: 'Step 1: The Sun (The Engine of Life)',
        guideLine: 'Behold the Sun! A blazing yellow dwarf star holding 99.8% of the entire solar system’s mass. At its core, nuclear fusion transforms hydrogen into helium, showering our worlds with warmth and light!'
      },
      {
        step: 3,
        target: 'mercury',
        cameraOffset: { x: 20, y: 15, z: 45 },
        title: 'Step 2: Mercury & Venus (The Inner Crucible)',
        guideLine: 'Here is Mercury—the fastest planet in the solar system! It zips around the Sun in just 88 days. Nearby orbits Venus, a scorching world wrapped in acid clouds that run a relentless greenhouse furnace.'
      },
      {
        step: 4,
        target: 'earth',
        cameraOffset: { x: 25, y: 18, z: 55 },
        title: 'Step 3: Earth & The Moon (The Living Oasis)',
        guideLine: 'Look at our precious pale blue dot! Earth is the only world confirmed to harbor oceans and living consciousness. Notice our faithful companion, the Moon, gently guiding the tides as we drift!'
      },
      {
        step: 5,
        target: 'mars',
        cameraOffset: { x: 22, y: 15, z: 50 },
        title: 'Step 4: Mars (The Rust-Red Frontier)',
        guideLine: 'Welcome to Mars! Covered in iron-oxide dust, it boasts Olympus Mons—the tallest volcano in the solar system, three times taller than Everest! Humanity’s next great step awaits here.'
      },
      {
        step: 6,
        target: 'jupiter',
        cameraOffset: { x: 60, y: 40, z: 120 },
        title: 'Step 5: Jupiter & Saturn (The Majestic Gas Giants)',
        guideLine: 'Approaching the king of worlds: Jupiter! Its Great Red Spot is a hurricane larger than Earth. Next in line is Saturn, adorned with thousands of crystalline ice rings spanning hundreds of thousands of kilometers.'
      },
      {
        step: 7,
        target: 'uranus',
        cameraOffset: { x: 40, y: 25, z: 80 },
        title: 'Step 6: Uranus & Neptune (The Deep Ice Giants)',
        guideLine: 'Now we enter the frigid outer frontier! Uranus rolls on its side at an eccentric 98-degree tilt. Further out lies Neptune, a storm-lashed sapphire giant with supersonic winds topping 2,000 km/h!'
      },
      {
        step: 8,
        target: 'sun',
        cameraOffset: { x: 200, y: 150, z: 420 },
        title: 'Step 7: Asteroids, Space Stations & Human Reach',
        guideLine: 'Notice the glittering asteroid belt between Mars and Jupiter! Humanity has placed satellites, telescopes, and space stations in orbit, extending our sensory reach across the cosmos.'
      },
      {
        step: 9,
        target: 'sun',
        cameraOffset: { x: 0, y: 380, z: 1100 },
        title: 'Step 8: The Wider Universe',
        guideLine: 'Take a step back and view our entire solar system floating peacefully amidst the stars and galactic clouds. You are now free to click any world or fly anywhere your heart desires!'
      }
    ];
  }

  buildSolarSystem() {
    // 1. The Sun
    this.buildSun();

    // 2. Planets
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    planetKeys.forEach((key) => {
      this.buildPlanet(key);
    });

    // 3. Earth's Moon
    this.buildMoon();

    // 4. Asteroid Belt
    this.buildAsteroidBelt();

    // 5. Space Station
    this.buildSpaceStation();

    // 6. Orbital Rings
    this.buildOrbitRings();
  }

  buildSun() {
    const sunData = this.celestialData.sun;
    const geom = new THREE.SphereGeometry(sunData.radius, 48, 48);

    // Procedural solar surface texture
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ffea75');
    grad.addColorStop(0.65, '#f59e0b');
    grad.addColorStop(0.9, '#ea580c');
    grad.addColorStop(1.0, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Sunspots & granulation
    ctx.fillStyle = 'rgba(180, 83, 9, 0.4)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 8 + 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const sunMesh = new THREE.Mesh(geom, mat);
    sunMesh.name = 'sun';

    // Solar Corona Atmosphere Glow
    const coronaGeom = new THREE.SphereGeometry(sunData.radius * 1.35, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffb703,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
    sunMesh.add(coronaMesh);

    // Point Light emitting from Sun
    const sunLight = new THREE.PointLight(0xfffaed, 3.2, 3000, 1.2);
    sunMesh.add(sunLight);

    this.group.add(sunMesh);
    this.planets['sun'] = {
      mesh: sunMesh,
      pivot: this.group,
      data: sunData,
      angle: 0
    };
  }

  buildPlanet(key) {
    const data = this.celestialData[key];
    const pivot = new THREE.Group();
    pivot.name = `${key}_pivot`;
    this.group.add(pivot);

    // Planet Mesh
    const geom = new THREE.SphereGeometry(data.radius, 36, 36);
    const mat = this.createPlanetMaterial(key, data);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = key;
    mesh.position.x = data.orbitRadius;

    // Saturn Ring System
    if (data.hasRings) {
      const ringGeom = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.6, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xe2d9b8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        roughness: 0.7
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2 + 0.35;
      mesh.add(ring);
    }

    pivot.add(mesh);

    // Initial random orbital angle so planets are naturally distributed
    const initialAngle = Math.random() * Math.PI * 2;
    pivot.rotation.y = initialAngle;

    this.planets[key] = {
      mesh: mesh,
      pivot: pivot,
      data: data,
      angle: initialAngle
    };
  }

  createPlanetMaterial(key, data) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (key === 'earth') {
      // Deep blue ocean with green/brown continents & cloud bands
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(80, 100, 50, 40, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(180, 140, 60, 45, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(128, 70, 70, 0, Math.PI);
      ctx.fill();
    } else if (key === 'mars') {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#991b1b';
      for (let i = 0; i < 20; i++) {
        ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 40, Math.random() * 30);
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 20); // North polar ice cap
      ctx.fillRect(0, 236, 256, 20); // South polar ice cap
    } else if (key === 'jupiter') {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(0.2, '#fde68a');
      grad.addColorStop(0.4, '#b45309');
      grad.addColorStop(0.6, '#fef3c7');
      grad.addColorStop(0.8, '#d97706');
      grad.addColorStop(1, '#92400e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      // Great Red Spot
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(160, 160, 26, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#' + data.color.toString(16).padStart(6, '0');
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, 0, 256, 128);
    }

    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.65,
      metalness: 0.1
    });
  }

  buildMoon() {
    const moonData = this.celestialData.moon;
    const earthObj = this.planets['earth'];
    if (!earthObj) return;

    const moonPivot = new THREE.Group();
    moonPivot.name = 'moon_pivot';
    earthObj.mesh.add(moonPivot);

    const geom = new THREE.SphereGeometry(moonData.radius, 24, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.9,
      metalness: 0.05
    });
    const moonMesh = new THREE.Mesh(geom, mat);
    moonMesh.name = 'moon';
    moonMesh.position.x = moonData.orbitRadius;
    moonPivot.add(moonMesh);

    this.planets['moon'] = {
      mesh: moonMesh,
      pivot: moonPivot,
      data: moonData,
      angle: 0
    };
  }

  buildAsteroidBelt() {
    const asteroidCount = 450;
    const geom = new THREE.DodecahedronGeometry(1.8, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8b7e74,
      roughness: 0.9,
      metalness: 0.1
    });

    const instancedMesh = new THREE.InstancedMesh(geom, mat, asteroidCount);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const scale = new THREE.Vector3();

    for (let i = 0; i < asteroidCount; i++) {
      // Belt sits between Mars (285) and Jupiter (400)
      const radius = 330 + (Math.random() - 0.5) * 55;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 16;

      position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = Math.random() * 0.9 + 0.4;
      scale.set(s, s, s);

      matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
      instancedMesh.setMatrixAt(i, matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.name = 'asteroidBelt';
    this.group.add(instancedMesh);
    this.asteroidBelt = instancedMesh;
  }

  buildSpaceStation() {
    const earthObj = this.planets['earth'];
    if (!earthObj) return;

    const stationGroup = new THREE.Group();
    stationGroup.name = 'spaceStation';

    // Core module
    const coreGeom = new THREE.CylinderGeometry(0.8, 0.8, 4, 12);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.3 });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.rotation.z = Math.PI / 2;
    stationGroup.add(core);

    // Solar panels
    const panelGeom = new THREE.PlaneGeometry(6, 2);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const panelLeft = new THREE.Mesh(panelGeom, panelMat);
    panelLeft.position.set(-4, 0, 0);
    stationGroup.add(panelLeft);

    const panelRight = new THREE.Mesh(panelGeom, panelMat);
    panelRight.position.set(4, 0, 0);
    stationGroup.add(panelRight);

    stationGroup.position.set(0, earthObj.data.radius + 6, 0);
    stationGroup.scale.set(0.6, 0.6, 0.6);
    earthObj.mesh.add(stationGroup);
    this.spaceStation = stationGroup;
  }

  buildOrbitRings() {
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    planetKeys.forEach((key) => {
      const radius = this.celestialData[key].orbitRadius;
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x4bf0ff,
        transparent: true,
        opacity: 0.16
      });
      const line = new THREE.Line(geom, mat);
      line.name = `${key}_orbit_ring`;
      this.group.add(line);
      this.orbitLines.push(line);
    });
  }

  toggleOrbitLines(visible) {
    this.showOrbits = visible !== undefined ? visible : !this.showOrbits;
    this.orbitLines.forEach((line) => {
      line.visible = this.showOrbits;
    });
    return this.showOrbits;
  }

  show() {
    this.group.visible = true;
    if (this.controls) {
      this.controls.minDistance = 25;
      this.controls.maxDistance = 2500;
    }
  }

  hide() {
    this.group.visible = false;
    this.exitTour();
    this.clearFocus();
  }

  focusOnBody(bodyKey) {
    const targetObj = this.planets[bodyKey];
    if (!targetObj) return;

    this.focusedBody = bodyKey;
    const mesh = targetObj.mesh;

    // Get world position of target body
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);

    // Compute smart camera distance based on body radius
    const radius = targetObj.data.radius || 15;
    const distance = Math.max(radius * 3.5, 35);

    // Smoothly animate controls target and camera position
    const targetCamPos = new THREE.Vector3(
      worldPos.x + distance * 0.7,
      worldPos.y + distance * 0.35,
      worldPos.z + distance * 0.8
    );

    this.animateCameraTo(targetCamPos, worldPos);

    // Broadcast planet selection to UI & Guide
    if (this.onPlanetSelected) {
      this.onPlanetSelected(targetObj.data);
    }
  }

  clearFocus() {
    this.focusedBody = null;
    const overviewPos = new THREE.Vector3(0, 320, 850);
    const center = new THREE.Vector3(0, 0, 0);
    this.animateCameraTo(overviewPos, center);

    if (this.onFocusCleared) {
      this.onFocusCleared();
    }
  }

  animateCameraTo(newCamPos, newTargetPos) {
    this.cameraTarget = {
      camPos: newCamPos,
      targetPos: newTargetPos,
      startTime: performance.now(),
      duration: 1200
    };
  }

  startGuidedTour() {
    this.isTourActive = true;
    this.isTourPaused = false;
    this.tourStep = 0;
    this.executeTourStep(0);
  }

  nextTourStep() {
    if (!this.isTourActive) return;
    if (this.tourStep < this.tourSteps.length - 1) {
      this.tourStep++;
      this.executeTourStep(this.tourStep);
    } else {
      this.exitTour();
    }
  }

  prevTourStep() {
    if (!this.isTourActive) return;
    if (this.tourStep > 0) {
      this.tourStep--;
      this.executeTourStep(this.tourStep);
    }
  }

  toggleTourPause() {
    this.isTourPaused = !this.isTourPaused;
    return this.isTourPaused;
  }

  exitTour() {
    this.isTourActive = false;
    this.isTourPaused = false;
    this.clearFocus();
    if (this.onTourEnded) {
      this.onTourEnded();
    }
  }

  executeTourStep(stepIndex) {
    const step = this.tourSteps[stepIndex];
    if (!step) return;

    this.focusOnBody(step.target);

    if (this.onTourStepChanged) {
      this.onTourStepChanged(step, stepIndex + 1, this.tourSteps.length);
    }
  }

  update(delta) {
    if (!this.group.visible) return;

    // 1. Orbital revolution of planets around Sun
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    planetKeys.forEach((key) => {
      const p = this.planets[key];
      if (p && p.pivot) {
        p.pivot.rotation.y += p.data.speed * delta * 18;
      }
      if (p && p.mesh) {
        // Axial spin of planet
        p.mesh.rotation.y += 0.012;
      }
    });

    // 2. Moon orbiting Earth
    const moon = this.planets['moon'];
    if (moon && moon.pivot) {
      moon.pivot.rotation.y += moon.data.speed * delta * 20;
    }

    // 3. Sun axial rotation
    const sun = this.planets['sun'];
    if (sun && sun.mesh) {
      sun.mesh.rotation.y += sun.data.speed * delta * 8;
    }

    // 4. Asteroid belt slow rotation
    if (this.asteroidBelt) {
      this.asteroidBelt.rotation.y += 0.0006;
    }

    // 5. Space station orbit
    if (this.spaceStation) {
      this.spaceStation.rotation.y += 0.02;
    }

    // 6. Camera smooth interpolation to target if animating
    if (this.cameraTarget) {
      const now = performance.now();
      const elapsed = now - this.cameraTarget.startTime;
      const progress = Math.min(elapsed / this.cameraTarget.duration, 1.0);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerp(this.cameraTarget.camPos, ease * 0.15);
      if (this.controls) {
        this.controls.target.lerp(this.cameraTarget.targetPos, ease * 0.15);
      }

      if (progress >= 1.0) {
        this.cameraTarget = null;
      }
    } else if (this.focusedBody && this.planets[this.focusedBody]) {
      // Keep tracking the moving planet
      const mesh = this.planets[this.focusedBody].mesh;
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      if (this.controls) {
        this.controls.target.lerp(worldPos, 0.08);
      }
    }
  }
}

window.SolarSystemManager = SolarSystemManager;
