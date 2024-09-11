import { defineStore } from 'pinia'
// import { getJSON } from '~/assets/js/cache'

const loadGames = async ({store, url, category, allowedProviders, currency}) => {
    const config = useRuntimeConfig()
    if (store[category].getting) return
    store[category].noFound = false;
    store[category].getting = true
    const res = await getJSON(url, `games_${currency}_${category}`)
    store[category].getting = false
    if (!res.status) {
        store[category].noFound = true;
        return
    }
    try {
        if (category != 'hot' && category != 'top' && category != 'show_game' && category != 'show' && category != 'exclusivepriority' && category != 'sportgame') {
            let providers = {
                ALL: [],
            }
            
            allowedProviders.forEach(provider => {
                providers[provider.providerName.toUpperCase()] = []
            })
            res.data.forEach(game => {
                if (providers[game.provider_name.toUpperCase()]) {
                    providers[game.provider_name.toUpperCase()].push(game)
                    providers.ALL.push(game)
                }
            })
    
            for (let p in providers) {
                if (providers[p].length == 0) {
                    delete providers[p]
                }
            }

            store[category].list = providers
            store[category].ready = true
        }
        else {
            if (category == 'hot') {
                if (res.data && res.data.length > 0) {
                    store.hot.list = res.data.slice(0, 30)
                }
                store.hot.ready = true
            } else if (category == 'top') {
                if (res.data && res.data.length > 0) {
                    store.top.list = res.data.slice(0, 30)
                }
                store.top.ready = true
            } else if (category == 'show_game') {
                store.show_game.list = res.data;
                store.show_game.ready = true
            } else if (category == 'show') {
                store.show.list = res.data;
                store.show.ready = true
            } else if (category == 'exclusivepriority') {
                store.exclusivepriority.list = res.data;
                store.exclusivepriority.ready = true
            } else if (category == 'sportgame') {
                store.sportgame.list = res.data;
                store.sportgame.ready = true
            }
        }
    }
    catch(err) {
        console.log(err)
    }
}

let playTechHelper = {
    mobileHub: 'nptgp',
    virtualdatabase: 'agdragon',
    realMode: '1',
    systemId: '77',
    playTechTempToken: '',
    language: 'EN',
    clientPlatform: 'mobile', // or 'web'
    calloutLogin(response) {
        console.log(response)
        if (response.errorCode) {
            if (response.errorText !== undefined) {
                alert("[" + response.errorCode + "] " + response.errorText.replace("<br>", "\r\n"));
            }
            else if (response.playerMessage !== undefined) {
                alert("[" + response.errorCode + "] " + response.playerMessage.replace("<br>", "\r\n"));
            }
            else {
                alert("[" + response.errorCode + "] Login Fail.");
            }
        }
        else {
            playTechHelper.playTechTempToken = response.sessionToken.sessionToken
            // window.iapiRequestTemporaryToken(1, '77', 'GamePlay');
        }
    },
   /*  calloutGetTemporaryAuthenticationToken(response) {
        if (response.errorCode) {
            // alert("Token failed. " + response.playerMessage + " Error code: " + response.errorCode);
        }
        else {
            playTechHelper.launchMobileClient(response.sessionToken.sessionToken);
        }
    },
    launchMobileClient(temptoken) {   
        playTechHelper.playTechTempToken = temptoken;
    }, */
    loginPT(paramUsername, paramPassword) {
        window.iapiLoginAndGetTempToken(paramUsername, paramPassword, playTechHelper.realMode, playTechHelper.language, playTechHelper.systemId);
        // window.iapiSetClientPlatform("mobile&deliveryPlatform=HTML5");
        // window.iapiLogin(paramUsername, paramPassword, realMode, defaultLanguage);
    },
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const useGamesStore = defineStore('games', {
    state: () => {
        return {
            sport: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            live: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            card: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            fish: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            esport: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            lottery: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            cockfight: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            instantwin: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            egames: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            slot: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            bingo: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            cricket: {
                ready: false,
                getting: false,
                noFound: false,
                list: {}
            },
            hot: {
                ready: false,
                getting: false,
                noFound: false,
                list: []
            },
            top: {
                ready: false,
                getting: false,
                noFound: false,
                list: []
            },
            show_game: {
                ready: false,
                getting: false,
                noFound: false,
                list: []
            },
            show: {
                ready: false,
                getting: false,
                noFound: false,
                list: []
            },
            exclusivepriority: {
                ready: false,
                getting: false,
                noFound: false,
                list: []
            },
            sportgame: {
                ready: false,
                getting: false,
                noFound: false,
                list: []
            },
            showVersionModal: null, // if true, asks the user to choose desktop or mobile version.
            standbyGame: null, // temporarily save the game details when asking user to choose version
            selectedGame: false,
        }
    },
    actions: {
        async getGames(category) {
            const config = useRuntimeConfig()
            const providerStore = useProviderStore()
            const userStore = useUserStore()
            const env = config.public.ENV == 'production' ? 'production' : 'staging'
            let gameCat = category;
            // let gameCat = config.public.ENV == 'production' && ['jw8'].includes(config.public.MERCHANT) && category == 'egames' ? 'slot' : category;
            let categories = config.public.GAME_CATEGORY_LIST;
            if (categories.indexOf(gameCat) < 0) {
                console.log('No such category')
                return
            }

            let providersCategories = {...providerStore.data}

            // remove restreicted providers
            if (userStore.loggedIn) {
                const dashboardStore = useDashboardStore()
                const restrictedProviders = dashboardStore.data.restrict || ''
                const providersToRemove = restrictedProviders.split(',')
                for (let c in providersCategories) {
                    providersCategories[c] = providersCategories[c].filter(p => providersToRemove.indexOf(p.id) < 0)
                }
            }
            for (let c in providersCategories) {
                providersCategories[c] = providersCategories[c].filter(p => p.mobile_status == '0')
            }
            // load the targeted category first
            let providersInCategory = providersCategories[gameCat] || []

            const {$getCurrency} = useNuxtApp()
            const currency = $getCurrency()
            await loadGames({
                store: this,
                url: `${config.public.PUBLIC_FE_BUCKET}backend/${env}/game/${currency}/${gameCat == 'hot' ? 'top' : gameCat == 'top' ? 'hot' : gameCat }_all.json.gz`,
                category: category,
                allowedProviders: providersInCategory,
                currency: currency
            })

            // load the other categories
            categories = config.public.MERCHANT == 'production' && ['jw8'].includes(config.public.MERCHANT) ? categories.filter(c => c != gameCat && c != 'egames') : categories.filter(c => c != gameCat);
            for (let i = 0; i < categories.length; i++) {
                providersInCategory = providersCategories[categories[i]] || []
                await loadGames({
                    store: this,
                    url: `${config.public.PUBLIC_FE_BUCKET}backend/${env}/game/${currency}/${categories[i] == 'hot' ? 'top' : categories[i] == 'top' ? 'hot' : categories[i]}_all.json.gz`,
                    category: categories[i],
                    allowedProviders: providersInCategory,
                    currency: currency
                })
            }
        },
        async playGame (game, onPlayPage) {
            if (game.maintenance) return

            const userStore = useUserStore();
            const mainStore = useMainStore();
            const { $api, $toast, $encodeString, $loadScript, $pub, $isWebView } = useNuxtApp();
            const config = useRuntimeConfig();
            const router = useRouter();
            const localePath = useLocalePath();
            if (!userStore.loggedIn) {
                mainStore.loginModal = true;
                return
            }

            if (game.needChooseVersion) {
                let tempGame = {...game}
                delete tempGame.needChooseVersion // need delete or else will be endless loop
                this.standbyGame = tempGame
                this.showVersionModal = true
                return
            }

            let gameWindow = null
            const isWebView = $isWebView()
            if (!config.public.PLAY_IN_IFRAME || (config.public.PLAY_IN_IFRAME && config.public.PLAY_IN_WINDOW_PROVIDER_LIST.includes(game.provider_name))) {
                if (!isWebView) {
                    gameWindow = window.open($pub('/loading_game.html'))
                }
            }
            if (!onPlayPage && config.public.PLAY_IN_IFRAME && !config.public.PLAY_IN_WINDOW_PROVIDER_LIST.includes(game.provider_name)) {
                // direct user to play page
                let gameObject = {
                    game_id: game.game_id,
                    provider_id: game.provider_id,
                    currency: game.currency,
                    provider_name: game.provider_name,
                    force_user_agent: game.force_user_agent
                }
                // used handle history state back sebab some game will replace back history
                localStorage.setItem('lastpg',window.history.state.current)
                localStorage.setItem('lastgame',gameObject.game_id)
                localStorage.setItem("homeProvider",gameObject.provider_name.toUpperCase())
                if (game.category) localStorage.setItem("category",game.category)
                router.push(localePath(`/play/${$encodeString(JSON.stringify(gameObject))}`))
                return
            }
            mainStore.loadingGame = true;

            let url_type = null
            var game_url = null

            if (game.provider_name == 'RG') {
                const res2 = await $api('game/auto-transfer', {
                    provider_id: game.provider_id,
                    gid: game.game_id,
                });
                if (!res2.status) {
                    mainStore.loadingGame = false;
                    $toast(res2.status, res2.msg);
                    if (gameWindow) gameWindow.close()
                    return 
                }

                var playAPI = 'game/login-game';
                const res = await $api(playAPI, {
                    currency: game.currency,
                    provider_id: game.provider_id,
                    game_id: game.game_id,
                    force_user_agent: game.force_user_agent
                });
                if (!res.status || !res.data.auto_status) {
                    mainStore.loadingGame = false;
                    $toast(res.status, res.msg);
                    if (gameWindow) gameWindow.close()
                    return
                }
    
                game_url = res.data.url;
                mainStore.loadingGame = false;
                url_type = res.data.type;

            }else {
                var playAPI = 'game/login-game';
                if (game.provider_name == 'PlayTech') {
                    sessionStorage.removeItem("temptoken");
                    await $loadScript(`https://login-ag.${playTechHelper.mobileHub}.com/jswrapper/integration.js.php?casino=${playTechHelper.virtualdatabase}&v=6`, window['iapiSetCallout'])
                    window.iapiSetCallout('LoginAndGetTempToken', playTechHelper.calloutLogin);
                    // window.iapiSetCallout("GetTemporaryAuthenticationToken", playTechHelper.calloutGetTemporaryAuthenticationToken);
                    playAPI = 'game/get-pt-player'
                }
                const res = await $api(playAPI, {
                    currency: game.currency,
                    provider_id: game.provider_id,
                    game_id: game.game_id,
                    force_user_agent: game.force_user_agent
                });
                if (!res.status || !res.data.auto_status) {
                    mainStore.loadingGame = false;
                    $toast(res.status, res.msg);
                    if (gameWindow) gameWindow.close()
                    return
                }
    
                game_url = res.data.url;
                if (game.provider_name == 'PlayTech') {
                    playTechHelper.loginPT(res.data.username, res.data.provider_token)
                    await playTechHelper.sleep(3000);
                    game_url = `https://login-ag.${playTechHelper.mobileHub}.com/GameLauncher?gameCodeName=` + res.data.gamecode + "&username=" + res.data.username
                                    + "&tempToken=" + playTechHelper.playTechTempToken + "&casino=" + playTechHelper.virtualdatabase + "&clientPlatform=" + playTechHelper.clientPlatform + "&language=" + playTechHelper.language
                                    + "&playMode=" + playTechHelper.realMode + "&deposit=" + "&lobby=" + "&swipeOff=true";
                    // game_url = "https://games-ag.nptgp.com/casinomobile/casinoclient.html?lang=" + 'EN' + "&game=" + res.data.gamecode + "&username=" + res.data.username + "&real=" + '1' + "&tempToken=" + playTechHelper.playTechTempToken;
                    console.log(game_url)
                    // game_url = res.data.mobiledomain+'/igaming/?gameId='+res.data.gamecode+'&real=1&username='+res.data.username+'&lang=EN&tempToken='+playTechHelper.playTechTempToken+'&lobby=' + window.location.origin  + '/Close' + '&support=' + '&logout='+ window.location.origin  + '/Close' + '&deposit=';
                }
        
                const res2 = await $api('game/auto-transfer', {
                    provider_id: game.provider_id,
                    gid: game.game_id,
                });
                if (!res2.status) {
                    mainStore.loadingGame = false;
                    $toast(res2.status, res2.msg);
                    if (gameWindow) gameWindow.close()
                    return 
                }

                mainStore.loadingGame = false;
                url_type = res.data.type;
            }

            if (onPlayPage) {
                return {
                    game_url: game_url,
                    gameType: url_type
                }
            } else {
                if (gameWindow) {
                    gameWindow.location = game_url
                    gameWindow.focus() 
                }
                else if (isWebView) {
                    window.location.href = game_url
                }
                else {
                    window.open(game_url, '_blank');
                }
            }
        }
    }
})