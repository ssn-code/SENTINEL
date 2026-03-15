import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LoaderCircle, MessageSquareQuote, Send, Star } from 'lucide-react';
import { buildApiUrl } from '../lib/api';
import SpotlightCard from './SpotlightCard';

type ReviewEntry = {
  id: number;
  name: string;
  rating: number;
  description: string;
  expectations: string;
  created_at: string | null;
};

type FeedbackFormState = {
  name: string;
  rating: string;
  description: string;
  expectations: string;
};

type FeedbackApiResponse = {
  reviews: ReviewEntry[];
};

const emptyForm: FeedbackFormState = {
  name: '',
  rating: '5',
  description: '',
  expectations: '',
};

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={`${rating}-${index}`}
      className={`h-4 w-4 ${index < rating ? 'fill-cyan-300 text-cyan-300' : 'text-white/20'}`}
    />
  ));
}

function formatReviewDate(value: string | null) {
  if (!value) return 'Recently submitted';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Recently submitted';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

export const ProjectFeedback: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [form, setForm] = useState<FeedbackFormState>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(buildApiUrl('/feedback'));
        const payload = (await response.json()) as FeedbackApiResponse | { detail?: string };

        if (!response.ok || !('reviews' in payload)) {
          throw new Error(('detail' in payload && payload.detail) || 'Unable to load feedback.');
        }

        if (!active) return;
        setReviews(payload.reviews);
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : 'Unable to load feedback.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadReviews();

    return () => {
      active = false;
    };
  }, []);

  const averageRating = useMemo(() => {
    if (!reviews.length) return '0.0';
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    setError(null);

    const payload = {
      name: form.name.trim(),
      rating: Number(form.rating),
      description: form.description.trim(),
      expectations: form.expectations.trim(),
    };

    if (!payload.name || !payload.description || !payload.expectations) {
      setError('Please complete all feedback fields.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(buildApiUrl('/feedback'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json()) as ReviewEntry | { detail?: string };

      if (!response.ok || !('id' in responsePayload)) {
        throw new Error(('detail' in responsePayload && responsePayload.detail) || 'Unable to save feedback.');
      }

      setReviews((current) => [responsePayload, ...current]);
      setForm(emptyForm);
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <SpotlightCard
        className="rounded-[2rem] border border-border bg-surface p-8"
        spotlightColor="rgba(56, 189, 248, 0.14)"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <MessageSquareQuote className="h-5 w-5" />
          </span>
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.28em] text-gray-500">Project Reviews</div>
            <h2 className="mt-2 text-3xl font-bold text-white">Database Reviews</h2>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-bg/50 p-4">
            <div className="text-sm text-gray-500">Total Reviews</div>
            <div className="mt-2 text-3xl font-bold text-white">{reviews.length}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-bg/50 p-4">
            <div className="text-sm text-gray-500">Average Rating</div>
            <div className="mt-2 text-3xl font-bold text-white">{averageRating}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-bg/50 p-4">
            <div className="text-sm text-gray-500">Storage</div>
            <div className="mt-2 text-xl font-bold text-white">PostgreSQL</div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-bg/45 p-5 text-sm text-gray-300">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading reviews from the database...
            </div>
          ) : null}

          {!isLoading && !reviews.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-bg/40 p-5 text-sm text-gray-400">
              No reviews have been submitted yet.
            </div>
          ) : null}

          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-white/8 bg-bg/45 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{review.name}</div>
                  <div className="text-sm text-gray-500">{formatReviewDate(review.created_at)}</div>
                </div>
                <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
              </div>

              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <div className="mb-1 text-xs font-mono uppercase tracking-[0.24em] text-gray-500">Description</div>
                  <p className="text-gray-300">{review.description}</p>
                </div>
                <div>
                  <div className="mb-1 text-xs font-mono uppercase tracking-[0.24em] text-gray-500">Expectation</div>
                  <p className="text-gray-300">{review.expectations}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SpotlightCard>

      <SpotlightCard
        className="rounded-[2rem] border border-border bg-surface p-8"
        spotlightColor="rgba(192, 132, 252, 0.14)"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-2xl bg-violet-400/10 p-3 text-violet-300">
            <Send className="h-5 w-5" />
          </span>
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.28em] text-gray-500">Feedback Form</div>
            <h2 className="mt-2 text-3xl font-bold text-white">Submit a Review</h2>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-gray-400">
          Reviews are stored directly in the database with your name, IP address, star rating, project description, and expectations.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-mono uppercase tracking-[0.24em] text-gray-500">Full Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => {
                setSubmitted(false);
                setForm((current) => ({ ...current, name: event.target.value }));
              }}
              placeholder="Enter your name"
              className="w-full rounded-2xl border border-white/8 bg-bg/65 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-300/35"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-mono uppercase tracking-[0.24em] text-gray-500">Star Rating</span>
            <select
              value={form.rating}
              onChange={(event) => {
                setSubmitted(false);
                setForm((current) => ({ ...current, rating: event.target.value }));
              }}
              className="w-full rounded-2xl border border-white/8 bg-bg/65 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/35"
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Satisfactory</option>
              <option value="2">2 - Needs Improvement</option>
              <option value="1">1 - Poor</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-mono uppercase tracking-[0.24em] text-gray-500">Project Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => {
                setSubmitted(false);
                setForm((current) => ({ ...current, description: event.target.value }));
              }}
              placeholder="Describe your review of the project in a formal and concise way."
              className="w-full resize-none rounded-2xl border border-white/8 bg-bg/65 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-300/35"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-mono uppercase tracking-[0.24em] text-gray-500">Expectation</span>
            <textarea
              rows={4}
              value={form.expectations}
              onChange={(event) => {
                setSubmitted(false);
                setForm((current) => ({ ...current, expectations: event.target.value }));
              }}
              placeholder="State what you expect or want improved in the project."
              className="w-full resize-none rounded-2xl border border-white/8 bg-bg/65 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-300/35"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Feedback
          </button>

          {submitted ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Feedback submitted successfully.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </form>
      </SpotlightCard>
    </section>
  );
};

export default ProjectFeedback;
