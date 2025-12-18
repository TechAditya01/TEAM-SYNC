"use client"

import { type AlertCategory, type SeverityLevel, CATEGORY_LABELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface AlertFiltersProps {
  selectedCategories: AlertCategory[]
  selectedSeverity: SeverityLevel | "all"
  onCategoryChange: (categories: AlertCategory[]) => void
  onSeverityChange: (severity: SeverityLevel | "all") => void
  onReset: () => void
}

export function AlertFilters({
  selectedCategories,
  selectedSeverity,
  onCategoryChange,
  onSeverityChange,
  onReset,
}: AlertFiltersProps) {
  const categories = Object.keys(CATEGORY_LABELS) as AlertCategory[]

  const toggleCategory = (category: AlertCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category))
    } else {
      onCategoryChange([...selectedCategories, category])
    }
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedSeverity !== "all"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Severity</label>
          <Select value={selectedSeverity} onValueChange={(value) => onSeverityChange(value as SeverityLevel | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                {CATEGORY_LABELS[category]}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
