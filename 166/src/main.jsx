import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import store from './store'
import './styles/global.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#52c41a',
            colorInfo: '#52c41a',
            colorSuccess: '#52c41a',
            borderRadius: 8,
            colorBorderBg: '#f0f0f0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
          },
          components: {
            Button: {
              colorPrimary: '#52c41a',
              algorithm: true,
              controlHeight: 40
            },
            Input: {
              controlHeight: 40
            },
            Card: {
              borderRadiusLG: 12,
              boxShadowTertiary: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }
          }
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
)
