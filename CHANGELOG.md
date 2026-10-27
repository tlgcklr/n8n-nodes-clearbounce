# Changelog

## 0.1.2

- Error hints for a rejected API key (401) and an empty credit balance (402) now show up in recent n8n versions, which already wrap request errors before the node sees them.
- Simplified results: `didYouMean` is always a full address (`jane@gmail.com`), even when ClearBounce suggests only the corrected domain.
- Templates now use the ClearBounce node instead of HTTP Request nodes.

## 0.1.1

- Smaller package: the TypeScript build cache is no longer included.
- Releases are now published through npm trusted publishing.

## 0.1.0

First release.

- **Email:** Verify (1 credit) and Find (free).
- **Bulk Job:** Create (verifies all input items in one job and, with Wait for Completion, returns one result per input item), Get and Get Results.
- **Account:** Get Credits.
- Malformed addresses return `invalid_syntax` without spending credits.
- Usable as a tool by the n8n AI Agent.
