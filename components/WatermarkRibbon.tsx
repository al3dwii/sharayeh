import { Link } from "@/i18n/navigation";

export function WatermarkRibbon() {
  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-100 text-yellow-800 text-center py-1 z-50">
      Free‑plan previews include a watermark. <Link href="/pricing" className="underline">Upgrade</Link> to remove.
    </div>
  );
}
