import type { CardDesign, PrintRequest } from '@/types/domain'

export function canEditCard(card: CardDesign) {
  return !card.isLocked && card.status !== 'locked'
}

export function getCardStatusLabel(card: CardDesign) {
  if (card.isLocked || card.status === 'locked') {
    return 'Locked'
  }

  if (card.status === 'submittedForPrint' || card.hasBeenPrinted) {
    return 'Submitted for print'
  }

  if (card.status === 'draft') {
    return 'Draft'
  }

  return 'Editable'
}

export function getNextPrintPrice(printRequests: PrintRequest[]) {
  return printRequests.length === 0 ? 0 : 50
}
