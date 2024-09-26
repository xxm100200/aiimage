import SearchModal from "@/components/SearchModal";
import TwSizeIndicator from "@/helpers/TwSizeIndicator";
import { getTranslations } from "@/lib/languageParser";
import Footer from "@/partials/Footer";
import Header from "@/partials/Header";
import Providers from "@/partials/Providers";
import "@/styles/main.scss";

import config from "@/config/config.json";
import theme from "@/config/theme.json";
import { getSinglePage } from "@/lib/contentParser";
import { getActiveLanguages, getLanguageObj } from "@/lib/languageParser";
import { RegularPage } from "@/types";
import path from "path";
import { headers } from 'next/headers';
import { useEffect } from 'react';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const menu = await getTranslations(params.lang);
  const pf = theme.fonts.font_family.primary;
  const sf = theme.fonts.font_family.secondary;

  return (
    <html suppressHydrationWarning={true} lang={params.lang}>
      <head>
        {/* responsive meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* favicon */}
        <link rel="shortcut icon" href={config.site.favicon} />
        {/* theme meta */}
        <meta name="theme-name" content="nextplate" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#fff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#000"
        />

        {/* google font css */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href={`https://fonts.googleapis.com/css2?family=${pf}${
            sf ? "&family=" + sf : ""
          }&display=swap`}
          rel="stylesheet"
        />
      </head>

      <body suppressHydrationWarning={true}>
        <>
          <TwSizeIndicator />
          <Providers>
            <Header lang={params.lang} menu={menu} />
            <SearchModal lang={params.lang} />
            <main>{children}</main>
            <Footer lang={params.lang} menu={menu} />
          </Providers>
        </>
      </body>
    </html>
  );
}
