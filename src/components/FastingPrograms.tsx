import { motion } from "framer-motion";
import { ArabicHover } from "@/components/ArabicHover";
import fastingData from "@/data/fasting-programs.json";

interface FastingProgramsProps {
  onSelectProgram?: (programId: string) => void;
  selectedProgram?: string;
}

export const FastingPrograms = ({ onSelectProgram, selectedProgram = "traditional" }: FastingProgramsProps) => {
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
              ${program.recommended ? "border-2 border-secondary/50" : ""}
            `}
          >
            {/* Recommended badge */}
            {program.recommended && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-gold py-1 px-3 text-center">
                <span className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                  <span aria-hidden>⭐</span>
                  <ArabicHover arabic="موصى به" className="border-0 text-foreground">Recommended</ArabicHover>
                </span>
              </div>
            )}

            {/* Selected indicator */}
            {selectedProgram === program.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center text-sm" aria-hidden>
                ✅
              </div>
            )}

            <div className={program.recommended ? "pt-6" : ""}>
              {/* Duration badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base" aria-hidden>🕐</span>
                <span className="text-sm font-semibold text-secondary">{program.duration}</span>
              </div>

              <h3 className="font-display text-xl font-bold mb-1">
                {program.nameAr ? (
                  <ArabicHover arabic={program.nameAr}>{program.name}</ArabicHover>
                ) : (
                  program.name
                )}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{program.description}</p>

              {/* Weekly schedule preview */}
              <div className="space-y-2 mb-4">
                {program.weeklySchedule.slice(0, 2).map((week, weekIndex) => (
                  <div key={weekIndex} className="flex items-center gap-2 text-xs">
                    <span className="text-sm" aria-hidden>🎯</span>
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
              <ArabicHover arabic={fastingData.sunnahFasting.arabicName}>
                {fastingData.sunnahFasting.title}
              </ArabicHover>
            </h4>
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
