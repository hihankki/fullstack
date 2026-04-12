import { useState } from "react";
import { SimpleInput } from "./SimpleInput";
import { SimpleButton } from "./SimpleButton";

type LoginFormProps = {
  onLogin: (username: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
};

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border border-[#c5d9c5]">
        <h2 className="text-center mb-6">Вход</h2>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Логин</label>
            <SimpleInput
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-2">Пароль</label>
            <SimpleInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <SimpleButton
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Входим..." : "Войти"}
          </SimpleButton>
        </form>
      </div>
    </div>
  );
}