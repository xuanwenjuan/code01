export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date(formatDate(new Date()))
}

export const getCurrentDate = (): string => {
  return formatDate(new Date())
}

export const getDueDate = (borrowDate: string, days: number): string => {
  return formatDate(addDays(new Date(borrowDate), days))
}
