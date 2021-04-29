import { Divider } from '@rocket.chat/fuselage';
import React from 'react';

import { isMobile } from '../../../app/utils/client';
import GroupingList from './GroupingList';
import SortModeList from './SortModeList';
import ViewModeList from './ViewModeList';

function SortList() {
	return (
		<>
			<div className='rc-popover__column'>
				{!isMobile() && <ViewModeList />}
				{!isMobile() && <Divider />}
				<SortModeList />
				<Divider />
				<GroupingList />
			</div>
		</>
	);
}

export default SortList;
