import React, { useMemo } from 'react'
import { MDXProvider } from '@mdx-js/react'
import SimpleReactLightbox from 'simple-react-lightbox'
import { useLocation } from 'react-router-dom'
import Layout from '$shared/components/Layout'
import Navigation from './Navigation'
import Components from '$docs/mdxConfig'
import docsMap from '$docs/docsMap'
import PageTurner from '$docs/components/PageTurner'
import DocsContainer from '$shared/components/Container/Docs'
import styles from './docsLayout.pcss'
import DocsNav from './DocsNav'
import BusLine from '$shared/components/BusLine'
import Button from '$shared/components/Button'
import SvgIcon from '$shared/components/SvgIcon'

const DocsLayout = ({ nav = <DocsNav />, staticContext, ...props }) => {
    const { pathname } = useLocation()

    const editFilePath = useMemo(() => {
        let path = null
        Object.values(docsMap).some((doc) => {
            const found = Object.values(doc).find((subdoc) => subdoc.path === pathname)
            if (found) {
                path = found.filePath
                return true
            }
            return false
        })
        return path
    }, [pathname])

    return (
        <SimpleReactLightbox>
            <Layout
                className={styles.docsLayout}
                footer
                nav={nav}
            >
                <Navigation
                    responsive
                />
                <DocsContainer>
                    <div className={styles.grid}>
                        <div>
                            <Navigation />
                        </div>
                        <div className={styles.content}>
                            {editFilePath && (
                                <Button
                                    className={styles.editButton}
                                    tag="a"
                                    href={`https://github.com/streamr-dev/streamr-platform/edit/development/app/src/docs/content/${editFilePath}`}
                                    kind="secondary"
                                    size="mini"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <SvgIcon name="github" className={styles.githubIcon} />
                                    Edit on GitHub
                                </Button>
                            )}
                            <BusLine dynamicScrollPosition>
                                <MDXProvider components={Components}>
                                    <div {...props} />
                                </MDXProvider>
                            </BusLine>
                            <PageTurner />
                        </div>
                    </div>
                </DocsContainer>
            </Layout>
        </SimpleReactLightbox>
    )
}

export default DocsLayout
