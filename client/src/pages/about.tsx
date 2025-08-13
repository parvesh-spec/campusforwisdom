import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, TrendingUp, BookOpen, Lightbulb } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Democratizing AI education and making cutting-edge skills accessible to everyone."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a supportive learning community where students help each other grow."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Maintaining the highest standards in course quality and student outcomes."
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Staying ahead of AI trends and continuously updating our curriculum."
    }
  ];

  const team = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Founder & Chief AI Officer",
      description: "15+ years in AI research at IIT Delhi. Former AI lead at Microsoft India.",
      avatar: "RK"
    },
    {
      name: "Priya Sharma",
      role: "Head of Curriculum",
      description: "Ex-Google AI researcher. PhD in Machine Learning from Stanford.",
      avatar: "PS"
    },
    {
      name: "Arjun Patel",
      role: "Director of Technology",
      description: "Serial entrepreneur. Built AI products used by millions of users.",
      avatar: "AP"
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
            We're on a mission to democratize AI education and empower the next generation of innovators 
            with practical, industry-relevant skills that transform careers and create opportunities.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded in 2023, CampusForWisdom emerged from a simple observation: while AI was transforming 
              every industry, quality AI education remained inaccessible to most people. Traditional education 
              was too theoretical, and online courses lacked practical, hands-on experience.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We set out to bridge this gap by creating an immersive learning platform that combines 
              cutting-edge curriculum with live mentorship, practical projects, and a supportive community. 
              Today, we're proud to have trained over 2,500 students who are now building AI-powered solutions 
              across industries.
            </p>
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2,500+</div>
                <div className="text-sm text-gray-600">Students Trained</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-gray-600">Job Placement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-gray-600">Industry Partners</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Students collaborating on AI projects" 
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry experts and educators passionate about sharing their knowledge and helping you succeed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl p-8 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Practical Education</h3>
                    <p className="text-gray-600">Teaching real-world AI skills through hands-on projects and industry-relevant curriculum.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Accessible Learning</h3>
                    <p className="text-gray-600">Making high-quality AI education affordable and accessible to learners from all backgrounds.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Innovation Focus</h3>
                    <p className="text-gray-600">Staying at the forefront of AI advancement and preparing students for future challenges.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Join Our Community</h3>
                <p className="mb-4 opacity-90">
                  Be part of a growing community of AI enthusiasts, professionals, and innovators.
                </p>
                <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  Get Started Today
                </Button>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Partnerships</h3>
                <p className="text-gray-600 mb-4">
                  We work with leading tech companies to ensure our curriculum stays relevant and our graduates are job-ready.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-gray-600">Google</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-gray-600">Microsoft</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-gray-600">OpenAI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already started their AI journey with CampusForWisdom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
              Explore Courses
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Schedule a Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
