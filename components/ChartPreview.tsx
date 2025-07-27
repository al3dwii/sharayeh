export function ChartPreview({ url }: { url: string }) {
  return (
    <div className="border rounded p-2">
      <img src={url} alt="Chart preview" className="w-full h-auto" />
    </div>
  );
}
