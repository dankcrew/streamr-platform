import React from 'react'
import { shallow } from 'enzyme'
import assert from 'assert-diff'
import sinon from 'sinon'

/* eslint-disable-next-line max-len */
import IntegrationKeyHandlerInput from '../../../../../../components/ProfilePage/IntegrationKeyHandler/IntegrationKeyHandlerSegment/IntegrationKeyHandlerInput/index'

describe('IntegrationKeyHandlerInput', () => {
    describe('onSubmit', () => {
        it('must call e.preventDefault', () => {
            const spy = sinon.spy()
            const el = shallow(<IntegrationKeyHandlerInput
                fields={[]}
                onNew={() => {}}
            />)
            el.instance().onSubmit({
                preventDefault: spy,
                target: {
                    reset: () => {},
                },
            })
            assert(spy.calledOnce)
        })
        it('must serialize the form and call onNew with it', () => {
            // form-serialize mocked in tests/__mocks__
            const spy = sinon.spy()
            const el = shallow(<IntegrationKeyHandlerInput
                inputFields={[]}
                onNew={spy}
            />)
            const form = {
                reset: () => {},
                customField: 'aapeli',
            }
            el.instance().onSubmit({
                preventDefault: () => {},
                target: form,
            })
            assert(spy.calledOnce)
            assert(spy.calledWith(form))
        })
    })

    describe('render', () => {
        describe('initial rendering', () => {
            describe('rendering the correct elements', () => {
                let el
                beforeEach(() => {
                    el = shallow(<IntegrationKeyHandlerInput
                        inputFields={['aField', 'bField', 'cField']}
                        onNew={sinon.spy()}
                    />)
                })
                it('must be a form with correct props', () => {
                    assert(el.is('form'))
                    assert.equal(el.props().className, 'integrationKeyInputForm')
                    assert.equal(el.props().onSubmit, el.instance().onSubmit)
                })
                it('must have FormGroup and InputGroup in it', () => {
                    const formGroup = el.find('FormGroup')
                    const inputGroup = formGroup.childAt(0)
                    assert(inputGroup.is('InputGroup'))
                    assert.equal(inputGroup.props().className, 'integrationKeyInputGroup')
                })
                it('must render FormControl for all the fields + for name and with correct props', () => {
                    const formInputs = el.find('Input')
                    assert.equal(formInputs.length, 4)

                    assert.equal(formInputs.at(0).props().type, 'text')
                    assert.equal(formInputs.at(0).props().className, 'integrationKeyInput')
                    assert.equal(formInputs.at(0).props().name, 'name')
                    assert.equal(formInputs.at(0).props().placeholder, 'Name')

                    assert.equal(formInputs.at(1).props().type, 'text')
                    assert.equal(formInputs.at(1).props().className, 'integrationKeyInput')
                    assert.equal(formInputs.at(1).props().name, 'aField')
                    assert.equal(formInputs.at(1).props().placeholder, 'A Field')

                    assert.equal(formInputs.at(2).props().type, 'text')
                    assert.equal(formInputs.at(2).props().className, 'integrationKeyInput')
                    assert.equal(formInputs.at(2).props().name, 'bField')
                    assert.equal(formInputs.at(2).props().placeholder, 'B Field')

                    assert.equal(formInputs.at(3).props().type, 'text')
                    assert.equal(formInputs.at(3).props().className, 'integrationKeyInput')
                    assert.equal(formInputs.at(3).props().name, 'cField')
                    assert.equal(formInputs.at(3).props().placeholder, 'C Field')
                })
            })
        })
    })
})
