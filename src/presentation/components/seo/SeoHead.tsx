type JsonLd = Record<string, unknown>;

export default function SeoHead({ schema }: { schema?: JsonLd | JsonLd[] }) {
  if (!schema) return null;
  const items = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
