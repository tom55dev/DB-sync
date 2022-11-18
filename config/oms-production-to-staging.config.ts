import 'dotenv/config'
import { mysqlDatabase } from '../src/adapters/mysql'
import { SyncOptions } from '../src/sync'
import { allowLocalIpAccess, denyLocalIpAccess } from './utils/aws'

const config: SyncOptions<any, any, any> = {
  from: mysqlDatabase(
    `mysql://syncer:${process.env.PRODUCTION_RDS_SYNCER_PASSWORD}@movefast-llc.cmvphaeswalt.us-east-1.rds.amazonaws.com:3306/oms_production`
  ),

  to: mysqlDatabase(
    `mysql://movefast:${process.env.STAGING_RDS_ROOT_PASSWORD}@mysql-staging.cmvphaeswalt.us-east-1.rds.amazonaws.com:3306/oms_staging`
  ),

  async beforeSync(state) {
    try {
      state.fromRule = await allowLocalIpAccess({
        hostname: 'movefast-llc.cmvphaeswalt.us-east-1.rds.amazonaws.com',
        port: 3306
      })
      state.toRule = await allowLocalIpAccess({
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
      await denyLocalIpAccess(state.toRule)
    } catch (e) {
      console.error(e)
    }
  },

  collectionOptions: {
    activities: { skip: true },
    addon_group_items: {},
    addon_groups: {
      transformFields: {
        user_id: () => 1
      }
    },
    addon_order_items: { skip: true },
    addon_products: {},
    addon_renewals: { skip: true },
    addons: {
      transformFields: {
        user_id: () => 1
      }
    },
    ar_internal_metadata: { skip: true },
    automated_notes: { skip: true },
    box_item_products: {},
    box_items: {},
    boxes: {
      transformFields: {
        user_id: () => 1
      }
    },
    brand_shipping_method_mappings: {},
    comments: { skip: true },
    country_mappings: {},
    credit_notes: { skip: true },
    customers: { skip: true },
    data_exports: { skip: true },
    dhl_fuel_surcharges: {},
    dhl_invoice_uploads: {},
    ecms_invoice_uploads: {},
    invoice_coupons: { skip: true },
    invoice_disputes: { skip: true },
    invoices: { skip: true },
    old_passwords: { skip: true },
    order_inquiries: { skip: true },
    order_refunds: { skip: true },
    order_risks: { skip: true },
    order_shipment_entries: { skip: true },
    order_shipments: { skip: true },
    orders: { skip: true },
    plan_types: {},
    product_deliveries: {
      transformFields: {
        user_id: () => 1
      }
    },
    product_delivery_items: {},
    product_invoice_line_items: {},
    product_invoices: {},
    product_request_items: {},
    product_requests: {},
    product_suppliers: {},
    product_uploads: {
      transformFields: {
        user_id: () => 1
      }
    },
    product_variants: {},
    products: {},
    sanity_checks: { skip: true },
    sanity_problem_sources: { skip: true },
    sanity_problems: { skip: true },
    schema_migrations: {},
    settings: {},
    shipment_boxes: { skip: true },
    shipment_components: { skip: true },
    shipment_events: { skip: true },
    shipment_invoice_images: { skip: true },
    shipment_invoices: { skip: true },
    shipment_receipts: { skip: true },
    shipments: { skip: true },
    shipping_method_mappings: {},
    shipping_methods: {},
    shipping_method_fee_schedules: {},
    shipping_method_fees: {},
    shopify_customers: { skip: true },
    shopify_line_items: { skip: true },
    shopify_order_refunds: { skip: true },
    shopify_order_risks: { skip: true },
    shopify_order_shipment_reviews: { skip: true },
    shopify_order_shipments: { skip: true },
    shopify_orders: { skip: true },
    shopify_product_uploads: { skip: true },
    shopify_product_variants: { skip: true },
    shopify_products: { skip: true },
    shopify_tracking_numbers: { skip: true },
    sources: {},
    subscription_shipping_fees: {},
    subscriptions: { skip: true },
    suppliers: {
      transformFields: {
        contact_person: (_, item) => `鈴木${item.id} 太郎`,
        email: (_, item) => `dev+supplier${item.id}@movefast.xyz`,
        company_name: (_, item) => `㈱カンパニー${item.id}`,
        phone: () => '080-1111-1111'
      }
    },
    taggings: { skip: true },
    tags: { skip: true },
    tokyo_catch_order_boxes: { skip: true },
    tokyo_catch_order_shipments: { skip: true },
    tokyo_catch_orders: { skip: true },
    tokyo_catch_tracking_numbers: { skip: true },
    tokyo_catch_won_prizes: { skip: true },
    tracking_numbers: { skip: true },
    free_shipping_configs: {},
    shopify_free_shipping_configs: {},
    box_item_accessories: { skip:true },
    delivery_plan_batches: { skip: true },
    planned_batch_items: { skip:true },
    users: { skip: true }
  }
}

export default config
