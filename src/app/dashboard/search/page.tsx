import DoctorSearch from '@/app/components/DoctorSearch'

export default function SearchPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Find a Doctor</h1>
      <DoctorSearch />
    </div>
  )
}
