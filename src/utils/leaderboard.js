const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const LEADERBOARD_TABLE = 'leaderboard_entries';

export const GAME_KEYS = {
  kerupuk: 'kerupuk',
  karung: 'karung',
  tarik: 'tarik',
  estafet: 'estafet',
};

export function isLeaderboardConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function getHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchLeaderboard(gameKey, limit = 5) {
  if (!isLeaderboardConfigured()) {
    return [];
  }

  const query = new URLSearchParams({
    select: 'id,player_name,region,score,detail_value,verdict,created_at',
    game_key: `eq.${gameKey}`,
    order: 'score.desc,created_at.asc',
    limit: String(limit),
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}?${query}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.status}`);
  }

  return response.json();
}

export async function submitScore(entry) {
  if (!isLeaderboardConfigured()) {
    return { skipped: true };
  }

  const payload = {
    game_key: entry.gameKey,
    player_name: entry.playerName.trim(),
    region: entry.region?.trim() || null,
    score: Number(entry.score),
    detail_label: entry.detailLabel ?? null,
    detail_value: entry.detailValue ?? null,
    verdict: entry.verdict ?? null,
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${LEADERBOARD_TABLE}`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit score: ${response.status}`);
  }

  const rows = await response.json();
  return rows[0] ?? null;
}
