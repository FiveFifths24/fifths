-- Fifth Realm interest taxonomy
--
-- Keep SIGNAL's global interest taxonomy intact while identifying which
-- interests are appropriate for Fifth Realm discovery and campaign creation.

alter table public.interests
add column if not exists realm_enabled boolean not null default false;


-- Existing global interests that belong in Fifth Realm.

update public.interests
set realm_enabled = true
where slug in (
  'gaming',
  'storytelling'
);


-- Realm-focused interests.

insert into public.interests (
  slug,
  name,
  description,
  realm_enabled
)
values
  (
    'tabletop-rpgs',
    'Tabletop RPGs',
    'Tabletop roleplaying campaigns, systems, and shared adventures.',
    true
  ),
  (
    'video-games',
    'Video Games',
    'Console, PC, handheld, and online gaming experiences.',
    true
  ),
  (
    'anime',
    'Anime',
    'Anime-inspired stories, worlds, genres, and fandom.',
    true
  ),
  (
    'manga',
    'Manga',
    'Manga-inspired stories, visual storytelling, and fandom.',
    true
  ),
  (
    'fantasy',
    'Fantasy',
    'Magic, mythic worlds, legendary creatures, and epic adventure.',
    true
  ),
  (
    'science-fiction',
    'Science Fiction',
    'Futuristic worlds, space, technology, and speculative storytelling.',
    true
  ),
  (
    'horror',
    'Horror',
    'Suspense, supernatural themes, survival, and unsettling stories.',
    true
  ),
  (
    'mystery',
    'Mystery',
    'Investigation, secrets, clues, puzzles, and discovery.',
    true
  ),
  (
    'adventure',
    'Adventure',
    'Exploration, quests, discovery, and high-stakes journeys.',
    true
  ),
  (
    'superheroes',
    'Superheroes',
    'Heroic identities, powers, teams, villains, and comic-inspired worlds.',
    true
  ),
  (
    'strategy',
    'Strategy',
    'Tactical decisions, planning, resource management, and strategic play.',
    true
  ),
  (
    'roleplaying',
    'Roleplaying',
    'Character-driven play, improvisation, and shared narrative.',
    true
  ),
  (
    'worldbuilding',
    'Worldbuilding',
    'Creating settings, cultures, histories, factions, and fictional worlds.',
    true
  ),
  (
    'collaborative-storytelling',
    'Collaborative Storytelling',
    'Shared narrative creation shaped by multiple participants.',
    true
  ),
  (
    'character-creation',
    'Character Creation',
    'Developing characters, identities, backstories, and motivations.',
    true
  ),
  (
    'game-mastering',
    'Game Mastering',
    'Running campaigns, facilitating play, and guiding shared worlds.',
    true
  ),
  (
    'cosplay',
    'Cosplay',
    'Costuming, character performance, and fandom-inspired creation.',
    true
  ),
  (
    'comics-graphic-novels',
    'Comics & Graphic Novels',
    'Comic-book storytelling, illustrated worlds, characters, and fandom.',
    true
  ),
  (
    'card-deckbuilding-games',
    'Card & Deckbuilding Games',
    'Collectible cards, deck construction, and card-driven strategy games.',
    true
  ),
  (
    'board-games',
    'Board Games',
    'Tabletop board games, social games, and strategic group play.',
    true
  ),
  (
    'larp',
    'LARP',
    'Live-action roleplaying, immersive characters, and physical storytelling.',
    true
  ),
  (
    'fandom-pop-culture',
    'Fandom & Pop Culture',
    'Shared fandom, genre culture, conventions, and fictional universes.',
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  realm_enabled = true;


-- Fifth Realm campaign interests must be active Realm interests.
--
-- Replace the current Realm campaign creation function's interest validation
-- behavior without changing its public interface.

create or replace function public.realm_interest_is_allowed(
  p_interest_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.interests
    where id = p_interest_id
      and active
      and realm_enabled
  );
$$;

revoke all
on function public.realm_interest_is_allowed(uuid)
from public;

grant execute
on function public.realm_interest_is_allowed(uuid)
to authenticated;