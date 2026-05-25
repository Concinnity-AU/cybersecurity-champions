/* Challenge dataset — content pack v2 (15 challenges, 10 served per session).
   All user-facing strings are isolated here for future translation. */
window.STRINGS = {
  welcomeKicker: "TIMS × Concinnity · FREE Program",
  welcomeTitle: "Could you be a Cybersecurity Champion?",
  welcomeBody:
    "Ten quick challenges. Real scams reported to Scamwatch, ASD and the NASC. About 90 seconds — no sign-up needed to play.",
  welcomeCta: "Start the challenge",
  welcomeMeta: "10 challenges · ~90 seconds · Mobile-friendly",
  stats: [
    {
      big: "$2.18B",
      label: "lost to scams in Australia in 2025",
      source: "NASC · Targeting Scams 2025",
      sourceUrl: "https://www.nasc.gov.au/reports-and-publications/targeting-scams",
    },
    {
      big: "481,523",
      label: "scams reported to Australian authorities in 2025",
      source: "Scamwatch · ACCC",
      sourceUrl: "https://www.scamwatch.gov.au/research-and-resources/scam-statistics",
    },
    {
      big: "+44%",
      label: "rise in losses for Australians who speak English as a second language",
      source: "NASC · H1 2025 update",
      sourceUrl: "https://www.nasc.gov.au/news",
    },
  ],
  scamLabel: "Scam",
  legitLabel: "Legit",
  nextLabel: "Next",
  correct: "Spot on",
  incorrect: "Not quite",
  streakLabel: (n) => `${n} in a row!`,
  scoreLabel: "Score",
  tiers: [
    { min: 0, key: "learner",  title: "Cyber Learner",  blurb: "A great start — every Champion begins right here.", color: "var(--accent-orange)" },
    { min: 4, key: "aware",    title: "Cyber Aware",    blurb: "You spot most tricks. A little polish and you're a Defender.", color: "var(--accent-gold)" },
    { min: 7, key: "defender", title: "Cyber Defender", blurb: "Strong instincts — your family is safer with you watching.", color: "var(--accent-green)" },
    { min: 9, key: "champion", title: "Cyber Champion", blurb: "Outstanding. Come and teach this to your community.", color: "#FFA51C" },
  ],
  sourcesIntro:
    "Every scenario in this challenge is based on real scams reported to Australian authorities.",
  sources: [
    { label: "Scamwatch · ACCC (scam statistics)", url: "https://www.scamwatch.gov.au/research-and-resources/scam-statistics" },
    { label: "NASC · Targeting Scams report", url: "https://www.nasc.gov.au/" },
    { label: "ASD · Annual Cyber Threat Report", url: "https://www.cyber.gov.au/about-us/view-all-content/reports-and-statistics" },
    { label: "Services Australia · myGov scam alerts", url: "https://www.servicesaustralia.gov.au/scams" },
    { label: "IDCARE · free identity recovery (1800 595 160)", url: "https://www.idcare.org/" },
  ],
};

/* ----------------------------------------------------------------------------
   ALL 15 challenges.
   Each: { id, type, difficulty, prompt, mockup|attachment|options|..., answer, tip }
---------------------------------------------------------------------------- */
window.CHALLENGES_ALL = [

  /* === SPOT IT (6) =============================================== */

  /* 1 — Fake myGov SMS */
  {
    id: "fake_mygov_sms_01",
    type: "spot", difficulty: 1,
    prompt: "Just landed on your phone. What is it?",
    mockup: {
      kind: "sms",
      sender: "myGov",
      senderNote: "Sender not in your contacts",
      time: "9:42 AM",
      bubbles: [
        {
          text: "Your account has been suspended due to unusual activity. To restore access, verify your identity within 24 hours or your account will be permanently closed.\n\nTap below or scan:\nhttps://my-gov-verify-au.com/restore",
          qr: true,
        },
      ],
    },
    answer: "scam",
    tip: "The real myGov never sends links or QR codes by SMS to log in. If there's a problem, open the myGov app or type my.gov.au into your browser yourself. The 24-hour countdown is the giveaway — scammers use urgency so you don't have time to think.",
  },

  /* 2 — Fake ATO refund email */
  {
    id: "fake_ato_email_01",
    type: "spot", difficulty: 2,
    prompt: "This email just arrived. What is it?",
    mockup: {
      kind: "email",
      fromName: "Australian Taxation Office",
      fromAddr: "refunds@ato-gov-au.com",
      avatarLetter: "A",
      avatarColor: "var(--con-orange)",
      subject: "URGENT: Your tax refund of $1,847.32 is pending",
      body: [
        "Dear Taxpayer,",
        "Our records show you are entitled to a refund of $1,847.32 from your most recent return.",
        "To process this refund to your nominated bank account, please verify your details via our secure portal within 48 hours. After this period, the refund will be cancelled.",
      ],
      cta: { label: "VERIFY NOW", url: "ato-refund-portal.com" },
      sign: ["Kind regards,", "Australian Taxation Office"],
    },
    answer: "scam",
    tip: "The ATO never emails refunds with 'verify' links — real refunds go to the bank account already on file. Real ATO addresses end in .gov.au, never .com or anything with hyphens. When in doubt, log into myGov yourself and check the messages section.",
  },

  /* 3 — Real Australia Post tracking SMS (the trick) */
  {
    id: "real_auspost_sms_01",
    type: "spot", difficulty: 3,
    prompt: "You're expecting a parcel. This SMS arrives. What is it?",
    mockup: {
      kind: "sms",
      sender: "AusPost",
      senderNote: "Verified business sender",
      verified: true,
      time: "2:18 PM",
      bubbles: [
        {
          text: "Your parcel ABC123456789 is out for delivery today between 10am–4pm.\n\nTrack at: auspost.com.au/track\n\nReply HELP for help. Do not reply to this SMS.",
        },
      ],
    },
    answer: "legit",
    tip: "This one's real. Genuine Australia Post messages don't ask for personal info, payment or a login. The signal isn't whether a message looks official — it's whether it asks you to enter information. Real tracking links always go to auspost.com.au, never to lookalike domains.",
  },

  /* 4 — Fake job ad */
  {
    id: "fake_seek_job_01",
    type: "spot", difficulty: 2,
    prompt: "You applied for jobs yesterday. This reply lands today.",
    mockup: {
      kind: "email",
      fromName: "HR Team — FlexiWork",
      fromAddr: "hr@flexiwork-recruitment.online",
      avatarLetter: "F",
      avatarColor: "#3a7be0",
      subject: "Congratulations — Position Offered: Remote Data Entry",
      body: [
        "Hi,",
        "Following your recent application, you've been pre-selected for a remote data entry position with FlexiWork Solutions.",
        "• Earn $45–$60 per hour\n• Work from home, flexible hours\n• Immediate start",
        "To finalise, send the following to this email by end of day tomorrow:",
        "• Tax File Number (TFN)\n• Driver's licence (photo of front and back)\n• Bank account details for payroll setup\n• Medicare card (photo)",
        "Positions are limited and will be allocated on a first-come basis.",
      ],
    },
    answer: "scam",
    tip: "Legitimate employers never ask for TFN, licence or bank details before a proper interview and a signed contract. Identity fraud is the #1 reported cybercrime in Australia. Check the company at abr.business.gov.au, insist on a video interview, never send ID documents until you've verified the employer is real.",
  },

  /* 5 — Hi Mum / family emergency WhatsApp */
  {
    id: "fake_family_emergency_01",
    type: "spot", difficulty: 2,
    prompt: "An unknown number messages you on WhatsApp. What is it?",
    mockup: {
      kind: "chat",
      sender: "+61 4·· ··· 218",
      senderNote: "Not in contacts",
      time: "11:04 AM",
      bubbles: [
        { text: "Hi Mum, I dropped my phone in the toilet 😩 This is my temporary number, can you save it?" },
        { text: "Actually really need a favour — I'm locked out of my banking app because my phone's broken and I have a bill due today. Could you transfer $850 for me? I'll pay you back tomorrow when I get to a branch. I'll send you the BSB and account number." },
        { text: "Don't tell Dad, he'll lose it about the phone 😅" },
      ],
    },
    answer: "scam",
    tip: "The 'Hi Mum/Dad' scam has cost Australian families millions. Always call your actual child on their real number before sending money — if their phone is 'broken', call someone else who knows them. Agree on a family safe-word for genuine emergencies.",
  },

  /* 6 — Real bank fraud alert (the trick) */
  {
    id: "real_bank_fraud_sms_01",
    type: "spot", difficulty: 3,
    prompt: "This SMS lands while you're at the supermarket.",
    mockup: {
      kind: "sms",
      sender: "NorthBank",
      senderNote: "Verified business sender",
      verified: true,
      time: "2:32 PM",
      bubbles: [
        {
          text: "SECURITY ALERT: Unusual activity detected on card ending 4521 at 14:32 today. Amount: $312.50 at \"GAMING SUPPLIES ONLINE\".\n\nIf this was YOU, no action needed.\n\nIf this was NOT you, call us now on 13 22 21 (number also on back of your card). Do not reply to this SMS.",
        },
      ],
    },
    answer: "legit",
    tip: "This one's real. Genuine bank fraud alerts always give you a phone number to call — never a link to click. The rule that catches almost every bank impersonation scam: if a message asks you to click a link or read out a code, it's a scam. If it asks you to ring a known number, it's probably real.",
  },

  /* === PICK THE STRONGER (3) ===================================== */

  /* 7 — Length beats complexity */
  {
    id: "password_length_vs_complexity_01",
    type: "password", difficulty: 1, mode: "string",
    prompt: "Which password is harder for a scammer to crack?",
    options: [
      { value: "Summer2025!",                  weak: true,  hint: "11 characters · predictable pattern" },
      { value: "river-canyon-sleepy-violin",   weak: false, hint: "26 characters · four random words" },
    ],
    answer: 1,
    tip: "Length beats complexity every time. 'Summer2025!' can be cracked in hours — it's a predictable pattern that cracking tools test first. The four-word passphrase takes hundreds of millions of years to crack.",
  },

  /* 8 — Character substitution */
  {
    id: "password_pattern_01",
    type: "password", difficulty: 2, mode: "string",
    prompt: "Which password is harder for a scammer to crack?",
    options: [
      { value: "P@ssw0rd123!",       weak: true,  hint: "12 characters · top common pattern" },
      { value: "7K!mqRz9$Vp2Lwb4",   weak: false, hint: "16 characters · random from a manager" },
    ],
    answer: 1,
    tip: "Swapping 'a' for '@' or 'o' for '0' doesn't fool password-cracking software — those substitutions are the very first thing it tries. A truly random password from a password manager is unguessable, and you only remember the master password.",
  },

  /* 9 — Password reuse: Sarah vs Tom */
  {
    id: "password_reuse_01",
    type: "password", difficulty: 2, mode: "approach",
    prompt: "Two ways of doing passwords. Which is safer?",
    options: [
      {
        person: "Sarah",
        avatar: "S",
        avatarColor: "var(--con-orange)",
        line: "Uses Bluebird-Sunset-Coffee-92! for email, banking, Facebook and Netflix. It's strong, so she reuses it.",
        weak: true,
        hint: "Reuses one password everywhere",
      },
      {
        person: "Tom",
        avatar: "T",
        avatarColor: "var(--tims-purple)",
        line: "Uses a different random password from his password manager for every account. He only has to remember the master password.",
        weak: false,
        hint: "Unique password per account",
      },
    ],
    answer: 1,
    tip: "Even a brilliant password becomes a serious risk if you use it everywhere. When one site gets hacked (and they do, all the time), scammers automatically try that combination on banks, government services and email. A password manager remembers a unique password for every site.",
  },

  /* === WHAT DO YOU DO? (4) ======================================= */

  /* 10 — Unexpected 2FA + caller asking to read code */
  {
    id: "unexpected_2fa_code_01",
    type: "scenario", difficulty: 2, attachment: "2fa_call",
    prompt:
      "Your bank texts you a 6-digit verification code. You haven't tried to log in. A minute later, you get a phone call from someone saying they're from your bank's fraud team. They ask you to read them the code so they can 'cancel the attempted login.'",
    options: [
      "Read them the code so they can stop the fraud",
      "Hang up. Call your bank using the number on the back of your card",
      "Read only the last three digits to be safe",
      "Ask the caller for their employee ID first",
    ],
    answer: 1,
    tip: "This is one of the most common scams in Australia right now. The criminal already has your password — they triggered the 2FA code themselves. They need YOU to read it out. Banks never ask you to read 2FA codes over the phone. Any code sent to you is for YOUR eyes only.",
  },

  /* 11 — Facebook friend asking for money */
  {
    id: "facebook_friend_loan_01",
    type: "scenario", difficulty: 2, attachment: "fb_chat",
    prompt:
      "Your old workmate Lisa messages you on Facebook Messenger: \"Hey! Quick favour — I'm in a bind and need to borrow $600 just till Friday. My bank app isn't working. Can you transfer to my sister's account? Will pay you back I promise xx\". What do you do?",
    attachmentData: {
      from: "Lisa Nguyen",
      avatar: "L",
      avatarColor: "#a35bdc",
      preview: "Hey! Quick favour — I'm in a bind and need to borrow $600 just till Friday. My bank app isn't working. Can you transfer to my sister's account? Will pay you back I promise xx",
      time: "10m",
    },
    options: [
      "Send the money — Lisa's always been reliable",
      "Reply asking for more details",
      "Call Lisa on her real phone number to check it's actually her",
      "Ask security questions only the real Lisa would know",
    ],
    answer: 2,
    tip: "When a 'friend' suddenly asks for money on Facebook, assume their account has been hacked until you've spoken to them directly. The scammer has access to their old messages and photos, so 'security questions' won't help. A 30-second phone call to Lisa's actual number is the only reliable check.",
  },

  /* 12 — Just been scammed: first move */
  {
    id: "just_been_scammed_01",
    type: "scenario", difficulty: 1, icon: "clock",
    prompt:
      "You've just realised you transferred $1,200 to a scammer. The money left your account about 20 minutes ago. What's your most important first move?",
    options: [
      "Post a warning on social media so others don't fall for it",
      "Call your bank IMMEDIATELY on the number on your card",
      "Try to contact the scammer and negotiate",
      "Wait a day to see if the transaction reverses",
    ],
    answer: 1,
    tip: "Speed is everything. 70% of scam victims who contact their bank quickly recover ALL their money. Banks can sometimes freeze or recall transfers — but only if they hear from you fast. Then report at scamwatch.gov.au, change your passwords, and call IDCARE on 1800 595 160 for free identity recovery help.",
  },

  /* 13 — Pick the strongest login method */
  {
    id: "passkey_choice_01",
    type: "scenario", difficulty: 3, attachment: "authchoice",
    prompt: "Your email provider lets you choose how to log in. Which is the strongest protection against scammers?",
    options: [
      "Password only — a really strong, long one",
      "Password + 6-digit code sent to you by SMS",
      "Passkey (fingerprint, face, or device PIN)",
      "Password + a login link emailed to you",
    ],
    answer: 2,
    tip: "Passkeys are the newest and strongest option. Your fingerprint, face or device PIN proves it's you — and there's no password for scammers to steal or trick out of you. SMS codes are good, but criminals can sometimes intercept them. If 'passkey' is offered, use it — Google, Apple, Microsoft and most major banks all support it.",
  },

  /* === REAL OR AI? (2) =========================================== */

  /* 14 — AI voice call */
  {
    id: "ai_voice_call_01",
    type: "ai", difficulty: 2, icon: "wave",
    prompt:
      "You answer a call. The voice sounds exactly like your son. He's panicked: \"Dad, I've been in a car accident. I'm at the police station and I need you to send $3,000 to a lawyer right now or they're going to charge me. Please don't tell Mum, she'll freak out.\" Safest thing to do?",
    options: [
      "Send the money — that's clearly his voice",
      "Hang up. Call your son's actual number directly to check",
      "Ask the 'lawyer' to call you back on a landline first",
      "Send half the money to be safe",
    ],
    answer: 1,
    tip: "AI voice-cloning needs only 3 seconds of someone's voice — often grabbed from social media. Australians lost $25.8M to AI voice scams in just H1 2025. The defence isn't trusting your ears, it's trusting the process: end the call, then ring the person back. Even better — agree on a family safe-word.",
  },

  /* 15 — QR code on parking meter */
  {
    id: "qr_code_parking_01",
    type: "ai", difficulty: 2, attachment: "meter_qr",
    prompt:
      "You're parking in town and want to pay via the QR code on the parking meter. You notice the QR code is on a sticker that doesn't quite line up with the rest of the meter's signage. What do you do?",
    options: [
      "Scan it — it's on an official meter",
      "Don't scan. Use the council's parking app or pay at the meter directly",
      "Scan but only enter a small payment to test the site",
      "Take a photo to investigate later, then scan",
    ],
    answer: 1,
    tip: "'Quishing' — fake QR codes stuck over real ones on parking meters, restaurant tables and posters — is a fast-growing scam in Australia. The QR code hides the destination URL, so you can't see the trap before scanning. Use the official council app, pay at the meter directly, or type the parking website into your browser yourself.",
  },
];

/* ----------------------------------------------------------------------------
   pickChallenges() — returns 10 challenges per the recommended distribution
   with a difficulty curve and a session-stable seed so repeat visitors rotate.
---------------------------------------------------------------------------- */
window.pickChallenges = function pickChallenges() {
  let seed = 0;
  try {
    const stored = sessionStorage.getItem('cc_seed');
    if (stored !== null) {
      seed = parseInt(stored, 10) || 0;
    } else {
      // Rotate seed across page-loads (but stable within a session)
      const visitCount = parseInt(localStorage.getItem('cc_visit') || '0', 10) + 1;
      localStorage.setItem('cc_visit', String(visitCount));
      seed = visitCount;
      sessionStorage.setItem('cc_seed', String(seed));
    }
  } catch (e) { seed = 0; }

  const all = window.CHALLENGES_ALL;
  const scams    = all.filter(c => c.type === 'spot'     && c.answer === 'scam');
  const tricks   = all.filter(c => c.type === 'spot'     && c.answer === 'legit');
  const pwds     = all.filter(c => c.type === 'password');
  const scenes   = all.filter(c => c.type === 'scenario');
  const ais      = all.filter(c => c.type === 'ai');

  const pick = (arr, n, offset = 0) => {
    const out = [];
    for (let i = 0; i < n; i++) out.push(arr[(seed + offset + i) % arr.length]);
    return out;
  };

  const s = pick(scams, 3, 0);
  const t = pick(tricks, 1, 1);
  const p = pick(pwds, 2, 0);
  const r = pick(scenes, 3, 0);
  const a = pick(ais, 1, 1);

  // Difficulty curve: easy start → ramp → TRICK at Q7 → meaningful close
  return [
    s[0],  // Q1  easy spot
    p[0],  // Q2  easy password
    r[0],  // Q3  scenario
    s[1],  // Q4  scam
    a[0],  // Q5  AI threat
    p[1],  // Q6  harder password
    t[0],  // Q7  TRICK — legitimate message that looks suspicious
    r[1],  // Q8  scenario
    s[2],  // Q9  scam
    r[2],  // Q10 close — often recovery action
  ];
};

window.CHALLENGES = window.pickChallenges();
