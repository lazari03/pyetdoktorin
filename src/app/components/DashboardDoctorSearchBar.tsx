import { useState } from 'react';
import { fetchDoctors } from '../../services/doctorService';
import { Doctor } from '../../models/Doctor';
import { SearchType } from '../../models/FirestoreConstants';

interface DashboardDoctorSearchBarProps {
  expanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export default function DashboardDoctorSearchBar({ expanded = false, onExpand, onCollapse }: DashboardDoctorSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExpand = () => {
    if (onExpand) onExpand();
  };

  const handleCollapse = () => {
    if (onCollapse) onCollapse();
    setSearchTerm('');
    setFilteredDoctors([]);
    setError('');
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length >= 4) {
      setLoading(true);
      setError('');
      try {
        const doctorsByName = await fetchDoctors(value.trim(), SearchType.Name);
        const doctorsBySpecializations = await fetchDoctors(
          value.trim(),
          SearchType.Specializations
        );

        // Deduplicate doctors
        const uniqueDoctors = Array.from(
          new Map(
            [...doctorsByName, ...doctorsBySpecializations].map((doc) => [doc.id, doc])
          ).values()
        );
        setFilteredDoctors(uniqueDoctors);
      } catch {
        setError('Failed to fetch doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredDoctors([]);
    }
  };

  return (
    <div
      className={`relative flex justify-center items-center transition-all duration-1000 ease-in-out ${expanded ? 'z-30' : ''}`}
      style={{
        maxWidth: '100%',
        width: '100%',
        minHeight: expanded ? '300px' : undefined,
        opacity: expanded ? 1 : 0.5,
        boxShadow: expanded ? 'none' : '0 2px 8px rgba(88,190,204,0.10)',
        transform: expanded ? 'scaleX(1)' : 'scaleX(0.85)',
        transformOrigin: 'left',
        transition: 'max-width 1s cubic-bezier(0.4,0,0.2,1), opacity 1s, box-shadow 1s, transform 1s',
      }}
    >
  {!expanded ? (
        <div
          className="flex items-center rounded-full px-4 py-3 cursor-pointer border-2 border-primary w-full"
          style={{ width: '100%' }}
          onClick={handleExpand}
        >
            <input
              type="text"
              placeholder="Search for doctors..."
              className="w-full rounded-full px-4 py-3 text-base focus:outline-none cursor-pointer bg-white"
              readOnly
            />
        </div>
      ) : (
        <div
          className="rounded-lg p-8 min-h-[300px] flex flex-col justify-start w-full transition-all duration-700 ease-in-out"
          style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}
        >
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Search by name or specializations..."
              className={`w-full bg-gray-100 rounded-full px-4 py-3 text-lg focus:outline-none border-2 transition-all duration-700 ${expanded ? 'border-primary' : 'border-transparent'}`}
              style={{ boxShadow: 'none' }}
              value={searchTerm}
              onChange={handleInputChange}
              autoFocus
            />
            <button
              onClick={handleCollapse}
              className="ml-4 text-gray-500 hover:text-gray-700 text-2xl"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div>
            {loading && <p className="text-center text-gray-500 text-sm">Loading...</p>}
            {error && <p className="text-center text-red-500 text-sm">{error}</p>}

            {filteredDoctors.length > 0 && (
              <ul className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-auto">
                {filteredDoctors.map((doctor) => (
                  <li
                    key={doctor.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-medium text-sm">{doctor.name}</div>
                    <div className="text-xs text-gray-500">
                      {doctor.specialization?.length
                        ? doctor.specialization.join(', ')
                        : 'No specializations available'}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!loading && searchTerm.trim().length >= 4 && filteredDoctors.length === 0 && (
              <p className="text-center text-gray-500 text-sm">No doctors found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
