import request from './request'
import type { Card, FilterOptions, PaginatedResponse } from '@/types'

interface GetCardsParams extends FilterOptions {
  page: number
  pageSize: number
}

const cardApi = {
  getCards: (params: GetCardsParams): Promise<PaginatedResponse<Card>> => {
    return request.get('/cards', { params })
  },
  getAllCards: (): Promise<Card[]> => {
    return request.get('/cards/all')
  },
  createCard: (card: Omit<Card, 'id' | 'createTime'>): Promise<Card> => {
    return request.post('/cards', card)
  },
  updateCard: (id: string, card: Partial<Card>): Promise<Card> => {
    return request.put(`/cards/${id}`, card)
  },
  deleteCard: (id: string): Promise<void> => {
    return request.delete(`/cards/${id}`)
  },
}

export default cardApi
