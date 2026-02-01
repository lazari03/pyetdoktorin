type MetricTile = {
  label: string;
  value: string;
  helper?: string;
  tone?: "primary" | "muted";
};

export function MetricTiles({ tiles }: { tiles: MetricTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={
            tile.tone === "muted"
              ? "rounded-2xl bg-purple-100 text-purple-900 p-3"
              : "rounded-2xl bg-purple-100 text-purple-900 p-3"
          }
        >
          <p className="text-xs opacity-80">{tile.label}</p>
          <p className="text-2xl font-bold mt-1">{tile.value}</p>
          {tile.helper && (
            <p className="text-xs text-gray-600">
              {tile.helper}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
