import React, { useCallback, useMemo } from 'react';
import { Field, Box, Margins, Button } from '@rocket.chat/fuselage';

import { useTranslation } from '../../../contexts/TranslationContext';
import { useRoute } from '../../../contexts/RouterContext';
import { useEndpointAction } from '../../../hooks/useEndpointAction';
import { useForm } from '../../../hooks/useForm';
import IncomingWebhookForm from '../IncomingWebhookForm';

const initialState = {
	enabled: false,
	channel: '',
	username: '',
	name: '',
	alias: '',
	avatarUrl: '',
	emoji: '',
	scriptEnabled: false,
	script: '',
};

export default function NewIncomingWebhook(props) {
	const t = useTranslation();

	const router = useRoute('admin-integrations');

	const { values: formValues, handlers: formHandlers, reset } = useForm(initialState);

	// TODO: remove JSON.stringify. Is used to keep useEndpointAction from rerendering the page indefinitely.
	const saveAction = useEndpointAction('POST', 'integrations.create', useMemo(() => ({ ...formValues, type: 'webhook-incoming' }), [JSON.stringify(formValues)]), t('Integration_added'));

	const handleSave = useCallback(async () => {
		const result = await saveAction();
		if (result.success) {
			router.push({ context: 'edit', type: 'incoming', id: result.integration._id });
		}
	}, [router, saveAction]);

	const actionButtons = useMemo(() => <Field>
		<Field.Row>
			<Box display='flex' flexDirection='row' justifyContent='space-between' w='full'>
				<Margins inlineEnd='x4'>
					<Button flexGrow={1} type='reset' onClick={reset}>{t('Reset')}</Button>
					<Button mie='none' flexGrow={1} onClick={handleSave}>{t('Save')}</Button>
				</Margins>
			</Box>
		</Field.Row>
	</Field>, [handleSave, reset, t]);

	return <IncomingWebhookForm formValues={formValues} formHandlers={formHandlers} append={actionButtons} {...props}/>;
}
