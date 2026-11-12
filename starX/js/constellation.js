/**
 * Constellation Engine for StarX
 * Supports 3 Modes:
 * 1. Name / Word Mode (Teja, StarX, Mom, Best Friend...)
 * 2. Shape Mode (Heart, Star, Moon, Infinity, Flower, Butterfly, Diamond, Planet, Rocket)
 * 3. Picture / Character Mode & Custom Image-to-Star Rasterizer
 */

class ConstellationManager {
  constructor(universe) {
    this.universe = universe;
    this.currentTheme = 'cyan';
    this.colorPalettes = {
      cyan: { hex: 0x4bf0ff, css: '#4bf0ff', core: 0xffffff, name: 'Sirius Cyan' },
      gold: { hex: 0xffd159, css: '#ffd159', core: 0xfffbe6, name: 'Betelgeuse Gold' },
      purple: { hex: 0xc084fc, css: '#c084fc', core: 0xfdf4ff, name: 'Nebula Violet' },
      emerald: { hex: 0x34d399, css: '#34d399', core: 0xecfdf5, name: 'Aurora Emerald' },
      rose: { hex: 0xfb7185, css: '#fb7185', core: 0xfff1f2, name: 'Supernova Rose' }
    };

    this.activeStars = [];
    this.activeLines = [];
    this.activeGlowMeshes = [];
    this.isForming = false;
    this.lastTitle = 'STARX';

    this.greekLetters = ['Alpha (α)', 'Beta (β)', 'Gamma (γ)', 'Delta (δ)', 'Epsilon (ε)', 'Zeta (ζ)', 'Eta (η)', 'Theta (θ)', 'Iota (ι)', 'Kappa (κ)', 'Lambda (λ)', 'Mu (μ)'];
    this.spectralTypes = [
      { class: 'O5V', desc: 'Blue Hypergiant' },
      { class: 'B2Ia', desc: 'Blue Supergiant' },
      { class: 'A0V', desc: 'White Main Sequence' },
      { class: 'F5IV', desc: 'Yellow-White Subgiant' },
      { class: 'G2V', desc: 'Solar Yellow' },
      { class: 'K1III', desc: 'Orange Giant' },
      { class: 'M2Iab', desc: 'Red Supergiant' }
    ];

    this.letterGlyphs = this.initLetterGlyphs();
    this.flareTexture = this.createStarFlareTexture();
    this.coreTexture = this.createStarCoreTexture();
    this.targetReticleTexture = this.createTargetReticleTexture();

    // In-sky astronomical labels (Starry Night style)
    this.labelGroup = new THREE.Group();
    this.universe.scene.add(this.labelGroup);
    this.showLabels = true;
    this.layoutMode = 'flat'; // 'flat' or 'circle'
  }

  createStarFlareTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.15, 'rgba(220, 240, 255, 0.85)');
    grad.addColorStop(0.4, 'rgba(80, 180, 255, 0.4)');
    grad.addColorStop(0.7, 'rgba(40, 100, 255, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(64, 6); ctx.lineTo(64, 122);
    ctx.moveTo(6, 64); ctx.lineTo(122, 64);
    ctx.stroke();
    return new THREE.CanvasTexture(canvas);
  }

  createStarCoreTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  createTargetReticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#4bf0ff';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 3;
    const corners = [[20, 64, 34, 64], [94, 64, 108, 64], [64, 20, 64, 34], [64, 94, 64, 108]];
    corners.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
    return new THREE.CanvasTexture(canvas);
  }

  initLetterGlyphs() {
    return {
      'A': { nodes: [[0.05, 0], [0.5, 1], [0.95, 0], [0.25, 0.45], [0.75, 0.45]], edges: [[0, 1], [1, 2], [3, 4]] },
      'B': { nodes: [[0.1, 0], [0.1, 0.5], [0.1, 1], [0.7, 0.8], [0.75, 0.25]], edges: [[0, 1], [1, 2], [2, 3], [3, 1], [1, 4], [4, 0]] },
      'C': { nodes: [[0.85, 0.85], [0.5, 1], [0.15, 0.7], [0.15, 0.3], [0.5, 0], [0.85, 0.15]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
      'D': { nodes: [[0.1, 0], [0.1, 1], [0.65, 0.85], [0.8, 0.5], [0.65, 0.15]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
      'E': { nodes: [[0.85, 1], [0.1, 1], [0.1, 0.5], [0.65, 0.5], [0.1, 0], [0.85, 0]], edges: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5]] },
      'F': { nodes: [[0.85, 1], [0.1, 1], [0.1, 0.5], [0.65, 0.5], [0.1, 0]], edges: [[0, 1], [1, 2], [2, 3], [2, 4]] },
      'G': { nodes: [[0.85, 0.85], [0.5, 1], [0.15, 0.7], [0.15, 0.3], [0.5, 0], [0.85, 0.15], [0.85, 0.45], [0.55, 0.45]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] },
      'H': { nodes: [[0.1, 1], [0.1, 0], [0.1, 0.5], [0.9, 0.5], [0.9, 1], [0.9, 0]], edges: [[0, 2], [2, 1], [2, 3], [4, 3], [3, 5]] },
      'I': { nodes: [[0.2, 1], [0.8, 1], [0.5, 1], [0.5, 0], [0.2, 0], [0.8, 0]], edges: [[0, 1], [2, 3], [4, 5]] },
      'J': { nodes: [[0.8, 1], [0.8, 0.3], [0.6, 0.05], [0.3, 0.1], [0.2, 0.35]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      'K': { nodes: [[0.1, 1], [0.1, 0], [0.1, 0.5], [0.85, 1], [0.85, 0]], edges: [[0, 2], [2, 1], [2, 3], [2, 4]] },
      'L': { nodes: [[0.15, 1], [0.15, 0], [0.85, 0]], edges: [[0, 1], [1, 2]] },
      'M': { nodes: [[0.05, 0], [0.05, 1], [0.5, 0.45], [0.95, 1], [0.95, 0]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      'N': { nodes: [[0.1, 0], [0.1, 1], [0.9, 0], [0.9, 1]], edges: [[0, 1], [1, 2], [2, 3]] },
      'O': { nodes: [[0.5, 1], [0.15, 0.75], [0.15, 0.25], [0.5, 0], [0.85, 0.25], [0.85, 0.75]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] },
      'P': { nodes: [[0.1, 0], [0.1, 1], [0.75, 0.85], [0.75, 0.55], [0.1, 0.55]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      'Q': { nodes: [[0.5, 1], [0.15, 0.75], [0.15, 0.25], [0.5, 0], [0.85, 0.25], [0.85, 0.75], [0.6, 0.25], [0.95, -0.1]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [6, 7]] },
      'R': { nodes: [[0.1, 0], [0.1, 1], [0.75, 0.85], [0.75, 0.55], [0.1, 0.55], [0.85, 0]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
      'S': { nodes: [[0.85, 0.9], [0.4, 1], [0.15, 0.75], [0.5, 0.5], [0.85, 0.25], [0.6, 0], [0.15, 0.1]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
      'T': { nodes: [[0.05, 1], [0.95, 1], [0.5, 1], [0.5, 0]], edges: [[0, 1], [2, 3]] },
      'U': { nodes: [[0.15, 1], [0.15, 0.3], [0.5, 0], [0.85, 0.3], [0.85, 1]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      'V': { nodes: [[0.1, 1], [0.5, 0], [0.9, 1]], edges: [[0, 1], [1, 2]] },
      'W': { nodes: [[0.05, 1], [0.25, 0], [0.5, 0.6], [0.75, 0], [0.95, 1]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      'X': { nodes: [[0.1, 1], [0.9, 0], [0.5, 0.5], [0.9, 1], [0.1, 0]], edges: [[0, 2], [2, 1], [3, 2], [2, 4]] },
      'Y': { nodes: [[0.1, 1], [0.5, 0.5], [0.9, 1], [0.5, 0]], edges: [[0, 1], [2, 1], [1, 3]] },
      'Z': { nodes: [[0.1, 1], [0.9, 1], [0.1, 0], [0.9, 0]], edges: [[0, 1], [1, 2], [2, 3]] },
      '0': { nodes: [[0.5, 1], [0.15, 0.7], [0.15, 0.3], [0.5, 0], [0.85, 0.3], [0.85, 0.7]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] },
      '1': { nodes: [[0.3, 0.8], [0.5, 1], [0.5, 0], [0.25, 0], [0.75, 0]], edges: [[0, 1], [1, 2], [3, 4]] },
      '2': { nodes: [[0.15, 0.8], [0.5, 1], [0.85, 0.75], [0.15, 0], [0.85, 0]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      '3': { nodes: [[0.15, 0.9], [0.85, 0.9], [0.5, 0.5], [0.85, 0.2], [0.15, 0]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      '4': { nodes: [[0.75, 0], [0.75, 1], [0.1, 0.35], [0.9, 0.35]], edges: [[1, 0], [1, 2], [2, 3]] },
      '5': { nodes: [[0.85, 1], [0.15, 1], [0.15, 0.55], [0.75, 0.5], [0.8, 0.2], [0.5, 0], [0.15, 0.1]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
      '6': { nodes: [[0.75, 0.9], [0.4, 1], [0.15, 0.6], [0.15, 0.2], [0.5, 0], [0.85, 0.25], [0.85, 0.45], [0.15, 0.45]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] },
      '7': { nodes: [[0.1, 1], [0.9, 1], [0.4, 0]], edges: [[0, 1], [1, 2]] },
      '8': { nodes: [[0.5, 1], [0.2, 0.8], [0.8, 0.8], [0.5, 0.5], [0.15, 0.25], [0.85, 0.25], [0.5, 0]], edges: [[0, 1], [1, 3], [3, 2], [2, 0], [3, 4], [4, 6], [6, 5], [5, 3]] },
      '9': { nodes: [[0.25, 0.1], [0.6, 0], [0.85, 0.4], [0.85, 0.8], [0.5, 1], [0.15, 0.75], [0.15, 0.55], [0.85, 0.55]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] },
      ' ': { nodes: [], edges: [] }
    };
  }

  setTheme(themeName) {
    if (!this.colorPalettes[themeName]) return;
    this.currentTheme = themeName;
    const palette = this.colorPalettes[themeName];
    document.documentElement.style.setProperty('--current-glow', palette.css);
    this.activeLines.forEach((line) => line.material.color.setHex(palette.hex));
    this.activeGlowMeshes.forEach((sprite) => sprite.material.color.setHex(palette.hex));
  }

  clear() {
    const group = this.universe.constellationGroup;
    while (group.children.length > 0) {
      const obj = group.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
      group.remove(obj);
    }

    if (this.labelGroup) {
      while (this.labelGroup.children.length > 0) {
        const obj = this.labelGroup.children[0];
        if (obj.material && obj.material.map) obj.material.map.dispose();
        if (obj.material) obj.material.dispose();
        this.labelGroup.remove(obj);
      }
    }

    this.activeStars = [];
    this.activeLines = [];
    this.activeGlowMeshes = [];
    this.isForming = false;
  }

  findNearestRandomStar(targetPos, usedIndices) {
    const stars = this.universe.universeStars;
    if (!stars || stars.length === 0) return null;
    let nearest = null;
    let minDistanceSq = Infinity;
    for (let i = 0; i < stars.length; i++) {
      if (usedIndices.has(i)) continue;
      const distSq = stars[i].pos.distanceToSquared(targetPos);
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        nearest = { star: stars[i], index: i, dist: Math.sqrt(distSq) };
      }
    }
    return nearest;
  }

  /**
   * MODE 1: Name / Word Constellation
   */
  async createConstellation(name, layoutMode = this.layoutMode, onProgress, onComplete) {
    if (!name || name.trim().length === 0) return;
    this.clear();
    this.isForming = true;
    this.layoutMode = layoutMode || 'flat';
    this.lastTitle = name.trim().toUpperCase();

    const cleanName = this.lastTitle;
    const charCount = cleanName.length;

    const allNodes = [];
    const allEdges = [];
    const usedStarIndices = new Set();
    let nodeGlobalIndex = 0;

    if (this.layoutMode === 'circle') {
      // Circular Celestial Planisphere / Ring Formation
      const ringRadius = 240;
      const letterHeight = 85;
      const isFullRing = charCount >= 7;
      const totalArc = isFullRing ? (Math.PI * 2 * 0.88) : Math.min(Math.PI * 1.5, Math.max(Math.PI * 0.75, charCount * 0.44));
      const startAngle = Math.PI / 2 + totalArc / 2;
      const angleStep = totalArc / Math.max(1, charCount - (isFullRing ? 0 : 1));

      for (let c = 0; c < charCount; c++) {
        const char = cleanName[c];
        const glyph = this.letterGlyphs[char] || { nodes: [[0.5, 0.5]], edges: [] };
        const charAngle = startAngle - c * angleStep;
        const charNodeStartIndex = nodeGlobalIndex;

        for (let localIdx = 0; localIdx < glyph.nodes.length; localIdx++) {
          const normCoord = glyph.nodes[localIdx];
          const tangentialAngle = charAngle - (normCoord[0] - 0.5) * 0.24;
          const r = ringRadius + (normCoord[1] - 0.5) * letterHeight;
          const targetX = Math.cos(tangentialAngle) * r;
          const targetY = Math.sin(tangentialAngle) * r;
          const targetZ = (Math.random() - 0.5) * 35;
          const idealPos = new THREE.Vector3(targetX, targetY, targetZ);

          const nearestMatch = this.findNearestRandomStar(idealPos, usedStarIndices);
          let actualPos = nearestMatch ? idealPos.clone().lerp(nearestMatch.star.pos, 0.12) : idealPos;
          if (nearestMatch) usedStarIndices.add(nearestMatch.index);

          const greek = this.greekLetters[localIdx % this.greekLetters.length];
          const spec = this.spectralTypes[Math.floor(Math.random() * this.spectralTypes.length)];
          const mag = (0.7 + Math.random() * 2.1).toFixed(2);
          const dist = Math.floor(65 + Math.random() * 850);

          allNodes.push({
            id: nodeGlobalIndex,
            position: actualPos,
            name: `${greek} ${cleanName}`,
            catalogId: `HIP-${Math.floor(10000 + Math.random() * 89999)}`,
            spectral: `${spec.class} (${spec.desc})`,
            magnitude: `+${mag}`,
            distance: `${dist} Light Years`,
            coordinates: `RA ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`
          });
          nodeGlobalIndex++;
        }

        glyph.edges.forEach((edge) => {
          allEdges.push({
            start: charNodeStartIndex + edge[0],
            end: charNodeStartIndex + edge[1]
          });
        });
      }
    } else {
      // Classic Flat Celestial Line Formation
      const letterWidth = 85;
      const letterHeight = 120;
      const letterSpacing = 28;
      const totalWidth = charCount * letterWidth + (charCount - 1) * letterSpacing;
      const startX = -totalWidth / 2;

      for (let c = 0; c < charCount; c++) {
        const char = cleanName[c];
        const glyph = this.letterGlyphs[char] || { nodes: [[0.5, 0.5]], edges: [] };
        const charStartX = startX + c * (letterWidth + letterSpacing);
        const charNodeStartIndex = nodeGlobalIndex;

        for (let localIdx = 0; localIdx < glyph.nodes.length; localIdx++) {
          const normCoord = glyph.nodes[localIdx];
          const targetX = charStartX + normCoord[0] * letterWidth;
          const targetY = (normCoord[1] - 0.5) * letterHeight;
          const targetZ = (Math.random() - 0.5) * 40;
          const idealPos = new THREE.Vector3(targetX, targetY, targetZ);

          const nearestMatch = this.findNearestRandomStar(idealPos, usedStarIndices);
          let actualPos = nearestMatch ? idealPos.clone().lerp(nearestMatch.star.pos, 0.12) : idealPos;
          if (nearestMatch) usedStarIndices.add(nearestMatch.index);

          const greek = this.greekLetters[localIdx % this.greekLetters.length];
          const spec = this.spectralTypes[Math.floor(Math.random() * this.spectralTypes.length)];
          const mag = (0.7 + Math.random() * 2.1).toFixed(2);
          const dist = Math.floor(65 + Math.random() * 850);

          allNodes.push({
            id: nodeGlobalIndex,
            position: actualPos,
            name: `${greek} ${cleanName}`,
            catalogId: `HIP-${Math.floor(10000 + Math.random() * 89999)}`,
            spectral: `${spec.class} (${spec.desc})`,
            magnitude: `+${mag}`,
            distance: `${dist} Light Years`,
            coordinates: `RA ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`
          });
          nodeGlobalIndex++;
        }

        glyph.edges.forEach((edge) => {
          allEdges.push({
            start: charNodeStartIndex + edge[0],
            end: charNodeStartIndex + edge[1]
          });
        });
      }
    }

    await this.animateStarNetwork(allNodes, allEdges, onProgress, onComplete);
  }

  /**
   * MODE 2: Shape Constellation (Heart, Star, Moon, Infinity, Butterfly, etc.)
   */
  async createShapeConstellation(shapeId, onProgress, onComplete) {
    this.clear();
    this.isForming = true;
    this.lastTitle = shapeId.toUpperCase();

    const shapeData = this.generateShapeGeometry(shapeId);
    await this.animateStarNetwork(shapeData.nodes, shapeData.edges, onProgress, onComplete);
  }

  generateShapeGeometry(shapeId) {
    const nodes = [];
    const edges = [];
    const usedStarIndices = new Set();
    const scale = 220;

    let points = [];
    let isClosedLoop = true;

    if (shapeId === 'heart') {
      const count = 28;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        points.push([x * 12, y * 12]);
      }
    } else if (shapeId === 'star') {
      const pointsCount = 10;
      for (let i = 0; i < pointsCount; i++) {
        const r = i % 2 === 0 ? scale : scale * 0.45;
        const angle = (i / pointsCount) * Math.PI * 2 - Math.PI / 2;
        points.push([Math.cos(angle) * r, Math.sin(angle) * r]);
      }
    } else if (shapeId === 'moon') {
      isClosedLoop = true;
      const count = 18;
      // Outer lunar crescent
      for (let i = 0; i <= count; i++) {
        const a = (i / count) * Math.PI * 1.5 - Math.PI * 0.75;
        points.push([Math.cos(a) * scale * 1.1 - 40, Math.sin(a) * scale * 1.1]);
      }
      // Inner scoop
      for (let i = count; i >= 0; i--) {
        const a = (i / count) * Math.PI * 1.4 - Math.PI * 0.7;
        points.push([Math.cos(a) * scale * 0.85 + 20, Math.sin(a) * scale * 0.85]);
      }
    } else if (shapeId === 'infinity') {
      const count = 32;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const denom = 1 + Math.sin(t) * Math.sin(t);
        const x = (scale * 1.4 * Math.cos(t)) / denom;
        const y = (scale * 1.4 * Math.sin(t) * Math.cos(t)) / denom;
        points.push([x, y]);
      }
    } else if (shapeId === 'flower') {
      const count = 36;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const r = scale * (0.5 + 0.5 * Math.cos(5 * t));
        points.push([Math.cos(t) * r, Math.sin(t) * r]);
      }
    } else if (shapeId === 'butterfly') {
      const count = 30;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const r = scale * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin(t / 12), 5)) * 0.35;
        points.push([Math.sin(t) * r * 1.3, Math.cos(t) * r]);
      }
    } else if (shapeId === 'planet') {
      isClosedLoop = false;
      // Globe
      const globeCount = 14;
      for (let i = 0; i < globeCount; i++) {
        const a = (i / globeCount) * Math.PI * 2;
        points.push([Math.cos(a) * (scale * 0.6), Math.sin(a) * (scale * 0.6)]);
      }
      for (let i = 0; i < globeCount; i++) {
        edges.push({ start: i, end: (i + 1) % globeCount });
      }
      // Rings
      const ringStart = points.length;
      const ringCount = 18;
      for (let i = 0; i < ringCount; i++) {
        const a = (i / ringCount) * Math.PI * 2;
        const rx = Math.cos(a) * (scale * 1.4);
        const ry = Math.sin(a) * (scale * 0.35);
        // Tilt ring
        const rot = 0.4;
        points.push([rx * Math.cos(rot) - ry * Math.sin(rot), rx * Math.sin(rot) + ry * Math.cos(rot)]);
      }
      for (let i = 0; i < ringCount; i++) {
        edges.push({ start: ringStart + i, end: ringStart + ((i + 1) % ringCount) });
      }
    } else if (shapeId === 'rocket') {
      isClosedLoop = false;
      points = [
        [0, 180], [-35, 90], [-35, -70], [-70, -110], [-40, -110], [-25, -80],
        [25, -80], [40, -110], [70, -110], [35, -70], [35, 90], [0, 180]
      ];
      for (let i = 0; i < points.length - 1; i++) {
        edges.push({ start: i, end: i + 1 });
      }
      // Cockpit window
      points.push([0, 70], [-15, 45], [0, 20], [15, 45]);
      edges.push({ start: 12, end: 13 }, { start: 13, end: 14 }, { start: 14, end: 15 }, { start: 15, end: 12 });
    } else if (shapeId === 'circle') {
      const count = 24;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        points.push([Math.cos(a) * scale * 0.9, Math.sin(a) * scale * 0.9]);
      }
    } else if (shapeId === 'galaxy') {
      isClosedLoop = false;
      const armCount = 2;
      const pointsPerArm = 16;
      for (let arm = 0; arm < armCount; arm++) {
        const armOffset = arm * Math.PI;
        const armStart = points.length;
        for (let i = 0; i < pointsPerArm; i++) {
          const theta = (i / pointsPerArm) * Math.PI * 2.8 + armOffset;
          const r = (i / pointsPerArm) * scale * 1.1;
          points.push([Math.cos(theta) * r, Math.sin(theta) * r]);
        }
        for (let i = 0; i < pointsPerArm - 1; i++) {
          edges.push({ start: armStart + i, end: armStart + i + 1 });
        }
      }
    } else if (shapeId === 'freeform') {
      isClosedLoop = false;
      const count = 28;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 3.5;
        const x = (i - count / 2) * (scale * 0.08);
        const y = Math.sin(t) * (scale * 0.55);
        points.push([x, y]);
      }
      for (let i = 0; i < points.length - 1; i++) {
        edges.push({ start: i, end: i + 1 });
      }
    } else {
      // Default Diamond
      points = [[0, scale * 1.1], [scale * 0.8, 0], [0, -scale * 1.1], [-scale * 0.8, 0]];
      edges.push({ start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 0 }, { start: 0, end: 2 }, { start: 1, end: 3 });
      isClosedLoop = false;
    }

    if (isClosedLoop) {
      for (let i = 0; i < points.length; i++) {
        edges.push({ start: i, end: (i + 1) % points.length });
      }
    }

    points.forEach((pt, idx) => {
      const idealPos = new THREE.Vector3(pt[0], pt[1], (Math.random() - 0.5) * 35);
      const nearestMatch = this.findNearestRandomStar(idealPos, usedStarIndices);
      let actualPos = nearestMatch ? idealPos.clone().lerp(nearestMatch.star.pos, 0.12) : idealPos;
      if (nearestMatch) usedStarIndices.add(nearestMatch.index);

      nodes.push({
        id: idx,
        position: actualPos,
        name: `Star ${idx + 1} (${this.lastTitle})`,
        catalogId: `SHAPE-${Math.floor(1000 + Math.random() * 9000)}`,
        spectral: 'B2Ia (Blue Supergiant)',
        magnitude: '+1.4',
        distance: '450 Light Years',
        coordinates: 'Celestial Sector IV'
      });
    });

    return { nodes, edges };
  }

  /**
   * MODE 3: Character / Picture Constellation Templates
   */
  async createCharacterConstellation(charId, onProgress, onComplete) {
    this.clear();
    this.isForming = true;
    this.lastTitle = charId.toUpperCase();

    const charTemplates = {
      'cat': [
        // Silhouette points of sitting cat with ears and curled tail
        [0, 140], [-25, 175], [-40, 130], [-35, 80], [-60, 20], [-70, -60],
        [-50, -100], [0, -100], [45, -95], [60, -70], [85, -20], [105, 15],
        [95, 30], [60, -25], [35, -40], [25, 30], [25, 80], [35, 130], [25, 175]
      ],
      'teddy': [
        // Teddy bear ears, head, belly, paws
        [-50, 120], [-75, 155], [-40, 160], [-20, 130], [20, 130], [40, 160],
        [75, 155], [50, 120], [70, 75], [55, 30], [80, 0], [75, -50],
        [40, -40], [30, -90], [-30, -90], [-40, -40], [-75, -50], [-80, 0],
        [-55, 30], [-70, 75]
      ],
      'crown': [
        // Royal Crown
        [-110, -50], [110, -50], [130, 40], [70, 0], [0, 85], [-70, 0], [-130, 40]
      ],
      'couple': [
        // Two figures under the cosmos
        [-40, 110], [-55, 75], [-50, -60], [-25, -90], [-5, -60], [-5, 75],
        [25, 75], [25, -60], [45, -90], [70, -60], [65, 75], [50, 110],
        [0, 135], [-40, 110]
      ],
      'astronaut': [
        // Astronaut silhouette
        [0, 130], [-30, 110], [-35, 60], [-60, 20], [-45, -40], [-25, -90],
        [0, -60], [25, -90], [45, -40], [60, 20], [35, 60], [30, 110], [0, 130]
      ],
      'doll': [
        [-50, 140], [-25, 120], [0, 130], [25, 120], [50, 140], [35, 80],
        [65, 0], [30, -80], [-30, -80], [-65, 0], [-35, 80]
      ]
    };

    const pts = charTemplates[charId] || charTemplates['cat'];
    const nodes = [];
    const edges = [];
    const usedStarIndices = new Set();

    pts.forEach((pt, idx) => {
      const idealPos = new THREE.Vector3(pt[0] * 1.5, pt[1] * 1.5, (Math.random() - 0.5) * 35);
      const nearestMatch = this.findNearestRandomStar(idealPos, usedStarIndices);
      let actualPos = nearestMatch ? idealPos.clone().lerp(nearestMatch.star.pos, 0.12) : idealPos;
      if (nearestMatch) usedStarIndices.add(nearestMatch.index);

      nodes.push({
        id: idx,
        position: actualPos,
        name: `Node ${idx + 1} (${this.lastTitle})`,
        catalogId: `CHAR-${Math.floor(1000 + Math.random() * 9000)}`,
        spectral: 'A0V (White Star)',
        magnitude: '+1.8',
        distance: '320 Light Years',
        coordinates: 'Nebula Sector'
      });
      edges.push({ start: idx, end: (idx + 1) % pts.length });
    });

    await this.animateStarNetwork(nodes, edges, onProgress, onComplete);
  }

  /**
   * MODE 3B: Custom Image-to-Star Constellation Rasterizer!
   * Converts any user uploaded picture into a star constellation web.
   */
  async createCustomImageConstellation(imageElement, onProgress, onComplete) {
    this.clear();
    this.isForming = true;
    this.lastTitle = 'CUSTOM ARTIFACT';

    // 1. Offscreen Canvas for Edge & Contrast Detection
    const sampleSize = 80;
    const canvas = document.createElement('canvas');
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0, sampleSize, sampleSize);

    const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imgData.data;

    // Detect high-contrast/edge points
    const rawPoints = [];
    for (let y = 1; y < sampleSize - 1; y += 2) {
      for (let x = 1; x < sampleSize - 1; x += 2) {
        const idx = (y * sampleSize + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const alpha = data[idx + 3];

        // Sample if not completely dark and has opacity
        if (alpha > 40 && brightness > 50) {
          rawPoints.push({
            x: (x - sampleSize / 2) * 6.5,
            y: -(y - sampleSize / 2) * 6.5,
            weight: brightness
          });
        }
      }
    }

    // Downsample to clean constellation nodes (~60-90 stars)
    const maxStars = Math.min(rawPoints.length, 75);
    const step = Math.max(1, Math.floor(rawPoints.length / maxStars));
    const selectedPoints = [];
    for (let i = 0; i < rawPoints.length && selectedPoints.length < maxStars; i += step) {
      selectedPoints.push(rawPoints[i]);
    }

    const nodes = [];
    const edges = [];
    const usedStarIndices = new Set();

    selectedPoints.forEach((pt, idx) => {
      const idealPos = new THREE.Vector3(pt.x, pt.y, (Math.random() - 0.5) * 45);
      const nearestMatch = this.findNearestRandomStar(idealPos, usedStarIndices);
      let actualPos = nearestMatch ? idealPos.clone().lerp(nearestMatch.star.pos, 0.15) : idealPos;
      if (nearestMatch) usedStarIndices.add(nearestMatch.index);

      nodes.push({
        id: idx,
        position: actualPos,
        name: `Star ${idx + 1} (Custom)`,
        catalogId: `IMG-${Math.floor(1000 + Math.random() * 9000)}`,
        spectral: 'B2Ia (Blue Supergiant)',
        magnitude: '+1.2',
        distance: '510 Light Years',
        coordinates: 'Deep Cosmos Image'
      });
    });

    // Generate Delaunay-style nearest-neighbor starlight webbing
    for (let i = 0; i < nodes.length; i++) {
      let nearest = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < 75) {
          nearest.push({ idx: j, dist: dist });
        }
      }
      nearest.sort((a, b) => a.dist - b.dist);
      // Connect to top 2 closest stars
      nearest.slice(0, 2).forEach((n) => {
        if (!edges.some((e) => (e.start === i && e.end === n.idx) || (e.start === n.idx && e.end === i))) {
          edges.push({ start: i, end: n.idx });
        }
      });
    }

    await this.animateStarNetwork(nodes, edges, onProgress, onComplete);
  }

  /**
   * Unified Star Gathering & Laser Connecting Animator
   */
  async animateStarNetwork(nodes, edges, onProgress, onComplete) {
    this.activeStars = nodes;
    const palette = this.colorPalettes[this.currentTheme];

    // 1. Ignite Stars with Targeting Reticles
    for (let i = 0; i < nodes.length; i++) {
      const star = nodes[i];
      const starGroup = new THREE.Group();
      starGroup.position.copy(star.position);

      const reticleMat = new THREE.SpriteMaterial({
        map: this.targetReticleTexture,
        color: palette.hex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95
      });
      const reticle = new THREE.Sprite(reticleMat);
      reticle.scale.set(55, 55, 1);
      starGroup.add(reticle);

      const coreMat = new THREE.SpriteMaterial({
        map: this.coreTexture,
        color: palette.core,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.0
      });
      const core = new THREE.Sprite(coreMat);
      core.scale.set(16, 16, 1);
      core.userData = { isConstellationStar: true, ...star };
      starGroup.add(core);

      const flareMat = new THREE.SpriteMaterial({
        map: this.flareTexture,
        color: palette.hex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.0
      });
      const flare = new THREE.Sprite(flareMat);
      flare.scale.set(40, 40, 1);
      flare.userData = { isConstellationStar: true, ...star };
      starGroup.add(flare);

      this.activeGlowMeshes.push(flare);
      this.universe.constellationGroup.add(starGroup);

      if (window.cosmicAudio) {
        window.cosmicAudio.playTargetLockSound(i);
        window.cosmicAudio.playStarChime(i);
      }

      this.animateTargetLockAndIgnition(reticle, core, flare);

      if (onProgress) {
        onProgress({
          type: 'star',
          current: i + 1,
          total: nodes.length,
          name: star.name
        });
      }

      await this.sleep(nodes.length > 50 ? 15 : 35);
    }

    await this.sleep(120);

    // 2. Beaming Starlight Laser Connections
    for (let j = 0; j < edges.length; j++) {
      const edge = edges[j];
      const p1 = nodes[edge.start].position;
      const p2 = nodes[edge.end].position;

      await this.animateStarlightBeam(p1, p2, palette.hex, j);

      if (window.cosmicAudio) {
        window.cosmicAudio.playStarChime(j + 2);
      }

      if (onProgress) {
        onProgress({
          type: 'line',
          current: j + 1,
          total: edges.length
        });
      }
    }

    // 3. Render In-Sky Star Labels & Constellation Title (Starry Night style)
    if (this.showLabels && this.labelGroup) {
      // A. Constellation Title Header (Delphinus / Sagitta / Aquila style)
      let titleY = 160;
      let titleX = 0;
      if (this.layoutMode === 'circle') {
        titleY = 0; // Centered in the celestial ring
      } else {
        const maxY = nodes.reduce((max, n) => Math.max(max, n.position.y), -Infinity);
        titleY = maxY + 45;
      }
      const titleSprite = this.createInSkyTextSprite(this.lastTitle, true);
      titleSprite.position.set(titleX, titleY, 15);
      this.labelGroup.add(titleSprite);

      // B. Named Star Designation Labels (Sualocin, Rotanev, Altair, Tarazed style)
      const celestialStarCatalog = ['Altair', 'Tarazed', 'Sualocin', 'Rotanev', 'Alshain', 'Vega', 'Deneb', 'Rigel', 'Sirius', 'Alpheratz', 'Mirach', 'Bellatrix'];
      const labelStep = Math.max(1, Math.floor(nodes.length / 8));
      for (let s = 0; s < nodes.length; s += labelStep) {
        const node = nodes[s];
        const sName = celestialStarCatalog[s % celestialStarCatalog.length];
        const starSprite = this.createInSkyTextSprite(sName, false);
        starSprite.position.set(node.position.x + 20, node.position.y + 10, node.position.z + 5);
        this.labelGroup.add(starSprite);
      }
    }

    this.isForming = false;
    if (window.cosmicAudio) {
      window.cosmicAudio.playConstellationCompleteChord();
    }

    if (onComplete) {
      onComplete({
        name: this.lastTitle,
        starCount: nodes.length,
        lineCount: edges.length
      });
    }
  }

  createInSkyTextSprite(text, isTitle = false) {
    const canvas = document.createElement('canvas');
    canvas.width = isTitle ? 512 : 256;
    canvas.height = isTitle ? 128 : 64;
    const ctx = canvas.getContext('2d');

    if (isTitle) {
      ctx.font = '700 36px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#4bf0ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
    } else {
      ctx.font = '500 20px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(215, 235, 255, 0.95)';
      ctx.fillText(text, 10, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    const aspect = canvas.width / canvas.height;
    const baseH = isTitle ? 42 : 18;
    sprite.scale.set(baseH * aspect, baseH, 1);
    return sprite;
  }

  toggleLabels(show) {
    this.showLabels = show !== undefined ? show : !this.showLabels;
    if (this.labelGroup) {
      this.labelGroup.visible = this.showLabels;
    }
    return this.showLabels;
  }

  animateTargetLockAndIgnition(reticle, core, flare) {
    const startTime = performance.now();
    const duration = 500;
    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1.0);
      const ease = 1 - Math.pow(1 - t, 3);

      const rScale = 55 * (1.7 - ease * 0.7);
      reticle.scale.set(rScale, rScale, 1);
      reticle.material.opacity = Math.max(0, 1.0 - ease);

      core.material.opacity = ease * 0.95;
      flare.material.opacity = ease * 0.85;

      const fScale = 1.0 + Math.sin(t * Math.PI) * 0.5;
      core.scale.set(16 * fScale, 16 * fScale, 1);
      flare.scale.set(40 * fScale, 40 * fScale, 1);

      if (t < 1.0) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  animateStarlightBeam(startPos, endPos, colorHex, edgeIdx) {
    return new Promise((resolve) => {
      const geom = new THREE.BufferGeometry();
      const posArray = new Float32Array([
        startPos.x, startPos.y, startPos.z,
        startPos.x, startPos.y, startPos.z
      ]);
      geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        linewidth: 2.5
      });

      const line = new THREE.Line(geom, mat);
      this.universe.constellationGroup.add(line);
      this.activeLines.push(line);

      const pulseGeom = new THREE.BufferGeometry();
      pulseGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([startPos.x, startPos.y, startPos.z]), 3));
      const pulseMat = new THREE.PointsMaterial({
        size: 15,
        map: this.flareTexture,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const pulsePoint = new THREE.Points(pulseGeom, pulseMat);
      this.universe.constellationGroup.add(pulsePoint);

      const startTime = performance.now();
      const duration = 160;

      const animateBeam = (now) => {
        const t = Math.min((now - startTime) / duration, 1.0);
        const ease = t * (2 - t);

        const currentX = startPos.x + (endPos.x - startPos.x) * ease;
        const currentY = startPos.y + (endPos.y - startPos.y) * ease;
        const currentZ = startPos.z + (endPos.z - startPos.z) * ease;

        posArray[3] = currentX; posArray[4] = currentY; posArray[5] = currentZ;
        geom.attributes.position.needsUpdate = true;

        pulseGeom.attributes.position.array[0] = currentX;
        pulseGeom.attributes.position.array[1] = currentY;
        pulseGeom.attributes.position.array[2] = currentZ;
        pulseGeom.attributes.position.needsUpdate = true;

        if (t < 1.0) {
          requestAnimationFrame(animateBeam);
        } else {
          this.universe.constellationGroup.remove(pulsePoint);
          pulseGeom.dispose();
          pulseMat.dispose();
          resolve();
        }
      };
      requestAnimationFrame(animateBeam);
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

window.ConstellationManager = ConstellationManager;
