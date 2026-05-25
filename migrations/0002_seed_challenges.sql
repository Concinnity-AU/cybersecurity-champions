-- Seed: 15 Cybersecurity Champions Challenge items, English translations.
-- Each challenge inserts into `challenges` then a paired row in
-- `challenge_translations` using last_insert_rowid().
--
-- Apostrophes inside literals are doubled per SQL convention.
-- The metadata, options, and explanation fields are JSON stored as TEXT.

------------------------------------------------------------------------------
-- 1. Fake myGov SMS
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'fake_mygov_sms_01',
  'spot_it',
  'government impersonation / phishing',
  1,
  'scam',
  '{"presentation":"sms","sender":"myGov","senderNote":"Sender not in your contacts","verified":false,"time":"9:42 AM","bubbles":[{"text":"Your account has been suspended due to unusual activity. To restore access, verify your identity within 24 hours or your account will be permanently closed.\n\nTap below or scan:\nhttps://my-gov-verify-au.com/restore","qr":true}]}',
  'Based on myGov impersonation pattern documented by Services Australia, 2024-25'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'Just landed on your phone. What is it?',
  '[{"id":"scam","label":"Scam"},{"id":"legit","label":"Legit"}]',
  'The real myGov never sends links or QR codes by SMS to log in. If there''s a problem, open the myGov app or type my.gov.au into your browser yourself. The 24-hour countdown is the giveaway — scammers use urgency so you don''t have time to think.'
);

------------------------------------------------------------------------------
-- 2. Fake ATO refund email
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'fake_ato_email_01',
  'spot_it',
  'government impersonation / phishing',
  2,
  'scam',
  '{"presentation":"email","fromName":"Australian Taxation Office","fromAddr":"refunds@ato-gov-au.com","avatarLetter":"A","avatarColor":"var(--con-orange)","subject":"URGENT: Your tax refund of $1,847.32 is pending","body":["Dear Taxpayer,","Our records show you are entitled to a refund of $1,847.32 from your most recent return.","To process this refund to your nominated bank account, please verify your details via our secure portal within 48 hours. After this period, the refund will be cancelled."],"cta":{"label":"VERIFY NOW","url":"ato-refund-portal.com"},"sign":["Kind regards,","Australian Taxation Office"]}',
  'Based on ATO impersonation patterns documented by the ATO and reported to Scamwatch'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'This email just arrived. What is it?',
  '[{"id":"scam","label":"Scam"},{"id":"legit","label":"Legit"}]',
  'The ATO never emails refunds with ''verify'' links — real refunds go to the bank account already on file. Real ATO addresses end in .gov.au, never .com or anything with hyphens. When in doubt, log into myGov yourself and check the messages section.'
);

------------------------------------------------------------------------------
-- 3. Real Australia Post tracking SMS (the trick)
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'real_auspost_sms_01',
  'spot_it',
  'trick / pattern recognition',
  3,
  'legit',
  '{"presentation":"sms","sender":"AusPost","senderNote":"Verified business sender","verified":true,"time":"2:18 PM","bubbles":[{"text":"Your parcel ABC123456789 is out for delivery today between 10am-4pm.\n\nTrack at: auspost.com.au/track\n\nReply HELP for help. Do not reply to this SMS."}]}',
  'Based on real Australia Post SMS notifications'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'You''re expecting a parcel. This SMS arrives. What is it?',
  '[{"id":"scam","label":"Scam"},{"id":"legit","label":"Legit"}]',
  'This one''s real. Genuine Australia Post messages don''t ask for personal info, payment or a login. The signal isn''t whether a message looks official — it''s whether it asks you to enter information. Real tracking links always go to auspost.com.au, never to lookalike domains.'
);

------------------------------------------------------------------------------
-- 4. Fake job advertisement
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'fake_seek_job_01',
  'spot_it',
  'identity fraud',
  2,
  'scam',
  '{"presentation":"email","fromName":"HR Team — FlexiWork","fromAddr":"hr@flexiwork-recruitment.online","avatarLetter":"F","avatarColor":"#3a7be0","subject":"Congratulations — Position Offered: Remote Data Entry","body":["Hi,","Following your recent application, you''ve been pre-selected for a remote data entry position with FlexiWork Solutions.","• Earn $45–$60 per hour\n• Work from home, flexible hours\n• Immediate start","To finalise, send the following to this email by end of day tomorrow:","• Tax File Number (TFN)\n• Driver''s licence (photo of front and back)\n• Bank account details for payroll setup\n• Medicare card (photo)","Positions are limited and will be allocated on a first-come basis."]}',
  'Identity fraud is #1 reported cybercrime in Australia per ASD 2024-25'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'You applied for jobs yesterday. This reply lands today.',
  '[{"id":"scam","label":"Scam"},{"id":"legit","label":"Legit"}]',
  'Legitimate employers never ask for TFN, licence or bank details before a proper interview and a signed contract. Identity fraud is the #1 reported cybercrime in Australia. Check the company at abr.business.gov.au, insist on a video interview, never send ID documents until you''ve verified the employer is real.'
);

------------------------------------------------------------------------------
-- 5. "Hi Mum" family emergency WhatsApp
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'fake_family_emergency_01',
  'spot_it',
  'social engineering',
  2,
  'scam',
  '{"presentation":"whatsapp","sender":"+61 4·· ··· 218","senderNote":"Not in contacts","time":"11:04 AM","bubbles":[{"text":"Hi Mum, I dropped my phone in the toilet 😩 This is my temporary number, can you save it?"},{"text":"Actually really need a favour — I''m locked out of my banking app because my phone''s broken and I have a bill due today. Could you transfer $850 for me? I''ll pay you back tomorrow when I get to a branch. I''ll send you the BSB and account number."},{"text":"Don''t tell Dad, he''ll lose it about the phone 😅"}]}',
  'Based on widespread Hi Mum/Dad scam documented by Scamwatch and ACCC'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'An unknown number messages you on WhatsApp. What is it?',
  '[{"id":"scam","label":"Scam"},{"id":"legit","label":"Legit"}]',
  'The ''Hi Mum/Dad'' scam has cost Australian families millions. Always call your actual child on their real number before sending money — if their phone is ''broken'', call someone else who knows them. Agree on a family safe-word for genuine emergencies.'
);

------------------------------------------------------------------------------
-- 6. Real bank fraud alert (the trick)
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'real_bank_fraud_sms_01',
  'spot_it',
  'trick / pattern recognition',
  3,
  'legit',
  '{"presentation":"sms","sender":"NorthBank","senderNote":"Verified business sender","verified":true,"time":"2:32 PM","bubbles":[{"text":"SECURITY ALERT: Unusual activity detected on card ending 4521 at 14:32 today. Amount: $312.50 at \"GAMING SUPPLIES ONLINE\".\n\nIf this was YOU, no action needed.\n\nIf this was NOT you, call us now on 13 22 21 (number also on back of your card). Do not reply to this SMS."}]}',
  'Based on real bank fraud alert SMS patterns from major Australian banks'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'This SMS lands while you''re at the supermarket.',
  '[{"id":"scam","label":"Scam"},{"id":"legit","label":"Legit"}]',
  'This one''s real. Genuine bank fraud alerts always give you a phone number to call — never a link to click. The rule that catches almost every bank impersonation scam: if a message asks you to click a link or read out a code, it''s a scam. If it asks you to ring a known number, it''s probably real.'
);

------------------------------------------------------------------------------
-- 7. Pick the Stronger — length vs complexity
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'password_length_vs_complexity_01',
  'pick_stronger',
  'passwords',
  1,
  'b',
  '{"mode":"string","options":[{"id":"a","label":"Option A","value":"Summer2025!","weak":true,"hint":"11 characters · predictable pattern"},{"id":"b","label":"Option B","value":"river-canyon-sleepy-violin","weak":false,"hint":"26 characters · four random words"}]}',
  'Hive Systems 2025 Password Table'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'Which password is harder for a scammer to crack?',
  '[{"id":"a","label":"Option A"},{"id":"b","label":"Option B"}]',
  'Length beats complexity every time. ''Summer2025!'' can be cracked in hours — it''s a predictable pattern that cracking tools test first. The four-word passphrase takes hundreds of millions of years to crack.'
);

------------------------------------------------------------------------------
-- 8. Pick the Stronger — character substitution
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'password_pattern_01',
  'pick_stronger',
  'passwords',
  2,
  'b',
  '{"mode":"string","options":[{"id":"a","label":"Option A","value":"P@ssw0rd123!","weak":true,"hint":"12 characters · top common pattern"},{"id":"b","label":"Option B","value":"7K!mqRz9$Vp2Lwb4","weak":false,"hint":"16 characters · random from a manager"}]}',
  'Hive Systems 2025; common password cracking methodology'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'Which password is harder for a scammer to crack?',
  '[{"id":"a","label":"Option A"},{"id":"b","label":"Option B"}]',
  'Swapping ''a'' for ''@'' or ''o'' for ''0'' doesn''t fool password-cracking software — those substitutions are the very first thing it tries. A truly random password from a password manager is unguessable, and you only remember the master password.'
);

------------------------------------------------------------------------------
-- 9. Pick the Stronger — reuse (Sarah vs Tom)
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'password_reuse_01',
  'pick_stronger',
  'passwords / behaviour',
  2,
  'b',
  '{"mode":"approach","options":[{"id":"a","label":"Sarah''s approach","person":"Sarah","avatar":"S","avatarColor":"var(--con-orange)","line":"Uses Bluebird-Sunset-Coffee-92! for email, banking, Facebook and Netflix. It''s strong, so she reuses it.","weak":true,"hint":"Reuses one password everywhere"},{"id":"b","label":"Tom''s approach","person":"Tom","avatar":"T","avatarColor":"var(--tims-purple)","line":"Uses a different random password from his password manager for every account. He only has to remember the master password.","weak":false,"hint":"Unique password per account"}]}',
  'Based on credential-stuffing attack patterns; have-i-been-pwned research'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'Two ways of doing passwords. Which is safer?',
  '[{"id":"a","label":"Sarah"},{"id":"b","label":"Tom"}]',
  'Even a brilliant password becomes a serious risk if you use it everywhere. When one site gets hacked (and they do, all the time), scammers automatically try that combination on banks, government services and email. A password manager remembers a unique password for every site.'
);

------------------------------------------------------------------------------
-- 10. Scenario — Unexpected 2FA + caller asking to read code
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'unexpected_2fa_code_01',
  'scenario',
  'MFA / account takeover',
  2,
  'b',
  '{"visual_hint":"phone_with_call"}',
  'Based on the vishing pattern targeting Australian bank customers; ACMA / NASC'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'Your bank texts you a 6-digit verification code. You haven''t tried to log in. A minute later, you get a phone call from someone saying they''re from your bank''s fraud team. They ask you to read them the code so they can ''cancel the attempted login.''',
  '[{"id":"a","label":"Read them the code so they can stop the fraud"},{"id":"b","label":"Hang up. Call your bank using the number on the back of your card"},{"id":"c","label":"Read only the last three digits to be safe"},{"id":"d","label":"Ask the caller for their employee ID first"}]',
  'This is one of the most common scams in Australia right now. The criminal already has your password — they triggered the 2FA code themselves. They need YOU to read it out. Banks never ask you to read 2FA codes over the phone. Any code sent to you is for YOUR eyes only.'
);

------------------------------------------------------------------------------
-- 11. Scenario — Facebook friend loan
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'facebook_friend_loan_01',
  'scenario',
  'account takeover / social engineering',
  2,
  'c',
  '{"visual_hint":"fb_chat","attachmentData":{"from":"Lisa Nguyen","avatar":"L","avatarColor":"#a35bdc","preview":"Hey! Quick favour — I''m in a bind and need to borrow $600 just till Friday. My bank app isn''t working. Can you transfer to my sister''s account? Will pay you back I promise xx","time":"10m"}}',
  'Based on documented Facebook account takeover patterns'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'Your old workmate Lisa messages you on Facebook Messenger: "Hey! Quick favour — I''m in a bind and need to borrow $600 just till Friday. My bank app isn''t working. Can you transfer to my sister''s account? Will pay you back I promise xx". What do you do?',
  '[{"id":"a","label":"Send the money — Lisa''s always been reliable"},{"id":"b","label":"Reply asking for more details"},{"id":"c","label":"Call Lisa on her real phone number to check it''s actually her"},{"id":"d","label":"Ask security questions only the real Lisa would know"}]',
  'When a ''friend'' suddenly asks for money on Facebook, assume their account has been hacked until you''ve spoken to them directly. The scammer has access to their old messages and photos, so ''security questions'' won''t help. A 30-second phone call to Lisa''s actual number is the only reliable check.'
);

------------------------------------------------------------------------------
-- 12. Scenario — just been scammed
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'just_been_scammed_01',
  'scenario',
  'recovery / action',
  1,
  'b',
  '{"visual_hint":null}',
  'NASC — 70% of victims who call their bank quickly recover all funds'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'You''ve just realised you transferred $1,200 to a scammer. The money left your account about 20 minutes ago. What''s your most important first move?',
  '[{"id":"a","label":"Post a warning on social media so others don''t fall for it"},{"id":"b","label":"Call your bank IMMEDIATELY on the number on your card"},{"id":"c","label":"Try to contact the scammer and negotiate"},{"id":"d","label":"Wait a day to see if the transaction reverses"}]',
  'Speed is everything. 70% of scam victims who contact their bank quickly recover ALL their money. Banks can sometimes freeze or recall transfers — but only if they hear from you fast. Then report at scamwatch.gov.au, change your passwords, and call IDCARE on 1800 595 160 for free identity recovery help.'
);

------------------------------------------------------------------------------
-- 13. Scenario — strongest login method (passkey)
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'passkey_choice_01',
  'scenario',
  'passkeys / MFA / modern security',
  3,
  'c',
  '{"visual_hint":"auth_choice"}',
  'FIDO Alliance / NIST guidance on passkey adoption'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'Your email provider lets you choose how to log in. Which is the strongest protection against scammers?',
  '[{"id":"a","label":"Password only — a really strong, long one"},{"id":"b","label":"Password + 6-digit code sent to you by SMS"},{"id":"c","label":"Passkey (fingerprint, face, or device PIN)"},{"id":"d","label":"Password + a login link emailed to you"}]',
  'Passkeys are the newest and strongest option. Your fingerprint, face or device PIN proves it''s you — and there''s no password for scammers to steal or trick out of you. SMS codes are good, but criminals can sometimes intercept them. If ''passkey'' is offered, use it — Google, Apple, Microsoft and most major banks all support it.'
);

------------------------------------------------------------------------------
-- 14. Real or AI — AI voice call from your son
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'ai_voice_call_01',
  'real_ai',
  'AI threats / family scams',
  2,
  'b',
  '{"visual_hint":"incoming_call_waveform"}',
  'Swinburne University / SecurityBrief AU — Australians lost $25.8M to AI voice scams in H1 2025'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'You answer a call. The voice sounds exactly like your son. He''s panicked: "Dad, I''ve been in a car accident. I''m at the police station and I need you to send $3,000 to a lawyer right now or they''re going to charge me. Please don''t tell Mum, she''ll freak out." Safest thing to do?',
  '[{"id":"a","label":"Send the money — that''s clearly his voice"},{"id":"b","label":"Hang up. Call your son''s actual number directly to check"},{"id":"c","label":"Ask the ''lawyer'' to call you back on a landline first"},{"id":"d","label":"Send half the money to be safe"}]',
  'AI voice-cloning needs only 3 seconds of someone''s voice — often grabbed from social media. Australians lost $25.8M to AI voice scams in just H1 2025. The defence isn''t trusting your ears, it''s trusting the process: end the call, then ring the person back. Even better — agree on a family safe-word.'
);

------------------------------------------------------------------------------
-- 15. Real or AI — QR code on parking meter (quishing)
------------------------------------------------------------------------------
INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note) VALUES (
  'qr_code_parking_01',
  'real_ai',
  'quishing / QR code scams',
  2,
  'b',
  '{"visual_hint":"parking_meter_qr"}',
  'ASD 30+ quishing incidents 2023-24; CHOICE and Scamwatch reports'
);
INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation) VALUES (
  last_insert_rowid(),
  'en',
  'You''re parking in town and want to pay via the QR code on the parking meter. You notice the QR code is on a sticker that doesn''t quite line up with the rest of the meter''s signage. What do you do?',
  '[{"id":"a","label":"Scan it — it''s on an official meter"},{"id":"b","label":"Don''t scan. Use the council''s parking app or pay at the meter directly"},{"id":"c","label":"Scan but only enter a small payment to test the site"},{"id":"d","label":"Take a photo to investigate later, then scan"}]',
  '''Quishing'' — fake QR codes stuck over real ones on parking meters, restaurant tables and posters — is a fast-growing scam in Australia. The QR code hides the destination URL, so you can''t see the trap before scanning. Use the official council app, pay at the meter directly, or type the parking website into your browser yourself.'
);
