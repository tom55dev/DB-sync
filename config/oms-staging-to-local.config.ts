import 'dotenv/config'
import { mysqlDatabase } from '../src/adapters/mysql'
import { SyncOptions } from '../src/sync'
import { allowLocalIpAccess, denyLocalIpAccess } from './utils/aws'

const config: SyncOptions<any, any, any> = {
  from: mysqlDatabase(
    `mysql://movefast:${process.env.STAGING_RDS_ROOT_PASSWORD}@mysql-staging.cmvphaeswalt.us-east-1.rds.amazonaws.com:3306/oms_staging`
  ),

  to: mysqlDatabase(
    `mysql://root:@localhost/oms_dev`
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
    activities: { skip: false },
    addon_group_items: {},
    addon_groups: {
      transformFields: {
        user_id: () => 1
      }
    },
    addon_order_items: { skip: false },
    addon_products: {},
    addon_renewals: { skip: false },
    addons: {
      transformFields: {
        user_id: () => 1
      }
    },
    ar_internal_metadata: { skip: false },
    automated_notes: { skip: false },
    box_item_products: {},
    box_items: {},
    boxes: {
      transformFields: {
        user_id: () => 1
      }
    },
    brand_shipping_method_mappings: {},
    comments: { skip: false },
    country_mappings: {},
    credit_notes: { skip: false },
    customers: { skip: false },
    data_exports: { skip: false },
    dhl_fuel_surcharges: {},
    dhl_invoice_uploads: {},
    ecms_invoice_uploads: {},
    invoice_coupons: { skip: false },
    invoice_disputes: { skip: false },
    invoices: { skip: false },
    old_passwords: { skip: false },
    order_inquiries: { skip: false },
    order_refunds: { skip: false },
    order_risks: { skip: false },
    order_shipment_entries: { skip: false },
    order_shipments: { skip: false },
    orders: { skip: false },
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
    sanity_checks: { skip: false },
    sanity_problem_sources: { skip: false },
    sanity_problems: { skip: false },
    schema_migrations: {},
    settings: {},
    shipment_boxes: { skip: false },
    shipment_components: { skip: false },
    shipment_events: { skip: false },
    shipment_invoice_images: { skip: false },
    shipment_invoices: { skip: false },
    shipment_receipts: { skip: false },
    shipments: { skip: false },
    shipping_method_mappings: {},
    shopify_customers: { skip: false },
    shopify_line_items: { skip: false },
    shopify_order_refunds: { skip: false },
    shopify_order_risks: { skip: false },
    shopify_order_shipment_reviews: { skip: false },
    shopify_order_shipments: { skip: false },
    shopify_orders: { skip: false },
    shopify_product_uploads: { skip: false },
    shopify_product_variants: { skip: false },
    shopify_products: { skip: false },
    shopify_tracking_numbers: { skip: false },
    sources: {},
    subscription_shipping_fees: {},
    subscriptions: { skip: false },
    suppliers: {},
    taggings: { skip: false },
    tags: { skip: false },
    tokyo_catch_order_boxes: { skip: false },
    tokyo_catch_order_shipments: { skip: false },
    tokyo_catch_orders: { skip: false },
    tokyo_catch_tracking_numbers: { skip: false },
    tokyo_catch_won_prizes: { skip: false },
    tracking_numbers: { skip: false },
    users: {
      skip: false,
      transformFields: {
        encrypted_password: () => "$2a$11$xLlTmByr6signynyPCofs.TG1SP06OX2WjL5pRtRk5SdgjqhMcRly"
      }
    }
  }
}

export default config