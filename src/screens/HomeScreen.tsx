import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-1 gap-8 animate-fade-in">
        {/* Title */}
        <div className="text-center">
          <h1
            className="font-[Cinzel_Decorative,serif] text-4xl font-bold text-[#e8e0d0] tracking-widest mb-2 animate-flicker"
            style={{ textShadow: '0 0 30px rgba(153,27,27,0.6)' }}
          >
            WEREWOLF
          </h1>
          <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm tracking-widest uppercase">
            A Game of Deception
          </p>
          <div className="mt-3 flex justify-center gap-2 text-2xl">
            <span>🐺</span>
            <span>🔮</span>
            <span>🛡️</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-[#3a3020]" />
          <span className="text-[#5a5040] text-sm">⚔</span>
          <div className="flex-1 h-px bg-[#3a3020]" />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => navigate('/create')}
          >
            Create Game
          </Button>
          <Button
            variant="ghost"
            fullWidth
            size="lg"
            onClick={() => navigate('/join')}
          >
            Join Game
          </Button>
        </div>

        <p className="text-[#5a5040] text-xs text-center font-[Cinzel,serif]">
          One village. Hidden wolves. Who do you trust?
        </p>
      </div>
    </Layout>
  )
}
