import * as config from './config'
import * as api from './api'
import { Scheduler } from './lib/Scheduler'

config.validate()

api.start()

Scheduler.start()
