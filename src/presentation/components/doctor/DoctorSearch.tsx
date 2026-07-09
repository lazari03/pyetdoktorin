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
		return <p className="text-center">{t('loadingAuth')}</p>;
	}

	if (!isAuthenticated) {
		return <p className="text-center text-red-500">{t('mustBeLoggedInSearchDoctors')}</p>;
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

			{loading && <p className="text-center py-2">{t('loadingResults')}</p>}
			{error && <p className="text-red-500 text-center py-2">{error}</p>}

			{isEditing && resultDoctors.length > 0 && (
				<div className={`mt-3 flex flex-col gap-2 max-h-80 overflow-auto relative ${z.dropdown}`}>
					{resultDoctors.map((doctor) => {
						const specList = Array.isArray(doctor.specialization)
							? doctor.specialization
							: doctor.specialization
							? [doctor.specialization]
							: [];
						const initials = formatDoctorName(doctor).split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
						const selected = selectedDoctor?.id === doctor.id;
						return (
							<button
								type="button"
								key={doctor.id}
								onClick={() => handleDoctorClick(doctor)}
								className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
									selected ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white hover:border-purple-200'
								}`}
							>
								<div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center font-bold text-[13px]">
									{initials}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[13px] font-semibold text-gray-900 truncate">{formatDoctorName(doctor)}</p>
									{specList.length > 0 && (
										<p className="text-[11.5px] text-gray-500 truncate">{specList.join(' • ')}</p>
									)}
								</div>
								<span
									className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center ${
										selected ? 'bg-purple-600' : 'bg-gray-100'
									}`}
								>
									{selected && (
										<svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
											<path d="M4.5 12.75l6 6 9-13.5" />
										</svg>
									)}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
