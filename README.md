# Amioun Municipality — Website

Official website of Amioun Municipality (Lebanon), built with Next.js (App Router). Trilingual — Arabic, English, French — with full RTL/LTR support, dark mode, and email-backed contact/complaint forms.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **next-intl** — locale-prefixed routing (`/ar`, `/en`, `/fr`), messages in `src/messages/*.json`
- **Tailwind CSS v4** — theme tokens in `src/app/globals.css`
- **next-themes** — light/dark mode
- **Framer Motion** — scroll reveals, card tilt, animated stat counters
- **react-hook-form + zod** — form validation (client + server)
- **nodemailer** — email delivery for the Contact and Report an Issue forms
- **react-leaflet** (OpenStreetMap) — location picker on the Report an Issue page

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/ar` (the default locale).

## Environment variables

Copy `.env.example` to `.env.local` and fill in SMTP credentials to enable the Contact and Report an Issue forms:

```bash
cp .env.example .env.local
```

Without these set, both forms validate and submit correctly but the API routes return a clear "email not configured" error instead of silently pretending to succeed — nothing to debug later, just add credentials when you have them.

| Variable | Description |
|---|---|
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Your SMTP server. `SMTP_SECURE=true` only for implicit-TLS (usually port 465). |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials. |
| `MAIL_TO` | Mailbox that receives form submissions. |
| `MAIL_FROM` | Optional; defaults to `SMTP_USER`. |

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build (also type-checks)
npm run start    # run the production build
npm run lint     # ESLint
```

## Project structure

```
src/
├── app/
│   ├── [locale]/            # every page, nested under the locale segment
│   │   ├── layout.tsx       # <html>, theme provider, Header/Footer/WhatsApp/A11y
│   │   ├── page.tsx         # home
│   │   ├── about/ contact/ projects/ news/
│   │   ├── citizen-services/ report-issue/ digital-municipality/
│   ├── api/contact/ api/report-issue/   # form submission routes
│   ├── sitemap.ts, robots.ts, icon.tsx
├── components/
│   ├── layout/    # Header, Footer, LanguageSwitcher, MobileNav, ThemeToggle
│   ├── shared/    # TiltCard, RevealOnScroll, StatCounter, AccessibilityDrawer, WhatsAppButton
│   └── forms/     # ContactForm, ReportIssueForm, LocationPicker
├── i18n/          # next-intl routing/navigation/request config
├── messages/      # ar.json, en.json, fr.json — all translated UI text + content
└── lib/           # validation (zod), mailer (nodemailer), rate limiting
```

Editing site copy (nav labels, news items, project list, council members, etc.) means editing the three files in `src/messages/` — everything text-related lives there, keyed identically across all three languages.

## Deployment

Standard Next.js app — deploys as-is to Vercel, or anywhere that can run `next build && next start` (Node 20+). No database or external services required beyond SMTP for the forms.

Before going live:
- Set `SMTP_*` / `MAIL_TO` / `MAIL_FROM` in your hosting provider's environment variables.
- Update the placeholder domain (`https://amioun.gov.lb`) in `src/app/[locale]/layout.tsx` and `src/app/sitemap.ts` / `src/app/robots.ts` if the real domain differs.
- Swap the placeholder stock photography (Unsplash images on News/Projects, ui-avatars.com avatars on the About page's council cards) for real photos.
- Update the phone/email/address/social links in `src/messages/*.json` (`Nav.phone`, `Nav.email`, `Footer.address`, `Footer` social hrefs) with the municipality's real contact details.

## Notes

- `_legacy-express-site/` at the project root is the previous Express/EJS implementation, kept as a reference and safe to delete once you're happy with this version.
- The language switcher was rebuilt as a click-controlled dropdown (was previously a CSS `:hover` menu with a dead zone between the trigger and the panel that made it close before you could click an option).
