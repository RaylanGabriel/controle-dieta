'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Clock, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Meal, MealItem } from '@/lib/types'
import { MealItemRow } from '@/components/meal-item-row'

interface MealCardProps {
  meal: Meal & { items: (MealItem & { options?: { id: string; nome: string; quantidade: string; calorias: number; is_active: boolean }[] })[] }
  onToggleComplete: (mealId: string, completed: boolean) => void
  onSelectOption: (itemId: string, optionId: string) => void
  onDelete: (mealId: string) => void
}

export function MealCard({ meal, onToggleComplete, onSelectOption, onDelete }: MealCardProps) {
  const [expanded, setExpanded] = useState(!meal.concluida)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const totalCalories = meal.items.reduce((acc, item) => acc + item.calorias, 0)

  const mealTypeLabels: Record<string, string> = {
    cafe_manha: 'Cafe da Manha',
    almoco: 'Almoco',
    lanche_tarde: 'Lanche da Tarde',
    cafe_tarde: 'Cafe da Tarde',
    janta: 'Janta',
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(meal.id)
    } else {
      setConfirmDelete(true)
      // Reset confirm state after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      meal.concluida && "opacity-70"
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
      >
        {/* Time indicator */}
        <div className="flex flex-col items-center justify-center min-w-[50px]">
          <Clock className="w-4 h-4 text-muted-foreground mb-1" />
          <span className="text-sm font-medium">{formatTime(meal.horario)}</span>
        </div>

        {/* Meal info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {meal.nome || mealTypeLabels[meal.tipo]}
          </h3>
          <p className="text-sm text-muted-foreground">
            {meal.items.length} {meal.items.length === 1 ? 'item' : 'itens'} • {totalCalories} kcal
          </p>
        </div>

        {/* Status & expand */}
        <div className="flex items-center gap-2">
          {meal.concluida && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <CardContent className="pt-0 pb-4 px-4 border-t border-border">
          <div className="space-y-3 mt-4">
            {meal.items.map((item) => (
              <MealItemRow 
                key={item.id} 
                item={item} 
                onSelectOption={onSelectOption}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            {!meal.concluida && (
              <Button
                onClick={() => onToggleComplete(meal.id, true)}
                className="flex-1"
                variant="secondary"
              >
                <Check className="w-4 h-4 mr-2" />
                Marcar como concluida
              </Button>
            )}
            
            <Button
              onClick={handleDelete}
              variant={confirmDelete ? "destructive" : "outline"}
              size={meal.concluida ? "default" : "icon"}
              className={cn(
                meal.concluida && "flex-1"
              )}
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete && (
                <span className="ml-2">Confirmar exclusao</span>
              )}
              {meal.concluida && !confirmDelete && (
                <span className="ml-2">Excluir</span>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
