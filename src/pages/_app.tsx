import { Playfair_Display } from "@next/font/google";
import { type AppType } from "next/dist/shared/lib/utils";

import "~/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["cyrillic", "latin"],
  variable: "--font-playfair",
  display: "swap",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`${playfair.variable} font-serif`}>
      <Component {...pageProps} />
    </main>
  );
};

export default MyApp;
