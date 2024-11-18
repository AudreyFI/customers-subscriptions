const toDayOnly = (date: Date) => date.toISOString().split('T')[0]

export const date15daysBefore = toDayOnly(
  new Date(new Date().setDate(new Date().getDate() - 15)),
)
export const date15daysAfter = (date?: Date) => {
  const dateToUse = date || new Date()
  return toDayOnly(new Date(dateToUse.setDate(dateToUse.getDate() + 15)))
}

export const today = toDayOnly(new Date())
