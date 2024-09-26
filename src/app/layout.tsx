import config from "@/config/config.json";
import theme from "@/config/theme.json";
import "@/styles/main.scss";
import { headers } from 'next/headers';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: {
  children: Props;
}) {
  // import google font css
  const pf = theme.fonts.font_family.primary;
  const sf = theme.fonts.font_family.secondary;
  
  return children;
}
