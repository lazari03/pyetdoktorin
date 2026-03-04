import { headers } from 'next/headers';

type JsonLd = Record<string, unknown>;

export default async function SeoHead({ schema }: { schema?: JsonLd | JsonLd[] }) {
  if (!schema) return null;
  const nonce = (await headers()).get('x-nonce') || '';
  const items = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          nonce={nonce || undefined}
        >
          {JSON.stringify(item)}
        </script>
      ))}
    </>
  );
}
