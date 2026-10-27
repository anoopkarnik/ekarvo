import React from "react";
import type { LucideIcon } from "lucide-react";

export const Icon = ({ icon: Glyph, size = 20 }: { icon: LucideIcon; size?: 16 | 20 }) => (
  <Glyph size={size} strokeWidth={1.75} className={`site-icon site-icon--${size}`} aria-hidden="true" />
);
