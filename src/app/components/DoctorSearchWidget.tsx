'use client'

import { useRouter } from 'next/navigation'

export default function DoctorSearchWidget() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard/search')
  }

  return (
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body">
        <h2 className="card-title">Find a Doctor</h2>
        <div className="form-control">
          <input
            type="text"
            placeholder="Search doctors..."
            className="input input-bordered"
            onClick={handleClick}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
