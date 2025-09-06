// Welcome Modal - Shows after successful login
import React from "react";
import { BaseModal } from "../shared/components/ui/BaseModal";
import { AnimatedMumu } from "../assets/Mascot/Animations/AnimatedMumu";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  userName = "User",
}) => {
  // Footer configuration
  const footerConfig = {
    buttons: [
      {
        label: "Get Started",
        variant: "primary" as const,
        onClick: onClose,
      },
    ],
    buttonAlignment: "center" as const,
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to PaPerWork!"
      footerConfig={footerConfig}
    >
      <div className="text-center py-6">
        {/* Happy Múcaro (Mumu) Mascot */}
        <div className="mx-auto mb-6 flex flex-col items-center">
          <AnimatedMumu size={128} />
        </div>

        {/* Welcome Message */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          ¡Bienvenido, {userName}!
        </h3>
      </div>
    </BaseModal>
  );
};

export default WelcomeModal;
