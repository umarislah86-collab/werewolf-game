import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import CreateGameScreen from './screens/CreateGameScreen'
import JoinGameScreen from './screens/JoinGameScreen'
import GameRouter from './screens/GameRouter'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/create" element={<CreateGameScreen />} />
        <Route path="/join" element={<JoinGameScreen />} />
        <Route path="/game/:gameId" element={<GameRouter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
