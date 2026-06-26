import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export function QrScanner({
  onScan,
}: {
  onScan: (text: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const id = "qr-reader-" + Math.random().toString(36).slice(2);
    ref.current.id = id;

    const qr = new Html5Qrcode(id);
    let stopped = false;

    const handleScan = (text: string) => {
      if (stopped) return;

      stopped = true;

      qr.stop()
        .then(() => qr.clear())
        .catch(() => {});

      onScan(text);
    };

    const startScanner = async () => {
      try {
        // Coba kamera belakang (HP Android/iPhone)
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          handleScan,
          () => {}
        );
      } catch (err) {
        console.error(
          "Kamera belakang gagal, mencoba kamera depan...",
          err
        );

        try {
          // Fallback ke kamera depan / webcam laptop
          await qr.start(
            { facingMode: "user" },
            { fps: 10, qrbox: 240 },
            handleScan,
            () => {}
          );
        } catch (err2) {
          console.error("Tidak dapat mengakses kamera:", err2);

          alert(
            "Kamera tidak dapat dibuka.\n\n" +
              "Pastikan izin kamera sudah diberikan pada browser atau gunakan input manual."
          );
        }
      }
    };

    startScanner();

    return () => {
      stopped = true;

      qr.stop()
        .then(() => qr.clear())
        .catch(() => {});
    };
  }, [onScan]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-xl border-2 border-sky-200"
    />
  );
}