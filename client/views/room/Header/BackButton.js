import { Chevron } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { memo } from 'react';

import { useLayout } from '../../../contexts/LayoutContext';

const Burger = (props) => {
	const { sidebar } = useLayout();
	const onClick = useMutableCallback(() => {
		sidebar.toggle();
	});

	return (
		<Chevron
			left
			margin='x4'
			alignSelf='center'
			fontSize='x40'
			{...props}
			onClick={onClick}
			color='#465967'
		/>
	);
};

export default memo(Burger);
