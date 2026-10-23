## Find and verify business emails for leads in Google Sheets with ClearBounce

Turn a sheet of names and company domains into verified business email addresses. For each lead without an email, ClearBounce finds the most likely address, verifies it and writes the address and its status back to the row.

### Who is it for
Sales teams, recruiters and agencies building outreach lists who start from a name and a company website.

### How it works
1. Reads every lead from Google Sheets and keeps the rows without an email.
2. **Find Email** looks up the most likely address from the name and domain (free).
3. **Verify Email** checks that address in real time (1 credit).
4. Writes `email`, `status` and `confidence` back to the lead's row, so you can filter on `deliverable` before sending.

### Setup
1. Your sheet needs `name`, `domain`, `email`, `status` and `confidence` columns.
2. Select the spreadsheet and sheet in **Read Leads** and **Update Lead**.
3. Create a free [ClearBounce account](https://clearbounce.net/dashboard/register?utm_source=n8n) and an API key (Dashboard → API).
4. Create a **Header Auth** credential: name `X-API-Key`, value your key. Attach it to **Find Email** and **Verify Email**.
5. Click **Execute workflow**.

### Requirements
- ClearBounce account (finding is free; 1 credit per verification)
- Google Sheets account

### Customize
Run it on a schedule to enrich new leads automatically, or try the other candidates in **Find Email**'s `candidates` list when the first one is undeliverable.
