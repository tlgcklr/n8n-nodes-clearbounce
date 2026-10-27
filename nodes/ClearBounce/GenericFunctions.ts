import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const BASE_URL = 'https://api.clearbounce.net/api/v1';

/** Largest list the bulk endpoint accepts in one job. */
export const MAX_EMAILS_PER_JOB = 10000;

// Same pattern the bulk endpoint validates with. One address it rejects fails
// the whole upload, so anything that doesn't match is kept out of the job.
const EMAIL_PATTERN =
	/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

export function isUploadableEmail(email: string): boolean {
	return EMAIL_PATTERN.test(email);
}

export function normalizeEmail(email: unknown): string {
	return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

/** Result for addresses ClearBounce would reject as malformed; no credit is spent. */
export function invalidSyntaxResult(email: string): IDataObject {
	return {
		email,
		status: 'undeliverable',
		subStatus: 'invalid_syntax',
		reason: 'invalid_syntax',
		score: 0,
		isDeliverable: false,
	};
}

const ERROR_HINTS: Record<number, { message: string; description: string }> = {
	401: {
		message: 'ClearBounce rejected the API key',
		description:
			'Check the API key in your ClearBounce credential. You can create a new key in the ClearBounce dashboard under API.',
	},
	402: {
		message: 'Your ClearBounce account has no credits left',
		description:
			'Buy more credits at https://clearbounce.net/pricing. Pay-as-you-go packs never expire.',
	},
};

export async function clearBounceApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	itemIndex = 0,
	timeout?: number,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		json: true,
	};
	if (body !== undefined) options.body = body;
	if (timeout !== undefined) options.timeout = timeout;

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'clearBounceApi',
			options,
		)) as IDataObject;
	} catch (error) {
		const apiError = error as JsonObject;
		const status = Number(
			apiError.httpCode ?? (apiError.response as JsonObject | undefined)?.status,
		);
		// n8n puts the message from the response body in `description`; it is more
		// useful than the generic text n8n derives from the status code.
		const serverMessage =
			typeof apiError.description === 'string' ? apiError.description : undefined;
		const override = ERROR_HINTS[status] ??
			(serverMessage
				? {
						message: serverMessage,
						description: 'See https://docs.clearbounce.net/api-reference/errors for details.',
					}
				: {});
		// Newer n8n versions already throw a NodeApiError here, and wrapping it again
		// hands back the original unchanged, so the hint has to be set on it directly.
		if (error instanceof NodeApiError) {
			if (override.message) error.message = override.message;
			if (override.description) error.description = override.description;
			error.context.itemIndex = itemIndex;
		}
		throw new NodeApiError(this.getNode(), apiError, { itemIndex, ...override });
	}
}

/** Turns a domain-only typo suggestion ("gmail.com") into a full address. */
function suggestedAddress(email: unknown, suggested: unknown): string | null {
	if (typeof suggested !== 'string' || !suggested) return null;
	if (suggested.includes('@') || typeof email !== 'string' || !email.includes('@')) return suggested;
	return `${email.slice(0, email.lastIndexOf('@'))}@${suggested}`;
}

/**
 * Picks the fields most workflows branch on and flattens them. Works for both
 * single results and bulk results, which may omit the `checks` block.
 */
export function simplifyResult(result: IDataObject): IDataObject {
	const checks = (result.checks as IDataObject | undefined) ?? {};
	const typo = checks.hasTypo as IDataObject | null | undefined;
	return {
		email: result.email,
		status: result.status,
		reason: result.reason ?? null,
		score: result.score,
		isDeliverable: result.isDeliverable,
		isCatchAll: checks.isCatchAll ?? null,
		isDisposable: checks.isDisposable ?? null,
		isRoleBased: checks.isRoleBased ?? null,
		isFreeProvider: checks.isFreeProvider ?? null,
		didYouMean: suggestedAddress(result.email, typo?.suggested),
	};
}
