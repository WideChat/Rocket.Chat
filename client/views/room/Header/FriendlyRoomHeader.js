import { Box } from '@rocket.chat/fuselage';
import React from 'react';

import HeaderDivider from '../../../components/Header/HeaderDivider';
import RoomAvatar from '../../../components/avatar/RoomAvatar';
import BackButton from './BackButton';

const FriendlyRoomHeader = ({ room }) => (
	<Box
		rcx-room-header
		is='header'
		height='x64'
		display='flex'
		justifyContent='center'
		flexDirection='column'
		overflow='hidden'
		flexShrink={0}
	>
		<Box
			height='x64'
			mi='neg-x4'
			pi='x12'
			display='flex'
			flexGrow={1}
			overflow='hidden'
			flexDirection='row'
		>
			<BackButton />
			<Box
				display='flex'
				flexShrink={0}
				alignItems='center'
				overflow='hidden'
				justifyContent='center'
				alignSelf='center'
			>
				<RoomAvatar room={room} rounded={true} />
				<Box
					display='flex'
					flexDirection='column'
					flexShrink={0}
					overflow='hidden'
					justifyContent='center'
					alignSelf='center'
					mis='x8'
				>
					<Box color='default' mi='x4' fontScale='s2' withTruncatedText fontStyle='bold'>
						{room.name}
					</Box>
				</Box>
			</Box>
		</Box>
		<HeaderDivider />
	</Box>
);

export default FriendlyRoomHeader;
