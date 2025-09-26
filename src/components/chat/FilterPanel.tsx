import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFilters } from '@/hooks/useFilters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
  const { t } = useTranslation()
  const [resetKey, setResetKey] = useState(0) // Para forzar reset de Select components

  // Load dynamic filters from Supabase
  const { data: filterOptions, isLoading, error } = useFilters()

  // Use dynamic data or fallback to ensure UI works
  const safeFilterOptions = filterOptions || {
    areas: ['N/A'],
    categories: ['N/A'],
    sources: ['N/A'],
    tags: ['N/A'],
  }

  const handleAreaChange = (value: string) => {
    const updatedArea = filters.area.includes(value)
      ? filters.area.filter((v) => v !== value)
      : [...filters.area, value]
    onFiltersChange({ ...filters, area: updatedArea })
  }

  const handleSourceChange = (value: string) => {
    const updatedSource = filters.fuente.includes(value)
      ? filters.fuente.filter((v) => v !== value)
      : [...filters.fuente, value]
    onFiltersChange({ ...filters, fuente: updatedSource })
  }

  const handleCategoryChange = (value: string) => {
    // Para checkboxes, permitir selección múltiple
    const updatedCategories = filters.categoria.includes(value)
      ? filters.categoria.filter((v) => v !== value)
      : [...filters.categoria, value]
    onFiltersChange({ ...filters, categoria: updatedCategories })
  }

  const handleTagChange = (value: string) => {
    if (!filters.tags.includes(value)) {
      onFiltersChange({ ...filters, tags: [...filters.tags, value] })
    }
  }

  const removeFilter = (
    type: 'area' | 'categoria' | 'fuente' | 'tags',
    value: string
  ) => {
    const updatedFilters = {
      ...filters,
      [type]: filters[type].filter((item) => item !== value),
    }
    onFiltersChange(updatedFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({ area: [], categoria: [], fuente: [], tags: [] })
    setResetKey((prev) => prev + 1) // Forzar reset de Select components
  }

  return (
    <div className="w-fit min-w-80 max-w-md h-[75vh] overflow-y-auto p-6 bg-background border border-pink-500/20 rounded-lg shadow-lg">
      <div className="font-bold text-lg mb-4 text-pink-400">
        {t('filters.title')}
        {isLoading && (
          <span className="text-xs text-muted-foreground ml-2">
            Cargando filtros...
          </span>
        )}
        {error && !isLoading && (
          <span className="text-xs text-amber-500 ml-2" title={error}>
            ⚠️
          </span>
        )}
      </div>

      {/* Área - ComboBox */}
      <div className="mb-4">
        <div className="font-semibold mb-2 text-purple-300">
          {t('filters.area')}
        </div>
        <Select key={`area-${resetKey}`} onValueChange={handleAreaChange}>
          <SelectTrigger className="w-full border-pink-500/30 focus:border-pink-400">
            <SelectValue placeholder={t('filters.select_area')} />
          </SelectTrigger>
          <SelectContent>
            {safeFilterOptions.areas.map((opt) => (
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
              className="bg-pink-500/20 text-pink-400 border-pink-500/30 px-2 py-1"
            >
              {area}
              <button
                type="button"
                className="ml-1 text-xs hover:text-red-400"
                onClick={() => removeFilter('area', area)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Categoría - Radio Buttons en grupos de 2 */}
      <div className="mb-4">
        <div className="font-semibold mb-2 text-purple-300">
          {t('filters.category')}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {safeFilterOptions.categories.map((opt) => (
            <div key={opt} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${opt}`}
                checked={filters.categoria.includes(opt)}
                onCheckedChange={() => handleCategoryChange(opt)}
                className="border-purple-500/50 text-purple-400 focus:ring-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label
                htmlFor={`category-${opt}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {opt}
              </Label>
            </div>
          ))}
        </div>
        {/* Mostrar categorías seleccionadas */}
        <div className="flex gap-1 flex-wrap mt-2">
          {filters.categoria.map((category) => (
            <Badge
              key={category}
              className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-2 py-1"
            >
              {category}
              <button
                type="button"
                className="ml-1 text-xs hover:text-red-400"
                onClick={() => removeFilter('categoria', category)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Fuente / Regulador - ComboBox */}
      <div className="mb-4">
        <div className="font-semibold mb-2 text-purple-300">
          {t('filters.source')}
        </div>
        <Select key={`source-${resetKey}`} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-full border-pink-500/30 focus:border-pink-400">
            <SelectValue placeholder={t('filters.select_source')} />
          </SelectTrigger>
          <SelectContent>
            {safeFilterOptions.sources.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Mostrar fuentes seleccionadas */}
        <div className="flex gap-1 flex-wrap mt-2">
          {filters.fuente.map((source) => (
            <Badge
              key={source}
              className="bg-pink-500/20 text-pink-400 border-pink-500/30 px-2 py-1"
            >
              {source}
              <button
                type="button"
                className="ml-1 text-xs hover:text-red-400"
                onClick={() => removeFilter('fuente', source)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags - ComboBox */}
      <div className="mb-4">
        <div className="font-semibold mb-2 text-purple-300">
          {t('filters.tags')}
        </div>
        <Select key={`tags-${resetKey}`} onValueChange={handleTagChange}>
          <SelectTrigger className="w-full border-pink-500/30 focus:border-pink-400">
            <SelectValue placeholder={t('filters.add_tag')} />
          </SelectTrigger>
          <SelectContent>
            {safeFilterOptions.tags
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
            <Badge key={tag} className="bg-pink-500 text-white px-2 py-1">
              {tag}
              <button
                type="button"
                className="ml-1 text-xs text-white hover:text-red-400"
                onClick={() => removeFilter('tags', tag)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 mt-6">
        <Button
          variant="default"
          onClick={onClose}
          className="bg-pink-600 hover:bg-pink-700 text-white"
        >
          {t('filters.apply')}
        </Button>
        <Button
          variant="ghost"
          onClick={clearAllFilters}
          className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
        >
          {t('filters.clear')}
        </Button>
      </div>
    </div>
  )
}
