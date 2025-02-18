import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {HIT_SLOP} from '../common-styles/button';
import {IconCaretDownUp} from '../icon/icon';
import styles from './details.styles';
import type {TextStyleProp} from 'types/Internal';
type Props = {
  renderer: () => any;
  style?: TextStyleProp;
  title?: string | null | undefined;
  toggler?: string | null | undefined;
};

const Details = (props: Props): React.ReactNode => {
  const {toggler = 'Details'} = props;
  const [expanded, updateExpanded] = useState(false);
  return (
    <>
      <View style={styles.container}>
        {!!props.title && (
          <Text style={styles.title}>{`${props.title}: `}</Text>
        )}
        <TouchableOpacity
          testID="details"
          style={styles.button}
          onPress={() => updateExpanded(!expanded)}
          hitSlop={HIT_SLOP}
        >
          <Text style={[styles.toggle, props.style]}>
            <IconCaretDownUp
              size={12}
              isDown={!expanded}
              color={props?.style?.color || styles.toggle.color}
            />
            <Text style={styles.toggleText}> {toggler}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {expanded && props.renderer()}
    </>
  );
};

export default React.memo<Props>(Details) as React$AbstractComponent<
  Props,
  unknown
>;
