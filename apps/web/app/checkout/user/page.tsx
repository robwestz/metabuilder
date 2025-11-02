
export const dynamic = "force-dynamic";
async function fetchList() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const r = await fetch(`${base}/checkout/user`, { cache: "no-store" });
  if (!r.ok) throw new Error("API error");
  return r.json();
}
export default async function Page() {
  const data = await fetchList();
  return (
    <section className="card">
      <h2 className="text-xl font-semibold mb-3">User — List</h2>
      <ul className="space-y-2">
        {data.map((x: any) => (
          <li key={x.id} className="flex items-center justify-between border-b py-2">
            <span className="font-mono text-sm">{x.id}</span>
            <a className="underline" href={"/checkout/user/" + encodeURIComponent(x.id)}>Detalj →</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
