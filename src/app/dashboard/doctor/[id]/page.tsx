import DoctorProfile from '../../../components/DoctorProfile';

export default async function DoctorPage({ params }: { params: { id: string } }) {
  // Ensure params is awaited before accessing its properties
  const { id: doctorId } = await Promise.resolve(params);

  return <DoctorProfile id={doctorId} />;
}
