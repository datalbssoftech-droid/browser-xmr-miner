import { UserPlus, Pickaxe, Coins } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Create Account",
    desc: "Sign up and add your XMR wallet address. It only takes 30 seconds.",
  },
  {
    step: 2,
    icon: Pickaxe,
    title: "Start Mining",
    desc: "Open the mining page and click Start. Your browser mines XMR using your CPU.",
  },
  {
    step: 3,
    icon: Coins,
    title: "Earn Rewards",
    desc: "Watch your balance grow in real-time. Withdraw your Monero anytime.",
  },
];

export const HowItWorks = () => (
  <section className="py-12 sm:py-20 px-4 border-t border-border/50">
    <div className="container mx-auto">
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">
        How It Works
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground text-center mb-10 max-w-lg mx-auto">
        Start earning Monero in three simple steps.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {steps.map(({ step, icon: Icon, title, desc }) => (
          <div key={step} className="stat-card text-center relative group">
            {/* Step number */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold font-mono">
              {step}
            </div>
            <div className="pt-4">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-display mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
