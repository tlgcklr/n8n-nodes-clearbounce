import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ClearBounceApi implements ICredentialType {
	name = 'clearBounceApi';

	displayName = 'ClearBounce API';

	icon: Icon = { light: 'file:../icons/clearbounce.svg', dark: 'file:../icons/clearbounce.dark.svg' };

	documentationUrl = 'https://docs.clearbounce.net/api-reference/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Create a key in the ClearBounce dashboard under API. Live keys start with cb_live_. Test keys (cb_test_) return mock results, never spend credits and only work with Verify and Get Credits.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.clearbounce.net/api/v1',
			url: '/credits',
			method: 'GET',
		},
	};
}
