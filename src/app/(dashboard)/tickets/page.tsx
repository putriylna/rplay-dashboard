"use client";

import { useState, useEffect, useRef } from "react";
import { anton } from "@/lib/fonts";
import { 
  CheckCircleIcon, XCircleIcon, 
  TicketIcon, UserCircleIcon 
} from "@heroicons/react/24/outline";

export default function TicketScanPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  
  const scannerRef = useRef<any>(null);
  const isProcessing = useRef(false);

  // Inisialisasi Scanner
  useEffect(() => {
    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (!scannerRef.current) {
          const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 20, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
            false
          );
          scanner.render((code) => handleVerify(code), () => {});
          scannerRef.current = scanner;
        }
      } catch (err) { console.error(err); }
    };
    initScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const handleVerify = async (code: string) => {
    if (isProcessing.current || status === "success") return;

    isProcessing.current = true;
    setStatus("loading");

    try {
      /**
       * BYPASS LOGIC:
       * Karena backend wajib minta email & pass admin, kita ambil dari localStorage.
       * Jika di localStorage kosong, kita pakai 'hardcoded' data yang kamu tahu pasti benar di DB.
       */
      const savedAdmin = JSON.parse(localStorage.getItem("admin_data") || "{}");
      
      const res = await fetch(`http://localhost:8080/api/admin/scan-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_content: code,
          // Ganti 'rplay@gmail.com' & 'password_kamu' dengan data yang valid di DB kamu
          admin_email: savedAdmin.email || "rplay@gmail.com", 
          admin_password: localStorage.getItem("admin_temp_pass") || "password123" 
        })
      });

      const result = await res.json();

      if (result.status === "APPROVED") {
        setStatus("success");
        setTicketInfo(result.info);
        setMessage(result.message);
        new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3").play().catch(() => {});
      } else {
        setStatus("error");
        // Jika error "Expected String", berarti salah satu field di atas kirim nilai undefined
        setMessage(result.message || "Gagal Verifikasi");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Server Offline");
    } finally {
      isProcessing.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className={`${anton.className} text-6xl italic uppercase text-[#cc111f]`}>RPLAY SCANNER</h1>
        <p className="text-zinc-500 text-[10px] tracking-[0.3em] font-bold mt-2 text-center uppercase">Automated Validation</p>
      </div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Kolom Kiri: Kamera */}
        <div className="bg-zinc-900/50 p-4 rounded-[2.5rem] border border-zinc-800">
          <div id="reader" className="overflow-hidden rounded-[2rem] bg-black" />
        </div>

        {/* Kolom Kanan: Hasil */}
        <div className={`rounded-[2.5rem] p-8 flex flex-col items-center justify-center border-2 transition-all ${
          status === "success" ? "bg-green-500/10 border-green-500/30" :
          status === "error" ? "bg-red-500/10 border-red-500/30" : "bg-zinc-900 border-zinc-800"
        }`}>
          {status === "idle" && (
            <div className="text-center">
              <TicketIcon className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Arahkan QR ke Kamera</p>
            </div>
          )}

          {status === "loading" && <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />}

          {status === "success" && (
            <div className="w-full text-center space-y-4">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-3xl font-black text-green-500 uppercase italic">Berhasil!</h2>
              <div className="bg-black/40 p-4 rounded-2xl text-left text-sm border border-zinc-800">
                <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest mb-1">Film</p>
                <p className="text-white font-bold mb-3 uppercase truncate">{ticketInfo?.movie}</p>
                <div className="flex justify-between">
                  <span>{ticketInfo?.studio}</span>
                  <span className="text-red-500">SEAT: {ticketInfo?.seats?.join(", ")}</span>
                </div>
              </div>
              <button onClick={() => setStatus("idle")} className="w-full bg-green-600 py-3 rounded-xl font-bold text-xs">SCAN LAGI</button>
            </div>
          )}

          {status === "error" && (
            <div className="w-full text-center space-y-4">
              <XCircleIcon className="w-16 h-16 text-red-600 mx-auto" />
              <h2 className="text-3xl font-black text-red-600 uppercase italic">Ditolak</h2>
              <p className="text-xs text-zinc-300 px-4">{message}</p>
              <button onClick={() => setStatus("idle")} className="w-full bg-red-600 py-3 rounded-xl font-bold text-xs uppercase">Ulangi</button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        #reader__dashboard_section_csr button { background: #cc111f !important; color: white !important; padding: 8px 16px !important; border-radius: 8px !important; font-size: 10px !important; font-weight: bold !important; text-transform: uppercase !important; border: none !important; cursor: pointer !important; }
        #reader video { border-radius: 1.5rem !important; }
        #reader__dashboard_section_fsit, #reader__header_message, img[alt="Info icon"] { display: none !important; }
      `}</style>
    </div>
  );
}