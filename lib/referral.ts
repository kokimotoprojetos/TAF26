import type { SupabaseClient } from '@supabase/supabase-js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRefCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export async function generateUniqueRefCode(
  supabaseAdmin: SupabaseClient<any, any, any>,
  attempts = 5
): Promise<string> {
  let code = '';
  for (let i = 0; i < attempts; i++) {
    code = generateRefCode(6);
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
      page: 1,
    });
    if (error || !data?.users) break;
    const exists = data.users.some(
      (u: any) => u.user_metadata?.ref_code === code
    );
    if (!exists) return code;
  }
  return code;
}
