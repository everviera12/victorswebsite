"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { PROJECTS } from "@/lib/content";

const CURRENT_YEAR = new Date().getFullYear();

const ACCENT_GRADIENT = "bg-gradient-to-br from-[#00ff66] to-emerald-500 bg-clip-text text-transparent";
const ACCENT_GRADIENT_BG = "bg-gradient-to-br from-[#00ff66] to-emerald-500";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_STANDARD: [number, number, number, number] = [0.4, 0, 0.2, 1];
const SPRING = { type: "spring", stiffness: 400, damping: 32 } as const;

const viewport = { once: true, margin: "-80px" } as const;

type Project = (typeof PROJECTS)[number];

const pad = (n: number) => String(n).padStart(2, "0");

const SOCIALS = [
  {
    label: "GitHub",
    handle: "@everviera12",
    href: "https://github.com/everviera12",
    external: true,
  },
  {
    label: "Correo",
    handle: "everisc2@gmail.com",
    href: "mailto:everisc2@gmail.com",
    external: false,
  },
  {
    label: "LinkedIn",
    handle: "Victor Everardo Viera",
    href: "https://www.linkedin.com/in/victor-everardo-viera-hdz",
    external: true,
  },
];

/* ---------------------------------------------------------------- */
/* Variants                                                          */
/* ---------------------------------------------------------------- */

const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE_OUT } },
};

/* Hero: classic mask reveal, one line at a time */
const maskLine: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 0.9, ease: EASE_OUT } },
};

/* Project cards */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
  hover: { y: -6, boxShadow: "0 25px 50px -12px rgba(0, 255, 102, 0.15)", transition: SPRING },
};

const mediaVariants: Variants = {
  show: { scale: 1, transition: { duration: 0.7, ease: EASE_OUT } },
  hover: { scale: 1.06, transition: { duration: 0.8, ease: EASE_OUT } },
};

const arrowVariants: Variants = {
  hover: { x: 4, y: -4, transition: { duration: 0.3, ease: EASE_STANDARD } },
};

/* Contact rows */
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
  hover: { transition: { duration: 0.35 } },
};

const labelVariants: Variants = {
  hover: { x: 10, transition: { duration: 0.35, ease: EASE_STANDARD } },
};

const lineVariants: Variants = {
  hover: { scaleX: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

/* ---------------------------------------------------------------- */
/* Project modal                                                      */
/* ---------------------------------------------------------------- */

/* Composition: first shot spans the full width, the middle ones pair
   up two per row, and the closing shot returns to full width so the
   collage bookends itself. Stacks to one column on small screens. */
function getModalLayout(total: number): string[] {
  const full = "col-span-12";
  const half = "col-span-12 md:col-span-6";

  if (total <= 1) return [full];

  return Array.from({ length: total }, (_, i) => {
    if (i === 0 || i === total - 1) return full;
    return half;
  });
}

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* Subscribes to a media query without an effect-driven setState */
function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const shots = project.image;
  const total = shots.length;
  const layout = getModalLayout(total);

  /* Mobile breakpoint: below md the collage becomes a carousel */
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const dragRef = useRef<{ startX: number; dx: number } | null>(null);

  const go = useCallback(
    (next: number, direction: number) => {
      setDir(direction);
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const goPrev = useCallback(() => go(index - 1, -1), [go, index]);
  const goNext = useCallback(() => go(index + 1, 1), [go, index]);

  /* Arrow keys drive the carousel while the modal is open on mobile */
  useEffect(() => {
    if (!isMobile) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile, goPrev, goNext]);

  /* Pointer drag with rubber-band resistance */
  const dragOffset = useMotionValue(0);
  const onDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    dragRef.current = { startX: event.clientX, dx: 0 };
  };
  const onDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !dragRef.current) return;
    const raw = event.clientX - dragRef.current.startX;
    dragRef.current.dx = Math.sign(raw) * Math.min(Math.abs(raw) * 0.45, 96);
    dragOffset.set(dragRef.current.dx);
  };
  const onDragEnd = () => {
    if (reduceMotion || !dragRef.current) return;
    const dx = dragRef.current.dx;
    dragRef.current = null;
    if (dx <= -48) goNext();
    else if (dx >= 48) goPrev();
    animate(dragOffset, 0, { type: "spring", stiffness: 420, damping: 34 });
  };

  /* Lock the page behind the modal without layout shift */
  useEffect(() => {
    const prev = document.body.style.overflow;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = "";
    };
  }, []);

  /* Escape to close + focus trap + restore focus on unmount */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const root = panelRef.current;
      if (!root) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  const backdrop: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: reduceMotion ? 0 : 0.35, ease: EASE_OUT },
    },
    exit: {
      opacity: 0,
      transition: { duration: reduceMotion ? 0 : 0.25, ease: EASE_STANDARD },
    },
  };

  const panel: Variants = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 28,
      scale: reduceMotion ? 1 : 0.96,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 260, damping: 26, mass: 0.9 },
    },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : 16,
      scale: reduceMotion ? 1 : 0.98,
      transition: { duration: reduceMotion ? 0 : 0.22, ease: EASE_STANDARD },
    },
  };

  const shot = (i: number): Variants => ({
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 44,
      scale: reduceMotion ? 1 : 0.94,
      rotate: reduceMotion ? 0 : (i % 2 === 0 ? -2.5 : 2.5),
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : {
            type: "spring",
            stiffness: 320,
            damping: 28,
            delay: 0.08 + i * 0.055,
          },
    },
    exit: {
      opacity: 0,
      scale: reduceMotion ? 1 : 0.97,
      transition: { duration: reduceMotion ? 0 : 0.14 },
    },
  });

  const chrome = (delay: number): Variants => ({
    hidden: { opacity: 0, y: reduceMotion ? 0 : -10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.5,
        ease: EASE_OUT,
        delay: reduceMotion ? 0 : delay,
      },
    },
    exit: { opacity: 0, transition: { duration: reduceMotion ? 0 : 0.15 } },
  });

  /* Carousel: directional slide, Webflow-style easing */
  const slide: Variants = {
    hidden: (direction: number) => ({
      x: reduceMotion ? 0 : direction * 72,
      opacity: 0,
      scale: reduceMotion ? 1 : 0.94,
    }),
    show: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 300, damping: 30, mass: 0.85 },
    },
    exit: (direction: number) => ({
      x: reduceMotion ? 0 : direction * -72,
      opacity: 0,
      scale: reduceMotion ? 1 : 0.94,
      transition: { duration: reduceMotion ? 0 : 0.2, ease: EASE_STANDARD },
    }),
  };

  const fade: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: reduceMotion ? 0 : 0.4 } },
    exit: { opacity: 0, transition: { duration: reduceMotion ? 0 : 0.15 } },
  };

  /* Apple-style: inactive dots sit back, active one stretches */
  const dot = (i: number): Variants => ({
    hidden: { scale: 0.6, opacity: 0.4 },
    show: {
      scale: i === index ? 1 : 0.75,
      opacity: 1,
      width: i === index ? 22 : 7,
      transition: reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 420, damping: 28 },
    },
  });

  const navButton =
    "absolute top-1/2 z-20 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/80 backdrop-blur-md outline-none transition-colors duration-300 hover:bg-black/80 hover:text-white focus-visible:ring-2 focus-visible:ring-[#00ff66] disabled:opacity-30 disabled:pointer-events-none";

  return (
    <motion.div
      variants={backdrop}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/80 p-4 backdrop-blur-xl sm:p-6 lg:p-10 lg:items-start"
    >
      {/* Ambient accent bloom, echoing the page gradients */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 h-[70vh] opacity-20 blur-3xl ${ACCENT_GRADIENT_BG}`}
        style={{
          maskImage:
            "radial-gradient(38% 55% at 50% 0%, #000, transparent 75%)",
        }}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        variants={panel}
        onClick={(event) => event.stopPropagation()}
        className="relative z-10 my-4 w-full max-w-6xl origin-top rounded-3xl border border-white/10 bg-black/80 shadow-2xl shadow-black/60 backdrop-blur-2xl lg:my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:gap-6 sm:px-8 sm:py-7">
          <motion.div variants={chrome(0.02)} className="min-w-0">
            <h2
              id="project-modal-title"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              {project.title}
            </h2>
            {project.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
                {project.description}
              </p>
            ) : null}
          </motion.div>

          <motion.button
            ref={closeRef}
            type="button"
            onClick={onClose}
            variants={chrome(0.06)}
            aria-label={`Cerrar ${project.title}`}
            className="group relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 outline-none transition-colors duration-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#00ff66] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${ACCENT_GRADIENT_BG} blur-md`}
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="relative size-4 text-white/80 transition-colors duration-300 group-hover:text-white"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </motion.button>
        </div>

        {/* Mobile: carousel */}
        {isMobile ? (
          <div className="px-5 py-6">
            <motion.div
              variants={chrome(0.06)}
              className="relative touch-pan-y select-none"
              style={{ x: dragOffset }}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <div className="relative aspect-16/9 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <AnimatePresence initial={false} custom={dir}>
                  <motion.div
                    key={index}
                    custom={dir}
                    variants={slide}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <Image
                      src={shots[index]}
                      alt={`${project.title} — pantalla ${index + 1} de ${total}`}
                      fill
                      priority
                      sizes="100vw"
                      draggable={false}
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Prev / Next */}
              {total > 1 ? (
                <>
                  <motion.button
                    type="button"
                    onClick={goPrev}
                    aria-label="Pantalla anterior"
                    variants={fade}
                    className={`left-2 ${navButton}`}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="M10 3 5 8l5 5" />
                    </svg>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={goNext}
                    aria-label="Pantalla siguiente"
                    variants={fade}
                    className={`right-2 ${navButton}`}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="m6 3 5 5-5 5" />
                    </svg>
                  </motion.button>
                </>
              ) : null}

              {/* Dots + counter */}
              <div className="mt-5 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2" role="tablist" aria-label="Pantallas del proyecto">
                  {shots.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Ir a la pantalla ${i + 1}`}
                      onClick={() => go(i, i > index ? 1 : -1)}
                      className="flex h-6 cursor-pointer items-center justify-center px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
                    >
                      <motion.span
                        variants={dot(i)}
                        className="block h-1.5 rounded-full bg-white/30"
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs tracking-[0.2em] text-white/25 uppercase tabular-nums">
                  {pad(index + 1)} / {pad(total)}
                </span>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Desktop: collage full / pair / full */
          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:py-10">
            <div className="grid grid-cols-12 items-start gap-4 sm:gap-5 lg:gap-6">
              {shots.map((src, i) => (
                <motion.figure
                  key={src}
                  variants={shot(i)}
                  className={`group/shot relative ${layout[i]}`}
                >
                  <div className="relative aspect-16/9 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:rounded-2xl">
                    <Image
                      src={src}
                      alt={`${project.title} — pantalla ${i + 1} de ${total}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 560px"
                      className="object-cover transition-transform duration-700 ease-out group-hover/shot:scale-[1.03]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/shot:opacity-100"
                    />
                  </div>
                  <figcaption className="mt-2.5 text-xs tracking-[0.2em] text-white/25 uppercase tabular-nums sm:mt-3">
                    {pad(i + 1)}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <motion.div
          variants={chrome(0.2)}
          className="flex flex-col gap-4 border-t border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7"
        >
          <p className="text-xs tracking-[0.2em] text-white/30 uppercase">
            {pad(total)} capturas del proyecto
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-sm font-medium text-white/50 outline-none transition-colors duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-[#00ff66] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Cerrar
            </button>
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="group/link inline-flex items-center gap-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className={ACCENT_GRADIENT}>Ver proyecto</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-4"
                >
                  <path d="M4 12 12 4M6 4h6v6" />
                </svg>
              </a>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const portraitRef = useRef<HTMLDivElement>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { scrollYProgress } = useScroll({
    target: portraitRef,
    offset: ["start end", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["7%", "-7%"]);

  const closeModal = useCallback(() => setActiveProject(null), []);
  const openModal = useCallback((project: Project) => setActiveProject(project), []);

  const heroLines = [
    <>Diseño y construyo</>,
    <>
      productos <span className={ACCENT_GRADIENT}>digitales</span>
    </>,
    <>que la gente usa.</>,
  ];

  return (
    <main>
      {/* 01 Quién soy */}
      <motion.section
        variants={stagger(0.09, 0.05)}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        className="relative overflow-hidden px-5 py-8 lg:px-10 lg:py-16"
      >
        <motion.p
          variants={fadeUp}
          className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase"
          style={{ WebkitBackgroundClip: 'text' }}
        >
          <motion.span
            aria-hidden="true"
            variants={{
              hidden: { scaleX: 0 },
              show: {
                scaleX: 1,
                transition: { duration: 0.8, ease: EASE_OUT, delay: 0.15 },
              },
            }}
            className="h-px w-8 origin-left bg-gradient-to-br from-[#00ff66] to-emerald-500"
          />
          <span className={ACCENT_GRADIENT}>01 Sobre mí</span>
        </motion.p>

        <motion.h1
          variants={stagger(0.1, 0.15)}
          className="mt-6 max-w-5xl text-5xl leading-[0.95] font-semibold tracking-tight sm:text-6xl lg:text-8xl"
        >
          {heroLines.map((line, index) => (
            <span key={index} className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={maskLine} className="block">
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <motion.div variants={stagger(0.1, 0.45)} className="max-w-xl">
            <motion.p
              variants={fadeUp}
              className="text-lg leading-relaxed text-white/60"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              vel sem at augue aliquet tempor. Cras posuere, erat at feugiat
              posuere, est lectus tempus nibh, eget ultrices urna urna. Nam
              mattis, felis sed fermentum euismod, sapien risus consequat mi,
              quis interdum lorem.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-lg leading-relaxed text-white/60"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
              commodo cursus magna, vel scelerisque nisl consectetur et. Donec
              ullamcorper nulla non metus auctor fringilla. Maecenas faucibus
              mollis interdum.
            </motion.p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 1.06 },
              show: {
                opacity: 1,
                scale: 1,
                transition: { duration: 1.1, ease: EASE_OUT, delay: 0.3 },
              },
              hover: { scale: 1.02, transition: { duration: 0.6, ease: EASE_OUT } },
            }}
            className="relative aspect-2/3 w-full overflow-hidden rounded-xl lg:w-72 xl:w-80"
          >
            <motion.div
              ref={portraitRef}
              className="absolute inset-0"
              style={reduceMotion ? undefined : { y: portraitY }}
            >
              <Image
                src="/yo.jpg"
                alt="Retrato de Victor Viera"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 320px"
                className="scale-100 object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* 02 Proyectos */}
      <motion.section
        variants={stagger(0.08)}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewport}
        className="border-t border-white/10 px-5 py-8 lg:px-10 lg:py-16"
      >
        <motion.div
          variants={fadeUp}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              <motion.span
                aria-hidden="true"
                variants={{
                  hidden: { scaleX: 0 },
                  show: {
                    scaleX: 1,
                    transition: { duration: 0.8, ease: EASE_OUT, delay: 0.1 },
                  },
                }}
                className="h-px w-8 origin-left bg-gradient-to-br from-[#00ff66] to-emerald-500"
              />
              <span className={ACCENT_GRADIENT}>02 Proyectos</span>
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-6xl"
            >
              Trabajo seleccionado
            </motion.h2>
          </div>
          <motion.p variants={fadeUp} className="text-sm text-white/40">
            {String(PROJECTS.length).padStart(2, "0")} proyectos
          </motion.p>
        </motion.div>

        <motion.ul
          variants={stagger(0.07)}
          className="mt-8 grid gap-4 overflow-hidden border border-white/10 bg-white/10 rounded-xl sm:grid-cols-2 xl:grid-cols-3"
        >
          {PROJECTS.map((project, index) => (
            <motion.li
              key={project.title}
              variants={cardVariants}
              className="group bg-black rounded-lg"
            >
              <motion.article
                whileHover="hover"
                className="relative flex h-full flex-col p-5 lg:p-6"
              >
                {/* Full-card hit area: one real button, keyboard accessible */}
                <button
                  type="button"
                  onClick={() => openModal(project)}
                  aria-label={`Abrir las ${project.image.length} pantallas de ${project.title}`}
                  className="absolute inset-0 z-10 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00ff66]"
                />

                <div className="relative aspect-16/9 w-full overflow-hidden bg-white/5 rounded-lg">
                  <motion.div variants={mediaVariants} className="absolute inset-0">
                    <Image
                      src={project.image[0]}
                      alt={`Capturas de ${project.title}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </motion.div>

                  {/* Hover cue */}
                  <motion.span
                    aria-hidden="true"
                    variants={{
                      hover: { opacity: 1, y: 0, transition: SPRING },
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"
                  >
                    Ver pantallas
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      className="size-3.5"
                    >
                      <path d="M4 12 12 4M6 4h6v6" />
                    </svg>
                  </motion.span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="relative h-8 w-full max-w-40">
                    <Image
                      src={project.logo}
                      alt={`Logo de ${project.title}`}
                      fill
                      sizes="160px"
                      className="object-contain object-left"
                    />
                  </div>
                  <motion.span
                    variants={{
                      hover: { color: "rgb(0, 255, 102)", transition: { duration: 0.3 } },
                    }}
                    className="text-xs tracking-[0.2em] text-white/30"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </motion.span>
                </div>

                <h3 className="mt-4 text-xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent lg:text-2xl">
                  {project.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {project.description ||
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel sem at augue aliquet tempor, vitae facilisis erat porttitor."}
                </p>

                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="group/link relative z-20 mt-5 inline-flex items-center gap-2 self-start text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                  >
                    <span className={ACCENT_GRADIENT}>Ver proyecto</span>
                    <motion.svg
                      aria-hidden="true"
                      variants={arrowVariants}
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="size-4"
                    >
                      <path d="M4 12 12 4M6 4h6v6" />
                    </motion.svg>
                  </a>
                ) : null}
              </motion.article>
            </motion.li>
          ))}
        </motion.ul>
      </motion.section>

      {/* 03 Contacto */}
      <motion.section
        variants={stagger(0.08)}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewport}
        className="border-t border-white/10 px-5 py-8 lg:px-10 lg:py-16"
      >
        <motion.p
          variants={fadeUp}
          className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase"
          style={{ WebkitBackgroundClip: 'text' }}
        >
          <motion.span
            aria-hidden="true"
            variants={{
              hidden: { scaleX: 0 },
              show: {
                scaleX: 1,
                transition: { duration: 0.8, ease: EASE_OUT, delay: 0.1 },
              },
            }}
            className="h-px w-8 origin-left bg-gradient-to-br from-[#00ff66] to-emerald-500"
          />
          <span className={ACCENT_GRADIENT}>03 Contacto</span>
        </motion.p>

        <motion.h2
          variants={stagger(0.1, 0.1)}
          className="mt-6 max-w-4xl text-4xl leading-[0.95] font-semibold tracking-tight sm:text-5xl lg:text-8xl"
        >
          {["¿Tienes un proyecto", "en mente?"].map((line, index) => (
            <span key={index} className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={maskLine} className="block">
                {line}
              </motion.span>
            </span>
          ))}
          <span className="block overflow-hidden pb-[0.1em]">
            <motion.span variants={maskLine} className="block">
              <span className={ACCENT_GRADIENT}>Hablemos.</span>
            </motion.span>
          </span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-xl text-lg leading-relaxed text-white/60"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
          blandit tempus porttitor. Donec id elit non mi porta gravida at eget
          metus.
        </motion.p>

        <motion.ul
          variants={stagger(0.08, 0.15)}
          className="mt-10 border-t border-white/10"
        >
          {SOCIALS.map((social, index) => (
            <motion.li
              key={social.label}
              variants={rowVariants}
              className="group relative border-b border-white/10"
            >
              <motion.a
                href={social.href}
                {...(social.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                whileHover="hover"
                className="relative flex items-center justify-between gap-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66] focus-visible:ring-inset lg:py-6"
              >
                <motion.span
                  variants={lineVariants}
                  initial={{ scaleX: 0 }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-br from-[#00ff66] to-emerald-500"
                />
                <motion.span
                  variants={labelVariants}
                  className="flex items-baseline gap-4 lg:gap-6"
                >
                  <span className="text-xs tracking-[0.2em] text-white/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-2xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent lg:text-4xl">
                    {social.label}
                  </span>
                </motion.span>
                <span className="flex items-center gap-4 text-sm text-white/40 transition-colors duration-300 group-hover:text-accent lg:text-base">
                  <span className="hidden sm:inline">{social.handle}</span>
                  <motion.svg
                    aria-hidden="true"
                    variants={arrowVariants}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-5 shrink-0"
                  >
                    <path d="M4 12 12 4M6 4h6v6" />
                  </motion.svg>
                </span>
              </motion.a>
            </motion.li>
          ))}
        </motion.ul>
      </motion.section>

      <motion.div
        variants={fadeUp}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={viewport}
        className="border-t border-white/10 px-5 py-8 lg:px-10 lg:py-16"
      >
        <p className="text-xs tracking-[0.2em] text-white/40 uppercase">
          © {CURRENT_YEAR} Victor Viera
        </p>
      </motion.div>

      <AnimatePresence>
        {activeProject ? (
          <ProjectModal
            key={activeProject.title}
            project={activeProject}
            onClose={closeModal}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}