import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookMarked, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { getHabitById } from "@/data/ramadan-habits";

function isQuranUrl(url: string): boolean {
  return /quran\.com/i.test(url);
}

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const habit = id ? getHabitById(id) : undefined;

  if (!habit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="main-content pt-6 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Link to="/habits" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Habits
            </Link>
            <h1 className="text-xl font-display font-bold">Habit not found</h1>
            <p className="text-muted-foreground mt-2">This habit may have been removed or the link is incorrect.</p>
            <Link to="/habits" className="inline-block mt-4 text-secondary font-medium hover:underline">
              View all Ramadan habits
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const primaryIsQuran = isQuranUrl(habit.sourceUrl);
  const seoTitle = `${habit.title} | Ramadan Habits | TryRamadan`;
  const seoDescription =
    habit.explanation.slice(0, 155) + (habit.explanation.length > 155 ? "…" : "");

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={seoTitle}
        description={seoDescription}
        path={`/habit/${habit.id}`}
        type="article"
      />
      <Navbar />
      <main id="main-content" className="main-content pt-6 pb-12">
        <div className="container mx-auto px-4 max-w-2xl min-w-0">
          <Link
            to="/habits"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to Habits
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-8 space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  habit.type === "forbidden"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-secondary/10 text-secondary border border-secondary/20"
                }`}
              >
                {habit.type === "forbidden" ? "Avoid" : "Sunnah"}
              </span>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                title={habit.tag === "muslim" ? "Applies to Muslims" : "Applies to everyone"}
              >
                {habit.tag === "muslim" ? "Muslim" : "Everyone"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
              {habit.title}
            </h1>

            <blockquote className="pl-4 sm:pl-5 border-l-4 border-secondary/50 text-base sm:text-lg text-muted-foreground italic">
              &ldquo;{habit.quote}&rdquo;
            </blockquote>

            <section aria-labelledby="habit-sources-heading">
              <h2 id="habit-sources-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Sources (Quran & hadith)
              </h2>
              <div className="flex flex-wrap gap-2">
                <a
                  href={habit.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors min-h-[44px] ${
                    primaryIsQuran
                      ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                      : "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20"
                  }`}
                  title={primaryIsQuran ? "View verse on Quran.com" : "View hadith on Sunnah.com"}
                >
                  <BookMarked className="w-4 h-4 shrink-0" aria-hidden />
                  {habit.sourceLabel}
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden />
                </a>
                {habit.sourceUrl2 && habit.sourceLabel2 && (
                  <a
                    href={habit.sourceUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors min-h-[44px] ${
                      isQuranUrl(habit.sourceUrl2)
                        ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                        : "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20"
                    }`}
                    title={isQuranUrl(habit.sourceUrl2) ? "View verse on Quran.com" : "View hadith on Sunnah.com"}
                  >
                    <BookMarked className="w-4 h-4 shrink-0" aria-hidden />
                    {habit.sourceLabel2}
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden />
                  </a>
                )}
              </div>
            </section>

            <section aria-labelledby="habit-explanation-heading">
              <h2 id="habit-explanation-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Explanation
              </h2>
              <p className="text-foreground leading-relaxed">
                {habit.explanation}
              </p>
            </section>

            <p className="text-sm text-muted-foreground pt-2 border-t border-border">
              Track this and other sunnah habits in your{" "}
              <Link to="/dashboard/journal" className="text-secondary font-medium hover:underline">
                Reflection Journal
              </Link>
              .
            </p>
          </motion.article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
