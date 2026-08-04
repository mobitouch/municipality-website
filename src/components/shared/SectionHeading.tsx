import { RevealOnScroll } from "./RevealOnScroll";

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className = "",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  const isCenter = align === "center";

  return (
    <RevealOnScroll className={`mb-14 ${isCenter ? "text-center" : ""} ${className}`}>
      <h2 className="text-3xl font-bold text-koura-text dark:text-white">{title}</h2>
      <div className={`mt-3 h-1 w-16 rounded-full bg-koura-primary dark:bg-[#D4AF37] ${isCenter ? "mx-auto" : ""}`} />
      {subtitle && (
        <p className={`mt-4 text-gray-500 dark:text-gray-400 ${isCenter ? "mx-auto max-w-lg" : ""}`}>
          {subtitle}
        </p>
      )}
    </RevealOnScroll>
  );
}
