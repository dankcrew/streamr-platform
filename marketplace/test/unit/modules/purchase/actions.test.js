import assert from 'assert-diff'
import sinon from 'sinon'
import mockStore from '../../../test-utils/mockStoreProvider'

import * as actions from '../../../../src/modules/purchase/actions'
import * as constants from '../../../../src/modules/purchase/constants'
import * as notificationActions from '../../../../src/modules/notifications/actions'
import * as productActions from '../../../../src/modules/product/actions'
import * as services from '../../../../src/modules/purchase/services'
import * as myPurchaseConstants from '../../../../src/modules/myPurchaseList/constants'

// Only affects this test file
jest.setTimeout(6000)

describe('purchase - actions', () => {
    let sandbox
    let oldStreamrApiUrl

    beforeEach(() => {
        oldStreamrApiUrl = process.env.STREAMR_API_URL
        process.env.STREAMR_API_URL = ''
        sandbox = sinon.createSandbox()
    })

    afterEach(() => {
        sandbox.restore()
        process.env.STREAMR_API_URL = oldStreamrApiUrl
    })

    describe('buyProduct', () => {
        it('calls services.buyProduct', async () => {
            const id = 'test'
            const cc = {
                onTransactionHash: () => cc,
                onTransactionComplete: () => cc,
                onError: () => cc,
            }
            const subscriptionInSeconds = '200000000'

            const ccStub = sandbox.stub(services, 'buyProduct').callsFake(() => cc)
            const store = mockStore()
            await store.dispatch(actions.buyProduct(id, subscriptionInSeconds))
            assert(ccStub.calledOnce)
            assert(ccStub.calledWith(id))
        })

        it('dispatches right actions on buyProduct().onTransactionHash', async () => {
            sandbox.stub(notificationActions, 'showTransactionNotification').callsFake((hash) => ({
                type: 'showTransactionNotification',
                hash,
            }))

            const id = 'test'
            const hash = 'testHash'
            const cc = {
                onTransactionHash: (cb) => {
                    cb(hash)
                    return cc
                },
                onTransactionComplete: () => cc,
                onError: () => cc,
            }
            const subscriptionInSeconds = '200000000'

            sandbox.stub(services, 'buyProduct').callsFake(() => cc)
            const store = mockStore()
            store.dispatch(actions.buyProduct(id, subscriptionInSeconds))

            const expectedActions = [{
                type: constants.BUY_PRODUCT_REQUEST,
                payload: {
                    productId: id,
                    subscriptionInSeconds,
                },
            }, {
                type: constants.RECEIVE_PURCHASE_HASH,
                payload: {
                    hash,
                },
            }, {
                type: 'showTransactionNotification',
                hash,
            }]

            assert.deepStrictEqual(store.getActions(), expectedActions)
        })

        it('dispatches right actions on buyProduct().onTransactionComplete', (done) => {
            const id = 'test'
            const receipt = {
                a: 'receipt',
                with: 'no',
                proper: 'schema',
            }
            const subscriptionInSeconds = '200000000'

            const cc = {
                onTransactionHash: () => cc,
                onTransactionComplete: (cb) => {
                    cb(receipt)
                    return cc
                },
                onError: () => cc,
            }
            sandbox.stub(services, 'buyProduct').callsFake(() => cc)
            sandbox.stub(productActions, 'getProductSubscription').callsFake((idToGet) => ({
                type: 'getProductSubscription',
                id: idToGet,
            }))

            // Couldn't mock react-router-redux's getLocation for some reason so let's use the real one
            const store = mockStore({
                router: {
                    location: {
                        pathname: `/product/${id}`,
                    },
                },
            })

            store.dispatch(actions.buyProduct(id, subscriptionInSeconds))

            const expectedActions = [{
                type: constants.BUY_PRODUCT_REQUEST,
                payload: {
                    productId: id,
                    subscriptionInSeconds,
                },
            }, {
                type: constants.BUY_PRODUCT_SUCCESS,
                payload: {
                    receipt,
                },
            }, {
                type: 'getProductSubscription',
                id: 'test',
            }]
            setTimeout(() => {
                assert.deepStrictEqual(store.getActions(), expectedActions)
                done()
            }, 5000)
        })

        it('doesnt dispatch getProductSubscription if not on product page', (done) => {
            const id = 'test'
            const receipt = {
                a: 'receipt',
                with: 'no',
                proper: 'schema',
            }
            const subscriptionInSeconds = '200000000'

            sandbox.stub(productActions, 'getProductSubscription').callsFake((idToGet) => ({
                type: 'getProductSubscription',
                id: idToGet,
            }))

            const cc = {
                onTransactionHash: () => cc,
                onTransactionComplete: (cb) => {
                    cb(receipt)
                    return cc
                },
                onError: () => cc,
            }
            sandbox.stub(services, 'buyProduct').callsFake(() => cc)

            // Couldn't mock react-router-redux's getLocation for some reason so let's use the real one
            const store = mockStore({
                router: {
                    location: {
                        pathname: '/product/notProperId',
                    },
                },
            })
            store.dispatch(actions.buyProduct(id, subscriptionInSeconds))
            const expectedActions = [{
                type: constants.BUY_PRODUCT_REQUEST,
                payload: {
                    productId: id,
                    subscriptionInSeconds,
                },
            }, {
                type: constants.BUY_PRODUCT_SUCCESS,
                payload: {
                    receipt,
                },
            }]
            setTimeout(() => {
                assert.deepStrictEqual(store.getActions(), expectedActions)
                done()
            }, 5000)
        })

        it('dispatches right actions on buyProduct().onError', () => {
            const id = 'test'
            const error = new Error('test error')

            const cc = {
                onTransactionHash: () => cc,
                onTransactionComplete: () => cc,
                onError: (cb) => {
                    cb(error)
                    return cc
                },
            }
            const subscriptionInSeconds = '200000000'

            sandbox.stub(services, 'buyProduct').callsFake(() => cc)

            const store = mockStore()
            store.dispatch(actions.buyProduct(id, subscriptionInSeconds))
            const expectedActions = [{
                type: constants.BUY_PRODUCT_REQUEST,
                payload: {
                    productId: id,
                    subscriptionInSeconds,
                },
            }, {
                type: constants.BUY_PRODUCT_FAILURE,
                payload: {
                    error: {
                        message: error.message,
                    },
                },
            }]
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
    })

    describe('addFreeProduct', () => {
        it('calls services.addFreeProduct', async () => {
            const id = 'test'
            const product = {
                field: 1,
                anotherField: 'two',
            }
            const ccStub = sandbox.stub(services, 'addFreeProduct').callsFake(() => Promise.resolve(product))
            const store = mockStore()
            await store.dispatch(actions.addFreeProduct(id))
            assert(ccStub.calledOnce)
            assert(ccStub.calledWith(id))
        })

        it('dispatches right actions on addFreeProduct() success', async () => {
            sandbox.stub(notificationActions, 'showNotification').callsFake(() => ({
                type: 'showNotification',
            }))

            const id = 'test'
            const product = {
                field: 1,
                anotherField: 'two',
            }

            sandbox.stub(services, 'addFreeProduct').callsFake(() => Promise.resolve(product))

            const store = mockStore()
            await store.dispatch(actions.addFreeProduct(id))

            const expectedActions = [{
                type: constants.ADD_FREE_PRODUCT_REQUEST,
                payload: {
                    id,
                },
            }, {
                type: constants.ADD_FREE_PRODUCT_SUCCESS,
            }, {
                type: 'showNotification',
            },
            {
                type: myPurchaseConstants.GET_MY_PURCHASES_REQUEST,
            }]

            assert.deepStrictEqual(store.getActions(), expectedActions)
        })

        it('dispatches right actions on postDeployFree() error', async () => {
            const id = 'test'
            const errorMessage = 'error'

            sandbox.stub(services, 'addFreeProduct').callsFake(() => Promise.reject(new Error(errorMessage)))

            const store = mockStore()
            await store.dispatch(actions.addFreeProduct(id))

            const expectedActions = [{
                type: constants.ADD_FREE_PRODUCT_REQUEST,
                payload: {
                    id,
                },
            }, {
                type: constants.ADD_FREE_PRODUCT_FAILURE,
                payload: {
                    id,
                    error: {
                        message: errorMessage,
                    },
                },
            }]
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
    })
})
