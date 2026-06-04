import { AdminPageHeader } from "@/components/admin/page-header";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import {
  STORE_SETTING_KEYS,
  getStoreSettings,
} from "@/server/repositories/admin/settings.repository";
import { siteConfig } from "@/config/site";
import { listShippingZones } from "@/server/actions/admin/shipping-zones.actions";
import { ShippingZonesForm } from "@/components/admin/shipping-zones-form";

export default async function AdminSettingsPage() {
  const [raw, shippingZones] = await Promise.all([
    getStoreSettings(Object.values(STORE_SETTING_KEYS)),
    listShippingZones(),
  ]);

  const str = (key: string, fallback = "") =>
    typeof raw[key] === "string" ? (raw[key] as string) : fallback;

  const values = {
    storeName: str(STORE_SETTING_KEYS.storeName, siteConfig.name),
    storeEmail: str(STORE_SETTING_KEYS.storeEmail, "contacto@re-uso.cl"),
    storePhone: str(STORE_SETTING_KEYS.storePhone, ""),
    socialInstagram: str(STORE_SETTING_KEYS.socialInstagram, siteConfig.links.instagram),
    socialFacebook: str(STORE_SETTING_KEYS.socialFacebook, siteConfig.links.facebook),
    seoTitle: str(STORE_SETTING_KEYS.seoTitle, siteConfig.name),
    seoDescription: str(STORE_SETTING_KEYS.seoDescription, siteConfig.description),
    analyticsId: str(STORE_SETTING_KEYS.analyticsId, ""),
  };

  return (
    <div>
      <AdminPageHeader
        title="Configuración"
        description="Ajustes globales de la tienda"
      />
      <StoreSettingsForm values={values} />
      <ShippingZonesForm zones={shippingZones} />
    </div>
  );
}
