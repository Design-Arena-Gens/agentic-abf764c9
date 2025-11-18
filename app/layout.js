import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Every Journey Is Different",
  description: "A short, emotional scene sequence.",
  openGraph: {
    title: "Every Journey Is Different",
    description: "A short, emotional scene sequence.",
    url: "https://agentic-abf764c9.vercel.app",
    siteName: "Every Journey Is Different",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Every Journey Is Different",
    description: "A short, emotional scene sequence."
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
