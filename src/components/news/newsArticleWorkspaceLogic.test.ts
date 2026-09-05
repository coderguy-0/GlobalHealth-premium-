import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newsArticleHash,
  parseNewsArticleHash,
  findReleasedArticle,
  isReleasedArticle,
  formatNewsDate,
  isMeaningfulUpdate,
  parseArticleBody,
  parseInline,
  inlineToPlainText,
  authorityArticleToNewsArticle
} from './newsArticleWorkspaceLogic';
import { INITIAL_NEWS_ARTICLES } from '../../data/newsManagementData';
import type { NewsArticle } from '../../types';

test('article route: slug preferred, id fallback, round-trips through the hash parser', () => {
  assert.equal(newsArticleHash({ id: 'news-1', slug: 'my-slug' }), 'news/my-slug');
  assert.equal(newsArticleHash({ id: 'news-1' }), 'news/news-1');
  assert.equal(parseNewsArticleHash('#news/my-slug'), 'my-slug');
  assert.equal(parseNewsArticleHash('#/news/my-slug/'), 'my-slug');
  assert.equal(parseNewsArticleHash('#news/a%20b?x=1'), 'a b');
  assert.equal(parseNewsArticleHash('#news'), null);
  assert.equal(parseNewsArticleHash('#news/'), null);
  assert.equal(parseNewsArticleHash('#medicines'), null);
  assert.equal(parseNewsArticleHash(''), null);
});

test('only released (published + public) articles resolve; drafts and internal never leak', () => {
  const list = INITIAL_NEWS_ARTICLES;
  const published = list.filter((a) => a.status === 'published');
  assert.ok(published.length >= 5, 'seed data has released articles');
  for (const a of published) {
    assert.equal(findReleasedArticle(list, a.id)?.id, a.id, `resolves by id ${a.id}`);
    if (a.slug) assert.equal(findReleasedArticle(list, a.slug)?.id, a.id, `resolves by slug ${a.slug}`);
  }
  const draft = list.find((a) => a.status === 'draft');
  const pending = list.find((a) => a.status === 'pending_medical');
  const archived = list.find((a) => a.status === 'archived');
  assert.ok(draft && pending && archived, 'seed data covers non-released states');
  for (const a of [draft!, pending!, archived!]) {
    assert.equal(findReleasedArticle(list, a.id), undefined, `${a.status} ${a.id} never resolves`);
    assert.equal(findReleasedArticle(list, a.slug || ''), undefined);
    assert.equal(isReleasedArticle(a), false);
  }
  assert.equal(findReleasedArticle(list, 'does-not-exist'), undefined);
  assert.equal(findReleasedArticle(list, ''), undefined);
  const internal: NewsArticle = { ...published[0], id: 'x-internal', status: 'published', visibility: 'Internal Draft' };
  assert.equal(isReleasedArticle(internal), false);
});

test('dates render as DD Month YYYY, keep editorial strings, never invent an update', () => {
  assert.equal(formatNewsDate('2026-08-15T10:00:00.000Z'), '15 August 2026');
  assert.equal(formatNewsDate('August 15, 2026'), '15 August 2026');
  assert.equal(formatNewsDate('Q3 2026'), 'Q3 2026');
  assert.equal(formatNewsDate(''), undefined);
  assert.equal(formatNewsDate(undefined), undefined);
  assert.equal(isMeaningfulUpdate('August 15, 2026', 'August 15, 2026, 03:20 PM'), false);
  assert.equal(isMeaningfulUpdate('August 15, 2026', 'August 20, 2026'), true);
  assert.equal(isMeaningfulUpdate('August 15, 2026', undefined), false);
});

test('article body parser: headings, paragraphs, lists, quotes with attribution, inline marks', () => {
  const body = [
    '## Executive Summary',
    '',
    'First paragraph with **bold** and *emphasis* and `code`.',
    'Continued on the next line.',
    '',
    '### Key Points',
    '1. **One**: first',
    '2. Two',
    '',
    '- bullet a',
    '- bullet b',
    '',
    '> "Quoted statement."',
    '> — **Dr. Example, Lead Investigator**',
    '',
    'Closing paragraph with [a link](https://example.org/x).'
  ].join('\n');
  const blocks = parseArticleBody(body);
  assert.deepEqual(blocks.map((b) => b.type), ['heading', 'paragraph', 'heading', 'list', 'list', 'quote', 'paragraph']);
  const h = blocks[0] as Extract<(typeof blocks)[number], { type: 'heading' }>;
  assert.equal(h.level, 2);
  const p = blocks[1] as Extract<(typeof blocks)[number], { type: 'paragraph' }>;
  assert.equal(inlineToPlainText(p.text), 'First paragraph with bold and emphasis and code. Continued on the next line.');
  assert.ok(p.text.some((n) => n.type === 'strong'));
  assert.ok(p.text.some((n) => n.type === 'em'));
  assert.ok(p.text.some((n) => n.type === 'code'));
  const ol = blocks[3] as Extract<(typeof blocks)[number], { type: 'list' }>;
  assert.equal(ol.ordered, true);
  assert.equal(ol.items.length, 2);
  const ul = blocks[4] as Extract<(typeof blocks)[number], { type: 'list' }>;
  assert.equal(ul.ordered, false);
  const q = blocks[5] as Extract<(typeof blocks)[number], { type: 'quote' }>;
  assert.equal(q.lines.length, 1);
  assert.equal(inlineToPlainText(q.attribution || []), 'Dr. Example, Lead Investigator');
  const last = blocks[6] as Extract<(typeof blocks)[number], { type: 'paragraph' }>;
  const link = last.text.find((n) => n.type === 'link');
  assert.ok(link && link.type === 'link' && link.href === 'https://example.org/x');
  assert.deepEqual(parseInline('plain'), [{ type: 'text', value: 'plain' }]);
  assert.deepEqual(parseArticleBody(''), []);
});

test('every seeded released article body parses into real blocks (no lost content)', () => {
  for (const a of INITIAL_NEWS_ARTICLES.filter((x) => x.status === 'published')) {
    const blocks = parseArticleBody(a.content);
    assert.ok(blocks.length >= 3, `${a.id} produces blocks`);
    const text = blocks
      .map((b) => (b.type === 'rule' ? '' : b.type === 'list' ? b.items.map(inlineToPlainText).join(' ') : b.type === 'quote' ? [...b.lines, b.attribution || []].map(inlineToPlainText).join(' ') : inlineToPlainText(b.text)))
      .join(' ');
    // Every word longer than 6 letters from the source survives in the output.
    const words = a.content.replace(/[#*>`_\[\]()]/g, ' ').split(/\s+/).filter((w) => /^[A-Za-z]{7,}$/.test(w));
    for (const w of words.slice(0, 200)) assert.ok(text.includes(w), `${a.id}: word "${w}" preserved`);
  }
});

test('authority (server) articles map to the public article shape without invented fields', () => {
  const a = authorityArticleToNewsArticle({
    articleRef: 'sub-1',
    headline: 'H',
    summary: 'S',
    content: 'word '.repeat(440),
    category: 'Public Health',
    sourceName: 'WHO',
    sourceUrl: 'https://who.int/x',
    submittedBy: { name: 'WHO India', orgType: 'International Health Organization', verified: true },
    publishedBy: 'GlobalHealth News Team',
    publishedAt: '2026-09-01T00:00:00.000Z'
  });
  assert.equal(a.id, 'sub-1');
  assert.equal(a.status, 'published');
  assert.equal(a.visibility, 'Public');
  assert.equal(a.author, 'WHO India');
  assert.equal(a.readTime, '2 min read');
  assert.equal(a.featuredImage, undefined);
  assert.equal(a.imageCaption, undefined);
});
