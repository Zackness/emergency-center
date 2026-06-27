import CenterRegistrationForm, {
  type CenterRegistrationFormLabels,
} from "@/components/dashboard/CenterRegistrationForm";
import type { Locale } from "@/i18n/config";

interface CenterRegisterDialogProps {
  open: boolean;
  mandatory: boolean;
  title: string;
  subtitle: string;
  logoutLabel: string;
  locale: Locale;
  states: string[];
  typeLabels: Record<string, string>;
  acceptLabels: Record<string, string>;
  formLabels: CenterRegistrationFormLabels;
  onSuccess: () => void;
  onClose?: () => void;
}

export default function CenterRegisterDialog({
  open,
  mandatory,
  title,
  subtitle,
  logoutLabel,
  locale,
  states,
  typeLabels,
  acceptLabels,
  formLabels,
  onSuccess,
  onClose,
}: CenterRegisterDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-dialog-title"
    >
      <div
        className={`absolute inset-0 ${mandatory ? "bg-ink/70 backdrop-blur-sm" : "bg-ink/50"}`}
        onClick={mandatory ? undefined : onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[min(90vh,52rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 id="register-dialog-title" className="text-lg font-semibold text-ink">
              {title}
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
          </div>
          {!mandatory && onClose && (
            <button
              type="button"
              className="btn-ghost min-h-9 min-w-9 rounded-lg text-ink-muted"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <CenterRegistrationForm
            locale={locale}
            states={states}
            typeLabels={typeLabels}
            acceptLabels={acceptLabels}
            labels={formLabels}
            onSuccess={onSuccess}
            compact
          />
        </div>

        {mandatory && (
          <div className="border-t border-border bg-surface-muted px-6 py-4">
            <form method="POST" action="/api/auth/logout">
              <button type="submit" className="btn-ghost text-sm text-ink-secondary">
                {logoutLabel}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
