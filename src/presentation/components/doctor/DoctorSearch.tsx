'use client';

import { useDoctorSearchStore } from '@/store/doctorSearchStore';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { Doctor } from '@/domain/entities/Doctor';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDI } from '@/context/DIContext';
import { z } from '@/config/zIndex';
import { useTranslation } from 'react-i18next';

type SelectedDoctorLike = {
	id: string;
	name: string;
	surname?: string;
	specialization?: string | string[];
};

interface DoctorSearchProps {
	onDoctorSelect?: (doctor: Doctor) => void;
	selectedDoctor?: SelectedDoctorLike | null;
	onClearSelection?: () => void;
}

export default function DoctorSearch({
	onDoctorSelect,
	selectedDoctor,
	onClearSelection,
}: DoctorSearchProps) {
	const {
		searchTerm,
		setSearchTerm,
		filteredDoctors,
		loading,
		error,
		fetchDoctors,
		reset,
		clearResults,
	} = useDoctorSearchStore();
	const { t } = useTranslation();
	const { fetchDoctorsUseCase } = useDI();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const nav = useNavigationCoordinator();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	// Reset search state when component mounts
	useEffect(() => {
		reset();
	}, [reset]);

	const formatDoctorName = (doctor: SelectedDoctorLike) => {
		const name = doctor.name || '';
		const surname = doctor.surname || '';
		if (!surname) return name;
		if (name.toLowerCase().includes(surname.toLowerCase())) return name;
		return `${name} ${surname}`.trim();
	};

	const selectedDisplayName = useMemo(() => {
		if (!selectedDoctor) return '';
		return formatDoctorName(selectedDoctor);
	}, [selectedDoctor]);

	const handleDoctorClick = (doctor: SelectedDoctorLike) => {
		// Format the specialization for display
		const formattedDoctor = {
			...doctor,
			specialization: Array.isArray(doctor.specialization) 
				? doctor.specialization 
				: doctor.specialization ? [doctor.specialization] : []
		};
    
		if (onDoctorSelect) {
			onDoctorSelect(formattedDoctor);
			setSearchTerm(formatDoctorName(formattedDoctor)); // Show selected doctor in input
			clearResults(); // Also clear the results
			setIsEditing(false);
		} else {
			nav.toDoctorProfile(doctor.id);
		}
	};

	const handleClearSearch = () => {
		setSearchTerm('');
		setIsEditing(true);
		clearResults(); // Clear results when clearing the search
	};

	const handleClearSelection = () => {
		if (onClearSelection) onClearSelection();
		setIsEditing(true);
		setSearchTerm('');
		clearResults();
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	useEffect(() => {
		if (selectedDoctor && !isEditing) {
			setSearchTerm(selectedDisplayName);
		}
	}, [selectedDoctor, selectedDisplayName, isEditing, setSearchTerm]);

	const resultDoctors = useMemo(() => {
		if (!selectedDoctor) return filteredDoctors;
		const hasSelected = filteredDoctors.some((doc) => doc.id === selectedDoctor.id);
		if (hasSelected) return filteredDoctors;
		return [selectedDoctor, ...filteredDoctors];
	}, [filteredDoctors, selectedDoctor]);

	if (authLoading) {
		return <p className="text-center">Loading authentication...</p>;
	}

	if (!isAuthenticated) {
		return <p className="text-center text-red-500">You must be logged in to search for doctors.</p>;
	}

	return (
		<div className="relative">
			<div className="mb-2">
				<label className="block text-xs font-semibold text-gray-600 mb-1">
					{t('selectDoctor') || 'Select doctor'}
				</label>
				<div className="relative">
					<input
						ref={inputRef}
						type="text"
						placeholder={t('searchByNameOrSpecializations') || 'Search doctors by name or specializations...'}
						className="input input-bordered w-full pr-10"
						value={searchTerm}
						onFocus={() => setIsEditing(true)}
						onChange={(e) => {
							const value = e.target.value;
							setSearchTerm(value);
							setIsEditing(true);

							if (value.trim() === '') {
								clearResults(); // Clear results if search is empty
							} else if (value.trim().length >= 4) {
								fetchDoctors(fetchDoctorsUseCase.execute.bind(fetchDoctorsUseCase));
							}
						}}
					/>
					{searchTerm && (
						<button 
							className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
							onClick={handleClearSearch}
						>
							×
						</button>
					)}
				</div>
				<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
					<span>{t('searchHint') || 'Start typing at least 4 characters to search'}</span>
					{selectedDoctor && (
						<span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
							{t('selectedDoctor') || 'Selected'}: {selectedDisplayName}
						</span>
					)}
					{selectedDoctor && onClearSelection && (
						<button
							type="button"
							onClick={handleClearSelection}
							className="text-purple-600 font-semibold hover:text-purple-700"
						>
							{t('clearSelection') || 'Clear'}
						</button>
					)}
				</div>
			</div>

			{loading && <p className="text-center py-2">Loading results...</p>}
			{error && <p className="text-red-500 text-center py-2">{error}</p>}

			{isEditing && resultDoctors.length > 0 && (
				<ul className={`mt-3 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto relative ${z.dropdown}`}>
					{resultDoctors.map((doctor) => {
						const specList = Array.isArray(doctor.specialization)
							? doctor.specialization
							: doctor.specialization
							? [doctor.specialization]
							: [];
						return (
						<li
							key={doctor.id}
							className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
							onClick={() => handleDoctorClick(doctor)}
						>
							<p className="text-sm font-semibold text-gray-900">{formatDoctorName(doctor)}</p>
							{specList.length > 0 && (
								<p className="text-xs text-gray-500">
									{specList.join(' • ')}
								</p>
							)}
						</li>
					)})}
				</ul>
			)}
		</div>
	);
}
