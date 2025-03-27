"use client";

type HeroSectionProps = {
  title?: string;
  description?: string;
  backgroundImage?: string;
  buttonText?: string;
  onButtonClick?: () => void;
};

export default function HeroSection({
  title = "Hello there",
  description = "Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.",
  backgroundImage = "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-7195123.jpg",
  buttonText = "Get Started",
  onButtonClick = () => alert("Button clicked!"),
}: HeroSectionProps) {
  return (
    <div
      className="hero min-h-screen"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold text-white">{title}</h1>
          <p className="mb-5">{description}</p>
          <button className="btn btn-primary" onClick={onButtonClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
