-- Custom programme requests (client portal, 2 Nov 2026). Run once in Supabase → SQL Editor.
-- A client can describe what they want to work on next in their own words ("Something else in
-- mind?"). Stored as a client_requests row with item_key 'custom:<time>' and the text in detail.
-- The founder's phone ping never carries the text (health detail stays in the Terminal).

alter table public.client_requests add column if not exists detail text;
