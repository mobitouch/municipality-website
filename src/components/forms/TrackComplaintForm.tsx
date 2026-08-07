"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FaCircleExclamation, FaMagnifyingGlass } from "react-icons/fa6";
import {
  trackSchema,
  type TrackFormValues,
  type TrackInput,
} from "@/lib/validation";
import type { DashboardTrackingStatus } from "@/lib/dashboard";

type Status = "idle" | "submitting" | "success" | "error";

const STEP_KEYS = ["received", "review", "progress", "resolved"] as const;

// Collapses the dashboard's 7 internal statuses into the 4-step public
// progress bar citizens see; Rejected gets its own note instead of a step.
function stepIndex(status: string): number {
  switch (status) {
    case "New":
      return 0;
    case "Under Review":
    case "Assigned":
      return 1;
    case "In Progress":
      return 2;
    case "Resolved":
    case "Closed":
      return 3;
    default:
      return 0;
  }
}

export function TrackComplaintForm() {
  const t = useTranslations("Track");
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<
    "errorNotFound" | "errorRateLimited" | "errorGeneric"
  >("errorGeneric");
  const [result, setResult] = useState<DashboardTrackingStatus | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackFormValues, unknown, TrackInput>({
    resolver: zodResolver(trackSchema),
    defaultValues: { reference: "", contact: "" },
  });

  async function onSubmit(data: TrackInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(20_000),
      });

      const body = await res.json().catch(() => null);

      if (res.ok) {
        setResult(body?.status ?? null);
        setStatus("success");
        return;
      }

      if (res.status === 429) setErrorKey("errorRateLimited");
      else setErrorKey(body?.error === "not_found" ? "errorNotFound" : "errorGeneric");
      setStatus("error");
    } catch {
      setErrorKey("errorGeneric");
      setStatus("error");
    }
  }

  if (status === "success" && result) {
    const isRejected = result.status === "Rejected";
    const currentStep = stepIndex(result.status);

    return (
      <div className="py-2">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-6 dark:border-white/10">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">{t("resultReference")}</p>
            <p dir="ltr" className="font-mono text-lg font-bold text-koura-text dark:text-white">
              {result.referenceNumber}
            </p>
          </div>
          <span className="rounded-full bg-koura-primary/10 px-4 py-2 text-sm font-bold text-koura-primary dark:bg-[#D4AF37]/10 dark:text-[#D4AF37]">
            {t.has(`statuses.${result.status}`) ? t(`statuses.${result.status}`) : result.status}
          </span>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-bold text-gray-500 dark:text-gray-400">{t("resultCategory")}</p>
            <p className="text-koura-text dark:text-white">{result.category}</p>
          </div>
          {result.departmentName && (
            <div>
              <p className="font-bold text-gray-500 dark:text-gray-400">{t("resultDepartment")}</p>
              <p className="text-koura-text dark:text-white">{result.departmentName}</p>
            </div>
          )}
          <div>
            <p className="font-bold text-gray-500 dark:text-gray-400">{t("resultSubmitted")}</p>
            <p className="text-koura-text dark:text-white">
              {new Date(result.dateSubmitted).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-bold text-gray-500 dark:text-gray-400">{t("resultUpdated")}</p>
            <p className="text-koura-text dark:text-white">
              {new Date(result.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isRejected ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {t("rejectedNote")}
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {STEP_KEYS.map((key, i) => (
                <div key={key} className="flex flex-1 flex-col items-center text-center">
                  <div
                    className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                      i <= currentStep
                        ? "bg-koura-primary text-white dark:bg-[#D4AF37] dark:text-black"
                        : "bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p className="text-xs font-bold text-koura-text dark:text-white">{t(`steps.${key}`)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.timeline.length > 0 && (
          <div className="mb-8">
            <h4 className="mb-4 text-sm font-bold text-koura-text dark:text-white">{t("timelineTitle")}</h4>
            <ul className="space-y-4 border-s-2 border-gray-200 ps-4 dark:border-white/10">
              {result.timeline
                .slice()
                .reverse()
                .map((event, i) => (
                  <li key={i}>
                    <p className="text-sm font-bold text-koura-text dark:text-white">
                      {t.has(`activity.${event.action}`) ? t(`activity.${event.action}`) : event.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{event.detail}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setResult(null);
          }}
          className="w-full rounded-xl border-2 border-koura-primary py-3 font-bold text-koura-primary transition-colors hover:bg-koura-primary hover:text-white dark:border-[#D4AF37] dark:text-[#D4AF37] dark:hover:bg-[#D4AF37] dark:hover:text-black"
        >
          {t("searchAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="track-reference" className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {t("labelReference")} <span className="text-red-500">*</span>
          </label>
          <input
            id="track-reference"
            type="text"
            dir="ltr"
            {...register("reference")}
            maxLength={40}
            placeholder={t("phReference")}
            aria-required="true"
            aria-invalid={!!errors.reference}
            aria-describedby={errors.reference ? "track-reference-error" : undefined}
            className="w-full rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-secondary dark:border-white/10 dark:text-white dark:focus:border-[#D4AF37]"
          />
          {errors.reference && (
            <p id="track-reference-error" role="alert" className="text-xs font-medium text-red-500">
              {t("validation.referenceRequired")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="track-contact" className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {t("labelContact")} <span className="text-red-500">*</span>
          </label>
          <input
            id="track-contact"
            type="text"
            dir="ltr"
            autoComplete="tel"
            {...register("contact")}
            maxLength={160}
            placeholder={t("phContact")}
            aria-required="true"
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? "track-contact-error" : undefined}
            className="w-full rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-secondary dark:border-white/10 dark:text-white dark:focus:border-[#D4AF37]"
          />
          {errors.contact && (
            <p id="track-contact-error" role="alert" className="text-xs font-medium text-red-500">
              {t("validation.contactRequired")}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 overflow-hidden rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
          >
            <FaCircleExclamation className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">{t("errorTitle")}</p>
              <p>{t(errorKey)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-koura-primary py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-koura-secondary disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#D4AF37] dark:text-black dark:shadow-[0_0_20px_rgba(212,175,53,0.3)] dark:hover:bg-[#84cc16]"
      >
        <FaMagnifyingGlass />
        {status === "submitting" ? t("submitting") : t("submitBtn")}
      </button>
    </form>
  );
}
