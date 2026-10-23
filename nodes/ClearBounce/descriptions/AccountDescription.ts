import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{
				name: 'Get Credits',
				value: 'getCredits',
				description: 'Retrieve the remaining verification credits of the account',
				action: 'Get credit balance',
			},
		],
		default: 'getCredits',
	},
];
