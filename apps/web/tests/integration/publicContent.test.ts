import { describe, expect, it, vi } from 'vitest';
import { landingRouter } from '../../trpc/routers/landingProcedures';
import { documentationRouter } from '../../trpc/routers/docProcedures';

vi.mock('@workspace/auth/better-auth/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@workspace/database/client', () => ({ default: { $extends: vi.fn(() => ({})) } }));

const publicContext = { headers: new Headers(), session: null } as any;

describe('repository-owned public content', () => {
  it('exposes landing content without a write procedure', async () => {
    expect(Object.keys(landingRouter._def.procedures)).toEqual(['getLandingInfo']);
    const data = await landingRouter.createCaller(publicContext).getLandingInfo();
    expect(data.navbarSection.title).toBe('EKARVO');
  });

  it('exposes documentation reads without editor procedures', () => {
    expect(Object.keys(documentationRouter._def.procedures).sort()).toEqual([
      'getDocumentationInfo', 'queryDocumentationBySlug',
    ]);
  });

  it('serves a known document and rejects unknown paths', async () => {
    const caller = documentationRouter.createCaller(publicContext);
    const index = await caller.getDocumentationInfo();
    expect(index.docs.length).toBeGreaterThan(0);
    expect(await caller.queryDocumentationBySlug({ slug: index.docs[0]!.slug })).toContain('EKARVO');
    await expect(caller.queryDocumentationBySlug({ slug: '../../.env' })).rejects.toThrow('Documentation not found');
  });
});
