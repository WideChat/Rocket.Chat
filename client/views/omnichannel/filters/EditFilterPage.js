import { Margins, FieldGroup, Box, Button } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React from 'react';

import { useRoute } from '../../../contexts/RouterContext';
import { useMethod } from '../../../contexts/ServerContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useForm } from '../../../hooks/useForm';
import FiltersForm from './FiltersForm';

const getInitialValues = ({ name, description, enabled, regex, slug }) => ({
	name: name ?? '',
	description: description ?? '',
	enabled: !!enabled,
	regex: regex ?? '',
	slug: slug ?? '',
});

const EditFilterPage = ({ data, onSave }) => {
	const dispatchToastMessage = useToastMessageDispatch();
	const t = useTranslation();

	const router = useRoute('omnichannel-filters');

	const save = useMethod('livechat:saveFilter');

	const { values, handlers, hasUnsavedChanges } = useForm(getInitialValues(data));

	const handleSave = useMutableCallback(async () => {
		try {
			await save({
				_id: data._id,
				...values,
			});
			dispatchToastMessage({ type: 'success', message: t('Saved') });
			onSave();
			router.push({});
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const { name } = values;

	const canSave = name && hasUnsavedChanges;

	return (
		<>
			<FieldGroup>
				<FiltersForm values={values} handlers={handlers} />
			</FieldGroup>
			<Box display='flex' flexDirection='row' justifyContent='space-between' w='full'>
				<Margins inlineEnd='x4'>
					<Button flexGrow={1} primary onClick={handleSave} disabled={!canSave}>
						{t('Save')}
					</Button>
				</Margins>
			</Box>
		</>
	);
};

export default EditFilterPage;
