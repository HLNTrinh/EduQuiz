import React, { useState, useEffect, useRef } from 'react';
import { getTeachers } from '../../services/adminService';

// Usage: <TeacherAutocomplete value={teacherObj} onChange={(teacher)=>{}} />
export default function TeacherAutocomplete({ value, onChange, placeholder = 'Chọn giáo viên' }) {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setQuery(value?.name || '');
  }, [value]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await getTeachers({ search: query, limit: 10 });
        // adminService returns data directly via api wrapper -> { success, users, total }
        const users = res.users || [];
        setSuggestions(users);
      } catch (err) {
        console.error('Teacher search error', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleSelect = (user) => {
    setQuery(user.name);
    setSuggestions([]);
    setOpen(false);
    if (onChange) onChange(user);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
      />

      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        style={{ position: 'absolute', right: 0, top: 0, height: '100%' }}
      >
        ▾
      </button>

      {open && (suggestions.length > 0 || loading) && (
        <div style={{ position: 'absolute', zIndex: 50, background: '#fff', border: '1px solid #ddd', width: '100%', maxHeight: 220, overflow: 'auto' }}>
          {loading && <div style={{ padding: 8 }}>Đang tìm...</div>}
          {!loading && suggestions.map((u) => (
            <div key={u._id} onClick={() => handleSelect(u)} style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{u.email}</div>
            </div>
          ))}
          {!loading && suggestions.length === 0 && <div style={{ padding: 8 }}>Không có kết quả</div>}
        </div>
      )}
    </div>
  );
}
