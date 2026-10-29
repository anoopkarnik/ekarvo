"use client";

import React from "react";
import { Icon as UIIcon } from "./Icon";
import { useSearchParams } from "next/navigation";
import { workflowValuesSchema } from "@/lib/marketing/request-schema";
import { useEffect, useRef, useState } from "react";
import { Download, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
const initial = {
  name: "",
  email: "",
  organization: "",
  role: "",
  workflow: "",
  criteria: "",
  product: "not-sure",
  website: "",
};
const limits: Record<string, number> = {
  name: 120,
  email: 254,
  organization: 200,
  role: 120,
  workflow: 2000,
  criteria: 1000,
};
const validProduct = (value: string) =>
  ["operations-os", "autonomous-execution"].includes(value)
    ? value
    : "not-sure";
type Receipt = {
  id: string;
  createdAt: string;
  deleteToken: string;
  message: string;
};
export function ContactWorkflowEntry() {
  const query = useSearchParams();
  const product = validProduct(query.get("product") || "");
  return <ContactWorkflowForm key={product} initialProduct={product} />;
}
export function ContactWorkflowForm({
  initialProduct = "not-sure",
}: {
  initialProduct?: string;
}) {
  const product = validProduct(initialProduct);
  const [data, setData] = useState({ ...initial, product });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const saving = useRef(false);
  const focusSummary = useRef(false);
  const downloads = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    setHydrated(true);
    const urls = downloads.current;
    return () => {
      generation.current += 1;
      controller.current?.abort();
      for (const [url, timer] of urls) {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);
  useEffect(() => {
    if (receipt) receiptRef.current?.focus();
  }, [receipt]);
  useEffect(() => {
    if (focusSummary.current && !pending) {
      errorRef.current?.focus();
      focusSummary.current = false;
    }
  }, [status, pending, errors]);
  const key = useRef("");
  const errorRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  function download(withReceipt = false) {
    const brief = { ...data };
    delete (brief as Partial<typeof data>).website;
    const body = {
      title: "Ekarvo workflow brief — local review",
      ...brief,
      ...(withReceipt ? { receipt } : {}),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(body, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "ekarvo-workflow-brief.json";
    a.click();
    const timer = setTimeout(() => {
      URL.revokeObjectURL(url);
      downloads.current.delete(url);
    }, 1000);
    downloads.current.set(url, timer);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving.current) return;
    const es: Record<string, string> = {};
    const parsed = workflowValuesSchema.safeParse(data);
    if (!parsed.success)
      for (const issue of parsed.error.issues)
        es[String(issue.path[0])] = issue.message;
    setErrors(es);
    if (Object.keys(es).length) {
      setStatus("Check the marked fields.");
      focusSummary.current = true;
      return;
    }
    saving.current = true;
    setPending(true);
    setConflict(false);
    controller.current?.abort();
    const current = ++generation.current;
    const abort = new AbortController();
    controller.current = abort;
    setStatus("Saving your request on this computer…");
    if (!key.current) key.current = crypto.randomUUID();
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        signal: abort.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, requestId: key.current }),
      });
      const result = await r.json();
      if (abort.signal.aborted || current !== generation.current) return;
      if (!r.ok) {
        setErrors(result.errors || {});
        setConflict(r.status === 409);
        throw new Error(result.message);
      }
      setReceipt(result);
      setStatus("");
    } catch (e) {
      if (abort.signal.aborted || current !== generation.current) return;
      setStatus(
        e instanceof TypeError
          ? "The local server is unavailable. Your entries are still here. Please try again."
          : (e as Error).message,
      );
      focusSummary.current = true;
    } finally {
      if (current === generation.current && !abort.signal.aborted) {
        saving.current = false;
        setPending(false);
      }
    }
  }
  if (receipt)
    return (
      <motion.div
        className="receipt"
        ref={receiptRef}
        tabIndex={-1}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        <UIIcon icon={CheckCircle2} size={20} />
        <h2 style={{ marginTop: "1rem" }}>Your workflow request is saved.</h2>
        <p>
          It is stored on this computer. No email was sent and no meeting was
          booked.
        </p>
        <p className="small-copy">
          <strong>Request ID</strong>
          <br />
          <code>{receipt.id}</code>
        </p>
        <p className="small-copy">
          Download your receipt. It includes a private token to delete the saved
          request from the Privacy page.
        </p>
        <div className="actions">
          <button
            className="button micro-press micro-lift"
            onClick={() => download(true)}
          >
            <UIIcon icon={Download} size={16} /> Download brief & receipt
          </button>
          <a
            className="button secondary micro-press micro-lift"
            href="/landing/legal/privacy-policy#delete"
          >
            Manage your request
          </a>
          <button
            className="text-link micro-press"
            style={{ background: "none", border: 0 }}
            onClick={() => {
              setReceipt(null);
              setData({ ...initial, product });
              key.current = "";
              setErrors({});
              setStatus("");
              setConflict(false);
            }}
          >
            Create another brief <UIIcon icon={ArrowRight} />
          </button>
        </div>
      </motion.div>
    );
  return (
    <motion.form
      className="form-panel glass glass-2 micro-lift"
      onSubmit={submit}
      aria-busy={pending}
      noValidate
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="note" style={{ marginTop: 0 }}>
        Save your brief on this computer. Include a summary of the work, without
        confidential records or credentials.
      </p>
      <div
        ref={errorRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={status && !pending ? "error" : ""}
      >
        {status && <p>{status}</p>}
        {conflict && (
          <button
            type="button"
            className="button secondary micro-press micro-lift"
            onClick={() => {
              key.current = "";
              setErrors({});
              setStatus("");
              setConflict(false);
              setConflict(false);
              setStatus(
                "These entries are ready to save as a new request. The earlier request remains separate.",
              );
            }}
          >
            Start a new request with these entries
          </button>
        )}
        {Object.keys(errors).length > 0 && (
          <ul>
            {Object.keys(errors).map((f) => (
              <li key={f}>
                <a
                  href={`#${f}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(f)?.focus();
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}: {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <fieldset
        disabled={!hydrated || pending}
        style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
      >
        <div className="form-grid">
          {[
            ["name", "Name", "text", true],
            ["email", "Work email", "email", true],
            ["organization", "Organization", "text", true],
            ["role", "Role (optional)", "text", false],
          ].map(([id, label, type, required]) => (
            <motion.div
              className="field"
              key={String(id)}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor={String(id)}>
                {label}
                {required ? " *" : ""}
              </label>
              <input
                id={String(id)}
                name={String(id)}
                type={String(type)}
                maxLength={limits[String(id)]}
                autoComplete={
                  id === "name"
                    ? "name"
                    : id === "email"
                      ? "email"
                      : id === "organization"
                        ? "organization"
                        : "organization-title"
                }
                value={data[id as keyof typeof data]}
                required={Boolean(required)}
                onChange={(e) =>
                  setData({ ...data, [String(id)]: e.target.value })
                }
                aria-invalid={!!errors[String(id)]}
                aria-describedby={
                  errors[String(id)] ? `${id}-error` : undefined
                }
                className="micro-focus"
              />
              {errors[String(id)] && (
                <span id={`${id}-error`} className="error">
                  {errors[String(id)]}
                </span>
              )}
            </motion.div>
          ))}
          <motion.div
            className="field full"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <label htmlFor="product">Product interest *</label>
            <select
              id="product"
              name="product"
              required
              aria-invalid={!!errors.product}
              aria-describedby={errors.product ? "product-error" : undefined}
              value={data.product}
              onChange={(e) => setData({ ...data, product: e.target.value })}
              className="micro-focus"
            >
              <option value="not-sure">Help me choose a starting point</option>
              <option value="operations-os">
                Ekarvo Pulse — Operating Intelligence
              </option>
              <option value="autonomous-execution">
                Ekarvo Drive — Autonomous Execution
              </option>
            </select>
            {errors.product && (
              <span id="product-error" className="error">
                {errors.product}
              </span>
            )}
          </motion.div>
          {[
            ["workflow", "What work needs to be done?", true],
            ["criteria", "What would count as success? (optional)", false],
          ].map(([id, label, required]) => (
            <motion.div
              className="field full"
              key={String(id)}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor={String(id)}>
                {label}
                {required ? " *" : ""}
              </label>
              <textarea
                id={String(id)}
                name={String(id)}
                maxLength={limits[String(id)]}
                required={Boolean(required)}
                value={data[id as keyof typeof data]}
                onChange={(e) =>
                  setData({ ...data, [String(id)]: e.target.value })
                }
                aria-invalid={!!errors[String(id)]}
                aria-describedby={`${id}-help${errors[String(id)] ? ` ${id}-error` : ""}`}
                className="micro-focus"
              />
              <small id={`${id}-help`}>
                {data[id as keyof typeof data].length} / {limits[String(id)]}{" "}
                characters
              </small>
              {errors[String(id)] && (
                <span id={`${id}-error`} className="error">
                  {errors[String(id)]}
                </span>
              )}
            </motion.div>
          ))}
        </div>
        <div className="hp" aria-hidden="true">
          <label>
            Website
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={data.website}
              onChange={(e) => setData({ ...data, website: e.target.value })}
            />
          </label>
        </div>
        <p className="small-copy muted">
          Required fields are marked *. Saved requests are removed after 30 days
          during server cleanup. Read the{" "}
          <a
            className="inline-link micro-press"
            href="/landing/legal/privacy-policy"
          >
            Privacy notice
          </a>{" "}
          and{" "}
          <a
            className="inline-link micro-press"
            href="/landing/legal/terms-of-service"
          >
            terms
          </a>
          .
        </p>
        <div className="actions reveal-stagger">
          <motion.button
            className="button micro-press micro-lift micro-shimmer"
            type="submit"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {pending ? "Saving…" : "Save workflow request"}{" "}
            <UIIcon icon={ArrowRight} size={16} />
          </motion.button>
          <motion.button
            className="button secondary micro-press micro-lift"
            type="button"
            onClick={() => download()}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.24,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.04,
            }}
          >
            <UIIcon icon={Download} size={16} /> Download only
          </motion.button>
        </div>
      </fieldset>
      <noscript>
        <p className="no-js">
          JavaScript is needed to save this local form. You can{" "}
          <a href="/downloads/workflow-brief.txt" download>
            download a blank workflow brief
          </a>{" "}
          and complete it in a text editor.
        </p>
      </noscript>
    </motion.form>
  );
}
