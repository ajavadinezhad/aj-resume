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

  for (let rack = 0; rack < 3; rack++) {
    const x = 1.08 + rack * .6;
    box(software, .49, 1.6, .83, lilac, x, .8, -.95);
    box(software, .38, 1.44, .045, 0x494969, x, .8, -.52);
    for (let tray = 0; tray < 5; tray++) {
      box(software, .28, .12, .045, 0x7a78a2, x, .28 + tray * .25, -.49);
      box(software, .04, .04, .04, 0xc7f99b, x + .085, .28 + tray * .25, -.455);
    }
  }

  for (let book = 0; book < 3; book++) {
    const y = .08 + book * .17;
    const cover = book === 1 ? 0xd5d496 : peach;
    const group = new T.Group();
    group.position.set(.7, y, 1.54);
    group.rotation.y = -.18 + book * .19;
    publications.add(group);
    box(group, 1.44, .13, .99, 0xf9e7bc, 0, 0, 0);
    for (const side of [-1, 1]) box(group, 1.51, .026, 1.05, cover, 0, side * .074, 0);
    box(group, .08, .16, 1.05, cover, -.73, 0, 0);
  }

  for (const [x, z] of [[-2.7, 1.95], [2.8, 1.92], [-2.8, -1.98], [2.8, -2]]) {
    box(rig, .6, .13, .6, 0x475c3f, x, .065, z);
    box(rig, .36, .2, .36, 0x35493a, x, .2, z);
    box(rig, .24, .025, .24, 0xc4d596, x, .31, z);
  }
  for (const [x, z, width, depth] of [[-.55, -.65, 1.1, .07], [.18, .46, .07, 2.24], [1.2, 1.57, 2.05, .07], [2.23, .62, .07, 1.95], [-1.65, 1.06, 2.55, .07]]) {
    box(rig, width, .015, depth, 0xb6cb87, x, .028, z);
  }

  const circuitObjects = [quantum, software, publications];
  const modules = [
    { id: 'about', x: -2.5, z: 1.65, color: 0xa6d9c0 },
    { id: 'education', x: -.6, z: -1.95, color: 0xd9c394 },
    { id: 'skills', x: 2.3, z: 1.6, color: 0x92b7e4 },
    { id: 'contact', x: -1.1, z: 1.7, color: 0xedb4ba }
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
    { link: lab.querySelector('.papers-pin'), point: new T.Vector3(.85, .75, 1.75) }
  ];
  const pointer = new T.Vector2();
  const projected = new T.Vector3();
  let frame = 0;
  let visible = true;
  let width = 0;
  let height = 0;
  let targetRotation = 0;
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
    targetRotation = move ? pointer.x * .19 : 0;
    rig.rotation.y += (targetRotation - rig.rotation.y) * .055;
    rig.rotation.x += ((move ? pointer.y * .1 : 0) - rig.rotation.x) * .055;
    orbit.rotation.z = move ? time * .00047 : 0;
    renderer.render(scene, camera);

    for (const { link, point } of stations) {
      projected.copy(point).applyMatrix4(rig.matrixWorld).project(camera);
      const x = (projected.x + 1) * width / 2;
      const y = (1 - projected.y) * height / 2;
      const pad = link.offsetWidth / 2 + 6;
      link.style.setProperty('--x', Math.max(pad, Math.min(width - pad, x)) + 'px');
      link.style.setProperty('--y', Math.max(14, Math.min(height - 14, y)) + 'px');
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
    const span = Math.max(4.6, 4.9 / aspect);
    camera.left = -span * aspect;
    camera.right = span * aspect;
    camera.top = span;
    camera.bottom = -span;
    camera.position.set(6.6, 8.7, 10.5);
    camera.lookAt(0, .42, 0);
    camera.updateMatrixWorld();
    const right = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const shift = width > 800 ? span * aspect * .29 : 0;
    camera.position.addScaledVector(right, -shift);
    camera.lookAt(new T.Vector3(0, .42, 0).addScaledVector(right, -shift));
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    queueDraw();
  }

  stage.addEventListener('pointermove', event => {
    const rect = stage.getBoundingClientRect();
    if (rect.width && rect.height) {
      pointer.set(2 * (event.clientX - rect.left) / rect.width - 1,
        2 * (event.clientY - rect.top) / rect.height - 1);
    }
  });
  stage.addEventListener('pointerleave', () => pointer.set(0, 0));
  motion.addEventListener('change', queueDraw);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) queueDraw();
  }).observe(stage);
  new ResizeObserver(resize).observe(stage);

  lab.querySelector('.lab-canvas').append(renderer.domElement);
  resize();
})();
