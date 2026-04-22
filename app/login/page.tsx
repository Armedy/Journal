"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      alert('Wrong password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4">Enter Password</h1>
        <input 
          type="password" 
          className="border p-2 w-full rounded mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Unlock Journal
        </button>
      </form>
    </div>
  );
}