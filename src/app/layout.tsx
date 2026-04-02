import { anton, montserrat } from '@/lib/fonts';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${montserrat.variable}`}>
      <body className="bg-black text-white font-montserrat">{children}</body>
    </html>
  );
}