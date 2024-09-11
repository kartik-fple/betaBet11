const configPath = `./merchant_config/${process.env.npm_config_project}/${process.env.npm_config_env}`
const {runtimeConfig, i18n, feTemplate, pwa} = require(configPath)
const demoBuildFolder = process.env.npm_config_demodir
runtimeConfig.public.COMMON_BUCKET = 'https://common-public.s3.ap-southeast-1.amazonaws.com/'
const env = runtimeConfig.public.ENV == 'production' ? 'production' : 'staging'

let nitroBuild = {}

if (demoBuildFolder) {
    nitroBuild = {
        output: {
            dir: `../demo/${demoBuildFolder}/.output`,
            serverDir: `../demo/${demoBuildFolder}/.output/server`,
            publicDir: `../demo/${demoBuildFolder}/.output/public`
        }
    }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    // ssr: false,
    modules: [
        '~/modules/templates',
        '@nuxtjs/i18n',
        '@pinia/nuxt',
        '@nuxtjs/device',
        '@vite-pwa/nuxt'
    ],
    app: {
        // pageTransition: { name: 'page', mode: 'out-in' },
        // layoutTransition: { name: 'layout', mode: 'out-in' },
        head: {
            meta: [
                {
                    "name": "viewport",
                    "content": "width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover, maximum-scale=1"
                }, {
                    "charset": "utf-8"
                }, {
                    "http-equiv": "Content-Security-Policy",
                    "content": "upgrade-insecure-requests"
                } 
            ],
            link: [
                { rel: "icon", hid: "icon", type: "image/png", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/144x144_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_1", sizes: "57x57", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/57x57_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_2", sizes: "60x60", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/60x60_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_3", sizes: "72x72", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/72x72_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_4", sizes: "76x76", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/76x76_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_5", sizes: "114x114", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/114x114_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_6", sizes: "120x120", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/120x120_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_7", sizes: "144x144", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/144x144_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_8", sizes: "152x152", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/152x152_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_9", sizes: "180x180", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/180x180_favicon.png` },
                { rel: "apple-touch-icon", hid: "icon_10", sizes: "192x192", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/192x192_favicon.png` },
                { rel: "icon", type: "image/png", hid: "icon_11", sizes: "192x192", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/192x192_favicon.png` },
                { rel: "icon", type: "image/png", hid: "icon_13", sizes: "76x76", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/76x76_favicon.png` },
                { rel: "icon", type: "image/png", hid: "icon_12", sizes: "32x32", href: `${runtimeConfig.public.PUBLIC_FE_BUCKET}backend/${env}/member_site/32x32_favicon.png` },
                /* { name: "msapplication-TileColor", content: "#ffffff" },
                { name: "msapplication-TileImage", hid: "icon_15", content: `/ms-icon-144x144.png` },
                { name: "theme-color", content: "#ffffff" }, */
                // { rel: "manifest", hid: "manifest", href: `/manifest.json` }, // pwa module will generate manifest
            ],
        },
        cdnURL: runtimeConfig.public.STATIC_ROOT
    },
    sourcemap: {
        "server": false,
        "client": false
    },
    css: [
        // `~/assets/${process.env.npm_config_project}/css/sidebar.css`, // currently not used
        // `~/assets/${process.env.npm_config_project}/css/page-transition.css`,// won't use until vue and nuxt fix the transition bug - https://github.com/vuejs/core/issues/5844
        `~/assets/${process.env.npm_config_project}/css/variables.css`,
        `~/assets/${process.env.npm_config_project}/css/main.css`,
        `~/assets/${process.env.npm_config_project}/css/button.css`,
        `~/assets/${process.env.npm_config_project}/css/inputs.css`,
        `~/merchant_public/${process.env.npm_config_project}/css/icon.css`,
    ],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    i18n: i18n,
    imports: {
        dirs: ['store']
    },
    pwa: pwa,
    runtimeConfig: runtimeConfig,
    feTemplate: feTemplate,
    nitro: nitroBuild
})
