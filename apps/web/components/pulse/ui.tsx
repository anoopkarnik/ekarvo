"use client";
import type { ReactNode, ComponentProps } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button as BaseButton } from "@workspace/ui/components/shadcn/button";
import { Input as BaseInput } from "@workspace/ui/components/shadcn/input";
export function Button({
  className = "",
  variant,
  ...props
}: ComponentProps<typeof BaseButton>) {
  return (
    <BaseButton
      variant={variant}
      className={`${!variant || variant === "default" ? "bg-teal-700 text-white hover:bg-teal-800" : variant === "outline" ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:bg-white dark:text-slate-800" : ""} ${className}`}
      {...props}
    />
  );
}
export function Input({
  className = "",
  ...props
}: ComponentProps<typeof BaseInput>) {
  return (
    <BaseInput
      className={`border-slate-300 bg-white text-slate-900 dark:bg-white dark:text-slate-900 ${className}`}
      {...props}
    />
  );
}
export function usePulseText() {
  const t = useTranslations("pulse");
  return (key: string) => t(key as never);
}
export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-slate-600">
      {label}
      {children}
    </label>
  );
}
export const selectClass =
  "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-teal-600";
export function Metric({
  label,
  value,
  suffix = "",
  dark = false,
}: {
  label: string;
  value: unknown;
  suffix?: string;
  dark?: boolean;
}) {
  const locale = useLocale(),
    t = usePulseText();
  return (
    <div
      className={`rounded-xl border p-5 ${dark ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}
    >
      <div
        className={`text-xs font-medium ${dark ? "text-teal-300" : "text-slate-500"}`}
      >
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
        {typeof value === "number"
          ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}${suffix}`
          : t("noEvidence")}
      </div>
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-lg border p-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-teal-200 bg-teal-50 text-teal-900"}`}
    >
      {children}
    </div>
  );
}
export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  const t = usePulseText();
  return rows.length ? (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            {headers.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-3 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-3 text-slate-700">
                  {cell ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Notice>{t("empty")}</Notice>
  );
}
export function Trend({
  points,
}: {
  points: { start: string; arrivals: number; completions: number }[];
}) {
  const t = usePulseText(),
    max = Math.max(1, ...points.map((p) => p.arrivals));
  return (
    <div>
      <div className="mb-4 flex gap-5 text-xs">
        <span className="text-teal-700">{t("arrivals")}</span>
        <span className="text-slate-500">{t("completions")}</span>
      </div>
      <div className="flex h-40 items-end gap-2">
        {points.map((p) => (
          <div
            key={p.start}
            className="flex h-full flex-1 flex-col justify-end gap-2"
          >
            <div
              className="flex h-32 items-end gap-1"
              aria-label={`${p.start}: ${p.arrivals} / ${p.completions}`}
            >
              <div
                className="min-h-0.5 flex-1 rounded-t bg-teal-600"
                style={{ height: `${(p.arrivals / max) * 100}%` }}
              />
              <div
                className="min-h-0.5 flex-1 rounded-t bg-slate-300"
                style={{ height: `${(p.completions / max) * 100}%` }}
              />
            </div>
            <span className="text-center font-mono text-[10px] text-slate-500">
              {p.start.slice(5, 10)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
