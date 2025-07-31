"use client";

import { WhatsAppButton } from "./WhatsAppButton";

export default function TwilioSetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="flex justify-center">
        <WhatsAppButton to="+543855956688" />
      </div>
    </div>
  );
}
