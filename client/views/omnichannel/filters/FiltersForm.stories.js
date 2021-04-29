import { FieldGroup, Box } from '@rocket.chat/fuselage';
import React from 'react';

import { useForm } from '../../../hooks/useForm';
import FiltersForm from './FiltersForm';

export default {
	title: 'omnichannel/FiltersForm',
	component: FiltersForm,
};

export const Default = () => {
	const { values, handlers } = useForm({
		name: '',
		description: '',
		enabled: true,
		regex: '',
		slug: '',
	});
	return (
		<Box maxWidth='x600'>
			<FieldGroup>
				<FiltersForm values={values} handlers={handlers} />;
			</FieldGroup>
		</Box>
	);
};
