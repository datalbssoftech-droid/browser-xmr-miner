import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowLeftRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const units = [
  { label: "H/s", factor: 1 },
  { label: "KH/s", factor: 1_000 },
  { label: "MH/s", factor: 1_000_000 },
  { label: "GH/s", factor: 1_000_000_000 },
];

const HashrateConverterPage = () => {
  const [value, setValue] = useState(1000);
  const [fromUnit, setFromUnit] = useState(0); // index into units

  const baseValue = value * units[fromUnit].factor;

  return (
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
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <ArrowLeftRight className="h-8 w-8 text-primary" />
            Hashrate Converter
          </h1>
          <p className="text-muted-foreground mb-8">Convert between H/s, KH/s, MH/s, and GH/s.</p>

          <div className="stat-card space-y-4 mb-6">
            <div>
              <Label className="text-xs text-muted-foreground">Value</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="mt-1 font-mono bg-background/50 text-lg"
              />
            </div>
            <div className="flex gap-2">
              {units.map((u, i) => (
                <Button
                  key={u.label}
                  variant={fromUnit === i ? "neon" : "outline"}
                  size="sm"
                  onClick={() => setFromUnit(i)}
                  className="font-mono"
                >
                  {u.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {units.map((u) => (
              <div key={u.label} className="stat-card text-center">
                <p className="text-xs text-muted-foreground mb-1">{u.label}</p>
                <p className="text-xl font-bold font-mono text-primary">
                  {(baseValue / u.factor).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HashrateConverterPage;
