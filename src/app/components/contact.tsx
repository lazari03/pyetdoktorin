'use client';

import { useForm, Controller, FieldValues } from 'react-hook-form'; // Import FieldValues
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function ContactForm() {
  const { handleSubmit, control } = useForm();

  const onSubmit = (data: FieldValues) => { // Replace 'any' with 'FieldValues'
    console.log('Form Data:', data);
  };

  return (
    <div className="bg-gray-50 py-20 px-6 sm:py-28 lg:px-10">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">Get in Touch</h2>
        <p className="mt-6 text-lg text-gray-600">
          Have questions? We&apos;d love to hear from you. Fill out the form below and we&apos;ll get back to you shortly.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-16 max-w-2xl mx-auto bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-lg"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <input
              id="first-name"
              name="first-name"
              type="text"
              placeholder="First Name"
              className="w-full border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none sm:text-sm"
            />
          </div>
          <div>
            <input
              id="last-name"
              name="last-name"
              type="text"
              placeholder="Last Name"
              className="w-full border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none sm:text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              className="w-full border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none sm:text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  {...field}
                  country={'us'}
                  placeholder="Phone Number"
                  inputClass="!w-full !border-b !border-gray-300 !bg-transparent !text-gray-900 !placeholder-gray-500 focus:!border-orange-500 focus:!outline-none sm:!text-sm"
                  buttonClass="!bg-transparent !border-none"
                  containerClass="!w-full"
                />
              )}
            />
          </div>
          <div className="sm:col-span-2">
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Your Message"
              className="w-full border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none sm:text-sm"
            />
          </div>
          <div className="sm:col-span-2 flex items-start">
            <input
              id="agreed"
              name="agreed"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="agreed" className="ml-4 text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="font-medium text-orange-600 hover:underline">
                privacy policy
              </a>
              .
            </label>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            className="w-full rounded-full bg-orange-600 px-6 py-4 text-white font-medium shadow-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
