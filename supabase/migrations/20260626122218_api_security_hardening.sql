-- Harden public API surface: all public writes should go through Astro APIs.
-- This prevents direct unauthenticated inserts through Supabase REST using the public anon key.

DROP POLICY IF EXISTS "Anyone can register company" ON public.company_registrations;
DROP POLICY IF EXISTS "Anyone can report damage" ON public.damage_reports;
DROP POLICY IF EXISTS "Anyone can link external record" ON public.external_records;
DROP POLICY IF EXISTS "Anyone can suggest feature" ON public.feature_suggestions;
DROP POLICY IF EXISTS "Anyone can register missing person" ON public.missing_persons;
DROP POLICY IF EXISTS "Anyone can register as volunteer" ON public.volunteer_registrations;

DO $$
BEGIN
  IF to_regclass('public.news_items') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can submit community news" ON public.news_items;
  END IF;

  IF to_regclass('public.news_credibility_votes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can vote on news" ON public.news_credibility_votes;
    DROP POLICY IF EXISTS "Anyone can update own news vote" ON public.news_credibility_votes;
  END IF;

  IF to_regclass('public.community_credibility_votes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can vote" ON public.community_credibility_votes;
    DROP POLICY IF EXISTS "Anyone can update own vote" ON public.community_credibility_votes;
  END IF;

  IF to_regclass('public.community_comments') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can comment" ON public.community_comments;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;

  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;

  IF to_regprocedure('public.get_user_role()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC, anon, authenticated;
  END IF;

  IF to_regprocedure('public.is_admin()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
  END IF;

  IF to_regprocedure('public.is_editor_or_admin()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.is_editor_or_admin() FROM PUBLIC, anon, authenticated;
  END IF;

  IF to_regprocedure('public.can_manage_help_center(uuid)') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.can_manage_help_center(uuid) FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
