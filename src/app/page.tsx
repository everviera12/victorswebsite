"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
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

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const portraitRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: portraitRef,
    offset: ["start end", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["7%", "-7%"]);

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
                className="flex h-full flex-col p-5 lg:p-6"
              >
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
                    className="group/link mt-5 inline-flex items-center gap-2 self-start text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#00ff66] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
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
    </main>
  );
}