
export const dynamic = "force-dynamic";
async function fetchList() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const r = await fetch(`${base}/checkout/order`, { cache: "no-store" });
  if (!r.ok) throw new Error("API error");
  return r.json();
}
export default async function Page() {
  const data = await fetchList();
  return (
    <section className="card">
      <h2 className="text-xl font-semibold mb-3">Order — List</h2>
      <ul className="space-y-2">
        {data.map((x: any) => (
          <li key={x.id} className="flex items-center justify-between border-b py-2">
            <span className="font-mono text-sm">{x.id}</span>
            <a className="underline" href={"/checkout/order/" + encodeURIComponent(x.id)}>Detalj →</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
