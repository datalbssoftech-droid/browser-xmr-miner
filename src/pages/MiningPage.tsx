import { AppLayout } from "@/components/AppLayout";
import { MiningControls } from "@/components/MiningControls";

const MiningPage = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mining</h1>
          <p className="text-muted-foreground mt-1">Control your browser miner</p>
        </div>
        <MiningControls />
      </div>
    </AppLayout>
  );
};

export default MiningPage;
