import type { DasReminder, MeiSummary } from '../calculations/mei'
import { formatCurrency } from './currency'
import { formatDate } from './date'
import { formatPercent } from './percent'

export function describeMeiStatus(summary: MeiSummary): string {
  const used = formatPercent(summary.ratio)

  switch (summary.level) {
    case 'ok':
      return `Você faturou ${formatCurrency(summary.yearRevenue)} este ano, ${used} do limite. Ainda cabem ${formatCurrency(summary.remaining)}.`
    case 'warning':
      return `Atenção: você já usou ${used} do limite do MEI. Faltam ${formatCurrency(summary.remaining)} para chegar nele.`
    case 'exceeded':
      return `Você passou do limite do MEI em ${formatCurrency(summary.exceededBy)}. Até 20% acima, em geral você continua MEI e paga um DAS complementar sobre o excesso. Confirme no Portal do Empreendedor.`
    case 'far-exceeded':
      return `Você passou mais de 20% do limite do MEI (${formatCurrency(summary.exceededBy)} acima). Nesse caso a regra pode tirar você do MEI desde o começo do ano. Procure um contador.`
  }
}

export function describeDas(das: DasReminder): string {
  const when =
    das.daysUntil === 0 ? 'hoje' : das.daysUntil === 1 ? 'amanhã' : `daqui a ${das.daysUntil} dias`
  return `O próximo DAS vence em ${formatDate(das.dueDate)} (${when}).`
}
