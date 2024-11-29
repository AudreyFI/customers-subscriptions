import { date15daysAfter, date15daysBefore, today } from './date'

describe('date helpers', () => {
  it("should return today's date in YYYY-MM-DD format", () => {
    const expectedToday = new Date().toISOString().split('T')[0]
    expect(today).toBe(expectedToday)
  })

  it('should return the date 15 days before today in YYYY-MM-DD format', () => {
    const expectedDate = new Date(new Date().setDate(new Date().getDate() - 15))
      .toISOString()
      .split('T')[0]
    expect(date15daysBefore).toBe(expectedDate)
  })

  it('should return the date 15 days after today in YYYY-MM-DD format', () => {
    const expectedDate = new Date(new Date().setDate(new Date().getDate() + 15))
      .toISOString()
      .split('T')[0]
    expect(date15daysAfter()).toBe(expectedDate)
  })

  it('should return the date 15 days after a given date in YYYY-MM-DD format', () => {
    const givenDate = new Date('2023-01-01')
    const expectedDate = new Date(givenDate.setDate(givenDate.getDate() + 15))
      .toISOString()
      .split('T')[0]
    expect(date15daysAfter(new Date('2023-01-01'))).toBe(expectedDate)
  })
})
