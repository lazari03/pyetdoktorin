import DoctorProfile from "../../../components/DoctorProfile";

// Make the component async to properly handle params
export default async function DoctorPage({ params }: { params: { id: string } }) {
  // Ensure the id is properly processed before passing to the component
  const doctorId = params.id;
  
  return <DoctorProfile id={doctorId} />;
}
