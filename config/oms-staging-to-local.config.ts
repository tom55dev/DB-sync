import 'dotenv/config'
import { mysqlDatabase } from '../src/adapters/mysql'
import { SyncOptions } from '../src/sync'
import { allowLocalIpAccess, denyLocalIpAccess } from './utils/aws'

const config: SyncOptions<any, any, any> = {
  from: mysqlDatabase(
    `mysql://movefast:${process.env.STAGING_RDS_ROOT_PASSWORD}@mysql-staging.cmvphaeswalt.us-east-1.rds.amazonaws.com:3306/oms_staging`
  ),

  to: mysqlDatabase(`mysql://root:@localhost/oms_dev`),

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
    activities: {},
    addon_group_items: {},
    addon_groups: {},
    addon_order_items: {},
    addon_products: {},
    addon_renewals: {},
    addons: {},
    ar_internal_metadata: {},
    automated_notes: {},
    box_item_products: {},
    box_items: {},
    boxes: {},
    brand_shipping_method_mappings: {},
    bulk_actions: {},
    bulk_action_items: {},
    comments: {},
    country_mappings: {},
    credit_notes: {},
    customers: {},
    data_exports: {},
    dhl_fuel_surcharges: {},
    invoice_coupons: {},
    invoice_disputes: {},
    invoices: {},
    old_passwords: {},
    order_inquiries: {},
    order_refunds: {},
    order_risks: {},
    order_shipment_entries: {},
    order_shipments: {},
    orders: {},
    permissions: {},
    permittings: {},
    plan_types: {},
    product_deliveries: {},
    product_delivery_items: {},
    product_invoice_line_items: {},
    product_invoices: {},
    product_request_items: {},
    product_requests: {},
    product_suppliers: {},
    product_uploads: {},
    product_variants: {},
    products: {},
    roles: {},
    sanity_checks: {},
    sanity_problem_sources: {},
    sanity_problems: {},
    schema_migrations: {},
    settings: {},
    shipment_boxes: {},
    shipment_components: {},
    shipment_events: {},
    shipment_invoice_images: {},
    shipment_invoice_uploads: {},
    shipment_invoices: {},
    shipment_receipts: {},
    shipments: {},
    shipping_method_mappings: {},
    shopify_customers: {},
    shopify_line_items: {},
    shopify_order_refunds: {},
    shopify_order_risks: {},
    shopify_order_shipment_reviews: {},
    shopify_order_shipments: {},
    shopify_orders: {},
    shopify_product_uploads: {},
    shopify_product_variants: {},
    shopify_products: {},
    shopify_tracking_numbers: {},
    sources: {},
    subscription_shipping_fees: {},
    subscriptions: {},
    suppliers: {},
    taggings: {},
    tags: {},
    tokyo_catch_order_boxes: {},
    tokyo_catch_order_shipments: {},
    tokyo_catch_orders: {},
    tokyo_catch_tracking_numbers: {},
    tokyo_catch_won_prizes: {},
    tracking_numbers: {},
    free_shipping_configs: {},
    shopify_free_shipping_configs: {},
    box_item_accessories: {},
    delivery_plan_batches: {},
    planned_batch_items: {},
    shipping_methods: {},
    shipping_method_fee_schedules: {},
    shipping_method_fees: {},
    shipment_management_sheet_uploads: { skip: true },
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
