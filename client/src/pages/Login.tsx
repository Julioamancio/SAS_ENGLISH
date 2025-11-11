import { useState } from "react";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    // Pegar valores diretamente do DOM para funcionar com automação
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const emailValue = emailInput?.value || email;
    const passwordValue = passwordInput?.value || password;

    if (!emailValue || !passwordValue) {
      setError("Por favor, preencha email e senha");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login bem-sucedido, redirecionar
        window.location.href = "/";
      } else {
        setError(data.message || "Email ou senha incorretos");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {APP_TITLE}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Entre com suas credenciais para acessar o sistema
        </p>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        {/* Link de registro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{" "}
            <button
              onClick={() => setLocation("/register")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Registre-se
            </button>
          </p>
        </div>

        {/* Conta padrão */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center font-medium mb-2">
            CONTA PADRÃO
          </p>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="text-center">Conta Admin de Teste:</p>
            <p className="text-center">Email: <span className="font-mono">admin@sas.com</span></p>
            <p className="text-center">Senha: <span className="font-mono">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
