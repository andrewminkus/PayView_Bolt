import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, CreditCard, FlipVertical as Analytics, Upload } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-glow/10 rounded-full blur-2xl -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Monetize Your Digital Content
              <br />
              <span className="text-gradient">Instantly</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
              Create secure paywalls for your digital files in minutes. Upload, set a price, and start earning from your content with direct Stripe payouts.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
              <Link to="/signup">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold shadow-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105">
                  Start Selling Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Everything you need to sell digital content
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              PayView provides all the tools creators need to monetize their work
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-6 shadow-lg">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Easy Upload</CardTitle>
                <CardDescription>
                  Upload any digital file and create a paywall in seconds
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-6 shadow-lg">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Secure Payments</CardTitle>
                <CardDescription>
                  Stripe integration with direct payouts to your bank account
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-6 shadow-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Content Protection</CardTitle>
                <CardDescription>
                  Screenshot prevention and secure content delivery
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-6 shadow-lg">
                  <Analytics className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Sales Analytics</CardTitle>
                <CardDescription>
                  Track your earnings and best-selling content
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary-glow/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              How PayView Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="text-center group">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="mt-8 text-xl font-bold text-gray-900">Upload Your Content</h3>
              <p className="mt-4 text-gray-600 max-w-sm mx-auto">
                Upload any digital file - PDFs, images, videos, or documents
              </p>
            </div>

            <div className="text-center group">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="mt-8 text-xl font-bold text-gray-900">Set Your Price</h3>
              <p className="mt-4 text-gray-600 max-w-sm mx-auto">
                Choose your price and configure protection settings
              </p>
            </div>

            <div className="text-center group">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="mt-8 text-xl font-bold text-gray-900">Share & Earn</h3>
              <p className="mt-4 text-gray-600 max-w-sm mx-auto">
                Share your unique paywall link and start earning money
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary-glow/5" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
              Ready to start earning?
            </h2>
            <p className="text-xl leading-8 text-gray-600 max-w-2xl mx-auto mb-10">
              Join thousands of creators who are already monetizing their content with PayView
            </p>
            <div className="flex items-center justify-center">
              <Link to="/signup">
                <Button size="lg" className="px-12 py-4 text-lg font-semibold shadow-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}