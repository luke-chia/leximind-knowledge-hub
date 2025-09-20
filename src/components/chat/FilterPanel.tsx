import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterPanelProps {
  filters: {
    area: string[]
    categoria: string[]
    fuente: string[]
    tags: string[]
  }
  onFiltersChange: (filters: {
    area: string[]
    categoria: string[]
    fuente: string[]
    tags: string[]
  }) => void
  onClose?: () => void
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onClose,
}: FilterPanelProps) {
  const [localTagInput, setLocalTagInput] = useState('')

  const filterOptions = {
    area: ['Compliance', 'Core', 'TI'],
    categoria: ['Normativa', 'Operativo', 'Técnico'],
    fuente: ['CNBV', 'IFRS9', 'Manual Interno'],
    tags: [
      'PLD',
      'Desarrollo Seguro',
      'Reservas IFRS9',
      'KYC',
      'AML',
      'Riesgo Operacional',
    ],
  }

  const handleAreaChange = (value: string) => {
    const updatedArea = filters.area.includes(value)
      ? filters.area.filter((v) => v !== value)
      : [...filters.area, value]
    onFiltersChange({ ...filters, area: updatedArea })
  }

  const handleCheckbox = (key: 'categoria' | 'fuente', value: string) => {
    const exists = filters[key].includes(value)
    const updated = exists
      ? filters[key].filter((v) => v !== value)
      : [...filters[key], value]
    onFiltersChange({ ...filters, [key]: updated })
  }

  const handleTagChange = (value: string) => {
    if (!filters.tags.includes(value)) {
      onFiltersChange({ ...filters, tags: [...filters.tags, value] })
    }
  }

  const removeTag = (tagToRemove: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter((t) => t !== tagToRemove),
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({ area: [], categoria: [], fuente: [], tags: [] })
  }

  return (
    <div className="max-w-sm w-full p-6 bg-background">
      <div className="font-bold text-lg mb-4">🔧 Filtros de búsqueda</div>

      {/* Área - ComboBox */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Área</div>
        <Select onValueChange={handleAreaChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar área" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.area.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Mostrar áreas seleccionadas */}
        <div className="flex gap-1 flex-wrap mt-2">
          {filters.area.map((area) => (
            <Badge
              key={area}
              className="bg-banking-primary/20 text-banking-primary px-2 py-1"
            >
              {area}
              <button
                type="button"
                className="ml-1 text-xs hover:text-red-400"
                onClick={() => handleAreaChange(area)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Categoría - Checkboxes */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Categoría</div>
        <div className="flex flex-col gap-2">
          {filterOptions.categoria.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <Checkbox
                checked={filters.categoria.includes(opt)}
                onCheckedChange={() => handleCheckbox('categoria', opt)}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fuente / Regulador - Checkboxes */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Fuente / Regulador</div>
        <div className="flex flex-col gap-2">
          {filterOptions.fuente.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <Checkbox
                checked={filters.fuente.includes(opt)}
                onCheckedChange={() => handleCheckbox('fuente', opt)}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags - ComboBox */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Tags</div>
        <Select onValueChange={handleTagChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Agregar tag" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.tags
              .filter((tag) => !filters.tags.includes(tag))
              .map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {/* Mostrar tags seleccionados */}
        <div className="flex gap-1 flex-wrap mt-2">
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              className="bg-banking-primary text-white px-2 py-1"
            >
              {tag}
              <button
                type="button"
                className="ml-1 text-xs text-white hover:text-red-400"
                onClick={() => removeTag(tag)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 mt-6">
        <Button variant="default" onClick={onClose}>
          Aplicar Filtros
        </Button>
        <Button variant="ghost" onClick={clearAllFilters}>
          Limpiar Todo
        </Button>
      </div>
    </div>
  )
}
