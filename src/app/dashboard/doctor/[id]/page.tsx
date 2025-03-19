import DoctorProfile from '@/app/components/DoctorProfile'

interface PageProps {
  params: Promise<{ id: string }>;
}

// This is a server component that will handle the params
export default async function DoctorPage({ params }: PageProps) {
  // Ensure we have resolved params
  const resolvedParams = await params;
  return <DoctorProfile id={resolvedParams.id} />
}
