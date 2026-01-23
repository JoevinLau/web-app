import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-primary">LuckyBet</span>
        <Button size="sm">Sign Up</Button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">100% Welcome Bonus</h1>
        <p className="mb-6 text-muted-foreground">Up to $500 on your first deposit</p>
        <Button size="lg">Play Now</Button>
      </section>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        18+ | Gamble responsibly
      </footer>
    </main>
  );
}
