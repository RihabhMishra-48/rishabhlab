import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { connectDB, closeDB } from '../config/db';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || 'admin@rishabhlabs.com').trim().toLowerCase();
  const password = args[1] || process.env.ADMIN_PASSWORD || 'Admin@123';
  const name = args[2] || 'Super Administrator';
  const role = (args[3] || 'super_admin') as any;

  console.log(`\n [Admin CLI] Creating / Updating administrator:`);
  console.log(`   Email: ${email}`);
  console.log(`   Name:  ${name}`);
  console.log(`   Role:  ${role}`);

  try {
    // 1. Create or update in Supabase (Primary Cloud Datastore)
    if (isSupabaseConfigured() && supabase) {
      console.log('⚡ [Admin CLI] Synchronizing administrator with Supabase...');
      let userId: string = crypto.randomUUID();

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        userId = existingUser.id;
        await supabase.from('profiles').update({
          full_name: name,
          role,
          is_onboarded: true,
          verification_status: 'approved',
        }).eq('id', userId);
        console.log(`✅ [Admin CLI] Supabase profile updated to ${role}.`);
      } else {
        const { data: sbAuth } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: name, role },
        });
        if (sbAuth?.user?.id) userId = sbAuth.user.id;

        await supabase.from('profiles').upsert({
          id: userId,
          email,
          full_name: name,
          role,
          college_name: 'RishabhLabs Global HQ',
          is_onboarded: true,
          verification_status: 'approved',
        });
        console.log(`✅ [Admin CLI] New administrator created in Supabase.`);
      }
    }

    console.log(`\n🎉 Credentials Ready:`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Login at: http://localhost:5173/login\n`);
  } catch (err: any) {
    console.error(`❌ [Admin CLI] Failed to create admin:`, err.message);
  } finally {
    process.exit(0);
  }
}

createAdmin();
