import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox, Sparkles, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ================= Palette (sampled from the reference) ================= */
const TONE = {
  light: '#f1defa',
  mid: '#e3c0f5',
  vivid: '#d2a2f0',
};
const INK = '#17151f';
const VIOLET = '#7c3aed';

/* ================= Rounded-rect shape helper ================= */
function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* ====================================================================
   Live website painted onto a canvas → texture for the phone screen.
   Scrolls slowly through the whole page (ping-pong), like the reference.
   ==================================================================== */
function createScreen() {
  const W = 460;
  const H = 976;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const rr = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const wrap = (text, x, y, maxW, lh, font, color) => {
    ctx.font = font;
    ctx.fillStyle = color;
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y);
        y += lh;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, y);
      y += lh;
    }
    return y;
  };

  const pill = (x, y, w, h, bg, label, fg = '#ffffff') => {
    rr(x, y, w, h, h / 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.font = '600 21px Inter, sans-serif';
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 7);
    ctx.textAlign = 'left';
  };

  const wave = (cx, cy, scale, alpha) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.lineWidth = 24 - i * 6;
      ctx.beginPath();
      ctx.moveTo(-160, i * 26);
      ctx.bezierCurveTo(-60, -70 + i * 26, 60, 80 + i * 20, 170, -20 + i * 22);
      ctx.stroke();
    }
    ctx.restore();
  };

  const coin = (cx, cy, r) => {
    const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.15, cx, cy, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.55, '#eceefb');
    g.addColorStop(1, '#cdd0ea');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 130, 220, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
    ctx.stroke();
  };

  /* ---- page sections (virtual coordinates) ---- */
  const paint = (sy) => {
    ctx.save();
    ctx.translate(0, -sy);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, 4200);

    /* --- section 1 · hero --- */
    wave(300, 300, 1.25, 0.16);
    coin(70, 470, 118);
    ctx.font = '700 64px "Space Grotesk", Inter, sans-serif';
    ctx.fillStyle = INK;
    ctx.fillText('FX Trading', 36, 620);
    wrap(
      'FX trading brokered with MetaQuotes offers its trading in the foreign exchange markets using platforms developed by MetaQuotes Software, such as MetaTrader 4 (MT4) and MetaTrader 5 (MT5).',
      36,
      668,
      W - 76,
      30,
      '400 20px Inter, sans-serif',
      '#6d6880'
    );
    pill(36, 810, 210, 60, '#211d33', 'Get started');

    /* --- section 2 · licensed --- */
    ctx.font = '700 42px "Space Grotesk", Inter, sans-serif';
    ctx.fillStyle = INK;
    ctx.fillText('Licensed FX Trading', 36, 1010);
    let y = wrap(
      'Licensed FX brokers offer MetaQuotes platform under an agreement with MetaQuotes Software Corp, adhering to regulatory standards, providing a secure and reliable trading environment.',
      36,
      1058,
      W - 76,
      29,
      '400 20px Inter, sans-serif',
      '#6d6880'
    );
    wrap(
      'Clients can trade confidently, knowing their FX trading services are backed by licensed software.',
      36,
      y + 10,
      W - 76,
      29,
      '400 20px Inter, sans-serif',
      '#6d6880'
    );

    /* --- section 3 · goals / menu --- */
    ctx.textAlign = 'center';
    ctx.font = '700 46px "Space Grotesk", Inter, sans-serif';
    ctx.fillStyle = INK;
    ctx.fillText('Your Goals', W / 2, 1400);
    ctx.fillText('Are Ours Too', W / 2, 1454);
    ctx.textAlign = 'left';
    pill((W - 190) / 2, 1490, 190, 54, '#211d33', "Let's start");
    ctx.textAlign = 'center';
    const nav = ['Home', 'Service', 'About', 'Industries Served', 'Contact'];
    nav.forEach((n, i) => {
      ctx.font = '500 34px Inter, sans-serif';
      ctx.fillStyle = '#3c3654';
      ctx.fillText(n, W / 2, 1630 + i * 62);
    });
    ctx.textAlign = 'left';

    /* --- section 4 · feature cards --- */
    const card = (cy, title, body) => {
      rr(30, cy, W - 60, 430, 28);
      ctx.fillStyle = '#f4f0fa';
      ctx.fill();
      ctx.font = '700 30px "Space Grotesk", Inter, sans-serif';
      ctx.fillStyle = INK;
      ctx.fillText(title, 58, cy + 62);
      wrap(body, 58, cy + 106, W - 128, 26, '400 17px Inter, sans-serif', '#6d6880');
    };
    card(
      1980,
      'Key Features of MetaQuotes Platforms',
      'MetaQuotes platforms provide real-time quotes, customizable charting tools, technical and fundamental analysis, and the ability to execute complex trades. MT4 and MT5 are the most popular apps for automated trading, available as apps for Android and Apple or for go-to scaling.'
    );
    card(
      2470,
      'Trading Strategies and Analysis',
      'Traders can use scalping, day trading, swing trading, and automated trading via Expert Advisors on MetaQuotes platforms.'
    );

    /* --- footer --- */
    rr(0, 3060, W, 150, 0);
    ctx.fillStyle = VIOLET;
    ctx.fill();
    ctx.font = '700 34px "Space Grotesk", Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('EXITO', 36, 3130);
    ctx.font = '400 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('Licensed FX trading infrastructure', 36, 3164);

    ctx.restore();

    /* --- fixed header (always on top) --- */
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, 96);
    ctx.fillStyle = 'rgba(23, 21, 31, 0.08)';
    ctx.fillRect(0, 95, W, 1);

    // logo star
    ctx.fillStyle = VIOLET;
    ctx.save();
    ctx.translate(44, 48);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i;
      ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13);
      ctx.lineTo(Math.cos(a + Math.PI / 4) * 5, Math.sin(a + Math.PI / 4) * 5);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.font = '800 27px "Space Grotesk", Inter, sans-serif';
    ctx.fillStyle = INK;
    ctx.fillText('EXITO', 66, 57);

    // hamburger
    ctx.fillStyle = INK;
    rr(W - 66, 40, 30, 3, 1.5);
    ctx.fill();
    rr(W - 66, 52, 30, 3, 1.5);
    ctx.fill();
  };

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const PAGE_H = 3210 - H; // scrollable range
  let lastY = -1;

  return {
    texture,
    update(t) {
      const p = 0.5 - 0.5 * Math.cos(t * 0.16); // slow ping-pong scroll
      const sy = Math.round(p * PAGE_H * 2) / 2;
      if (Math.abs(sy - lastY) > 0.4) {
        paint(sy);
        texture.needsUpdate = true;
        lastY = sy;
      }
    },
  };
}

/* ================= Phone (upright, screen = live site) ================= */
function Phone({ screen, ...props }) {
  const shape = useMemo(() => roundedRectShape(1.42, 2.9, 0.24), []);
  const screenShape = useMemo(() => roundedRectShape(1.28, 2.72, 0.18), []);
  const geo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.02,
        bevelSegments: 4,
        curveSegments: 20,
      }),
    [shape]
  );
  const screenGeo = useMemo(() => new THREE.ShapeGeometry(screenShape, 24), [screenShape]);

  return (
    <group {...props} rotation={[-0.1, -0.1, 0]}>
      {/* frame */}
      <mesh geometry={geo} position={[0, 0, -0.05]} castShadow>
        <meshPhysicalMaterial
          color="#f0f2f8"
          metalness={0.55}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.12}
          envMapIntensity={1.1}
        />
      </mesh>

      {/* live screen */}
      <mesh geometry={screenGeo} position={[0, 0, 0.078]}>
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>

      {/* dynamic island */}
      <mesh position={[0, 1.18, 0.082]}>
        <circleGeometry args={[0.05, 24]} />
        <meshBasicMaterial color="#10101a" toneMapped={false} />
      </mesh>

      {/* side buttons */}
      <mesh position={[0.725, 0.5, 0]}>
        <boxGeometry args={[0.03, 0.3, 0.07]} />
        <meshStandardMaterial color="#d6dae8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.725, 0.62, 0]}>
        <boxGeometry args={[0.03, 0.44, 0.07]} />
        <meshStandardMaterial color="#d6dae8" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ================= AirPods-style case, lid slightly open ================= */
function BudsCase(props) {
  const lid = useRef();
  const OPEN = -0.42;
  useFrame((state, delta) => {
    if (!lid.current) return;
    lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, OPEN, 3.5, delta);
    lid.current.position.y =
      0.17 + Math.sin(state.clock.elapsedTime * 1.2) * 0.004;
  });
  return (
    <group {...props}>
      {/* body */}
      <RoundedBox args={[0.95, 0.68, 0.88]} radius={0.28} smoothness={8} castShadow>
        <meshPhysicalMaterial
          color="#f6f2fb"
          metalness={0.05}
          roughness={0.3}
          clearcoat={0.7}
          clearcoatRoughness={0.28}
          envMapIntensity={0.8}
        />
      </RoundedBox>
      {/* inner tray */}
      <mesh position={[0, 0.3, 0.02]}>
        <boxGeometry args={[0.72, 0.05, 0.66]} />
        <meshBasicMaterial color="#b78bf0" toneMapped={false} />
      </mesh>
      {/* lid, hinged at back */}
      <group ref={lid} position={[0, 0.32, -0.44]} rotation={[0, 0, 0]}>
        <RoundedBox
          args={[0.95, 0.3, 0.88]}
          radius={0.14}
          smoothness={8}
          position={[0, 0.12, 0.44]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#faf7fd"
            metalness={0.05}
            roughness={0.28}
            clearcoat={0.75}
            envMapIntensity={0.8}
          />
        </RoundedBox>
      </group>
      {/* front LED */}
      <mesh position={[0, -0.08, 0.446]}>
        <capsuleGeometry args={[0.02, 0.07, 4, 12]} />
        <meshBasicMaterial color={VIOLET} toneMapped={false} />
      </mesh>
      {/* hinge slot */}
      <mesh position={[0, -0.06, 0.1]}>
        <boxGeometry args={[0.34, 0.05, 0.5]} />
        <meshPhysicalMaterial color="#d9cdec" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ================= Two loose earbuds ================= */
function Bud({ ...props }) {
  return (
    <group {...props}>
      <mesh castShadow>
        <sphereGeometry args={[0.13, 24, 20]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.02}
          roughness={0.26}
          clearcoat={0.8}
          envMapIntensity={0.9}
        />
      </mesh>
      <mesh position={[0, -0.2, 0.03]} rotation={[0.18, 0, 0]} castShadow>
        <capsuleGeometry args={[0.068, 0.26, 6, 16]} />
        <meshPhysicalMaterial
          color="#fbf9fe"
          metalness={0.02}
          roughness={0.28}
          clearcoat={0.7}
          envMapIntensity={0.9}
        />
      </mesh>
      {/* dark mic slot */}
      <mesh position={[0.045, -0.13, 0.085]} rotation={[0.4, 0.5, 0.2]}>
        <capsuleGeometry args={[0.016, 0.05, 4, 8]} />
        <meshBasicMaterial color="#17141f" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ================= Stylus ================= */
function Stylus(props) {
  return (
    <group {...props}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.062, 1.05, 6, 20]} />
        <meshPhysicalMaterial
          color="#f8f5fc"
          metalness={0.1}
          roughness={0.3}
          clearcoat={0.7}
          envMapIntensity={0.8}
        />
      </mesh>
      <mesh position={[-0.62, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.14, 20]} />
        <meshStandardMaterial color="#cfc9dd" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.56, 0, 0]}>
        <torusGeometry args={[0.062, 0.012, 10, 24]} />
        <meshStandardMaterial color="#b9a8d8" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

/* ================= Puffy cube ================= */
function PuffyCube({ size, position, rotation, tone = 'light' }) {
  const [w, h, d] = size;
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        args={[w, h, d]}
        radius={Math.min(0.13, h / 2.4)}
        smoothness={5}
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={TONE[tone]}
          metalness={0.03}
          roughness={0.55}
          clearcoat={0.25}
          clearcoatRoughness={0.6}
          envMapIntensity={0.18}
          sheen={0.1}
          sheenColor="#ffffff"
        />
      </RoundedBox>
    </group>
  );
}

/* ================= Wall of cubes + props ================= */
function CubeWall({ screen }) {
  const cubes = useMemo(
    () => [
      // back row
      { p: [-2.45, -2.5], s: [1.55, 1.55, 1.6], t: 'mid', r: 0.05 },
      { p: [-0.85, -2.55], s: [1.55, 1.62, 1.65], t: 'light', r: -0.04 },
      { p: [0.85, -2.5], s: [1.55, 1.5, 1.7], t: 'mid', r: 0.04 },
      { p: [2.5, -2.55], s: [1.6, 1.72, 1.6], t: 'vivid', r: -0.05 },
      // mid row
      { p: [-1.75, -0.9], s: [1.6, 1.4, 1.5], t: 'light', r: 0.03 },
      { p: [0.05, -0.85], s: [1.65, 1.18, 1.45], t: 'light', r: -0.02 },
      { p: [1.7, -0.9], s: [1.55, 1.3, 1.5], t: 'mid', r: 0.04 },
      // front row
      { p: [-2.4, 0.7], s: [1.5, 1.0, 1.5], t: 'light', r: 0.06 },
      { p: [-0.8, 0.75], s: [1.5, 0.92, 1.45], t: 'light', r: -0.03 },
      { p: [0.85, 0.7], s: [1.5, 0.85, 1.5], t: 'mid', r: 0.03 },
      { p: [2.45, 0.72], s: [1.5, 1.08, 1.5], t: 'vivid', r: -0.04 },
    ],
    []
  );

  return (
    <group position={[0, -1.05, 0]}>
      {cubes.map((c, i) => (
        <PuffyCube
          key={i}
          size={c.s}
          position={[c.p[0], 0, c.p[1]]}
          rotation={[0, c.r, 0]}
          tone={c.t}
        />
      ))}

      {/* phone standing on its plinth */}
      <Phone screen={screen} position={[0.05, 2.66, -0.85]} scale={0.96} />

      {/* AirPods case, lid open, on the left cube */}
      <BudsCase position={[-2.05, 1.78, -0.7]} rotation={[0, 0.38, 0]} />

      {/* two buds on the right cube */}
      <Bud position={[1.55, 1.62, -0.75]} rotation={[1.25, 0.5, 0.25]} />
      <Bud position={[1.95, 1.64, -1.0]} rotation={[1.4, -0.4, -0.3]} />

      {/* stylus on the front-left cube */}
      <Stylus position={[-2.4, 1.07, 0.7]} rotation={[0, 0.4, 0.04]} />

      {/* coin tucked at the phone's edge */}
      <mesh position={[-0.74, 2.62, -0.72]} rotation={[1.45, 0, 0.22]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.045, 40]} />
        <meshPhysicalMaterial
          color="#f2f0f8"
          metalness={0.15}
          roughness={0.3}
          clearcoat={0.8}
          envMapIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

/* ================= Screen refresher ================= */
function ScreenTicker({ screen }) {
  useFrame((state) => screen.update(state.clock.elapsedTime));
  return null;
}

/* ================= Camera rig ================= */
function CameraRig() {
  useFrame((state, delta) => {
    const { pointer, camera } = state;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, 0.4 + pointer.x * 0.4, 2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.15 + pointer.y * 0.3, 2, delta);
    camera.lookAt(0.05, 1.05, 0);
  });
  return null;
}

/* ================= Scene root ================= */
export default function Scene({ onLoaded }) {
  const screen = useMemo(() => createScreen(), []);

  return (
    <div className="scene-wrap">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.4, 2.15, 8.4], fov: 36 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={() => onLoaded?.()}
      >
        <color attach="background" args={['#efe6f7']} />
        <fog attach="fog" args={['#efe6f7', 14, 30]} />

        <hemisphereLight args={['#ffffff', '#c9a2ee', 0.22]} />
        <ambientLight intensity={0.1} color="#f6edfc" />
        <directionalLight
          position={[-4.5, 8.5, 5.5]}
          intensity={1.15}
          color="#ffffff"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[6, 4, 4]} intensity={0.12} color="#e9d5ff" />
        <pointLight position={[0, 1.2, -4.6]} intensity={7} color="#a855f7" distance={9} />
        <pointLight position={[4.6, 2.2, -1.5]} intensity={3.5} color="#c084fc" distance={10} />

        <CubeWall screen={screen} />
        <ScreenTicker screen={screen} />

        <Sparkles
          count={35}
          scale={[11, 5, 7]}
          position={[0, 1.2, 0]}
          size={2.2}
          speed={0.25}
          color="#b18cf0"
        />

        <ContactShadows
          position={[0, -1.06, 0]}
          opacity={0.35}
          scale={16}
          blur={2.6}
          far={4.5}
          color="#7a5ea8"
          frames={1}
        />

        <Environment preset="studio" environmentIntensity={0.45} />

        <EffectComposer multisampling={4}>
          <Bloom intensity={0.18} luminanceThreshold={0.88} luminanceSmoothing={0.25} mipmapBlur />
        </EffectComposer>

        <CameraRig />
      </Canvas>
    </div>
  );
}
