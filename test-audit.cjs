const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  "https://zzpmdwwzfmfktkmhxxhd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cG1kd3d6Zm1ma3RrbWh4eGhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzcwODA2NiwiZXhwIjoyMDk5Mjg0MDY2fQ.L1sYC0KqQsLkuB-YkC54aEGVVCMXYI2POd39DUC7nIU"
);

async function main() {
  let page = 1;
  const allUsers = [];
  
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000, page });
    console.log("Page", page, "- users:", data?.users?.length || 0, "error:", !!error);
    if (error || !data?.users || data.users.length === 0) break;
    allUsers.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
    if (page > 10) break;
  }
  
  console.log("\n=== RESULTADOS ===");
  console.log("Total usuarios:", allUsers.length);
  
  // 1. Check user6100 exists
  const user6100 = allUsers.find(u => u.user_metadata?.ref_code === "user6100");
  if (user6100) {
    console.log("\nuser6100 ENCONTRADO:");
    console.log("  Email:", user6100.email);
    console.log("  ID:", user6100.id);
    console.log("  Balance:", user6100.user_metadata?.balance);
    console.log("  ref_code:", user6100.user_metadata?.ref_code);
  } else {
    console.log("\nuser6100 NAO ENCONTRADO - ref_code nao existe!");
  }
  
  // 2. Check referrals (users with referred_by === user6100)
  const referrals = allUsers.filter(u => u.user_metadata?.referred_by === "user6100");
  console.log("\nUsuarios indicados por user6100:", referrals.length);
  referrals.forEach(u => {
    console.log("  -", u.email, "referred_by:", u.user_metadata?.referred_by, "data:", u.created_at);
  });
  
  // 3. Show all ref_codes
  console.log("\nTodos usuarios com ref_code:");
  allUsers
    .filter(u => u.user_metadata?.ref_code)
    .forEach(u => console.log("  -", u.email, "ref:", u.user_metadata?.ref_code, "balance:", u.user_metadata?.balance));
}

main().catch(console.error);