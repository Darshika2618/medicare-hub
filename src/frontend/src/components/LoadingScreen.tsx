import { motion } from "motion/react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
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

        {/* App name */}
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            MediCare Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your Health Companion
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
