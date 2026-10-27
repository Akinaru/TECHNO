import type { Metadata, Viewport } from "next";
import { Barlow, Lilita_One } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accentStyle } from "@/lib/accent";

const barlow = Barlow({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-barlow" });
const lilita = Lilita_One({ subsets: ["latin"], weight: "400", variable: "--font-lilita" });

export const metadata: Metadata = {
  title: "TechnoDex",
  description: "Garde une trace des DJs vus en teuf avec TechnoDex",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TechnoDex",
  },
};

export const viewport: Viewport = {
  themeColor: "#15161f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { accentColor: true } })
    : null;

  return (
    <html lang="fr" className={`dark ${barlow.variable} ${lilita.variable}`} style={accentStyle(user?.accentColor)} suppressHydrationWarning>
      <body className="camo min-h-screen pb-28 md:pb-0 flex flex-col" suppressHydrationWarning>
        <Providers session={session}>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
