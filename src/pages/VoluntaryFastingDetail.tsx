import { motion } from "framer-motion";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { EXTERNAL_LINKS } from "@/lib/config";
import fastingData from "@/data/fasting-programs.json";

type SunnahType = {
  id?: string;
  name: string;
  arabicName?: string;
  description: string;
  frequency: string;
  hadithSource?: string;
  hadithOutline?: string;
};

export default function VoluntaryFastingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const types = (fastingData.sunnahFasting as { types: SunnahType[] }).types;
  const type = types.find((t) => (t as SunnahType & { id?: string }).id === slug || 
    t.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and") === slug?.replace(/&/g, "and"));

  if (!type) {
    return <Navigate to="/programs" replace />;
  }

  const hadithSource = type.hadithSource ?? "Sahih al-Bukhari fasting voluntary";
  const searchUrl = `${EXTERNAL_LINKS.sunnah}/search?q=${encodeURIComponent(hadithSource)}`;

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={`${type.name} | Voluntary Fasting | TryRamadan.app`}
        description={type.description}
        path={`/programs/${slug}`}
        type="article"
      />
      <Navbar />
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl min-w-0">
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 min-h-[44px] items-center"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span>Back to Fasting Programs</span>
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <Calendar className="w-4 h-4" />
                {type.frequency}
              </span>
              {type.arabicName && (
                <span className="font-arabic text-lg text-secondary" dir="rtl">
                  {type.arabicName}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-4">
              {type.name}
            </h1>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {type.description}
            </p>

            {type.hadithOutline && (
              <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 mb-6">
                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-2">
                  Hadith reference
                </h2>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  {type.hadithOutline}
                </p>
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-secondary hover:underline font-medium"
                >
                  View full hadith on Sunnah.com
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Add this voluntary fasting to your journey during onboarding or in Settings. You can combine it with Full Ramadan fast—many Muslims observe both Ramadan and Sunnah fasts such as Monday & Thursday or Ayyam al-Beed.
              </p>
              <Link
                to="/settings#settings-fasting-path"
                className="inline-flex items-center gap-2 mt-4 text-secondary hover:underline font-medium text-sm"
              >
                Set fasting options in Settings
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </motion.article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
