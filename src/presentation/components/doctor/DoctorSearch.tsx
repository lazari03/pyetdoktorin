'use client';

import { useDoctorSearchStore } from '@/store/doctorSearchStore';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { Doctor } from '@/domain/entities/Doctor';
import { useEffect } from 'react';
import { useDI } from '@/context/DIContext';

interface DoctorSearchProps {
	onDoctorSelect?: (doctor: Doctor) => void;
}

export default function DoctorSearch({ onDoctorSelect }: DoctorSearchProps) {
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
	const { fetchDoctorsUseCase } = useDI();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const nav = useNavigationCoordinator();

	// Reset search state when component mounts
	useEffect(() => {
		reset();
	}, [reset]);

	const handleDoctorClick = (doctor: Doctor) => {
		// Format the specialization for display
		const formattedDoctor = {
			...doctor,
			specialization: Array.isArray(doctor.specialization) 
				? doctor.specialization 
				: doctor.specialization ? [doctor.specialization] : []
		};
    
		if (onDoctorSelect) {
			onDoctorSelect(formattedDoctor);
			setSearchTerm(''); // Clear search after selection
			clearResults(); // Also clear the results
		} else {
			nav.toDoctorProfile(doctor.id);
		}
	};

	const handleClearSearch = () => {
		setSearchTerm('');
		clearResults(); // Clear results when clearing the search
	};

	if (authLoading) {
		return <p className="text-center">Loading authentication...</p>;
	}

	if (!isAuthenticated) {
		return <p className="text-center text-red-500">You must be logged in to search for doctors.</p>;
	}

	return (
		<div className="relative">
			<div className="mb-4">
				<div className="relative">
					<input
						type="text"
						placeholder="Search doctors by name or specializations..."
						className="input input-bordered w-full pr-10"
						value={searchTerm}
						onChange={(e) => {
							const value = e.target.value;
							setSearchTerm(value);
              
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
				<p className="text-xs text-gray-500 mt-1">
					Start typing at least 4 characters to search
				</p>
			</div>

			{loading && <p className="text-center py-2">Loading results...</p>}
			{error && <p className="text-red-500 text-center py-2">{error}</p>}

			{filteredDoctors.length > 0 && (
				<ul className="absolute w-full bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-auto">
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
	);
}
