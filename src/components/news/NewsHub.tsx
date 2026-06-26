import { useState } from "react";
import NewsFeed from "@/components/news/NewsFeed";
import NewsSubmissionForm from "@/components/forms/NewsSubmissionForm";
import type { NewsConfidenceLevel } from "@/types/news";
import type { CommunityConfidenceLevel } from "@/types/community-feedback";

interface NewsHubProps {
  locale: "es" | "en";
  feedLabels: Record<string, string>;
  formLabels: Record<string, string>;
  confidenceLabels: Record<NewsConfidenceLevel, string>;
  feedbackLabels: Record<string, string>;
  communityConfidenceLabels: Record<CommunityConfidenceLevel, string>;
}

export default function NewsHub({
  locale,
  feedLabels,
  formLabels,
  confidenceLabels,
  feedbackLabels,
  communityConfidenceLabels,
}: NewsHubProps) {  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-16">
      <NewsFeed
        key={refreshKey}
        locale={locale}
        labels={feedLabels}
        confidenceLabels={confidenceLabels}
        feedbackLabels={feedbackLabels}
        communityConfidenceLabels={communityConfidenceLabels}
      />
      <section id="publicar-noticia">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-ink">{formLabels.sectionTitle}</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
            {formLabels.sectionSubtitle}
          </p>
        </div>
        <NewsSubmissionForm
          locale={locale}
          labels={formLabels}
          onSubmitted={() => setRefreshKey((value) => value + 1)}
        />
      </section>
    </div>
  );
}
