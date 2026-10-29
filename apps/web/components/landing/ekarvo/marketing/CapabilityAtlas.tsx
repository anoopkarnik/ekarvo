"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Icon } from "./Icon";
import { CAPABILITY_PRODUCTS } from "./data";

export interface CapabilitySelection {
  product?: "pulse" | "drive";
  group?: string;
  module?: string;
}
function resolveSelection(selection?: CapabilitySelection) {
  const product = selection?.product === "drive" ? 1 : 0;
  const groups = CAPABILITY_PRODUCTS[product].groups;
  const group = Math.max(
    0,
    groups.findIndex(
      (item) => item.name.toLowerCase() === selection?.group?.toLowerCase(),
    ),
  );
  const moduleIndex = Math.max(
    0,
    (groups[group] ?? groups[0]).modules.findIndex(
      (item) => item.name.toLowerCase() === selection?.module?.toLowerCase(),
    ),
  );
  return { product, group, module: moduleIndex };
}
export function CapabilityAtlas({
  initialSelection,
}: {
  initialSelection?: CapabilitySelection;
}) {
  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState(() =>
    resolveSelection(initialSelection),
  );
  const focusTarget = useRef<string | null>(null);
  useEffect(() => {
    setReady(true);
    const revealHash = () => {
      const match = window.location.hash.match(/^#(pulse|drive)-([a-z]+)$/);
      if (!match) return;
      const product = match[1] === "pulse" ? 0 : 1;
      const group = CAPABILITY_PRODUCTS[product].groups.findIndex(
        (item) => item.name.toLowerCase() === match[2],
      );
      if (group < 0) return;
      focusTarget.current = `${match[1]}-${match[2]}`;
      setSelection({ product, group, module: 0 });
    };
    revealHash();
    window.addEventListener("hashchange", revealHash);
    return () => window.removeEventListener("hashchange", revealHash);
  }, []);
  useEffect(() => {
    if (!ready || !focusTarget.current) return;
    const target = document.getElementById(focusTarget.current);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView?.({ block: "start", behavior: "instant" });
    focusTarget.current = null;
  }, [selection, ready]);
  const { product, group, module: moduleIndex } = selection;
  const current = CAPABILITY_PRODUCTS[product] ?? CAPABILITY_PRODUCTS[0];
  const cluster = current.groups[group] ?? current.groups[0];
  const item = cluster.modules[moduleIndex] ?? cluster.modules[0];
  return (
    <fieldset className="capability-atlas" disabled={!ready}>
      <legend className="sr-only">Capability atlas</legend>
      <div
        className="atlas-products"
        role="group"
        aria-label="Select a product"
      >
        {CAPABILITY_PRODUCTS.map((p, i) => (
          <button
            type="button"
            key={p.name}
            aria-pressed={i === product}
            onClick={() => {
              setSelection({ product: i, group: 0, module: 0 });
            }}
          >
            <span>{p.role}</span>
            <strong>{p.name}</strong>
          </button>
        ))}
      </div>
      <div className="atlas-main">
        <div className="atlas-navigation">
          <p className="product-category">
            {current.name.toUpperCase()} · PROPOSED CAPABILITIES
          </p>
          <div
            className="atlas-groups"
            role="group"
            aria-label="Capability groups"
          >
            {current.groups.map((g, i) => (
              <button
                id={`${product === 0 ? "pulse" : "drive"}-${g.name.toLowerCase()}`}
                type="button"
                key={g.name}
                aria-pressed={i === group}
                onClick={() => {
                  setSelection((s) => ({ ...s, group: i, module: 0 }));
                }}
              >
                {g.name}
                <span>{g.modules.length}</span>
              </button>
            ))}
          </div>
          <p>{cluster.summary}</p>
          <div className="atlas-modules" role="group" aria-label="Modules">
            {cluster.modules.map((m, i) => (
              <button
                type="button"
                key={m.name}
                aria-pressed={i === moduleIndex}
                onClick={() => setSelection((s) => ({ ...s, module: i }))}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
        <div
          className="atlas-detail"
          role="region"
          aria-label="Selected capability"
          aria-live="polite"
        >
          <div className="atlas-orbit" aria-hidden="true">
            <span>{current.name.replace("Ekarvo ", "")}</span>
            <i />
            <span>{cluster.name}</span>
            <i />
            <span>{item.name}</span>
          </div>
          <p className="product-category">
            {cluster.name} / {item.name.toUpperCase()}
          </p>
          <h3>{item.name}</h3>
          <p>{item.problem}</p>
          <dl>
            <div>
              <dt>Example use</dt>
              <dd>{item.example}</dd>
            </div>
            <div>
              <dt>Connected with</dt>
              <dd>{item.connection}</dd>
            </div>
          </dl>
          <a className="product-link" href={current.href}>
            Explore {current.name}
            <Icon icon={ArrowUpRight} />
          </a>
        </div>
      </div>
    </fieldset>
  );
}
