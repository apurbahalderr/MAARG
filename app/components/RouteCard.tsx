"use client";

import { useState } from "react";
import RouteStatusBadge from "./RouteStatusBadge";
import Icon from "./Icon";

interface Incident {
  title: string;
  time: string;
}

interface RouteCardProps {
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

export default function RouteCard({
  routeName,
  status,
  riskProbability,
  eta,
  distance,
  isRecommended = false,
  recommendationReason,
  riskReasons,
  recentIncidents,
  expectedRecovery,
}: RouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const riskColor =
    status === "safe"
      ? "text-safe"
      : status === "medium"
      ? "text-warning"
      : "text-danger";

  return (
    <div
      className={`flex flex-col rounded-[14px] border bg-surface transition-all duration-200 ${
        isRecommended
          ? "border-safe/60 shadow-md ring-1 ring-safe/25"
          : "border-line shadow-sm hover:border-line-strong"
      }`}
    >
      {isRecommended && (
        <div className="flex items-center gap-1.5 rounded-t-[14px] bg-safe-bg px-6 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-safe">
          <Icon name="shieldCheck" size={14} />
          MAARG recommended route
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold leading-snug text-navy">{routeName}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Icon name="route" size={14} className="text-subtle" />
              Distance{" "}
              <strong className="font-mono font-semibold tabular-nums text-ink">
                {distance}
              </strong>
            </p>
          </div>
          <RouteStatusBadge status={status} size="md" />
        </div>

        {/* Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-line bg-canvas p-4">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Icon name="gauge" size={13} /> Risk probability
            </span>
            <span className={`mt-1 block font-mono text-2xl font-bold tabular-nums ${riskColor}`}>
              {riskProbability}
            </span>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Icon name="clock" size={13} /> Estimated ETA
            </span>
            <span className="mt-1 block font-mono text-2xl font-bold tabular-nums text-navy">
              {eta}
            </span>
          </div>
        </div>

        {/* Recommendation reason */}
        {recommendationReason && (
          <p className="mt-4 flex gap-2.5 rounded-lg border border-line bg-wash p-3.5 text-xs leading-relaxed text-muted">
            <Icon name="lightbulb" size={16} className="mt-0.5 shrink-0 text-saffron-600" />
            <span>{recommendationReason}</span>
          </p>
        )}

        {/* Accordion control */}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-600"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "Hide details" : "Why this route?"}</span>
            <Icon
              name="chevronDown"
              size={16}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-subtle">
            <Icon name="activity" size={13} />
            AI terrain analysis
          </span>
        </div>

        {/* Expanded */}
        {isExpanded && (
          <div className="animate-fadeIn mt-4 space-y-4 rounded-xl border border-line bg-canvas p-5">
            <div>
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy">
                Why is this route evaluated{" "}
                {status === "safe" ? "safe" : status === "medium" ? "medium risk" : "high risk"}?
              </h4>
              <ul className="space-y-1.5 text-xs text-ink">
                {riskReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        status === "safe"
                          ? "bg-safe"
                          : status === "medium"
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy">
                Recent field incidents &amp; reports
              </h4>
              {recentIncidents.length > 0 ? (
                <ul className="space-y-1.5 text-xs">
                  {recentIncidents.map((inc, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-line bg-surface p-2"
                    >
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <Icon name="alertTriangle" size={14} className="text-warning" />
                        {inc.title}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-subtle">
                        {inc.time}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-center gap-2 rounded-md border border-safe-line bg-safe-bg p-2.5 text-xs font-medium text-safe">
                  <Icon name="checkCircle" size={15} />
                  No recent severe disruptions reported on this segment.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-muted">Expected clearance / recovery</span>
              <strong className="text-navy">{expectedRecovery}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
