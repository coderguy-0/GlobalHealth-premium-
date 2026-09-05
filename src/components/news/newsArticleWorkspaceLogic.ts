/**
 * Pure helpers for the full-screen News Workspace.
 *
 * Kept free of React so the routing, date formatting, article resolution and
 * the lightweight article-body parser can be unit tested with `npm test`.
 */
import type { NewsArticle, HealthNewsQuestion } from '../../types';

// ---------------------------------------------------------------------------
// Routing: every released article has its own route  →  #news/<slug|id>
// ---------------------------------------------------------------------------

export const NEWS_ROUTE_PREFIX = 'news/';

/** Stable public reference for an article (slug preferred, id fallback). */
export function newsArticleRef(article: Pick<NewsArticle, 'id' | 'slug'>): string {
  const slug = (article.slug || '').trim();
  return slug || article.id;
}

/** Hash fragment (without '#') that opens the article workspace. */
export function newsArticleHash(article: Pick<NewsArticle, 'id' | 'slug'>): string {
  return `${NEWS_ROUTE_PREFIX}${encodeURIComponent(newsArticleRef(article))}`;
}

/**
 * Parses `window.location.hash`. Returns the article reference when the hash
 * is an article route, `null` for the plain news listing / any other route.
 */
export function parseNewsArticleHash(hash: string): string | null {
  const raw = (hash || '').replace(/^#\/?/, '').split('?')[0];
  if (!raw.startsWith(NEWS_ROUTE_PREFIX)) return null;
  const ref = raw.slice(NEWS_ROUTE_PREFIX.length).replace(/\/+$/, '');
  if (!ref) return null;
  try {
    return decodeURIComponent(ref);
  } catch {
    return ref;
  }
}

/** Navigates to the article route (the App hash listener opens the workspace). */
export function openNewsArticleRoute(article: Pick<NewsArticle, 'id' | 'slug'>): void {
  if (typeof window === 'undefined') return;
  window.location.hash = newsArticleHash(article);
}

// ---------------------------------------------------------------------------
// Article resolution — released content only
// ---------------------------------------------------------------------------

export function isReleasedArticle(article: NewsArticle | undefined | null): article is NewsArticle {
  if (!article) return false;
  if (article.status !== 'published') return false;
  // Mirrors the public listing: released articles are published and not internal.
  return article.visibility !== 'Internal Draft';
}

/** Finds a released article by slug or id. Drafts / internal articles never match. */
export function findReleasedArticle(articles: NewsArticle[], ref: string): NewsArticle | undefined {
  const needle = (ref || '').trim().toLowerCase();
  if (!needle) return undefined;
  return articles.find((a) => {
    if (!isReleasedArticle(a)) return false;
    return a.id.toLowerCase() === needle || (a.slug || '').toLowerCase() === needle;
  });
}

/** Shape returned by GET /api/news/public/articles (admin-published authority news). */
export interface AuthorityPublicArticle {
  articleRef: string;
  headline: string;
  summary: string;
  content: string;
  category: string;
  sourceName: string;
  sourceUrl?: string;
  sourceDate?: string;
  references?: string[];
  highRisk?: boolean;
  submittedBy: { name: string; orgType: string; verified: boolean } | null;
  publishedBy: string;
  publishedAt: string;
  updatedAt?: string;
  correctionNotice?: string | null;
}

export function authorityArticleToNewsArticle(a: AuthorityPublicArticle): NewsArticle {
  const words = (a.content || '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return {
    id: a.articleRef,
    title: a.headline,
    shortDescription: a.summary,
    source: a.sourceName,
    originalPublication: a.sourceUrl || undefined,
    date: a.publishedAt || '',
    lastUpdated: a.updatedAt,
    category: a.category,
    summary: a.summary,
    content: a.content,
    readTime: `${minutes} min read`,
    readTimeMinutes: minutes,
    author: a.submittedBy ? a.submittedBy.name : a.publishedBy,
    status: 'published',
    visibility: 'Public',
    showMedicalDisclaimer: true
  };
}

/**
 * The homepage research spotlight links to journal articles that may not be
 * in the CMS. They are already public on the homepage, so the workspace can
 * render them from the question's evidence summary (no invented fields).
 */
export function questionToNewsArticle(q: HealthNewsQuestion): NewsArticle {
  const ev = q.evidenceSummary;
  const sections: string[] = [];
  if (ev.populationAndSample) sections.push(`## Study Population & Methods\n\n${ev.populationAndSample}`);
  if (ev.interventionOrExposure) sections.push(`## Intervention or Exposure\n\n${ev.interventionOrExposure}`);
  if (ev.comparator) sections.push(`## Comparator\n\n${ev.comparator}`);
  if (ev.primaryOutcome) sections.push(`## Primary Outcome\n\n${ev.primaryOutcome}`);
  sections.push(`## Key Findings\n\n${ev.mainFinding}`);
  sections.push(`## Clinical Significance\n\n${ev.clinicalSignificance}`);
  if (ev.limitations) sections.push(`## Limitations\n\n${ev.limitations}`);
  return {
    id: q.articleId,
    title: q.articleTitle,
    source: q.articleSource || ev.journalName,
    originalPublication: ev.journalName,
    date: q.articleDate || ev.publishedDate,
    category: q.specialty,
    summary: q.articleSummary || q.explanation,
    content: sections.join('\n\n'),
    readTime: '4 min read',
    readTimeMinutes: 4,
    author: ev.authorsList || q.articleSource || ev.journalName,
    researchType: q.studyType,
    studyDoi: ev.studyDoi,
    featuredImage: q.articleImageUrl,
    status: 'published',
    visibility: 'Public',
    showMedicalDisclaimer: true,
    canonicalUrl: q.articleUrl
  };
}

// ---------------------------------------------------------------------------
// Dates — "DD Month YYYY"; never invent a date that does not parse
// ---------------------------------------------------------------------------

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatNewsDate(input?: string | null): string | undefined {
  if (!input) return undefined;
  const trimmed = String(input).trim();
  if (!trimmed) return undefined;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed; // keep the editorial string as-is
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** True when the "updated" value carries information beyond the publish date. */
export function isMeaningfulUpdate(published?: string | null, updated?: string | null): boolean {
  if (!updated) return false;
  const p = formatNewsDate(published);
  const u = formatNewsDate(updated);
  return !!u && u !== p;
}

// ---------------------------------------------------------------------------
// Article body — lightweight, dependency-free markdown subset
// ---------------------------------------------------------------------------

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'em'; children: InlineNode[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; children: InlineNode[] };

export type ArticleBlock =
  | { type: 'heading'; level: 2 | 3 | 4; text: InlineNode[] }
  | { type: 'paragraph'; text: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }
  | { type: 'quote'; lines: InlineNode[][]; attribution?: InlineNode[] }
  | { type: 'rule' };

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const UL_RE = /^[-*•]\s+(.*)$/;
const OL_RE = /^\d+[.)]\s+(.*)$/;
const QUOTE_RE = /^>\s?(.*)$/;
const RULE_RE = /^(-{3,}|\*{3,}|_{3,})$/;

export function parseInline(text: string): InlineNode[] {
  const out: InlineNode[] = [];
  let i = 0;
  let buf = '';
  const flush = () => {
    if (buf) out.push({ type: 'text', value: buf });
    buf = '';
  };
  while (i < text.length) {
    const rest = text.slice(i);
    // link
    const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/.exec(rest);
    if (link) {
      flush();
      out.push({ type: 'link', href: link[2], children: parseInline(link[1]) });
      i += link[0].length;
      continue;
    }
    // strong
    if (rest.startsWith('**')) {
      const end = rest.indexOf('**', 2);
      if (end > 2) {
        flush();
        out.push({ type: 'strong', children: parseInline(rest.slice(2, end)) });
        i += end + 2;
        continue;
      }
    }
    // code
    if (rest.startsWith('`')) {
      const end = rest.indexOf('`', 1);
      if (end > 1) {
        flush();
        out.push({ type: 'code', value: rest.slice(1, end) });
        i += end + 1;
        continue;
      }
    }
    // emphasis (single * or _ surrounded by non-space)
    if ((rest.startsWith('*') || rest.startsWith('_')) && rest.length > 2 && !/\s/.test(rest[1])) {
      const marker = rest[0];
      const end = rest.indexOf(marker, 1);
      if (end > 1 && !/\s/.test(rest[end - 1])) {
        flush();
        out.push({ type: 'em', children: parseInline(rest.slice(1, end)) });
        i += end + 1;
        continue;
      }
    }
    buf += text[i];
    i += 1;
  }
  flush();
  return out;
}

export function inlineToPlainText(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === 'text' || n.type === 'code') return n.value;
      return inlineToPlainText(n.children);
    })
    .join('');
}

export function parseArticleBody(content: string): ArticleBlock[] {
  const lines = (content || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks: ArticleBlock[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'paragraph', text: parseInline(para.join(' ').trim()) });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: 'list', ordered: list.ordered, items: list.items.map((t) => parseInline(t)) });
      list = null;
    }
  };
  const flushQuote = () => {
    if (quote) {
      const cleaned = quote.map((l) => l.trim()).filter(Boolean);
      let attribution: InlineNode[] | undefined;
      const last = cleaned[cleaned.length - 1] || '';
      const attrMatch = /^(?:[—–-]{1,2}\s*)(.+)$/.exec(last.replace(/^\*\*|\*\*$/g, ''));
      if (cleaned.length > 1 && attrMatch) {
        attribution = parseInline(attrMatch[1].replace(/\*\*/g, ''));
        cleaned.pop();
      }
      blocks.push({ type: 'quote', lines: cleaned.map((l) => parseInline(l)), attribution });
      quote = null;
    }
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushAll();
      continue;
    }
    const h = HEADING_RE.exec(line);
    if (h) {
      flushAll();
      const level = Math.min(4, Math.max(2, h[1].length)) as 2 | 3 | 4;
      blocks.push({ type: 'heading', level, text: parseInline(h[2].trim()) });
      continue;
    }
    if (RULE_RE.test(line)) {
      flushAll();
      blocks.push({ type: 'rule' });
      continue;
    }
    const q = QUOTE_RE.exec(line);
    if (q) {
      flushPara();
      flushList();
      quote = quote || [];
      quote.push(q[1]);
      continue;
    }
    const ul = UL_RE.exec(line);
    const ol = OL_RE.exec(line);
    if (ul || ol) {
      flushPara();
      flushQuote();
      const ordered = !!ol;
      const item = (ol ? ol[1] : ul![1]).trim();
      if (list && list.ordered !== ordered) flushList();
      list = list || { ordered, items: [] };
      list.items.push(item);
      continue;
    }
    // Continuation of a list item / quote written on the following line
    if (list && /^\s{2,}/.test(rawLine)) {
      list.items[list.items.length - 1] += ` ${line}`;
      continue;
    }
    if (quote) flushQuote();
    if (list) flushList();
    para.push(line);
  }
  flushAll();
  return blocks;
}

/** Word-based read time from the real body (used only when the article has none). */
export function estimateReadTime(content: string): string {
  const words = (content || '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

/** Structured facts that genuinely exist on the article record (never invented). */
export function articleKeyFacts(article: NewsArticle): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [];
  if (article.researchType) facts.push({ label: 'Study design', value: article.researchType });
  if (article.evidenceLevel) facts.push({ label: 'Evidence level', value: String(article.evidenceLevel) });
  if (article.evidenceStatus) facts.push({ label: 'Evidence status', value: String(article.evidenceStatus).replace(/-/g, ' ') });
  if (article.studyDoi) facts.push({ label: 'DOI', value: article.studyDoi });
  if (article.clinicalTrialId) facts.push({ label: 'Trial registration', value: article.clinicalTrialId });
  return facts;
}
