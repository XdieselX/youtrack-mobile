import React from 'react';
import {View} from 'react-native';
import ActivityIcon from './activity__stream-icon';
import Avatar from 'components/avatar/avatar';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import styles from './activity__stream.styles';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  activityGroup: Record<string, any>;
  showAvatar: boolean;
  size?: number;
  style?: ViewStyleProp;
};

const ActivityUserAvatar = ({
  activityGroup,
  showAvatar,
  size = 32,
  style,
}: Props): React.ReactElement<
  React.ComponentProps<typeof View>,
  typeof View
> => {
  const shouldRenderIcon: boolean = Boolean(
    !activityGroup.merged && !showAvatar,
  );
  return (
    <View style={[styles.activityAvatar, style]}>
      {Boolean(!activityGroup.merged && showAvatar) && (
        <Avatar
          userName={getEntityPresentation(activityGroup.author)}
          size={size}
          source={{
            uri: activityGroup.author.avatarUrl,
          }}
        />
      )}
      {shouldRenderIcon && <ActivityIcon activityGroup={activityGroup} />}
    </View>
  );
};

export default ActivityUserAvatar;
