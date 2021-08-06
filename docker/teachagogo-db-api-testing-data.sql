
USE `teachagogo_dev`;

INSERT INTO `users`
(`id`, `role`, `email`, `first_name`, `last_name`, `password_hash`, `donations_options_id`, `username`, `avatar_locator`)
VALUES
(2, 'teacher', 'jknotek@fossil.icu'      , 'Jake', 'Knotek', '$2b$10$ODGrLGXfU.Lg6oMIXq8Qu.R6injZbo2zWtBOb65FpwirD8YmhyjK.', 1, 'jknotek2', '/api/images/letters/J/j2.svg'),
(3, 'admin'  , 'jknotek+admin@fossil.icu', 'Jake', 'Knotek', '$2b$10$ODGrLGXfU.Lg6oMIXq8Qu.R6injZbo2zWtBOb65FpwirD8YmhyjK.', 1, 'jknotek3', '/api/images/letters/J/j3.svg'),
(4, 'teacher', 'jknotek+4@fossil.icu'    , 'Jake', 'Knotek', '$2b$10$ODGrLGXfU.Lg6oMIXq8Qu.R6injZbo2zWtBOb65FpwirD8YmhyjK.', 1, 'jknotek4', '/api/images/letters/J/j4.svg'),
(5, 'teacher', 'jknotek+5@fossil.icu'    , 'Jake', 'Knotek', '$2b$10$ODGrLGXfU.Lg6oMIXq8Qu.R6injZbo2zWtBOb65FpwirD8YmhyjK.', 1, 'jknotek5', '/api/images/letters/J/j5.svg'),
(6, 'teacher', 'jknotek+6@fossil.icu'    , 'Jake', 'Knotek', '$2b$10$ODGrLGXfU.Lg6oMIXq8Qu.R6injZbo2zWtBOb65FpwirD8YmhyjK.', 1, 'jknotek6', '/api/images/letters/J/j6.svg')
;

INSERT INTO `users_transactions`
(`users_id`, `users_id_related`, `type`, `amount`, `status`, `fingerprint`, `created_at`)
VALUES
(4, 1, 'revenue_share', 4000, 'completed'        , '1234', '2021-01-01 01:01:01'),
(4, 1, 'payout'       , 4000, 'awaiting_approval', '2234', '2021-01-01 01:01:01'),
(5, 1, 'revenue_share', 5000, 'completed'        , '3234', '2021-01-01 01:01:01'),
(5, 1, 'payout'       , 5000, 'awaiting_approval', '4234', '2021-01-01 01:01:01'),
(6, 1, 'revenue_share', 6000, 'completed'        , '5234', '2021-01-01 01:01:01')
;

INSERT INTO `email_proxy_threads`
(`id`, `users_id_a`, `users_id_b`, `last_activity`, `is_support_thread`, `is_resolved`, `created_at`, `updated_at`)
VALUES
('c6f105ec6a984e58', '4', '1', '2021-07-01 05:01:32', '1', '0', '2021-07-01 05:01:32', '2021-07-05 18:25:59'),
('c6f105ec6a984e59', '5', '1', '2021-07-01 05:01:32', '1', '0', '2021-07-01 05:01:32', '2021-07-05 18:25:59')
;

INSERT INTO `support_thread_messages`
(`email_proxy_threads_id`,`users_id_from`,`message`,`created_at`,`updated_at`)
VALUES
('c6f105ec6a984e58',4,'message number 1','2021-07-03 05:01:32','2021-07-02 05:01:32'),
('c6f105ec6a984e58',1,'response number 1','2021-07-01 05:01:32','2021-07-01 05:01:32'),

('c6f105ec6a984e59',5,'here is my message! it is a little bit long, but that is really just because I need to see how it look on the front-end when some sort of scrolling is required. Now, at first, I was confident the text I had written would span at least 4 lines, but in fact, it turned out to have only spanned 3 lines. So, I continued typing to increase the length of the dummy text.','2021-07-01 05:01:32','2021-07-01 05:01:32'),
('c6f105ec6a984e59',1,'lorem ipsum dolor sit amet. another message here we go! here is my message! it is a little bit long, but that is really just because I need to see how it look on the front-end when some sort of scrolling is required. Now, at first, I was confident the text I had written would span at least 4 lines, but in fact, it turned out to have only spanned 3 lines. So, I continued typing to increase the length of the dummy text.','2021-07-02 05:01:32','2021-07-02 05:01:32'),
('c6f105ec6a984e59',1,'another response lorem ipsum dolor sit amet. another message here we go! here is my message! Now, at first, I was confident the text I had written would span at least 4 lines, but in fact, it turned out to have only spanned 3 lines. So, I continued typing to increase the length of the dummy text.','2021-07-03 05:01:32','2021-07-02 05:01:32'),
('c6f105ec6a984e59',5,'here is my second message! it is a little bit long, but that is really just because I need to see how it look on the front-end when some sort of scrolling is required. Now, at first, I was confident the text I had written would span at least 4 lines, but in fact, it turned out to have only spanned 3 lines. So, I continued typing to increase the length of the dummy text.','2021-07-01 05:01:32','2021-07-01 05:01:32')
;

INSERT INTO `help_center_entries`
(`order_index`, `short_title`, `long_title`, `body`, `image_locator`, `accent_color`)
VALUES
(1, 'First Entry' , 'The long and mysterious title for the first entry.' , 'But a short body...', '/api/images/test-api/donate-1.jpg', '#ff00ff'),
(2, 'Second Entry', 'The long and straaaange title for the second entry.', 'And a short body...', '/api/images/test-api/donate-2.jpg', '#00ff00')
;

INSERT INTO `advertisements`
(`id`, `ad_type`, `placement`, `title`, `subtitle`, `subject`, `click_url`, `image_url`, `statement`, `spend_per_day`, `start_date`, `end_date`, `approval_status`, `running_status`, `users_id`, `created_at`, `updated_at`)
VALUES
(1, 1, 'site', 'title 1', 'subtitle 1', 'subject 1', 'https://example.com/1', '/api/images/test/test.jpg', NULL, '500', '2021-01-01 00:00:00', '2021-01-30 00:00:00', 'awaiting_approval', NULL, 4, '2021-07-06 05:04:44', '2021-07-06 05:04:44'),
(2, 1, 'site', 'title 2', 'subtitle 2', 'subject 2', 'https://example.com/2', '/api/images/test/test.jpg', NULL, '600', '2021-01-01 00:00:00', '2021-01-30 00:00:00', 'awaiting_approval', NULL, 5, '2021-07-06 05:04:44', '2021-07-06 05:04:44')
;

INSERT INTO `advertisements_target_grades`
(`id`,`advertisements_id`,`grade`,`created_at`,`updated_at`)
VALUES
(1,1,'5','2021-07-06 05:29:28','2021-07-06 05:29:28'),
(2,1,'6','2021-07-06 05:29:28','2021-07-06 05:29:28')
;

INSERT INTO `resources`
(`id`, `users_id`, `title`, `subtitle`, `curator_score`, `subject_area`, `description`, `keywords`, `skills`, `reading_levels`, `standards`, `grade`, `approval_status`)
VALUES
(1, 4, 'title 1', 'sub 1', 50, 'english', 'Here is a short description 1', 'one two three', 'skill1, skill2, skill3', 'r1, r2, r3', 's1, s2', 4, 'awaiting_approval'),
(2, 5, 'title 2', 'sub 2', 61, 'english', 'Here is a short description 2', 'one two three', 'skill1, skill2, skill3', 'r1, r2, r3', 's1, s2', 5, 'awaiting_approval')
;

INSERT INTO `resources_previews`
(`resources_id`, `locator`, `order_index`)
VALUES
(1, '/api/images/test/test.jpg?w=201', 1),
(1, '/api/images/test/test.jpg?w=200', 0),
(2, '/api/images/test/test.jpg', 0)
;

INSERT INTO `site_stats`
(`record_date`, `new_users`, `total_users`, `unique_logins`, `active_resources`, `new_resources`, `total_resources`, `resource_downloads`, `income_per_download`, `ad_impressions`, `ad_spend`, `total_donations`, `total_income`, `misc_income`, `dormancy_income`, `total_tips`, `total_revenue`, `total_unpaid_earnings`)
VALUES
('2021-01-01', 16,      31,     89,     65,     88,     63,     16,     96,     49,     26,     58,     12,     77,     45,     60,     5,  81),
('2021-01-02', 95,      62,     75,     68,     35,     41,     61,     65,     30,     84,     81,     26,     88,     15,     81,     9,  67),
('2021-01-03', 20,      90,     50,     61,     59,     15,     47,     96,     70,     53,     42,     56,     47,     88,     93,     25, 29),
('2021-01-04', 84,      68,     96,     84,     74,     57,     94,     78,     65,     42,     3,      93,     43,     22,     59,     49, 28),
('2021-01-05', 58,      64,     81,     76,     54,     86,     89,     51,     5,      37,     24,     63,     3,      73,     35,     77, 62),
('2021-01-06', 17,      80,     3,      58,     50,     18,     12,     25,     58,     99,     79,     5,      26,     42,     56,     41, 16),
('2021-01-07', 71,      40,     7,      92,     22,     72,     71,     92,     89,     51,     96,     94,     54,     32,     80,     92, 47),
('2021-01-08', 2,       81,     84,     27,     29,     2,      50,     82,     45,     17,     55,     44,     68,     96,     23,     44, 90),
('2021-01-09', 85,      18,     46,     13,     15,     47,     54,     59,     61,     8,      12,     60,     76,     77,     34,     60, 38),
('2021-01-10', 46,      87,     1,      3,      60,     89,     44,     88,     47,     48,     79,     17,     52,     25,     8,      38, 47),
('2021-01-11', 53,      21,     70,     1,      72,     31,     44,     38,     46,     48,     13,     58,     1,      32,     42,     38, 95),
('2021-01-12', 65,      93,     10,     64,     80,     80,     32,     61,     86,     45,     36,     38,     17,     73,     54,     98, 68),
('2021-01-13', 16,      56,     73,     3,      43,     1,      71,     36,     58,     65,     1,      60,     99,     5,      65,     17, 50),
('2021-01-14', 54,      61,     77,     71,     92,     36,     47,     14,     83,     49,     20,     81,     20,     42,     67,     64, 71),
('2021-01-15', 60,      82,     82,     11,     66,     29,     98,     63,     41,     5,      19,     30,     29,     45,     90,     41, 9),
('2021-01-16', 13,      25,     64,     65,     72,     30,     50,     89,     34,     36,     73,     82,     58,     28,     36,     93, 87),
('2021-01-17', 99,      66,     85,     22,     100,    23,     3,      32,     12,     3,      60,     82,     77,     89,     3,      3,  80),
('2021-01-18', 57,      50,     99,     31,     14,     80,     24,     8,      11,     44,     20,     16,     1,      28,     28,     15, 20),
('2021-01-19', 32,      40,     83,     90,     78,     47,     11,     78,     16,     56,     88,     24,     42,     3,      6,      78, 41),
('2021-01-20', 9,       29,     0,      90,     26,     61,     43,     48,     73,     28,     54,     87,     97,     24,     55,     80, 52),
('2021-01-21', 58,      18,     4,      38,     20,     7,      6,      44,     62,     98,     61,     87,     61,     25,     20,     48, 31),
('2021-01-22', 17,      5,      68,     63,     40,     84,     70,     85,     25,     51,     20,     68,     74,     78,     35,     19, 89),
('2021-01-23', 13,      59,     25,     14,     2,      42,     86,     28,     75,     81,     93,     97,     14,     64,     30,     14, 9),
('2021-01-24', 91,      15,     11,     92,     32,     100,    80,     96,     57,     38,     94,     6,      46,     55,     24,     29, 4),
('2021-01-25', 84,      20,     49,     71,     53,     23,     82,     52,     55,     73,     13,     88,     35,     45,     62,     70, 13),
('2021-01-26', 18,      41,     79,     91,     27,     28,     85,     86,     58,     94,     7,      33,     80,     25,     80,     6,  54),
('2021-01-27', 84,      15,     39,     73,     36,     80,     69,     78,     53,     57,     79,     86,     67,     98,     1,      24, 62),
('2021-01-28', 1,       47,     37,     4,      2,      38,     19,     53,     25,     89,     10,     55,     41,     7,      36,     4,  37),
('2021-01-29', 15,      57,     70,     13,     86,     12,     97,     93,     7,      58,     58,     68,     33,     30,     25,     25, 47),
('2021-01-30', 10,      83,     14,     17,     6,      68,     30,     10,     53,     66,     23,     27,     28,     52,     65,     90, 82),
('2021-01-31', 34,      35,     55,     59,     40,     12,     64,     66,     36,     22,     20,     12,     48,     79,     48,     81, 43)
;

INSERT INTO `site_balances`
(`record_date`, `affiliate_revenue`, `expenses`)
VALUES
('2021-01-01', 70,      56),
('2021-01-02', 86,      8),
('2021-01-03', 45,      19),
('2021-01-04', 43,      76),
('2021-01-05', 71,      26),
('2021-01-06', 0,       11),
('2021-01-07', 39,      10),
('2021-01-08', 32,      13),
('2021-01-09', 68,      5),
('2021-01-10', 49,      33),
('2021-01-11', 55,      85),
('2021-01-12', 27,      42),
('2021-01-13', 88,      88),
('2021-01-14', 44,      86),
('2021-01-15', 83,      63),
('2021-01-16', 54,      9),
('2021-01-17', 15,      96),
('2021-01-18', 66,      85),
('2021-01-19', 22,      74),
('2021-01-20', 54,      35),
('2021-01-21', 61,      54),
('2021-01-22', 3,       23),
('2021-01-23', 54,      100),
('2021-01-24', 46,      43),
('2021-01-25', 97,      36),
('2021-01-26', 62,      57),
('2021-01-27', 45,      13),
('2021-01-28', 40,      44),
('2021-01-29', 58,      38),
('2021-01-30', 62,      56),
('2021-01-31', 60,      95)
;
