import { Shield, Lock, CheckCircle } from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "Open Source Mining Engine",
    desc: "Our mining engine is fully transparent. Inspect the code, verify the hashing — nothing hidden.",
  },
  {
    icon: Lock,
    title: "Secure Payouts",
    desc: "Withdrawals go directly to your Monero wallet. No middlemen, no custodial risk.",
  },
  {
    icon: CheckCircle,
    title: "Verified Mining Pools",
    desc: "We connect to established, audited pools with proven track records and uptime guarantees.",
  },
];

export const SecuritySection = () => (
  <section className="py-12 sm:py-20 px-4 border-t border-border/50">
    <div className="container mx-auto">
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">
        Security & Transparency
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground text-center mb-10 max-w-lg mx-auto">
        Built on trust. Verified by the community.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="stat-card text-center">
            <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display mb-2">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
