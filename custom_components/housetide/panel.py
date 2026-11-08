from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback
from homeassistant.loader import async_get_integration
from homeassistant.util.hass_dict import HassKey

from .const import BUNDLE_URL, DOMAIN, PANEL_ELEMENT, PANEL_ICON, PANEL_TITLE, PANEL_URL_PATH

_BUNDLE_PATH = Path(__file__).parent / "frontend" / "housetide.js"
_DATA_STATIC: HassKey[bool] = HassKey(f"{DOMAIN}_static")
_DATA_MODULE_URL: HassKey[str] = HassKey(f"{DOMAIN}_module_url")


async def async_register(hass: HomeAssistant) -> None:
    integration = await async_get_integration(hass, DOMAIN)
    module_url = f"{BUNDLE_URL}?v={integration.version}"
    if _DATA_STATIC not in hass.data:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(BUNDLE_URL, str(_BUNDLE_PATH), False)]
        )
        hass.data[_DATA_STATIC] = True
    frontend.add_extra_js_url(hass, module_url)
    hass.data[_DATA_MODULE_URL] = module_url
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_ELEMENT,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=module_url,
        require_admin=False,
    )


@callback
def async_unregister(hass: HomeAssistant) -> None:
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
    if (module_url := hass.data.pop(_DATA_MODULE_URL, None)) is not None:
        frontend.remove_extra_js_url(hass, module_url)
