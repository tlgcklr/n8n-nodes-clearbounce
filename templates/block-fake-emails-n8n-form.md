## Block fake and mistyped emails on n8n Form signups with ClearBounce

Verify every signup the moment it is submitted. Real addresses are saved to Google Sheets; fake, disposable or mistyped ones get a friendly message (with a "did you mean" suggestion) so the person can fix them right away.

### Who is it for
Anyone collecting leads, waitlist or newsletter signups with n8n Forms who wants a clean list from day one.

### How it works
1. **Signup Form** collects name and email.
2. **Verify Email** checks the address with ClearBounce in real time.
3. Addresses that are undeliverable or disposable are rejected; everything else is accepted.
4. Accepted signups are appended to Google Sheets and see a thank-you page.
5. Rejected signups see what went wrong and the suggested correction, if there is one.

### Setup
1. Create a free [ClearBounce account](https://clearbounce.net/dashboard/register?utm_source=n8n) and an API key (Dashboard → API).
2. Create a **Header Auth** credential: name `X-API-Key`, value your key. Attach it to **Verify Email**.
3. Add `Name`, `Email`, `Status` and `Score` columns to a sheet and select it in **Save Signup**.
4. Activate the workflow and share the form URL.

### Requirements
- ClearBounce account (1 credit per verification)
- Google Sheets account

### Customize
Swap **Save Signup** for Mailchimp, HubSpot or your CRM, or tighten the rule in **Accept Signup?** to also reject catch-all or role-based addresses.
