import { useEffect, useState } from "react";
import { apiFetch } from "../api/http";

type UserRow = { username: string; role: "user" | "admin"; full_name: string };

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const res = await apiFetch("/api/admin/users");
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMsg(data?.detail || "Не удалось загрузить пользователей");
      return;
    }
    setUsers(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async () => {
    setMsg(null);
    const res = await apiFetch(`/api/admin/users/${username}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMsg(data?.detail || "Ошибка смены роли");
      return;
    }
    setMsg("Ок ✅");
    setUsername("");
    await load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Админка: роли пользователей</h2>

      <div className="p-4 bg-white rounded-xl border mb-6">
        <div className="font-semibold mb-2">Сменить роль</div>
        <div className="flex gap-2">
          <input className="border rounded-lg px-3 py-2 flex-1" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          <select className="border rounded-lg px-3 py-2" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button className="px-4 py-2 rounded-lg bg-[#7fb87f] text-white" disabled={!username.trim()} onClick={apply}>
            Применить
          </button>
        </div>
        {msg && <div className="mt-2 text-sm">{msg}</div>}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="grid grid-cols-3 font-semibold bg-[#f0f5f0] p-3">
          <div>Username</div>
          <div>Имя</div>
          <div>Role</div>
        </div>
        {users.map((u) => (
          <div key={u.username} className="grid grid-cols-3 p-3 border-t">
            <div>{u.username}</div>
            <div>{u.full_name}</div>
            <div>{u.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}