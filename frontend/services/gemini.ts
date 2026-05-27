import { UserProfile, CareerRecommendation } from "../types";

// Helper to get authorization headers of logged in user
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("pathfinder_auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getCareerRecommendation(profile: UserProfile): Promise<CareerRecommendation> {
  const res = await fetch("/api/recommendation", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate recommendation via server");
  }

  return res.json();
}

export async function getCareerChatResponse(
  message: string, 
  history: { role: 'user' | 'model', text: string }[],
  profile: UserProfile,
  recommendation: CareerRecommendation | null
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      message,
      history,
      profile,
      recommendation,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to secure chat with AI Assistant");
  }

  const data = await res.json();
  return data.text;
}

