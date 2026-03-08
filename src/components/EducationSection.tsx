import { BookOpen, Cpu, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

const articles = [
  {
    icon: BookOpen,
    title: "What is Monero Mining?",
    desc: "Learn the fundamentals of mining XMR — a privacy-focused cryptocurrency that can be mined with consumer CPUs using the RandomX algorithm.",
    path: "/learn/monero-mining",
  },
  {
    icon: Cpu,
    title: "How RandomX Works",
    desc: "RandomX is designed for general-purpose CPUs, making it ASIC-resistant. Understand the proof-of-work algorithm that powers Monero.",
    path: "/learn/randomx",
  },
  {
    icon: Monitor,
    title: "Browser Mining vs GPU Mining",
    desc: "Compare the trade-offs between browser-based mining and traditional GPU setups — accessibility, hashrate, and profitability.",
    path: "/learn/browser-vs-gpu",
  },
];

export const EducationSection = () => (
  <section className="py-12 sm:py-20 px-4 border-t border-border/50">
    <div className="container mx-auto">
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-2">
        Mining Education
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground text-center mb-10 max-w-lg mx-auto">
        Learn everything about Monero mining.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {articles.map(({ icon: Icon, title, desc, path }) => (
          <Link to={path} key={path}>
            <article className="stat-card group cursor-pointer hover:border-primary/30 transition-colors h-full">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-display mb-2">{title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
              <span className="inline-block mt-3 text-xs text-primary font-mono group-hover:underline">Read more →</span>
            </article>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
