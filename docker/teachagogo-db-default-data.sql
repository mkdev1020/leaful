
USE `teachagogo_dev`;

INSERT INTO `donations_options`
(`id`, `is_default`, `tier_1`, `tier_2_onset`, `tier_2`, `tier_3_onset`, `tier_3`)
VALUES
(1, 1, '[24, 48, 96]', 3, '[12, 24, 48]', 5, '[6, 12, 24]');

INSERT INTO `site_settings`
(`title`, `name`, `value`)
VALUES
('Global Revenue Share', 'global_revenue_share', '0.5');

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
(`id`, `role`, `email`, `first_name`, `last_name`, `password_hash`, `donations_options_id`, `username`, `avatar_locator`)
VALUES
(1, 'admin', 'jmason@masoneducation.com', 'Joshua', 'Mason', 'xxxx', 1, 'Teachagogo', '/api/images/letters/J/j1.svg');

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
