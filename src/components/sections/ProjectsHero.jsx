import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import SectionHeader from '../shared/SectionHeader';
import './ProjectsHero.css';

/* ── 6 images — portrait ones at index 1 & 4 (middle slots) ─ */
const IMAGES = [
  { src: '/akar.png',       label: 'Akar' },
  { src: '/landing.png',    label: 'Landing' },    // portrait — left centre
  { src: '/port.png',       label: 'Portfolio' },
  { src: '/weather.png',    label: 'Weather' },
  { src: '/restaurant.png', label: 'Restaurant' }, // portrait — right centre
  { src: '/manage.png',     label: 'Manage' },
];

/*
  Positions scattered around the viewport edges.
  `depth`  → how much the card moves with the mouse (parallax).
  `floatY` → keyframe Y values for the continuous float loop.
  `floatR` → keyframe rotate values for the float loop.
*/
/*
  Layout — 3 cards flanking the left, 3 flanking the right.
  They stack vertically and frame the frosted-glass centre panel.
*/
const CARDS = [
  // ── Left column ─────────────────────────────────────────────
  { pos: { top: '6%',  left: '3%'  }, w: 165, rotate: -11, depth: 1.0, portrait: false, floatY: [0,-16, 8,-12, 0], floatR: [-11,-8,-13,-9,-11] },
  { pos: { top: '22%', left: '1%'  }, w: 120, rotate:   5, depth: 0.6, portrait: true,  floatY: [0, 12,-8, 10, 0], floatR: [  5, 8,  3,  7,  5] },
  { pos: { bottom: '6%', left: '3%' }, w: 158, rotate: -6, depth: 0.8, portrait: false, floatY: [0,  8,-14, 6, 0], floatR: [ -6,-3, -8, -4, -6] },
  // ── Right column ────────────────────────────────────────────
  { pos: { top: '6%',  right: '3%' }, w: 160, rotate:  13, depth: 0.9, portrait: false, floatY: [0,-12, 10,-14, 0], floatR: [ 13,10, 15, 11, 13] },
  { pos: { top: '22%', right: '1%' }, w: 120, rotate:  -5, depth: 0.5, portrait: true,  floatY: [0, 14,-8, 10, 0], floatR: [ -5,-2, -7, -3, -5] },
  { pos: { bottom: '6%', right: '3%' }, w: 162, rotate: 7, depth: 0.7, portrait: false, floatY: [0, -8, 14,-10, 0], floatR: [  7,10,  5,  9,  7] },
];

/* ── Individual card ───────────────────────────────────── */
const Card = ({ cfg, img, index, smoothX, smoothY }) => {
  const ref = useRef(null);
  const [tilt, setTilt]   = useState({ rx: 0, ry: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [hot, setHot]     = useState(false);

  /* Per-card parallax */
  const px = useTransform(smoothX, v => v * cfg.depth * 36);
  const py = useTransform(smoothY, v => v * cfg.depth * 24);

  /* 3-D tilt on hover */
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r  = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width  * 2 - 1;
    const ny = (e.clientY - r.top)  / r.height * 2 - 1;
    setTilt({ rx: -ny * 18, ry: nx * 18 });
    setGlare({ x: ((nx + 1) / 2) * 100, y: ((ny + 1) / 2) * 100 });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
    setGlare({ x: 50, y: 50 });
    setHot(false);
  }, []);

  const fromX = cfg.pos.left  != null ? (parseFloat(cfg.pos.left) < 20 ? -220 : 0) : (parseFloat(cfg.pos.right) < 20 ? 220 : 0);
  const fromY = cfg.pos.top   != null ? (parseFloat(cfg.pos.top)  < 12 ? -200 : 0) : (parseFloat(cfg.pos.bottom) < 10 ? 200 : 0);

  return (
    /* Parallax wrapper */
    <motion.div
      className="ph-wrap"
      style={{ ...cfg.pos, width: cfg.w, x: px, y: py }}
    >
      {/* Entrance + continuous float + hover tilt */}
      <motion.div
        ref={ref}
        className={`ph-card${cfg.portrait ? ' ph-card--portrait' : ''}`}
        /* 1. Entrance from off-screen */
        initial={{ opacity: 0, scale: 0.05, x: fromX, y: fromY, rotate: cfg.rotate + (cfg.rotate > 0 ? 30 : -30) }}
        /* 2. Land at final spot, then immediately loop the float */
        animate={{
          opacity:  1,
          scale:    1,
          x:        0,
          y:        cfg.floatY,
          rotate:   cfg.floatR,
        }}
        transition={{
          /* entrance props */
          opacity: { delay: index * 0.12 + 0.15, duration: 0.5 },
          scale:   { delay: index * 0.12 + 0.15, type: 'spring', stiffness: 68, damping: 14 },
          x:       { delay: index * 0.12 + 0.15, type: 'spring', stiffness: 68, damping: 14 },
          /* float props — applied after entrance via repeat */
          y:       { delay: index * 0.12 + 0.15 + 0.8, duration: 6 + index * 1.1, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' },
          rotate:  { delay: index * 0.12 + 0.15 + 0.8, duration: 7 + index * 0.9, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' },
        }}
        /* 3. 3-D tilt on hover — override rotateX/Y */
        style={{ rotateX: tilt.rx, rotateY: tilt.ry, transformPerspective: 800 }}
        whileHover={{ scale: 1.14, zIndex: 30 }}
        onMouseMove={onMove}
        onHoverStart={() => setHot(true)}
        onMouseLeave={onLeave}
      >
        <img src={img.src} alt={img.label} draggable="false" />

        {/* Apple glare */}
        <div
          className="ph-glare"
          style={{
            opacity: hot ? 1 : 0,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,.38) 0%, rgba(255,255,255,.08) 38%, transparent 65%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

/* ── Hero wrapper ──────────────────────────────────────── */
const ProjectsHero = () => {
  const stageRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 44, damping: 20 });
  const smoothY = useSpring(rawY, { stiffness: 44, damping: 20 });

  const onMove = (e) => {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width  - 0.5) * 2);
    rawY.set(((e.clientY - r.top)  / r.height - 0.5) * 2);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <div ref={stageRef} className="ph-hero" onMouseMove={onMove} onMouseLeave={onLeave}>

      {/* Card stage — absolutely covers the hero area */}
      <div className="ph-stage" aria-hidden="true">
        {CARDS.map((cfg, i) => (
          <Card key={i} cfg={cfg} img={IMAGES[i]} index={i} smoothX={smoothX} smoothY={smoothY} />
        ))}
      </div>

      {/* Frosted-glass centre title */}
      <motion.div
        className="ph-panel"
        initial={{ opacity: 0, scale: 0.84, y: 30 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ delay: 0.6, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeader
          eyebrow="// Portfolio"
          title="My Recent"
          titleAccent="Work"
          subtitle="A showcase of my favorite projects — from front-end to full-stack."
        />
      </motion.div>
    </div>
  );
};

export default ProjectsHero;
