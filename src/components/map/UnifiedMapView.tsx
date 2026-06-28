import { useEffect, useState } from "react";
import type { UnifiedMapViewProps } from "@/components/map/UnifiedMapViewInner";

export default function UnifiedMapView(props: UnifiedMapViewProps) {
  const [Inner, setInner] = useState<React.ComponentType<UnifiedMapViewProps> | null>(null);

  useEffect(() => {
    void import("@/components/map/UnifiedMapViewInner").then((mod) => {
      setInner(() => mod.default);
    });
  }, []);

  if (!Inner) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-border bg-surface-muted text-ink-secondary w-full h-[min(70vh,720px)] min-h-[320px]"
      >
        {props.labels.loading}
      </div>
    );
  }

  return <Inner {...props} />;
}
