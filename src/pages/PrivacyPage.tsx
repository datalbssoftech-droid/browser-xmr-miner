import { AppLayout } from "@/components/AppLayout";

const PrivacyPage = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mt-1">Last updated: March 2026</p>
        </div>

        <div className="stat-card prose prose-invert max-w-none">
          <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            use our mining services, or contact us for support. This may include your email address, 
            Monero wallet address, and mining statistics.
          </p>

          <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4">
            We use the information we collect to provide, maintain, and improve our services, 
            process mining rewards, send you technical notices and support messages, and respond 
            to your comments and questions.
          </p>

          <h2 className="text-xl font-bold mb-4">3. Data Security</h2>
          <p className="text-muted-foreground mb-4">
            We take reasonable measures to help protect your personal information from loss, theft, 
            misuse, unauthorized access, disclosure, alteration, and destruction. Your mining data 
            and wallet information are encrypted using industry-standard protocols.
          </p>

          <h2 className="text-xl font-bold mb-4">4. Cookies and Tracking</h2>
          <p className="text-muted-foreground mb-4">
            We use cookies and similar tracking technologies to track activity on our platform and 
            hold certain information. You can instruct your browser to refuse all cookies or to 
            indicate when a cookie is being sent.
          </p>

          <h2 className="text-xl font-bold mb-4">5. Third-Party Services</h2>
          <p className="text-muted-foreground mb-4">
            Our platform may connect to third-party mining pools to process your mining work. 
            These services have their own privacy policies, and we encourage you to review them.
          </p>

          <h2 className="text-xl font-bold mb-4">6. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at 
            privacy@shrimine.com.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default PrivacyPage;
