import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <p className="text-gray-600">Last updated: January 2025</p>
        </CardHeader>
        <CardContent className="prose prose-gray max-w-none">
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account,
            upload content, make a purchase, or contact us for support.
          </p>

          <h3>Account Information</h3>
          <ul>
            <li>Email address</li>
            <li>Username and profile information</li>
            <li>Payment information (processed securely through Stripe)</li>
          </ul>

          <h3>Content Information</h3>
          <ul>
            <li>Files you upload to our platform</li>
            <li>Metadata about your files (names, sizes, upload dates)</li>
            <li>Pricing and access settings you configure</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process transactions and send confirmations</li>
            <li>Send you technical notices and support messages</li>
            <li>Improve and develop our platform</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties
            except as described in this policy:
          </p>
          <ul>
            <li>With service providers who help us operate our platform (like Stripe for payments)</li>
            <li>When required by law or to protect our rights</li>
            <li>With your consent</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Update or correct your information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@payview.com">privacy@payview.com</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}