import Vue from "vue";
import VueRouter from "vue-router";

//Import Main views
import dashboardView from "@/views/dashboardView.vue";
import zonesView from "@/views/zonesView.vue";
import cacheView from "@/views/cacheView.vue";
import allowedZones from "@/views/allowedZones.vue";
import blockedZones from "@/views/blockedZones.vue";
import appsView from "@/views/appsView.vue";
import dnsClient from "@/views/dnsClient.vue";
import dhcpView from "@/views/dhcpView.vue";
import logsView from "@/views/logsView.vue";
import administrationView from "@/views/administrationView.vue";
import usersView from "@/views/usersView.vue";
import groupsView from "@/views/groupsView.vue";
import permissionsView from "@/views/permissionsView.vue";
import settingsView from "@/views/settingsView.vue";
import aboutView from "@/views/aboutView.vue";

//Import Children

//Apps
import appsInstalled from "@/views/apps/installedApps.vue";
import appsStore from "@/views/apps/storeApps.vue";
import appsSideLoaded from "@/views/apps/sideLoadedApps.vue";

//DHCP
import dhcpLeases from "@/views/dhcp/leasesDHCP.vue";
import dhcpScopes from "@/views/dhcp/scopesDHCP.vue";
import dhcpEditScope from "@/views/dhcp/editScope.vue";

//Logs
import logsServer from "@/views/logs/serverLogs.vue";
import logsQuery from "@/views/logs/queryLogs.vue";

//Settings
import settingsGeneral from "@/views/settings/generalSettings.vue";
import settingsWebService from "@/views/settings/webServiceSettings.vue";
import settingsOptionalProtocols from "@/views/settings/optionalProtocolsSettings.vue";
import settingsTSIG from "@/views/settings/tsigSettings.vue";
import settingsRecursion from "@/views/settings/recursionSettings.vue";
import settingsCache from "@/views/settings/cacheSettings.vue";
import settingsBlocking from "@/views/settings/blockingSettings.vue";
import settingsProxyAndForwarders from "@/views/settings/proxyAndForwardersSettings.vue";
import settingsLogging from "@/views/settings/loggingSettings.vue";

//Zones
import addZone from "@/views/zones/addZone.vue";
import zoneDetails from "@/views/zones/zoneDetails.vue";

import PageNotFound from "@/views/pageNotFound.vue";
import loginView from "@/views/loginView.vue";

Vue.use(VueRouter);

const routes = [
  {
    meta: { hidden: true },
    name: "Login",
    path: "/login",
    component: loginView,
  },
  {
    meta: { icon: "mdi-monitor-dashboard", permission: "Dashboard" },
    name: "Dashboard",
    path: "/",
    component: dashboardView,
  },
  {
    meta: {
      icon: "mdi-dns",
      permission: "Zones",
    },
    name: "Zones",
    path: "/zones",
    component: zonesView,
  },
  {
    meta: {
      icon: "mdi-dns",
      hidden: true,
    },
    name: "Add Zone",
    path: "/add-zone",
    component: addZone,
  },
  {
    meta: {
      icon: "mdi-dns",
      hidden: true,
    },
    name: "Zone Details",
    path: "/zone/:zoneId",
    component: zoneDetails,
  },
  {
    meta: {
      icon: "mdi-cached",
      permission: "Cache",
    },
    name: "DNS Cache",
    path: "/cache",
    component: cacheView,
  },
  {
    meta: {
      icon: "mdi-checkbox-marked-circle-outline",
      permission: "Allowed",
    },
    name: "Allowed",
    path: "/allowed-zones",
    component: allowedZones,
  },
  {
    meta: {
      icon: "mdi-close-box-multiple-outline",
      permission: "Blocked",
    },
    name: "Blocked",
    path: "/blocked-zones",
    component: blockedZones,
  },
  {
    name: "Apps",
    path: "/apps",
    redirect: "/apps/installed",
    component: appsView,
    meta: {
      icon: "mdi-application-variable-outline",
      permission: "Apps",
    },
    children: [
      {
        name: "Installed",
        path: "/apps/installed",
        component: appsInstalled,
        meta: {
          icon: "mdi-check-circle",
          name: "Apps - Installed",
        },
      },
      {
        name: "Store",
        path: "/apps/store",
        component: appsStore,
        meta: {
          icon: "mdi-store",
          name: "Apps - Store",
        },
      },
      {
        name: "Side Load",
        path: "/apps/side-load",
        component: appsSideLoaded,
        meta: {
          icon: "mdi-folder-upload",
          name: "Apps - Side Load",
        },
      },
    ],
  },
  {
    meta: {
      icon: "mdi-laptop",
      permission: "DnsClient",
    },
    name: "DNS Client",
    path: "/dns-client",
    component: dnsClient,
  },
  {
    name: "DHCP",
    meta: {
      icon: "mdi-server-network",
      permission: "DhcpServer",
    },
    path: "/dhcp",
    redirect: "/dhcp/leases",
    component: dhcpView,
    children: [
      {
        name: "Leases",
        path: "/dhcp/leases",
        component: dhcpLeases,
        meta: {
          icon: "mdi-file-document",
          name: "DHCP - Leases",
        },
      },
      {
        name: "Scopes",
        path: "/dhcp/scopes",
        component: dhcpScopes,
        meta: {
          icon: "mdi-network-outline",
          name: "DHCP - Scopes",
        },
      },
      {
        path: "/dhcp/edit-scope/:scopeName",
        component: dhcpEditScope,
        meta: {
          hidden: true,
          icon: "mdi-server-network",
          name: "DHCP - Edit Scope",
        },
      },
      {
        path: "/dhcp/add-scope",
        component: dhcpEditScope,
        meta: {
          hidden: true,
          icon: "mdi-server-network",
          name: "DHCP - Add Scope",
        },
      },
    ],
  },
  {
    name: "Logs",
    meta: {
      icon: "mdi-book-open-outline",
      permission: "Logs",
    },
    path: "/logs",
    redirect: "/logs/server/",
    component: logsView,
    children: [
      {
        name: "Server Logs",
        path: "/logs/server/",
        component: logsServer,
        meta: {
          icon: "mdi-server",
          name: "Logs - Server",
        },
      },
      {
        name: "Query Logs",
        path: "/logs/query",
        component: logsQuery,
        meta: {
          icon: "mdi-magnify",
          name: "Logs - Query",
        },
      },
    ],
  },
  {
    name: "Administration",
    meta: {
      icon: "mdi-shield-account",
      permission: "Administration",
    },
    path: "/administration",
    redirect: "/administration/users",
    component: administrationView,
    children: [
      {
        meta: {
          icon: "mdi-account",
          permission: "Administration",
        },
        name: "Users",
        path: "/administration/users",
        component: usersView,
      },
      {
        meta: {
          icon: "mdi-account-group",
          permission: "Administration",
        },
        name: "Groups",
        path: "/administration/groups",
        component: groupsView,
      },
      {
        meta: {
          icon: "mdi-shield-account",
          permission: "Administration",
        },
        name: "Permissions",
        path: "/administration/permissions",
        component: permissionsView,
      },
    ],
  },
  {
    meta: {
      icon: "mdi-information-outline",
      permission: "About",
    },
    name: "About",
    path: "/about",
    component: aboutView,
  },
  {
    meta: {
      icon: "mdi-cog",
      permission: "Settings",
    },
    name: "Settings",
    path: "/settings",
    component: settingsView,
    children: [
      {
        name: "General",
        path: "/settings/general",
        component: settingsGeneral,
        meta: {
          icon: "mdi-tune",
          name: "Settings - General",
        },
      },
      {
        name: "Web Service",
        path: "/settings/web",
        component: settingsWebService,
        meta: {
          icon: "mdi-web",
          name: "Settings - Web Service",
        },
      },
      {
        name: "Optional Protocols",
        path: "/settings/optional-protocols",
        component: settingsOptionalProtocols,
        meta: {
          icon: "mdi-network",
          name: "Settings - Optional Protocols",
        },
      },
      {
        name: "TSIG",
        path: "/settings/tsig",
        component: settingsTSIG,
        meta: {
          icon: "mdi-key",
          name: "Settings - TSIG",
        },
      },
      {
        name: "Recursion",
        path: "/settings/recursion",
        component: settingsRecursion,
        meta: {
          icon: "mdi-call-made",
          name: "Settings - Recursion",
        },
      },
      {
        name: "Cache Settings",
        path: "/settings/cache",
        component: settingsCache,
        meta: {
          icon: "mdi-cached",
          name: "Settings - Cache",
        },
      },
      {
        name: "Blocking",
        path: "/settings/blocking",
        component: settingsBlocking,
        meta: {
          icon: "mdi-block-helper",
          name: "Settings - Blocking",
        },
      },
      {
        name: "Proxy & Forwarders",
        path: "/settings/proxy-and-forwarders",
        component: settingsProxyAndForwarders,
        meta: {
          icon: "mdi-arrow-right-bold-circle",
          name: "Settings - Proxy & Forwarders",
        },
      },
      {
        name: "Logging",
        path: "/settings/logging",
        component: settingsLogging,
        meta: {
          icon: "mdi-cog",
          name: "Settings - Logging",
        },
      },
      {
        path: "/:catchAll(.*)",
        component: PageNotFound,
        meta: {
          hidden: true,
        },
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

// Basic auth guard: if no token, send user to login route
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("appToken");
  if (!token && to.path !== "/login") {
    return next({ path: "/login" });
  }
  // If a permission is specified for the route and we have session data, enforce it
  try {
    const sessStr = sessionStorage.getItem("sessionData");
    if (sessStr && to.meta && to.meta.permission) {
      const sess = JSON.parse(sessStr);
      const perms = sess?.info?.permissions || {};
      const section = to.meta.permission;
      const canView = perms[section]?.canView === true;
      if (!canView) {
        return next({ path: "/" });
      }
    }
  } catch (_) {
    // If parsing fails, allow navigation and let the view handle access gracefully
  }
  next();
});

export default router;
