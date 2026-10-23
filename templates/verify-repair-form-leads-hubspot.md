## Verify and repair inbound form leads with ClearBounce before syncing them to HubSpot

Stop fake, mistyped and dead email addresses from ever reaching your CRM, without losing the real leads behind them. Every form submission is verified in real time with ClearBounce. Instead of simply discarding bad addresses, the workflow tries to **repair** them first: it fixes typos like `gmial.com`, and for B2B leads it searches the company domain for the person's real work address.

### Who it's for
Marketing and sales teams that capture leads with a form and sync them to HubSpot, and agencies that need clean lead data for their clients.

### Key benefits
- **Only deliverable leads reach HubSpot**, each tagged with how it was verified.
- **Recovers leads others would throw away**: typo correction and company-domain search.
- **Handles greylisting**: addresses the mail server would not confirm are re-checked after a pause instead of being rejected.
- **Full audit trail**: accepted and rejected leads are logged to Google Sheets with a reason.
- **Ops alerts**: Slack messages when ClearBounce can't be reached or credits run low.

### How it works
1. **Lead Form** collects name, work email and company website; **Normalize Lead** cleans them up.
2. **Verify Email** checks the address with ClearBounce and **Route by Status** sends it down one of five paths.
3. **Deliverable** and (optionally) **catch-all** leads are accepted.
4. **Undeliverable** leads go to repair: a suggested typo fix is verified first, then the person's address is looked up on the company domain and verified.
5. **Unknown** results wait (15 min by default) and are verified once more.
6. Disposable, role-based and unrepairable addresses are rejected with a reason.
7. Accepted leads are upserted in HubSpot, logged and announced in Slack.

### Setup
1. Create a free [ClearBounce account](https://clearbounce.net/dashboard/register?utm_source=n8n) and an API key (Dashboard → API).
2. Create a **Header Auth** credential: name `X-API-Key`, value your key, and select it in the five ClearBounce HTTP nodes.
3. Connect HubSpot, Google Sheets and Slack. Create **Accepted** and **Rejected** tabs with the column names used in the two logging nodes, and pick your Slack channels.
4. Adjust **Settings**, then activate the workflow and share the form URL.

### Requirements
- ClearBounce account (verification: 1 credit per check; finding: free)
- HubSpot, Google Sheets and Slack accounts

### Customize
Replace **Lead Form** with Typeform, Webflow or a webhook, swap HubSpot for Pipedrive or Salesforce, or set `acceptCatchAll` to `false` in **Settings** to send catch-all leads to review.
