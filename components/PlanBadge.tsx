export function PlanBadge({ plan }: { plan: "Free"|"Starter"|"Business" }) {
  const colors: Record<string, string> = { Free: "gray", Starter: "green", Business: "blue" };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs bg-${colors[plan]}-200 text-${colors[plan]}-800 rounded`}>
      {plan}
    </span>
  );
}
