"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCloudArrowUp,
  FaLocationDot,
  FaMagnifyingGlass,
  FaXmark,
} from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE,
  MAX_TOTAL_FILES_SIZE,
  reportIssueSchema,
  type ReportIssueFormValues,
  type ReportIssueInput,
} from "@/lib/validation";
import type { ComplaintTypeOption, TrackStep } from "@/types/content";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">…</div>
  ),
});

type Status = "idle" | "submitting" | "success" | "error";

type ErrorKey =
  | "errorMailNotConfigured"
  | "errorRateLimited"
  | "errorBusy"
  | "errorTooLarge"
  | "errorGeneric";

/**
 * Maps an API error code onto a message the citizen can act on. "Try again
 * later" is useless advice when the real problem is that the photos are too
 * big or that they've already filed three complaints this hour.
 */
function errorKeyFor(status: number, code: unknown): ErrorKey {
  if (code === "mail_not_configured") return "errorMailNotConfigured";
  if (code === "too_large" || code === "file_too_large" || code === "too_many_files") {
    return "errorTooLarge";
  }
  if (status === 429) return "errorRateLimited";
  if (status === 503) return "errorBusy";
  if (status === 413) return "errorTooLarge";
  return "errorGeneric";
}

export function ReportIssueForm({ typeOptions }: { typeOptions: ComplaintTypeOption[] }) {
  const t = useTranslations("ReportIssue");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<ErrorKey>("errorGeneric");
  const [fileError, setFileError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // Three generics: what the fields hold, the context type, and what the
    // resolver hands to onSubmit once the schema has sanitised it.
  } = useForm<ReportIssueFormValues, unknown, ReportIssueInput>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      name: "",
      phone: "",
      type: typeOptions[0]?.value as ReportIssueFormValues["type"],
      description: "",
      company: "",
    },
  });

  function addFiles(newFiles: FileList | File[]) {
    const incoming = Array.from(newFiles);
    const combined = [...files, ...incoming];

    if (combined.length > MAX_FILE_COUNT) {
      setFileError(t("validation.tooManyFiles", { max: MAX_FILE_COUNT }));
      return;
    }

    for (const file of incoming) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError(t("validation.fileType"));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(t("validation.fileTooLarge"));
        return;
      }
    }
    if (combined.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_FILES_SIZE) {
      setFileError(t("validation.fileTooLarge"));
      return;
    }

    setFileError(null);
    setFiles(combined);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: ReportIssueInput) {
    setStatus("submitting");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("type", data.type);
      formData.append("description", data.description);
      formData.append("company", data.company ?? "");
      if (location) {
        formData.append("lat", String(location.lat));
        formData.append("lng", String(location.lng));
      }
      files.forEach((file) => formData.append("files", file));

      // Without a deadline a stalled upload leaves the button spinning with
      // no way back; the server caps its own work at 30s, so this is the
      // matching client-side bound.
      const res = await fetch("/api/report-issue", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(45_000),
      });

      const body = await res.json().catch(() => null);

      if (res.ok) {
        setTrackingCode(body?.trackingCode ?? null);
        setStatus("success");
        reset();
        setFiles([]);
        setLocation(null);
        return;
      }

      setErrorKey(errorKeyFor(res.status, body?.error));
      setStatus("error");
    } catch {
      setErrorKey("errorGeneric");
      setStatus("error");
    }
  }

  if (status === "success") {
    const trackSteps = t.raw("trackSteps") as TrackStep[];
    return (
      <div className="py-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <FaCircleCheck className="mb-4 text-5xl text-koura-primary dark:text-[#D4AF37]" />
          <h3 className="mb-2 text-xl font-bold text-koura-text dark:text-white">{t("successTitle")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("successDesc")}</p>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-bold text-gray-500 dark:text-gray-400">
              {t("trackStatusTitle")}: <span className="text-koura-primary dark:text-[#D4AF37]">{t("trackStatusVal")}</span>
            </span>
            {trackingCode && (
              <span dir="ltr" className="font-mono font-bold text-koura-text dark:text-white">
                {t("trackCodeTitle")}: {trackingCode}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            {trackSteps.map((step, i) => (
              <div key={step.title} className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                    i <= 1
                      ? "bg-koura-primary text-white dark:bg-[#D4AF37] dark:text-black"
                      : "bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <p className="text-xs font-bold text-koura-text dark:text-white">{step.title}</p>
                {step.status && <p className="text-[11px] text-gray-500 dark:text-gray-400">{step.status}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/track"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-koura-primary py-3 font-bold text-white transition-colors hover:bg-koura-secondary dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#84cc16]"
          >
            <FaMagnifyingGlass />
            {t("trackLink")}
          </Link>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="flex-1 rounded-xl border-2 border-koura-primary py-3 font-bold text-koura-primary transition-colors hover:bg-koura-primary hover:text-white dark:border-[#D4AF37] dark:text-[#D4AF37] dark:hover:bg-[#D4AF37] dark:hover:text-black"
          >
            {t("newSubmission")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 w-full space-y-6 lg:w-3/5" noValidate>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="report-name" className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {t("labelName")} <span className="text-red-500">*</span>
            </label>
            <input
              id="report-name"
              type="text"
              autoComplete="name"
              {...register("name")}
              maxLength={120}
              placeholder={t("phName")}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "report-name-error" : undefined}
              className="w-full rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-secondary dark:border-white/10 dark:text-white dark:focus:border-[#D4AF37]"
            />
            {errors.name && (
              <p id="report-name-error" role="alert" className="text-xs font-medium text-red-500">
                {t("validation.nameRequired")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="report-phone" className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {t("labelPhone")} <span className="text-red-500">*</span>
            </label>
            <input
              id="report-phone"
              type="tel"
              dir="ltr"
              autoComplete="tel"
              {...register("phone")}
              maxLength={30}
              placeholder={t("phPhone")}
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "report-phone-error" : undefined}
              className="w-full rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-secondary dark:border-white/10 dark:text-white dark:focus:border-[#D4AF37]"
            />
            {errors.phone && (
              <p id="report-phone-error" role="alert" className="text-xs font-medium text-red-500">
                {t("validation.phoneRequired")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="report-type" className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {t("labelType")}
          </label>
          <select
            id="report-type"
            {...register("type")}
            className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-secondary dark:border-white/10 dark:text-gray-300 dark:focus:border-[#D4AF37]"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-[#111]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="report-description" className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {t("labelDesc")} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="report-description"
            rows={5}
            {...register("description")}
            maxLength={4000}
            placeholder={t("phDesc")}
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "report-description-error" : undefined}
            className="w-full resize-none rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-secondary dark:border-white/10 dark:text-white dark:focus:border-[#D4AF37]"
          />
          {errors.description && (
            <p id="report-description-error" role="alert" className="text-xs font-medium text-red-500">
              {t("validation.descRequired")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("labelUpload")}</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
            className="group cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-koura-primary dark:border-white/20 dark:hover:border-[#D4AF37]"
          >
            <FaCloudArrowUp className="mb-2 text-3xl text-gray-400 transition-colors group-hover:text-koura-primary dark:group-hover:text-[#D4AF37]" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("uploadText")}</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t("uploadHint")}</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_FILE_TYPES.join(",")}
              onChange={(e) => e.target.files && addFiles(e.target.files)}
              className="hidden"
            />
          </div>
          {fileError && <p className="text-xs font-medium text-red-500">{fileError}</p>}
          {files.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-koura-text dark:bg-white/10 dark:text-white"
                >
                  <span className="max-w-[140px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={t("removeFile")}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FaXmark />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
          className="mt-4 w-full rounded-xl bg-koura-primary py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-koura-secondary disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#D4AF37] dark:text-black dark:shadow-[0_0_20px_rgba(212,175,53,0.3)] dark:hover:bg-[#84cc16]"
        >
          {status === "submitting" ? t("submitting") : t("submitBtn")}
        </button>
      </form>

      <div className="w-full lg:w-2/5">
        <div className="flex h-full flex-col rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <h3 className="mb-4 text-xl font-bold text-koura-text dark:text-white">{t("mapTitle")}</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t("mapDesc")}</p>

          <div className="relative min-h-[280px] flex-grow overflow-hidden rounded-2xl border-2 border-transparent transition-colors">
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-center text-sm font-bold text-koura-primary dark:bg-black/80 dark:text-[#D4AF37]">
            <FaLocationDot />
            <span>{location ? t("mapSelected") : t("mapAction")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
