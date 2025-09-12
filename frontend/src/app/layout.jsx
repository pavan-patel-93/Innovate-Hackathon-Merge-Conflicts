import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";

export const metadata = {
  title: "ComplianceAI - AI-Powered Compliance Assistant",
  description: "Automated regulatory document validation and compliance checking for Healthtech companies",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
