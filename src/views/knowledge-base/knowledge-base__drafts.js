/* @flow */

import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View, FlatList, RefreshControl, Text, ActivityIndicator} from 'react-native';

import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import IconTrash from '@jetbrains/icons/trash.svg';
import KnowledgeBaseArticle from './knowledge-base__article';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import {confirmDeleteAllDrafts, confirmDeleteArticleDraft} from '../article/arcticle-helper';
import {deleteArticle} from '../article/arcticle-actions';
import {IconBack, IconKnowledgeBase} from '../../components/icon/icon';
import {loadArticlesDrafts} from './knowledge-base-actions';
import {SkeletonList} from '../../components/skeleton/skeleton';
import {until} from '../../util/util';
import {useDispatch} from 'react-redux';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './knowledge-base.styles';

import type {Article, ArticleNode} from '../../flow/Article';


const KnowledgeBaseDrafts = () => {
  const dispatch = useDispatch();
  const [drafts, updateDrafts] = useState(null);
  const [isLoading, updateLoading] = useState(false);
  const [isDeleting, updateDeleting] = useState(false);

  const loadDrafts = async () => {
    updateLoading(true);
    const drafts = await dispatch(loadArticlesDrafts());
    updateLoading(false);
    updateDrafts(drafts);
  };

  const deleteAllDrafts = async () => {
    if (drafts && drafts.length > 0) {
      confirmDeleteAllDrafts()
        .then(async () => {
          updateDeleting(true);
          await until(drafts.map((draft: Article) => dispatch(deleteArticle(draft))));
          updateDrafts([]);
          updateDeleting(false);
          loadDrafts();
        });
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const renderArticle = ({item}) => {
    return (
      <KnowledgeBaseArticle
        style={[
          styles.itemDraft,
          isDeleting ? styles.itemDraftDisabled : null
        ]}
        articleNode={{data: item}}
        onArticlePress={(article: Article) => Router.ArticleCreate({articleDraft: article})}
        onDelete={async (article: Article) => {
          if (!isDeleting) {
            confirmDeleteArticleDraft()
              .then(() => dispatch(deleteArticle(article, loadDrafts))).catch(() => {});
          }
        }}
      />
    );
  };

  return (
    <View style={styles.content}>
      <Header
        title={'Drafts'}
        showShadow={true}
        leftButton={(
          <TouchableOpacity onPress={() => !isDeleting && Router.pop()}>
            <IconBack color={isDeleting ? styles.icon.color : styles.link.color}/>
          </TouchableOpacity>
        )}
        rightButton={drafts && drafts.length > 0 ? (
          isDeleting
            ? <ActivityIndicator style={styles.iconTrash} color={styles.link.color}/>
            : <TouchableOpacity
              style={styles.iconTrash}
              onPress={deleteAllDrafts}
            >
              <IconTrash
                fill={styles.link.color}
                width={19}
                height={19}
              />
            </TouchableOpacity>
        ) : null}
      />

      {isLoading && !drafts && <SkeletonList/>}

      {!drafts || drafts.length === 0 && (
        <AnimatedView
          useNativeDriver
          duration={500}
          animation="fadeIn"
          style={styles.noDrafts}
        >
          <ErrorMessage errorMessageData={{
            title: 'No drafts yet',
            icon: () => <IconKnowledgeBase size={81}/>
          }}/>

          <TouchableOpacity
            style={styles.noDraftsButton}
            onPress={() => Router.ArticleCreate()}
          >
            <Text style={styles.noDraftsButtonText}>Start a new article</Text>
          </TouchableOpacity>
        </AnimatedView>
      )}

      {drafts && <FlatList
        testID="articleDrafts"
        data={drafts}
        refreshControl={<RefreshControl
          refreshing={false}
          tintColor={styles.link.color}
          onRefresh={loadDrafts}
        />}
        keyExtractor={(item: ArticleNode, index: number) => item?.id || index}
        getItemLayout={Select.getItemLayout}
        renderItem={renderArticle}
        ItemSeparatorComponent={Select.renderSeparator}
      />}
    </View>
  );
};

export default React.memo<any>(KnowledgeBaseDrafts);
