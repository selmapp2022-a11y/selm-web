/**
 * The English strings. This file is the KEY LIST — `fr.ts` is checked
 * against it, and `scripts/i18n-audit.mjs` fails the build on a key that
 * exists here and not there.
 */
export const EN = {
  'nav.dashboard': 'Dashboard',
  'nav.speaking': 'Speaking',
  'nav.listening': 'Listening',
  'nav.reading': 'Reading',
  'nav.writing': 'Writing',
  'nav.vocabulary': 'Vocabulary',
  'nav.progress': 'Progress',
  'nav.settings': 'Settings',
  // The FOUR destinations of the app's own navigation. They were hard-coded
  // English inside `AppLayout` — the one place §5.2 was not being followed,
  // and the most visible: a candidate reading the app in French had five
  // English words on every screen.
  //
  // Five became four on 31 August. `My exam` and `Progress` both fold into
  // `You`; their keys stay because both words are still used as headings on
  // the pages themselves, and `nav.settings` stays because the gear that
  // opens `/me` still needs a label for assistive technology.
  'nav.today': 'Today',
  'nav.practice': 'Practice',
  'nav.mockExam': 'Mock exam',
  'nav.you': 'You',
  'nav.myExam': 'My exam',
  'nav.signOut': 'Sign out',
  'nav.appearance': 'Appearance',
  'nav.main': 'Main navigation',

  'common.loading': 'Loading…',
  'common.continue': 'Continue',
  'common.chooseExam': 'Choose an exam',

  'lang.label': 'Interface language',
  'lang.help': 'The language of the app. Your exam stays in its own language — they are independent.',
  'lang.en': 'English',
  'lang.fr': 'Français',

  'onboarding.title': 'Which exam are you sitting?',
  'onboarding.subtitle':
    'It is the only thing we need to start. No placement test, no level — the exam gives every candidate the same tasks, so there is nothing to place you on.',
  'onboarding.complete': 'Complete — all four skills built.',
  'onboarding.partial': '{built} only. {missing} not built yet.',
  'onboarding.onlyBuilt':
    'Only exams that are actually built are listed. An exam offered but unbuilt would be a claim we cannot keep.',
  'onboarding.satBefore': 'Have you sat it before?',
  'onboarding.satBeforeHelp':
    'If you have, your real marks build a better plan than any test we could give you — however long ago it was. If you have not, we start teaching now.',
  'onboarding.yes': 'Yes — enter my marks',
  'onboarding.no': 'No — start teaching',
  'onboarding.neverBlocked':
    'Skipping changes nothing about what you can use. You will be asked again later, and never blocked.',

  // The language each exam is sat in. It is the first thing a candidate who
  // wants to learn French needs to see, and the exam names do not carry it:
  // nothing on "TCF Canada" says French, and a candidate reading the two
  // titles has no way to tell which one teaches which language.
  'onboarding.inLanguage': 'in {language}',
  'examLang.en': 'English',
  'examLang.fr': 'French',

  // Which exam the candidate actually SAT, which need not be the one they are
  // preparing for.
  'onboarding.yesThis': 'Yes — I sat {exam}',
  'onboarding.yesOther': 'I sat a different exam',
  'onboarding.otherTitle': 'Which exam did you sit?',
  'onboarding.otherSameLang':
    'We can read marks from this one. It is not built yet, so its marks cannot be entered here today.',
  'onboarding.otherCrossLang':
    'That result measures {language}, and you are preparing for an exam in {target}. Marks from one language cannot say anything about your level in the other, so they would not make your plan better — they would make it wrong.',
  'onboarding.switchTo': 'Prepare for {exam} instead',
  'onboarding.continueWithout': 'Continue without marks',
  'onboarding.back': 'Back',

  'practice.chooseExamFirst': 'Choose your exam first',
  'practice.writingNeedsExam':
    'Writing practice is the tasks of the exam you are sitting — its instructions, its word bands, its clock. Without an exam there is nothing honest to practise against.',
  'practice.speakingNeedsExam':
    'Speaking practice is the speaking tasks of the exam you are sitting, in its language and with its timing — not a generic cue card.',
  'practice.pronunciationNeedsExam':
    'Pronunciation practice reads lines from the exam you are sitting, in its language.',
  'practice.tasksAsSet': '{exam} — writing tasks, as the exam sets them.',
  'practice.pickAnother': 'Pick another task',
  'practice.zeroTitle': 'What scores zero here',
  'practice.zeroHelp': "Whatever the quality of the language. These are the exam's rules, not ours.",
  'practice.ourSplit': "(our split of the exam's published total)",

  // ── §5.2, the last sweep (31 August 2026) ────────────────────────────────
  // Everything below came out of a component. The store listing cannot carry
  // French metadata while the interface is English, and the French market is
  // the larger half of the forecast — so these are not polish.
  'common.continueWithAnother': 'Continue with another',

  'standing.counted':
    'Comprehension is **counted** — an exact number of correct answers against our own item bank. Production is **estimated**, and no estimate is published for it yet. The two are not the same kind of number and are never added together.',
  'standing.allProduction':
    'Every section of this exam is **production** — writing and speaking — which is estimated rather than counted, and no estimate is published for it yet.',

  'stale.body':
    'This tab has been open since an older version of SELM. What you see may not match the material we hold now — reload to get the current one.',
  'stale.reload': 'Reload',

  'states.wentWrong': 'Something went wrong.',
  'states.tryAgain': 'Try again',

  'need.writing': 'writing',
  'need.speaking': 'speaking',
  'need.demand': 'Your destination needs **{system} {level}** in {skill}',
  'need.onThisExam': ', which on this exam is **{score}**. ',
  'need.sameTask':
    'The task below is the one the exam sets at every level — what changes with the level you need is what a sufficient answer looks like, not which question is asked.',

  'openExam.freeMock': 'Free mock exam',

  'recorder.start': 'Start recording',
  'recorder.requesting': 'Requesting mic…',
  'recorder.processing': 'Processing…',
  'recorder.stop': 'Stop ({s}s)',

  'player.loading': 'Loading audio…',
  'player.nowSpeaking': 'Now speaking:',
  'player.dialogue': 'Dialogue • {n} lines',
  'player.fileUnavailable': 'Audio file unavailable — using browser voice',
  'player.browserVoice': 'Browser voice',

  'practice.hubBlurb':
    'Your four exam skills. Pick one and work its tasks — in the language your exam is set in.',
  'practice.speakingBlurb': 'Record the exam’s speaking tasks and get scored feedback.',
  'practice.listeningBlurb': 'The exam’s own listening questions, one at a time.',
  'practice.readingBlurb': 'The exam’s own reading passages and questions.',
  'practice.writingBlurb': 'Write each exam task and get scored feedback.',
  'practice.vocabBlurb': 'Extra practice that supports the four skills — not one of them.',
  'practice.listenAnswer': 'Listen and answer, at your level.',
  'practice.listenAnswerNamed': '{exam} — listen and answer, at your level.',
  'practice.readAnswer': 'Read and answer, at your level.',
  'practice.readAnswerNamed': '{exam} — read and answer, at your level.',

  // ── Auth screens ─────────────────────────────────────────────────────────
  'auth.welcomeBack': 'Welcome back',
  'auth.signInBlurb': 'Sign in to continue your English journey.',
  'auth.email': 'Email',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.password': 'Password',
  'auth.password8': 'At least 8 characters',
  'auth.forgot': 'Forgot password?',
  'auth.resetLink': 'Reset your password →',
  'auth.signIn': 'Sign in',
  'auth.signingIn': 'Signing in…',
  'auth.signInApple': 'Sign in with Apple',
  'auth.or': 'or',
  'auth.newToSelm': 'New to SELM?',
  'auth.createAccount': 'Create an account',
  'auth.createYourAccount': 'Create your account',
  'auth.registerBlurb': 'Personal English coaching, powered by AI.',
  'auth.examMarked': 'Your exam is marked',
  'auth.examMarkedBlurb':
    'The answers are counted and waiting on this device. Create an account to read the score — it is kept with your account, not in a browser tab.',
  'auth.fullName': 'Full name',
  'auth.fullNamePlaceholder': 'Jane Doe',
  'auth.username': 'Username',
  'auth.usernamePlaceholder': 'janedoe',
  'auth.creating': 'Creating account…',
  'auth.createAccountBtn': 'Create account',
  'auth.continuing': 'Continuing…',
  'auth.continueApple': 'Continue with Apple',
  'auth.haveAccount': 'Already have an account?',
  'auth.resetTitle': 'Reset your password',
  'auth.resetBlurb': "Enter the email you signed up with and we'll send you a link to reset your password.",
  'auth.resetSent':
    "If an account exists for **{email}**, we've sent a password reset link. Check your inbox (and spam folder) in the next few minutes.",
  'auth.backToSignIn': 'Back to sign in',
  'auth.sending': 'Sending…',
  'auth.sendResetLink': 'Send reset link',
  'auth.rememberedIt': 'Remembered it?',
  'auth.newPasswordTitle': 'Choose a new password',
  'auth.newPasswordBlurb': "Pick something at least 8 characters long. You'll use this to sign in next time.",
  'auth.passwordUpdated': 'Password updated. Redirecting you to sign in…',
  'auth.newPassword': 'New password',
  'auth.confirmNewPassword': 'Confirm new password',
  'auth.reenterPassword': 'Re-enter the password',
  'auth.requestNewLink': 'Request a new reset link →',
  'auth.updating': 'Updating…',
  'auth.setNewPassword': 'Set new password',

  // ── Consent screen (App Store 5.1.1(i) / 5.1.2(i)) ───────────────────────
  'legal.privacyPolicy': 'Privacy Policy',
  'legal.termsOfUse': 'Terms of Use',
  'consent.title': 'Your data & AI processors',
  'consent.intro':
    'SELM uses AI to coach your English. Before we send anything on your behalf, here is exactly what we share, who it goes to, and why. Nothing leaves your device until you accept below.',
  'consent.data': 'Data:',
  'consent.purpose': 'Purpose:',
  'consent.gemini.data': 'The English text you write in Speaking, Writing, Reading, and lesson answers',
  'consent.gemini.purpose': 'to score your writing and generate personalised AI feedback.',
  'consent.stt.data': 'The short audio clips you record when you tap the microphone in Speaking',
  'consent.stt.purpose': 'to transcribe what you said into text so we can compare it to the target sentence.',
  'consent.speechace.data': 'The same audio clips you record in Speaking',
  'consent.speechace.purpose':
    'to score your pronunciation, stress, fluency, and intonation and return CEFR / IELTS-style feedback.',
  'consent.elevenlabs.data': 'Only lesson text (never your own audio)',
  'consent.elevenlabs.purpose': 'to synthesise the AI voices you hear in Listening exercises.',
  'consent.revenuecat.data': 'Your anonymous {store} receipt token',
  'consent.revenuecat.purpose': 'to verify that your SELM Pro subscription is active.',
  'consent.store.data': 'Your {account} identifier and payment method (handled entirely by {vendor})',
  'consent.store.purpose': 'to process the actual subscription payment. SELM never sees your card number.',
  'consent.commitment':
    '**Our commitment.** Every processor listed above is bound by a data-processing agreement that provides the same or greater level of protection required by our Privacy Policy. None of them may use your content to train their own AI models. We do not sell your data. You can delete your account and all of its data at any time from Settings.',
  'consent.fullDetails': 'Full details, including retention periods and your rights, are in our',
  'consent.and': 'and',
  'consent.notEnough':
    'Only including this information in the policy is not enough on its own — that is why we are asking you to accept here as well.',
  'consent.checkbox':
    'I have read the above and I agree to SELM sharing the listed data with the listed AI service providers for the stated purposes.',
  'consent.notNow': 'Not now',
  'consent.agree': 'Agree & continue',
  'consent.revoke':
    'You can revoke this consent by deleting your account in Settings. Withdrawal of consent for AI processing requires account deletion because the AI features are the core of SELM.',

  // ── Paywall ──────────────────────────────────────────────────────────────
  'common.close': 'Close',
  'paywall.blurb': 'Unlock every feature and reach fluency faster.',
  'paywall.perk1': 'Unlimited AI coaching across Speaking, Listening, Reading, Writing',
  'paywall.perk2': 'Real-time pronunciation feedback with IELTS-style scoring',
  'paywall.perk3': 'Adaptive lessons tuned to your CEFR level (A1–C2)',
  'paywall.perk4': 'Vocabulary spaced repetition',
  'paywall.perk5': 'Priority AI response times',
  'paywall.reloadSubs': 'Reload subscriptions and try again',
  'paywall.reminder':
    'Free for 7 days, then {price}/{cadence}. Auto-renews unless cancelled at least 24 hours before the trial ends.',
  'paywall.startTrial': 'Start 7-day free trial',
  'paywall.restore': 'Restore purchases',
  'paywall.legal':
    'Payment will be charged to your Apple ID account at the end of the 7-day free trial. Subscription automatically renews at {price}/{cadence} unless cancelled at least 24 hours before the end of the current period. You can manage and cancel your subscription any time by going to your account settings on the App Store after purchase. No refunds are provided for partial subscription periods.',
  'paywall.bySubscribing': 'By subscribing you agree to our',

  // ── Speaking practice ────────────────────────────────────────────────────
  'speaking.record': 'Record each exam task and get scored feedback.',
  'speaking.recordNamed': '{exam} — record each task and get scored feedback.',
  'speaking.extraPractice': 'Extra practice:',
  'speaking.pronunciation': 'Pronunciation',
  'speaking.level': 'Level {level}',
  'speaking.new': 'New',
  'speaking.readAloud': 'Read the sentence aloud',
  'speaking.analysing': 'Analyzing pronunciation…',
  'speaking.newSentence': 'Try a new sentence',
  'speaking.recordToSee': 'Record yourself to see word-by-word and phoneme scores.',
  'speaking.speakUpTo': 'Speak for up to {time} minutes',
  'speaking.timeOurs': ' — our apportionment of the section time.',
  'speaking.timeExam': ' — the exam’s own limit.',
  'speaking.tapToStart': 'Tap to start — up to {minutes} minutes',
  'speaking.scoring': 'Scoring your response…',
  'speaking.recordAgain': 'Record again',
  'speaking.resultHere': 'Your score and feedback will appear here.',

  // ── Comprehension practice ───────────────────────────────────────────────
  'cp.levelFromResult': 'Served around {band} — the level your last {exam} result puts you at.',
  'cp.levelFromGoal':
    'Served around {band} — the level {system} {level} asks for. A past score report makes this follow your marks instead.',
  'cp.levelPlain': 'Served around {band}.',
  'cp.chooseExamFirst':
    'Choose your exam first. Everything you practise here — the language, the text types, the questions — comes from it.',
  'cp.chooseMyExam': 'Choose my exam',
  'cp.skillNotBuilt': '{exam} — this skill is not built yet',
  'cp.skillNotBuiltWhy':
    'Your exam awards a {skill} score, and we have not authored that part of it. Nothing is shown here rather than substituting general {skill} material, because practising something the exam does not set would not move your score, and telling you otherwise would be worse than an empty page.',
  'cp.builtSkillsOnPractice': 'The skills that are built are on the practice page.',
  'cp.backToPractice': 'Back to practice',
  'cp.audioNotReady': '{exam} — the recordings are not ready',
  'cp.audioNotReadyWhy':
    'The questions exist but their audio has not been recorded. A listening question without its recording is a reading question, so it is not offered. This section opens as soon as the audio is in place.',
  'cp.recording': 'recording',
  'cp.recordings': 'recordings',
  'cp.passage': 'passage',
  'cp.passages': 'passages',
  'cp.nothingHereYet': 'Nothing is written here yet',
  'cp.planPointsAt':
    'Your plan points at **{label}**, and this product holds no {noun} at that coordinate for {exam}. That is a gap in what we have built, not something you have already done — and it is the gap we fill next.',
  'cp.practiseInstead': 'Practise {skill} at your level instead',
  'cp.bankFinished':
    'You have now practised every one of the {nounPl} we have for {exam} {skill} — all **{n}** of them.',
  'cp.bankFinishedWhy':
    'You may go through them again, and there is some use in that — spelling, the second listen, the question you rushed. But a {noun} you have already answered mostly tests whether you remember it, and remembering is not the skill the exam awards. We are saying so rather than dealing you the same {noun} without comment.',
  'cp.notAPredictedBand':
    'The score above is how you did on these questions today. It is not a predicted band.',
  'cp.goAgain': 'Go through them again',
  'cp.replayHere': 'You can replay this here. In the real exam you will hear it once.',
  'cp.correct': 'Correct',

  // ── Account settings ─────────────────────────────────────────────────────
  'account.title': 'Account',
  'account.name': 'Name',
  'account.privacy': 'Privacy',
  'account.privacyBlurb': 'Learn how SELM collects, uses, and stores your data.',
  'account.readPolicy': 'Read Privacy Policy →',
  'account.deleteTitle': 'Delete account',
  'account.deleted': 'Your account has been deleted. Signing you out…',
  'account.deleteMine': 'Delete my account',
  'account.sure': 'Are you sure? This cannot be undone.',
  'account.cancel': 'Cancel',
  'account.deleting': 'Deleting…',
  'account.yesDelete': 'Yes, delete',
  'account.deleteNote': 'Removes your account and all data. Cannot be undone.',

  // ── Today ────────────────────────────────────────────────────────────────
  'today.catalogueFailed': 'The exam catalogue did not load',
  'today.catalogueFailedBody':
    'Your dashboard is built from it, so nothing is shown rather than something wrong. Reload the page; if it keeps failing you are probably offline.',
  'today.openEngine': 'Open the exam engine',
  'today.loadingExam': 'Loading your exam',
  'today.changeExam': 'Change exam, destination or date',
  'today.whenIsExam': 'When is your exam?',
  'today.pacedAgainstDate':
    'Everything here is paced against that date. Without it you can practise, but not plan.',
  'today.setDate': 'Set the date',
  'today.dayUntil': 'day until your exam',
  'today.daysUntil': 'days until your exam',
  'today.daySince': 'day since your exam',
  'today.daysSince': 'days since your exam',
  'today.doThisNext': 'Do this next',
  'today.weakestFirst': 'Your weakest skill first — this is what moves your governing level.',
  'today.examOrder': 'Your plan is in exam order until you enter a past result.',
  'today.startNow': 'Start now',
  'today.pickASkill': 'Pick a skill and begin.',
  'today.targetMeta': 'Target: {target} in every skill',
  'today.whereYouStand': 'Where you stand',
  'today.notBuilt': 'What is not built for your exam',
  'today.readyToBook': 'Are you ready to book?',
  'today.readyAnswer': '{system} {level} — and why',
  'today.notYetAnswerable': 'Not yet answerable — and why',
  'today.upgrade': 'Upgrade to SELM Pro',
  'today.upgradeBlurb': 'Unlimited AI coaching · 7-day free trial',
  'today.reqOverall': '{label} · an overall {target}',
  'today.reqBoth': '{label} · an overall {target}, with a floor in every skill',
  'today.reqEvery': '{label} · {target} in every skill, and the lowest one governs',

  // ── Writing practice ─────────────────────────────────────────────────────
  'writing.eachTask': 'Write each exam task and get scored feedback.',
  'writing.eachTaskNamed': '{exam} — write each task and get scored feedback.',
  'writing.liveGrammar': 'Live grammar',
  'writing.smartRewrite': 'Smart rewrite',
  'writing.writeHere': 'Write here — checks happen as you pause',
  'writing.words': '{n} words',
  'writing.checking': '· checking…',
  'writing.startWriting': 'Start writing… AI will quietly review your grammar, vocabulary, and style.',
  'writing.suggestionsHere': 'Suggestions appear here as you write.',
  'writing.noIssues': 'No issues found. Nice writing!',
  'writing.suggestion': '{n} suggestion',
  'writing.suggestions': '{n} suggestions',
  'writing.corrected': 'Corrected',
  'writing.styleFormal': 'Formal',
  'writing.styleFormalDesc': 'Business / official',
  'writing.styleSimple': 'Simple',
  'writing.styleSimpleDesc': 'Easier vocabulary',
  'writing.styleNatural': 'Natural',
  'writing.styleNaturalDesc': 'Conversational',
  'writing.styleAcademic': 'Academic',
  'writing.styleAcademicDesc': 'Scholarly tone',
  'writing.styleFriendly': 'Friendly',
  'writing.styleFriendlyDesc': 'Warm and casual',
  'writing.rewriteFailed': '(Could not rewrite — try again.)',
  'writing.originalText': 'Original text',
  'writing.pasteToRewrite': 'Paste a sentence or paragraph to rewrite…',
  'writing.chooseStyle': 'Choose style',
  'writing.rewriting': 'Rewriting…',
  'writing.rewriteAs': 'Rewrite as {style}',
  'writing.rewritten': 'Rewritten ({style})',
  'writing.yourDraft': 'Your draft',
  'writing.writeResponse': 'Write your response here…',
  'writing.scoring': 'Scoring…',
  'writing.getFeedback': 'Get AI feedback',
  'writing.overallScore': 'Overall score',
  'writing.grammar': 'Grammar',
  'writing.vocab': 'Vocab',
  'writing.coherence': 'Coherence',
  'writing.task': 'Task',
  'writing.strengths': 'Strengths',
  'writing.toImprove': 'To improve',
  'writing.writeAgain': 'Write again',

  // ── Speech results ───────────────────────────────────────────────────────
  'sr.overall': 'Overall',
  'sr.ieltsBand': 'IELTS band',
  'sr.cefr': 'CEFR',
  'sr.fluency': 'Fluency:',
  'sr.pace': 'Pace:',
  'sr.wpm': '{n} wpm',
  'sr.pauses': 'Pauses:',
  'sr.fillers': 'Filler words detected:',
  'sr.coach': 'Coach:',
  'sr.bandBreakdown': 'IELTS band breakdown',
  'sr.fluencyCoherence': 'Fluency & Coherence',
  'sr.lexicalResource': 'Lexical Resource',
  'sr.grammarAccuracy': 'Grammar & Accuracy',
  'sr.toeflEst': 'TOEFL est.',
  'sr.pteEst': 'PTE est.',
  'sr.whatYouSaid': 'What you said',
  'sr.transcript': 'Transcript',
  'sr.coachTips': 'Coach tips',
  'sr.grammarFixes': 'Grammar fixes',
  'sr.strongerWords': 'Stronger words to use',
  'sr.strongerWordsHelp': 'Replace these basic words with these higher-level alternatives next time.',
  'sr.soundsToPractise': 'Sounds to practise',
  'sr.slipped': 'slipped {n}×',
  'sr.examples': 'Examples:',
  'sr.wordByWord': 'Word-by-word',
  'sr.hoverHelp': 'Hover any word to see phoneme-level scores.',

  // ── Vocabulary ───────────────────────────────────────────────────────────
  'vocab.title': 'Vocabulary review',
  'vocab.blurb': 'Spaced repetition keeps words in your long-term memory.',
  'vocab.addWord': 'Add word',
  'vocab.addToList': 'Add a word to your list',
  'vocab.addHelp':
    "Type any English word. We'll look it up (or have your AI coach define it) and add it to your daily review.",
  'vocab.placeholder': 'e.g. resilient',
  'vocab.adding': 'Adding…',
  'vocab.add': 'Add',
  'vocab.allCaughtUp': 'All caught up',
  'vocab.nothingDue':
    'No words due for review right now. Tap **Add word** above to start your own list, or read and listen to pick up new ones.',
  'vocab.cardOf': 'Card {i} of {n}',
  'vocab.refresh': 'Refresh',
  'vocab.word': 'word',
  'vocab.definition': 'Definition',
  'vocab.example': 'Example',
  'vocab.hard': 'Hard',
  'vocab.good': 'Good',
  'vocab.easy': 'Easy',
  'vocab.howWell': 'How well did you remember it?',
  'vocab.showDefinition': 'Show definition',
  'vocab.sessionComplete': 'Session complete',
  'vocab.reviewed': 'You reviewed {n} words. See you tomorrow.',
  'vocab.checkMore': 'Check for more',

  // ── Progress ─────────────────────────────────────────────────────────────
  'progress.blurb': 'What you have done, and whether the line is moving.',
  'progress.noPlan':
    'Choose your exam and destination, and this page can show what your practice is for. Until then there is nothing here to measure against — and a page that filled the space anyway is exactly what this one replaced.',
  'progress.notYetAnswerable': 'Not yet answerable',
  'progress.aggregate':
    'This destination reads an aggregate, so a weak skill can be carried — but an aggregate still needs every skill to have a number, and not all of them do.',
  'progress.lowestGoverns':
    'The lowest of your four skills is the one that counts, not the average — a candidate at 8, 8, 8 and 5 is at 5. No overall level is shown while any skill is unknown, because taking the lowest of the ones that do have a number would show you a better result than you hold.',
  'progress.meanwhile':
    '**What to do meanwhile:** practise the tasks the exam actually sets, sit the mock exam to see the band your answers hold, and enter any past score report you have — that is the one number here that comes from the awarding body rather than from us.',
  'progress.scoreOverTime': 'Score over time',
  'progress.attempts': 'Attempts',
  'progress.attemptsNote':
    'How much work you have done, and when. **Counting attempts is not the same as awarding points for them** — this is a record of what happened, not a score for having turned up.',
  'progress.fourSkillsOnToday':
    'Your four skills and the level each one holds are on **{today}**.',
  'progress.open': 'Open',
  'progress.notPractised': 'What you have not practised yet',
  'progress.allAttempted': 'Every part of your plan has been attempted at least once.',
  'progress.untouchedNote':
    'An untouched part of the exam predicts a low governing level better than a low score on a part you have practised does. These are the {n} you have not opened.',
  'progress.nothingAuthored': 'nothing is authored behind this yet',
  'progress.notBuiltShort': 'not built',
  'progress.noRealResult': 'No real result entered yet',
  'progress.needPoints':
    'A line needs points. Enter a past {exam} score report and this shows your {system} level per skill against the {system} {level} you need.',
  'progress.enteredResults': 'Your entered results · {system}',
  'progress.onePoint':
    'One result is a point, not a trend. A second entered result is what makes this a line.',
  'progress.needTwoSittings':
    'This chart needs two sittings before it can show anything. It is left empty rather than filled with a number that would only be measuring how often you opened the app.',
  'progress.secondSitting':
    'A second sitting is what turns a point into a line. Until then there is nothing here to draw, and drawing something anyway would be inventing a trend.',
  'progress.takeMock': 'Take a mock exam',
  'progress.practiceSittings': 'Practice sittings · band held',
  'progress.bandHeldNote':
    "This is the CEFR band each sitting held. It is **not** plotted against your {target} target: a practice sitting produces a count of correct answers, and the conversion from that count to the exam's published scale is not released by the awarding body. A target line here would be a conversion drawn rather than computed.",

  // ── Legal pages (chrome; the documents themselves are data in the pages) ─
  'legal.tagline': 'English, Simply',
  'legal.lastUpdated': 'Last updated:',
  'legal.contactHeading': '11. Contact',
  'legal.address': 'Vancouver, British Columbia, Canada',
  'legal.email': 'Email:',
  'legal.returnToSelm': 'Return to SELM',

  'privacy.contactHeading': '10. Contact',
  'privacy.contactBlurb': 'Questions or requests about this policy or your data?',
} as const;
