/* @flow */

import PushNotificationIOS from '@react-native-community/push-notification-ios';

import helper, {PushNotifications} from './push-notifications-helper';
import log from '../log/log';
import Router from '../router/router';
import {CUSTOM_ERROR_MESSAGE} from '../error/error-messages';
import {notify} from '../notification/notification';
import {targetAccountToSwitchTo} from '../../actions/app-actions-helper';

import type {StorageState} from '../storage/storage';
import type {TokenHandler} from '../../flow/Notification';

export default class PushNotificationsProcessor extends PushNotifications {

  static subscribeOnNotificationOpen(onSwitchAccount: (account: StorageState, issueId: string) => any) {
    PushNotificationIOS.removeEventListener('notification');
    PushNotificationIOS.addEventListener('notification', async (notification) => {
      const isClicked: boolean = notification.getData().userInteraction === 1;
      const data = `
      Title:  ${notification.getTitle()};\n
      Subtitle:  ${notification.getSubtitle()};\n
      Message: ${notification.getMessage()};\n
      badge: ${notification.getBadgeCount()};\n
      sound: ${notification.getSound()};\n
      category: ${notification.getCategory()};\n
      content-available: ${notification.getContentAvailable()};\n
      Notification is clicked: ${String(isClicked)}.`;

      if (!notification.getTitle()) {
        log.info('Silent push notification Received', data);
      } else {
        log.info('Push Notification Received', data);
        const issueId: ?string = helper.getIssueId(notification);
        if (issueId) {
          const targetBackendUrl = notification?.payload?.backendUrl;
          const targetAccount = await targetAccountToSwitchTo(targetBackendUrl);
          if (targetAccount) {
            await onSwitchAccount(targetAccount, issueId);
          } else if (issueId) {
            Router.Issue({issueId});
          }
        }
      }
    });
  }

  static unsubscribe() {
    PushNotificationIOS.removeEventListener('register');
    PushNotificationIOS.removeEventListener('registrationError');
    PushNotificationIOS.removeEventListener('notification');
  }

  static init() {
    let resolveToken: TokenHandler = () => {};
    let rejectToken: TokenHandler = () => {};

    this.deviceTokenPromise = new Promise<string>(
      (resolve: TokenHandler, reject: TokenHandler) => {
        resolveToken = resolve;
        rejectToken = reject;
      });

    PushNotificationIOS.addEventListener('register', (deviceToken: string) => {
      this.setDeviceToken(deviceToken);
      resolveToken(deviceToken);
    });

    PushNotificationIOS.addEventListener('registrationError', (error: Error) => {
      rejectToken('');
      notify(CUSTOM_ERROR_MESSAGE.PUSH_NOTIFICATION_REGISTRATION);
      log.warn('PushNotificationIOS registration failed', error);
    });

    PushNotificationIOS.requestPermissions().then(
      (data) => {
        log.info('PushNotificationIOS.requestPermissions', data);
      },
      (data) => {
        log.warn('PushNotificationIOS.requestPermissions failed', data);
      },
    );
  }
}