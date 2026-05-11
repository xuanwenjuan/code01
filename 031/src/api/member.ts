import request from './request'
import type { Member, MemberStatus, FilterOptions, PaginatedResponse } from '@/types'

interface GetMembersParams extends FilterOptions {
  page: number
  pageSize: number
}

const memberApi = {
  getMembers: (params: GetMembersParams): Promise<PaginatedResponse<Member>> => {
    return request.get('/members', { params })
  },
  getMemberById: (id: string): Promise<Member> => {
    return request.get(`/members/${id}`)
  },
  createMember: (member: Omit<Member, 'id' | 'cardNumber'>): Promise<Member> => {
    return request.post('/members', member)
  },
  updateMember: (id: string, member: Partial<Member>): Promise<Member> => {
    return request.put(`/members/${id}`, member)
  },
  deleteMember: (id: string): Promise<void> => {
    return request.delete(`/members/${id}`)
  },
  updateMemberStatus: (id: string, status: MemberStatus): Promise<Member> => {
    return request.put(`/members/${id}/status`, { status })
  },
  checkConflict: (memberId: string, date: string, courseId: string): Promise<{ hasConflict: boolean; message?: string }> => {
    return request.get(`/members/${memberId}/check-conflict`, { params: { date, courseId } })
  },
  renewMember: (id: string, data: { renewDays?: number; renewTimes?: number }): Promise<Member> => {
    return request.put(`/members/${id}/renew`, data)
  },
}

export default memberApi
