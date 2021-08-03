/* @flow */

import React, {Component} from 'react';
import {ScrollView, View, ActivityIndicator} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as createIssueActions from './create-issue-actions';
import AttachFileDialog from '../../components/attach-file/attach-file-dialog';
import AttachmentAddPanel from '../../components/attachments-row/attachments-add-panel';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import Header from '../../components/header/header';
import KeyboardSpacerIOS from '../../components/platform/keyboard-spacer.ios';
import SummaryDescriptionForm from '../../components/form/summary-description-form';
import TagAddPanel from '../../components/tags/tag-add-panel';
import TagAddSelect from '../../components/tags/tag-add-select';
import Tags from '../../components/tags/tags';
import usage from '../../components/usage/usage';
import VisibilityControl from '../../components/visibility/visibility-control';
import {ANALYTICS_ISSUE_CREATE_PAGE} from '../../components/analytics/analytics-ids';
import {getApi} from '../../components/api/api__instance';
import {IconCheck, IconClose} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {Attachment, CustomField, IssueProject, Tag} from '../../flow/CustomFields';
import type {AttachmentActions} from '../../components/attachments-row/attachment-actions';
import type {CreateIssueState} from './create-issue-reducers';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';

import styles from './create-issue.styles';


type AdditionalProps = {
  issuePermissions: IssuePermissions,
  predefinedDraftId: ?string,
  onAddTags: (tags: Array<Tag>) => () => Promise<void>
};

type Props = CreateIssueState & typeof createIssueActions & AttachmentActions & AdditionalProps;

type State = {
  showAddTagSelect: boolean
};

class CreateIssue extends Component<Props, State> {
  uiTheme: UITheme;
  state = {showAddTagSelect: false};

  constructor(props) {
    super(props);
    usage.trackScreenView(ANALYTICS_ISSUE_CREATE_PAGE);
  }

  UNSAFE_componentWillMount() {
    this.props.initializeWithDraftOrProject(this.props.predefinedDraftId);
  }

  onAddAttachment = async (attach: Attachment, onAttachingFinish: () => any) => {
    const {uploadAttach, loadAttachments} = this.props;
    await uploadAttach(attach);
    onAttachingFinish();
    loadAttachments();
  };

  cancelAddAttach = () => {
    const {cancelAddAttach, hideAddAttachDialog, attachingImage} = this.props;
    cancelAddAttach(attachingImage);
    hideAddAttachDialog();
  };

  renderAttachFileDialog = (): React$Element<typeof AttachFileDialog> | null => {
    const {issue} = this.props;

    if (!issue || !issue.id) {
      return null;
    }

    return (
      <AttachFileDialog
        getVisibilityOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
        actions={{
          onAttach: this.onAddAttachment,
          onCancel: this.cancelAddAttach,
        }}
      />
    );
  };

  canUpdateField = (field: CustomField) => this.props.issuePermissions.canUpdateField(this.props.issue, field);

  canCreateIssueToProject = (project: IssueProject) => this.props.issuePermissions.canCreateIssueToProject(project);

  onFieldUpdate = async (field: CustomField, value: any) => await this.props.updateFieldValue(field, value);

  onUpdateProject = async (project: IssueProject) => await this.props.updateProject(project);

  renderCustomFieldPanel() {
    const {issue} = this.props;

    return <CustomFieldsPanel
      analyticsId={ANALYTICS_ISSUE_CREATE_PAGE}
      autoFocusSelect
      testID="createIssueFields"

      issueId={issue.id}
      issueProject={issue.project}
      fields={issue.fields}

      hasPermission={{
        canUpdateField: this.canUpdateField,
        canCreateIssueToProject: this.canCreateIssueToProject,
        canEditProject: true,
      }}

      onUpdate={this.onFieldUpdate}
      onUpdateProject={this.onUpdateProject}

      uiTheme={this.uiTheme}
    />;
  }

  renderIssueVisibility() {
    const {issue, updateVisibility} = this.props;
    return (
      <View style={styles.visibility}>
        <VisibilityControl
          visibility={issue.visibility}
          onSubmit={updateVisibility}
          uiTheme={this.uiTheme}
          getOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
        />
      </View>
    );
  }

  render() {
    const {
      storeDraftAndGoBack,
      setIssueSummary,
      setIssueDescription,
      createIssue,
      issue,
      attachingImage,
      processing,
      removeAttachment,
      showAddAttachDialog,
      isAttachFileDialogVisible,
    } = this.props;

    const isAttaching = attachingImage !== null;
    const isProcessing = processing || isAttaching;
    const canCreateIssue = issue.summary && issue?.project?.id && !isProcessing;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;
          const uiThemeColors: UIThemeColors = this.uiTheme.colors;
          const hasProject: boolean = !!issue?.project?.id;

          const rightButton = (
            processing
              ? <ActivityIndicator color={uiThemeColors.$link}/>
              : <IconCheck size={20} color={canCreateIssue ? uiThemeColors.$link : uiThemeColors.$disabled}/>
          );
          return (
            <View
              testID="createIssue"
              style={styles.container}
            >
              <Header
                title="New Issue"
                showShadow={true}
                leftButton={<IconClose size={21} color={uiThemeColors.$link}/>}
                onBack={storeDraftAndGoBack}
                rightButton={rightButton}
                onRightButtonClick={() => canCreateIssue && createIssue()}/>

              {this.renderCustomFieldPanel()}

              {hasProject && this.renderIssueVisibility()}

              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
              >
                <SummaryDescriptionForm
                  analyticsId={ANALYTICS_ISSUE_CREATE_PAGE}
                  testID="createIssueSummary"
                  style={styles.issueSummary}
                  summary={issue.summary}
                  description={issue.description}
                  editable={!processing}
                  onSummaryChange={setIssueSummary}
                  onDescriptionChange={setIssueDescription}
                />

                {hasProject && (
                  <>
                    <View style={styles.separator}/>
                    <View
                      testID="createIssueAttachments"
                      style={[styles.additionalData, styles.issueAttachments]}
                    >
                      <AttachmentsRow
                        attachments={issue.attachments}
                        attachingImage={attachingImage}
                        imageHeaders={getApi().auth.getAuthorizationHeaders()}
                        canRemoveAttachment={true}
                        onRemoveImage={removeAttachment}
                        uiTheme={this.uiTheme}
                      />
                    </View>
                  </>
                )}

                {hasProject && (
                  <View
                    testID="createIssueAttachments"
                    style={styles.additionalData}
                  >
                    <AttachmentAddPanel
                      isDisabled={processing}
                      showAddAttachDialog={showAddAttachDialog}
                    />
                  </View>
                )}

                <View style={styles.separator}/>

                {hasProject && (
                  <View
                    testID="createIssueAttachments"
                    style={styles.additionalData}
                  >
                    {!!issue.tags && (
                      <Tags
                        tags={issue.tags}
                        multiline={true}
                      />
                    )}
                    {!!issue.project?.id && (
                      <TagAddPanel
                        disabled={processing}
                        onAdd={() => this.setState({showAddTagSelect: true})}
                      />
                    )}
                    {this.state.showAddTagSelect && <TagAddSelect
                      existed={issue?.tags}
                      projectId={issue.project?.id}
                      onAdd={(tags: Array<Tag>) => this.props.onAddTags(tags)}
                      onHide={() => this.setState({showAddTagSelect: false})}
                    />}
                  </View>
                )}

              </ScrollView>

              <KeyboardSpacerIOS/>

              {isAttachFileDialogVisible && this.renderAttachFileDialog()}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.creation,
    predefinedDraftId: ownProps.predefinedDraftId,
    issuePermissions: state.app.issuePermissions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(createIssueActions, dispatch),
    onAddTags: (tags: Array<Tag>) => dispatch(createIssueActions.updateIssueDraft(true, {tags})),
  };
};

export default (connect(mapStateToProps, mapDispatchToProps)(CreateIssue): any);
