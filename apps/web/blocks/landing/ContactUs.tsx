"use client"
import type { ReactElement } from "react"
import { Mail, MapPin, Phone } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Icon, SiteFooter, SiteHeader } from "@/components/landing/ekarvo/SiteChrome"

// Website inner-page pattern on the paper surface; see LegalPageLayout.
const ContactUs = (): ReactElement => {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.landing.getLandingInfo.queryOptions())
    const contact = data.contactUs

    return (
        <div className="ek-site theme-ekarvo">
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
                <section className="page-hero">
                    <div className="container">
                        <p className="eyebrow">Contact</p>
                        <h1>Get in Touch</h1>
                        <p className="lead">We'd love to hear from you. Please reach out with any questions, feedback, or inquiries.</p>
                    </div>
                </section>

                <div className="container contact-grid">
                    <article className="contact-card">
                        <Icon icon={Mail} />
                        <h2>Email Support</h2>
                        <p>Our friendly team is here to help.</p>
                        <a href={`mailto:${contact?.supportEmailAddress}`}>{contact?.supportEmailAddress}</a>
                    </article>
                    <article className="contact-card">
                        <Icon icon={MapPin} />
                        <h2>Our Office</h2>
                        <p>Come say hello at our office HQ.</p>
                        <span>{contact?.address}</span>
                    </article>
                    <article className="contact-card">
                        <Icon icon={Phone} />
                        <h2>Phone</h2>
                        <p>Mon-Fri from 8am to 5pm.</p>
                        <span>{contact?.contactNumber}</span>
                    </article>
                </div>

                <div className="container contact-meta">
                    <p>Merchant Legal Entity Name: <strong>{contact?.companyLegalName}</strong></p>
                    <p>Last updated: {contact?.lastUpdated}</p>
                </div>
            </main>
            <SiteFooter />
        </div>
    )
}

export default ContactUs
