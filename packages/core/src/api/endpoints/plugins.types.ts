import * as Db from 'src/db'
import { Settings } from '@dataden/sdk'

import { Common } from './common'
import { LocalPlugin, RegistryPlugin } from 'src/lib/PluginManager'
import { UpgradeInfo } from 'src/lib/PluginInstallationManager'

// Other

export namespace GetPlugins {
  export const path = '/v1.0/plugins'

  export type Response = Db.Plugins.Plugin[]
}

export namespace GetPluginUpdate {
  export const path = '/v1.0/plugins/:pluginId/update'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId) + '/update'

  export type RouteParams = Common.PluginParams

  export type Response = UpgradeInfo
}

export namespace PostPluginUpdate {
  export const path = '/v1.0/plugins/:pluginId/update'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId) + '/update'

  export type RouteParams = Common.PluginParams
}

export namespace PostInstallPlugin {
  export const path = '/v1.0/plugins/install'

  export type Body = RegistryPlugin | LocalPlugin
  export type Response = Db.Plugins.Plugin | string
}

export namespace DeletePlugin {
  export const path = '/v1.0/plugins/:pluginId'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId)

  export type RouteParams = Common.PluginParams
}

export namespace Reload {
  export const path = '/v1.0/plugins/reload'
}

export namespace PostForceSync {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/request-sync'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/request-sync'

  export type RouteParams = Common.PluginInstanceParams
}

// Management

export namespace GetPlugin {
  export const path = '/v1.0/plugins/:pluginId'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId)

  export type RouteParams = Common.PluginParams

  export type Response = Db.Plugins.Plugin
}

export namespace PutPlugin {
  export const path = '/v1.0/plugins/:pluginId'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId)

  export type RouteParams = Common.PluginParams
  export type Body = Db.Plugins.Plugin

  export type Response = Db.Plugins.Plugin | string
}

export namespace GetPluginInstanceSettings {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/settings'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/settings'

  export type RouteParams = Common.PluginInstanceParams

  export type Response = Settings
}

export namespace PutPluginInstanceSettings {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/settings'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/settings'

  export type RouteParams = Common.PluginInstanceParams
  export type Body = Settings

  export type Response = void
}
