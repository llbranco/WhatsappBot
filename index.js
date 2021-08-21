const { create, Client } = require('@open-wa/wa-automate')
const welcome = require('./lib/welcome')
const msgHandler = require('./msgHndlr')
const options = require('./options')

const start = async (client = new Client()) => {
        console.log('[SERVER] Servidor iniciou!')
        client.onStateChanged((state) => {
            console.log('[Status do bot', state)
            if (state === 'Conflito' || state === 'INICIO COM ERRO') client.forceRefocus()
        })
        client.onMessage((async (message) => {
            client.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 3000) {
                    client.cutMsgCache()
                }
            })
            msgHandler(client, message)
        }))

        client.onGlobalParticipantsChanged((async (heuh) => {
            await welcome(client, heuh)
            }))
        
        client.onAddedToGroup(((chat) => {
            let totalMem = chat.groupMetadata.participants.length
            if (totalMem < 30) { 
            	client.sendText(chat.id, `Ei, os membros são apenas ${totalMem}, se você quiser convidar bots, o número mínimo de mem é 30`).then(() => client.leaveGroup(chat.id)).then(() => client.deleteChat(chat.id))
            } else {
                client.sendText(chat.groupMetadata.id, `Olá membros do grupo *${chat.contact.name}* obrigado por convidar este bot, para ver o menu, envie *!Help*`)
            }
        }))
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, 'Não consigo receber chamadas. call = block!')
            .then(() => client.contactBlock(call.peerJid))
        }))
    }

create(options(true, start))
    .then(client => start(client))
    .catch((error) => console.log(error))
