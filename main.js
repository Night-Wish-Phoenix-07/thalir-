import * as THREE from "three";

try {
  // ---------- Scene, camera, renderer ----------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1030);
  scene.fog = new THREE.Fog(0x0b1030, 25, 60);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 5, 14);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // ---------- Lights ----------
  scene.add(new THREE.AmbientLight(0x6670b0, 0.7));

  const moon = new THREE.DirectionalLight(0xffe2b0, 1.1);
  moon.position.set(8, 14, 10);
  moon.castShadow = true;
  moon.shadow.camera.left = -20;
  moon.shadow.camera.right = 20;
  moon.shadow.camera.top = 20;
  moon.shadow.camera.bottom = -20;
  scene.add(moon);

  // ---------- Ground (wooden desk) ----------
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(40, 1, 24),
    new THREE.MeshStandardMaterial({ color: 0x8a5a33 })
  );
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------- Helper: block building with windows ----------
  function makeBuilding(x, z, w, h, d) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: 0xe8741f })
    );
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const winGeo = new THREE.BoxGeometry(0.5, 0.6, 0.05);
    for (let row = 0; row < Math.floor(h / 1.2); row++) {
      for (let col = 0; col < Math.floor(w / 1.2); col++) {
        const lit = Math.random() > 0.4;
        const win = new THREE.Mesh(
          winGeo,
          new THREE.MeshStandardMaterial({
            color: lit ? 0xffd27a : 0x3a2418,
            emissive: lit ? 0xffa933 : 0x000000,
            emissiveIntensity: lit ? 0.8 : 0,
          })
        );
        win.position.set(
          -w / 2 + 0.8 + col * 1.2,
          0.9 + row * 1.2,
          d / 2 + 0.03
        );
        group.add(win);
      }
    }

    group.position.set(x, 0, z);
    scene.add(group);
  }

  makeBuilding(-9, -6, 4, 6, 3);
  makeBuilding(-3, -7, 4, 8, 3);
  makeBuilding(3, -6, 4, 5, 3);
  makeBuilding(9, -7, 4, 7, 3);

  // ---------- Block character ----------
  function makeCharacter(x, z, shirtColor) {
    const person = new THREE.Group();

    const mat = (c) => new THREE.MeshStandardMaterial({ color: c });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.8), mat(shirtColor));
    body.position.y = 1.4;
    body.castShadow = true;
    person.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat(0xd9a066));
    head.position.y = 2.6;
    head.castShadow = true;
    person.add(head);

    const eyeMat = mat(0x111111);
    const eyeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.05);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.22, 2.7, 0.51);
    eyeR.position.set(0.22, 2.7, 0.51);
    person.add(eyeL, eyeR);

    // Legs hang from a pivot at the hip so they can swing when walking
    const legGeo = new THREE.BoxGeometry(0.45, 0.7, 0.5);
    const legMat = mat(0x2b3a67);

    const legL = new THREE.Group();
    const legLMesh = new THREE.Mesh(legGeo, legMat);
    legLMesh.position.y = -0.35;
    legLMesh.castShadow = true;
    legL.add(legLMesh);
    legL.position.set(-0.32, 0.7, 0);

    const legR = new THREE.Group();
    const legRMesh = new THREE.Mesh(legGeo, legMat);
    legRMesh.position.y = -0.35;
    legRMesh.castShadow = true;
    legR.add(legRMesh);
    legR.position.set(0.32, 0.7, 0);

    person.add(legL, legR);
    person.userData.legL = legL;
    person.userData.legR = legR;

    person.position.set(x, 0, z);
    scene.add(person);
    return person;
  }

  const hero = makeCharacter(0, 2, 0x3a7bd5);

  // ---------- Stars ----------
  const starPositions = [];
  for (let i = 0; i < 300; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 120,
      10 + Math.random() * 40,
      -30 - Math.random() * 30
    );
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 })
  );
  scene.add(stars);

  // ---------- Controls hint ----------
  const hint = document.createElement("div");
  hint.textContent = "Move: W A S D or Arrow keys";
  hint.style.cssText =
    "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);" +
    "padding:6px 16px;background:rgba(0,0,0,0.5);color:#f1e3c1;" +
    "font-size:14px;border-radius:4px;z-index:10;";
  document.body.appendChild(hint);

  // ---------- Keyboard input ----------
  const keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code.startsWith("Arrow")) e.preventDefault(); // stop page scrolling
  });
  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  // ---------- Animation loop ----------
  const clock = new THREE.Clock();
  const SPEED = 6;
  const cameraTarget = new THREE.Vector3();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05); // cap so tab switching doesn't cause jumps
    const t = clock.elapsedTime;

    // Work out the direction from the keys
    let dx = 0;
    let dz = 0;
    if (keys["KeyW"] || keys["ArrowUp"]) dz -= 1;
    if (keys["KeyS"] || keys["ArrowDown"]) dz += 1;
    if (keys["KeyA"] || keys["ArrowLeft"]) dx -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) dx += 1;

    const moving = dx !== 0 || dz !== 0;

    if (moving) {
      // Same speed in every direction, including diagonals
      const len = Math.hypot(dx, dz);
      dx /= len;
      dz /= len;

      hero.position.x += dx * SPEED * dt;
      hero.position.z += dz * SPEED * dt;

      // Stay on the desk and in front of the buildings
      hero.position.x = THREE.MathUtils.clamp(hero.position.x, -18, 18);
      hero.position.z = THREE.MathUtils.clamp(hero.position.z, -3.5, 10);

      // Turn smoothly to face the walking direction
      const targetAngle = Math.atan2(dx, dz);
      let diff = targetAngle - hero.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest way round
      hero.rotation.y += diff * Math.min(1, dt * 12);

      // Walking animation: legs swing, body bobs
      const swing = Math.sin(t * 12) * 0.7;
      hero.userData.legL.rotation.x = swing;
      hero.userData.legR.rotation.x = -swing;
      hero.position.y = Math.abs(Math.sin(t * 12)) * 0.12;
    } else {
      // Standing still: legs settle, gentle idle bob
      hero.userData.legL.rotation.x *= 0.8;
      hero.userData.legR.rotation.x *= 0.8;
      hero.position.y = Math.abs(Math.sin(t * 2)) * 0.05;
    }

    // Camera follows the hero smoothly
    cameraTarget.set(hero.position.x, 5, hero.position.z + 12);
    camera.position.lerp(cameraTarget, Math.min(1, dt * 3));
    camera.lookAt(hero.position.x, 1.8, hero.position.z);

    stars.rotation.y = t * 0.01;

    renderer.render(scene, camera);
  }
  animate();

  // ---------- Resize ----------
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
} catch (err) {
  console.error(err);
  document.getElementById("error").hidden = false;
}
