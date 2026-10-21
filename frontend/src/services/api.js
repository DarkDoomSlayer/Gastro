const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    return { status: 'DOWN', error: error.message };
  }
}

export async function checkDatabaseHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health/db`);
    return await res.json();
  } catch (error) {
    return { status: 'DOWN', error: error.message };
  }
}

export async function fetchArchitectureInfo() {
  try {
    const res = await fetch(`${API_BASE}/api/architecture`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    return null;
  }
}
