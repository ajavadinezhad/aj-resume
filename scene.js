(async function buildLab() {
  const lab = document.querySelector('.lab');
  const stage = lab.querySelector('.lab-stage');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  let T;
  let renderer;
  try {
    T = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return;
  }

  const raycaster = new T.Raycaster();
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-5, 5, 5, -5, 0.1, 60);
  const rig = new T.Group();
  scene.add(rig, new T.HemisphereLight(0xfff0cd, 0x566453, 2.3));
  const sunlight = new T.DirectionalLight(0xffead0, 2.8);
  sunlight.position.set(-4, 9, 5);
  scene.add(sunlight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);

  const materials = new Map();
  function model(parent, geometry, color, x, y, z) {
    if (!materials.has(color)) {
      materials.set(color, new T.MeshStandardMaterial({ color, roughness: 0.72 }));
    }
    const part = new T.Mesh(geometry, materials.get(color));
    part.position.set(x, y, z);
    part.castShadow = part.receiveShadow = true;
    parent.add(part);
    return part;
  }

  function box(parent, w, h, d, color, x, y, z) {
    return model(parent, new T.BoxGeometry(w, h, d), color, x, y, z);
  }

  const green = 0x6d8e53;
  const gold = 0xe5b067;
  const lilac = 0xaaa6e0;
  const peach = 0xef8e68;
  box(rig, 7.3, .45, 5.8, 0x3b5239, 0, -.39, 0);
  box(rig, 7.15, .2, 5.65, green, 0, -.11, 0);
  const grid = new T.GridHelper(5.6, 16, 0x94a37b, 0x80946b);
  grid.scale.x = 1.27;
  grid.position.y = .004;
  rig.add(grid);

  const quantum = new T.Group();
  quantum.position.set(-1.86, 0, -.65);
  rig.add(quantum);
  box(quantum, 1.8, .23, 1.8, 0x414c35, 0, .11, 0);
  model(quantum, new T.CylinderGeometry(.66, .77, .14, 48), gold, 0, .3, 0);
  for (let level = 0; level < 5; level++) {
    const radius = .34 + level * .074;
    model(quantum, new T.CylinderGeometry(radius, radius, .085, 40), gold, 0, .49 + level * .24, 0);
  }
  for (let rod = 0; rod < 6; rod++) {
    const angle = rod * Math.PI / 3;
    model(quantum, new T.CylinderGeometry(.026, .026, 1.18, 8),
      0xf4d9a3, .47 * Math.cos(angle), .92, .47 * Math.sin(angle));
  }
  const orbit = model(quantum, new T.TorusGeometry(.87, .027, 8, 60), 0xffdc93, 0, 1.28, 0);
  orbit.rotation.x = 1.04;

  const software = new T.Group();
  software.userData.section = 'software';
  rig.add(software);
  quantum.userData.section = 'research';
  const publications = new T.Group();
  publications.userData.section = 'papers';
  rig.add(publications);

  const serverLights = [];
  for (let rack = 0; rack < 3; rack++) {
    const x = 1.08 + rack * .6;
    box(software, .49, 1.6, .83, lilac, x, .8, -.95);
    box(software, .38, 1.44, .045, 0x494969, x, .8, -.52);
    for (let tray = 0; tray < 5; tray++) {
      box(software, .28, .12, .045, 0x7a78a2, x, .28 + tray * .25, -.49);
      const led = box(software, .04, .04, .04, 0xc7f99b, x + .085, .28 + tray * .25, -.455);
      led.material = led.material.clone();
      serverLights.push(led);
    }
  }

  for (let book = 0; book < 3; book++) {
    const y = .08 + book * .17;
    const cover = book === 1 ? 0xd5d496 : peach;
    const group = new T.Group();
    group.position.set(.7, y, 1.05);
    group.rotation.y = -.18 + book * .19;
    publications.add(group);
    box(group, 1.44, .13, .99, 0xf9e7bc, 0, 0, 0);
    for (const side of [-1, 1]) box(group, 1.51, .026, 1.05, cover, 0, side * .074, 0);
    box(group, .08, .16, 1.05, cover, -.73, 0, 0);
  }

  // Mounting pads sit outside the component footprints.
  for (const [x, z] of [[-3.12, -2.35], [3.12, -2.35], [-3.12, 2.35], [3.12, 2.35]]) {
    model(rig, new T.CylinderGeometry(.11, .11, .035, 20), 0xd3c794, x, .025, z);
  }

  // A shared bus crosses the clear middle lane. Branches end at component edges.
  const routes = [
    [[-2.5, .25], [2.75, .25]],
    [[-1.86, -.65 + .9], [-1.86, .25]],
    [[1.68, -.95 + .415], [1.68, .25]],
    [[-.8, .25], [-.8, .9 - .44]],
    [[.7, .25], [.7, 1.05 - .55]],
    [[-2.5, .25], [-2.5, 1.9 - .44]],
    [[2.5, .25], [2.5, 1.9 - .44]],
    [[2.75, .25], [2.75, -2.05 + .44]]
  ];
  for (const route of routes) {
    const [[x1, z1], [x2, z2]] = route;
    box(rig, Math.max(.055, Math.abs(x2 - x1)), .014,
      Math.max(.055, Math.abs(z2 - z1)), 0xb6cb87,
      (x1 + x2) / 2, .025, (z1 + z2) / 2);
  }

  const packetGeometry = new T.SphereGeometry(.045, 8, 6);
  const packetMaterial = new T.MeshBasicMaterial({ color: 0xeaffae });
  const packets = [];
  for (const [index, route] of routes.entries()) {
    const [[x1, z1], [x2, z2]] = route;
    const length = Math.hypot(x2 - x1, z2 - z1);
    if (length < .01) continue;
    for (let lane = 0; lane < 2; lane++) {
      const packet = new T.Mesh(packetGeometry, packetMaterial);
      rig.add(packet);
      packets.push({ packet, x1, z1, x2, z2, length, offset: lane * .5 + index * .13 });
    }
  }

  const coreMaterial = new T.MeshStandardMaterial({
    color: 0xd8ffd1, emissive: 0x79d89b, emissiveIntensity: .7, roughness: .3
  });
  const core = new T.Mesh(new T.IcosahedronGeometry(.16, 1), coreMaterial);
  core.position.set(0, 1.64, 0);
  quantum.add(core);

  const circuitObjects = [quantum, software, publications];
  const modules = [
    { id: 'about', x: -2.5, z: 1.9, color: 0xa6d9c0 },
    { id: 'education', x: -.8, z: .9, color: 0xd9c394 },
    { id: 'skills', x: 2.75, z: -2.05, color: 0x92b7e4 },
    { id: 'contact', x: 2.5, z: 1.9, color: 0xedb4ba }
  ];
  for (const item of modules) {
    const chip = new T.Group();
    chip.position.set(item.x, 0, item.z);
    chip.userData.section = item.id;
    box(chip, .82, .15, .7, 0x34493c, 0, .13, 0);
    box(chip, .59, .22, .47, item.color, 0, .31, 0);
    for (const x of [-.27, 0, .27]) {
      for (const side of [-1, 1]) box(chip, .07, .06, .18, 0xe8d9a1, x, .13, side * .4);
    }
    rig.add(chip);
    circuitObjects.push(chip);
  }

  const stations = [
    ...modules.map(item => ({ link: lab.querySelector('.' + item.id + '-pin'), point: new T.Vector3(item.x, .7, item.z) })),
    { link: lab.querySelector('.research-pin'), point: new T.Vector3(-2.1, 1.92, -.72) },
    { link: lab.querySelector('.software-pin'), point: new T.Vector3(1.9, 1.88, -.96) },
    { link: lab.querySelector('.papers-pin'), point: new T.Vector3(.7, .85, 1.05) }
  ];
  const hoverRings = new Map();
  for (const object of circuitObjects) {
    const material = new T.MeshBasicMaterial({ color: 0xc9ffa5, transparent: true, opacity: 0, depthWrite: false });
    const ring = new T.Mesh(new T.TorusGeometry(.6, .025, 8, 48), material);
    ring.rotation.x = -Math.PI / 2;
    if (object === software) ring.position.set(1.68, .07, -.95);
    else if (object === publications) ring.position.set(.7, .07, 1.05);
    else ring.position.copy(object.position).setY(.07);
    rig.add(ring);
    hoverRings.set(object.userData.section, ring);
  }
  let hovered = null;
  let pointerInside = false;
  const pointer = new T.Vector2();
  const projected = new T.Vector3();
  let frame = 0;
  let visible = true;
  let width = 0;
  let height = 0;
  let targetRotation = 0;
  let touchYaw = 0;
  let touchTilt = 0;
  let zoom = 1;
  let suppressClickUntil = 0;
  let gestureMoved = false;
  const touches = new Map();
  let gestureStart = null;

  function beginGesture() {
    const points = [...touches.values()];
    gestureStart = {
      points: points.map(point => ({ ...point })),
      yaw: touchYaw, tilt: touchTilt, zoom,
      distance: points.length > 1 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 0
    };
  }
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    if (!touches.size) gestureMoved = false;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touches.size > 1) gestureMoved = true;
    beginGesture();
  });
  stage.addEventListener('pointermove', event => {
    if (!touches.has(event.pointerId)) return;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...touches.values()];
    if (points.length > 1 && gestureStart.distance > 0) {
      const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      zoom = Math.max(.75, Math.min(2.4, gestureStart.zoom * distance / gestureStart.distance));
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      gestureMoved = true;
    } else if (points.length === 1) {
      const dx = points[0].x - gestureStart.points[0].x;
      const dy = points[0].y - gestureStart.points[0].y;
      if (Math.hypot(dx, dy) > 8) gestureMoved = true;
      touchYaw = gestureStart.yaw + dx * .009;
      touchTilt = Math.max(-.45, Math.min(.45, gestureStart.tilt + dy * .005));
    }
    queueDraw();
  });
  function endGesture(event) {
    if (!touches.delete(event.pointerId)) return;
    if (gestureMoved) suppressClickUntil = performance.now() + 450;
    beginGesture();
    queueDraw();
  }
  // Window-level tracking keeps a drag continuous when a finger crosses a label.
  window.addEventListener('pointerup', endGesture);
  window.addEventListener('pointercancel', endGesture);
  stage.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  document.querySelector('.reset-view').addEventListener('click', () => {
    touchYaw = touchTilt = 0;
    zoom = camera.zoom = 1;
    camera.updateProjectionMatrix();
    queueDraw();
  });
  document.querySelector('.theme-switch').addEventListener('click', () => {
    sunlight.intensity = document.body.classList.contains('daylight') ? 3.6 : 2.8;
    queueDraw();
  });
  stage.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    const bounds = stage.getBoundingClientRect();
    const pick = new T.Vector2(2 * (event.clientX - bounds.left) / bounds.width - 1,
      1 - 2 * (event.clientY - bounds.top) / bounds.height);
    raycaster.setFromCamera(pick, camera);
    const hit = raycaster.intersectObjects(circuitObjects, true)[0];
    if (!hit) return;
    let object = hit.object;
    while (object && !object.userData.section) object = object.parent;
    if (object) document.querySelector('.stations a[href="#' + object.userData.section + '"]').click();
  });

  function draw(time) {
    frame = 0;
    if (!width || !height) return;
    const move = !motion.matches;
    targetRotation = touchYaw + (move ? pointer.x * .19 : 0);
    rig.rotation.y = touches.size || motion.matches ? targetRotation : rig.rotation.y + (targetRotation - rig.rotation.y) * .15;
    const targetTilt = touchTilt + (move ? pointer.y * .1 : 0);
    rig.rotation.x = touches.size || motion.matches ? targetTilt : rig.rotation.x + (targetTilt - rig.rotation.x) * .15;
    orbit.rotation.z = move ? time * .00047 : 0;
    const seconds = move ? time / 1000 : 0;
    for (const { packet, x1, z1, x2, z2, length, offset } of packets) {
      const progress = (seconds * .65 / length + offset) % 1;
      packet.position.set(x1 + (x2 - x1) * progress, .085, z1 + (z2 - z1) * progress);
    }
    for (const [index, led] of serverLights.entries()) {
      const pulse = move ? .3 + .7 * Math.pow((Math.sin(seconds * 2.4 + index * 1.9) + 1) / 2, 3) : .6;
      led.material.emissive.setHex(0x8fe599);
      led.material.emissiveIntensity = pulse;
    }
    core.rotation.y = seconds * .65;
    core.position.y = 1.64 + (move ? Math.sin(seconds * 1.6) * .045 : 0);
    coreMaterial.emissiveIntensity = .6 + (move ? (Math.sin(seconds * 1.7) + 1) * .3 : 0);

    rig.updateMatrixWorld(true);
    if (pointerInside) {
      raycaster.setFromCamera(new T.Vector2(pointer.x, -pointer.y), camera);
      const hit = raycaster.intersectObjects(circuitObjects, true)[0];
      let object = hit?.object;
      while (object && !object.userData.section) object = object.parent;
      hovered = object?.userData.section ?? null;
    } else hovered = null;
    stage.style.cursor = hovered ? 'pointer' : '';
    for (const [id, ring] of hoverRings) {
      ring.material.opacity = id === hovered ? .75 : 0;
    }
    renderer.render(scene, camera);

    const labels = stations.map(({ link, point }) => {
      projected.copy(point).applyMatrix4(rig.matrixWorld).project(camera);
      const pad = link.offsetWidth / 2 + 8;
      return {
        link, width: link.offsetWidth, height: link.offsetHeight,
        x: Math.max(pad, Math.min(width - pad, (projected.x + 1) * width / 2)),
        y: Math.max(28, Math.min(height - 28, (1 - projected.y) * height / 2))
      };
    });
    if (width <= 650) {
      // Separate projected touch targets while keeping them near their components.
      labels.sort((a, b) => a.y - b.y);
      for (let pass = 0; pass < 8; pass++) {
        for (let i = 0; i < labels.length; i++) {
          for (let j = i + 1; j < labels.length; j++) {
            const a = labels[i];
            const b = labels[j];
            const gap = (a.height + b.height) / 2 + 6;
            if (Math.abs(a.x - b.x) < (a.width + b.width) / 2 + 6 && b.y - a.y < gap) {
              const shift = (gap - (b.y - a.y)) / 2;
              a.y = Math.max(26, a.y - shift);
              b.y = Math.min(height - 26, b.y + shift);
            }
          }
        }
      }
    }
    for (const { link, x, y } of labels) {
      link.style.setProperty('--x', x + 'px');
      link.style.setProperty('--y', y + 'px');
    }
    lab.classList.add('is-live');
    if (visible && move) queueDraw();
  }

  function queueDraw() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function resize() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const phone = width <= 650;
    const span = phone ? Math.max(4.2, 3.8 / aspect) : Math.max(4.6, 4.9 / aspect);
    camera.left = -span * aspect;
    camera.right = span * aspect;
    camera.top = span;
    camera.bottom = -span;
    if (phone) camera.position.set(10, 12, 2);
    else camera.position.set(6.6, 8.7, 10.5);
    camera.lookAt(0, .42, 0);
    camera.updateMatrixWorld();
    const right = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const shift = width > 800 ? span * aspect * .29 : 0;
    camera.position.addScaledVector(right, -shift);
    camera.lookAt(new T.Vector3(0, .42, 0).addScaledVector(right, -shift));
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width <= 650 ? 1.5 : 2));
    renderer.setSize(width, height, false);
    queueDraw();
  }

  stage.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointerInside = true;
    const rect = stage.getBoundingClientRect();
    if (rect.width && rect.height) {
      pointer.set(2 * (event.clientX - rect.left) / rect.width - 1,
        2 * (event.clientY - rect.top) / rect.height - 1);
    }
    queueDraw();
  });
  stage.addEventListener('pointerleave', () => {
    pointerInside = false;
    pointer.set(0, 0);
    queueDraw();
  });
  motion.addEventListener('change', queueDraw);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) queueDraw();
  }).observe(stage);
  new ResizeObserver(resize).observe(stage);

  lab.querySelector('.lab-canvas').append(renderer.domElement);
  resize();
})();
