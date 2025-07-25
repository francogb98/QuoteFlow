"use client";

import { FC } from "react";

interface QuoteFlowLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "text";
  className?: string;
}

export const QuoteFlowLogo: FC<QuoteFlowLogoProps> = ({
  size = "md",
  variant = "full",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  if (variant === "icon") {
    return (
      <div
        className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 60 60"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient
              id="primaryGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient
              id="secondaryGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background Circle */}
          <circle
            cx="30"
            cy="30"
            r="28"
            fill="url(#primaryGradient)"
            className="drop-shadow-lg"
          />

          {/* Flow Lines */}
          <path
            d="M15 20 Q30 15 45 20 Q30 25 15 20"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M15 30 Q30 25 45 30 Q30 35 15 30"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M15 40 Q30 35 45 40 Q30 45 15 40"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            opacity="0.5"
          />

          {/* Central Q Symbol */}
          <circle
            cx="30"
            cy="30"
            r="8"
            fill="white"
            className="drop-shadow-sm"
          />
          <text
            x="30"
            y="36"
            textAnchor="middle"
            className="fill-purple-600 font-bold text-lg"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            CF
          </text>
        </svg>
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={`${className} flex items-center`}>
        <span
          className={`${textSizes[size]} font-bold bg-gradient-to-r from-purple-600 via-violet-500 to-emerald-500 bg-clip-text text-transparent`}
        >
          CuotaFacil
        </span>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center space-x-3`}>
      {/* Icon */}
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 60 60"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="logoGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background Circle */}
          <circle
            cx="30"
            cy="30"
            r="28"
            fill="url(#logoGradient)"
            className="drop-shadow-lg"
          />

          {/* Flow Lines */}
          <path
            d="M15 20 Q30 15 45 20 Q30 25 15 20"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M15 30 Q30 25 45 30 Q30 35 15 30"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M15 40 Q30 35 45 40 Q30 45 15 40"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            opacity="0.5"
          />

          {/* Central Q */}
          <circle
            cx="30"
            cy="30"
            r="8"
            fill="white"
            className="drop-shadow-sm"
          />
          <text
            x="30"
            y="36"
            textAnchor="middle"
            className="fill-purple-600 font-bold text-lg"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            CF
          </text>
        </svg>
      </div>

      {/* Text */}
      <span
        className={`${textSizes[size]} font-bold bg-gradient-to-r from-purple-600 via-violet-500 to-emerald-500 bg-clip-text text-transparent`}
      >
        CuotaFacil
      </span>
    </div>
  );
};
