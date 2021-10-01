/* @flow */

import type {AuthConfig} from './Auth';

export type AppConfig = {
  backendUrl: string,
  auth: AuthConfig,
  statisticsEnabled: boolean,
  version: string
};

export type EndUserAgreement = {
  enabled: boolean,
  text: string,
  majorVersion: number,
  minorVersion: number
}
