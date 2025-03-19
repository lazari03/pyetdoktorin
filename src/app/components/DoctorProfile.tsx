'use client'
/* eslint-disable */
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface DoctorProfileProps {
  id: string;
}

// Mock data - replace with actual API call
const getDoctorById = (id: string) => ({
  id:1,
  name: 'Dr. John Doe',
  expertise: 'Cardiologist',
  image: '/img/profile_placeholder.png',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  specializations: ['Heart Surgery', 'Vascular Medicine', 'Cardiac Rehabilitation'],
  education: ['MD from Harvard Medical School', 'Residency at Mayo Clinic'],
})

export default function DoctorProfile({ id }: DoctorProfileProps) {
  const router = useRouter()
  const doctor = getDoctorById(id)

  const handleAppointmentRequest = () => {
    router.push(`/dashboard/new-appointment?doctor=${id}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6">
      <div className="card bg-base-100 shadow-xl overflow-hidden">
        {/* Mobile layout - stacked */}
        <div className="flex flex-col md:hidden">
          <div className="p-4 flex justify-center">
            <div className="w-36 h-36 md:w-48 md:h-48 relative rounded-full overflow-hidden">
              <Image
                src={doctor.image}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 144px, 192px"
              />
            </div>
          </div>
          
          <div className="card-body px-4 py-3">
            <h2 className="card-title text-2xl md:text-3xl text-center md:text-left">{doctor.name}</h2>
            <p className="text-lg md:text-xl text-primary text-center md:text-left">{doctor.expertise}</p>
            
            <div className="divider my-2"></div>
            
            <h3 className="text-lg md:text-xl font-semibold">About</h3>
            <p className="text-sm md:text-base">{doctor.bio}</p>
            
            <div className="divider my-2"></div>
            
            <h3 className="text-lg md:text-xl font-semibold">Specializations</h3>
            <ul className="list-disc list-inside text-sm md:text-base">
              {doctor.specializations.map((spec, index) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>
            
            <div className="divider my-2"></div>
            
            <h3 className="text-lg md:text-xl font-semibold">Education</h3>
            <ul className="list-disc list-inside text-sm md:text-base">
              {doctor.education.map((edu, index) => (
                <li key={index}>{edu}</li>
              ))}
            </ul>
            
            <div className="card-actions justify-center mt-4">
              <button
                className="btn btn-primary w-full sm:w-auto"
                onClick={handleAppointmentRequest}
              >
                Request Appointment
              </button>
            </div>
          </div>
        </div>
        
        {/* Desktop layout - side by side */}
        <div className="hidden md:flex">
          <figure className="w-1/3 p-6 flex items-center justify-center">
            <div className="w-48 h-48 relative rounded-full overflow-hidden">
              <Image
                src={doctor.image}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          </figure>
          
          <div className="card-body w-2/3 p-6">
            <h2 className="card-title text-3xl">{doctor.name}</h2>
            <p className="text-xl text-primary">{doctor.expertise}</p>
            
            <div className="divider my-3"></div>
            
            <h3 className="text-xl font-semibold">About</h3>
            <p>{doctor.bio}</p>
            
            <div className="divider my-3"></div>
            
            <h3 className="text-xl font-semibold">Specializations</h3>
            <ul className="list-disc list-inside">
              {doctor.specializations.map((spec, index) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>
            
            <div className="divider my-3"></div>
            
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
    </div>
  )
}