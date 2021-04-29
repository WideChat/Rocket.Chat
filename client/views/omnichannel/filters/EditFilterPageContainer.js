import { Callout } from '@rocket.chat/fuselage';
import React from 'react';

import PageSkeleton from '../../../components/PageSkeleton';
import { useTranslation } from '../../../contexts/TranslationContext';
import { AsyncStatePhase } from '../../../hooks/useAsyncState';
import { useEndpointData } from '../../../hooks/useEndpointData';
import EditFilterPage from './EditFilterPage';

const EditFilterPageContainer = ({ id, onSave }) => {
	const t = useTranslation();
	const { value: data, phase: state } = useEndpointData(`livechat/filters/${id}`);

	if (state === AsyncStatePhase.LOADING) {
		return <PageSkeleton />;
	}

	if (state === AsyncStatePhase.REJECTED || !data?.filter) {
		return <Callout>{t('Error')}: error</Callout>;
	}

	return <EditFilterPage data={data.filter} onSave={onSave} />;
};

export default EditFilterPageContainer;
