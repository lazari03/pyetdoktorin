export default function IndividualCtaSection() {
  return (
    <section className="w-full py-16 px-2 bg-orange-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
        <h2 className="text-3xl font-bold text-orange-600 mb-4 text-center">Ready to take control of your health?</h2>
        <p className="text-lg text-gray-700 mb-6 text-center">Join Portokalle today and connect with top doctors from the comfort of your home.</p>
        <a
          href="/register"
          className="inline-block rounded-full bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow hover:bg-orange-700 hover:text-white transition-colors text-center no-underline"
        >
          Register now
        </a>
      </div>
    </section>
  );
}
