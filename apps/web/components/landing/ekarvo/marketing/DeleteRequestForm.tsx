"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Icon } from "./Icon";
import { requestIdSchema } from "@/lib/marketing/request-schema";

/** Token management is deliberately separate from the authoritative SaaS policy. */
export function DeleteRequestForm() {
  const [ready, setReady] = useState(false);
  const [id, setId] = useState(""),
    [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const summary = useRef<HTMLParagraphElement>(null);
  const target = useRef<HTMLElement>(null);
  const focusStatus = useRef(false);
  useEffect(() => {
    setReady(true);
    function hashFocus() {
      if (window.location.hash === "#delete") {
        target.current?.focus({ preventScroll: true });
        target.current?.scrollIntoView?.({ block: "start" });
      }
    }
    hashFocus();
    window.addEventListener("hashchange", hashFocus);
    return () => {
      controller.current?.abort();
      window.removeEventListener("hashchange", hashFocus);
    };
  }, []);
  useEffect(() => {
    if (focusStatus.current && !busy) {
      summary.current?.focus();
      focusStatus.current = false;
    }
  }, [status, busy, errors]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const invalid: Record<string, string> = {};
    if (!requestIdSchema.safeParse(id.trim()).success)
      invalid["delete-id"] = "Enter a valid request ID.";
    if (!requestIdSchema.safeParse(token.trim()).success)
      invalid["delete-token"] = "Enter a valid deletion token.";
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      focusStatus.current = true;
      setStatus("Enter a valid request ID and deletion token.");
      return;
    }
    pending.current = true;
    setBusy(true);
    setStatus("Deleting…");
    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await fetch("/api/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({ id: id.trim(), token: token.trim() }),
      });
      const body = await response.json();
      if (abort.signal.aborted) return;
      setStatus(body.message);
      if (response.ok) {
        setId("");
        setToken("");
      }
      focusStatus.current = true;
    } catch {
      if (abort.signal.aborted) return;
      setStatus("The server is unavailable. Please try again.");
      focusStatus.current = true;
    } finally {
      if (!abort.signal.aborted) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  return (
    <section
      id="delete"
      ref={target}
      tabIndex={-1}
      className="saved-request-management"
      aria-labelledby="delete-heading"
    >
      <h2 id="delete-heading">Manage a saved request</h2>
      <form
        className="privacy-delete"
        onSubmit={submit}
        noValidate
        aria-busy={busy}
      >
        <h3>Delete a saved request</h3>
        <p className="small-copy">
          Use the request ID and deletion token in your downloaded receipt. This
          permanently removes the server copy. Downloads on your device are
          separate.
        </p>
        <fieldset disabled={!ready || busy}>
          {[
            ["delete-id", "Request ID", id, setId],
            ["delete-token", "Deletion token", token, setToken],
          ].map(([field, label, value, setter]) => (
            <div className="field" key={String(field)}>
              <label htmlFor={String(field)}>{String(label)}</label>
              <input
                id={String(field)}
                name={String(field)}
                required
                value={String(value)}
                onChange={(event) =>
                  (setter as typeof setId)(event.target.value)
                }
                maxLength={36}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!errors[String(field)]}
                aria-describedby={
                  errors[String(field)] ? `${field}-error` : undefined
                }
              />
              {errors[String(field)] && (
                <span id={`${field}-error`} className="error">
                  {errors[String(field)]}
                </span>
              )}
            </div>
          ))}
          <button className="button secondary" type="submit">
            {busy ? "Deleting…" : "Delete saved request"}
          </button>
        </fieldset>
        <p
          ref={summary}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="delete-status"
        >
          {status}
        </p>
        {Object.keys(errors).length > 0 && (
          <ul className="error">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a
                  href={`#${field}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(field)?.focus();
                  }}
                >
                  {field === "delete-id" ? "Request ID" : "Deletion token"}:{" "}
                  {error}
                </a>
              </li>
            ))}
          </ul>
        )}
        <noscript>
          Ask the person running this local site to remove the request file
          using its receipt ID.
        </noscript>
      </form>
      <a className="text-link" href="/landing/contact">
        Return to contact <Icon icon={ArrowRight} />
      </a>
    </section>
  );
}
