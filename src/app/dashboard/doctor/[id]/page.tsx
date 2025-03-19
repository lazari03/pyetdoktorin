'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Mock data - replace with actual API call
const getDoctorById = (id: string) => ({
  id,
  name: 'Dr. John Doe',
  expertise: 'Cardiologist',
  image: '/img/profile_placeholder.png',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  specializations: ['Heart Surgery', 'Vascular Medicine', 'Cardiac Rehabilitation'],
  education: ['MD from Harvard Medical School', 'Residency at Mayo Clinic'],
})

export default function DoctorProfile({ params }: { params: { id: string } }) {
  const router = useRouter()
  const doctor = getDoctorById(params.id)

  const handleAppointmentRequest = () => {
    router.push(`/dashboard/new-appointment?doctor=${params.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure className="lg:w-1/3 p-4">
          <div className="w-[200px] h-[200px] relative rounded-full overflow-hidden mx-auto">
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={200}
              height={200}
              className="object-cover"
            />
          </div>
        </figure>
        <div className="card-body lg:w-2/3">
          <h2 className="card-title text-3xl">{doctor.name}</h2>
          <p className="text-xl text-primary">{doctor.expertise}</p>
          
          <div className="divider"></div>
          
          <h3 className="text-xl font-semibold">About</h3>
          <p>{doctor.bio}</p>
          
          <div className="divider"></div>
          
          <h3 className="text-xl font-semibold">Specializations</h3>
          <ul className="list-disc list-inside">
            {doctor.specializations.map((spec, index) => (
              <li key={index}>{spec}</li>
            ))}
          </ul>
          
          <div className="divider"></div>
          
          <h3 className="text-xl font-semibold">Education</h3>
          <ul className="list-disc list-inside">
            {doctor.education.map((edu, index) => (
              <li key={index}>{edu}</li>
            ))}
          </ul>
          
          <div className="card-actions justify-end mt-6">
            <button
              className="btn btn-primary"
              onClick={handleAppointmentRequest}
            >
              Request Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
