import React, { memo } from 'react';

import { useLayout } from '../../../contexts/LayoutContext';
import DirectRoomHeader from './DirectRoomHeader';
import FriendlyRoomHeader from './FriendlyRoomHeader';
import RoomHeader from './RoomHeader';

const Header = ({ room }) => {
	const { isEmbedded, isMobile, showTopNavbarEmbeddedLayout } = useLayout();
	if (isEmbedded && !showTopNavbarEmbeddedLayout) {
		return null;
	}

	// Widechat Friendly UI Change
	if (isMobile) {
		return <FriendlyRoomHeader room={room} />;
	}

	if (room.t === 'd' && room.uids.length < 3) {
		return <DirectRoomHeader room={room} />;
	}

	return <RoomHeader room={room} topic={room.topic} />;
};

export default memo(Header);
