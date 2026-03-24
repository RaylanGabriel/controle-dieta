'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Minus, Plus, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WaterTrackerProps {
  date: string
}

const GLASS_ML = 250 // cada copo = 250ml
const GOAL_ML = 2500 // meta diaria = 2.5L
const MAX_GLASSES = 10 // maximo de 10 copos

export function WaterTracker({ date }: WaterTrackerProps) {
  const [waterMl, setWaterMl] = useState(0)
  const [loading, setLoading] = useState(true)

  const glasses = Math.ceil(waterMl / GLASS_ML)
  const percentage = Math.min((waterMl / GOAL_ML) * 100, 100)

  useEffect(() => {
    const fetchWater = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('water_intake')
        .select('quantidade_ml')
        .eq('user_id', user.id)
        .eq('data', date)
        .single()

      if (data) {
        setWaterMl(data.quantidade_ml)
      }
      setLoading(false)
    }

    fetchWater()
  }, [date])

  const updateWater = async (newMl: number) => {
    const clampedMl = Math.max(0, Math.min(newMl, MAX_GLASSES * GLASS_ML))
    setWaterMl(clampedMl)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('water_intake')
      .upsert({
        user_id: user.id,
        data: date,
        quantidade_ml: clampedMl,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,data'
      })
  }

  const addGlass = () => updateWater(waterMl + GLASS_ML)
  const removeGlass = () => updateWater(waterMl - GLASS_ML)
  const toggleGlass = (index: number) => {
    const targetMl = (index + 1) * GLASS_ML
    if (waterMl >= targetMl) {
      updateWater(index * GLASS_ML)
    } else {
      updateWater(targetMl)
    }
  }

  if (loading) {
    return (
      <div className="bg-card/50 rounded-2xl p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-sm">Agua</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {waterMl}ml / {GOAL_ML}ml
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Glasses grid */}
      <div className="flex items-center justify-center gap-1 mb-3">
        {Array.from({ length: MAX_GLASSES }).map((_, i) => {
          const isFilled = i < glasses
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggleGlass(i)}
              className={cn(
                "w-7 h-9 rounded-b-lg rounded-t-sm border-2 transition-all relative overflow-hidden",
                isFilled 
                  ? "border-blue-500 bg-blue-500/20" 
                  : "border-muted-foreground/30 bg-transparent hover:border-blue-300"
              )}
              title={`${(i + 1) * GLASS_ML}ml`}
            >
              {isFilled && (
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all"
                  style={{ height: '70%' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={removeGlass}
          disabled={waterMl === 0}
          className="h-8 w-8 p-0"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium min-w-[80px] text-center">
          {glasses} {glasses === 1 ? 'copo' : 'copos'}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addGlass}
          disabled={glasses >= MAX_GLASSES}
          className="h-8 w-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
