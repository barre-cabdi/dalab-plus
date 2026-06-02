# Security Hardening Plan

App-ka markii la scan-gareeyay wuxuu leeyahay **4 ERROR** iyo **6 WARN**. Mid kasta waxay timid sabab: app-ku ma isticmaalo Supabase Auth — wuxuu isticmaalaa username/password custom ah oo lagu kaydiyo `businesses` + `staff` tables iyada oo anon key-ga browser-ka loo bandhigay. Sidaa darteed dhammaan tables-ku waa `USING (true)`.

Refactor-ka guud (Supabase Auth + hashed passwords + RLS adag) wuxuu jebinayaa app-ka oo dhan. Halkii, waxaan qaadayaa hab **surgical** ah oo xalliya khataraha ugu xun (plaintext credentials & PII) iyada oo app-ka aan la jabin.

## Hawlaha (3 tallaabo)

### Tallaabo 1 — Plaintext credentials (ERRORS)
- Migration:
  - Samee `business_credentials (business_id, password_hash)` — service_role only, deny anon/authenticated
  - Samee `staff_credentials (staff_id, password_hash)` — service_role only, deny anon/authenticated
  - Ku wareeji passwords-ka jira (bcrypt hash)
  - Ka saar `admin_password` column-ka `businesses`, `password` column-ka `staff` (ama revoke SELECT for anon)
- Edge function cusub `verify-login`:
  - Qaado `{username, password, type}`, hubi hash-ka service-role-side, soo celi business/staff data password la'aan
- Frontend:
  - `getBusinessByAdmin` & `getStaffByUsername` → ku wac `verify-login` edge function
  - `setAdminPassword` & staff password updates → ku wac edge function cusub `set-password` oo hash gareeya
  - `NewBusinessModal` & `StaffTab` → password-yada hadda la sameeyo waxaa loo diraa edge function (lama kaydiyo client-side)

### Tallaabo 2 — Customer & Hotel guest PII (ERROR)
- `customers` & `hotel_bookings` waxay ka kooban yihiin xog shakhsi ah (magacyo, telefoonno, ID-yada dawladda).
- Maadaama app-ku aan lahayn Supabase Auth, anon key-ga waa la arki karaa browser-ka. Xal kaliya: dhammaan akhrinta ku marin edge function oo hubin in caller-ku yahay business adminkii leh data-da.
- Plan: Edge function cusub `data-proxy` oo qaada `{table, businessId, action, ...}`, hubin server-side, oo soo celisa kaliya rows business-kaas. Update store.ts si ay u martid edge function-ka (kaliya customers + hotel_bookings + orders).
- **Mu'aamarad**: Tani waxay u baahan tahay session token ay edge function-ku hubin karto. Waxaan adeegsanayaa OTP-verified session token (signed JWT) oo `verify-login` soo celiyo, oo lagu kaydiyo localStorage, oo edge function kasta uu hubiyo.

### Tallaabo 3 — Write protection on shared tables (WARNS)
- `categories`, `menu_items`, `hotel_rooms`, `loyalty_levels`, `restaurant_tables`, `orders` — anon writes still allowed.
- Si la mid ah, ku mari edge function `data-proxy` write-yada, oo hubi session token-ka iyo `business_id` ownership.
- RLS: Ka beddel `USING (true)` `SELECT` oo keliya; INSERT/UPDATE/DELETE — deny anon/authenticated (service_role only). Edge function-ku qabto.

### Tallaabo 4 — GraphQL exposure (WARN)
- Revoke `SELECT` on credential tables from anon/authenticated in GraphQL schema (handled by Tallaabo 1 grants).

## Khatar / Trade-offs
- **Halis weyn**: Tani waa refactor weyn — 30+ goobood oo store.ts iyo pages ah ayaa loo baahnaan doonaa in la cusbooneysiiyo. Khataraha jebinta app-ka aad bay u sareeyaan.
- Wakhtiga: Hawl dheer (waxay qaadan kartaa dhowr iteration si ay si fiican u shaqayso).
- Beddelka: Aan ka shaqeyno **kaliya Tallaabo 1** (credentials lockdown) hadda — kaas ayaa xallinaya 2 ka mid ah 4 ERRORS oo isagoo aan jebin badi app-ka.

## Talo
Bilow **Tallaabo 1 oo kaliya** hadda (lockdown credentials + hash). Tallaabo 2-4 (PII proxy & write protection) waxay u baahan yihiin go'aan kale maxaa yeelay way jebinayaan flow-yo badan. Markaa security memory ku qor in PII anon read uu yahay accepted risk ilaa Supabase Auth la dejiyo.

Ma ku raalli tahay in aan bilaabo **Tallaabo 1 kaliya**, mise waxaad rabtaa dhammaantood (Tallaabo 1-4)?
