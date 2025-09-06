import React from "react";
import BodySVG from "../SVGs/Happy/Body.svg";
import RightArmSVG from "../SVGs/Happy/RightArm.svg";
import FeetSVG from "../SVGs/Happy/Feet.svg";
import "./mumu-animations.css";

interface AnimatedMumuProps {
  className?: string;
  size?: number;
}

export const AnimatedMumu: React.FC<AnimatedMumuProps> = ({
  className = "",
  size = 128,
}) => {
  return (
    <div
      className={`mumu-container relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Right Arm - Excited wave animation (behind body) */}
      <img
        src={RightArmSVG}
        alt="Mumu Right Arm"
        className="mumu-arm absolute"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          animation: "excitedWave 1.2s ease-in-out infinite",
          transformOrigin: "left center", // Rotate from the shoulder
          zIndex: 1,
        }}
      />

      {/* Body - Static (on top) */}
      <img
        src={BodySVG}
        alt="Mumu Body"
        className="mumu-body absolute"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          zIndex: 2,
        }}
      />

      {/* Feet - Static positioning */}
      <img
        src={FeetSVG}
        alt="Mumu Feet"
        className="mumu-feet absolute"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: "translateY(15px)", // Spacing below body
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default AnimatedMumu;
