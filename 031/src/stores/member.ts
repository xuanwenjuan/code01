import { defineStore } from 'pinia'
import type { Member, MemberStatus, FilterOptions } from '@/types'
import memberApi from '@/api/member'
import { addOperationLog } from '@/stores/log'

interface MemberState {
  members: Member[]
  currentMember: Member | null
  total: number
  page: number
  pageSize: number
  loading: boolean
}

export const useMemberStore = defineStore('member', {
  state: (): MemberState => ({
    members: [],
    currentMember: null,
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
  }),
  actions: {
    async fetchMembers(page = 1, pageSize = 10, filters: FilterOptions = {}) {
      this.loading = true
      this.page = page
      this.pageSize = pageSize
      try {
        const response = await memberApi.getMembers({ page, pageSize, ...filters })
        this.members = response.data
        this.total = response.total
      } finally {
        this.loading = false
      }
    },
    async fetchMemberById(id: string) {
      this.loading = true
      try {
        const response = await memberApi.getMemberById(id)
        this.currentMember = response
        return response
      } finally {
        this.loading = false
      }
    },
    async createMember(member: Omit<Member, 'id' | 'cardNumber'>) {
      this.loading = true
      try {
        const response = await memberApi.createMember(member)
        addOperationLog({
          operationType: '新增会员',
          operationModule: '会员管理',
          targetType: '会员',
          targetId: response.id,
          targetName: response.name,
          details: `新增会员：${response.name}，卡号：${response.cardNumber}`,
        })
        await this.fetchMembers(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async updateMember(id: string, member: Partial<Member>) {
      this.loading = true
      try {
        const response = await memberApi.updateMember(id, member)
        addOperationLog({
          operationType: '更新会员信息',
          operationModule: '会员管理',
          targetType: '会员',
          targetId: id,
          targetName: member.name || '',
          details: `更新会员信息`,
        })
        await this.fetchMembers(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async deleteMember(id: string, name: string) {
      this.loading = true
      try {
        await memberApi.deleteMember(id)
        addOperationLog({
          operationType: '删除会员',
          operationModule: '会员管理',
          targetType: '会员',
          targetId: id,
          targetName: name,
          details: `删除会员：${name}`,
        })
        await this.fetchMembers(this.page, this.pageSize)
      } finally {
        this.loading = false
      }
    },
    async updateMemberStatus(id: string, status: MemberStatus, name: string) {
      this.loading = true
      try {
        const response = await memberApi.updateMemberStatus(id, status)
        const statusMap: Record<MemberStatus, string> = {
          normal: '正常',
          expired: '已过期',
          frozen: '已冻结',
        }
        addOperationLog({
          operationType: '更新会员状态',
          operationModule: '会员管理',
          targetType: '会员',
          targetId: id,
          targetName: name,
          details: `将会员状态更新为：${statusMap[status]}`,
        })
        await this.fetchMembers(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async checkConflict(memberId: string, date: string, courseId: string) {
      return await memberApi.checkConflict(memberId, date, courseId)
    },
    async renewMember(
      id: string,
      name: string,
      data: { renewDays?: number; renewTimes?: number }
    ) {
      this.loading = true
      try {
        const response = await memberApi.renewMember(id, data)
        const details = data.renewDays
          ? `续卡${data.renewDays}天`
          : `续卡${data.renewTimes}次`
        addOperationLog({
          operationType: '续卡',
          operationModule: '会员管理',
          targetType: '会员',
          targetId: id,
          targetName: name,
          details: `会员续卡：${name}，${details}`,
        })
        await this.fetchMembers(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
  },
})
