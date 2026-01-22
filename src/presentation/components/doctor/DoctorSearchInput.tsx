'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useDoctorSearchStore } from '@/store/doctorSearchStore';
import { Doctor } from '@/domain/entities/Doctor';
import { useTranslation } from 'react-i18next';

const DoctorSearchInput = () => {
	const {
		searchTerm,
		setSearchTerm,
		filteredDoctors,
		loading,
		error,
		isOverlayVisible,
		toggleOverlay,
		fetchDoctors,
	} = useDoctorSearchStore();
	const searchRef = useRef<HTMLDivElement>(null);
	const nav = useNavigationCoordinator();
	const { t } = useTranslation();

	useEffect(() => {
		if (searchTerm.trim().length >= 1) {
			toggleOverlay(true);
		} else {
			toggleOverlay(false);
		}
		if (searchTerm.trim().length >= 4) {
			fetchDoctors();
		}
	}, [searchTerm, fetchDoctors, toggleOverlay]);

	const handleDoctorClick = (doctor: Doctor) => {
		nav.toDoctorProfile(doctor.id);
		toggleOverlay(false);
	};

	const handleClickOutside = useCallback((event: MouseEvent) => {
		if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
			toggleOverlay(false);
		}
	}, [toggleOverlay]);

	useEffect(() => {
		if (isOverlayVisible) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOverlayVisible, handleClickOutside]);

	// ...existing code...
	return null;
};

export default DoctorSearchInput;
