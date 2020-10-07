/* @flow */

import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';
import {issueCard, issueIdResolved} from '../common-styles/issue';
import {secondaryText} from '../common-styles/typography';

export default EStyleSheet.create({
  card: {
    flexDirection: 'row',
    marginLeft: UNIT * 2,
    borderRadius: UNIT,
    overflow: 'hidden',
    backgroundColor: '$boxBackground'
  },
  cardColorCoding: {
    flexShrink: 0,
    marginTop: UNIT / 4,
    marginBottom: UNIT / 4,
    width: UNIT / 2,
    borderTopLeftRadius: UNIT,
    borderBottomLeftRadius: UNIT
  },
  cardContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    padding: UNIT * 1.75,
  },
  cardContainerNotZoomed: {
    padding: UNIT,
  },
  cardContent: {
    flexDirection: 'column'
  },
  issueHeader: {
    flexDirection: 'row'
  },
  issueHeaderLeft: {
    flexGrow: 1,
  },
  issueContent: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  issueSummary: {
    flexGrow: 1,
    color: '$text'
  },
  ghost: {
    display: 'none'
  },
  dragging: {
    width: '80%',
    transform: [{rotate: '-3deg'}],
    borderWidth: 2,
    borderColor: '$iconAccent'
  },
  draggingZoomedOut: {
    width: '20%'
  },
  estimation: {
    marginRight: UNIT,
    ...secondaryText,
    color: '$icon'
  },
  summary: {
    flexGrow: 1,
    ...issueCard.issueSummary,
    marginTop: UNIT
  },
  issueId: {
    ...issueCard.issueId,
    color: '$icon'
  },
  issueIdResolved: {
    ...issueIdResolved
  },
  assignees: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  assignee: {
    marginLeft: UNIT / 2
  },
  tags: {
    flexGrow: 0,
    marginTop: UNIT
  },
  zoomedInText: {
    fontSize: 11
  }
});
