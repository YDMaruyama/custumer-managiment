"use client";

import React, { useEffect, useState } from 'react';

interface Customer {
  id: string;
  name: string;
  kana?: string;
  phone?: string;
  email?: string;
  note?: string;
}

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers on mount
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error(`Failed to fetch customers: ${res.status}`);
        const data = await res.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchCustomers();
  }, []);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create customer');
      const created = await res.json();
      setCustomers([...customers, created]);
      setForm({});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle input changes
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>顧客管理アプリ（ローカル開発版）</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <section style={{ marginBottom: '2rem' }}>
        <h2>新規顧客追加</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', maxWidth: '400px' }}>
          <input
            type="text"
            name="name"
            placeholder="名前"
            value={form.name || ''}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="kana"
            placeholder="フリガナ"
            value={form.kana || ''}
            onChange={handleInputChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="電話番号"
            value={form.phone || ''}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="メールアドレス"
            value={form.email || ''}
            onChange={handleInputChange}
          />
          <textarea
            name="note"
            placeholder="メモ"
            value={form.note || ''}
            onChange={handleInputChange}
            rows={3}
          />
          <button type="submit" disabled={loading}>
            {loading ? '追加中...' : '追加'}
          </button>
        </form>
      </section>
      <section>
        <h2>顧客一覧</h2>
        <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>名前</th>
              <th>フリガナ</th>
              <th>電話番号</th>
              <th>メール</th>
              <th>メモ</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.kana}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}