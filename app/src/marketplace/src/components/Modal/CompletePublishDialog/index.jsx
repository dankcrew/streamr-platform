// @flow

import React from 'react'
import { Translate } from 'streamr-layout/dist/bundle'

import Dialog from '../Dialog/index'
import Spinner from '../../Spinner/index'
import CheckmarkIcon from '../../CheckmarkIcon/index'
import WalletErrorIcon from '../../WalletErrorIcon/index'
import type { TransactionState } from '../../../flowtype/common-types'
import { transactionStates } from '../../../utils/constants'
import withI18n from '../../../containers/WithI18n/index'

import styles from '../modal.pcss'
import links from '../../../links'

export type Props = {
    publishState: ?TransactionState,
    onCancel: () => void,
    translate: (key: string, options: any) => string,
}

const CompletePublishDialog = ({ onCancel, publishState, translate }: Props) => {
    switch (publishState) {
        case transactionStates.STARTED:
            return (
                <Dialog
                    onClose={onCancel}
                    title={translate('modal.completePublish.started.title')}
                    actions={{
                        cancel: {
                            title: translate('modal.common.cancel'),
                            onClick: onCancel,
                        },
                        publish: {
                            title: translate('modal.common.waiting'),
                            color: 'primary',
                            disabled: true,
                            spinner: true,
                        },
                    }}
                >
                    <div>
                        <p><Translate value="modal.completePublish.started.message" dangerousHTML /></p>
                    </div>
                </Dialog>
            )

        case transactionStates.PENDING:
            return (
                <Dialog
                    onClose={onCancel}
                    title={translate('modal.completePublish.pending.title')}
                >
                    <div>
                        <Spinner size="large" className={styles.icon} />
                        <Translate tag="p" value="modal.common.waitingForBlockchain" marketplaceLink={links.main} dangerousHTML />
                    </div>
                </Dialog>
            )

        case transactionStates.CONFIRMED:
            return (
                <Dialog
                    onClose={onCancel}
                    title={translate('modal.completePublish.confirmed.title')}
                >
                    <div>
                        <CheckmarkIcon size="large" className={styles.icon} />
                    </div>
                </Dialog>
            )

        case transactionStates.FAILED:
            return (
                <Dialog
                    onClose={onCancel}
                    title={translate('modal.completePublish.failed.title')}
                >
                    <div>
                        <WalletErrorIcon />
                        <p><Translate value="modal.completePublish.failed.message" dangerousHTML /></p>
                    </div>
                </Dialog>
            )

        default:
            return null
    }
}

export default withI18n(CompletePublishDialog)
