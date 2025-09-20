import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { useUserVerification, useFormValidation } from "../hooks/useUserVerification.js";
import { useAuth } from "../hooks/useApi.js";

export default function EnhancedLogin({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userCheckResult, setUserCheckResult] = useState(null);

  const { checkUser, loading: userVerificationLoading, error: userVerificationError } = useUserVerification();
  const { validateField, errors, clearError } = useFormValidation();
  const { login, loading: authLoading, error: authError } = useAuth();

  // Verificar usuário quando email mudar
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.email && formData.email.includes('@')) {
        setIsCheckingUser(true);
        const result = await checkUser(formData.email);
        setUserCheckResult(result);
        setIsCheckingUser(false);
      } else {
        setUserCheckResult(null);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [formData.email, checkUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erros quando usuário começar a digitar
    if (errors[name]) {
      clearError(name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    // Verificar se usuário existe antes de tentar login
    if (userCheckResult && !userCheckResult.exists) {
      return;
    }

    try {
      const result = await login(formData);
      
      if (result.success) {
        onLogin({ 
          email: formData.email, 
          name: result.data.user?.name || result.data.user?.username || "Usuário",
          farmName: result.data.user?.farmName 
        });
      }
    } catch (err) {
      console.error('Erro no login:', err);
    }
  };

  const getEmailStatus = () => {
    if (isCheckingUser) {
      return { icon: null, text: "Verificando usuário...", color: "text-blue-500" };
    }
    
    if (userVerificationError) {
      return { icon: AlertCircle, text: "Erro ao verificar usuário", color: "text-red-500" };
    }
    
    if (userCheckResult) {
      if (userCheckResult.exists) {
        return { icon: CheckCircle, text: "Usuário encontrado", color: "text-green-500" };
      } else {
        return { icon: AlertCircle, text: "Usuário não encontrado", color: "text-red-500" };
      }
    }
    
    return null;
  };

  const emailStatus = getEmailStatus();
  const isLoginDisabled = !formData.email || !formData.password || 
                         (userCheckResult && !userCheckResult.exists) ||
                         isCheckingUser || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold title-gradient">
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Acesse o Gestor de Ração para Galinhas
          </p>
        </div>

        <div className="card p-8 shadow-lg dark:shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Mensagens de erro de autenticação */}
            {authError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {authError}
              </div>
            )}

            {/* Campo de Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 ${
                    errors.email ? 'border-red-300 dark:border-red-600' : 
                    userCheckResult?.exists ? 'border-green-300 dark:border-green-600' :
                    userCheckResult?.exists === false ? 'border-red-300 dark:border-red-600' :
                    'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="seu@email.com"
                />
                {emailStatus && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {emailStatus.icon && <emailStatus.icon className={`h-4 w-4 ${emailStatus.color}`} />}
                  </div>
                )}
              </div>
              
              {/* Status do email */}
              {emailStatus && (
                <p className={`mt-1 text-xs ${emailStatus.color} flex items-center`}>
                  {emailStatus.icon && <emailStatus.icon className="w-3 h-3 mr-1" />}
                  {emailStatus.text}
                </p>
              )}
              
              {/* Erro de validação */}
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Campo de Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 ${
                    errors.password ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
                  )}
                </button>
              </div>
              
              {/* Erro de validação */}
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={isLoginDisabled}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {authLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>

            {/* Link para registro */}
            <div className="text-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300"
                >
                  Cadastre-se aqui
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
