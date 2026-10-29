"use client";

import React, { useEffect, useRef } from "react";
import { SCENES, type SceneMode, type SceneSurface } from "./data";

export interface SpatialSceneProps {
  mode: SceneMode;
  surface?: SceneSurface;
  eager?: boolean;
  label: string;
}

type StudyWorld = Awaited<ReturnType<typeof import("./sceneRuntime")["createStudyWorld"]>>;

/** The complete artwork and caption render on the server; graphics are optional. */
export function SpatialScene({ mode, surface, eager = false, label }: SpatialSceneProps) {
  const figure = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const scene = SCENES[mode];
  const paper = surface === "paper" || scene.paper;
  const theme = paper ? "paper" : "dark";
  const product = mode === "operations" || mode === "execution";

  useEffect(() => {
    const root = figure.current;
    const host = canvasHost.current;
    if (!root || !host || typeof matchMedia !== "function" || typeof IntersectionObserver === "undefined") return;
    if (typeof window.WebGLRenderingContext === "undefined" && typeof window.WebGL2RenderingContext === "undefined") return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2)) return;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const events = new AbortController();
    let world: StudyWorld | undefined;
    let closed = false;
    let failed = false;
    let loading = false;
    let visible = false;
    let frame = 0;
    let generation = 0;
    let pointerX = 0;
    let pointerY = 0;

    const dispose = () => {
      const previous = world;
      world = undefined;
      root.classList.remove("study-ready");
      try { previous?.dispose(); } catch { /* A lost context must never remove static content. */ }
      host.replaceChildren();
      root.querySelectorAll<HTMLElement>("[data-product-label]").forEach((node) => node.style.removeProperty("transform"));
    };
    const fail = () => {
      failed = true;
      generation++;
      dispose();
      root.classList.add("study-static");
    };
    const draw = () => {
      frame = 0;
      if (closed || failed) return;
      // A queued frame can see the preference before its change event is delivered.
      if (motion.matches) { generation++; dispose(); return; }
      if (!visible || document.hidden || root.closest("[inert]")) return;
      if (!world) { void load(); return; }
      try {
        const rect = root.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)));
        world.update(scene.start + (scene.end - scene.start) * progress, pointerX, pointerY);
        root.classList.add("study-ready");
      } catch { fail(); }
    };
    const schedule = () => {
      if (!frame && !closed && !document.hidden) frame = requestAnimationFrame(draw);
    };
    async function load() {
      if (closed || failed || loading || world || !visible || motion.matches || root!.closest("[inert]")) return;
      loading = true;
      const revision = generation;
      try {
        const { createStudyWorld } = await import("./sceneRuntime");
        if (closed || revision !== generation || motion.matches || !visible || root!.closest("[inert]")) return;
        const created = await createStudyWorld(host!, mode, paper);
        if (closed || revision !== generation || motion.matches || !visible || root!.closest("[inert]")) { created.dispose(); return; }
        world = created;
        draw();
      } catch { if (!closed && revision === generation) fail(); }
      finally {
        loading = false;
        if (!closed && !failed && !world && visible && !motion.matches) schedule();
      }
    }
    const resize = () => {
      try { world?.resize(); schedule(); } catch { fail(); }
    };
    const configure = () => {
      generation++;
      dispose();
      if (!motion.matches) schedule();
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (!visible) root.classList.remove("study-ready");
      else schedule();
    });
    observer.observe(root);
    const size = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(resize);
    size?.observe(root);
    const mutation = new MutationObserver(schedule);
    const slide = root.closest("[data-product-slide]");
    if (slide) mutation.observe(slide, { attributes: true, attributeFilter: ["inert"] });
    host.addEventListener("webglcontextlost", (event) => { event.preventDefault(); fail(); }, { capture: true, signal: events.signal });
    root.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / Math.max(1, rect.width) * 2 - 1;
      pointerY = (event.clientY - rect.top) / Math.max(1, rect.height) * 2 - 1;
      schedule();
    }, { passive: true, signal: events.signal });
    root.addEventListener("pointerleave", () => { pointerX = pointerY = 0; schedule(); }, { signal: events.signal });
    motion.addEventListener("change", configure, { signal: events.signal });
    window.addEventListener("scroll", schedule, { passive: true, signal: events.signal });
    window.addEventListener("resize", resize, { passive: true, signal: events.signal });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else schedule();
    }, { signal: events.signal });
    return () => {
      closed = true;
      generation++;
      cancelAnimationFrame(frame);
      events.abort();
      observer.disconnect();
      size?.disconnect();
      mutation.disconnect();
      dispose();
      root.classList.remove("study-static");
    };
  }, [mode, paper, scene]);

  return (
    <figure ref={figure} className={`spatial-scene film-study spatial-scene--${mode}`} data-world-mode={mode} data-product-art={product ? mode : undefined} data-surface={theme} aria-label={label}>
      <div className="film-study-picture">
        <picture className="film-study-poster" aria-hidden="true">
          <source media="(max-width:650px)" srcSet={`/images/cinematic/study-${mode}-${theme}-mobile.webp`} width={390} height={360} />
          {/* Source art uses native picture selection, including its mobile aspect ratio. */}
          <img src={`/images/cinematic/study-${mode}-${theme}.webp`} width={1440} height={640} alt="" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} decoding="async" />
        </picture>
        <div ref={canvasHost} className="film-study-canvas" aria-hidden="true" />
        {product && <div className="product-art-relationships" aria-hidden="true">
          <svg>{scene.labels.map((name) => <line key={name} data-product-tether />)}</svg>
          {scene.labels.map((name) => <span key={name} data-product-label>{name}</span>)}
        </div>}
      </div>
      <figcaption><span>{scene.captions[0]}</span><span>{scene.captions[1]}</span></figcaption>
    </figure>
  );
}
