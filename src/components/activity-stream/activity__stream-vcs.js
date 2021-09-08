/* @flow */

import React, {useState} from 'react';
import {Linking, Text, TouchableOpacity, View} from 'react-native';

import Details from '../details/details';
import MarkdownView from '../wiki/markdown-view';
import ModalPanelBottom from '../modal-panel-bottom/modal-panel-bottom';
import StreamUserInfo from './activity__stream-user-info';
import {firstActivityChange} from './activity__stream-helper';
import {getErrorMessages, getInfoMessages, getVcsPresentation, getProcessorsUrls} from './activity__stream-vcs-helper';
import {HIT_SLOP} from '../common-styles/button';
import {IconChevronDownUp} from '../icon/icon';
import {relativeDate} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {Activity} from '../../flow/Activity';
import type {PullRequest, VCSActivity, VcsProcessor} from '../../flow/Vcs';
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  activityGroup: Activity,
}

const StreamVCS = (props: Props) => {
  function renderMarkdown(markdown: ?string, hasStyle: boolean = false) {
    return (
      markdown
        ? (
          <View style={hasStyle && styles.activityWorkComment}>
            <MarkdownView>
              {markdown}
            </MarkdownView>
          </View>
        )
        : null
    );
  }

  function renderMessage(message: string, index: number, arr: Array<string>, isError: boolean = false) {
    return <View key={`message_${index}`}>
      <Text style={[styles.vcsMessage, isError && styles.vcsError]}>
        {message}
      </Text>
    </View>;
  }

  function renderError(message: string, index: number, arr: Array<string>) {
    return renderMessage(message, index, arr, true);
  }

  const [sourcesVisible, updateSourcesVisible] = useState(false);

  const vcs: VCSActivity | null = props.activityGroup.vcs?.pullRequest || firstActivityChange(props.activityGroup.vcs);

  if (!vcs) {
    return null;
  }

  const infoMessages: Array<string> = getInfoMessages(vcs);
  const errorMessages: Array<string> = getErrorMessages(vcs);
  const date: number = vcs.fetched || vcs.date;
  const processors: Array<VcsProcessor> = getProcessorsUrls(vcs);
  const title: string = props.activityGroup.merged ? '' : 'Committed changes' + ' ';
  const renderProcessorURL: (
    processor: VcsProcessor | PullRequest,
    singleUrl?: boolean,
    textStyle?: TextStyleProp,
  ) => React$Element<typeof TouchableOpacity> = (
    processor: VcsProcessor | PullRequest,
    singleProcessor: boolean = false,
    textStyle?: TextStyleProp,
  ) => {
    return (
      <Text key={processor.id || processor?.label || processor?.idExternal}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => Linking.openURL(processor.url)}
        >
          <Text style={[styles.link, textStyle]}>{singleProcessor ? getVcsPresentation(vcs) : (processor.label || '')}</Text>
        </TouchableOpacity>
      </Text>
    );
  };
  const renderSourcesDialog = (): React$Element<typeof ModalPanelBottom> => {
    return (
      <ModalPanelBottom
        title={getVcsPresentation(vcs)}
        onHide={() => updateSourcesVisible(false)}
      >
        {processors.map((processor: VcsProcessor) => (
          renderProcessorURL(processor, false, styles.vcsSourceButton)
        ))}
      </ModalPanelBottom>
    );
  };


  return (
    <View>
      {sourcesVisible && renderSourcesDialog()}

      {!props.activityGroup.merged && props.activityGroup.author && (
        <StreamUserInfo activityGroup={{...props.activityGroup, timestamp: 0}}/>
      )}

      <View style={styles.activityChange}>
        <View style={styles.vcsInfo}>
          {!!date && (
            <Text style={[styles.vcsInfoDate, styles.secondaryTextColor]}>{title}{relativeDate(date)}</Text>
          )}

          {Boolean(vcs.version && processors) && (
            <View>
              {processors.length === 1 && renderProcessorURL(processors[0], true)}
              {processors.length > 1 && (
                <TouchableOpacity
                  hitSlop={HIT_SLOP}
                  onPress={() => updateSourcesVisible(true)}
                >
                  <Text style={styles.link}>
                    {getVcsPresentation(vcs)}
                    <IconChevronDownUp size={13} isDown={!sourcesVisible} color={styles.vcsSourceButton.color}/>
                  </Text>
                </TouchableOpacity>
              )}

            </View>
          )}

          {!!vcs.url && <View>{renderProcessorURL(vcs, true)}</View>}
        </View>

        {renderMarkdown(vcs.title, !!vcs.id)}
        {renderMarkdown(vcs.text, !!vcs.id)}

        {(infoMessages.length > 0 || errorMessages.length > 0) && (
          <Details
            style={styles.secondaryTextColor}
            toggler="Show more"
            renderer={() => (
              <>
                {infoMessages.length > 0 && infoMessages.map(renderMessage)}
                {errorMessages.length > 0 && errorMessages.map(renderError)}
              </>
            )}
          />
        )}

        {!!vcs.files && vcs.files !== -1 && (
          <View style={styles.vcsFilesAmount}>
            <Text style={[styles.activityLabel]}>
              {vcs.files} {vcs.files > 1 ? 'files' : 'file'}
            </Text>
          </View>
        )}

      </View>
    </View>
  );
};

export default (React.memo<Props>(StreamVCS): React$AbstractComponent<Props, mixed>);
