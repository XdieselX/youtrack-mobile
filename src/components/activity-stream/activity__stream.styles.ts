import EStyleSheet from 'react-native-extended-stylesheet';
import {mainText, secondaryText} from 'components/common-styles/typography';
import {separator} from '../common-styles/list';
import {UNIT} from 'components/variables';
const secondaryTextColor = {
  color: '$icon',
};
export const rowStyles = {
  activity: {
    flexDirection: 'row',
    paddingTop: UNIT,
    paddingLeft: UNIT,
    paddingRight: UNIT,
    backgroundColor: '$background',
  },
  activityMerged: {
    marginBottom: 0,
    paddingTop: UNIT * 3,
  },
  activitySeparator: {
    ...separator,
    borderColor: '$separator',
    marginTop: UNIT * 3,
    marginBottom: UNIT * 2,
    marginLeft: UNIT * 7,
    marginRight: -UNIT,
  },
  activityAvatar: {
    width: UNIT * 4,
    height: UNIT * 4,
    alignItems: 'center',
  },
  activityAuthor: {
    color: '$textSecondary',
    flexDirection: 'row',
    marginTop: UNIT / 2,
    marginBottom: UNIT / 4,
  },
  activityStream: {
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 3,
    paddingHorizontal: UNIT,
  },
  activityItem: {
    flex: 1,
    marginLeft: UNIT * 2,
  },
  activityAuthorName: {
    flexGrow: 1,
    flexShrink: 0,
    marginRight: UNIT / 2,
    ...secondaryTextColor,
    fontSize: 18,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: -0.22,
    color: '$text',
  },
  activityTimestamp: {...secondaryText, color: '$icon', lineHeight: 16},
  activityLabel: {
    color: '$icon',
  },
  activityText: {
    color: '$icon',
  },
  activityRelatedChanges: {
    flex: 1,
    padding: UNIT * 2,
    paddingTop: UNIT,
    marginTop: UNIT * 1.5,
    marginBottom: UNIT,
    backgroundColor: '$boxBackground',
    borderRadius: UNIT,
    lineHeight: 14,
  },
  activityHistoryChanges: {
    flex: 1,
    lineHeight: 14,
  },
  activityChange: {
    marginTop: UNIT / 2,
  },
  activityNoActivity: {
    marginTop: UNIT * 5,
    textAlign: 'center',
    ...secondaryTextColor,
  },
  activityAdded: {
    color: '$icon',
  },
  activityRemoved: {
    textDecorationLine: 'line-through',
    color: '$icon',
  },
  activityTextValueChange: {
    flexGrow: 2,
  },
  activityCommentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: UNIT * 2,
  },
  activityCommentActionsMain: {
    flexGrow: 1,
  },
  activityCommentActionsAddReaction: {
    color: '$iconAccent',
    marginRight: UNIT * 2,
  },
  activityCommentActionsOther: {
    color: '$iconAccent',
  },
  activityCommentDate: {
    marginTop: UNIT * 2,
  },
  activityCommentReactions: {
    alignItems: 'center',
    width: '100%',
  },
  activityCommentAttachments: {
    marginVertical: UNIT,
  },
  activityIcon: {
    color: '$iconAccent',
  },
  link: {...secondaryText, color: '$link'},
  secondaryTextColor: secondaryTextColor,
  activityVisibility: {
    marginTop: UNIT,
    marginBottom: UNIT,
  },
  activityWork: {
    flexDirection: 'row',
  },
  activityWorkIcon: {
    position: 'relative',
    top: -2,
  },
  activityStarTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityWorkTime: {
    marginLeft: UNIT / 2,
    color: '$icon',
    fontWeight: 'bold',
  },
  activityWorkComment: {
    marginTop: UNIT,
  },
  activityWorkEditIcon: {
    position: 'absolute',
    right: 0,
  },
  activityHighlighted: {
    backgroundColor: '$yellowBackground',
  },
  vcsInfo: {
    flexDirection: 'row',
  },
  vcsInfoDate: {
    flexShrink: 1,
    flexGrow: 1,
    marginRight: UNIT * 2,
  },
  showMoreMessage: {
    marginTop: UNIT,
  },
  vcsMessage: {
    paddingTop: UNIT,
    color: '$text',
  },
  vcsError: {
    color: '$error',
  },
  vcsSourceButton: {
    marginVertical: UNIT,
    marginLeft: UNIT * 3,
    ...mainText,
    color: '$link',
  },
  vcsSourceButtonIcon: {
    paddingRight: UNIT / 2,
    marginRight: UNIT * 2,
  },
  vcsSourceSubTitle: {
    fontSize: 12,
    color: '$icon',
  },
  contextMenu: {
    flexDirection: 'row',
    padding: UNIT / 2,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  contextMenuItem: {
    padding: UNIT,
    minWidth: 160,
    paddingRight: 0,
    color: '$text',
  },
  contextMenuItemDestructive: {
    color: '$error',
  },
  contextMenuItemIcon: {
    width: UNIT * 2,
    height: UNIT * 2,
  },
  contextMenuTitle: {
    paddingHorizontal: UNIT * 2.5,
    maxHeight: 200,
    borderBottomWidth: 1,
    borderColor: '$separator',
  },
  contextMenuTitleItem: {
    paddingTop: UNIT,
    paddingBottom: UNIT * 1.5,
    ...secondaryText,
  },
};
export default EStyleSheet.create(rowStyles);
