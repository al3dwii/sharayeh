import { Link } from "@/i18n/navigation";

export function GatingBanner({ module }: { module: "scorm"|"video" }) {
  const msgs = {
    scorm: "Want a SCORM package? Upgrade to Pro Edu.",
    video: "Need a narrated video? Upgrade to Business.",
  } as const;
  return (
    <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
      {msgs[module]} <Link href="/pricing" className="underline">See plans</Link>
    </div>
  );
}
