"use client";

import { useEffect } from "react";
import RouteCard from "./RouteCard";
import Icon from "./Icon";

interface Incident {
  title: string;
  time: string;
}

export interface RouteModalData {
  id: string;
  routeName: string;
  status: "safe" | "medium" | "high";
  riskProbability: string;
  eta: string;
  distance: string;
  isRecommended?: boolean;
  recommendationReason?: string;
  riskReasons: string[];
  recentIncidents: Incident[];
  expectedRecovery: string;
}

interface RouteModalProps {
  route: RouteModalData | null;
  onClose: () => void;
}

export default function RouteModal({ route, onClose }: RouteModalProps) {
  /* Close on Escape */
  useEffect(() => {
    if (!route) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [route, onClose]);

  if (!route) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={route.routeName}
    >
      {/* Modal panel — stop propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface shadow-sm text-muted transition-colors hover:bg-wash hover:text-navy"
          aria-label="Close route details"
        >
          <Icon name="close" size={16} />
        </button>

        <RouteCard {...route} />
      </div>
    </div>
  );
}
