import 'dotenv/config'
import { mysqlDatabase } from '../src/adapters/mysql'
import { SyncOptions } from '../src/sync'
import { allowLocalIpAccess, denyLocalIpAccess } from './utils/aws'

const config: SyncOptions<any, any, any> = {
  from: mysqlDatabase(
    `mysql://movefast:${process.env.STAGING_RDS_ROOT_PASSWORD}@mysql-staging.cmvphaeswalt.us-east-1.rds.amazonaws.com:3306/customer_portal_staging`
  ),

  to: mysqlDatabase(
    `mysql://movefast:${process.env.STAGING_RDS_ROOT_PASSWORD}@mysql-staging.cmvphaeswalt.us-east-1.rds.amazonaws.com:3306/customer_portal_development`
  ),

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
    gift_card_campaign_plans: {},
    gift_card_campaigns: {},
    survey_email_notification_configs: {},
    survey_giveaways_configs: {},
    survey_home_banner_configs: {},
    survey_in_app_notification_configs: {},
    survey_package_description_configs: {},
    survey_push_notification_configs: {},
    survey_responses: {},
    survey_reward_coupons: {},
    survey_reward_subscription_boxes: {},
    surveys: {},
    versions: {},
    gift_card_templates: {},
    gift_cards: {},
    gift_card_transactions: {},
    coin_earnings: {},
    coin_spendings: {},
    loyalty_rewards: {},
    scheduled_survey_logs: {},
    scheduled_survey_queues: {},
    survey_notification_logs: {},
    survey_notification_queues: {},
    tier_benefits: {},
    tiers: {},
    wordpress_articles: {},
    xp_earnings: {},
    xp_reductions: {},
    coin_earning_locks: {},
    xp_earning_locks: {},
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
