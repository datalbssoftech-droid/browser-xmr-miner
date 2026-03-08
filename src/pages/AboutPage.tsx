import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Cpu, Users, Shield, Globe, Zap, Target } from "lucide-react";

const AboutPage = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">About Shrimine</h1>
          <p className="text-muted-foreground mt-1">Browser-based Monero mining for everyone</p>
        </div>

        <div className="stat-card mb-6">
          <h2 className="text-xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground">
            Shrimine is dedicated to making cryptocurrency mining accessible to everyone. 
            We believe that anyone should be able to participate in the decentralized economy 
            without expensive hardware or technical expertise.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            { icon: Globe, title: "Browser Mining", desc: "Mine Monero directly from your web browser using WebAssembly technology." },
            { icon: Shield, title: "Secure & Private", desc: "Your earnings are protected with industry-standard security practices." },
            { icon: Users, title: "Community Driven", desc: "Join thousands of miners earning XMR through our platform." },
            { icon: Zap, title: "Easy to Use", desc: "No downloads, no complex setup — just open your browser and start mining." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="stat-card">
              <Icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="stat-card">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Shrimine uses your device's CPU to solve cryptographic puzzles as part of the 
              Monero network's RandomX algorithm. This proof-of-work helps secure the network 
              while earning you XMR rewards.
            </p>
            <p>
              Our platform handles all the technical complexity — connecting to mining pools, 
              submitting shares, and tracking your earnings. You just need to click "Start Mining" 
              and let your browser do the work.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AboutPage;
