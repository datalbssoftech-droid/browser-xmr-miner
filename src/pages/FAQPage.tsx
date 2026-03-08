import { AppLayout } from "@/components/AppLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Shrimine?",
    answer: "Shrimine is a browser-based Monero (XMR) mining platform. You can mine cryptocurrency directly from your web browser without downloading any software or purchasing specialized hardware."
  },
  {
    question: "How does browser mining work?",
    answer: "Our platform uses WebAssembly to run the RandomX mining algorithm directly in your browser. Your CPU solves cryptographic puzzles, and valid solutions (shares) are submitted to a mining pool where rewards are distributed."
  },
  {
    question: "Is browser mining profitable?",
    answer: "Browser mining provides modest earnings based on your CPU power. While it won't make you rich, it's a great way to earn passive income from idle computing resources without any upfront investment."
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer: "The minimum withdrawal amount is set by the platform administrator and displayed on your withdrawal page. This helps ensure transaction fees don't consume a significant portion of small withdrawals."
  },
  {
    question: "How long does a withdrawal take?",
    answer: "Withdrawals are processed by our admin team. Once approved, the XMR is sent to your wallet and typically confirms within 10-20 minutes on the Monero network."
  },
  {
    question: "Does mining damage my computer?",
    answer: "No, browser mining is safe for your device. You can control CPU usage through our interface to balance mining performance with other activities. Mining will automatically pause if your browser is closed."
  },
  {
    question: "How does the referral program work?",
    answer: "Share your unique referral link with friends. When they sign up and start mining, you earn a percentage of their mining earnings as a bonus. The exact commission rate is displayed on your referral page."
  },
  {
    question: "Why Monero (XMR)?",
    answer: "Monero uses the RandomX algorithm which is optimized for CPU mining, making it ideal for browser-based mining. Monero also offers strong privacy features, keeping your transactions confidential."
  },
  {
    question: "Can I mine on mobile devices?",
    answer: "While technically possible, we recommend mining on desktop or laptop computers. Mobile devices have limited cooling and battery life, which makes mining impractical for extended periods."
  },
  {
    question: "Is my wallet address safe?",
    answer: "Yes, your Monero wallet address is stored securely. We never have access to your wallet's private keys — we only use your public address to send earned XMR to you."
  }
];

const FAQPage = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mt-1">Everything you need to know about Shrimine</p>
        </div>

        <div className="stat-card">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
};

export default FAQPage;
