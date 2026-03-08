import { Link } from "react-router-dom";
import { ArrowLeft, Cpu, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

const BrowserVsGpuArticle = () => (
  <div className="min-h-screen">
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-display text-glow">HARIMINE</span>
        </Link>
        <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
      </div>
    </header>
    <main className="pt-20 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10">
            <Monitor className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">Browser Mining vs GPU Mining</h1>
            <p className="text-sm text-muted-foreground mt-1">Comparing mining approaches for Monero</p>
          </div>
        </div>

        <article className="space-y-6">
          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              When it comes to mining Monero, there are several approaches: browser-based mining, CPU mining with
              dedicated software, and GPU mining. Each has its own trade-offs in terms of accessibility, performance,
              and profitability. Since Monero uses the RandomX algorithm (which is CPU-optimized), the landscape is
              quite different from GPU-dominated coins like Ethereum Classic.
            </p>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Comparison Table</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 font-display text-foreground">Feature</th>
                    <th className="text-left py-2 px-3 font-display text-primary">Browser Mining</th>
                    <th className="text-left py-2 px-3 font-display text-foreground">CPU Mining</th>
                    <th className="text-left py-2 px-3 font-display text-foreground">GPU Mining</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["Setup Time", "Instant", "10-30 min", "30-60 min"],
                    ["Software Needed", "None (browser)", "XMRig", "XMRig + drivers"],
                    ["Typical Hashrate", "100-500 H/s", "3,000-15,000 H/s", "500-2,000 H/s"],
                    ["Hardware Cost", "$0 (existing)", "$0 (existing)", "$200-$1,000+"],
                    ["Power Usage", "Low (15-65W)", "Medium (65-150W)", "High (100-300W)"],
                    ["Profitability", "Low", "Medium-High", "Low (not optimized)"],
                    ["Accessibility", "★★★★★", "★★★☆☆", "★★☆☆☆"],
                    ["Best For", "Beginners", "Serious miners", "Other coins"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-border/30">
                      {row.map((cell, i) => (
                        <td key={i} className={`py-2 px-3 ${i === 0 ? "font-bold text-foreground" : ""} ${i === 1 ? "text-primary" : ""}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Browser Mining Explained</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Browser mining uses WebAssembly (WASM) to run mining algorithms directly in your web browser.
              While it produces lower hashrates compared to native CPU mining software, it offers unmatched
              convenience.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="text-sm font-bold text-primary mb-1">✓ Advantages</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Zero setup — works on any device</li>
                  <li>• No software installation needed</li>
                  <li>• Mine from phone, tablet, or laptop</li>
                  <li>• Easy to start and stop</li>
                  <li>• Perfect for testing/learning</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <h3 className="text-sm font-bold text-destructive mb-1">✗ Limitations</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Lower hashrate than native mining</li>
                  <li>• WASM overhead (~5-10x slower)</li>
                  <li>• Browser must stay open</li>
                  <li>• Limited thread control</li>
                  <li>• Higher CPU temps in browser</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Why GPUs Aren't Great for Monero</h2>
            <p className="text-muted-foreground leading-relaxed">
              Unlike Bitcoin or Ethereum, Monero's RandomX algorithm is specifically designed for CPUs. GPUs actually
              perform worse than CPUs on RandomX because the algorithm relies heavily on random memory access patterns
              and complex branching logic — operations where CPUs excel but GPUs struggle. A $300 CPU will typically
              outperform a $500 GPU on Monero by 3-5x. This is by design, ensuring that anyone with a standard
              computer can participate in mining without needing expensive specialized hardware.
            </p>
          </div>

          <div className="stat-card">
            <h2 className="text-xl font-display font-bold mb-3 text-foreground">Which Should You Choose?</h2>
            <div className="space-y-3">
              {[
                { who: "Complete Beginners", rec: "Browser Mining", desc: "Start with Harimine to learn how mining works with zero setup. You'll earn small amounts but gain valuable experience." },
                { who: "Intermediate Users", rec: "CPU Mining (XMRig)", desc: "For serious mining, install XMRig on your PC. You'll get 5-10x better hashrate than browser mining with the same hardware." },
                { who: "Advanced Miners", rec: "Multiple CPUs", desc: "Scale up with multiple CPUs or rent cloud servers. RandomX rewards CPU count and quality, not GPU quantity." },
              ].map((item) => (
                <div key={item.who} className="p-4 rounded-lg bg-primary/5 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{item.who}</span>
                    <span className="text-sm font-bold font-display text-foreground">→ {item.rec}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <Link to="/tools/benchmark">
                <Button variant="neon" size="sm" className="font-mono text-xs">
                  Benchmark Your CPU →
                </Button>
              </Link>
              <Link to="/tools/calculator">
                <Button variant="outline" size="sm" className="font-mono text-xs">
                  Calculate Earnings →
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
);

export default BrowserVsGpuArticle;
