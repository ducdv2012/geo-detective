import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { appConfig } from "./app.config.ts";

const absoluteAssetUrl = (path: string) => `${appConfig.site.publicUrl}${path}`;

const htmlReplacements: Record<string, string> = {
  "%APP_LOCALE%": appConfig.site.defaultLocale,
  "%APP_THEME_COLOR%": appConfig.site.themeColor,
  "%APP_DESCRIPTION%": appConfig.site.description,
  "%APP_FAVICON%": appConfig.site.faviconPath,
  "%APP_NAME%": appConfig.site.name,
  "%APP_SOCIAL_TITLE%": appConfig.site.socialTitle,
  "%APP_SOCIAL_DESCRIPTION%": appConfig.site.socialDescription,
  "%APP_PUBLIC_URL%": appConfig.site.publicUrl,
  "%APP_SOCIAL_IMAGE%": absoluteAssetUrl(appConfig.site.socialImagePath),
  "%APP_SOCIAL_IMAGE_ALT%": appConfig.site.socialImageAlt,
  "%APP_TWITTER_DESCRIPTION%": appConfig.site.twitterDescription,
  "%APP_BROWSER_TITLE%": appConfig.site.browserTitle,
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: "geo-detective-config",
      transformIndexHtml(html) {
        return Object.entries(htmlReplacements).reduce(
          (output, [token, value]) => output.replaceAll(token, value),
          html,
        );
      },
    },
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
