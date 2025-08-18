import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, TrendingUp, BookOpen, Lightbulb, Play, FileText, Video, UserCheck, Globe, Shield, Clock, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Expert, LiveSession, Ebook } from "@shared/schema";

export default function About() {
  // Fetch real platform data
  const { data: stats } = useQuery<{
    totalStudents: number;
    totalCourses: number;
    averageRating: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: liveSessions } = useQuery<LiveSession[]>({
    queryKey: ["/api/live-sessions"],
  });

  const { data: experts } = useQuery<Expert[]>({
    queryKey: ["/api/featured/experts"],
  });

  const { data: ebooks } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  const platformFeatures = [
    {
      icon: BookOpen,
      title: "Comprehensive Courses",
      description: "Self-paced AI courses covering software development, video creation, and presentation design with practical projects."
    },
    {
      icon: Video,
      title: "Live Learning Sessions",
      description: "Interactive webinars and workshops led by expert instructors with real-time Q&A and collaboration."
    },
    {
      icon: FileText,
      title: "Digital eBooks",
      description: "Extensive library of AI resources, guides, and reference materials for continuous learning."
    },
    {
      icon: UserCheck,
      title: "Expert Consultations",
      description: "Connect with industry professionals for personalized guidance and career mentorship."
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Democratizing AI education and making cutting-edge skills accessible to everyone worldwide."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a supportive learning ecosystem where students, instructors, and experts collaborate."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Maintaining the highest standards in course quality, instructor expertise, and student outcomes."
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Protecting user data with enterprise-grade security and transparent privacy policies."
    }
  ];

  // Calculate real platform statistics
  const totalResources = (stats?.totalCourses || 0) + (ebooks?.length || 0);
  
  const keyStats = [
    {
      icon: Users,
      number: `${stats?.totalStudents || 0}+`,
      label: "Active Students",
      description: "Learners actively enrolled"
    },
    {
      icon: BookOpen,
      number: `${totalResources}+`,
      label: "Courses & Resources",
      description: "Complete learning materials"
    },
    {
      icon: Video,
      number: `${liveSessions?.length || 0}+`,
      label: "Live Sessions",
      description: "Interactive learning experiences"
    },
    {
      icon: Star,
      number: `${stats?.averageRating || 4.8}/5`,
      label: "Student Rating",
      description: "Platform satisfaction score"
    }
  ];

  const team = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Founder & Chief AI Officer",
      description: "15+ years in AI research at IIT Delhi. Former AI lead at Microsoft India with expertise in machine learning and neural networks.",
      avatar: "RK",
      specialization: "AI Research & Strategy"
    },
    {
      name: "Priya Sharma",
      role: "Head of Curriculum Development",
      description: "Ex-Google AI researcher with PhD in Machine Learning from Stanford. Designed curriculum for 10,000+ students.",
      avatar: "PS",
      specialization: "Educational Technology"
    },
    {
      name: "Arjun Patel",
      role: "Director of Technology",
      description: "Serial entrepreneur who built AI products used by millions. Expert in scalable educational platforms.",
      avatar: "AP",
      specialization: "Platform Engineering"
    },
    {
      name: "Dr. Anita Desai",
      role: "Director of Student Success",
      description: "Former academic director at leading universities. Specializes in online learning effectiveness and student engagement.",
      avatar: "AD",
      specialization: "Student Experience"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="gradient-text">CampusForWisdom</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            A comprehensive AI education platform combining self-paced courses, live learning sessions, 
            digital resources, and expert consultations to empower the next generation of AI innovators.
          </p>
        </div>

        {/* Platform Features Overview */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Learning Ecosystem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform integrates multiple learning modalities to provide a comprehensive AI education experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Statistics */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Platform Impact</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Trusted by thousands of learners worldwide to advance their AI skills and careers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {keyStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.number}</div>
                    <div className="text-lg font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm opacity-80">{stat.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded in 2024, CampusForWisdom emerged from recognizing the gap between traditional AI education 
              and practical industry needs. We observed that learners needed more than just theoretical knowledge—they 
              required hands-on experience, real-time guidance, and access to industry experts.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our solution integrates self-paced courses with live interactive sessions, comprehensive digital resources, 
              and direct access to AI experts. This multi-modal approach ensures learners can progress at their own 
              pace while receiving immediate support when needed. Today, our platform serves students, instructors, 
              and industry professionals in a thriving educational ecosystem.
            </p>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Platform Capabilities</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>24/7 Learning Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Global Community</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure Platform</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Career Growth Focus</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Students collaborating on AI projects" 
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">Live Now</div>
                <div className="text-xs text-gray-600">Interactive Sessions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and help us create meaningful impact in AI education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to revolutionizing AI education through innovative platform design and expert instruction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {member.avatar}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1 mb-3">
                    {member.specialization}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission & Technology Section */}
        <div className="bg-white rounded-2xl p-8 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission & Technology</h2>
              <div className="space-y-5">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Learning Paths</h3>
                    <p className="text-gray-600">Self-paced courses combined with live sessions, eBooks, and expert consultations for complete skill development.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Video className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Interactive Live Sessions</h3>
                    <p className="text-gray-600">Real-time learning experiences with industry experts, Q&A sessions, and collaborative projects.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure & Scalable Platform</h3>
                    <p className="text-gray-600">Enterprise-grade security with cloud infrastructure supporting global accessibility and data protection.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <UserCheck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expert Network Access</h3>
                    <p className="text-gray-600">Direct connection to AI professionals for mentorship, career guidance, and specialized consultations.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Join Our Ecosystem</h3>
                <p className="mb-4 opacity-90">
                  Access courses, live sessions, eBooks, and expert consultations in one integrated platform.
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-gray-100"
                  onClick={() => window.location.href = '/courses'}
                >
                  Explore Platform
                </Button>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center text-sm">
                    <Play className="h-4 w-4 text-primary mx-auto mb-1" />
                    <div className="font-medium">Live Sessions</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center text-sm">
                    <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
                    <div className="font-medium">Self-Paced Courses</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center text-sm">
                    <FileText className="h-4 w-4 text-primary mx-auto mb-1" />
                    <div className="font-medium">Digital eBooks</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center text-sm">
                    <Users className="h-4 w-4 text-primary mx-auto mb-1" />
                    <div className="font-medium">Expert Network</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Start Your AI Learning Journey</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our comprehensive ecosystem with courses, live sessions, eBooks, and expert consultations. 
            Choose your preferred learning path and advance your AI skills today.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-primary/90 flex items-center justify-center space-x-2"
              onClick={() => window.location.href = '/courses'}
            >
              <BookOpen className="h-5 w-5" />
              <span>Browse Courses</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center space-x-2"
              onClick={() => window.location.href = '/live-sessions'}
            >
              <Video className="h-5 w-5" />
              <span>Live Sessions</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-secondary text-secondary hover:bg-secondary hover:text-white flex items-center justify-center space-x-2"
              onClick={() => window.location.href = '/ebooks'}
            >
              <FileText className="h-5 w-5" />
              <span>Digital eBooks</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white flex items-center justify-center space-x-2"
              onClick={() => window.location.href = '/ai-experts'}
            >
              <UserCheck className="h-5 w-5" />
              <span>Find Experts</span>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            All learning paths include progress tracking, certificates, and lifetime access to materials.
          </p>
        </div>
      </div>
    </div>
  );
}
