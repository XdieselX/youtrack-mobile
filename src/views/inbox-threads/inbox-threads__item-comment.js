/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import Avatar from 'components/avatar/avatar';
import CommentReactions from 'components/comment/comment-reactions';
import Router from 'components/router/router';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import ThreadItem from './inbox-threads__item';
import {hasType} from 'components/api/api__resource-types';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';

import styles from './inbox-threads.styles';

import type {InboxThreadGroup, InboxThreadTarget} from 'flow/Inbox';
import type {User} from 'flow/User';

interface Props {
  currentUser: User;
  group: InboxThreadGroup;
  target: InboxThreadTarget;
}

export default function ThreadCommentItem({group, currentUser, target}: Props) {
  return (
    <ThreadItem
      author={group.comment.author}
      avatar={<Avatar
        userName={getEntityPresentation(group.comment.author)}
        size={30}
        source={{uri: group.comment.author.avatarUrl}}
      />}
      change={<>
        <StreamComment
          activity={group.comment}
        />
        <CommentReactions
          style={styles.threadCommentReactions}
          comment={group.comment.comment}
          currentUser={currentUser}
        />
        <TouchableOpacity
          style={styles.threadButton}
          onPress={() => {
            if (hasType.article(target)) {
              Router.Article({articlePlaceholder: target, navigateToActivity: true});
            } else {
              Router.Issue({issueId: target.id, navigateToActivity: true});
            }
          }}
        >
          <Text style={styles.threadButtonText}>view comment</Text>
        </TouchableOpacity>
      </>}
      group={group}
      reason={i18n('commented')}
      timestamp={group.comment.timestamp}
    />
  );
}