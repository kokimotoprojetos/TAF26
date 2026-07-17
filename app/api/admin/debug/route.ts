import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const diagnostics: Record<string, any> = {};

  // 1. Check env vars presence (not values for security)
  diagnostics.env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ADMIN_PASSWORD_SET: !!process.env.ADMIN_PASSWORD,
    supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...' || 'NOT SET',
    serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
  };

  // 2. Try to create client
  let client: any = null;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (url && key) {
      client = createClient(url, key);
      diagnostics.clientCreated = true;
    } else {
      diagnostics.clientCreated = false;
      diagnostics.clientError = `URL empty: ${!url}, Key empty: ${!key}`;
    }
  } catch (e: any) {
    diagnostics.clientCreated = false;
    diagnostics.clientError = e.message;
  }

  // 3. Try to list users (first page only)
  if (client) {
    try {
      const { data, error } = await client.auth.admin.listUsers({ perPage: 5, page: 1 });
      if (error) {
        diagnostics.listUsers = { success: false, error: error.message, code: error.status };
      } else {
        diagnostics.listUsers = {
          success: true,
          totalFound: data?.users?.length || 0,
          sampleEmails: data?.users?.slice(0, 3).map((u: any) => u.email?.substring(0, 15) + '...' || 'no email'),
        };
      }
    } catch (e: any) {
      diagnostics.listUsers = { success: false, error: e.message };
    }
  } else {
    diagnostics.listUsers = { success: false, error: 'Client not created' };
  }

  return NextResponse.json(diagnostics);
}
