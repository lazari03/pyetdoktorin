"use client";
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DoctorSearchModal from './DoctorSearchModal';

export default function DashboardDoctorSearchBar() {
  const { t } = useTranslation();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState<DOMRect | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const handleSearchClick = () => {
    if (searchBarRef.current) {
      const position = searchBarRef.current.getBoundingClientRect();
      setSearchBarPosition(position);
    }
    setIsSearchModalOpen(true);
  };

  const handleModalClose = () => {
    setIsSearchModalOpen(false);
  };

  return (
    <>
      <div
        ref={searchBarRef}
        onClick={handleSearchClick}
        className="relative flex items-center bg-white rounded-full shadow-lg p-3 w-full max-w-lg mx-auto cursor-pointer transform transition-transform duration-500 ease-in-out mb-8"
      >
        <input
          type="text"
          placeholder={t('searchForDoctors')}
          className="flex-grow rounded-full px-4 py-3 text-base focus:outline-none cursor-pointer"
          readOnly
        />
      </div>
      <DoctorSearchModal
        isOpen={isSearchModalOpen}
        onClose={handleModalClose}
        position={searchBarPosition}
      />
    </>
  );
}
