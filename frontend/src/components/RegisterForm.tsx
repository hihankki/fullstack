import { useState } from 'react';
import { SimpleInput } from './SimpleInput';
import { SimpleButton } from './SimpleButton';

type RegisterFormProps = {
  onRegister: () => void;
};

export function RegisterForm({ onRegister }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border border-[#c5d9c5]">
        <h2 className="text-center mb-6">Регистрация</h2>
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
            <label className="block mb-2">Email</label>
            <SimpleInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <SimpleButton type="submit" className="w-full">
            Зарегистрироваться
          </SimpleButton>
        </form>
      </div>
    </div>
  );
}
