import { Schedule, SyncInfo } from '@mydata/sdk'
import { response } from 'express'
import { ClientSession, MongoClient } from 'mongodb'
import { getClient, Plugins } from 'src/db'
import {
  PluginDefinition,
  loadPlugins,
  loadPluginById
} from 'src/lib/PluginManager'

const intervals: NodeJS.Timeout[] = []
const instances: PluginDefinition[] = []

export async function start() {
  const plugins = await loadPlugins()
  if (!plugins.length) {
    return
  }

  instances.push(...plugins)

  const client = await getClient()
  for (const plugin of plugins) {
    const settings = await Plugins.Settings.get(client, plugin.id)
    if (!settings) {
      console.warn(
        `[Scheduler] ${plugin.id} ❗️ Plugin can not start as it has not been configured`
      )
      continue
    }

    const interval = queueSchedule(client, plugin)

    intervals.push(interval)
  }
}

export async function stop() {
  while (instances.length > 0) instances.pop()
  intervals.forEach((interval) => clearInterval(interval))
}

export async function getInstance(pluginId: string): Promise<PluginDefinition> {
  const existingInstance = instances.find(
    (instance) => instance.id === pluginId
  )
  if (existingInstance) {
    return existingInstance
  }

  const instance = await loadPluginById(pluginId)
  if (!instance) {
    return null
  }

  response.send({
    id: pluginId,
    ...instance
  })
}

function queueSchedule(
  client: MongoClient,
  plugin: PluginDefinition
): NodeJS.Timeout {
  let isRunning = false

  async function maybeLoadData() {
    console.log(`[Scheduler] ${plugin.id}: Checking if sync is due`)
    const lastSync = await Plugins.Syncs.last(client, plugin.id)
    const settings = await Plugins.Settings.get(client, plugin.id)

    const syncDue = isSyncDue(new Date(), lastSync, settings.schedule)
    if (!syncDue) {
      console.log(`[Scheduler] ${plugin.id}: Sync not due yet`)
      return
    }

    console.log(`[Scheduler] ${plugin.id}: Will attempt sync`)

    if (isRunning) {
      console.warn(
        `[Scheduler] ${plugin.id}: ❗️ Last Sync is still in progress! Bailing.`
      )
      return
    }

    isRunning = true
    let dbSession: ClientSession = null
    try {
      console.log(`[Scheduler] ${plugin.id}: Will Load Data`)

      const result = await plugin.loadData(settings, { lastSync: lastSync })

      dbSession = client.startSession()
      await dbSession.withTransaction(async () => {
        await Plugins.Syncs.track(client, plugin.id, {
          date: result.lastDate
        })

        if (result.mode === 'append') {
          await Plugins.Data.append(client, plugin.id, result.data)
        } else if (result.mode === 'replace') {
          await Plugins.Data.replace(client, plugin.id, result.data)
        } else {
          throw `Unknown Result Mode: "${result.mode}"`
        }
      })

      console.log(`[Scheduler] ${plugin.id}: 👌 Data Load Finished`)
    } catch (e) {
      console.error(
        `[Scheduler] ${plugin.id}: ❗️ Data Load Failed with error.`,
        e
      )
    } finally {
      isRunning = false
      if (dbSession) {
        dbSession.endSession()
      }
    }
  }

  maybeLoadData()

  return setInterval(maybeLoadData, 30000)
}

function isSyncDue(now: Date, lastSync: SyncInfo, schedule: Schedule): boolean {
  const last = new Date(lastSync.date)

  const difference = new Date(now.valueOf() - last.valueOf())

  let minDifference = null
  switch (schedule.grain) {
    case 'week':
    case 'weeks': {
      minDifference = new Date(0, 0, schedule.every * 7)
      break
    }
    case 'day':
    case 'days': {
      minDifference = new Date(0, 0, schedule.every)
      break
    }
    case 'hour':
    case 'hours': {
      minDifference = new Date(0, 0, 0, schedule.every)
      break
    }
    case 'minute':
    case 'minutes': {
      minDifference = new Date(0, 0, 0, 0, schedule.every)
      break
    }
  }

  return minDifference <= difference
}
