import { useEffect } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useAppStore } from '@/store'
import MainLayout from '@/layouts/MainLayout'
import { generateDepartments, generateEmployees, generateChatSessions, generateMessages, generateApprovals, generateNotifications } from '@/mock'
import '@/index.css'

function App() {
  const {
    setDepartments,
    setEmployees,
    setChatSessions,
    setMessages,
    setApprovals,
    setNotifications,
    setCurrentUser,
    employees
  } = useAppStore()

  useEffect(() => {
    if (employees.length === 0) {
      const departments = generateDepartments()
      const employees = generateEmployees(departments, 15)
      const sessions = generateChatSessions(employees)
      const messages = generateMessages(employees, sessions, 50)
      const approvals = generateApprovals(employees, 12)
      const notifications = generateNotifications(8)

      setDepartments(departments)
      setEmployees(employees)
      setChatSessions(sessions)
      setMessages(messages)
      setApprovals(approvals)
      setNotifications(notifications)
      setCurrentUser(employees[0])
    }
  }, [])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
        }
      }}
    >
      <MainLayout />
    </ConfigProvider>
  )
}

export default App
