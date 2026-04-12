import { useState } from "react";
import { SimpleInput } from "./SimpleInput";
import { SimpleButton } from "./SimpleButton";

type RegisterFormProps = {
  onRegister: (username: string, password: string, fullName: string) => void;
  loading?: boolean;
  error?: string | null;
};

export function RegisterForm({
  onRegister,
  loading,
  error,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(username, password, name);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border border-[#c5d9c5]">
        <h2 className="text-center mb-6">Регистрация</h2>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Имя</label>
            <SimpleInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>
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
            {loading ? "Регистрируем..." : "Зарегистрироваться"}
          </SimpleButton>
        </form>
      </div>
    </div>
  );
}