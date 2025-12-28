import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, NewGame, Game, Results, History, Rules } from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/novo-jogo" element={<NewGame />} />
        <Route path="/jogo" element={<Game />} />
        <Route path="/resultado" element={<Results />} />
        <Route path="/historico" element={<History />} />
        <Route path="/regras" element={<Rules />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
