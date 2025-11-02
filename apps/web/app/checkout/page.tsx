
export default function Page() {
  return (
    <section className="card">
      <h2 className="text-xl font-semibold mb-3">Checkout</h2>
      <ul className="list-disc pl-6">
        <li><a className="underline" href="/checkout/user">User — List</a></li>
        <li><a className="underline" href="/checkout/order">Order — List</a></li>
      </ul>
    </section>
  );
}
