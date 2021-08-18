
USE `teachagogo_dev`;

INSERT INTO `donations_options`
(`id`, `is_default`, `tier_1`, `placement`)
VALUES
(1, 1, '[24, 48, 96]', 'prompt'),
(2, 1, '[24, 48, 96]', 'sidebar')
;

INSERT INTO `site_settings`
(`name`, `value`, `title`, `description`)
VALUES

('ad_inventory',         '10',               'Ad Inventory',        'Set the percentage of overall ad inventory reserved for user advertising.'),
('ad_minimums',          '"1, 20"',          'Ad Minimums',         'Set, in whole dollars, the minimum per day, and minimum total payment, for ad spends.'),
('array_config',         '"7, 3, 1, 1, 12"', 'Array Configuration', 'Sets the homepage resource distribution (featured, new, preferred, ads, denominator).'),
('auto_ads',             'false',            'Auto Ads',            'When enabled, the system auto-approves all user ad copy.'),
('auto_payouts',         'false',            'Auto Payouts',        'When enabled, the system auto-approves all payout requests.'),
('auto_publish',         'false',            'Auto Publish',        'When enabled, the system auto-approves all publishing submissions.'),
('css_override',         '""',               'CSS Override',        'Enter coding to supercede default CSS styling.'),
('download_limit',       '"5, 100"',         'Download Limits',     'Sets the per day download limits for both free, and supportive, users.'),
('feature_rate',         '5',                'Feature Rate',        'Sets the price, in whole dollars, charged to users for featuring a resource.'),
('file_size',            '100',              'File Size',           'Sets the maximum size, in MB, that is permitted for Learningful resources.'),
('global_revenue_share', '50',               'Revenue Share',       'Set the percentage of daily net revenue to share with contributors.'),
('offline_mode',         'false',            'Offline Mode',        'When enabled, Learningful becomes accessible only to admin level users.'),
('payout_delay',         '30',               'Payout Delay',        'Set the number of days to hold all user earnings from payout eligibility.'),
('payout_fee',           '1.0',              'Payout Fee',          'Set the fee to charge USA residents for issuing a PayPal payout.'),
('pricing',              '[]',               'Pricing',             ''),
('purging',              '"2, 180"',         'Purging',             'Set the number of days at which to purge unverified, and verified, non-contributor accounts.'),
('resource_file_types',  '"ai, avi, bmp, bnk, csv, doc, docx, dot, exec, eps, epub, flp, flv, flipchart, gif, htm, html, ink, jpeg, jpg, key, knt, mov, mp3, mpeg, mpg, mp4, m4a, m4v, notebook, ods, pdf, png, pps, ppsx, ppt, pptx, psd, pub, ram, rm, rtf, svg, swf, tif, tiff, txt, wav, wpd, wmv, xls, xlsx, xlt, xltx, zip"', 'File Types', 'Comma-separated. No need to include a period. Example: ai, avi, bmp'),
('terminology',          '""',               'Terminology',         'Enter words or phrases to restrict across Learningful, comma separated.'),
('tip_percentage',       '75',               'Tipping %',           'Set the percentage of each tip paid out to contributors.'),
('tipping_prompt',       '5',                'Tipping Prompt',      'Set the frequency of downloads at which the tipping prompt should show.')
;

INSERT INTO `captcha_solutions`
(`clue`, `solution`)
VALUES
('It has flames.', 'FIRE'),
('Orbits the Earth.', 'MOON'),
('Gets you clean.', 'BATH'),
('Floats on water.', 'BOAT'),
('It chirps and flies.', 'BIRD'),
('Birds sleep in a...', 'NEST'),
('You can bounce it.', 'BALL'),
('Sparkles in the night sky.', 'STAR'),
('Houses are made of these.', 'ROOM'),
('A novel.', 'BOOK'),
('A building''s entrance.', 'DOOR'),
('When the lights go out.', 'DARK'),
('One more than four.', 'FIVE'),
('Paper money.', 'CASH'),
('Almost all flamingos are...', 'PINK'),
('A tall plant.', 'TREE'),
('To burst into song.', 'SING'),
('Color of the sky.', 'BLUE'),
('Endearingly adorable.', 'CUTE'),
('To yank.', 'PULL'),
('The Earth is round, not...', 'FLAT'),
('Autumn.', 'FALL'),
('Stupid or ignorant.', 'DUMB'),
('A tiny bit of rain water.', 'DROP'),
('To cease doing.', 'STOP'),
('You smell odor with this.', 'NOSE'),
('To leap or hop.', 'JUMP'),
('To end a life.', 'KILL'),
('Flavored, bubbly water.', 'SODA'),
('Of great height.', 'TALL'),
('Clocks show the...', 'TIME'),
('A musical group.', 'BAND'),
('Low temperature.', 'COLD'),
('A large town.', 'CITY'),
('One and the other.', 'BOTH'),
('To prepare food.', 'COOK'),
('The person in charge.', 'BOSS'),
('Holds pants up.', 'BELT'),
('Financial institution.', 'BANK'),
('Newborn child.', 'BABY'),
('Fighting force.', 'ARMY'),
('The center of an apple.', 'CORE'),
('A week is comprised of...', 'DAYS'),
('No longer alive.', 'DEAD'),
('To have a conversation.', 'CHAT'),
('A duplicate.', 'COPY'),
('Finished.', 'DONE'),
('Far down.', 'DEEP'),
('An agreement.', 'DEAL'),
('Explosive sound.', 'BOOM'),
('It explodes.', 'BOMB'),
('Work furniture.', 'DESK'),
('Medication.', 'DRUG'),
('Numbers are odd or...', 'EVEN'),
('Socks go on them.', 'FEET'),
('To locate something.', 'FIND'),
('They swim in schools.', 'FISH'),
('One, two, three...', 'FOUR'),
('A present.', 'GIFT'),
('Let''s play a...', 'GAME'),
('Food is grown on a...', 'FARM'),
('A movie.', 'FILM'),
('To bequeath.', 'GIVE'),
('Not difficult at all.', 'EASY'),
('The front of your head.', 'FACE'),
('A female child.', 'GIRL'),
('Divide into two parts.', 'HALF'),
('An opening.', 'HOLE'),
('Really, really big.', 'HUGE'),
('To stalk and kill prey.', 'HUNT'),
('1/24th of a day.', 'HOUR'),
('It has five fingers.', 'HAND'),
('To loathe or despise.', 'HATE'),
('To lend a hand.', 'HELP'),
('A playhouse.', 'FORT'),
('A small mountain.', 'HILL'),
('It grows on your body.', 'HAIR'),
('To stare.', 'LOOK'),
('Unable to be found.', 'LOST'),
('Half of a road or street.', 'LANE'),
('Homes are built on...', 'LAND'),
('Good fortune.', 'LUCK'),
('Very, very small.', 'TINY'),
('Narrow.', 'THIN'),
('To twist or rotate.', 'TURN'),
('A bad habit.', 'VICE'),
('None.', 'ZERO'),
('A story.', 'TALE'),
('Plant flowers in...', 'SOIL'),
('Not well.', 'SICK'),
('To close.', 'SHUT'),
('To browse and buy goods.', 'SHOP'),
('Identical.', 'SAME'),
('Those with a shared goal.', 'TEAM'),
('A plant''s foundation.', 'ROOT'),
('A street or thoroughfare.', 'ROAD'),
('It covers a house.', 'ROOF'),
('To speak.', 'TALK'),
('Trading goods for money.', 'SELL'),
('Tiny, granular stones.', 'SAND'),
('Music and lyrics.', 'SONG'),
('Armored war vehicle.', 'TANK'),
('Adhesive.', 'GLUE'),
('Precipitation.', 'RAIN'),
('The highest point.', 'PEAK'),
('One less than ten.', 'NINE'),
('To be compensated.', 'PAID'),
('Wealthy.', 'RICH'),
('Vegans don''t eat...', 'MEAT'),
('More than half.', 'MOST'),
('Breakfast, lunch, or dinner.', 'MEAL'),
('All yours.', 'MINE'),
('A single occurrance.', 'ONCE'),
('Underside of your hand.', 'PALM'),
('To lose something.', 'LOSS'),
('Deep affection.', 'LOVE'),
('To lend.', 'LOAN'),
('If you don''t win, you...', 'LOSE'),
('An essential requirement.', 'NEED'),
('After this.', 'NEXT'),
('A brief, written message.', 'NOTE'),
('Quite a few.', 'MANY'),
('A small body of water.', 'LAKE'),
('Your leg bends at the...', 'KNEE'),
('A supreme ruler.', 'KING')
;

-- TODO: create special admin account, and special "Teachagogo" account
INSERT INTO `users`
(`id`, `role`, `email`, `first_name`, `last_name`, `password_hash`, `username`, `avatar_locator`)
VALUES
(1, 'admin', 'jmason@masoneducation.com', 'Joshua', 'Mason', 'xxxx', 'Teachagogo', '/api/images/letters/J/j1.svg');

INSERT INTO `users_donations_options`
(`donations_options_id`, `users_id`)
VALUES
(1, 1)
;

DELIMITER $$

DROP PROCEDURE IF EXISTS `search_resources`$$
DROP PROCEDURE IF EXISTS `calculate_num_favorites`$$
DROP PROCEDURE IF EXISTS `calculate_num_downloads`$$
DROP PROCEDURE IF EXISTS `calculate_num_creator_downloads`$$

CREATE PROCEDURE calculate_num_favorites()
BEGIN
  DROP TEMPORARY TABLE IF EXISTS tmp_resource_favorites;
  CREATE TEMPORARY TABLE tmp_resource_favorites ENGINE=MEMORY AS (
    SELECT resources_id, COUNT(*) AS num_favorites
    FROM users_favorites
    GROUP BY resources_id
  );
END $$

CREATE PROCEDURE calculate_num_downloads()
BEGIN
  DROP TEMPORARY TABLE IF EXISTS tmp_resource_downloads;
  CREATE TEMPORARY TABLE tmp_resource_downloads ENGINE=MEMORY AS (
    SELECT resources_id, COUNT(*) AS num_downloads
    FROM resources_downloads
    GROUP BY resources_id
  );
END $$

CREATE PROCEDURE calculate_num_creator_downloads()
BEGIN
  DROP TEMPORARY TABLE IF EXISTS tmp_creator_downloads;
  CREATE TEMPORARY TABLE tmp_creator_downloads ENGINE=MEMORY AS (
    SELECT u.id AS creator_id, COUNT(*) AS num_creator_downloads
    FROM
      resources_downloads d
      JOIN resources r ON r.id = d.resources_id
      JOIN users u ON u.id = r.users_id
      GROUP BY u.id
  );
END $$

CREATE PROCEDURE search_resources()
BEGIN
  CALL calculate_num_favorites();
  SET @max_favorites = (
    SELECT MAX(res_favs.num_favorites)
    FROM `tmp_resource_favorites` res_favs
  );

  CALL calculate_num_downloads();
  SET @max_downloads = (
    SELECT MAX(res_downloads.num_downloads)
    FROM `tmp_resource_downloads` res_downloads
  );

  CALL calculate_num_creator_downloads();
  SET @max_creator_downloads = (
    SELECT MAX(creator_downloads.num_creator_downloads)
    FROM `tmp_creator_downloads` creator_downloads
  );

  SET @search_matcher = concat('%', @search_term, '%');

  SELECT
    res.*,
    IFNULL(res_favs.num_favorites / @max_favorites * 100, 0) AS num_favorites,
    IFNULL(res_downloads.num_downloads / @max_downloads * 100, 0) AS num_downloads,
    IFNULL(creator_downloads.num_creator_downloads / @max_creator_downloads * 100, 0) AS num_creator_downloads,
    (
        IFNULL(res_favs.num_favorites / @max_favorites * 100, 0)
      + IFNULL(res_downloads.num_downloads / @max_downloads * 100, 0)
      + IFNULL(creator_downloads.num_creator_downloads / @max_creator_downloads * 100, 0)
      + res.curator_score
      + IF(`title`          LIKE @search_matcher, 100, 0)
      + IF(`subtitle`       LIKE @search_matcher,  50, 0)
      + IF(`description`    LIKE @search_matcher,  10, 0)
      + IF(`keywords`       LIKE @search_matcher,  10, 0)
      + IF(`skills`         LIKE @search_matcher,  10, 0)
      + IF(`reading_levels` LIKE @search_matcher,  10, 0)
      + IF(`standards`      LIKE @search_matcher,  50, 0)
      + IFNULL(grade_weight.weight * 10, 0)
      + IFNULL(subject_weight.weight * 10, 0)
    ) AS score
  FROM
    `resources` res
    LEFT JOIN `tmp_resource_favorites` res_favs          ON res.id = res_favs.resources_id
    LEFT JOIN `tmp_resource_downloads` res_downloads     ON res.id = res_downloads.resources_id
    LEFT JOIN `tmp_creator_downloads`  creator_downloads ON res.users_id = creator_downloads.creator_id
    LEFT JOIN `tmp_grade_weights`      grade_weight      ON res.grade = grade_weight.weight_key
    LEFT JOIN `tmp_subject_weights`    subject_weight    ON res.subject_area = subject_weight.weight_key
  WHERE
    (
      `title`             LIKE @search_matcher
      OR `subtitle`       LIKE @search_matcher
      OR `description`    LIKE @search_matcher
      OR `keywords`       LIKE @search_matcher
      OR `skills`         LIKE @search_matcher
      OR `reading_levels` LIKE @search_matcher
      OR `standards`      LIKE @search_matcher
    )
    AND
    (@grade_filter IS NULL OR `grade` = @grade_filter)
  GROUP BY
    res.id, num_favorites, num_downloads, num_creator_downloads
  ORDER BY score DESC
  ;

END $$

DELIMITER ;
