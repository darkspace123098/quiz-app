import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2, Shield, Zap, BarChart3, Users, Globe,
  ChevronRight, ArrowRight, Star, PlayCircle, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeAwareLogo from "@/components/ThemeAwareLogo";

export default function LandingPage() {
  const features = [
    {
      title: "AI-Powered Proctoring",
      description: "Next-gen face detection and behavioral analysis that guarantees exam integrity.",
      icon: <Shield className="w-12 h-12 text-purple-500" />,
      tag: "Security"
    },
    {
      title: "Instant Live Insights",
      description: "Watch results stream in real-time with beautiful, data-rich visualizations.",
      icon: <BarChart3 className="w-12 h-12 text-blue-500" />,
      tag: "Analytics"
    },
    {
      title: "Limitless Scaling",
      description: "Our serverless architecture handles 1 or 100,000 contestants without a blink.",
      icon: <Zap className="w-12 h-12 text-amber-500" />,
      tag: "Performance"
    },
    {
      title: "Collaborative Admin",
      description: "Granular roles and permissions for seamless teamwork across your institution.",
      icon: <Users className="w-12 h-12 text-emerald-500" />,
      tag: "Teams"
    },
    {
      title: "Enterprise Security",
      description: "End-to-end encryption and ISO-compliant data handling for your peace of mind.",
      icon: <Lock className="w-12 h-12 text-indigo-500" />,
      tag: "Compliance"
    },
    {
      title: "Global Reach",
      description: "Localized in 20+ languages and optimized for even the slowest connections.",
      icon: <Globe className="w-12 h-12 text-rose-500" />,
      tag: "Global"
    },
  ];

  const pricing = [
    {
      name: "Free Trial",
      price: "₹0",
      description: "Experience the power of IntelliQuiz for free.",
      features: ["Up to 10 Contestants", "Basic Proctoring", "1 Active Quiz", "Community Support"],
    },
    {
      name: "Starter",
      price: "₹299",
      description: "Ideal for individual educators and small classes.",
      features: ["Up to 100 Contestants", "Standard Proctoring", "10 Monthly Quizzes", "Email Support"],
    },
    {
      name: "Professional",
      price: "₹599",
      description: "Full power for growing schools and organizations.",
      features: ["Unlimited Contestants", "AI Video Proctoring", "Unlimited Quizzes", "Priority 24/7 Support"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "White-labeled solutions for global institutions.",
      features: ["SSO Integration", "Custom Domain", "Dedicated Manager", "On-premise Options"],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30 font-sans">

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px] animate-pulse-slow delay-500"></div>
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] rounded-full bg-indigo-600/10 blur-[80px] animate-pulse-slow delay-200"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600">
              <ThemeAwareLogo className="h-7 w-auto brightness-0 invert" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              INTELLIQUIZ
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <a href="#features" className="text-sm font-semibold hover:text-purple-600 transition-colors uppercase tracking-widest">Features</a>
            <a href="#pricing" className="text-sm font-semibold hover:text-purple-600 transition-colors uppercase tracking-widest">Pricing</a>
            <div className="h-4 w-px bg-border"></div>
            <Link to="/admin/login">
              <Button variant="ghost" className="font-bold">Login</Button>
            </Link>
            <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 px-6 font-bold">
              GET STARTED
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-purple-500/30 text-purple-600 text-sm font-bold tracking-wide">
                <Star className="w-4 h-4 fill-purple-600" />
                <span>#1 RATED QUIZ PLATFORM 2026</span>
              </div>

              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                REINVENTING <br />
                <span className="text-gradient">EXAMINATIONS.</span>
              </h1>

              <p className="text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                The most advanced SaaS engine for secure, automated, and insightful assessments.
                Built for teams who demand absolute integrity and deep data.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Button size="lg" className="h-16 px-10 text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-2xl shadow-purple-600/40 group">
                  Start Your Free Trial <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold border-2 gap-3 hover:bg-muted/50 transition-all">
                  <PlayCircle className="w-6 h-6" /> Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-slate-200 overflow-hidden shadow-xl ring-2 ring-purple-500/10">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="user" />
                    </div>
                  ))}
                </div>
                <div className="space-y-0.5">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">
                    TRUSTED BY 15,000+ UNIVERSITIES
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative animate-float">
              <div className="absolute -inset-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-[3rem] blur-[80px] opacity-20"></div>
              <div className="relative glass p-4 rounded-[2.5rem] shadow-[0_0_100px_rgba(147,51,234,0.15)] group">
                <img
                  src="/hero-mockup.png"
                  alt="Actual Admin Dashboard"
                  className="w-full rounded-[1.8rem] shadow-2xl group-hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Floating UI Badges */}
                <div className="absolute -top-12 -right-8 glass p-5 rounded-2xl shadow-2xl animate-float delay-300">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-sm uppercase tracking-tighter">LIVE DASHBOARD</span>
                  </div>
                </div>

                <div className="absolute -bottom-10 -left-10 glass p-6 rounded-2xl shadow-2xl animate-float delay-1000">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Success Rate</p>
                  <div className="text-3xl font-black text-purple-600">99.9%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-muted/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { label: "Quizzes Hosted", value: "2.4M+" },
              { label: "Fraud Prevented", value: "850K+" },
              { label: "Active Institutions", value: "15,000+" },
              { label: "Avg. ROI", value: "320%" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl lg:text-5xl font-black text-gradient">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-none">
              DESIGNED FOR THE <br />
              <span className="text-purple-600 italic">HIGHEST STAKES.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              We've over-engineered every detail to ensure you never have to worry about security, scale, or stability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <Card key={i} className="group relative overflow-hidden border-2 border-transparent hover:border-purple-500/30 transition-all duration-500 glass p-2 hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  {feature.icon}
                </div>
                <CardHeader className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-500">
                    <div className="group-hover:text-white transition-colors duration-500">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="text-xs font-black text-purple-600 uppercase tracking-widest">{feature.tag}</div>
                  <CardTitle className="text-2xl font-bold tracking-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg font-medium leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full mesh-gradient opacity-40"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight">SCALE YOUR POTENTIAL</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
              Flexible pricing that grows with your organization. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-stretch">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={`group relative flex flex-col p-10 rounded-[2.5rem] border-2 transition-all duration-500 ${plan.popular
                  ? 'bg-purple-600 border-purple-400 scale-105 shadow-[0_0_80px_rgba(147,51,234,0.4)] text-white'
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-100'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-white text-purple-600 text-sm font-black rounded-full shadow-xl uppercase tracking-tighter">
                    RECOMMENDED
                  </div>
                )}

                <div className="mb-10">
                  <h3 className="text-2xl font-black mb-3 uppercase tracking-widest">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-6xl font-black">{plan.price}</span>
                    {plan.price !== "Custom" && <span className={plan.popular ? 'text-purple-200' : 'text-slate-500'}>/month</span>}
                  </div>
                  <p className={`text-lg font-medium ${plan.popular ? 'text-purple-100' : 'text-slate-400'}`}>{plan.description}</p>
                </div>

                <div className="space-y-5 mb-12 flex-1">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-4 text-base font-semibold">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.popular ? 'bg-white/20' : 'bg-purple-600/20'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${plan.popular ? 'text-white' : 'text-purple-500'}`} />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`h-16 text-lg font-black rounded-2xl shadow-xl transition-all ${plan.popular
                    ? 'bg-white text-purple-600 hover:bg-slate-100'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                >
                  {plan.price === "Custom" ? "Contact Us" : "Start Free Trial"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-background border-t">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600">
                  <ThemeAwareLogo className="h-6 w-auto brightness-0 invert" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">INTELLIQUIZ</span>
              </div>
              <p className="text-xl text-muted-foreground font-medium max-w-sm leading-relaxed">
                The world's most secure and scalable engine for modern assessments.
                Trusted by 15,000+ organizations.
              </p>
            </div>

            <div className="space-y-6 text-sm font-bold uppercase tracking-widest">
              <div className="text-muted-foreground">Product</div>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Proctoring</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-6 text-sm font-bold uppercase tracking-widest">
              <div className="text-muted-foreground">Legal</div>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t gap-6">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              © 2026 INTELLIQUIZ SAAS. All Rights Reserved.
            </p>
            <div className="flex items-center gap-8">
              {['Twitter', 'LinkedIn', 'YouTube', 'Discord'].map(social => (
                <a key={social} href="#" className="text-sm font-bold text-muted-foreground hover:text-purple-600 transition-colors uppercase tracking-widest">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
