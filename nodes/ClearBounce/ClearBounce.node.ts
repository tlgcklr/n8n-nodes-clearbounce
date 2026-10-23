import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPairedItemData,
} from 'n8n-workflow';
import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	sleep,
} from 'n8n-workflow';

import { accountOperations } from './descriptions/AccountDescription';
import { bulkJobFields, bulkJobOperations } from './descriptions/BulkJobDescription';
import { emailFields, emailOperations } from './descriptions/EmailDescription';
import {
	clearBounceApiRequest,
	invalidSyntaxResult,
	isUploadableEmail,
	MAX_EMAILS_PER_JOB,
	normalizeEmail,
	simplifyResult,
} from './GenericFunctions';

// A single verification can wait on slow or greylisting mail servers.
const VERIFY_TIMEOUT_MS = 120_000;

async function waitForBulkJob(
	this: IExecuteFunctions,
	jobId: string,
	pollIntervalMs: number,
	maxWaitMs: number,
): Promise<void> {
	const signal = this.getExecutionCancelSignal();
	const deadline = Date.now() + maxWaitMs;
	while (Date.now() < deadline) {
		await sleep(pollIntervalMs, signal);
		if (signal?.aborted) {
			throw new NodeOperationError(this.getNode(), 'The execution was cancelled', {
				description: `Bulk job ${jobId} keeps running on ClearBounce. Fetch its results later with the Get Results operation.`,
			});
		}
		const response = await clearBounceApiRequest.call(this, 'GET', `/bulk/status/${jobId}`);
		const job = response.job as IDataObject;
		if (job.status === 'completed') return;
		if (job.status === 'failed') {
			throw new NodeOperationError(this.getNode(), `ClearBounce could not finish bulk job ${jobId}`, {
				description:
					'Run the node again. If it keeps happening, contact support@clearbounce.net with the job ID.',
			});
		}
	}
	throw new NodeOperationError(
		this.getNode(),
		`Bulk job ${jobId} did not finish within the 'Max Wait Time'`,
		{
			description:
				"The job keeps running on ClearBounce. Increase 'Max Wait Time (Minutes)', or turn off 'Wait for Completion' and fetch the results later with the Get Results operation.",
		},
	);
}

/**
 * Sends the addresses of all input items as bulk jobs (10,000 per job) and,
 * when waiting, returns one result per input item in input order.
 */
async function createBulkJobs(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const waitForCompletion = this.getNodeParameter('waitForCompletion', 0) as boolean;

	const itemEmails: string[] = [];
	const uploadable = new Set<string>();
	for (let i = 0; i < items.length; i++) {
		const email = normalizeEmail(this.getNodeParameter('email', i, ''));
		itemEmails.push(email);
		if (isUploadableEmail(email)) uploadable.add(email);
	}

	const uniqueEmails = [...uploadable];
	const chunks: string[][] = [];
	for (let start = 0; start < uniqueEmails.length; start += MAX_EMAILS_PER_JOB) {
		chunks.push(uniqueEmails.slice(start, start + MAX_EMAILS_PER_JOB));
	}

	const allItems: IPairedItemData[] = items.map((_, i) => ({ item: i }));
	const skippedCount = itemEmails.filter((email) => !uploadable.has(email)).length;

	// Nothing valid usually means the 'Email' parameter points to the wrong field.
	if (uniqueEmails.length === 0) {
		throw new NodeOperationError(this.getNode(), 'None of the input items has a valid email address', {
			description: "Check that the 'Email' parameter points to the field that holds the address.",
		});
	}

	if (!waitForCompletion) {
		const returnData: INodeExecutionData[] = [];
		for (const chunk of chunks) {
			const response = await clearBounceApiRequest.call(this, 'POST', '/bulk/upload', {
				emails: chunk,
			});
			returnData.push({
				json: {
					jobId: response.jobId,
					totalEmails: response.totalEmails,
					duplicateCount: response.duplicateCount,
					estimatedTimeSeconds: response.estimatedTimeSeconds,
					skippedInvalidEmails: skippedCount,
				},
				pairedItem: allItems,
			});
		}
		return returnData;
	}

	const simplify = this.getNodeParameter('simplify', 0) as boolean;
	const options = this.getNodeParameter('options', 0, {}) as {
		pollInterval?: number;
		maxWaitMinutes?: number;
	};
	const pollIntervalMs = Math.max(5, options.pollInterval ?? 15) * 1000;
	const maxWaitMs = Math.max(1, options.maxWaitMinutes ?? 60) * 60_000;

	const resultsByEmail = new Map<string, IDataObject>();
	for (const chunk of chunks) {
		const upload = await clearBounceApiRequest.call(this, 'POST', '/bulk/upload', {
			emails: chunk,
		});
		const jobId = upload.jobId as string;
		await waitForBulkJob.call(this, jobId, pollIntervalMs, maxWaitMs);
		const response = await clearBounceApiRequest.call(this, 'GET', `/bulk/results/${jobId}`);
		for (const result of (response.results as IDataObject[]) ?? []) {
			resultsByEmail.set(normalizeEmail(result.email), result);
		}
	}

	return itemEmails.map((email, i) => {
		const result =
			resultsByEmail.get(email) ??
			(uploadable.has(email)
				? { email, status: 'unknown', reason: null, score: 0, isDeliverable: false }
				: invalidSyntaxResult(email));
		return { json: simplify ? simplifyResult(result) : result, pairedItem: { item: i } };
	});
}

export class ClearBounce implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ClearBounce',
		name: 'clearBounce',
		icon: { light: 'file:../../icons/clearbounce.svg', dark: 'file:../../icons/clearbounce.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Verify and find email addresses with ClearBounce',
		defaults: {
			name: 'ClearBounce',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'clearBounceApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Bulk Job', value: 'bulkJob' },
					{ name: 'Email', value: 'email' },
				],
				default: 'email',
			},
			...emailOperations,
			...emailFields,
			...bulkJobOperations,
			...bulkJobFields,
			...accountOperations,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// One job for all input items, so this operation doesn't run per item.
		if (resource === 'bulkJob' && operation === 'create') {
			try {
				return [await createBulkJobs.call(this, items)];
			} catch (error) {
				if (!this.continueOnFail()) {
					const nodeError =
						error instanceof NodeApiError || error instanceof NodeOperationError
							? error
							: new NodeOperationError(this.getNode(), error as Error);
					throw nodeError;
				}
				return [
					items.map((_, i) => ({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					})),
				];
			}
		}

		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'email' && operation === 'verify') {
					const email = (this.getNodeParameter('email', i) as string).trim();
					if (!email) {
						throw new NodeOperationError(this.getNode(), "The 'Email' parameter is empty", {
							itemIndex: i,
							description: 'Map the field of the input item that holds the email address.',
						});
					}
					const simplify = this.getNodeParameter('simplify', i) as boolean;
					// ClearBounce answers malformed addresses with a 400; return the same
					// result a bulk job gives them instead, without spending a credit.
					if (!isUploadableEmail(email)) {
						const result = invalidSyntaxResult(email);
						returnData.push({
							json: simplify ? simplifyResult(result) : result,
							pairedItem: { item: i },
						});
						continue;
					}
					const response = await clearBounceApiRequest.call(
						this,
						'POST',
						'/verify',
						{ email },
						i,
						VERIFY_TIMEOUT_MS,
					);
					const data = response.data as IDataObject;
					const json: IDataObject = simplify
						? simplifyResult(data)
						: { ...data, creditsRemaining: response.creditsRemaining };
					// Mock results from a cb_test_ key must never pass for real ones.
					if (response.sandbox) json.sandbox = true;
					returnData.push({ json, pairedItem: { item: i } });
				} else if (resource === 'email' && operation === 'find') {
					const name = (this.getNodeParameter('fullName', i) as string).trim();
					const domain = (this.getNodeParameter('domain', i) as string).trim();
					const response = await clearBounceApiRequest.call(
						this,
						'POST',
						'/finder/person',
						{ name, domain },
						i,
					);
					returnData.push({ json: response, pairedItem: { item: i } });
				} else if (resource === 'bulkJob' && operation === 'get') {
					const jobId = (this.getNodeParameter('jobId', i) as string).trim();
					const response = await clearBounceApiRequest.call(
						this,
						'GET',
						`/bulk/status/${encodeURIComponent(jobId)}`,
						undefined,
						i,
					);
					returnData.push({ json: response.job as IDataObject, pairedItem: { item: i } });
				} else if (resource === 'bulkJob' && operation === 'getResults') {
					const jobId = (this.getNodeParameter('jobId', i) as string).trim();
					const simplify = this.getNodeParameter('simplify', i) as boolean;
					const response = await clearBounceApiRequest.call(
						this,
						'GET',
						`/bulk/results/${encodeURIComponent(jobId)}`,
						undefined,
						i,
					);
					for (const result of (response.results as IDataObject[]) ?? []) {
						returnData.push({
							json: simplify ? simplifyResult(result) : result,
							pairedItem: { item: i },
						});
					}
				} else if (resource === 'account' && operation === 'getCredits') {
					const response = await clearBounceApiRequest.call(this, 'GET', '/credits', undefined, i);
					returnData.push({ json: { credits: response.credits }, pairedItem: { item: i } });
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The operation '${operation}' is not supported for '${resource}'`,
						{ itemIndex: i },
					);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				const nodeError =
					error instanceof NodeApiError || error instanceof NodeOperationError
						? error
						: new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
				throw nodeError;
			}
		}

		return [returnData];
	}
}
