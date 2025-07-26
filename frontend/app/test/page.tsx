export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          🎉 Frontend Funcionando!
        </h1>
        <p className="text-blue-300">
          Next.js 14 está corriendo correctamente
        </p>
        <div className="glass-card p-6 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Estado del Sistema
          </h2>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-300">Frontend:</span>
              <span className="text-green-400">✅ Funcionando</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Next.js:</span>
              <span className="text-green-400">✅ v14.2.30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tailwind:</span>
              <span className="text-green-400">✅ Configurado</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">TypeScript:</span>
              <span className="text-green-400">✅ Activo</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-4 justify-center">
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al Login
          </a>
          <a 
            href="/dashboard" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Ir al Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
