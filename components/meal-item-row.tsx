'use client'

import { useState } from 'react'
import { ChevronDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MealItem } from '@/lib/types'

interface FoodOption {
  id: string
  nome: string
  quantidade: string
  calorias: number
  is_active: boolean
}

interface MealItemRowProps {
  item: MealItem & { options?: FoodOption[] }
  onSelectOption: (itemId: string, optionId: string) => void
}

export function MealItemRow({ item, onSelectOption }: MealItemRowProps) {
  const [showOptions, setShowOptions] = useState(false)
  const hasOptions = item.options && item.options.length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{item.nome}</p>
          <p className="text-sm text-muted-foreground">{item.quantidade}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {item.calorias} kcal
          </span>
          {hasOptions && (
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Ver opcoes de substituicao"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      </div>

      {/* Substitution options */}
      {showOptions && hasOptions && (
        <div className="ml-4 pl-4 border-l-2 border-primary/30 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Opcoes de substituicao
          </p>
          {item.options?.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectOption(item.id, option.id)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors",
                option.is_active 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  option.is_active && "text-primary"
                )}>
                  {option.nome}
                </p>
                <p className="text-xs text-muted-foreground">{option.quantidade}</p>
              </div>
              <span className={cn(
                "text-sm font-medium whitespace-nowrap ml-2",
                option.is_active && "text-primary"
              )}>
                {option.calorias} kcal
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
