import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin26';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

function verifyAdmin(req: Request): boolean {
  const password = req.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
}

async function getAllUsers(sb: any) {
  const allUsers: any[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({ perPage, page });
    if (error || !data?.users) break;
    allUsers.push(...data.users);
    if (data.users.length < perPage) break;
    page++;
    if (page > 10) break;
  }
  return allUsers;
}

export async function POST(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const users = await getAllUsers(sb);
    const results: any[] = [];

    // Phase 1: Normalize all referred_by to uppercase for users that have it
    for (const user of users) {
      const meta = user.user_metadata || {};
      const rb = (meta.referred_by || '').toString();
      if (rb && rb !== rb.toUpperCase()) {
        await sb.auth.admin.updateUserById(user.id, {
          user_metadata: { ...meta, referred_by: rb.toUpperCase() },
        });
        results.push({ id: user.id, email: user.email, action: 'normalized_referred_by', from: rb, to: rb.toUpperCase() });
      }
    }

    // Phase 2: Build map of which users have which ref_code
    const refCodeOwner: Record<string, { id: string; email: string }> = {};
    for (const user of users) {
      const rc = ((user.user_metadata?.ref_code || '') as string).trim().toUpperCase();
      if (rc) refCodeOwner[rc] = { id: user.id, email: user.email || '' };
    }

    // Phase 3: For each unique referred_by that has no owner yet,
    // assign it to a user that doesn't have referred_by (original user), oldest first
    const referredByUsed = new Set<string>();
    for (const user of users) {
      const rb = ((user.user_metadata?.referred_by || '') as string).trim().toUpperCase();
      if (rb) referredByUsed.add(rb);
    }

    // Re-fetch refCodeOwner after normalization
    const refCodeOwner2: Record<string, { id: string; email: string }> = {};
    // Re-fetch users fresh
    const freshUsers = await getAllUsers(sb);
    for (const user of freshUsers) {
      const rc = ((user.user_metadata?.ref_code || '') as string).trim().toUpperCase();
      if (rc) refCodeOwner2[rc] = { id: user.id, email: user.email || '' };
    }

    let assigned = 0;
    // Get all original users (no referred_by) sorted oldest first
    const noRefByUsers = [...freshUsers]
      .filter(u => {
        const meta = u.user_metadata || {};
        return !(meta.referred_by || '').toString().trim();
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Also add users with referredBy, but who themselves could be referrers
    const withRefByUsers = [...freshUsers]
      .filter(u => {
        const meta = u.user_metadata || {};
        return !!(meta.referred_by || '').toString().trim();
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Combine: prioritize no-referred_by users, then others
    const candidates = [...noRefByUsers, ...withRefByUsers];

    let candidateIdx = 0;
    for (const code of referredByUsed) {
      if (refCodeOwner2[code]) continue;

      // Find next candidate without ref_code
      while (candidateIdx < candidates.length) {
        const c = candidates[candidateIdx];
        const meta = c.user_metadata || {};
        const existingRc = (meta.ref_code || '').toString().trim();
        if (!existingRc) break;
        candidateIdx++;
      }

      if (candidateIdx < candidates.length) {
        const candidate = candidates[candidateIdx];
        const meta = candidate.user_metadata || {};
        await sb.auth.admin.updateUserById(candidate.id, {
          user_metadata: { ...meta, ref_code: code },
        });
        refCodeOwner2[code] = { id: candidate.id, email: candidate.email || '' };
        results.push({ id: candidate.id, email: candidate.email, action: 'assigned_ref_code', refCode: code });
        assigned++;
        candidateIdx++;
      }
    }

    // Phase 4: Generate unique ref_codes for remaining users without one
    const finalUsers = await getAllUsers(sb);
    for (const user of finalUsers) {
      const meta = user.user_metadata || {};
      if ((meta.ref_code || '').toString().trim()) continue;
      
      const newCode = `u${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await sb.auth.admin.updateUserById(user.id, {
        user_metadata: { ...meta, ref_code: newCode },
      });
      results.push({ id: user.id, email: user.email, action: 'generated_ref_code', refCode: newCode });
    }

    return NextResponse.json({
      success: true,
      fixed: results,
      summary: { totalUsers: users.length, assigned, generated: results.length - assigned }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}