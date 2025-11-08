'use client';

import { Gamepad2, Sparkles, Zap, Trophy, Target, Clock, Lock } from 'lucide-react';

export default function GamifiedPage() {
  return (
    <div className="min-h-full space-y-8 p-6 lg:p-10">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-linear-to-br from-purple-500 via-pink-500 to-rose-500 p-3 text-white shadow-lg">
            <Gamepad2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              Gamified Assignments
            </h1>
            <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Transform learning into an engaging adventure with game-based assessments and rewards
            </p>
          </div>
        </div>
      </header>

      {/* Coming Soon Container */}
      <div className="mx-auto max-w-4xl">
        <div 
          className="rounded-3xl border p-12 shadow-2xl"
          style={{
            borderColor: 'var(--dashboard-border)',
            backgroundColor: 'var(--dashboard-surface-solid)',
          }}
        >
          {/* Lock Icon */}
          <div className="mb-8 flex justify-center">
            <div 
              className="rounded-full p-8 shadow-lg"
              style={{
                backgroundColor: 'var(--dashboard-surface-muted)',
              }}
            >
              <Lock size={64} style={{ color: 'var(--dashboard-primary)' }} />
            </div>
          </div>

          {/* Coming Soon Title */}
          <div className="text-center">
            <h2 
              className="mb-4 text-4xl font-bold"
              style={{ color: 'var(--dashboard-heading)' }}
            >
              Coming Soon!
            </h2>
            <p 
              className="mx-auto mb-8 max-w-2xl text-lg"
              style={{ color: 'var(--dashboard-text)' }}
            >
              We're working on something exciting! Gamified assignments will revolutionize how students engage with learning materials.
            </p>
          </div>

          {/* Feature Preview Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div 
              className="rounded-2xl border p-6 text-center"
              style={{
                borderColor: 'var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-muted)',
              }}
            >
              <div className="mb-4 flex justify-center">
                <div 
                  className="rounded-full p-4"
                  style={{
                    backgroundColor: 'var(--dashboard-background)',
                  }}
                >
                  <Trophy size={32} style={{ color: 'var(--dashboard-primary)' }} />
                </div>
              </div>
              <h3 
                className="mb-2 text-lg font-semibold"
                style={{ color: 'var(--dashboard-heading)' }}
              >
                Achievement System
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--dashboard-muted)' }}
              >
                Unlock badges, trophies, and rewards as students complete challenges
              </p>
            </div>

            {/* Feature 2 */}
            <div 
              className="rounded-2xl border p-6 text-center"
              style={{
                borderColor: 'var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-muted)',
              }}
            >
              <div className="mb-4 flex justify-center">
                <div 
                  className="rounded-full p-4"
                  style={{
                    backgroundColor: 'var(--dashboard-background)',
                  }}
                >
                  <Zap size={32} style={{ color: 'var(--dashboard-primary)' }} />
                </div>
              </div>
              <h3 
                className="mb-2 text-lg font-semibold"
                style={{ color: 'var(--dashboard-heading)' }}
              >
                Power-Ups & Boosts
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--dashboard-muted)' }}
              >
                Earn special abilities and hints by maintaining streaks and high scores
              </p>
            </div>

            {/* Feature 3 */}
            <div 
              className="rounded-2xl border p-6 text-center"
              style={{
                borderColor: 'var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-muted)',
              }}
            >
              <div className="mb-4 flex justify-center">
                <div 
                  className="rounded-full p-4"
                  style={{
                    backgroundColor: 'var(--dashboard-background)',
                  }}
                >
                  <Target size={32} style={{ color: 'var(--dashboard-primary)' }} />
                </div>
              </div>
              <h3 
                className="mb-2 text-lg font-semibold"
                style={{ color: 'var(--dashboard-heading)' }}
              >
                Quest-Based Learning
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--dashboard-muted)' }}
              >
                Transform assignments into exciting quests with multiple levels
              </p>
            </div>

            {/* Feature 4 */}
            <div 
              className="rounded-2xl border p-6 text-center"
              style={{
                borderColor: 'var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-muted)',
              }}
            >
              <div className="mb-4 flex justify-center">
                <div 
                  className="rounded-full p-4"
                  style={{
                    backgroundColor: 'var(--dashboard-background)',
                  }}
                >
                  <Sparkles size={32} style={{ color: 'var(--dashboard-primary)' }} />
                </div>
              </div>
              <h3 
                className="mb-2 text-lg font-semibold"
                style={{ color: 'var(--dashboard-heading)' }}
              >
                Leaderboards
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--dashboard-muted)' }}
              >
                Compete with classmates and climb the rankings
              </p>
            </div>

            {/* Feature 5 */}
            <div 
              className="rounded-2xl border p-6 text-center"
              style={{
                borderColor: 'var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-muted)',
              }}
            >
              <div className="mb-4 flex justify-center">
                <div 
                  className="rounded-full p-4"
                  style={{
                    backgroundColor: 'var(--dashboard-background)',
                  }}
                >
                  <Clock size={32} style={{ color: 'var(--dashboard-primary)' }} />
                </div>
              </div>
              <h3 
                className="mb-2 text-lg font-semibold"
                style={{ color: 'var(--dashboard-heading)' }}
              >
                Timed Challenges
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--dashboard-muted)' }}
              >
                Beat the clock for bonus points and multipliers
              </p>
            </div>

            {/* Feature 6 */}
            <div 
              className="rounded-2xl border p-6 text-center"
              style={{
                borderColor: 'var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-muted)',
              }}
            >
              <div className="mb-4 flex justify-center">
                <div 
                  className="rounded-full p-4"
                  style={{
                    backgroundColor: 'var(--dashboard-background)',
                  }}
                >
                  <Gamepad2 size={32} style={{ color: 'var(--dashboard-primary)' }} />
                </div>
              </div>
              <h3 
                className="mb-2 text-lg font-semibold"
                style={{ color: 'var(--dashboard-heading)' }}
              >
                Interactive Gameplay
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--dashboard-muted)' }}
              >
                Immersive learning experiences with game mechanics
              </p>
            </div>
          </div>

          {/* Status Message */}
          <div 
            className="mt-12 rounded-xl border p-6 text-center"
            style={{
              borderColor: 'var(--dashboard-border)',
              backgroundColor: 'var(--dashboard-background)',
            }}
          >
            <p 
              className="text-sm font-semibold"
              style={{ color: 'var(--dashboard-primary)' }}
            >
              🚀 Under Active Development
            </p>
            <p 
              className="mt-2 text-sm"
              style={{ color: 'var(--dashboard-muted)' }}
            >
              Our team is working hard to bring you this amazing feature. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div 
            className="rounded-2xl border p-6"
            style={{
              borderColor: 'var(--dashboard-border)',
              backgroundColor: 'var(--dashboard-surface-solid)',
            }}
          >
            <h3 
              className="mb-2 text-lg font-semibold"
              style={{ color: 'var(--dashboard-heading)' }}
            >
              Why Gamification?
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--dashboard-text)' }}
            >
              Research shows that gamified learning increases student engagement by up to 60% and improves knowledge retention through interactive, reward-based experiences.
            </p>
          </div>
          <div 
            className="rounded-2xl border p-6"
            style={{
              borderColor: 'var(--dashboard-border)',
              backgroundColor: 'var(--dashboard-surface-solid)',
            }}
          >
            <h3 
              className="mb-2 text-lg font-semibold"
              style={{ color: 'var(--dashboard-heading)' }}
            >
              Stay Informed
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--dashboard-text)' }}
            >
              Want to be notified when this feature launches? Check back regularly or contact your administrator for beta access opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
