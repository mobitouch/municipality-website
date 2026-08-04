"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FaCircleCheck, FaCircleExclamation, FaPaperPlane } from "react-icons/fa6";
import { contactSchema, type ContactInput } from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("Contact");
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<"errorMailNotConfigured" | "errorGeneric">("errorGeneric");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", contact: "", message: "", company: "" },
  });

  async function onSubmit(data: ContactInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        reset();
        return;
      }

      const body = await res.json().catch(() => null);
      setErrorKey(body?.error === "mail_not_configured" ? "errorMailNotConfigured" : "errorGeneric");
      setStatus("error");
    } catch {
      setErrorKey("errorGeneric");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FaCircleCheck className="mb-4 text-5xl text-koura-primary dark:text-[#D4AF37]" />
        <h3 className="mb-2 text-xl font-bold text-koura-text dark:text-white">{t("successTitle")}</h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{t("successDesc")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="rounded-xl border-2 border-koura-primary px-6 py-2 font-bold text-koura-primary transition-colors hover:bg-koura-primary hover:text-white dark:border-[#D4AF37] dark:text-[#D4AF37] dark:hover:bg-[#D4AF37] dark:hover:text-black"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-6" noValidate>
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("labelName")}</label>
        <input
          type="text"
          {...register("name")}
          placeholder={t("phName")}
          className="w-full rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-primary dark:border-white/10 dark:text-white dark:focus:border-[#D4AF37] dark:focus:shadow-[0_0_15px_rgba(212,175,53,0.3)]"
        />
        {errors.name && <p className="text-xs font-medium text-red-500">{t("validation.nameRequired")}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("labelEmail")}</label>
        <input
          type="text"
          dir="ltr"
          {...register("contact")}
          placeholder={t("phEmail")}
          className="w-full rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-primary dark:border-white/10 dark:text-white dark:focus:border-[#D4AF37] dark:focus:shadow-[0_0_15px_rgba(212,175,53,0.3)]"
        />
        {errors.contact && <p className="text-xs font-medium text-red-500">{t("validation.contactRequired")}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("labelMsg")}</label>
        <textarea
          rows={4}
          {...register("message")}
          placeholder={t("phMsg")}
          className="w-full resize-none rounded-xl border-2 border-gray-200 bg-transparent px-4 py-3 text-koura-text outline-none transition-colors focus:border-koura-primary dark:border-white/10 dark:text-white dark:focus:border-[#D4AF37] dark:focus:shadow-[0_0_15px_rgba(212,175,53,0.3)]"
        />
        {errors.message && <p className="text-xs font-medium text-red-500">{t("validation.messageRequired")}</p>}
      </div>

      {/* Honeypot — hidden from real users, bots often fill every field */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register("company")}
        className="hidden"
        aria-hidden="true"
      />

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
        className="flex items-center gap-2 rounded-xl bg-koura-primary px-8 py-3 font-bold text-white shadow-md transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 dark:bg-[#D4AF37] dark:text-black"
      >
        <span>{status === "submitting" ? t("sending") : t("sendBtn")}</span>
        <FaPaperPlane />
      </button>
    </form>
  );
}
