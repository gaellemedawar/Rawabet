export default function BrowseFilters({ niches, regions, filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="browse-filters">
      <select value={filters.niche} onChange={(e) => update('niche', e.target.value)}>
        <option value="">All niches</option>
        {niches.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <select value={filters.region} onChange={(e) => update('region', e.target.value)}>
        <option value="">All regions</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={0}
        placeholder="Min $"
        value={filters.minAmount}
        onChange={(e) => update('minAmount', e.target.value)}
      />
      <input
        type="number"
        min={0}
        placeholder="Max $"
        value={filters.maxAmount}
        onChange={(e) => update('maxAmount', e.target.value)}
      />

      <button
        type="button"
        className="btn-link browse-filters-clear"
        onClick={() => onChange({ niche: '', region: '', minAmount: '', maxAmount: '' })}
      >
        Clear
      </button>
    </div>
  );
}
