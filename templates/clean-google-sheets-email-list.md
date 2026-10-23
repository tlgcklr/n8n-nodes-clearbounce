## Clean a Google Sheets email list with ClearBounce

Verify every address in a Google Sheet in one bulk job and write the result next to each row, so you only send to addresses that can receive mail.

### Who is it for
Marketers, sales teams and agencies who keep contact lists in Google Sheets and want to cut bounces before a campaign.

### How it works
1. Reads all rows of your sheet.
2. Cleans the list (trims, lowercases, removes duplicates and malformed addresses).
3. Starts a ClearBounce bulk job and checks every 30 seconds until it finishes.
4. Writes `status`, `reason` and `score` back to each row.

### Setup
1. Add `email`, `status`, `reason` and `score` columns to your sheet.
2. Select the spreadsheet and sheet in **Read Contacts** and **Write Results**.
3. Create a free ClearBounce account and an API key (Dashboard → API).
4. Create a **Header Auth** credential: name `X-API-Key`, value your key. Attach it to the three ClearBounce HTTP nodes.
5. Click **Execute workflow**.

### Requirements
- Google Sheets account
- ClearBounce account (1 credit per unique address; up to 10,000 addresses per run)

### Customize
Filter on `status` = `deliverable` before syncing the list to Mailchimp, HubSpot or your sending tool.
