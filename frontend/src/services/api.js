const API_BASE = "http://localhost:5000/api";

export async function getCourses() {
  const res = await fetch(`${API_BASE}/courses`);
  return res.json();
}

export async function getPrograms() {
  const res = await fetch(`${API_BASE}/programs`);
  return res.json();
}
