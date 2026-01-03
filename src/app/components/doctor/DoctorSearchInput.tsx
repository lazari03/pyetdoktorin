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
		// Only show overlay with results when there's content in search
		if (searchTerm.trim().length >= 1) {
			toggleOverlay(true);
		} else {
			toggleOverlay(false);
		}
    
		// Fetch starts automatically after 4 chars thanks to the store's implementation
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

	return (
		<>
			{isOverlayVisible && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
			)}
			<div ref={searchRef} className="relative z-50 flex flex-col items-center mx-auto max-w-md">
				<div className="relative flex items-center bg-white rounded-full shadow-md p-1 w-full">
					<input
						type="text"
						placeholder={t('searchByNameOrSpecializations')}
						className="flex-grow rounded-full px-4 py-2 text-sm focus:outline-none"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onFocus={() => {
							if (searchTerm.trim().length >= 1) {
								toggleOverlay(true);
							}
						}}
					/>
					<button
						onClick={() => searchTerm.trim().length >= 4 && fetchDoctors()}
						className={`ml-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors ${
							searchTerm.trim().length < 4 ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						{t('search')}
					</button>
				</div>

				{isOverlayVisible && (
					<div className="relative w-full mt-2">
						{loading && <p className="text-center text-gray-500 text-sm">{t('loading')}</p>}
						{error && <p className="text-center text-red-500 text-sm">{error}</p>}
						{filteredDoctors.length > 0 && (
							<ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-auto">
								{filteredDoctors.map((doctor) => (
									<li
										key={doctor.id}
										className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
										onClick={() => handleDoctorClick(doctor)}
									>
										{doctor.name}
									</li>
								))}
							</ul>
						)}
					</div>
				)}
			</div>
		</>
	);
};

export default DoctorSearchInput;