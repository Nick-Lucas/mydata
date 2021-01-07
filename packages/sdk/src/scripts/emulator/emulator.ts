import express from 'express'
import chalk from 'chalk'

import {
  getOutputFilePath,
  loadAndMergeSettings,
  runPlugin,
  writeJson
} from './files'
import { getAuthResult } from './auth'

export interface RunOptions {
  inputFile: string
  settings: string
  output: string
  loader: number
  skipBuild: boolean
}

export async function run({
  inputFile,
  settings: settingsPath,
  output,
  loader: loaderIndex
}: RunOptions) {
  const plugin = runPlugin(inputFile)
  const settings = await loadAndMergeSettings(plugin, settingsPath)

  const tokens = await getAuthResult(plugin, settings)

  console.log('Tokens recieved', tokens)

  console.log('TEST: exiting')
  throw 'EXIT'

  for (let l = 0; l < plugin.loaders.length; l++) {
    if (loaderIndex >= 0 && l !== loaderIndex) {
      continue
    }

    const { name, load } = plugin.loaders[l]
    console.log('')
    console.log(chalk.gray('_______'))
    console.log(chalk.green('Running loader'), name)

    try {
      const payload = await load(
        settings,
        {
          lastSync: { date: new Date(0).toISOString(), success: false },
          auth: {
            /* TODO: include auth credentials */
          }
        },
        console
      )

      const outputFilePath = getOutputFilePath(name, output)
      console.log(chalk.green('Writing result to'), outputFilePath)

      writeJson(outputFilePath, payload)
    } catch (e) {
      console.error(chalk.red('Loader', name, 'failed with', String(e)))
    }

    console.log(chalk.gray('_______'))
  }
}
