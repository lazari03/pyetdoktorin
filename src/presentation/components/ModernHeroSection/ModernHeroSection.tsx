export default function ModernHeroSection() {
  return (
    <section className="w-full flex justify-center items-center py-16 px-2">
      <div className="w-full max-w-5xl rounded-3xl bg-violet-700 text-white flex flex-col items-center p-8 md:p-20 shadow-xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-6">Empower your clinic today</h1>
        <p className="text-lg md:text-2xl text-center mb-12 text-cloud">And experience the impact of telemedicine within your organisation.</p>
        <div className="flex flex-col md:flex-row gap-4 w-full md:justify-center">
          <button
            className="bg-gradient-to-r from-violet-500 to-violet-300 text-white font-semibold rounded-full px-8 py-4 text-lg transition shadow-lg hover:from-violet-300 hover:to-violet-500 border-2 border-transparent"
          >
            Get started for free
          </button>
          <button
            className="bg-transparent border-2 border-white text-white font-semibold rounded-full px-8 py-4 text-lg transition hover:bg-white hover:text-violet-700"
          >
            Explore Clinic solutions
          </button>
        </div>
      </div>
    </section>
  );
}
