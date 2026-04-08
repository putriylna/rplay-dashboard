import { anton, montserrat } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // [1] import toaster

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${anton.variable} ${montserrat.variable}`}>
      <body className="bg-black text-white font-montserrat">
        <Toaster
          position="top-right"
          reverseOrder={false}
          containerStyle={{
            zIndex: 99999,
          }}
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#fff",
              border: "1px solid #27272a",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#cc111f",
                secondary: "#fff",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
