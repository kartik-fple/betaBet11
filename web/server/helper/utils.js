function decode (str) {
    return Buffer.from(str, 'base64').toString('utf8')
}
 
function encode (str) {
    return Buffer.from(str).toString('base64')
}

function randomNumber (length = 4) {
    var chars = "0123456789";
    var str = "";
    for (var i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}

let notifySpamTimer = null
const notifySlack = async (text, preventSpam) => {
    const config = useRuntimeConfig()
    if (config.public.ENV == 'development') return
    if (preventSpam) {
        if (notifySpamTimer) {
            return
        }
        notifySpamTimer = setTimeout(() => {
            clearTimeout(notifySpamTimer)
            notifySpamTimer = null
        }, 10000)
    }
    try {
        await $fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.SLACK_BOT_TOKEN}`
            },
            body: {
                channel: config.public.ENV == 'production' ? config.SLACK_MESSAGE_CHANNEL : config.SLACK_MESSAGE_CHANNEL_STAGE,
                text: text
            }
        })
    }
    catch(err) {
        console.log(err)
    }
}

export {
    decode,
    encode,
    randomNumber,
    notifySlack
}