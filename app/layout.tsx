import type { Metadata } from "next";
import { CartProvider } from "@/src/context/CartContext";
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
