
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'lxrd@fallens.com',
      password: 'Lord@admin@123',
      email_confirm: true,
      user_metadata: { name: 'Lord' }
    });

    if (authError) {
      // User might already exist
      if (authError.message?.includes('already been registered')) {
        // Get existing user
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === 'lxrd@fallens.com');
        if (existingUser) {
          // Ensure role exists
          await supabaseAdmin.from('user_roles').upsert(
            { user_id: existingUser.id, role: 'admin' },
            { onConflict: 'user_id,role' }
          );
          // Update profile
          await supabaseAdmin.from('profiles').update({ name: 'Lord' }).eq('id', existingUser.id);
          return new Response(JSON.stringify({ success: true, message: 'Admin role assigned to existing user' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
      throw authError;
    }

    // Update profile with name
    await supabaseAdmin.from('profiles').update({
      name: 'Lord',
      first_name: 'Lord',
    }).eq('id', authData.user.id);

    // Assign admin role
    await supabaseAdmin.from('user_roles').insert({
      user_id: authData.user.id,
      role: 'admin'
    });

    return new Response(JSON.stringify({ success: true, userId: authData.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
