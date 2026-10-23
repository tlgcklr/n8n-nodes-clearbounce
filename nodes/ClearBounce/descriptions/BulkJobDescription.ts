import type { INodeProperties } from 'n8n-workflow';

export const bulkJobOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bulkJob'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				description:
					'Verify the email addresses of all input items in one bulk job (1 credit per unique address)',
				action: 'Create bulk job',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve the status and progress of a bulk job',
				action: 'Get bulk job',
			},
			{
				name: 'Get Results',
				value: 'getResults',
				description: 'Retrieve the verification result of every address in a completed bulk job',
				action: 'Get bulk job results',
			},
		],
		default: 'create',
	},
];

export const bulkJobFields: INodeProperties[] = [
	// ----------------------------------
	//         bulkJob: create
	// ----------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'e.g. nathan@example.com',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bulkJob'], operation: ['create'] } },
		description:
			'The email address of each input item, usually an expression that points to its email field. All input items go into one job; duplicates are verified and charged once.',
	},
	{
		displayName: 'Wait for Completion',
		name: 'waitForCompletion',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['bulkJob'], operation: ['create'] } },
		description:
			'Whether to wait until the job finishes and return one result per input item. If off, the node returns the job ID right away and you can fetch the results later with Get Results.',
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: { resource: ['bulkJob'], operation: ['create'], waitForCompletion: [true] },
		},
		description:
			'Whether to return a simplified version of the response instead of the raw data',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: { resource: ['bulkJob'], operation: ['create'], waitForCompletion: [true] },
		},
		options: [
			{
				displayName: 'Check Interval (Seconds)',
				name: 'pollInterval',
				type: 'number',
				typeOptions: { minValue: 5 },
				default: 15,
				description: 'How often to check whether the job has finished',
			},
			{
				displayName: 'Max Wait Time (Minutes)',
				name: 'maxWaitMinutes',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 60,
				description:
					'How long to wait before giving up. The job keeps running on ClearBounce; you can fetch its results later with Get Results.',
			},
		],
	},

	// ----------------------------------
	//         bulkJob: get, getResults
	// ----------------------------------
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bulkJob'], operation: ['get', 'getResults'] } },
		description: "The 'jobId' returned when the bulk job was created",
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['bulkJob'], operation: ['getResults'] } },
		description:
			'Whether to return a simplified version of the response instead of the raw data',
	},
];
