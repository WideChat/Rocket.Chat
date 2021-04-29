import { Button, FieldGroup, ButtonGroup } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React from 'react';

import { useRoute } from '../../../contexts/RouterContext';
import { useMethod } from '../../../contexts/ServerContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useForm } from '../../../hooks/useForm';
import FiltersForm from './FiltersForm';

const NewFilterPage = ({ onSave }) => {
	const dispatchToastMessage = useToastMessageDispatch();
	const t = useTranslation();

	const router = useRoute('omnichannel-filters');

	const save = useMethod('livechat:saveFilter');

	const { values, handlers } = useForm({
		name: '',
		description: '',
		enabled: true,
		regex: '',
		slug: '',
	});

	const handleSave = useMutableCallback(async () => {
		try {
			await save(values);
			dispatchToastMessage({ type: 'success', message: t('Saved') });
			onSave();
			router.push({});
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	return (
		<>
			<FieldGroup>
				<FiltersForm values={values} handlers={handlers} />
			</FieldGroup>
			<ButtonGroup align='end'>
				<Button primary onClick={handleSave}>
					{t('Save')}
				</Button>
			</ButtonGroup>
		</>
	);
};

export default NewFilterPage;
