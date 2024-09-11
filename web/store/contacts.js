import { defineStore } from 'pinia'

export const useContactStore = defineStore('contact', {
    state: () => {
        return {
            data: {},
            ready: false,
            liveChatDisplay: false,
            appendedElements: [],
            mobileLiveChatStyle: null,
            hideChatWidgetStyle: null
        }
    },
    actions: {
        setContact(payload) {
            this.data = payload
            this.ready = true
            this.appendLiveChatScript()
        },
        appendLiveChatScript(destroyCurrentWidget) {
            if (!this.ready) return
            const {isMobile} = useDevice()
            const {$i18n} = useNuxtApp()
            const locale = $i18n.localeProperties.value.code
            if (!this.data[locale] || !this.data[locale].livechat_display || !this.data[locale].live_chat_script) {
                this.forceHideChat()
                return
            }
            try {
                if (destroyCurrentWidget && window.LiveChatWidget) {
                    window.LiveChatWidget.call("destroy");
                    this.appendedElements.forEach(el => {
                        el.remove()
                    })
                }

                 // decode html entities
                 const txt = document.createElement("textarea");
                 txt.innerHTML = this.data[locale].live_chat_script;
                 const liveChatScript = txt.value
                 const d = document.createElement('div')
                 d.innerHTML = liveChatScript
 
                 // adding script tag with innerHTML doesn't work. Need to create element
                 for (let i = 0; i < d.childNodes.length; i++) {
                     if (!d.childNodes[i].tagName) continue
                     let s = document.createElement(d.childNodes[i].tagName)
                     s.innerHTML = d.childNodes[i].innerHTML
                     document.body.appendChild(s)
                     this.appendedElements.push(s)
                 }
                 nextTick(() => {
                    if (!window.LiveChatWidget) {
                        return
                    }
                    this.forceHideChat()
                    window.LiveChatWidget.on('ready', () => {
                        this.setLiveChatDisplay()
                        if (isMobile) {
                            this.applyLiveChatStyle()
                        }
                    })
                    if (isMobile) {
                        window.LiveChatWidget.on('visibility_changed', this.onVisibilityChanged)
                    }
                 })
            }
            catch(err) {
                console.log(err)
            }
        },
        setLiveChatDisplay() {
            if (!window || !window.LiveChatWidget) {
                return
            }
            const route = useRoute()
            const {$i18n} = useNuxtApp()
            const locale = $i18n.localeProperties.value.code
            const getRouteBaseName = useRouteBaseName()
            
            // detect app modal opened or not
            const mainStore = useMainStore();
            if (mainStore.iosModal) {
                this.liveChatDisplay = false
                this.forceHideChat()
                return;
            }
            
            if (!this.data[locale] || !this.data[locale].livechat_display || !this.data[locale].live_chat_script) {
                this.liveChatDisplay = false
                // window.LiveChatWidget.call('hide')
                this.forceHideChat()
                return
            }
            if (this.data[locale].livechat_display == "homepage") {
                if (getRouteBaseName(route) == 'index') {
                    this.liveChatDisplay = true
                    window.LiveChatWidget.call('minimize')
                    this.undoHideChat()
                } else {
                    this.liveChatDisplay = false
                    // window.LiveChatWidget.call('hide')
                    this.forceHideChat()
                }
            } else if (this.data[locale].livechat_display == "all_page") {
                this.liveChatDisplay = true
                window.LiveChatWidget.call('minimize')
                this.undoHideChat()
            } else {
                this.liveChatDisplay = false
                // window.LiveChatWidget.call('hide')
                this.forceHideChat()
            }
        },
        applyLiveChatStyle() {
            if (this.mobileLiveChatStyle) return
            this.mobileLiveChatStyle = document.createElement('style')
            this.mobileLiveChatStyle.innerHTML = `#chat-widget-container {bottom: 50px !important;max-height: calc(100% - 50px) !important;}`
            document.head.appendChild(this.mobileLiveChatStyle)
        },
        removeLiveChatStyle() {
            if (!this.mobileLiveChatStyle) return
            this.mobileLiveChatStyle.remove()
            this.mobileLiveChatStyle = null
        },
        forceHideChat() {
            if (this.hideChatWidgetStyle) return
            this.hideChatWidgetStyle = document.createElement('style')
            this.hideChatWidgetStyle.innerHTML = `#chat-widget-container {visibility: hidden !important;}`
            document.head.appendChild(this.hideChatWidgetStyle)
        },
        undoHideChat() {
            if (!this.hideChatWidgetStyle) return
            this.hideChatWidgetStyle.remove()
            this.hideChatWidgetStyle = null
        },
        onVisibilityChanged(data) {
            switch (data.visibility) {
                case 'maximized':
                    this.removeLiveChatStyle()
                break;
                case 'minimized':
                    this.applyLiveChatStyle()
                break;
                case 'hidden':
                    this.removeLiveChatStyle()
                break;
            }
        }
    }
})