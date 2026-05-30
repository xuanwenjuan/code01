import Header from './Header'
import Footer from './Footer'

const AppLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, marginTop: 64 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
