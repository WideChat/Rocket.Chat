import { Box } from '@rocket.chat/fuselage';
import React from 'react';

import HeaderDivider from '../../../components/Header/HeaderDivider';
import RoomAvatar from '../../../components/avatar/RoomAvatar';
import { useUserId } from '../../../contexts/UserContext';
import { useUserData } from '../../../hooks/useUserData';
import BackButton from './BackButton';

const FriendlyRoomHeader = ({ room }) => {
	const isDirectRoom = room.t === 'd' && room.uids.length < 3;
	const userId = useUserId();
	const directUserId = isDirectRoom && room.uids.filter((uid) => uid !== userId).shift();
	const directUserData = useUserData(directUserId);

	return (
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
						<Box color='default' mi='x4' fontScale='s2' withTruncatedText fontWeight='bold'>
							{room.name}
						</Box>
						{isDirectRoom && directUserData && (
							<Box color='#677A89' mi='x4' fontScale='p1' withTruncatedText>
								{directUserData.status}
							</Box>
						)}
					</Box>
				</Box>
			</Box>
			<HeaderDivider />
		</Box>
	);
};

export default FriendlyRoomHeader;
