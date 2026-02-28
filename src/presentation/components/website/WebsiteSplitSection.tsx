import Image from 'next/image';

export default function WebsiteSplitSection({
  eyebrow,
  title,
  body,
  bullets,
  imageSrc,
  imageAlt,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <div className={`website-split ${reverse ? 'reverse' : ''}`}>
      <div className="website-split-copy">
        <span className="website-pill">{eyebrow}</span>
        <h2 className="website-section-title">{title}</h2>
        <p className="website-section-body">{body}</p>
        <ul className="website-list">
          {bullets.map((item) => (
            <li key={item}>
              <span className="website-check" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="website-split-media">
        <div className="website-media-frame">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 320px, 520px"
            className="website-media-image"
          />
        </div>
      </div>
    </div>
  );
}
