import { AlertTriangle, Settings, ExternalLink } from "lucide-react";

export default function ApiNotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            API Não Configurada
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Para usar o sistema de login, você precisa configurar a API externa.
          </p>
        </div>

        <div className="card p-6 shadow-lg dark:shadow-xl">
          <div className="space-y-4">
            <div className="flex items-start">
              <Settings className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Configuração Necessária
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Configure a URL da API no arquivo de configuração.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                Passos para configurar:
              </h4>
              <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                <li>Copie o arquivo <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">env.example</code> para <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">.env</code></li>
                <li>Configure a variável <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">VITE_API_BASE_URL</code></li>
                <li>Reinicie o servidor de desenvolvimento</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Exemplo de configuração:
              </h4>
              <pre className="text-xs text-blue-800 dark:text-blue-200 overflow-x-auto">
{`# .env
VITE_API_BASE_URL=https://sua-api.com`}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Precisa de ajuda?
              </span>
              <a
                href="#"
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center"
              >
                Documentação
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
