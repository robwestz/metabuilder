
export const metadata = { title: "MetaBuilder", description: "PSIR + Genesis + Mirror Lab" };
import "./../styles/globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <div className="container py-8">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">MetaBuilder</h1>
            <p className="text-sm text-gray-600">PSIR‑playground & artefakt‑förhandsvisning</p>
            <nav className="mt-3 text-sm">
              <a className="underline mr-4" href="/">Start</a>
              <a className="underline" href="/checkout">Hello‑app: Checkout</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
