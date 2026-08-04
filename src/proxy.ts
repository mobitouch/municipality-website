import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Excludes API routes, Next internals, and the file-convention metadata
  // routes (icon/apple-icon/opengraph-image have no dot in their path, so
  // the `.*\..*` exclusion alone doesn't catch them — without this they'd
  // get locale-prefixed to /en/icon and 404).
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
  ],
};
