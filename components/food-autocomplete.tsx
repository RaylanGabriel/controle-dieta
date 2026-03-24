'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommonFood {
  id: string
  nome: string
  quantidade_padrao: string
  calorias: number
  proteina: number
  carboidratos: number
  gordura: number
  categoria: string
}

interface FoodAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectFood: (food: CommonFood) => void
  placeholder?: string
  className?: string
}

export function FoodAutocomplete({ 
  value, 
  onChange, 
  onSelectFood,
  placeholder = "Digite o nome do alimento...",
  className 
}: FoodAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CommonFood[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchFoods = async () => {
      if (value.length < 2) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('common_foods')
        .select('*')
        .ilike('nome', `%${value}%`)
        .limit(8)

      if (!error && data) {
        setSuggestions(data)
        setIsOpen(data.length > 0)
      }
      setIsLoading(false)
    }

    const debounce = setTimeout(searchFoods, 300)
    return () => clearTimeout(debounce)
  }, [value])

  const handleSelect = (food: CommonFood) => {
    onChange(food.nome)
    onSelectFood(food)
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Buscando...
            </div>
          ) : (
            <ul className="max-h-64 overflow-auto">
              {suggestions.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(food)}
                    className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{food.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {food.quantidade_padrao}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{food.calorias} kcal</p>
                      <p className="text-xs text-muted-foreground">
                        P:{food.proteina}g C:{food.carboidratos}g G:{food.gordura}g
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
