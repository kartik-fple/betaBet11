import { defineStore } from 'pinia'

export const useOneSignal = defineStore('oneSignal', {
    state: () => {},
    actions: {
        async loadOneSignal() {
            const userStore = useUserStore()
            const { $api, $toast } = useNuxtApp()

            if (userStore.loggedIn) {
                const options = {
                    method: 'POST',
                    headers: {accept: 'application/json', 'content-type': 'application/json'},
                    body: JSON.stringify({
                        properties: {
                            country: 'PH',
                            language: 'en',
                        },
                        identity: {external_id: userStore.data.uid},
                    })
                  };

                    const res = await $fetch('https://api.onesignal.com/apps/e33f9108-b35d-40e3-9d15-e28fff7445c2/users', options)

                    const param = {
                        uid: userStore.data.uid,
                        oneSignalId: res.identity.onesignal_id
                    }

                    const resOneSignal = await $api('user/crm-one-signal', param)
                    if (!resOneSignal.status) {
                        $toast(resOneSignal.status, resOneSignal.msg)
                        return
                    }

                    const resOneSignalToken = await $api('user/update-signal-token', param)
                    if (!resOneSignalToken.status) {
                        $toast(resOneSignalToken.status, resOneSignalToken.msg)
                        return
                    }
            }
        },
        async getUser() {
            const userStore = useUserStore()

            if (userStore.loggedIn) {
                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json', 
                        'content-type': 'application/json', 
                        'Authorization': 'Basic YTY2NWYxZTUtOGQxNi00OWQwLTk0OGMtOGQ2NTg5MTAzMzk1'
                    },
                  };

                fetch('https://api.onesignal.com/apps/e33f9108-b35d-40e3-9d15-e28fff7445c2/users/by/external_id/19817', options)
                .then(response => response.json())
                .then(response => console.log(response))
                .catch(err => console.error(err));
            }
        }
    }
})