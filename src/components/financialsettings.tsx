"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export type FinancialSettings = {
  currencySymbol: string;
  quoteTerms: {
    lines: string[];
    linkHref?: string;
    linkText?: string;
  };
  invoiceTerms: string;
  proofTerms: {
    headline?: string;
    items: Array<{
      text: string;
      variant?: "default" | "danger" | "muted" | "note";
    }>;
  };
};

type FinancialSettingsCardProps = {
  settings: FinancialSettings;
  onEdit?: () => void;
  editAriaLabel?: string;
  className?: string;
};

export function FinancialSettingsCard({
  settings,
  onEdit,
  className,
  editAriaLabel = "Edit financial settings",
}: FinancialSettingsCardProps) {
  const { currencySymbol, quoteTerms, invoiceTerms, proofTerms } = settings;

  return (
    <Card className={cn("rounded-xl border border-border bg-card shadow-lg", className)}>
      <CardHeader className="px-8 pb-0 pt-8">
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col items-start gap-1">
            <CardTitle className="text-[22px] font-semibold text-foreground">
              Financial
            </CardTitle>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="size-9 text-primary hover:bg-transparent hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">{editAriaLabel}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-10 px-8 pb-8 pt-6">
        {/* Currency */}
        <dl className="grid gap-6 md:max-w-sm">
          <Detail label="Currency Symbol" value={currencySymbol || "-"} valueClassName="text-[20px]" />
        </dl>

        {/* Default Quote Terms */}
        <section className="space-y-4">
          <SectionHeading>Default Quote Terms &amp; Conditions</SectionHeading>
          <TermsBlock className="text-center">
            {quoteTerms.lines.map((line, idx) => (
              <TermLine key={idx}>{line}</TermLine>
            ))}
            {(quoteTerms.linkHref || quoteTerms.linkText) && (
              <p className="mx-auto max-w-4xl text-[15px] font-medium leading-7 text-foreground">
                By accepting this quote, you agree to our terms &amp; conditions which can be found{" "}
                <a
                  href={normalizeHref(quoteTerms.linkHref)}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {quoteTerms.linkText || "here"}
                </a>
                .
              </p>
            )}
          </TermsBlock>
        </section>

        {/* Invoice Terms */}
        <section className="space-y-4">
          <SectionHeading>Invoice Terms &amp; Conditions</SectionHeading>
          <p className="mx-auto max-w-5xl text-[16px] font-medium leading-7 text-foreground">
            {invoiceTerms}
          </p>
        </section>

        {/* Proof Terms */}
        <section className="space-y-6">
          <SectionHeading>Proof Terms &amp; Conditions</SectionHeading>

          <h3 className="text-center text-[34px] font-extrabold uppercase leading-tight tracking-wide text-destructive">
            {proofTerms.headline || "⚠️ MUST READ ⚠️"}
          </h3>

          {/* Scrollable container for the long list */}
          <ScrollArea className="h-[420px] w-full">
            <TermsBlock className="text-center pr-4">
              {proofTerms.items.map((item, idx) => (
                <TermLine key={idx} variant={item.variant}>
                  {item.text}
                </TermLine>
              ))}
            </TermsBlock>
          </ScrollArea>
        </section>
      </CardContent>
    </Card>
  );
}

/* ---------- Internals ---------- */

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
      {children}
    </div>
  );
}

function TermsBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {children}
    </div>
  );
}

function TermLine({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "danger" | "muted" | "note";
}) {
  const variantClass =
    variant === "danger"
      ? "text-destructive"
      : variant === "muted"
      ? "text-muted-foreground"
      : "text-foreground";

  const sizeClass = variant === "note" ? "text-[14px]" : "text-[16px]";
  const weightClass = variant === "note" ? "font-normal" : "font-semibold";

  return (
    <p
      className={cn(
        "mx-auto max-w-5xl leading-7",
        "uppercase tracking-[0.08em]",
        sizeClass,
        weightClass,
        variantClass
      )}
    >
      {children}
    </p>
  );
}

function Detail({
  label,
  value,
  children,
  isLink = false,
  valueClassName,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
  isLink?: boolean;
  valueClassName?: string;
}) {
  const content = children ?? value ?? "-";

  return (
    <div className="space-y-1">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn("text-[15px] font-medium leading-6 text-foreground", valueClassName)}
        {...(isLink && value ? { "aria-label": value } : undefined)}
      >
        {isLink && typeof content === "string" ? (
          <a
            href={normalizeHref(content)}
            className="text-primary underline-offset-2 hover:underline"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </dd>
    </div>
  );
}

function normalizeHref(href?: string) {
  if (!href) return "#";
  const trimmed = href.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return `https://${trimmed.replace(/^https?:\/\//, "")}`;
}

