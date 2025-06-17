import LiquidityCard from "@/components/liquidity-card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Liquidity Pool Interface
        </h1>
        
        <div className="flex justify-center">
          <LiquidityCard />
        </div>
      </div>
    </main>
  )
}
