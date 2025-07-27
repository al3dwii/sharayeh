type Props = {
  module: string;
  planGate: string;
};

export function ModuleBadge({ module, planGate }: Props) {
  const enabled = module === "deck"; // until backend flags fetched
  if (!enabled) {
    return (
      <span style={{ fontSize: "0.9em", color: "#a00", marginLeft: "0.5rem" }}>
        Requires {planGate} plan
      </span>
    );
  }
  if (planGate !== "free") {
    return (
      <span style={{ fontSize: "0.9em", color: "#555", marginLeft: "0.5rem" }}>
        Upgrade for {module}
      </span>
    );
  }
  return (
    <span style={{ fontSize: "0.9em", color: "#090", marginLeft: "0.5rem" }}>
      Available
    </span>
  );
}
