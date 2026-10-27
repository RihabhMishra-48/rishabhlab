import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Onboarding } from '../models/StudentProfile';
import { Roadmap } from '../models/Roadmap';
import { DailyMission } from '../models/DailyMission';
import { StudentProfile } from '../models/StudentProfile';
import { aiService } from '../services/aiService';

const router = Router();

import { Mentor } from '../models/Mentorship';

// Submit student or mentor onboarding data
router.post('/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const {
      role = 'student',
      fieldOfInterest,
      goal,
      name,
      college,
      degree,
      year,
      currentLevel,
      availableTime,
      desiredOutcome,
      targetDate,
      existingSkills,
      preferredLearningStyle,
      mentorOrganization,
      mentorExperienceYears,
      mentorLinkedin,
      mentorBio,
      mentorExpertise,
    } = req.body;

    const selectedGoal = fieldOfInterest || goal || 'Web Development';
    const chosenRole = role === 'mentor' ? 'mentor' : 'student';
    const verificationStatus = chosenRole === 'mentor' ? 'pending' : 'approved';

    const onboardingRecord = await Onboarding.create({
      userId: user._id,
      goal: selectedGoal,
      currentLevel: currentLevel || (chosenRole === 'mentor' ? 'Advanced' : 'Complete Beginner'),
      availableTime: availableTime || '2 hours/day',
      desiredOutcome: desiredOutcome || (chosenRole === 'mentor' ? 'Guide students & review code' : 'Build projects'),
      targetDate: targetDate || '90 days',
      existingSkills: existingSkills || [],
      preferredLearningStyle: preferredLearningStyle || 'Hands-on Building',
      status: 'completed',
    });

    // Clear any previous roadmaps/missions for this user so the new track takes effect immediately
    await Roadmap.deleteMany({ userId: user._id });
    await DailyMission.deleteMany({ userId: user._id });

    // Generate tailored Roadmap via AIService
    const generatedRoadmapData = await aiService.generateRoadmap({
      goal: selectedGoal,
      currentLevel: currentLevel || (chosenRole === 'mentor' ? 'Advanced' : 'Complete Beginner'),
      availableTime: availableTime || '2 hours/day',
      desiredOutcome: desiredOutcome || 'Build projects',
      targetDate: targetDate || '90 days',
      existingSkills: existingSkills || [],
    });

    const roadmap = await Roadmap.create({
      ...generatedRoadmapData,
      userId: user._id,
    });

    // Generate initial Daily Mission
    const missionData = await aiService.generateDailyMission(1, selectedGoal);
    const mission = await DailyMission.create({
      userId: user._id,
      dayNumber: 1,
      trackTitle: selectedGoal,
      dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      quote: missionData.quote,
      tasks: missionData.tasks,
      completedTasksCount: 0,
      isAllCompleted: false,
    });

    // Update user record in local MongoDB
    if (name && name.trim()) user.name = name.trim();
    user.role = chosenRole;
    if (chosenRole === 'student') {
      user.college = college ? college.trim() : (user.college || '');
      user.degree = degree ? degree.trim() : (user.degree || '');
      user.year = year ? year.trim() : (user.year || '');
    } else {
      user.college = '';
      user.degree = '';
      user.year = '';
    }
    user.targetGoal = selectedGoal;
    user.fieldOfInterest = selectedGoal;
    user.verificationStatus = verificationStatus;
    user.isOnboarded = true;

    if (chosenRole === 'mentor') {
      user.mentorOrganization = mentorOrganization ? mentorOrganization.trim() : (user.mentorOrganization || '');
      user.mentorExperienceYears = Number(mentorExperienceYears) || 0;
      user.mentorLinkedin = mentorLinkedin || '';
      user.mentorExpertise = Array.isArray(mentorExpertise) && mentorExpertise.length > 0 ? mentorExpertise : [selectedGoal];
      if (mentorBio) user.bio = mentorBio;

      // Register or update mentor listing in Mentors collection
      try {
        await Mentor.findOneAndUpdate(
          { name: user.name },
          {
            name: user.name,
            title: `${selectedGoal} Specialist & Mentor`,
            company: mentorOrganization ? mentorOrganization.trim() : 'Industry Expert',
            avatar: user.avatar || '',
            rating: 5.0,
            reviewsCount: 0,
            bio: mentorBio || user.bio || `Specialized mentor in ${selectedGoal} with ${user.mentorExperienceYears}+ years experience.`,
            hourlyRate: 'Free for Students',
            topics: user.mentorExpertise,
            availability: ['Mon, Wed, Fri (6:00 PM - 8:00 PM)', 'Weekends'],
            isAvailableToday: true,
            domain: selectedGoal,
          },
          { upsert: true, new: true }
        );
      } catch (mErr) {
        console.warn('Could not upsert mentor listing:', mErr);
      }
    }

    await user.save();

    // Update student profile in local MongoDB
    await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      {
        targetGoal: selectedGoal,
        activeRoadmapId: roadmap._id,
        progressPercent: chosenRole === 'mentor' ? 100 : 5,
        skillsCompleted: chosenRole === 'mentor' ? 10 : 0,
        streakDays: 1,
      },
      { upsert: true }
    );

    // Sync to Supabase profiles if configured
    try {
      const { supabase, isSupabaseConfigured } = await import('../config/supabase');
      if (isSupabaseConfigured() && supabase) {
        await supabase
          .from('profiles')
          .update({
            full_name: user.name,
            role: chosenRole,
            target_goal: selectedGoal,
            field_of_interest: selectedGoal,
            college_name: user.college,
            degree: user.degree,
            year_of_study: user.year,
            current_level: currentLevel,
            available_time: availableTime,
            desired_outcome: desiredOutcome,
            verification_status: verificationStatus,
            mentor_organization: user.mentorOrganization,
            mentor_experience_years: user.mentorExperienceYears,
            mentor_linkedin: user.mentorLinkedin,
            is_onboarded: true,
          })
          .eq('email', user.email);
      }
    } catch (e: any) {
      console.warn('Could not sync onboarding to Supabase:', e.message);
    }

    res.status(201).json({
      success: true,
      message: chosenRole === 'mentor'
        ? 'Mentor application submitted for advance verification. Welcome aboard!'
        : 'Onboarding completed and personalized curriculum generated!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        degree: user.degree,
        year: user.year,
        avatar: user.avatar,
        targetGoal: user.targetGoal,
        fieldOfInterest: user.fieldOfInterest,
        verificationStatus: user.verificationStatus,
        isOnboarded: user.isOnboarded,
      },
      onboarding: onboardingRecord,
      roadmapId: roadmap._id,
      missionId: mission._id,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to complete onboarding: ' + err.message });
  }
});

// "Not Sure Yet" Assessment Evaluation
router.post('/not-sure-assessment', async (req, res) => {
  try {
    const { interests, currentSkills, comfortLevel, preferredWork, timeAvailability } = req.body;
    const result = await aiService.evaluateNotSurePath({
      interests: interests || [],
      currentSkills: currentSkills || [],
      comfortLevel: comfortLevel || 'Beginner',
      preferredWork: preferredWork || 'Visual & Interactive',
      timeAvailability: timeAvailability || '2 hours/day',
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
