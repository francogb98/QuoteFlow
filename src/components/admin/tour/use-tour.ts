"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourState {
  isActive: boolean;
  currentStep: number;
  hasCompletedTour: boolean;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
  resetTour: () => void;
}

export const useTour = create<TourState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStep: 0,
      hasCompletedTour: false,

      startTour: () => {
        set({ isActive: true, currentStep: 0 });
      },

      nextStep: () => {
        const { currentStep } = get();
        set({ currentStep: currentStep + 1 });
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      endTour: () => {
        set({
          isActive: false,
          currentStep: 0,
          hasCompletedTour: true,
        });
      },

      resetTour: () => {
        set({
          isActive: false,
          currentStep: 0,
          hasCompletedTour: false,
        });
      },
    }),
    {
      name: "tour-storage",
      partialize: (state) => ({ hasCompletedTour: state.hasCompletedTour }),
    }
  )
);
