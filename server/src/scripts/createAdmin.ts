import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
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

  console.log(`\n⚙️ [Admin CLI] Creating / Updating administrator:`);
  console.log(`   Email: ${email}`);
  console.log(`   Name:  ${name}`);
  console.log(`   Role:  ${role}`);

  try {
    await connectDB();

    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.role = role;
      user.name = name;
      user.password = hashedPassword;
      user.isOnboarded = true;
      user.verificationStatus = 'approved';
      await user.save();
      console.log(`✅ [Admin CLI] Existing user updated to ${role} successfully!`);
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        college: 'RishabhLabs Global HQ',
        isOnboarded: true,
        verificationStatus: 'approved',
      });

      await StudentProfile.create({
        userId: user._id,
        targetGoal: 'AI / Machine Learning',
        streakDays: 1,
        totalPoints: 500,
        progressPercent: 100,
        skillsCompleted: 18,
        totalSkills: 18,
        projectsCompleted: 4,
        totalProjects: 4,
      });

      console.log(`✅ [Admin CLI] New administrator account created successfully!`);
    }

    console.log(`\n🎉 Credentials Ready:`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Login at: http://localhost:5173/login\n`);
  } catch (err: any) {
    console.error(`❌ [Admin CLI] Failed to create admin:`, err.message);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

createAdmin();
