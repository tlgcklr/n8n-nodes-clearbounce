import type { INodeProperties } from 'n8n-workflow';

export const emailOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['email'] } },
		options: [
			{
				name: 'Find',
				value: 'find',
				description: "Find a person's business email address from their name and company domain (free)",
				action: 'Find email address',
			},
			{
				name: 'Verify',
				value: 'verify',
				description: 'Check whether an email address is safe to send to (1 credit)',
				action: 'Verify email address',
			},
		],
		default: 'verify',
	},
];

export const emailFields: INodeProperties[] = [
	// ----------------------------------
	//         email: verify
	// ----------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'e.g. nathan@example.com',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['email'], operation: ['verify'] } },
		description: 'The email address to verify',
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['email'], operation: ['verify'] } },
		description:
			'Whether to return a simplified version of the response instead of the raw data',
	},

	// ----------------------------------
	//         email: find
	// ----------------------------------
	{
		displayName: 'Full Name',
		name: 'fullName',
		type: 'string',
		placeholder: 'e.g. Nathan Smith',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['email'], operation: ['find'] } },
		description: 'First and last name of the person',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		placeholder: 'e.g. example.com',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['email'], operation: ['find'] } },
		description:
			'Company website domain. Found addresses are unverified; run Verify on them before sending.',
	},
];
