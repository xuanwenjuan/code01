import { defineStore } from 'pinia'
import type { Card, FilterOptions } from '@/types'
import cardApi from '@/api/card'
import { addOperationLog } from '@/stores/log'

interface CardState {
  cards: Card[]
  total: number
  page: number
  pageSize: number
  loading: boolean
}

export const useCardStore = defineStore('card', {
  state: (): CardState => ({
    cards: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
  }),
  actions: {
    async fetchCards(page = 1, pageSize = 10, filters: FilterOptions = {}) {
      this.loading = true
      this.page = page
      this.pageSize = pageSize
      try {
        const response = await cardApi.getCards({ page, pageSize, ...filters })
        this.cards = response.data
        this.total = response.total
      } finally {
        this.loading = false
      }
    },
    async fetchAllCards() {
      this.loading = true
      try {
        const response = await cardApi.getAllCards()
        this.cards = response
        this.total = response.length
      } finally {
        this.loading = false
      }
    },
    async createCard(card: Omit<Card, 'id' | 'createTime'>) {
      this.loading = true
      try {
        const response = await cardApi.createCard(card)
        addOperationLog({
          operationType: '新增卡种',
          operationModule: '卡种管理',
          targetType: '卡种',
          targetId: response.id,
          targetName: response.name,
          details: `新增卡种：${response.name}`,
        })
        await this.fetchCards(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async updateCard(id: string, card: Partial<Card>) {
      this.loading = true
      try {
        const response = await cardApi.updateCard(id, card)
        addOperationLog({
          operationType: '更新卡种',
          operationModule: '卡种管理',
          targetType: '卡种',
          targetId: id,
          targetName: card.name || '',
          details: `更新卡种信息`,
        })
        await this.fetchCards(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async deleteCard(id: string, name: string) {
      this.loading = true
      try {
        await cardApi.deleteCard(id)
        addOperationLog({
          operationType: '删除卡种',
          operationModule: '卡种管理',
          targetType: '卡种',
          targetId: id,
          targetName: name,
          details: `删除卡种：${name}`,
        })
        await this.fetchCards(this.page, this.pageSize)
      } finally {
        this.loading = false
      }
    },
    async toggleCardStatus(id: string, status: 'active' | 'inactive', name: string) {
      this.loading = true
      try {
        const response = await cardApi.updateCard(id, { status })
        addOperationLog({
          operationType: '更新卡种状态',
          operationModule: '卡种管理',
          targetType: '卡种',
          targetId: id,
          targetName: name,
          details: `将卡种状态更新为：${status === 'active' ? '启用' : '禁用'}`,
        })
        await this.fetchCards(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
  },
})
