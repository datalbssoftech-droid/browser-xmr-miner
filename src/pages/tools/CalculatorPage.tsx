import { Link } from "react-router-dom";
import { ArrowLeft, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiningCalculator } from "@/components/MiningCalculator";

const CalculatorPage = () => (
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
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Mining Profit Calculator</h1>
        <p className="text-muted-foreground mb-8">Calculate your potential Monero mining earnings with real-time data.</p>
        <MiningCalculator compact={false} />
      </div>
    </main>
  </div>
);

export default CalculatorPage;
