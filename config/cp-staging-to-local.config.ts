import 'dotenv/config'
import { mysqlDatabase } from '../src/adapters/mysql'
import { SyncOptions } from '../src/sync'
import { allowLocalIpAccess, denyLocalIpAccess } from './utils/aws'

const config: SyncOptions<any, any, any> = {
  from: mysqlDatabase(
    `mysql://movefast:${process.env.STAGING_RDS_ROOT_PASSWORD}@mysql-staging.cmvphaeswalt.us-east-1.rds.amazonaws.com:3306/customer_portal_staging`
  ),

  to: mysqlDatabase(`mysql://root:@localhost/tokyotreat_cp_dev`),

  async beforeSync(state) {
    try {
      state.fromRule = await allowLocalIpAccess({
        hostname: 'mysql-staging.cmvphaeswalt.us-east-1.rds.amazonaws.com',
        port: 3306
      })
    } catch (e) {
      console.error(e)
    }
  },

  async afterSync(state) {
    try {
      await denyLocalIpAccess(state.fromRule)
    } catch (e) {
      console.error(e)
    }
  },

  collectionOptions: {
    addresses: {},
    app_settings: {},
    ar_internal_metadata: {},
    auth_tokens: {},
    authentications: {},
    boxes: {},
    bulk_notifications: {},
    churns: {},
    custom_notifications: {},
    customers: {},
    favorites: {},
    feedbacks: {},
    gifts: {},
    lootly_coupons: {},
    notifications: {},
    pending_credits: {},
    reward_template_steps: {},
    reward_templates: {},
    rewards: {},
    schema_migrations: {},
    settings: {},
    streak_rewards: {},
    streaks: {},
    subscriptions: {},
    tracking_numbers: {},
    triggered_rewards: {},
    waitlist_items: {},
    private_beta_invitations: {},
    special_offer_notifications: {},
    fcm_tokens: {},
    minimum_amounts: {},
    pending_coins: {},
    search_keywords: {},
    tags: {},
    ticket_attributes: {},
    users: {
      skip: false,
      transformFields: {
        // password: kokoroda
        encrypted_password: () => '$2a$11$xLlTmByr6signynyPCofs.TG1SP06OX2WjL5pRtRk5SdgjqhMcRly'
      }
    }
  }
}

export default config
