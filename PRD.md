📄 Product Requirements Document — NutriAI
Field	Detail
Author / Owner	<Your Name>
Stakeholders	Founder (you) · Pilot Employers · Early Beta Users · Supabase Admin
Document Status	Draft v1.2 — 2025-06-28
Review Cycle	Weekly (Mon) with Claude Code summary + diff

1. Problem / Opportunity
Manual calorie tracking is tedious, AI photo apps feel gimmicky, and neither serve employers who want credible wellness ROI.
Older and non-tech employees abandon MyFitnessPal because of clutter and paywalls; younger users churn from Cal AI due to poor accuracy and no free tier. Employers meanwhile lack visibility or engagement tools.

2. Goals & Non-Goals
Goals (MVP ≤ 6 mo)	Non-Goals (Phase 2+)
G1	<2-tap meal logging via photo · voice · text · barcode	Full recipe generator
G2	Trustworthy nutrition data (±10 % kcal on 80 % of test meals)	Precision medical nutrition (HIPAA)
G3	7-day streak retention ≥ 40 %	Social feed like Strava
G4	Employer admin panel: invite codes, aggregate engagement, CSV export	Claims-based insurance analytics
G5	Privacy-first, generous free tier, transparent premium	Paywall-first onboarding

3. Success Metrics
Metric	Target	Owner	Source
DAU / MAU	≥ 30 %	Growth	Supabase event table
7-day streak users	≥ 40 % of weekly actives	Product	Streak table
Crash-free sessions	> 99.5 %	Engineering	Sentry
Employer pilot NPS	≥ 60	Ops	NPS survey
GPT cost / active user	≤ $0.04 /wk	Eng	Cloud cost sheet

4. Background / Research
5 M+ downloads for Cal AI show demand, but 1-star reviews cite forced paywall, crashes, no manual corrections .

MyFitnessPal’s UI + pay-wall shift alienated seniors and budget users .

Employers adopting Gympass + MyFitnessPal via bulk licenses prove a B2B appetite for nutrition perks .

5. Assumptions
GPT-4o Vision can identify >50 common foods per picture within 3 s.

Portion-size prompts reduce error to <±10 %.

Supabase free tier suffices for first 10 k users (DB < 2 GB, storage < 50 GB).

Expo OTA updates avoid App-Store resubmits for minor fixes.

6. Requirements
6.1 Functional
ID	User Story	Acceptance Criteria / API Contract
LOG-1	As a user I take a meal photo.	App calls /v1/vision/analyze → returns {items:[{name,serving_kcal,protein,carbs,fat}],confidence} in ≤ 3000 ms. UI shows editable list → “Save”.
LOG-2	I can speak a meal.	Press mic → Whisper → GPT parse → same response schema.
LOG-3	I can fix AI errors.	“Edit” lets me search USDA DB → replace item OR adjust grams slider; new totals recalc instantly.
MET-1	I see daily macro rings.	Home screen shows 4 rings; tapping opens detailed breakdown modal.
STR-1	I keep a streak.	If at least one food log per UTC-day, current_streak++; else resets.
REM-1	App reminds me at 8 pm if < 75 % kcal logged.	Local push via Expo; respects user-set times.
ADMIN-1	Wellness admin imports roster.	CSV upload or invite link; users auto-tagged with org_id.
ADMIN-2	Admin exports anonymized engagement.	/org/{id}/report.csv with fields: date, active_users, avg_logs_per_user.

6.2 Non-Functional
Performance: 95th-percentile log flow ≤ 5 s.

Stability: Crash-free rate > 99.5 %.

Security: Row-level security in Supabase; JWT auth; all photo URLs expiring after 30 d.

Accessibility: Button hit-targets ≥ 48 × 48 dp; optional large-text mode.

7. User Experience / Design
Screen	Key Elements
Onboarding	4 slides → profile (age, weight, goal) → camera/voice permission prompt → done
Home	Large greeting, calorie ring, sub-rings, “+” FAB opens logging sheet
Add Meal Sheet	Tabs: Camera · Voice · Text · Barcode · Favorites
Edit Meal	Food rows with thumb image + macros, qty slider, swap item search bar
History	Calendar + vertical daily cards
Admin Web	Org selector → KPIs tiles → CSV export button

(Wireframes link: Figma file nutriAI_v0.1.fig)

8. Analytics Events
Event	Properties	Trigger
meal_logged	method, items, total_kcal	Successful save
photo_fail	error_code	Vision 4xx/5xx
streak_broken	days	At midnight job
premium_subscribed	plan,duration	IAP success

9. Milestones
Week	Deliverable
0–2	Repo scaffold (Expo) · Supabase schema · Auth
3–5	Photo + text log flows (mock data)
6–8	GPT-4o integration · calorie ring UI
9–10	Voice + barcode logging · streak + reminders
11–12	Internal TestFlight · crash fixes
13	Public beta (B2C)
18	Admin MVP · first employer pilot
24	GA launch + premium tier

10. Dependencies
OpenAI API key w/ vision access

Nutritionix API token

Apple Developer & Google Play accounts

GPT cost monitoring script

GDPR/privacy counsel for image storage policy

11. Open Questions
Portion-size prompting UX: radio buttons vs slider?

Voice logging fallback if STT fails offline?

Will barcodes be free forever or gated in Premium?

Org admin SSO roadmap (Okta, Azure AD) — Phase 2?

12. Approval
Name	Role	Decision
<Your Name>	Founder & PM	✅
Pilot HR Lead	Pilot Org	⬜
Engineering Advisor	Feasibility	⬜

13. Appendix
Template Source: Adapted from Atlassian Product Requirements blueprint 
atlassian.com
 + Lenny’s PRD sections 
atlassian.com
.

Persona Sheets & Journey Maps – see /docs/personas.pdf.

Data Dictionary – /docs/db_schema.sql.

