export interface Repository<T> {
  getAll(): Promise<T[]>
  get(id: string): Promise<T | null>
  create(entity: T): Promise<T>
  update(entity: T): Promise<T>
  delete(id: string): Promise<T>
}
