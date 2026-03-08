import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
    setSending(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground mt-1">Get in touch with the Shrimine team</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="stat-card">
            <Mail className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-bold mb-1">Email Support</h3>
            <p className="text-sm text-muted-foreground">support@shrimine.com</p>
          </div>
          <div className="stat-card">
            <MessageSquare className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-bold mb-1">Community</h3>
            <p className="text-sm text-muted-foreground">Join our Discord server</p>
          </div>
        </div>

        <div className="stat-card">
          <h2 className="text-xl font-bold mb-4">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="mt-1 bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1 bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                rows={5}
                required
                className="mt-1 bg-secondary border-border"
              />
            </div>
            <Button variant="neon" type="submit" disabled={sending}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContactPage;
