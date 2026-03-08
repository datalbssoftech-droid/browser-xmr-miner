import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Wallet, Lock } from "lucide-react";

const ProfilePage = () => {
  const { user, profile } = useAuth();
  const [walletAddress, setWalletAddress] = useState(profile?.wallet_address || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      wallet_address: walletAddress,
      display_name: displayName,
    }).eq("user_id", user.id);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated!");
      setNewPassword("");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings</p>
        </div>

        {/* Profile Info */}
        <div className="stat-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Account Info</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label>Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="mt-1 bg-secondary border-border" />
            </div>
          </div>
        </div>

        {/* Wallet */}
        <div className="stat-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">XMR Wallet</h3>
          </div>
          <div>
            <Label>Wallet Address</Label>
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="4..."
              className="mt-1 bg-secondary border-border font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Used for withdrawal payouts</p>
          </div>
          <Button variant="neon" className="mt-4" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        {/* Change Password */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Change Password</h3>
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <Button variant="neon-outline" className="mt-4" onClick={changePassword}>
            Update Password
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
