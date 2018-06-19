import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import expect from 'expect'
import moxios from 'moxios'
import * as actions from '../../actions/canvas'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('Canvas actions', () => {
    let store

    beforeEach(() => {
        moxios.install()
        store = mockStore({
            list: [],
            error: null,
            fetching: false,
        })
    })

    afterEach(() => {
        moxios.uninstall()
        store.clearActions()
    })

    it('creates GET_RUNNING_CANVASES_SUCCESS when fetching running canvases has succeeded', async () => {
        const wait = moxios.promiseWait().then(() => {
            const request = moxios.requests.mostRecent()
            expect(request.url).toMatch(/canvases/)
            expect(request.config.params).toEqual({
                state: 'RUNNING',
                adhoc: false,
                sort: 'dateCreated',
                order: 'desc',
            })
            request.respondWith({
                status: 200,
                response: [{
                    id: 'test',
                    name: 'test',
                }, {
                    id: 'test2',
                    name: 'test2',
                }],
            })
        })

        const expectedActions = [{
            type: actions.GET_RUNNING_CANVASES_REQUEST,
        }, {
            type: actions.GET_RUNNING_CANVASES_SUCCESS,
            canvases: [{
                id: 'test',
                name: 'test',
            }, {
                id: 'test2',
                name: 'test2',
            }],
        }]

        await store.dispatch(actions.getRunningCanvases())

        expect(store.getActions()).toEqual(expectedActions)

        await wait
    })

    it('creates GET_RUNNING_CANVASES_FAILURE when fetching running canvases has failed', async () => {
        const wait = moxios.promiseWait().then(() => {
            const request = moxios.requests.mostRecent()
            expect(request.url).toMatch(/canvases/)
            expect(request.config.params).toEqual({
                state: 'RUNNING',
                adhoc: false,
                sort: 'dateCreated',
                order: 'desc',
            })
            request.respondWith({
                status: 500,
                response: {
                    message: 'test',
                    code: 'TEST',
                },
            })
        })

        const expectedActions = [{
            type: actions.GET_RUNNING_CANVASES_REQUEST,
        }, {
            type: actions.GET_RUNNING_CANVASES_FAILURE,
            error: {
                message: 'test',
                code: 'TEST',
                statusCode: 500,
            },
        }]

        await store.dispatch(actions.getRunningCanvases())
            .catch(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })

        await wait
    })
})
