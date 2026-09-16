INSERT INTO "SitePreference" ("id", "key", "value")
VALUES
  ('site-availability-label', 'availabilityLabel', 'Open to opportunities'),
  ('site-contact-headline', 'contactHeadline', 'Have a system worth making simpler?' || chr(10) || 'Let''s talk.'),
  ('site-projects-kicker', 'projectsKicker', '01 / Archive'),
  ('site-projects-title', 'projectsTitle', 'All selected *work.*'),
  ('site-projects-description', 'projectsDescription', 'Projects, experiments, and systems built across web development, backend engineering, AI, and research.')
ON CONFLICT ("key") DO NOTHING;
