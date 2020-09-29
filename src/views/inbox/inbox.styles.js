import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../../components/variables/variables';
import {headerTitle, mainText, secondaryText} from '../../components/common-styles/typography';
import {issueIdResolved} from '../../components/common-styles/issue';

const font = {
  lineHeight: 18,
  fontSize: 14,
};

const textSecondary = {
  ...font,
  color: '$border'
};

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  arrowImage: {
    lineHeight: 22
  },
  notification: {
    paddingLeft: UNIT * 2,
  },
  notificationContent: {
    marginLeft: UNIT * 6,
    paddingBottom: UNIT * 2,
    paddingRight: UNIT * 2,
    borderBottomColor: '$separator',
    borderBottomWidth: 0.5,
  },
  notificationIssue: {
    marginTop: -UNIT,
  },
  notificationIssueInfo: {
    ...mainText,
    fontWeight: '500',
    color: '$text'
  },
  reason: {
    ...secondaryText,
    paddingRight: UNIT,
    color: '$icon',
  },
  notificationChange: {
    marginTop: UNIT * 2,
    marginRight: -UNIT,
    marginBottom: UNIT * 2.5,
    padding: UNIT * 1.5,
    paddingRight: UNIT * 2,
    borderRadius: UNIT,
    backgroundColor: '$boxBackground'
  },
  notificationContentWorkflow: {
    marginTop: UNIT,
    marginLeft: 0
  },
  userInfo: {
    marginTop: UNIT,
    paddingTop: UNIT * 1.5
  },
  textPrimary: {
    ...font,
    color: '$icon'
  },
  textSecondary,
  listMessageSmile: {
    paddingTop: UNIT * 6,
    fontSize: 40,
    fontWeight: '500',
    color: '$icon',
    textAlign: 'center',
    letterSpacing: -2
  },
  listFooterMessage: {
    ...mainText,
    color: '$text',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: UNIT * 4
  },
  change: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  changeItem: {
    marginTop: UNIT
  },
  changeRemoved: {
    textDecorationLine: 'line-through'
  },
  headerTitle: {
    paddingTop: UNIT * 2,
    paddingLeft: UNIT * 2,
    paddingBottom: UNIT * 2,
    backgroundColor: '$background',
  },
  headerTitleText: {
    ...headerTitle,
    color: '$text'
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    ...font,
    color: '$link'
  },
  resolved: {
    ...issueIdResolved
  }

});
