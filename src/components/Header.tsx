import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-gett-black px-4 text-white shadow-md">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gett-yellow text-sm font-black text-gett-black">
          G
        </span>
        <span className="text-lg font-bold tracking-tight">
          Gett<span className="text-gett-green">Clean</span>
        </span>
      </Link>
      <nav className="flex gap-3 text-sm font-medium">
        <Link href="/book" className="rounded-full px-3 py-1.5 hover:bg-white/10">
          Book
        </Link>
        <Link
          href="/cleaner"
          className="rounded-full bg-gett-green px-3 py-1.5 text-white hover:bg-gett-green-dark"
        >
          Cleaner
        </Link>
      </nav>
    </header>
  );
}
