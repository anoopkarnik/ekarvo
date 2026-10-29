"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Icon } from "./Icon";
import { SpatialScene } from "./SpatialScene";
import { marketingHref } from "./navigation";
import type { MarketingProduct } from "./data";

export function ProductCarousel({
  products,
}: {
  products: readonly MarketingProduct[];
}) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const selected = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const go = useRef<(value: number) => void>(() => {});
  const id = useId();

  useEffect(() => {
    const node = track.current;
    if (!node || !products.length) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    let moving = false;
    let closed = false;
    const cancel = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      clearTimeout(settle);
      moving = false;
    };
    const sync = (value: number) => {
      selected.current = Math.max(0, Math.min(products.length - 1, value));
      const slides = node.querySelectorAll<HTMLElement>("[data-product-slide]");
      if (
        Array.from(slides).some(
          (slide, i) =>
            i !== selected.current && slide.contains(document.activeElement),
        )
      ) {
        node.focus({ preventScroll: true });
      }
      setIndex(selected.current);
    };
    const align = (animate: boolean) => {
      cancel();
      const start = node.scrollLeft;
      const target = selected.current * node.clientWidth;
      if (!animate || motion.matches || start === target) {
        node.scrollLeft = target;
        return;
      }
      moving = true;
      const began = performance.now();
      const tick = (now: number) => {
        if (closed) return;
        const progress = Math.min(1, (now - began) / 360);
        node.scrollLeft =
          start + (target - start) * (1 - Math.pow(1 - progress, 3));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else {
          frame = 0;
          moving = false;
        }
      };
      frame = requestAnimationFrame(tick);
    };
    go.current = (value) => {
      sync(value);
      align(true);
    };
    // Only direct manipulation may derive selection from position. Animation
    // events (including an old scrollend) can never overwrite a requested slide.
    const onScroll = () => {
      if (moving) return;
      clearTimeout(settle);
      settle = setTimeout(() => {
        if (!moving && node.clientWidth) {
          sync(Math.round(node.scrollLeft / node.clientWidth));
          align(true);
        }
      }, 120);
    };
    const interrupt = () => {
      // Complete pending programmatic movement before native manipulation
      // starts; a press alone must not strand the selected slide halfway.
      if (moving) align(false);
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaX !== 0 || (event.shiftKey && event.deltaY !== 0))
        interrupt();
    };
    const resize = () => align(false);
    node.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("pointerdown", interrupt, { passive: true });
    node.addEventListener("wheel", onWheel, { passive: true });
    motion.addEventListener("change", resize);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(resize);
    observer?.observe(node);
    window.addEventListener("resize", resize);
    align(false);
    setReady(true);
    return () => {
      closed = true;
      cancel();
      go.current = () => {};
      observer?.disconnect();
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("pointerdown", interrupt);
      node.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", resize);
      motion.removeEventListener("change", resize);
    };
  }, [products]);

  if (!products.length) return null;
  return (
    <section
      id="products"
      className="product-passage product-carousel standalone"
      data-product-carousel
      data-carousel-ready={ready ? "true" : undefined}
      aria-label="Ekarvo Pulse and Drive"
      aria-roledescription="carousel"
    >
      <header className="container product-passage-intro">
        <p className="product-category">ONE CONNECTED OPERATING MODEL</p>
        <h2>
          First, understand the operation. <br />
          Then, move the work forward.
        </h2>
        <p>
          Two products connect the operating picture to accountable execution.
        </p>
      </header>
      <div className="container carousel-shell">
        <div
          ref={track}
          className="carousel-track"
          role="group"
          tabIndex={0}
          aria-label="Product views"
          data-carousel-track
          onKeyDown={(event) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            event.preventDefault();
            go.current(
              selected.current + (event.key === "ArrowRight" ? 1 : -1),
            );
          }}
        >
          {products.map((product, i) => (
            <div
              key={product.name}
              id={`${id}-slide-${i}`}
              className="product-slide"
              data-product-slide
              role="group"
              aria-roledescription="slide"
              aria-label={`${product.name}, ${i + 1} of ${products.length}`}
              inert={ready && i !== index ? true : undefined}
            >
              <div className="product-slide-copy">
                <p className="product-category">{product.role}</p>
                <h2 className="product-slide-name">{product.name}</h2>
                <p className="product-slide-statement">{product.title}</p>
                <p>{product.body}</p>
                <a
                  className="product-link"
                  href={marketingHref(product.href)}
                  tabIndex={ready && i !== index ? -1 : 0}
                >
                  {product.action}
                  <Icon icon={ArrowUpRight} />
                </a>
              </div>
              <div className="product-slide-art">
                <SpatialScene
                  mode={product.mode}
                  surface="paper"
                  label={product.label}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="carousel-controls">
          <div
            className="carousel-product-tabs"
            role="group"
            aria-label="Choose a product"
          >
            {products.map((product, i) => (
              <button
                key={product.name}
                type="button"
                aria-controls={`${id}-slide-${i}`}
                aria-pressed={i === index}
                disabled={!ready}
                onClick={() => go.current(i)}
              >
                {product.name}
              </button>
            ))}
          </div>
          <div className="carousel-arrows">
            <button
              className="icon-control"
              type="button"
              aria-label="Previous product"
              disabled={!ready || index === 0}
              onClick={() => go.current(selected.current - 1)}
            >
              <Icon icon={ArrowLeft} />
            </button>
            <button
              className="icon-control"
              type="button"
              aria-label="Next product"
              disabled={!ready || index === products.length - 1}
              onClick={() => go.current(selected.current + 1)}
            >
              <Icon icon={ArrowRight} />
            </button>
          </div>
          <span
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {products[index]!.name}, {index + 1} of {products.length}
          </span>
        </div>
      </div>
    </section>
  );
}
