import Link from "next/link";
import { ArrowRight, Shield, Zap, Heart, Globe, Star, Users, DollarSign, Clock, CheckCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { getRoleBasedRedirect } from "@/lib/auth-utils";
import { InteractiveElements } from "@/components/landing/interactive-elements";
import { MobileMenu } from "@/components/landing/mobile-menu";

export default async function HomePage() {
  const user = await getCurrentUser();

  // If user is authenticated, redirect to their dashboard
  if (user) {
    redirect(getRoleBasedRedirect(user.role));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-forest-50 via-background to-green-olive-50">
      <InteractiveElements />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-green-forest-800/95 backdrop-blur-xl border-b border-green-forest-700/20">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-green-forest-500 to-green-olive-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">TransferApp</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium">
                How it Works
              </a>
              <a href="#pricing" className="text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium">
                Pricing
              </a>
              <a href="#support" className="text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium">
                Support
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth?tab=signin"
                className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth?tab=signup"
                className="bg-gradient-to-r from-green-olive-500 to-green-forest-500 hover:from-green-olive-600 hover:to-green-forest-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 animate-on-scroll">
              <span className="inline-block px-4 py-2 bg-green-olive-100 text-green-olive-800 rounded-full text-sm font-semibold mb-6">
                🇲🇬 Connecting Hearts Across Oceans
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-forest-800 via-green-forest-600 to-green-olive-600 bg-clip-text text-transparent mb-6 leading-tight animate-on-scroll">
              Bridge Hearts Across Oceans
            </h1>
            
            <p className="text-xl md:text-2xl text-green-forest-700 mb-8 leading-relaxed max-w-3xl mx-auto animate-on-scroll">
              Experience the future of family support with secure, lightning-fast money transfers to Madagascar. 
              Every transfer carries love, dreams, and the promise of a brighter tomorrow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-on-scroll">
              <Link
                href="/auth?tab=signup"
                className="group bg-gradient-to-r from-green-forest-600 to-green-olive-600 hover:from-green-forest-700 hover:to-green-olive-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Begin Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <a
                href="#how-it-works"
                className="border-2 border-green-forest-300 text-green-forest-700 hover:bg-green-forest-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:border-green-forest-400"
              >
                Discover the Magic
              </a>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "50K+", label: "Families Connected" },
              { number: "$10M+", label: "Transferred Monthly" },
              { number: "99.8%", label: "Success Rate" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <div key={index} className="text-center animate-on-scroll">
                <div className="text-3xl font-bold text-green-forest-600 mb-2">{stat.number}</div>
                <div className="text-green-forest-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-green-forest-800 mb-4">
              Why Families Choose TransferApp
            </h2>
            <p className="text-xl text-green-forest-600 max-w-3xl mx-auto">
              More than technology – it's about human connection, trust, and the seamless flow of love across continents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Speed",
                description: "From your heart to their hands in under 60 seconds. Direct mobile money integration means your family receives money faster than sending a text."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Fort Knox Security",
                description: "Your trust is sacred to us. Military-grade encryption, biometric authentication, and real-time fraud detection keep your transfers safer than traditional banks."
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Personal Touch",
                description: "Every transfer tells your story. Add personal messages, celebrate special occasions, and let your family feel your presence with every transaction."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Universal Access",
                description: "Support your family from anywhere in the world. Desktop, mobile, tablet – your love knows no boundaries with our responsive platform."
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Crystal Clear Pricing",
                description: "What you see is what you pay. No sneaky fees, no hidden charges, no unpleasant surprises. Just honest, transparent pricing that respects your money."
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Family Dashboard",
                description: "Beautiful insights into your support history. Track your impact, celebrate milestones, and see how your love transforms lives across the ocean."
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 bg-gradient-to-br from-green-forest-50 to-white rounded-2xl border border-green-forest-100 hover:border-green-olive-300 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 animate-on-scroll">
                <div className="w-16 h-16 bg-gradient-to-br from-green-forest-500 to-green-olive-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-green-forest-800 mb-4">{feature.title}</h3>
                <p className="text-green-forest-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-green-forest-50 to-green-olive-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-green-forest-800 mb-4">
              Your Journey to Effortless Family Support
            </h2>
            <p className="text-xl text-green-forest-600 max-w-3xl mx-auto">
              Four simple steps to transform how you care for your loved ones in Madagascar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Welcome Home",
                description: "Join our family with a secure, verified account in under 3 minutes. We use bank-level identity verification to keep everyone safe."
              },
              {
                step: "2",
                title: "Connect Your Circle",
                description: "Add your loved ones with their mobile money details. Create personalized profiles and organize your family support beautifully."
              },
              {
                step: "3",
                title: "Design Your Impact",
                description: "Set up smart transfers that match your heart's rhythm. Weekly allowances, monthly support, or surprise gifts – you choose how love flows."
              },
              {
                step: "4",
                title: "Celebrate Together",
                description: "Watch your impact unfold through beautiful notifications, family updates, and milestone celebrations that bring everyone closer."
              }
            ].map((step, index) => (
              <div key={index} className="text-center group animate-on-scroll">
                <div className="w-16 h-16 bg-gradient-to-br from-green-forest-600 to-green-olive-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-green-forest-800 mb-4">{step.title}</h3>
                <p className="text-green-forest-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <h2 className="text-4xl md:text-5xl font-bold text-green-forest-800 mb-6 leading-tight">
                More Than Money – It's Love in Motion
              </h2>
              <p className="text-xl text-green-forest-600 mb-8 leading-relaxed">
                Every transfer on TransferApp carries more than currency. It carries your dreams for your family, 
                your commitment to their future, and your unwavering love that knows no distance.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time exchange rates that maximize every penny you send",
                  "Smart notifications that keep your entire family in the loop",
                  "Comprehensive transfer history with beautiful visual insights",
                  "Seamless integration with all major Malagasy mobile operators",
                  "Multilingual support in English, French, and Malagasy",
                  "Emergency transfer options for urgent family needs"
                ].map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-forest-500 mt-1 flex-shrink-0" />
                    <span className="text-green-forest-700 font-medium">{point}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/auth?tab=signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-forest-600 to-green-olive-600 hover:from-green-forest-700 hover:to-green-olive-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Transform Your Family Support
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="relative animate-on-scroll">
              <div className="bg-gradient-to-br from-green-forest-600 to-green-olive-600 rounded-3xl p-8 text-white text-center shadow-2xl">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Universal Access</h3>
                <p className="text-lg opacity-90 leading-relaxed">
                  Support your family from anywhere in the world. Desktop, mobile, tablet – your love knows no boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-forest-800 via-green-forest-700 to-green-olive-700 text-white">
        <div className="container mx-auto px-6 text-center animate-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Revolutionize Family Support?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
            Join thousands of families who've discovered a better way to stay connected. 
            Start your free trial today and experience the future of heartfelt money transfers to Madagascar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth?tab=signup"
              className="group bg-white text-green-forest-800 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/auth?tab=signin"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:border-white/50"
            >
              I Already Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-forest-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="animate-on-scroll">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-green-forest-500 to-green-olive-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className="text-xl font-bold">TransferApp</span>
              </div>
              <p className="text-white/80 leading-relaxed">
                Pioneering the future of family financial support. Where technology meets heart, 
                and every transfer builds bridges of love across oceans.
              </p>
            </div>
            
            <div className="animate-on-scroll">
              <h4 className="text-lg font-semibold mb-4 text-green-olive-300">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-white/80 hover:text-green-olive-300 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-white/80 hover:text-green-olive-300 transition-colors">How it Works</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Security</a></li>
                <li><a href="#pricing" className="text-white/80 hover:text-green-olive-300 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div className="animate-on-scroll">
              <h4 className="text-lg font-semibold mb-4 text-green-olive-300">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">System Status</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">24/7 Live Chat</a></li>
              </ul>
            </div>
            
            <div className="animate-on-scroll">
              <h4 className="text-lg font-semibold mb-4 text-green-olive-300">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">About Our Mission</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Careers</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Press & Media</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Partner Program</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center text-white/60 animate-on-scroll">
            <p>&copy; 2025 TransferApp. Bridging hearts across oceans.</p>
            <p className="mt-2">
              <a href="#" className="hover:text-green-olive-300 transition-colors">Privacy Policy</a> • 
              <a href="#" className="hover:text-green-olive-300 transition-colors ml-2">Terms of Service</a> • 
              <a href="#" className="hover:text-green-olive-300 transition-colors ml-2">Cookie Policy</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-forest-50 via-background to-green-olive-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-green-forest-800/95 backdrop-blur-xl border-b border-green-forest-700/20">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-green-forest-500 to-green-olive-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">TransferApp</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium">
                How it Works
              </a>
              <a href="#pricing" className="text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium">
                Pricing
              </a>
              <a href="#support" className="text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium">
                Support
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth?tab=signin"
                className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth?tab=signup"
                className="bg-gradient-to-r from-green-olive-500 to-green-forest-500 hover:from-green-olive-600 hover:to-green-forest-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-green-olive-100 text-green-olive-800 rounded-full text-sm font-semibold mb-6">
                🇲🇬 Connecting Hearts Across Oceans
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-forest-800 via-green-forest-600 to-green-olive-600 bg-clip-text text-transparent mb-6 leading-tight">
              Bridge Hearts Across Oceans
            </h1>
            
            <p className="text-xl md:text-2xl text-green-forest-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Experience the future of family support with secure, lightning-fast money transfers to Madagascar. 
              Every transfer carries love, dreams, and the promise of a brighter tomorrow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth?tab=signup"
                className="group bg-gradient-to-r from-green-forest-600 to-green-olive-600 hover:from-green-forest-700 hover:to-green-olive-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Begin Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <a
                href="#how-it-works"
                className="border-2 border-green-forest-300 text-green-forest-700 hover:bg-green-forest-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:border-green-forest-400"
              >
                Discover the Magic
              </a>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-forest-600 mb-2">50K+</div>
              <div className="text-green-forest-500 font-medium">Families Connected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-forest-600 mb-2">$10M+</div>
              <div className="text-green-forest-500 font-medium">Transferred Monthly</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-forest-600 mb-2">99.8%</div>
              <div className="text-green-forest-500 font-medium">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-forest-600 mb-2">24/7</div>
              <div className="text-green-forest-500 font-medium">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-green-forest-800 mb-4">
              Why Families Choose TransferApp
            </h2>
            <p className="text-xl text-green-forest-600 max-w-3xl mx-auto">
              More than technology – it's about human connection, trust, and the seamless flow of love across continents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Speed",
                description: "From your heart to their hands in under 60 seconds. Direct mobile money integration means your family receives money faster than sending a text."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Fort Knox Security",
                description: "Your trust is sacred to us. Military-grade encryption, biometric authentication, and real-time fraud detection keep your transfers safer than traditional banks."
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Personal Touch",
                description: "Every transfer tells your story. Add personal messages, celebrate special occasions, and let your family feel your presence with every transaction."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Universal Access",
                description: "Support your family from anywhere in the world. Desktop, mobile, tablet – your love knows no boundaries with our responsive platform."
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Crystal Clear Pricing",
                description: "What you see is what you pay. No sneaky fees, no hidden charges, no unpleasant surprises. Just honest, transparent pricing that respects your money."
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Family Dashboard",
                description: "Beautiful insights into your support history. Track your impact, celebrate milestones, and see how your love transforms lives across the ocean."
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 bg-gradient-to-br from-green-forest-50 to-white rounded-2xl border border-green-forest-100 hover:border-green-olive-300 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-green-forest-500 to-green-olive-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-green-forest-800 mb-4">{feature.title}</h3>
                <p className="text-green-forest-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-green-forest-50 to-green-olive-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-green-forest-800 mb-4">
              Your Journey to Effortless Family Support
            </h2>
            <p className="text-xl text-green-forest-600 max-w-3xl mx-auto">
              Four simple steps to transform how you care for your loved ones in Madagascar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Welcome Home",
                description: "Join our family with a secure, verified account in under 3 minutes. We use bank-level identity verification to keep everyone safe."
              },
              {
                step: "2",
                title: "Connect Your Circle",
                description: "Add your loved ones with their mobile money details. Create personalized profiles and organize your family support beautifully."
              },
              {
                step: "3",
                title: "Design Your Impact",
                description: "Set up smart transfers that match your heart's rhythm. Weekly allowances, monthly support, or surprise gifts – you choose how love flows."
              },
              {
                step: "4",
                title: "Celebrate Together",
                description: "Watch your impact unfold through beautiful notifications, family updates, and milestone celebrations that bring everyone closer."
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-forest-600 to-green-olive-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-green-forest-800 mb-4">{step.title}</h3>
                <p className="text-green-forest-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-green-forest-800 mb-6 leading-tight">
                More Than Money – It's Love in Motion
              </h2>
              <p className="text-xl text-green-forest-600 mb-8 leading-relaxed">
                Every transfer on TransferApp carries more than currency. It carries your dreams for your family, 
                your commitment to their future, and your unwavering love that knows no distance.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time exchange rates that maximize every penny you send",
                  "Smart notifications that keep your entire family in the loop",
                  "Comprehensive transfer history with beautiful visual insights",
                  "Seamless integration with all major Malagasy mobile operators",
                  "Multilingual support in English, French, and Malagasy",
                  "Emergency transfer options for urgent family needs"
                ].map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-forest-500 mt-1 flex-shrink-0" />
                    <span className="text-green-forest-700 font-medium">{point}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/auth?tab=signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-forest-600 to-green-olive-600 hover:from-green-forest-700 hover:to-green-olive-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Transform Your Family Support
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-green-forest-600 to-green-olive-600 rounded-3xl p-8 text-white text-center shadow-2xl">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Universal Access</h3>
                <p className="text-lg opacity-90 leading-relaxed">
                  Support your family from anywhere in the world. Desktop, mobile, tablet – your love knows no boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-forest-800 via-green-forest-700 to-green-olive-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Revolutionize Family Support?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
            Join thousands of families who've discovered a better way to stay connected. 
            Start your free trial today and experience the future of heartfelt money transfers to Madagascar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth?tab=signup"
              className="group bg-white text-green-forest-800 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/auth?tab=signin"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:border-white/50"
            >
              I Already Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-forest-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-green-forest-500 to-green-olive-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className="text-xl font-bold">TransferApp</span>
              </div>
              <p className="text-white/80 leading-relaxed">
                Pioneering the future of family financial support. Where technology meets heart, 
                and every transfer builds bridges of love across oceans.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-olive-300">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-white/80 hover:text-green-olive-300 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-white/80 hover:text-green-olive-300 transition-colors">How it Works</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Security</a></li>
                <li><a href="#pricing" className="text-white/80 hover:text-green-olive-300 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-olive-300">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">System Status</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">24/7 Live Chat</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-olive-300">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">About Our Mission</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Careers</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Press & Media</a></li>
                <li><a href="#" className="text-white/80 hover:text-green-olive-300 transition-colors">Partner Program</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center text-white/60">
            <p>&copy; 2025 TransferApp. Bridging hearts across oceans.</p>
            <p className="mt-2">
              <a href="#" className="hover:text-green-olive-300 transition-colors">Privacy Policy</a> • 
              <a href="#" className="hover:text-green-olive-300 transition-colors ml-2">Terms of Service</a> • 
              <a href="#" className="hover:text-green-olive-300 transition-colors ml-2">Cookie Policy</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
