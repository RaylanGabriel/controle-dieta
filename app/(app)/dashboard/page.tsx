'use client'

import { useMemo } from 'react'
import { CalorieHeader } from '@/components/calorie-header'
import { MealTimeline } from '@/components/meal-timeline'
import { useMeals } from '@/hooks/use-meals'
import { useProfile } from '@/hooks/use-profile'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'
import { Calendar } from 'lucide-react'

export default function DashboardPage() {
  const today = useMemo(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  }, [])

  const { meals, totals, isLoading: mealsLoading, toggleMealComplete, selectFoodOption } = useMeals(today)
  const { profile, isLoading: profileLoading } = useProfile()

  const isLoading = mealsLoading || profileLoading

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <CalorieHeader
        consumed={totals.calorias}
        goal={profile?.meta_calorias_diarias || 2000}
        proteina={totals.proteina}
        carboidratos={totals.carboidratos}
        gordura={totals.gordura}
      />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-lg font-semibold mb-4">Refeicoes de Hoje</h2>
          
          {meals.length === 0 ? (
            <Empty
              icon={<Calendar className="w-10 h-10" />}
              title="Nenhuma refeicao cadastrada"
              description="Adicione suas refeicoes do dia para comecar a acompanhar sua dieta."
            />
          ) : (
            <MealTimeline
              meals={meals}
              onToggleComplete={toggleMealComplete}
              onSelectOption={selectFoodOption}
            />
          )}
        </div>
      </main>
    </div>
  )
}
