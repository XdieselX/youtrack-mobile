/* @flow */

import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View, Text, TouchableOpacity} from 'react-native';

import debounce from 'lodash.debounce';
import {useDispatch} from 'react-redux';

import AttachFileDialogStateful, {attachFileActions} from '../attach-file/attach-file-dialog-stateful';
import AttachmentAddPanel from '../attachments-row/attachments-add-panel';
import AttachmentsRow from '../attachments-row/attachments-row';
import Header from '../header/header';
import IconHourGlass from '@jetbrains/icons/hourglass.svg';
import log from '../log/log';
import Mentions from '../mentions/mentions';
import ModalPanelBottom from '../modal-panel-bottom/modal-panel-bottom';
import MultilineInput from '../multiline-input/multiline-input';
import Router from '../router/router';
import usage from '../usage/usage';
import VisibilityControl from '../visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {commentPlaceholderText} from '../../app-text';
import {composeSuggestionText, getSuggestWord} from '../mentions/mension-helper';
import {getAttachmentActions} from '../attachments-row/attachment-actions';
import {IconArrowUp, IconCheck, IconClose, IconAdd} from '../icon/icon';
import {ThemeContext} from '../theme/theme-context';

import styles from './comment-update.styles';

import type {Attachment, IssueComment} from '../../flow/CustomFields';
import type {Node} from 'react';
import type {Theme} from '../../flow/Theme';
import type {UserGroup} from '../../flow/UserGroup';
import type {User} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';
import type {CustomError} from '../../flow/Error';
import type {AttachmentActions} from '../attachments-row/attachment-actions';
import type {ActionSheetAction} from '../../flow/Action';

type UserMentions = { users: Array<User> };

type Props = {
  canAttach: boolean,
  editingComment?: ?$Shape<IssueComment>,
  getCommentSuggestions: (query: string) => Promise<UserMentions>,
  getVisibilityOptions: () => Array<User | UserGroup>,
  isArticle?: boolean,
  isEditMode: boolean,
  onAddSpentTime: (() => any) | null,
  onAttach: (attachment: Attachment, comment: IssueComment) => Array<Attachment>,
  onCommentChange: (comment: IssueComment, isAttachmentChange: boolean) => any,
  onSubmitComment: (comment: IssueComment) => any,
};

type State = {
  attachFileSource: string | null,
  commentCaret: number,
  editingComment: $Shape<IssueComment>,
  isAttachFileDialogVisible: boolean,
  isAttachActionsVisible: boolean,
  isSaving: boolean,
  isVisibilityControlVisible: boolean,
  isVisibilitySelectVisible: boolean,
  mentions: UserMentions | null,
  mentionsLoading: boolean,
  mentionsQuery: string,
  mentionsVisible: boolean,
};

const EMPTY_COMMENT: $Shape<IssueComment> = {text: '', visibility: null};


const IssueCommentUpdate = (props: Props) => {
  const dispatch = useDispatch();
  const theme: Theme = useContext(ThemeContext);
  const attachmentActions: AttachmentActions = getAttachmentActions('issueCommentInput');

  const [state, updateState] = useState({
    attachFileSource: null,
    commentCaret: 0,
    editingComment: EMPTY_COMMENT,
    isAttachFileDialogVisible: false,
    isAttachActionsVisible: false,
    isSaving: false,
    isVisibilitySelectVisible: false,
    isVisibilityControlVisible: false,
    mentions: null,
    mentionsLoading: false,
    mentionsQuery: '',
    mentionsVisible: false,
  });

  let editCommentInput: MultilineInput;

  const changeState = (statePart: $Shape<State>): void => {
    updateState((prevState: State) => ({...prevState, ...statePart}));
  };

  const toggleSaving = (isSaving: boolean) => {
    changeState({isSaving});
  };

  const debouncedChange = useCallback(debounce((draft: $Shape<IssueComment>, isAttachmentChange: boolean = false) => {
    props.onCommentChange(draft, isAttachmentChange);
  }, 300), []);

  useEffect(() => {
    changeState({
      editingComment: (
        props.editingComment
          ? {...state.editingComment, ...props.editingComment}
          : EMPTY_COMMENT
      )
    });
  }, [props.editingComment]);

  const setComment = (editingComment: $Shape<IssueComment> = EMPTY_COMMENT): void => {
    changeState({editingComment});
  };

  const focus = (): void => {editCommentInput.focus();};

  const toggleVisibilityControl = (isVisibilityControlVisible: boolean): void => {
    changeState({isVisibilityControlVisible});
  };

  const submitComment = (updatedComment: IssueComment): void => {
    toggleSaving(true);
    toggleVisibilityControl(false);
    return props.onSubmitComment(updatedComment)
      .then(() => setComment())
      .finally(() => toggleSaving(false));
  };

  const suggestionsNeededDetector = async (text: string, caret: number): Promise<void> => {
    let word: ?string = ((getSuggestWord(text, caret): any): string | null);
    if (!word) {
      return changeState({
        mentionsVisible: false,
        mentionsQuery: '',
      });
    }

    if (word === '@') {
      word = word.slice(1);
      changeState({
        mentionsVisible: true,
        mentionsQuery: word,
        mentionsLoading: true,
      });
      const mentions: UserMentions = await props.getCommentSuggestions(word);
      changeState({mentionsLoading: false, mentions});
    }
  };

  const applySuggestion = (user: User) => {
    const newText: ?string = composeSuggestionText(user, state.editingComment.text, state.commentCaret);
    if (newText) {
      changeState({
        editingComment: {...state.editingComment, text: `${newText} `},
        mentionsVisible: false,
        isVisibilityControlVisible: true,
      });
    }
  };

  const renderUserMentions = (): Node => {
    return (
      <Mentions
        isLoading={state.mentionsLoading}
        mentions={state.mentions}
        onApply={(user: User) => {
          applySuggestion(user);
          setTimeout(focus, 150);
        }}
      />
    );
  };

  const renderVisibility = (): Node => {
    const toggleSelectVisibility = (isVisibilitySelectVisible: boolean) => changeState({isVisibilitySelectVisible});
    return <VisibilityControl
      onShow={() => toggleSelectVisibility(true)}
      onHidde={() => toggleSelectVisibility(false)}
      visibility={state.editingComment.visibility}
      onSubmit={(visibility: Visibility) => {
        const comment: $Shape<IssueComment> = {
          ...state.editingComment,
          visibility,
        };
        setComment(comment);
        !props.isEditMode && debouncedChange(comment);
      }}
      uiTheme={theme.uiTheme}
      getOptions={props.getVisibilityOptions}
    />;
  };

  const toggleAttachFileDialog = (isAttachFileDialogVisible: boolean): void => {
    changeState({isAttachFileDialogVisible});
  };

  const renderSendButton = (): Node => {
    const {editingComment, isSaving} = state;
    const isDisabled: boolean = state.isSaving || (!state.editingComment.text && !editingComment.attachments);
    return (
      <TouchableOpacity
        style={[
          styles.commentSendButton,
          isDisabled ? styles.commentSendButtonDisabled : null
        ]}
        disabled={isDisabled}
        onPress={() => submitComment({
          ...state.editingComment,
          usesMarkdown: true,
        })}>
        {!isSaving && (
          <IconArrowUp
            size={22}
            color={theme.uiTheme.colors.$textButton}
          />
        )}
        {isSaving && <ActivityIndicator color={theme.uiTheme.colors.$background}/>}
      </TouchableOpacity>
    );
  };

  const renderAttachFileDialog = () => {
    return (
      <AttachFileDialogStateful
        hideVisibility={true}
        getVisibilityOptions={props.getVisibilityOptions}
        actions={{
          onAttach: async (file: Attachment, onAttachingFinish: () => any) => {
            let draftComment: IssueComment = state.editingComment;
            if (!draftComment.id) {
              draftComment = await props.onCommentChange(state.editingComment, false);
            }
            const addedAttachments: Array<Attachment> = await dispatch(props.onAttach(
              file,
              state.editingComment,
            ));
            onAttachingFinish();
            toggleAttachFileDialog(false);
            const updatedComment: IssueComment = {
              ...state.editingComment,
              ...draftComment,
              attachments: [].concat(state.editingComment.attachments || []).concat(addedAttachments)
            };
            changeState({editingComment: updatedComment});
            debouncedChange(updatedComment, true);
          },
          onCancel: () => changeState({isAttachFileDialogVisible: false})
        }}
      />
    );
  };

  const renderAttachments = (): Node | null => {
    return (
      <AttachmentsRow
        attachments={state.editingComment.attachments}
        attachingImage={null}
        onImageLoadingError={(err: CustomError) => log.warn('onImageLoadingError', err.nativeEvent)}
        onOpenAttachment={() => (
          usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Preview comment attachment')
        )}
        canRemoveAttachment={!state.isSaving && !state.mentionsVisible}
        onRemoveImage={async (attachment: Attachment) => {
          const resource: Function = (
            props.isArticle
              ? attachmentActions.removeAttachmentFromArticleComment
              : attachmentActions.removeAttachmentFromIssueComment
          );
          await dispatch(resource(
            attachment,
            props.isEditMode && state.editingComment.id
          ));
          const updatedComment: IssueComment = {
            ...state.editingComment,
            attachments: state.editingComment.attachments.filter((it: Attachment) => it.id !== attachment.id)
          };
          changeState({editingComment: updatedComment});
          debouncedChange(updatedComment, true);
        }}
        uiTheme={theme.uiTheme}
      />
    );
  };

  const renderCommentInput = (autoFocus: boolean, onFocus: Function, onBlur: Function): Node => {
    return (
      <MultilineInput
        {...{...props, autoFocus}}
        ref={(instance: ?MultilineInput) => instance && (editCommentInput = instance)}
        placeholder={commentPlaceholderText}
        value={state.editingComment.text}
        editable={!state.isSaving}
        underlineColorAndroid="transparent"
        keyboardAppearance={theme.uiTheme.name}
        placeholderTextColor={theme.uiTheme.colors.$icon}
        autoCapitalize="sentences"
        onSelectionChange={(event) => {
          changeState({commentCaret: event.nativeEvent.selection.start});
        }}
        onChangeText={(text) => {
          const updatedDraftComment: $Shape<IssueComment> = {
            ...state.editingComment,
            text: text,
          };
          setComment(updatedDraftComment);
          suggestionsNeededDetector(text, state.commentCaret);
          !props.isEditMode && debouncedChange(updatedDraftComment);
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        style={styles.commentInput}
      />
    );
  };

  const renderAddNewComment = (): Node => {
    const {isSaving, mentionsVisible, editingComment, isVisibilityControlVisible, isVisibilitySelectVisible} = state;
    const hasText: boolean = !!editingComment.text;
    const showVisibilityControl: boolean = !mentionsVisible && (
      editingComment.visibility ||
      isVisibilitySelectVisible ||
      isVisibilityControlVisible
    );
    const hideAttachActionsPanel = () => changeState({isAttachActionsVisible: false});

    return (
      <>
        <View style={[
          styles.commentHeaderContainer,
          showVisibilityControl ? styles.commentHeaderContainerCreate : null,
        ]}>

          {showVisibilityControl && renderVisibility()}

        </View>

        <View style={styles.commentContainer}>
          {(!!props.onAddSpentTime || props.canAttach) && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionsContainerButton}
                onPress={() => changeState({isAttachActionsVisible: true})}
              >
                <IconAdd
                  color={styles.actionsContainerButton.color}
                  size={22}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.commentInputContainer}>
            {renderCommentInput(
              !!editingComment.reply,
              () => toggleVisibilityControl(true),
              () => {
                changeState({mentionsVisible: false});
                toggleVisibilityControl(false);
              }
            )}
            {Boolean(hasText || editingComment?.attachments?.length > 0) && renderSendButton()}
          </View>
        </View>

        {state.editingComment?.attachments?.length > 0 && <View style={styles.attachmentsContainer}>
          {renderAttachments()}
        </View>}

        {state.isAttachActionsVisible && (
          <ModalPanelBottom
            style={styles.floatContext}
            onHide={hideAttachActionsPanel}
          >
            {props.canAttach && attachFileActions.map((action: ActionSheetAction) => {
              return <TouchableOpacity
                key={action.title}
                style={[styles.actionsContainerButton, styles.floatContextButton]}
                disabled={isSaving || mentionsVisible}
                onPress={() => {
                  changeState({
                    attachFileSource: action.id,
                    isAttachActionsVisible: false,
                    isAttachFileDialogVisible: true,
                  });
                }}
              >
                <action.icon size={action.iconSize || 22} color={styles.actionsContainerButton.color}/>
                <Text
                  style={[styles.actionsContainerButtonText, styles.floatContextButtonText]}>{action.title}</Text>
              </TouchableOpacity>;
            })}
            {!!props.onAddSpentTime && (
              <TouchableOpacity
                style={[styles.actionsContainerButton, styles.floatContextButton]}
                onPress={() => {
                  changeState({isAttachActionsVisible: false});
                  if (props.onAddSpentTime) {
                    props.onAddSpentTime();
                  }
                }}
              >
                <IconHourGlass
                  fill={styles.actionsContainerButton.color}
                  width={20}
                  height={20}
                />
                <Text style={[styles.actionsContainerButtonText, styles.floatContextButtonText]}>Add spent time</Text>
              </TouchableOpacity>
            )}
          </ModalPanelBottom>
        )}
      </>
    );
  };

  const renderEditComment = (): Node => {
    const {isSaving, editingComment} = state;
    const isSubmitEnabled: boolean = editingComment.text || state.editingComment?.attachments?.length > 0;
    return (
      <View style={styles.commentEditContainer}>
        <Header
          style={styles.commentEditHeader}
          title="Edit comment"
          leftButton={<IconClose size={21} color={isSaving ? styles.disabled.color : styles.link.color}/>}
          onBack={() => !isSaving && Router.pop(true)}
          rightButton={
            (isSaving
              ? <ActivityIndicator color={styles.link.color}/>
              : <IconCheck size={20} color={isSubmitEnabled ? styles.link.color : styles.disabled.color}/>)
          }
          onRightButtonClick={async () => {
            if (isSubmitEnabled) {
              await submitComment(state.editingComment);
              Router.pop();
            }
          }}
        />

        <View style={styles.commentEditContent}>
          <View style={styles.commentEditVisibility}>
            {renderVisibility()}
          </View>

          <View style={styles.commentEditInput}>
            {renderCommentInput(
              true,
              () => {},
              () => {
                changeState({mentionsVisible: false});
              }
            )}
          </View>

          <View style={styles.commentEditAttachments}>
            {renderAttachments()}

            <AttachmentAddPanel
              style={styles.commentEditAttachmentsAttachButton}
              isDisabled={state.isSaving || state.isAttachFileDialogVisible || state.mentionsLoading}
              showAddAttachDialog={() => toggleAttachFileDialog(true)}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={props.isEditMode ? styles.commentEditContainer : styles.container}>
      {state.mentionsVisible && renderUserMentions()}
      {props.isEditMode ? renderEditComment() : renderAddNewComment()}

      {state.isAttachFileDialogVisible && renderAttachFileDialog()}
    </View>
  );
};

export default React.memo<any>(IssueCommentUpdate);