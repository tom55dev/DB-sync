import { Command } from '@oclif/core'
import path from 'path'
import sync from '../src/sync'

class Sync extends Command {
  static args = [{ name: 'configFile' }]

  async run() {
    const { args } = await this.parse(Sync)
    const config = require(path.resolve(process.cwd(), args.configFile)).default

    await sync(config)
  }
}

Sync.run()
