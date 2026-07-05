import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Persona AI - Chat with Hitesh & Piyush",
  description:
    "Chat with AI-simulated personas of Hitesh Choudhary and Piyush Garg.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
