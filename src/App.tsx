import { Routes, Route, Link } from 'react-router-dom'
import DashBoard from './pages/DashBoard'
import NotFound from './pages/NotFound'
import CowsPage from './pages/CowsPage'
import ExpensesPage from './pages/ExpensesPage'
import AddCowPage from './pages/AddCowPage'
function App() {

  return (
    <> 
      <nav style={{padding: '10px', background: '#f0f0f0'}}>
        <Link to="/">Dashboard</Link> | 
        <Link to="/cows">Cows</Link> | 
        <Link to="/expenses">Expenses</Link> | 
        <Link to="/add-cow">+Add</Link>
      </nav>
       <main>
        <Routes>
          <Route path='/' element={<DashBoard/>}/>
          <Route path="/cows" element={<CowsPage />} />
          <Route path="/add-cow" element={<AddCowPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
       </main>
    </>
  )
}

export default App
