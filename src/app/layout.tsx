import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khanadoo",
  description: "Campus food, delivered smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full scroll-smooth antialiased"
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
      </body>
    </html>
  );
}
