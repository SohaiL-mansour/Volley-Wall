const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://afcnwwtxypudtvwfyljb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminEmail = process.argv[2];
const adminPassword = process.argv[3];

if (!adminEmail || !adminPassword) {
  console.error('Usage: node create-admin.cjs <email> <password>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

(async () => {
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });
  if (error) {
    if (error.message.includes('already been registered')) {
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing.users.find((u) => u.email === adminEmail);
      if (found) {
        const { error: updateError } = await supabase.from('profiles').update({ is_admin: true }).eq('id', found.id);
        if (updateError) {
          console.error(updateError.message);
          process.exit(1);
        }
        console.log('Existing user promoted to admin:', found.id);
        process.exit(0);
      }
    }
    console.error(error.message);
    process.exit(1);
  }
  const userId = data.user.id;
  const { error: updateError } = await supabase.from('profiles').update({ is_admin: true }).eq('id', userId);
  if (updateError) {
    console.error(updateError.message);
    process.exit(1);
  }
  console.log('Admin created:', userId);
})();
