import { AppLayout } from "@/components/AppLayout";

const TermsPage = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground mt-1">Last updated: March 2026</p>
        </div>

        <div className="stat-card prose prose-invert max-w-none">
          <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing or using Shrimine's services, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-xl font-bold mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground mb-4">
            Shrimine provides a browser-based cryptocurrency mining platform that allows users to 
            mine Monero (XMR) using their device's CPU. Users can earn XMR based on their contributed 
            computing power.
          </p>

          <h2 className="text-xl font-bold mb-4">3. User Accounts</h2>
          <p className="text-muted-foreground mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and 
            for all activities that occur under your account. You must provide accurate and complete 
            information when creating an account.
          </p>

          <h2 className="text-xl font-bold mb-4">4. Mining and Rewards</h2>
          <p className="text-muted-foreground mb-4">
            Mining rewards are calculated based on valid shares submitted to the mining pool. 
            Shrimine reserves the right to adjust reward rates at any time. Minimum withdrawal 
            amounts apply as displayed on the platform.
          </p>

          <h2 className="text-xl font-bold mb-4">5. Prohibited Activities</h2>
          <p className="text-muted-foreground mb-4">
            Users may not use our services for any illegal purposes, attempt to manipulate or 
            exploit the mining system, create multiple accounts to abuse referral programs, or 
            interfere with the proper functioning of the platform.
          </p>

          <h2 className="text-xl font-bold mb-4">6. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            Shrimine is provided "as is" without warranties of any kind. We are not responsible 
            for any losses, damages, or expenses arising from your use of our services, including 
            but not limited to mining earnings, withdrawal issues, or system downtime.
          </p>

          <h2 className="text-xl font-bold mb-4">7. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. Continued use of the service 
            after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default TermsPage;
