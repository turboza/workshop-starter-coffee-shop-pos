import type { Metadata } from "next";
import { CartProvider } from "@/src/context/CartContext";
import { ThemeProvider } from "@/src/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lina's POS",
  description: "Coffee shop point of sale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
