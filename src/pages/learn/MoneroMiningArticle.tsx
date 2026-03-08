import { Link } from "react-router-dom";
import { ArrowLeft, Cpu, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const MoneroMiningArticle = () => (
  <div className="min-h-screen">
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-display text-glow">SHRIMINE</span>
        </Link>
        <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
      </div>
    </header>
    <main className="pt-20 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">What is Monero Mining?</h1>
            <p className="text-sm text-muted-foreground mt-1">A comprehensive guide to mining XMR</p>
          </div>
        </div>

        <article className="prose prose-invert max-w-none space-y-6">
          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Introduction to Monero</h2>
            <p className="text-muted-foreground leading-relaxed">
              Monero (XMR) is a privacy-focused cryptocurrency launched in 2014. Unlike Bitcoin, where all transactions
              are publicly visible on the blockchain, Monero uses advanced cryptographic techniques to ensure that
              sender, receiver, and transaction amounts remain completely private. This makes Monero the leading
              privacy coin in the cryptocurrency space.
            </p>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">What is Mining?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mining is the process of using computational power to validate transactions and add new blocks to the
              blockchain. Miners compete to solve complex mathematical puzzles, and the first miner to find a valid
              solution gets to add the next block and receives a reward in XMR. This process is called
              Proof-of-Work (PoW).
            </p>
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-border/50">
              <h3 className="text-sm font-bold font-display mb-2 text-foreground">Key Mining Concepts:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary">•</span> <strong className="text-foreground">Hashrate</strong> — The speed at which your hardware can perform mining calculations, measured in hashes per second (H/s)</li>
                <li className="flex items-start gap-2"><span className="text-primary">•</span> <strong className="text-foreground">Block Reward</strong> — The amount of XMR awarded for successfully mining a block (~0.6 XMR currently)</li>
                <li className="flex items-start gap-2"><span className="text-primary">•</span> <strong className="text-foreground">Difficulty</strong> — Adjusts every block to maintain a ~2 minute block time regardless of total network hashrate</li>
                <li className="flex items-start gap-2"><span className="text-primary">•</span> <strong className="text-foreground">Mining Pool</strong> — A group of miners who combine their hashrate and share rewards proportionally</li>
              </ul>
            </div>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Why Mine Monero?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Monero stands out from other cryptocurrencies for mining due to several key advantages:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: "CPU-Friendly", desc: "Monero's RandomX algorithm is optimized for consumer CPUs, not expensive ASICs or GPUs." },
                { title: "Fair Distribution", desc: "No pre-mine, no ICO. Every XMR in existence was mined by the community." },
                { title: "Tail Emission", desc: "Unlike Bitcoin, Monero will always produce 0.6 XMR per block, ensuring miners are always incentivized." },
                { title: "Privacy by Default", desc: "All transactions are private. Your mining earnings can't be traced or linked to your identity." },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-lg bg-primary/5 border border-border/50">
                  <h3 className="text-sm font-bold font-display text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">How to Start Mining</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Get a Monero Wallet", desc: "Download the official Monero GUI/CLI wallet or use a lightweight wallet like Cake Wallet. Your wallet provides a unique address where mining rewards are sent." },
                { step: "2", title: "Choose Your Mining Method", desc: "You can mine solo (find blocks yourself), join a mining pool (combine hashrate with others), or use browser-based mining like Shrimine for the easiest setup." },
                { step: "3", title: "Configure and Start", desc: "Set your wallet address, choose the number of CPU threads to use, and start mining. With Shrimine, this is as simple as clicking a button." },
                { step: "4", title: "Monitor and Earn", desc: "Watch your hashrate and earnings in real-time. Pool payouts are typically sent automatically once you reach the minimum payout threshold." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold font-mono">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Mining Economics</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your mining profitability depends on several factors: your hashrate, electricity costs, XMR price, and
              network difficulty. A typical modern CPU like the AMD Ryzen 7 5800X can achieve around 8,000-10,000 H/s
              on RandomX. At current network difficulty levels, solo mining a block is extremely unlikely for
              individual miners — that's why mining pools exist, allowing you to earn consistent smaller rewards.
            </p>
            <div className="mt-4">
              <Link to="/tools/calculator">
                <Button variant="neon" size="sm" className="font-mono text-xs">
                  Try the Mining Calculator →
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
);

export default MoneroMiningArticle;
