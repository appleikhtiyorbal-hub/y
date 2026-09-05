import type { ListingFilter } from '../types'

const FILTERS: { id: ListingFilter; label: string }[] = [
  { id: 'all', label: 'Hammasi' },
  { id: 'sale', label: 'Sotuv' },
  { id: 'rent', label: 'Ijara' },
]

type FilterBarProps = {
  value: ListingFilter
  onChange: (value: ListingFilter) => void
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar" role="tablist" aria-label="E’lon turi">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={value === filter.id}
          className={`filter-chip${value === filter.id ? ' is-active' : ''}`}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
