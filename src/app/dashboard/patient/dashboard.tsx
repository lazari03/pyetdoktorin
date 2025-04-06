import { useDoctorSearchStore } from '@/store/doctorSearchStore';

export default function PatientDashboard() {
  const { searchTerm, setSearchTerm, filteredDoctors, loading, error, fetchDoctorsList } =
    useDoctorSearchStore();

  const handleSearch = async () => {
    await fetchDoctorsList('name'); // Default to searching by name
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>
      <div className="mt-6">
        <input
          type="text"
          placeholder="Search doctors by name..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onBlur={handleSearch}
        />
        {loading && <p className="text-center text-gray-500 mt-2">Loading...</p>}
        {error && <p className="text-center text-red-500 mt-2">{error}</p>}
        {filteredDoctors.length > 0 && (
          <ul className="mt-4 bg-base-100 shadow-lg rounded-lg">
            {filteredDoctors.map((doctor) => (
              <li key={doctor.id} className="p-4 border-b">
                <div className="font-bold">{doctor.name}</div>
                <div className="text-sm text-gray-500">
                  {doctor.expertise?.join(', ') || 'No expertise'}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && searchTerm.length >= 4 && filteredDoctors.length === 0 && (
          <p className="text-center text-gray-500 mt-2">No doctors found.</p>
        )}
      </div>
    </div>
  );
}
