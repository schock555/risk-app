import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useLocationSearch, type LocationResult } from '@/hooks/useLocationSearch'

interface SearchBarProps {
  onLocationSelect: (location: LocationResult) => void
  placeholder?: string
}

export function SearchBar({ onLocationSelect, placeholder = "Enter ZIP code or city name..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { results, isLoading } = useLocationSearch(query)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback((location: LocationResult) => {
    setQuery(location.display)
    setOpen(false)
    setSelectedIndex(-1)
    onLocationSelect(location)
  }, [onLocationSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setOpen(value.length >= 2)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="h-12 pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && query.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
        >
          {results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {isLoading ? 'Searching...' : 'No locations found.'}
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto py-1">
              {results.map((location: any, index: any) => (
                <li
                  key={`${location.type}-${location.code}-${location.city}`}
                  className={cn(
                    "flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-accent",
                    selectedIndex === index && "bg-accent"
                  )}
                  onClick={() => handleSelect(location)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate">{location.display}</div>
                    {location.county && (
                      <div className="truncate text-xs text-muted-foreground">
                        {location.county} County
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}