import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading-animation.json";

interface LoadingAnimationProps {
  size?: number;
  className?: string;
}

export const LoadingAnimation = ({ size = 120, className = "" }: LoadingAnimationProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={loadingAnimation}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingAnimation size={150} />
    </div>
  );
};

export const InlineLoader = ({ size = 80 }: { size?: number }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingAnimation size={size} />
    </div>
  );
};
