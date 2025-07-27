type FAQItem = { q: string; a: string };

export function FAQBlock({ items }: { items: FAQItem[] }) {
  return (
    <section style={{ marginTop: "2rem" }}>
      <h2>FAQ</h2>
      <dl>
        {items.map((f) => (
          <div key={f.q} style={{ marginBottom: "1rem" }}>
            <dt style={{ fontWeight: "bold" }}>{f.q}</dt>
            <dd>{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
