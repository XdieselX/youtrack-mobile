/* @flow */

import React from 'react';

import {Text} from 'react-native';

import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { idea, darcula } from 'react-syntax-highlighter/dist/styles';

import entities from 'entities';
import Router from '../router/router';

import {isAndroidPlatform} from '../../util/util';
import {showMoreText} from '../text-view/text-view';
import {monospaceFontAndroid, monospaceFontIOS, SECONDARY_FONT_SIZE} from '../common-styles/typography';

import styles from './youtrack-wiki.styles';

import type {Node as $IMPORTED_TYPE$_Node} from 'React';
import type {UITheme} from '../../flow/Theme';

const isAndroid: boolean = isAndroidPlatform();
const MAX_CODE_LENGTH: number = 630;

type Node = { content?: string, children?: any };

function getCodeData(node: Node) {
  let code = node.content || (node?.children || []).map(it => it.data).join('\n') || '';
  code = code.replace(/(\n){4,}/g, '\n\n').replace(/[ \t]+$/g, '');

  const isTooLongCode = code.length > MAX_CODE_LENGTH; //https://github.com/facebook/react-native/issues/19453

  return {
    code: isTooLongCode ? `${code.substr(0, MAX_CODE_LENGTH)}… ` : code,
    fullCode: code,
    isLongCode: isTooLongCode,
  };
}

function onShowFullCode(code: string) {
  Router.WikiPage({
    plainText: code,
  });
}

function renderCode(node: Node, language?: ?string, uiTheme: UITheme): $IMPORTED_TYPE$_Node {
  const codeData = getCodeData(node);
  const separator = <Text>{'\n'}</Text>;
  const codeStyle = uiTheme.dark ? darcula : idea;

  for (const i in codeStyle) {
    codeStyle[i].lineHeight = '1.25em';
  }

  return (
    <Text>
      <SyntaxHighlighter
        highlighter="hljs"
        language={language}
        PreTag={Text}
        CodeTag={Text}

        style={{
          ...codeStyle,
          ...{
            hljs: {
              backgroundColor: 'transparent',
              color: uiTheme.colors.$text,
            },
          },
        }}
        fontSize={SECONDARY_FONT_SIZE}
        fontFamily={isAndroid ? monospaceFontAndroid : monospaceFontIOS}
      >
        {entities.decodeHTML(codeData.code)}
      </SyntaxHighlighter>

      {codeData.isLongCode && separator}
      {codeData.isLongCode && (
        <Text
          onPress={() => codeData.isLongCode && onShowFullCode(codeData.fullCode)}
          style={styles.showMoreLink}
        >{` ${showMoreText} `}</Text>
      )}
    </Text>
  );
}

export default renderCode;
