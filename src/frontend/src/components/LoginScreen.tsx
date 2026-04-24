import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Bell, FileText, Lock, Shield } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: FileText,
    title: "All Records in One Place",
    desc: "Prescriptions, reports, and appointments — always accessible",
  },
  {
    icon: Bell,
    title: "Medicine Reminders",
    desc: "Never miss a dose with timely alerts and tracking",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    desc: "Your health data stays with you, protected end-to-end",
  },
];

export function LoginScreen() {
  const { login, isLoggingIn } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-6 flex items-center justify-center shadow-elevated">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M22 6C22 6 10 10 10 22C10 28.627 15.373 34 22 34C28.627 34 34 28.627 34 22C34 10 22 6 22 6Z"
                fill="white"
                fillOpacity="0.3"
              />
              <rect x="19" y="14" width="6" height="16" rx="3" fill="white" />
              <rect x="14" y="19" width="16" height="6" rx="3" fill="white" />
            </svg>
          </div>

          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight mb-2">
            MediCare Hub
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your personal health companion — manage medicines, records, and
            appointments safely.
          </p>
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-sm space-y-4 mb-10"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="flex items-start gap-4 bg-card rounded-xl p-4 shadow-xs border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-display font-semibold text-foreground">
                  {feature.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Sign in button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="w-full max-w-sm space-y-3"
        >
          <Button
            data-ocid="login.submit_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-display font-semibold rounded-xl"
            size="lg"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Signing in…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Sign in with Internet Identity
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
            Secure, passwordless login. Your data stays private and belongs only
            to you.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="pb-8 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
