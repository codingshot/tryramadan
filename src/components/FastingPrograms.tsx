import { motion } from "framer-motion";
import { Clock, Check, Target } from "lucide-react";
import fastingData from "@/data/fasting-programs.json";

interface FastingProgramsProps {
  onSelectProgram?: (programId: string) => void;
  selectedProgram?: string;
}

export const FastingPrograms = ({ onSelectProgram, selectedProgram = "beginner" }: FastingProgramsProps) => {
  const programs = fastingData.programs;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {programs.map((program, index) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectProgram?.(program.id)}
            className={`
              card-cultural cursor-pointer relative overflow-hidden
              ${selectedProgram === program.id 
                ? "ring-2 ring-secondary shadow-gold" 
                : "hover:shadow-elevated"
              }
            `}
          >
            {/* Selected indicator */}
            {selectedProgram === program.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center">
                <Check className="w-4 h-4 text-foreground" />
              </div>
            )}

            {/* Duration badge */}
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">{program.duration}</span>
            </div>

            <h3 className="font-display text-xl font-bold mb-2">{program.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{program.description}</p>

            {/* Weekly schedule preview */}
            <div className="space-y-2 mb-4">
              {program.weeklySchedule.slice(0, 2).map((week, weekIndex) => (
                <div key={weekIndex} className="flex items-center gap-2 text-xs">
                  <Target className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Week {week.week}: {typeof week.hours === 'number' ? `${week.hours}h` : week.hours}
                  </span>
                </div>
              ))}
              {program.weeklySchedule.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{program.weeklySchedule.length - 2} more weeks
                </span>
              )}
            </div>

            {/* Tips preview */}
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                💡 {program.tips[0]}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sunnah fasting info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-cultural bg-gradient-to-br from-primary/5 to-primary/10"
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl">☪️</span>
          <div>
            <h4 className="font-display text-lg font-bold mb-1">
              {fastingData.sunnahFasting.title}
            </h4>
            <p className="font-arabic text-secondary mb-2">
              {fastingData.sunnahFasting.arabicName}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {fastingData.sunnahFasting.description}
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {fastingData.sunnahFasting.types.slice(0, 2).map((type) => (
                <div key={type.name} className="p-3 rounded-lg bg-background/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{type.name}</span>
                    <span className="text-xs text-secondary">{type.frequency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
