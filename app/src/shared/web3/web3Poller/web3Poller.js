// @flow

import EventEmitter from 'events'
import { I18n } from 'react-redux-i18n'

import getWeb3, { getPublicWeb3 } from '$shared/web3/web3Provider'
import type { StreamrWeb3 as StreamrWeb3Type } from '$shared/web3/web3Provider'
import { areAddressesEqual } from '$mp/utils/smartContract'
import type { NumberString } from '$shared/flowtype/common-types'
import { hasTransactionCompleted } from '$shared/utils/web3'
import { getTransactionsFromSessionStorage } from '$shared/utils/transactions'
import TransactionError from '$shared/errors/TransactionError'

export const events = {
    ACCOUNT: 'WEB3POLLER/ACCOUNT',
    ACCOUNT_ERROR: 'WEB3POLLER/ACCOUNT_ERROR',
    NETWORK: 'WEB3POLLER/NETWORK',
    NETWORK_ERROR: 'WEB3POLLER/NETWORK_ERROR',
    TRANSACTION_COMPLETE: 'WEB3POLLER/TRANSACTION_COMPLETE',
    TRANSACTION_ERROR: 'WEB3POLLER/TRANSACTION_ERROR',
}

export type Event = $Values<typeof events>
export type Handler = (any, any) => void

const WEB3_POLL_INTERVAL = 1000 // 1s
const NETWORK_POLL_INTERVAL = 1000 // 1s
const PENDING_TX_POLL_INTERVAL = 1000 * 5 // 5s

export default class Web3Poller {
    web3PollTimeout: ?TimeoutID = null
    ethereumNetworkPollTimeout: ?TimeoutID = null
    pendingTransactionsPollTimeout: ?TimeoutID = null
    web3: StreamrWeb3Type = getWeb3()
    account: any = null
    networkId: NumberString = ''
    emitter: EventEmitter = new EventEmitter()

    constructor() {
        // Start polling for info
        this.pollWeb3()
        this.pollEthereumNetwork()
        this.pollPendingTransactions()
    }

    subscribe(event: Event, handler: Handler) {
        this.emitter.on(event, handler)
    }

    unsubscribe(event: Event, handler: Handler) {
        this.emitter.removeListener(event, handler)
    }

    pollWeb3 = () => {
        this.fetchWeb3Account()
        this.clearWeb3Poll()
        this.web3PollTimeout = setTimeout(this.pollWeb3, WEB3_POLL_INTERVAL)
    }

    pollEthereumNetwork = () => {
        this.fetchChosenEthereumNetwork()
        this.clearEthereumNetworkPoll()
        this.ethereumNetworkPollTimeout = setTimeout(this.pollEthereumNetwork, NETWORK_POLL_INTERVAL)
    }

    clearWeb3Poll = () => {
        if (this.web3PollTimeout) {
            clearTimeout(this.web3PollTimeout)
            this.web3PollTimeout = null
        }
    }

    clearEthereumNetworkPoll = () => {
        if (this.ethereumNetworkPollTimeout) {
            clearTimeout(this.ethereumNetworkPollTimeout)
            this.ethereumNetworkPollTimeout = null
        }
    }

    clearPendingTransactionsPoll = () => {
        if (this.pendingTransactionsPollTimeout) {
            clearTimeout(this.pendingTransactionsPollTimeout)
            this.pendingTransactionsPollTimeout = null
        }
    }

    fetchWeb3Account = () => {
        this.web3.getDefaultAccount()
            .then((account) => {
                this.handleAccount(account)
                // needed to avoid warnings about creating promise inside a handler
                // if any other web3 actions are dispatched.
                return Promise.resolve()
            }, (err) => {
                if (this.account !== null) {
                    this.account = null
                    this.emitter.emit(events.ACCOUNT_ERROR, err)
                }
            })
    }

    handleAccount = (account: string) => {
        const next = account

        const didChange = !!(this.account && next && !areAddressesEqual(this.account, next))
        const didDefine = !!(!this.account && next)

        // Check current provider so that account event is not sent prematurely
        // (ie. wait for user to approve access to Metamask)
        if (this.web3.currentProvider !== null && (didDefine || didChange)) {
            this.account = next
            this.emitter.emit(events.ACCOUNT, next)
        }
    }

    fetchChosenEthereumNetwork = () => {
        this.web3.getEthereumNetwork()
            .then((network) => {
                this.handleNetwork(network.toString())
            }, () => {
                this.web3.getDefaultAccount()
                    .then(() => Promise.resolve(), (err) => {
                        if (this.account !== null) {
                            this.emitter.emit(events.NETWORK_ERROR, err)
                        }
                    })
            })
    }

    handleNetwork = (network: NumberString) => {
        const next = network
        const didChange = this.networkId && next && this.networkId !== next
        const didDefine = !this.networkId && next
        if (didDefine || didChange) {
            this.networkId = next
            this.emitter.emit(events.NETWORK, next)
        }
    }

    pollPendingTransactions = () => {
        this.handlePendingTransactions()
        this.clearPendingTransactionsPoll()
        this.pendingTransactionsPollTimeout = setTimeout(this.pollPendingTransactions, PENDING_TX_POLL_INTERVAL)
    }

    handlePendingTransactions = () => {
        const web3 = getPublicWeb3()
        Object.keys(getTransactionsFromSessionStorage())
            .forEach((txHash) => {
                // Get current number of confirmations and compare it with sought-for value
                hasTransactionCompleted(txHash)
                    .then((completed) => {
                        if (completed) {
                            web3.eth.getTransactionReceipt(txHash)
                                .then((receipt) => {
                                    // Cannot trust that receipt won't be null... the next interval should receive it
                                    if (receipt) {
                                        if (receipt.status === true) {
                                            this.emitter.emit(
                                                events.TRANSACTION_COMPLETE,
                                                txHash,
                                                receipt,
                                            )
                                        } else {
                                            this.emitter.emit(
                                                events.TRANSACTION_ERROR,
                                                txHash,
                                                new TransactionError(I18n.t('error.txFailed'), receipt),
                                            )
                                        }
                                    }
                                })
                        }
                    })
            })
    }
}
