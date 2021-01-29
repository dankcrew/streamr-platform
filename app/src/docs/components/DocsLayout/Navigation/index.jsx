// @flow

import React, { useState, useMemo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import cx from 'classnames'
import styled from 'styled-components'

import scrollTo from '$shared/utils/scrollTo'
import ElevatedContainer from '$shared/components/ElevatedContainer'
import SvgIcon from '$shared/components/SvgIcon'
import docsMap from '$docs/docsMap'
import { LG, XL } from '$shared/utils/styled'

import Search from '../../Search'
import TableOfContents from './TableOfContents'

import styles from './navigation.pcss'

const ButtonBase = styled.button`
    appearance: none;
    border: 0;
    background: transparent;
    margin: 0;
    padding: 8px;
    line-height: 16px;

    svg {
        color: #A3A3A3;
        width: 16px;
        height: 16px;
    }

    :focus {
        outline: none;
    }
`

const MobileSearchButton = styled(ButtonBase)`
    display: inline-block;
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);

    @media (min-width: ${LG}px) {
        display: none;
    }

    :focus {
        svg {
            color: #323232;
        }
    }
}
`

const SearchButtonText = styled.span`
    font-size: 14px;
`

const Key = styled.span`
    display: inline-block;
    background-color: #E7E7E7;
    color: #A3A3A3;
    border-radius: 2px;
    font-size: 10px;
    width: 14px;
    height: 14px;
    text-align: center;
    padding-left: 1px;
`

const DesktopSearchButton = styled(ButtonBase)`
    display: none;
    position: absolute;
    left: -8px;
    top: -4rem;
    color: #323232;
    background-color: #F8F8F8;
    border-radius: 4px;
    width: 124px;
    height: 32px;
    cursor: pointer;

    :hover,
    :active {
        background-color: #F3F3F3;
    }

    @media (min-width: ${LG}px) {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    @media (min-width: ${XL}px) {
        top: -5rem;
    }

    ${SearchButtonText} {
        flex-grow: 1;
    }

    ${Key} + ${Key} {
        margin-left: 2px;
    }
`

type Props = {
    className: String,
    responsive?: boolean,
}

const Navigation = ({ className, responsive }: Props) => {
    const [compressed, setCompressed] = useState(true)
    const [isSearching, setIsSearching] = useState(false)
    const { pathname } = useLocation()

    const [topLevelTitle, secondLevelTitle] = useMemo(() => {
        const topTitle = Object.keys(docsMap)
            .find((topLevelNavItem) => pathname.indexOf(docsMap[topLevelNavItem].root.path) === 0)

        const secondTitle = !!topTitle && !!docsMap[topTitle] && Object.keys(docsMap[topTitle])
            .find((secondLevelNavItem) => pathname === docsMap[topTitle][secondLevelNavItem].path)

        return [
            topTitle || '',
            secondTitle || 'root',
        ]
    }, [pathname])

    const mobileHeader = useMemo(() => {
        if (secondLevelTitle !== 'root') {
            return `${topLevelTitle} > ${secondLevelTitle}`
        }

        return topLevelTitle
    }, [secondLevelTitle, topLevelTitle])

    const scrollTop = useCallback(() => {
        scrollTo(document.getElementById('root'))
    }, [])

    const toggleExpand = useCallback(() => {
        scrollTop()

        setCompressed((wasCompressed) => !wasCompressed)
    }, [scrollTop])

    const toggleOverlay = useCallback(() => {
        setIsSearching((wasSearching) => !wasSearching)
    }, [])

    return (
        <React.Fragment>
            {isSearching && <Search toggleOverlay={toggleOverlay} />}
            <MobileSearchButton
                type="button"
                onClick={() => toggleOverlay()}
            >
                <SvgIcon name="search" />
            </MobileSearchButton>
            <ElevatedContainer
                offset="64"
                className={cx(className, styles.navigationContainer, {
                    [styles.compressed]: compressed,
                    [styles.mobileNav]: responsive,
                    [styles.desktopNav]: !responsive,
                })}
                onClick={() => toggleExpand()}
            >
                {!isSearching && (
                    <DesktopSearchButton
                        type="button"
                        onClick={() => toggleOverlay()}
                    >
                        <SvgIcon name="search" />
                        <SearchButtonText>Search</SearchButtonText>
                        <Key>⌘</Key>
                        <Key>K</Key>
                    </DesktopSearchButton>
                )}
                <ul className={cx(styles.navList, {
                    container: responsive,
                })}
                >
                    {!!responsive && (
                        <li className={cx(styles.navListItem, styles.mobileHeader)}>
                            <Link to="#">
                                {mobileHeader}
                            </Link>
                        </li>
                    )}
                    <TableOfContents />
                </ul>
                <SvgIcon name="back" className={styles.arrowExtender} />
            </ElevatedContainer>
        </React.Fragment>
    )
}

export default Navigation
