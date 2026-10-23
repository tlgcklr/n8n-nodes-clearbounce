# n8n-nodes-clearbounce

This is an n8n community node. It lets you use [ClearBounce](https://clearbounce.net/?utm_source=n8n) in your n8n workflows.

ClearBounce is an email verification service. It checks whether an email address can receive mail before you send to it, so you can keep bounce rates low and protect your sender reputation. It can also find a person's business email address from their name and company domain.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Usage](#usage) · [Example workflows](#example-workflows) · [Resources](#resources) · [Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation and install the package `n8n-nodes-clearbounce`.

## Operations

**Email**

- **Verify** – check a single email address in real time (1 credit). Returns a status (`deliverable`, `undeliverable`, `risky` or `unknown`), a reason, a 0–100 score and flags for catch-all, disposable, role-based and free-provider addresses, plus a typo suggestion when one is found.
- **Find** – find a person's business email address from their full name and company domain (free). Found addresses are unverified until you run **Verify** on them.

**Bulk Job**

- **Create** – put the email addresses of all input items into one bulk job (1 credit per unique address; duplicates are charged once). With **Wait for Completion** on, the node waits for the job and returns one result per input item, in input order, so you can branch on `status` right away. With it off, the node returns the job ID immediately. Lists over 10,000 addresses are split into several jobs automatically.
- **Get** – retrieve the status and progress of a bulk job.
- **Get Results** – retrieve the result of every address in a completed bulk job, one item per address.

**Account**

- **Get Credits** – retrieve the remaining credit balance.

The node can also be used as a tool by the n8n AI Agent.

## Credentials

1. [Sign up for ClearBounce](https://clearbounce.net/dashboard/register?utm_source=n8n). New accounts include free credits.
2. Open **Dashboard → API** and create an API key.
3. In n8n, create a **ClearBounce API** credential and paste the key.

Key types:

| Prefix | Use |
| --- | --- |
| `cb_live_` | Real verifications. Spends credits. Works with every operation. |
| `cb_test_` | Sandbox. Returns mock results, never spends credits, and works only with **Email → Verify** and **Account → Get Credits**. Results are marked with `sandbox: true`. |

With a test key, the local part of the address picks the mock result, for example `undeliverable@example.com`, `risky@example.com` or `jane+catch-all@example.com`. See the [sandbox reference](https://docs.clearbounce.net/sandbox) for the full list.

## Compatibility

Built with `@n8n/node-cli` and tested with n8n 2.44.6. Has no runtime dependencies.

## Usage

### Which status should I send to?

| Status | Meaning | Typical action |
| --- | --- | --- |
| `deliverable` | The mailbox exists and accepts mail. | Send. |
| `risky` | The address may accept mail but is catch-all, disposable, role-based or low quality. | Decide per use case; check `reason` and the flags. |
| `undeliverable` | The mailbox or domain does not exist, or the address is malformed. | Do not send. |
| `unknown` | The mail server did not give a definite answer. | Retry later or treat as risky. |

### Simplify

**Verify**, **Create** (with Wait for Completion) and **Get Results** have a **Simplify** option, on by default. It returns these fields:

`email`, `status`, `reason`, `score`, `isDeliverable`, `isCatchAll`, `isDisposable`, `isRoleBased`, `isFreeProvider`, `didYouMean`

Turn it off to get the full result, including SMTP and DNS details and the remaining credit balance.

### Malformed addresses

Malformed addresses are not sent to ClearBounce and cost nothing. **Verify** and **Create** return them with `status: undeliverable` and `reason: invalid_syntax`, so every input item still gets exactly one output item. In a bulk job, empty addresses are treated the same way; in **Verify**, an empty 'Email' stops the node, because it usually means the parameter points to the wrong field.

Large jobs can take a while. The default **Max Wait Time** is 60 minutes. If a job takes longer, the node stops waiting but the job keeps running, and you can fetch the results later with **Get Results**.

## Example workflows

Import any of these from the [`examples`](examples) folder (in n8n: **Workflows → Import from File**):

- [`verify-form-signups.json`](examples/verify-form-signups.json) – verify each new form submission and only keep deliverable addresses.
- [`clean-google-sheet-list.json`](examples/clean-google-sheet-list.json) – verify every address in a Google Sheet in one bulk job and write the status back to the sheet.
- [`find-and-verify-business-email.json`](examples/find-and-verify-business-email.json) – find a lead's business email from their name and company domain, then verify it.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ClearBounce API documentation](https://docs.clearbounce.net)
- [ClearBounce pricing](https://clearbounce.net/pricing?utm_source=n8n)
- Support: support@clearbounce.net

## Version history

### 0.1.1

Smaller package; published through npm trusted publishing.

### 0.1.0

First release: Email (Verify, Find), Bulk Job (Create, Get, Get Results), Account (Get Credits).
