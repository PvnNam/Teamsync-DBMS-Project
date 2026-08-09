const API_BASE = '';

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function resetPassword(email, token, newPassword) {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Reset failed');
  return data;
}

export async function fetchProfile(username = 'pixelpilot') {
  const res = await fetch(`${API_BASE}/api/profile/${username}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load profile');
  return data;
}

export async function saveProfile(currentUsername, newUsername, games) {
  const res = await fetch(`${API_BASE}/api/profile/${currentUsername}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newUsername, games })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save profile');
  return data;
}

export async function fetchRequirements() {
  const res = await fetch(`${API_BASE}/api/requirements`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch requirements');
  return data;
}

export async function fetchTeams() {
  const res = await fetch(`${API_BASE}/api/teams`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch teams');
  return data;
}
