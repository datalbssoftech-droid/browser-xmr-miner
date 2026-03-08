import { Link } from "react-router-dom";
import { ArrowLeft, Cpu as CpuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const RandomXArticle = () => (
  <div className="min-h-screen">
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <CpuIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-display text-glow">SHRIMINE</span>
        </Link>
        <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
      </div>
    </header>
    <main className="pt-20 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10">
            <CpuIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">How RandomX Works</h1>
            <p className="text-sm text-muted-foreground mt-1">The algorithm behind Monero mining</p>
          </div>
        </div>

        <article className="space-y-6">
          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">What is RandomX?</h2>
            <p className="text-muted-foreground leading-relaxed">
              RandomX is a proof-of-work (PoW) mining algorithm designed specifically for general-purpose CPUs.
              It was introduced in November 2019 (Monero hard fork v12) to replace the previous CryptoNight algorithm.
              The primary goal of RandomX is to make Monero mining as egalitarian as possible by being
              CPU-friendly and ASIC-resistant.
            </p>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Why ASIC Resistance Matters</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ASICs (Application-Specific Integrated Circuits) are custom hardware built solely for mining a specific
              algorithm. When ASICs dominate a network, mining becomes centralized — only wealthy entities can afford
              them. RandomX prevents this by:
            </p>
            <div className="space-y-3">
              {[
                { title: "Random Code Execution", desc: "RandomX generates random programs that are executed in a virtual machine. This unpredictability makes it extremely difficult to build specialized hardware." },
                { title: "Large Memory Requirement", desc: "The algorithm requires 2GB+ of memory (scratchpad), which is standard in CPUs but expensive to implement in ASICs." },
                { title: "Complex Instruction Set", desc: "RandomX uses a diverse set of operations including floating-point arithmetic, integer operations, and memory access patterns that CPUs handle natively." },
                { title: "Program Diversity", desc: "Each mining iteration executes a different randomly generated program, preventing optimization for any single computation pattern." },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-lg bg-primary/5 border border-border/50">
                  <h3 className="text-sm font-bold font-display text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">How RandomX Mining Works</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Initialization", desc: "The miner initializes a 2GB dataset in memory derived from the blockchain. This dataset is recalculated every 2048 blocks (~2.8 days) and is shared across all mining threads." },
                { step: "2", title: "Program Generation", desc: "For each hash attempt, RandomX generates a unique random program using the block header and nonce as seed. This program contains 256 random instructions." },
                { step: "3", title: "Virtual Machine Execution", desc: "The random program runs inside a custom virtual machine that simulates a CPU with registers, memory access, and arithmetic operations. Each program modifies a scratchpad in memory." },
                { step: "4", title: "Hash Computation", desc: "After execution, the VM state is hashed using Blake2b to produce the final output. If the hash meets the network's difficulty target, a valid block is found." },
                { step: "5", title: "Nonce Increment", desc: "If the hash doesn't meet the target, the nonce is incremented and a new random program is generated. This process repeats billions of times per second across all miners." },
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
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Mining Modes</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              RandomX supports two modes depending on available memory:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-border/50">
                <h3 className="font-bold font-display text-foreground mb-2">Fast Mode (2GB+ RAM)</h3>
                <p className="text-sm text-muted-foreground">Uses the full 2GB dataset in memory for maximum performance. Typical hashrates: 5,000-15,000 H/s per CPU.</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-border/50">
                <h3 className="font-bold font-display text-foreground mb-2">Light Mode (256MB RAM)</h3>
                <p className="text-sm text-muted-foreground">Uses a smaller cache and computes dataset entries on-the-fly. ~5-10x slower but works on low-memory devices and browsers.</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">CPU Performance Benchmarks</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Typical hashrates for popular CPUs on RandomX:
            </p>
            <div className="space-y-2">
              {[
                { cpu: "AMD Ryzen 9 5950X", hashrate: "~15,000 H/s", threads: "16T" },
                { cpu: "AMD Ryzen 7 5800X", hashrate: "~8,500 H/s", threads: "8T" },
                { cpu: "Intel i7-12700K", hashrate: "~7,200 H/s", threads: "8T" },
                { cpu: "AMD Ryzen 5 5600X", hashrate: "~6,800 H/s", threads: "6T" },
                { cpu: "Intel i5-12400", hashrate: "~4,500 H/s", threads: "6T" },
                { cpu: "Apple M2", hashrate: "~3,500 H/s", threads: "4T" },
              ].map((item) => (
                <div key={item.cpu} className="flex items-center justify-between p-2 rounded bg-background/50 text-sm">
                  <span className="font-mono text-foreground">{item.cpu}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{item.threads}</span>
                    <span className="font-mono text-primary font-bold">{item.hashrate}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/tools/benchmark">
                <Button variant="neon" size="sm" className="font-mono text-xs">
                  Test Your CPU →
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
);

export default RandomXArticle;
