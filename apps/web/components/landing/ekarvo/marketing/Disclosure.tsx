"use client";

import React, { type ReactNode, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Icon } from "./Icon";

export function Disclosure({
  question,
  children,
  id,
}: {
  question: string;
  children: ReactNode;
  id?: string;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  // Before hydration the native details element owns its expanded semantics.
  const [expanded, setExpanded] = useState<boolean>();

  useEffect(() => {
    setExpanded(details.current?.open ?? false);
    if (!id) return;
    const revealAnchor = () => {
      if (window.location.hash !== `#${id}` || !details.current) return;
      details.current.open = true;
      setExpanded(true);
      summary.current?.focus({ preventScroll: true });
      details.current.scrollIntoView?.({ block: "start", behavior: "instant" });
    };
    revealAnchor();
    window.addEventListener("hashchange", revealAnchor);
    return () => window.removeEventListener("hashchange", revealAnchor);
  }, [id]);

  return (
    <details
      id={id}
      ref={details}
      className="disclosure"
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary
        ref={summary}
        className="disclosure-summary"
        aria-expanded={expanded}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          if (!details.current) return;
          details.current.open = !details.current.open;
          setExpanded(details.current.open);
        }}
      >
        <span>{question}</span>
        <span className="disclosure-toggle" aria-hidden="true">
          <span className="disclosure-closed">
            <Icon icon={Plus} />
          </span>
          <span className="disclosure-open">
            <Icon icon={Minus} />
          </span>
        </span>
      </summary>
      {children}
    </details>
  );
}
