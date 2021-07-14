import React from 'react';

import GenericTable from '../../../components/GenericTable';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useResizeInlineBreakpoint } from '../../../hooks/useResizeInlineBreakpoint';
import FiltersRow from './FiltersRow';

export function FiltersTable({ filters, totalFilters, params, onChangeParams, onDelete }) {
	const t = useTranslation();

	const [ref, onMediumBreakpoint] = useResizeInlineBreakpoint([600], 200);

	return (
		<GenericTable
			ref={ref}
			header={
				<>
					<GenericTable.HeaderCell>{t('Name')}</GenericTable.HeaderCell>
					<GenericTable.HeaderCell>{t('Description')}</GenericTable.HeaderCell>
					<GenericTable.HeaderCell>{t('Enabled')}</GenericTable.HeaderCell>
					<GenericTable.HeaderCell width='x60'>{t('Remove')}</GenericTable.HeaderCell>
				</>
			}
			results={filters}
			total={totalFilters}
			params={params}
			setParams={onChangeParams}
		>
			{(props) => (
				<FiltersRow key={props._id} onDelete={onDelete} medium={onMediumBreakpoint} {...props} />
			)}
		</GenericTable>
	);
}

export default FiltersTable;
