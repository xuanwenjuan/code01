export function calculateYearsOfService(hireDate: string): number {
  if (!hireDate) return 0
  
  const hire = new Date(hireDate)
  const now = new Date()
  
  let years = now.getFullYear() - hire.getFullYear()
  const monthDiff = now.getMonth() - hire.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < hire.getDate())) {
    years--
  }
  
  return Math.max(0, years)
}

export function formatYearsOfService(years: number): string {
  if (years === 0) return '不满1年'
  if (years === 1) return '1年'
  return `${years}年`
}

export function formatDate(date: string): string {
  if (!date) return ''
  return date
}

export function getCurrentDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getCurrentDateTime(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
