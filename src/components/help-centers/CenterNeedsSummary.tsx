import { AlertCircle, AlertTriangle } from "lucide-react";
import type { HelpCenterNeedsSummary } from "@/lib/help-centers/types";

const CRITICAL_PREVIEW = 3;
const LOW_PREVIEW = 2;

export interface CenterNeedsSummaryLabels {
  criticalTitle: string;
  lowTitle: string;
  more: string;
}

interface CenterNeedsSummaryProps {
  summary: HelpCenterNeedsSummary;
  labels: CenterNeedsSummaryLabels;
}

export default function CenterNeedsSummary({ summary, labels }: CenterNeedsSummaryProps) {
  const hasCritical = summary.criticalCount > 0;
  const hasLow = summary.lowCount > 0;
  if (!hasCritical && !hasLow) return null;

  const criticalPreview = summary.critical.slice(0, CRITICAL_PREVIEW);
  const criticalRemaining = summary.criticalCount - criticalPreview.length;
  const lowPreview = summary.low.slice(0, LOW_PREVIEW);
  const lowRemaining = summary.lowCount - lowPreview.length;

  return (
    <div className="mt-3 space-y-2">
      {hasCritical && (
        <div className="rounded-xl border border-emergency/30 bg-emergency-muted/50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emergency">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {labels.criticalTitle}
          </p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-emergency">
            {criticalPreview.map((name) => (
              <li key={name}>· {name}</li>
            ))}
            {criticalRemaining > 0 && (
              <li className="text-emergency/80">
                {labels.more.replace("{count}", String(criticalRemaining))}
              </li>
            )}
          </ul>
        </div>
      )}
      {hasLow && (
        <div className="rounded-xl border border-warning/30 bg-warning-muted/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {labels.lowTitle}
          </p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-warning">
            {lowPreview.map((name) => (
              <li key={name}>· {name}</li>
            ))}
            {lowRemaining > 0 && (
              <li className="text-warning/80">
                {labels.more.replace("{count}", String(lowRemaining))}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
