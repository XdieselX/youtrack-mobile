import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import * as articleActions from './arcticle-actions';
import ArticleActivityStream from './article__activity-stream';
import ArticleAddComment from './article__add-comment';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import KeyboardSpacerIOS from 'components/platform/keyboard-spacer.ios';
import {convertCommentsToActivityPage, createActivityModel} from 'components/activity/activity-helper';

import type {Activity} from 'types/Activity';
import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {IssueComment} from 'types/CustomFields';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';

interface Props {
  article: Article;
  issuePermissions: IssuePermissions;
  renderRefreshControl: (
    onRefresh: (...args: any[]) => any,
  ) => React.ReactElement<React.ComponentProps<any>, any>;
  uiTheme: UITheme;
  onCheckboxUpdate?: (articleContent: string) => (...args: any[]) => any;
  highlight?: {
    activityId: string;
    commentId?: string;
  };
}


const ArticleActivities = (props: Props) => {
  const {article, uiTheme, renderRefreshControl, issuePermissions} = props;
  const dispatch: (...args: any[]) => any = useDispatch();

  const activityPage: Activity[] | null = useSelector((state: AppState) => state.article.activityPage);
  const articleCommentDraft: IssueComment | null = useSelector(
    (state: AppState) => state.article.articleCommentDraft,
  );
  const currentUser: User | null = useSelector((state: AppState) => state.app.user);
  const user: User | null = useSelector((state: AppState) => state.app.user);

  const [activities, updateActivityModel] = useState<Activity[] | null>(null);

  const refreshActivities: (...args: any[]) => any = useCallback(
    (reset?: boolean) => dispatch(articleActions.loadActivitiesPage(reset)),
    [dispatch],
  );

  const loadActivities: (...args: any[]) => any = useCallback(
    (reset: boolean) => {
      if (article?.idReadable) {
        dispatch(articleActions.loadCachedActivitiesPage());
        refreshActivities(reset);
      }
    },
    [article?.idReadable, dispatch, refreshActivities],
  );

  const isNaturalSortOrder: boolean = !!user?.profiles?.appearance?.naturalCommentsOrder;
  const doCreateActivityModel = useCallback(
    (activitiesPage: Activity[]): void => {
      updateActivityModel(
        createActivityModel(activitiesPage, isNaturalSortOrder),
      );
    },
    [isNaturalSortOrder],
  );

  useEffect(() => {
    loadActivities(false);
  }, [loadActivities]);

  useEffect(() => {
    if (activityPage) {
      doCreateActivityModel(activityPage);
    }
  }, [activityPage, doCreateActivityModel, user?.profiles?.appearance]);

  const updateActivities = (comment: IssueComment): void => {
    const commentActivity: (Activity & { tmp?: boolean })[] = [{
      ...convertCommentsToActivityPage([comment])[0],
      tmp: true,
      timestamp: Date.now(),
      author: currentUser as User,
    }];
    doCreateActivityModel(
      isNaturalSortOrder
        ? activityPage.concat(commentActivity)
        : commentActivity.concat(activityPage),
    );
  };

  return (
    <>
      <ArticleActivityStream
        article={article}
        activities={activities}
        attachments={article?.attachments}
        uiTheme={uiTheme}
        user={user}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          comment: IssueComment,
        ) => dispatch(articleActions.updateArticleComment(comment))}
        refreshControl={() => renderRefreshControl(() => loadActivities(false))}
        highlight={props.highlight}
      />
      {issuePermissions.articleCanCommentOn(article) && (
        <>
          <ArticleAddComment
            article={article}
            comment={articleCommentDraft}
            onCommentChange={(
              comment: IssueComment,
            ): ((...args: any[]) => any) =>
              dispatch(articleActions.updateArticleCommentDraft(comment))
            }
            onSubmitComment={async (
              comment: IssueComment,
            ): Promise<void> => {
              updateActivities(comment);
              await dispatch(articleActions.submitArticleCommentDraft(comment));
              refreshActivities(false);
              return Promise.resolve();
            }}
            issuePermissions={issuePermissions}
          />
          <KeyboardSpacerIOS top={98}/>
        </>
      )}
    </>
  );
};

export default React.memo<Props>(ArticleActivities);
