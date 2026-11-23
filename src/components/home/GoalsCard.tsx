import { useState } from 'react'
import type { GoalProgress } from '../../services/calculations/goals'
import { describeGoalAchieved, describeGoalStatus } from '../../services/format/homeMessages'
import type { Goal, GoalMetric } from '../../types/goal'
import { MoneyInput } from '../ui/fields'
import { ProgressBar } from '../ui/ProgressBar'
import { cardClass, secondaryButtonClass } from '../ui/styles'

interface GoalsCardProps {
  goal: Goal
  dailyGoal: GoalProgress | null
  monthlyGoal: GoalProgress | null
  onSave: (goal: Goal) => void
}

function GoalLine({
  title,
  progress,
  metric,
}: {
  title: string
  progress: GoalProgress
  metric: GoalMetric
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm font-semibold text-slate-700">
          {Math.floor(progress.ratio * 100)}%
        </span>
      </div>
      <div className="mt-2">
        <ProgressBar ratio={progress.ratio} label={title} />
      </div>
      <p className="mt-2 text-sm text-slate-700">{describeGoalAchieved(progress, metric)}</p>
      <p className="text-sm font-medium text-emerald-900">{describeGoalStatus(progress)}</p>
    </div>
  )
}

const metricOptions: { value: GoalMetric; label: string }[] = [
  { value: 'revenue', label: 'Vendas (quanto entrou)' },
  { value: 'profit', label: 'Lucro (quanto sobrou)' },
]

export function GoalsCard({ goal, dailyGoal, monthlyGoal, onSave }: GoalsCardProps) {
  const [editing, setEditing] = useState(false)
  const hasGoals = dailyGoal !== null || monthlyGoal !== null

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Suas metas</h2>
        <button
          type="button"
          className={secondaryButtonClass}
          aria-expanded={editing}
          onClick={() => setEditing((current) => !current)}
        >
          {editing ? 'Fechar' : hasGoals ? 'Editar metas' : 'Definir metas'}
        </button>
      </div>

      {!hasGoals && !editing && (
        <p className="mt-3 text-slate-600">
          Você ainda não definiu metas. Defina quanto quer vender ou lucrar por
          dia e por mês para acompanhar o progresso aqui.
        </p>
      )}

      {hasGoals && (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {dailyGoal && <GoalLine title="Meta de hoje" progress={dailyGoal} metric={goal.metric} />}
          {monthlyGoal && <GoalLine title="Meta do mês" progress={monthlyGoal} metric={goal.metric} />}
        </div>
      )}

      {editing && (
        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
          <fieldset className="md:col-span-2">
            <legend className="mb-2 text-sm font-medium text-slate-700">A meta é sobre</legend>
            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
              {metricOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="goal-metric"
                    className="h-4 w-4 accent-emerald-700"
                    checked={goal.metric === option.value}
                    onChange={() => onSave({ ...goal, metric: option.value })}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <MoneyInput
            id="meta-diaria"
            label="Meta por dia"
            value={goal.dailyTarget}
            onCommit={(dailyTarget) => onSave({ ...goal, dailyTarget })}
          />
          <MoneyInput
            id="meta-mensal"
            label="Meta por mês"
            value={goal.monthlyTarget}
            onCommit={(monthlyTarget) => onSave({ ...goal, monthlyTarget })}
          />
          <p className="text-sm text-slate-600 md:col-span-2">
            Deixe 0,00 para ficar sem meta.
          </p>
        </div>
      )}
    </div>
  )
}
