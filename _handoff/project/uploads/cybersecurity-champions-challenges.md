# The Cybersecurity Champions Challenge — Content Pack

15 challenge mockups for the TIMS Cybersecurity Champions Challenge, with full mockup content, visual layout notes, and the educational micro-tip shown after each answer. Designed to seed Claude Design and the D1 database. You only need 10 challenges live at any time — having 15 lets you rotate, retire, or A/B test.

**Coverage across the 15:**
- 6 Spot It (4 scams + 2 real legitimate messages that look suspicious — the tricks)
- 3 Pick the Stronger (passwords)
- 4 What Do You Do? (scenarios)
- 2 Real or AI? (modern threats)

**Topic coverage:** phishing, government impersonation, identity fraud, social engineering, password strength, password reuse, MFA/2FA, passkeys, AI voice cloning, quishing (QR code scams), scam recovery.

---

## SPOT IT — Six challenges

### Challenge 1 — Fake myGov SMS
**Key:** `fake_mygov_sms_01`
**Type:** spot_it
**Category:** government impersonation / phishing
**Difficulty:** 1
**Correct answer:** SCAM
**Source:** Based on myGov impersonation pattern documented by Services Australia, 2024–25

**Visual layout:**
iOS or Android SMS bubble on a phone screen. Sender shown as "myGov" at the top (scammers spoof the sender name). Timestamp visible. The message bubble contains a small QR code thumbnail at the bottom.

**Content:**
> **From:** myGov
>
> Your account has been suspended due to unusual activity. To restore access, verify your identity within 24 hours or your account will be permanently closed.
>
> Tap below or scan: https://my-gov-verify-au.com/restore
>
> [QR code image]

**Educational micro-tip:**
The real myGov and Services Australia will never send you a link or QR code by SMS to log in. If there's actually a problem with your account, open the official myGov app or type `my.gov.au` into your browser yourself. The 24-hour countdown is the giveaway — scammers use urgency so you don't have time to think.

---

### Challenge 2 — Fake ATO refund email
**Key:** `fake_ato_email_01`
**Type:** spot_it
**Category:** government impersonation / phishing
**Difficulty:** 2
**Correct answer:** SCAM
**Source:** Based on ATO impersonation patterns documented by the ATO and reported to Scamwatch

**Visual layout:**
Email client view (generic, Gmail-like). Show sender, subject, body, and a prominent "Verify Now" button.

**Content:**
> **From:** Australian Taxation Office <refunds@ato-gov-au.com>
> **Subject:** URGENT: Your tax refund of $1,847.32 is pending
>
> Dear Taxpayer,
>
> Our records show you are entitled to a refund of **$1,847.32** from your most recent return.
>
> To process this refund to your nominated bank account, please verify your details via our secure portal within 48 hours. After this period, the refund will be cancelled.
>
> [ **VERIFY NOW** ] (link: ato-refund-portal.com)
>
> Kind regards,
> Australian Taxation Office

**Educational micro-tip:**
The ATO never emails about refunds with "click here to verify" links — real refunds go straight to the bank account already on file. Check the sender's domain: real ATO addresses end in `.gov.au` (like `ato.gov.au`), never `.com` or anything with hyphens. When in doubt, log into myGov yourself and check the messages section there.

---

### Challenge 3 — Real Australia Post tracking SMS  *(the trick)*
**Key:** `real_auspost_sms_01`
**Type:** spot_it
**Category:** trick / pattern recognition
**Difficulty:** 3
**Correct answer:** LEGIT
**Source:** Based on real Australia Post SMS notifications

**Visual layout:**
SMS bubble. Sender shown as "AusPost" or a real Australia Post short code.

**Content:**
> **From:** AusPost
>
> Your parcel ABC123456789 is out for delivery today between 10am–4pm.
>
> Track at: auspost.com.au/track
>
> Reply HELP for help. Do not reply to this SMS.

**Educational micro-tip:**
This one's real. Genuine Australia Post tracking messages do come by SMS — but they don't ask for personal information, payment, or a login. The signal isn't whether a message *looks* official; it's whether it asks you to enter information. Real tracking links always go to `auspost.com.au`, never to lookalike domains like `auspost-delivery.com`.

---

### Challenge 4 — Fake job advertisement
**Key:** `fake_seek_job_01`
**Type:** spot_it
**Category:** identity fraud
**Difficulty:** 2
**Correct answer:** SCAM
**Source:** Based on fake recruitment scam patterns; identity fraud is the #1 reported cybercrime in Australia per ASD 2024–25

**Visual layout:**
Email response to a job application. Generic email client view. May include a Seek-like banner image at the top (without using the actual Seek logo).

**Content:**
> **From:** HR Team <hr@flexiwork-recruitment.online>
> **Subject:** Congratulations — Position Offered: Remote Data Entry
>
> Hi,
>
> Congratulations! Following your recent application, you've been **pre-selected** for a remote data entry position with FlexiWork Solutions.
>
> - Earn $45–$60 per hour
> - Work from home, flexible hours
> - Immediate start
>
> To finalise your application, please send the following documents to this email by **end of day tomorrow**:
>
> - Tax File Number (TFN)
> - Driver's licence (photo of front and back)
> - Bank account details for payroll setup
> - Medicare card (photo)
>
> Positions are limited and will be allocated on a first-come basis.

**Educational micro-tip:**
Legitimate employers never ask for your TFN, driver's licence, or bank details before you've had a proper interview and signed a contract. Identity fraud is now the #1 reported cybercrime in Australia. Always check a company exists at `abr.business.gov.au` (free ABN Lookup), insist on a video interview, and never send ID documents until you've verified the employer is real.

---

### Challenge 5 — "Hi Mum" family emergency message
**Key:** `fake_family_emergency_01`
**Type:** spot_it
**Category:** social engineering
**Difficulty:** 2
**Correct answer:** SCAM
**Source:** Based on widespread "Hi Mum/Dad" scam documented by Scamwatch and ACCC

**Visual layout:**
WhatsApp-style chat. Unknown number at the top (e.g. "+61 4XX XXX XXX"). Default WhatsApp profile picture (no photo). Two consecutive message bubbles.

**Content:**
> **+61 4XX XXX XXX** *(unknown number)*
>
> Hi Mum, I dropped my phone in the toilet 😩 This is my temporary number, can you save it?
>
> Actually really need a favour — I'm locked out of my banking app because my phone's broken and I have a bill due today. Could you transfer $850 for me? I'll pay you back tomorrow when I get to a branch. I'll send you the BSB and account number.
>
> Don't tell Dad, he'll lose it about the phone 😅

**Educational micro-tip:**
The "Hi Mum/Dad" scam has cost Australian families millions. Scammers count on a parent's instinct to help fast. Always call your actual child on their real number before sending money — and if their phone is "broken," call someone else who knows them. A genuine emergency can wait the 30 seconds it takes to verify. Tip: agree on a family "safe word" that anyone in genuine trouble must mention.

---

### Challenge 6 — Real bank fraud alert  *(the trick)*
**Key:** `real_bank_fraud_sms_01`
**Type:** spot_it
**Category:** trick / pattern recognition
**Difficulty:** 3
**Correct answer:** LEGIT
**Source:** Based on real bank fraud alert SMS patterns from major Australian banks

**Visual layout:**
SMS bubble. Sender shown as the bank's name. Use a generic bank name like "YourBank" or invent one ("NorthBank Australia") so it's not confused with a specific real institution.

**Content:**
> **From:** NorthBank
>
> SECURITY ALERT: Unusual activity detected on card ending 4521 at 14:32 today. Amount: $312.50 at "GAMING SUPPLIES ONLINE".
>
> If this was YOU, no action needed.
>
> If this was NOT you, call us now on **13 22 21** (number also on back of your card). Do not reply to this SMS.

**Educational micro-tip:**
This one's real. Genuine bank fraud alerts always give you a phone number to call — never a link to click. Even better: they tell you to verify the number against the back of your card. The rule that catches almost every bank impersonation scam: if a message asks you to click a link or read out a code, it's a scam. If it asks you to ring a known number, it's probably real.

---

## PICK THE STRONGER — Three challenges

### Challenge 7 — Length beats complexity
**Key:** `password_length_vs_complexity_01`
**Type:** pick_stronger
**Category:** passwords
**Difficulty:** 1
**Correct answer:** Option B
**Source:** Hive Systems 2025 Password Table

**Visual layout:**
Two password cards side-by-side. Each card shows the password in a clean monospace font. Below each, a subtle character count badge ("11 chars" / "26 chars"). No "strength meter" — the user has to decide.

**Content:**
> **Option A:** `Summer2025!`
>
> **Option B:** `river-canyon-sleepy-violin`

**Educational micro-tip:**
Length beats complexity every time. "Summer2025!" can be cracked in hours — it's a predictable pattern that scammers' tools test first. The four-word passphrase looks simpler but takes hundreds of millions of years to crack. For accounts you need to remember, use a passphrase of 4 or more random words.

---

### Challenge 8 — Character substitution is no defence
**Key:** `password_pattern_01`
**Type:** pick_stronger
**Category:** passwords
**Difficulty:** 2
**Correct answer:** Option B
**Source:** Hive Systems 2025 Password Table; common password cracking methodology

**Visual layout:**
Two password cards side-by-side. Same treatment as Challenge 7.

**Content:**
> **Option A:** `P@ssw0rd123!`
>
> **Option B:** `7K!mqRz9$Vp2Lwb4`

**Educational micro-tip:**
Tricks like swapping 'a' for '@' and 'o' for '0' don't fool password-cracking software — those substitutions are the very first thing it tries. A truly random password from a password manager is unguessable. Most password managers are free, work across all your devices, and only ask you to remember one master password.

---

### Challenge 9 — One great password isn't enough
**Key:** `password_reuse_01`
**Type:** pick_stronger
**Category:** passwords / behaviour
**Difficulty:** 2
**Correct answer:** Option B
**Source:** Based on credential-stuffing attack patterns; "have I been pwned" research

**Visual layout:**
Two scenario cards side-by-side (instead of just password strings). Each card has a small avatar/illustration and a sentence.

**Content:**
> **Option A — Sarah's approach:**
> Uses `Bluebird-Sunset-Coffee-92!` for her email, banking, Facebook, and Netflix. It's strong, so she reuses it.
>
> **Option B — Tom's approach:**
> Uses a different random password from his password manager for every single account. He only has to remember his master password.

**Educational micro-tip:**
Even a brilliant password becomes a serious risk if you use it everywhere. When one site gets hacked (and they do, all the time), scammers automatically try that same email-and-password combination on banks, government services, and email accounts. A password manager remembers a unique password for every site so you only need to remember one.

---

## WHAT DO YOU DO? — Four scenarios

### Challenge 10 — Unexpected 2FA code
**Key:** `unexpected_2fa_code_01`
**Type:** scenario
**Category:** MFA / account takeover
**Difficulty:** 2
**Correct answer:** B
**Source:** Based on the "vishing" pattern targeting Australian bank customers; documented by ACMA / NASC

**Visual layout:**
Scenario text in a card. Below it: phone-screen illustration showing both a 2FA SMS and an incoming call from "Unknown Number." Then 4 large option buttons.

**Content:**
> **Scenario:**
> Your bank texts you a 6-digit verification code. You haven't tried to log in. A minute later, you get a phone call from someone saying they're from your bank's fraud team. They ask you to read them the code so they can "cancel the attempted login."
>
> **What do you do?**
>
> A) Read them the code so they can stop the fraud
> B) Don't read the code. Hang up. Call your bank using the number on the back of your card.
> C) Read only the last three digits to be safe
> D) Ask the caller for their employee ID first

**Educational micro-tip:**
This is one of the most common scams in Australia right now. The criminal already has your password — they triggered the 2FA code themselves. They need YOU to read it out so they can break in. Banks never ask you to read 2FA codes over the phone. The rule: any code sent to you is for *your* eyes only. Hang up and call your bank's real number on the back of your card.

---

### Challenge 11 — A friend asks to borrow money
**Key:** `facebook_friend_loan_01`
**Type:** scenario
**Category:** account takeover / social engineering
**Difficulty:** 2
**Correct answer:** C
**Source:** Based on documented Facebook account takeover patterns

**Visual layout:**
Facebook Messenger-style chat preview, with a profile picture and contact name visible. Scenario text frames it, then 4 option buttons.

**Content:**
> **Scenario:**
> Your old workmate Lisa messages you on Facebook Messenger:
>
> *"Hey! Quick favour — I'm in a bind and need to borrow $600 just till Friday. My bank app isn't working. Can you transfer to my sister's account? Will pay you back I promise xx"*
>
> **What do you do?**
>
> A) Send the money — Lisa's always been reliable
> B) Reply asking for more details
> C) Call Lisa on her real phone number to check it's actually her
> D) Ask security questions only the real Lisa would know

**Educational micro-tip:**
When a "friend" suddenly asks for money on Facebook, assume their account has been hacked until you've spoken to them directly. The scammer has access to their old messages and photos, so they can answer "security questions" just fine. A 30-second phone call to Lisa's actual number is the only reliable check. Once confirmed, help Lisa change her password and turn on 2FA.

---

### Challenge 12 — I've just been scammed
**Key:** `just_been_scammed_01`
**Type:** scenario
**Category:** recovery / action
**Difficulty:** 1
**Correct answer:** B
**Source:** National Anti-Scam Centre — 70% of victims who call their bank quickly recover all funds

**Visual layout:**
Scenario text with a clock/urgency icon. Plain, calm presentation — the topic is stressful enough.

**Content:**
> **Scenario:**
> You've just realised you transferred $1,200 to a scammer. The money left your account about 20 minutes ago.
>
> **What's the most important first move?**
>
> A) Post a warning on social media so others don't fall for it
> B) Call your bank IMMEDIATELY on the number on your card
> C) Try to contact the scammer and negotiate
> D) Wait a day to see if the transaction reverses

**Educational micro-tip:**
Speed is everything. 70% of scam victims who contact their bank quickly recover *all* their money, and another 19% recover some. Banks can sometimes freeze or recall transfers — but only if they hear from you fast. After that, report the scam at `scamwatch.gov.au`, change your passwords, and turn on 2FA on every important account. You can also call IDCARE on 1800 595 160 for free identity recovery help.

---

### Challenge 13 — Pick the strongest login method
**Key:** `passkey_choice_01`
**Type:** scenario
**Category:** passkeys / MFA / modern security
**Difficulty:** 3
**Correct answer:** C
**Source:** FIDO Alliance / NIST guidance on passkey adoption

**Visual layout:**
Mock account-security settings screen with four selectable options shown as cards or radio choices. Plain, clean.

**Content:**
> **Scenario:**
> Your email provider lets you choose how to log in. Which is the strongest protection against scammers?
>
> A) Password only — a really strong, long one
> B) Password + 6-digit code sent to you by SMS
> C) Passkey (fingerprint, face, or device PIN)
> D) Password + a login link emailed to you

**Educational micro-tip:**
Passkeys are the newest and strongest option. Your fingerprint, face, or device PIN proves it's you — and there's no password for scammers to steal or trick out of you. SMS codes (option B) are good, but criminals can sometimes intercept them by hijacking your phone number. If "passkey" is offered on a site, use it — it's the new gold standard, and it's already supported by Google, Apple, Microsoft, and most major banks.

---

## REAL OR AI? — Two challenges

### Challenge 14 — AI voice call from your son
**Key:** `ai_voice_call_01`
**Type:** real_ai
**Category:** AI threats / family scams
**Difficulty:** 2
**Correct answer:** B
**Source:** Swinburne University / SecurityBrief Australia — Australians lost $25.8M to AI voice scams in H1 2025

**Visual layout:**
Incoming-call screen mockup with a sound waveform animating. Scenario text below. Option buttons at the bottom.

**Content:**
> **Scenario:**
> You answer a call. The voice on the other end sounds exactly like your son. He's panicked:
>
> *"Dad, I've been in a car accident. I'm at the police station and I need you to send $3,000 to a lawyer right now or they're going to charge me. Please don't tell Mum, she'll freak out."*
>
> **What's the safest thing to do?**
>
> A) Send the money — that's clearly his voice
> B) Hang up. Call your son's actual number directly to check
> C) Ask the "lawyer" to call you back on a landline first
> D) Send half the money to be safe

**Educational micro-tip:**
AI voice-cloning needs just 3 seconds of someone's voice — often grabbed from a social media video. Australians lost $25.8 million to AI voice scams in the first half of 2025. The defence isn't trusting your ears, it's trusting the process: end the call, then call the person back on their real number. Even better — agree on a family "safe word" that anyone calling in a real emergency must say.

---

### Challenge 15 — QR code on a parking meter
**Key:** `qr_code_parking_01`
**Type:** real_ai
**Category:** quishing / QR code scams
**Difficulty:** 2
**Correct answer:** B
**Source:** ASD documented 30+ quishing incidents in 2023-24; pattern reported by CHOICE and Scamwatch

**Visual layout:**
Close-up illustration of a parking meter with a QR code sticker visible. The sticker is slightly crooked, partially overlapping other meter signage — subtle but noticeable on close inspection.

**Content:**
> **Scenario:**
> You're parking in town and want to pay via the QR code on the parking meter. You notice the QR code is on a sticker that doesn't quite line up with the rest of the meter's signage.
>
> **What do you do?**
>
> A) Scan it — it's on an official meter
> B) Don't scan. Use the council's parking app or pay at the meter directly
> C) Scan but only enter a small payment to test the site
> D) Take a photo to investigate later, then scan

**Educational micro-tip:**
"Quishing" — fake QR codes stuck over real ones on parking meters, restaurant tables, and posters — is a fast-growing scam in Australia. The QR code hides the destination URL, so you can't see the trap before scanning. Treat any QR code on a sticker with suspicion, especially in public places. Use the official council app, pay at the meter directly, or type the parking website into your browser yourself.

---

## Notes on using this content pack

**Pacing the live experience:** Pick 10 of the 15 for any given session. Recommended distribution:
- 4 Spot It (including at least 1 of the two "trick" legit messages — they're essential for teaching that "looks scary" isn't the right signal)
- 2 Pick the Stronger
- 3 What Do You Do?
- 1 Real or AI?

**Randomisation:** For repeat visitors, rotate which of the 15 they see — keeps the experience fresh and lets you A/B test which scams resonate.

**Difficulty curve:** Start with a difficulty-1 challenge, ramp through 2s, and put a difficulty-3 (one of the trick legit messages) around question 7 or 8 — that's where streaks are at risk of getting broken, which creates a more memorable moment.

**Attribution at the end:** On the results screen, include a small "Sources" link that opens a list showing each challenge was "based on real scams reported to Scamwatch / ASD / NASC." This builds credibility and shows the content isn't invented.

**Visual brand notes (for Claude Design):**
- The mockup messages should look *just realistic enough* to teach pattern recognition but not so polished that they could be confused for working scam templates
- All fake URLs in the mockups are clearly invented (`my-gov-verify-au.com`, `ato-refund-portal.com`, `flexiwork-recruitment.online`) — keep these as-is; the lookalike-domain pattern is the lesson
- Use generic bank/employer/courier names in mockups (NorthBank, FlexiWork) rather than real brand names, except where the impersonation target is a public service (myGov, ATO, Centrelink, Services Australia, Australia Post) since those are the actual common impersonation targets and people need to recognise the pattern
