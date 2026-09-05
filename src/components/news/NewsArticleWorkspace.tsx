import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Search,
  Newspaper,
  ShieldCheck,
  Building2,
  Info,
  Flag,
  Flame,
  Calendar,
  User,
  ExternalLink,
  RefreshCw,
  LogIn
} from 'lucide-react';
import type { NewsArticle, UserAccount } from '../../types';
import { newsService } from '../../services/newsService';
import { healthResearchQuestionService } from '../../services/healthResearchQuestionService';
import {
  type ArticleBlock,
  type AuthorityPublicArticle,
  type InlineNode,
  articleKeyFacts,
  authorityArticleToNewsArticle,
  estimateReadTime,
  findReleasedArticle,
  formatNewsDate,
  isMeaningfulUpdate,
  isReleasedArticle,
  parseArticleBody,
  questionToNewsArticle
} from './newsArticleWorkspaceLogic';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface NewsWorkspaceTrust {
  indicator: 'official' | 'authority';
  submittedBy?: { name: string; orgType: string; verified: boolean } | null;
  correctionNotice?: string | null;
  sourceUrl?: string;
  references?: string[];
}

interface ResolvedArticle {
  article: NewsArticle;
  trust: NewsWorkspaceTrust;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: ResolvedArticle }
  | { kind: 'not-found' }
  | { kind: 'failed' };

export interface NewsArticleWorkspaceProps {
  /** Article slug or id from the `#news/<ref>` route. */
  articleRef: string;
  /** Optional article already in hand (skips the lookup but still verifies release). */
  article?: NewsArticle | null;
  currentUser: UserAccount | null;
  onBack: () => void;
  onOpenNews: () => void;
  onSearch: () => void;
  onOpenAuth: () => void;
  onOpenUserMenu?: () => void;
  onReport?: (article: NewsArticle) => void;
}

/* -------------------------------------------------------------------------- */
/* Data loading — released content only                                       */
/* -------------------------------------------------------------------------- */

async function fetchAuthorityArticles(signal?: AbortSignal): Promise<AuthorityPublicArticle[]> {
  const res = await fetch('/api/news/public/articles', { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data?.articles || []) as AuthorityPublicArticle[];
}

async function resolveArticle(ref: string, provided: NewsArticle | null | undefined, signal?: AbortSignal): Promise<LoadState> {
  const needle = ref.trim().toLowerCase();

  // 1. Local CMS (published + public only).
  const cms = findReleasedArticle(newsService.getArticles(), ref);
  if (cms) return { kind: 'ready', data: { article: cms, trust: { indicator: 'official' } } };

  // 2. Verified-authority articles released by news administrators.
  let authority: AuthorityPublicArticle[] = [];
  let serverFailed = false;
  try {
    authority = await fetchAuthorityArticles(signal);
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    serverFailed = true;
  }
  const auth = authority.find((a) => a.articleRef.toLowerCase() === needle);
  if (auth) {
    return {
      kind: 'ready',
      data: {
        article: authorityArticleToNewsArticle(auth),
        trust: {
          indicator: 'authority',
          submittedBy: auth.submittedBy,
          correctionNotice: auth.correctionNotice,
          sourceUrl: auth.sourceUrl,
          references: auth.references
        }
      }
    };
  }

  // 3. An already-public article handed over by the caller (e.g. homepage
  //    research spotlight). Still refuses anything that is not released.
  if (provided && isReleasedArticle(provided) && (provided.id.toLowerCase() === needle || (provided.slug || '').toLowerCase() === needle)) {
    return { kind: 'ready', data: { article: provided, trust: { indicator: 'official' } } };
  }

  // 4. Journal articles referenced by the public research-question spotlight.
  try {
    const q = healthResearchQuestionService
      .getQuestionPool()
      .find((item) => item.status === 'active' && item.articleId.toLowerCase() === needle);
    if (q) return { kind: 'ready', data: { article: questionToNewsArticle(q), trust: { indicator: 'official' } } };
  } catch {
    // question pool unavailable → fall through
  }

  // The article might live on the server; if the server call failed we cannot
  // tell "missing" from "temporarily unavailable" → offer retry, not 404.
  if (serverFailed) return { kind: 'failed' };
  return { kind: 'not-found' };
}

/* -------------------------------------------------------------------------- */
/* Inline / block renderers                                                    */
/* -------------------------------------------------------------------------- */

const Inline: React.FC<{ nodes: InlineNode[] }> = ({ nodes }) => (
  <>
    {nodes.map((n, i) => {
      switch (n.type) {
        case 'text':
          return <React.Fragment key={i}>{n.value}</React.Fragment>;
        case 'strong':
          return (
            <strong key={i} className="font-bold text-slate-900">
              <Inline nodes={n.children} />
            </strong>
          );
        case 'em':
          return (
            <em key={i}>
              <Inline nodes={n.children} />
            </em>
          );
        case 'code':
          return (
            <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">
              {n.value}
            </code>
          );
        case 'link':
          return (
            <a
              key={i}
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-medical-700 underline decoration-medical-300 underline-offset-2 hover:text-medical-800"
            >
              <Inline nodes={n.children} />
            </a>
          );
        default:
          return null;
      }
    })}
  </>
);

const Block: React.FC<{ block: ArticleBlock }> = ({ block }) => {
  switch (block.type) {
    case 'heading': {
      if (block.level === 2) {
        return (
          <h2 className="mt-10 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            <Inline nodes={block.text} />
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3 className="mt-8 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            <Inline nodes={block.text} />
          </h3>
        );
      }
      return (
        <h4 className="mt-6 text-base font-bold text-slate-900">
          <Inline nodes={block.text} />
        </h4>
      );
    }
    case 'paragraph':
      return (
        <p className="mt-5 text-[17px] leading-8 text-slate-700">
          <Inline nodes={block.text} />
        </p>
      );
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className={`mt-5 space-y-2.5 pl-6 text-[17px] leading-8 text-slate-700 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-medical-600`}>
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              <Inline nodes={item} />
            </li>
          ))}
        </Tag>
      );
    }
    case 'quote':
      return (
        <figure className="my-8 border-l-4 border-medical-500 bg-medical-50/60 px-5 py-4 sm:px-6">
          <blockquote className="space-y-2 text-lg font-medium leading-8 text-slate-800">
            {block.lines.map((line, i) => (
              <p key={i}>
                <Inline nodes={line} />
              </p>
            ))}
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-3 text-sm font-bold text-medical-800">
              — <Inline nodes={block.attribution} />
            </figcaption>
          )}
        </figure>
      );
    case 'rule':
      return <hr className="my-10 border-slate-200" />;
    default:
      return null;
  }
};

/* -------------------------------------------------------------------------- */
/* Header (GlobalHealth identity)                                              */
/* -------------------------------------------------------------------------- */

const WorkspaceHeader: React.FC<{
  category?: string;
  currentUser: UserAccount | null;
  onBack: () => void;
  onOpenNews: () => void;
  onSearch: () => void;
  onOpenAuth: () => void;
  onOpenUserMenu?: () => void;
}> = ({ category, currentUser, onBack, onOpenNews, onSearch, onOpenAuth, onOpenUserMenu }) => (
  <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
      {/* Left: identity */}
      <button
        type="button"
        onClick={onBack}
        className="flex shrink-0 items-center gap-2.5 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500"
        aria-label="GlobalHealth — back to News"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-medical-500 to-medical-700 text-white shadow-sm">
          <Heart className="h-4.5 w-4.5 fill-white/20" />
        </span>
        <span className="hidden sm:block">
          <span className="block text-[15px] font-bold leading-none tracking-tight text-slate-900">
            Global<span className="text-medical-600">Health</span>
          </span>
          <span className="mt-0.5 block text-[9px] font-medium tracking-wide text-slate-400">Universal Health Network</span>
        </span>
      </button>

      {/* Center: News › category */}
      <nav aria-label="News location" className="flex min-w-0 flex-1 items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={onOpenNews}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-bold text-slate-700 transition hover:bg-slate-50 hover:text-medical-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500"
        >
          <Newspaper className="h-4 w-4 text-medical-600" /> News
        </button>
        {category && (
          <>
            <span className="text-slate-300" aria-hidden="true">/</span>
            <span className="truncate font-semibold text-slate-500" aria-current="page">{category}</span>
          </>
        )}
      </nav>

      {/* Right: search + user */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onSearch}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-medical-200 hover:bg-medical-50 hover:text-medical-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500"
          aria-label="Search GlobalHealth"
          title="Search"
        >
          <Search className="h-4.5 w-4.5" />
        </button>
        {currentUser ? (
          <button
            type="button"
            onClick={onOpenUserMenu}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:border-medical-200 hover:bg-medical-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500"
            aria-label="Your account"
          >
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-medical-100 text-medical-800">
                {currentUser.fullName?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
              </span>
            )}
            <span className="hidden max-w-28 truncate md:inline">{currentUser.fullName || currentUser.username}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-medical-600 px-3.5 text-xs font-bold text-white transition hover:bg-medical-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2"
          >
            <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Log In</span>
          </button>
        )}
      </div>
    </div>
  </header>
);

/* -------------------------------------------------------------------------- */
/* Loading / error states                                                      */
/* -------------------------------------------------------------------------- */

const SkeletonBar: React.FC<{ className: string }> = ({ className }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />
);

const ArticleSkeleton: React.FC = () => (
  <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6" role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">Loading news article…</span>
    <SkeletonBar className="h-5 w-32" />
    <SkeletonBar className="mt-6 h-10 w-full" />
    <SkeletonBar className="mt-3 h-10 w-4/5" />
    <SkeletonBar className="mt-6 h-5 w-full" />
    <SkeletonBar className="mt-2 h-5 w-11/12" />
    <div className="mt-6 flex gap-6">
      <SkeletonBar className="h-4 w-28" />
      <SkeletonBar className="h-4 w-24" />
      <SkeletonBar className="h-4 w-32" />
    </div>
    <SkeletonBar className="mt-8 aspect-[16/9] w-full rounded-2xl" />
    <div className="mt-10 space-y-3">
      <SkeletonBar className="h-4 w-full" />
      <SkeletonBar className="h-4 w-full" />
      <SkeletonBar className="h-4 w-10/12" />
      <SkeletonBar className="mt-6 h-4 w-full" />
      <SkeletonBar className="h-4 w-9/12" />
    </div>
  </div>
);

const FullscreenNotice: React.FC<{
  title: string;
  description: string;
  onBack: () => void;
  onRetry?: () => void;
}> = ({ title, description, onBack, onRetry }) => (
  <div className="flex flex-1 items-center justify-center px-4 py-16">
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft" role="alert">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Newspaper className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-xl font-extrabold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-medical-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-medical-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500"
        >
          <ArrowLeft className="h-4 w-4" /> Back to News
        </button>
      </div>
    </section>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Article body                                                                */
/* -------------------------------------------------------------------------- */

const MetaItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
    <dd className="mt-0.5 truncate text-sm font-semibold text-slate-800">{children}</dd>
  </div>
);

const ArticleView: React.FC<{
  data: ResolvedArticle;
  currentUser: UserAccount | null;
  onBack: () => void;
  onReport?: (article: NewsArticle) => void;
}> = ({ data, onBack, onReport }) => {
  const { article, trust } = data;
  const blocks = useMemo(() => parseArticleBody(article.content), [article.content]);
  const facts = useMemo(() => articleKeyFacts(article), [article]);
  const published = formatNewsDate(article.date);
  const updated = isMeaningfulUpdate(article.date, article.lastUpdated) ? formatNewsDate(article.lastUpdated) : undefined;
  const summary = article.shortDescription || article.summary;
  const readTime = article.readTime || estimateReadTime(article.content);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!article.featuredImage && !imageFailed;
  const showHealthNotice = article.showMedicalDisclaimer !== false;
  const sourceUrl = trust.sourceUrl || article.canonicalUrl;

  return (
    <article className="pb-20" aria-labelledby="news-article-title">
      {/* Back control */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-bold text-medical-700 transition hover:bg-medical-50 hover:text-medical-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500"
        >
          <ArrowLeft className="h-4 w-4" /> Back to News
        </button>
      </div>

      {/* Identity area */}
      <header className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.isBreaking && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
              <Flame className="h-3 w-3" /> Breaking News
            </span>
          )}
          <span className="inline-flex items-center rounded-full border border-medical-100 bg-medical-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-medical-700">
            {article.category}
          </span>
          {article.subcategory && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{article.subcategory}</span>
          )}
          {article.newsType && <span className="text-xs font-medium text-slate-400">{article.newsType}</span>}
        </div>

        <h1 id="news-article-title" className="mt-4 text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
          {article.title}
        </h1>

        {summary && (
          <section className="mt-5 border-l-4 border-slate-200 pl-4" aria-label="Summary">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Summary</h2>
            <p className="mt-1 text-lg leading-8 text-slate-600">{summary}</p>
          </section>
        )}

        {/* Metadata */}
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-slate-200 py-4 sm:grid-cols-3 lg:grid-cols-5">
          {published && <MetaItem label="Published">{published}</MetaItem>}
          {updated && <MetaItem label="Updated">{updated}</MetaItem>}
          {article.author && <MetaItem label="Author">{article.author}</MetaItem>}
          {article.source && <MetaItem label="Source">{article.source}</MetaItem>}
          <MetaItem label="Category">{article.category}</MetaItem>
          {readTime && <MetaItem label="Read time">{readTime}</MetaItem>}
          {article.medicalReviewer && (
            <MetaItem label="Medically reviewed">
              {article.medicalReviewer}
              {article.medicalReviewerCredentials ? `, ${article.medicalReviewerCredentials}` : ''}
            </MetaItem>
          )}
        </dl>

        {/* Trust indicators — only real governance data */}
        {trust.indicator === 'authority' && trust.submittedBy && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-medical-700" />
            <div>
              <div className="flex flex-wrap items-center gap-1.5 font-extrabold text-slate-900">
                Submitted by {trust.submittedBy.name}
                {trust.submittedBy.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" /> Verified Authority
                  </span>
                )}
              </div>
              <div className="text-slate-500">{trust.submittedBy.orgType}</div>
            </div>
          </div>
        )}
        {trust.correctionNotice && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <div className="font-extrabold">Correction / Update Notice</div>
              <p className="mt-0.5 leading-relaxed">{trust.correctionNotice}</p>
            </div>
          </div>
        )}
      </header>

      {/* Main image */}
      {showImage && (
        <figure className="mx-auto mt-8 w-full max-w-5xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img
              src={article.featuredImage}
              alt={article.imageAlt || article.title}
              className="aspect-[16/9] w-full object-cover"
              loading="eager"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          </div>
          {article.imageCaption && (
            <figcaption className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">
              <span className="font-bold text-slate-700">Caption: </span>
              {article.imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Reading column */}
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        {facts.length > 0 && (
          <aside className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5" aria-label="Key facts">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Key facts</h2>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-500">{f.label}</dt>
                  <dd className={`mt-0.5 text-sm font-bold text-slate-900 ${f.label === 'DOI' ? 'break-all font-mono text-[13px]' : ''}`}>{f.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}

        <div className="mt-4">
          {blocks.length > 0 ? (
            blocks.map((b, i) => <Block key={i} block={b} />)
          ) : (
            <p className="mt-8 text-[17px] leading-8 text-slate-700">{article.summary}</p>
          )}
        </div>

        {/* References (authority articles) */}
        {trust.references && trust.references.length > 0 && (
          <section className="mt-10" aria-labelledby="news-references-title">
            <h2 id="news-references-title" className="text-lg font-bold text-slate-900">References</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-slate-700 marker:text-slate-400">
              {trust.references.map((r, i) => (
                <li key={i} className="break-words pl-1">
                  {/^https?:\/\//.test(r) ? (
                    <a href={r} target="_blank" rel="noopener noreferrer" className="text-medical-700 underline underline-offset-2 hover:text-medical-800">{r}</a>
                  ) : (
                    r
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Source & attribution */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft" aria-labelledby="news-source-title">
          <h2 id="news-source-title" className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-medical-600" /> Source &amp; attribution
          </h2>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {article.source && (
              <div>
                <dt className="text-xs font-semibold text-slate-500">Source</dt>
                <dd className="mt-0.5 font-bold text-slate-900">{article.source}</dd>
              </div>
            )}
            {article.originalPublication && (
              <div>
                <dt className="text-xs font-semibold text-slate-500">Original publisher</dt>
                <dd className="mt-0.5 break-words font-bold text-slate-900">{article.originalPublication}</dd>
              </div>
            )}
            {published && (
              <div>
                <dt className="text-xs font-semibold text-slate-500">Published</dt>
                <dd className="mt-0.5 font-bold text-slate-900">{published}</dd>
              </div>
            )}
            {article.author && (
              <div>
                <dt className="text-xs font-semibold text-slate-500">Author</dt>
                <dd className="mt-0.5 font-bold text-slate-900">{article.author}</dd>
              </div>
            )}
            {trust.indicator === 'official' && (
              <div className="sm:col-span-2">
                <dt className="sr-only">Publisher</dt>
                <dd className="text-xs leading-relaxed text-slate-500">
                  Published by the GlobalHealth editorial team with source verification and editorial review.
                </dd>
              </div>
            )}
          </dl>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-medical-700 underline-offset-2 hover:underline"
            >
              <ExternalLink className="h-4 w-4" /> View original source
            </a>
          )}
        </section>

        {/* Health information notice — health news only */}
        {showHealthNotice && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" aria-labelledby="news-health-notice-title">
            <h2 id="news-health-notice-title" className="flex items-center gap-1.5 font-extrabold">
              <Info className="h-4 w-4 text-amber-600" /> Health Information Notice
            </h2>
            <p className="mt-1 leading-relaxed">
              {article.customDisclaimer ||
                'This news article provides general information and does not replace advice from a qualified healthcare professional.'}
            </p>
          </section>
        )}

        {/* End of article */}
        <div className="mt-12 flex items-center gap-4" role="separator" aria-label="End of article">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">End of Article</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <footer className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {article.source && <span className="inline-flex items-center gap-1"><Newspaper className="h-3.5 w-3.5" /> {article.source}</span>}
            {published && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {published}</span>}
            {article.author && <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {article.author}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onReport && (
              <button
                type="button"
                onClick={() => onReport(article)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                title="Report incorrect, outdated or misleading content to the editorial team"
              >
                <Flag className="h-3.5 w-3.5" /> Report This News
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-xl bg-medical-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-medical-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to News
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/* Workspace shell                                                             */
/* -------------------------------------------------------------------------- */

export const NewsArticleWorkspace: React.FC<NewsArticleWorkspaceProps> = ({
  articleRef,
  article,
  currentUser,
  onBack,
  onOpenNews,
  onSearch,
  onOpenAuth,
  onOpenUserMenu,
  onReport
}) => {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const providedRef = useRef(article);
  providedRef.current = article;

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setState({ kind: 'loading' });
    resolveArticle(articleRef, providedRef.current, controller.signal)
      .then((next) => {
        if (!cancelled) setState(next);
      })
      .catch((err) => {
        if (cancelled || (err as Error)?.name === 'AbortError') return;
        setState({ kind: 'failed' });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [articleRef, attempt]);

  // One primary scroll container; new article → start at the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [articleRef, state.kind]);

  // Lock the page behind the workspace so only the article scrolls.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Escape returns to the listing (keyboard navigation).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  // Document title reflects the real headline while the workspace is open.
  useEffect(() => {
    if (state.kind !== 'ready') return;
    const previous = document.title;
    document.title = `${state.data.article.title} — GlobalHealth News`;
    return () => {
      document.title = previous;
    };
  }, [state]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const category = state.kind === 'ready' ? state.data.article.category : undefined;

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-white text-slate-900 animate-in fade-in duration-200"
      role="region"
      aria-label="News workspace"
      data-news-workspace={articleRef}
    >
      <WorkspaceHeader
        category={category}
        currentUser={currentUser}
        onBack={onBack}
        onOpenNews={onOpenNews}
        onSearch={onSearch}
        onOpenAuth={onOpenAuth}
        onOpenUserMenu={onOpenUserMenu}
      />
      <main className="flex flex-1 flex-col">
        {state.kind === 'loading' && <ArticleSkeleton />}
        {state.kind === 'not-found' && (
          <FullscreenNotice
            title="News Article Not Found"
            description="The news article you are looking for is unavailable."
            onBack={onBack}
          />
        )}
        {state.kind === 'failed' && (
          <FullscreenNotice
            title="Unable to Load News"
            description="The article could not be loaded right now."
            onBack={onBack}
            onRetry={retry}
          />
        )}
        {state.kind === 'ready' && (
          <ArticleView data={state.data} currentUser={currentUser} onBack={onBack} onReport={onReport} />
        )}
      </main>
    </div>
  );
};

export default NewsArticleWorkspace;
