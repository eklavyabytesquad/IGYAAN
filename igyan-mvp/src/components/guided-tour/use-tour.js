"use client";

import { useState, useEffect, useCallback } from "react";

const TOUR_STORAGE_PREFIX = "igyan-tour-completed-";

export function useTour(userRole, userId) {
	const [isActive, setIsActive] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [hasCompleted, setHasCompleted] = useState(true); // Default true to prevent flash

	const storageKey = `${TOUR_STORAGE_PREFIX}${userId || "unknown"}`;

	// Check if tour has been completed before
	useEffect(() => {
		if (!userId) return;
		try {
			const completed = localStorage.getItem(storageKey);
			if (!completed) {
				setHasCompleted(false);
				// Auto-start tour after a short delay for first-time users
				const timer = setTimeout(() => setIsActive(true), 1500);
				return () => clearTimeout(timer);
			}
			setHasCompleted(true);
		} catch {
			setHasCompleted(false);
		}
	}, [userId, storageKey]);

	const startTour = useCallback(() => {
		setCurrentStep(0);
		setIsActive(true);
	}, []);

	const nextStep = useCallback((totalSteps) => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep((prev) => prev + 1);
		} else {
			completeTour();
		}
	}, [currentStep]);

	const prevStep = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	}, [currentStep]);

	const completeTour = useCallback(() => {
		setIsActive(false);
		setCurrentStep(0);
		setHasCompleted(true);
		try {
			localStorage.setItem(storageKey, Date.now().toString());
		} catch {}
	}, [storageKey]);

	const skipTour = useCallback(() => {
		completeTour();
	}, [completeTour]);

	const resetTour = useCallback(() => {
		try {
			localStorage.removeItem(storageKey);
		} catch {}
		setHasCompleted(false);
		setCurrentStep(0);
	}, [storageKey]);

	return {
		isActive,
		currentStep,
		hasCompleted,
		startTour,
		nextStep,
		prevStep,
		completeTour,
		skipTour,
		resetTour,
	};
}
