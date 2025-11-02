
export const dynamic = "force-dynamic";
async function fetchItem(id: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const r = await fetch(`${base}/checkout/order/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Not found");
  return r.json();
}
export default async function Page({ params }: { params: { id: string }}) {
  const data = await fetchItem(params.id);
  return (
    <section className="card">
      <h2 className="text-xl font-semibold mb-3">Order — Detail</h2>
      <pre className="text-xs bg-gray-50 dark:bg-gray-950 p-3 rounded overflow-auto"><code>{JSON.stringify(data, null, 2)}</code></pre>
      <a className="inline-block mt-4 underline" href="/checkout/order">← Till listan</a>
    </section>
  );
}
