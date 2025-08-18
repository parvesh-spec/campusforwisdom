import { useState } from "react";
import { Button } from "@/components/ui/button";
import InstructorApplicationModal from "@/components/InstructorApplicationModal";
import { Users, BookOpen, DollarSign, Award, CheckCircle, ArrowRight } from "lucide-react";

export default function BecomeInstructor() {
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const benefits = [
    {
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      title: "Earn While Teaching",
      description: "Set your own rates and earn competitive income by sharing your AI expertise with students worldwide."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Build Your Community",
      description: "Connect with passionate learners and build a loyal following of students interested in AI."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      title: "Flexible Teaching",
      description: "Choose your own schedule and teaching format - live sessions, courses, or 1:1 consultations."
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      title: "Professional Growth",
      description: "Enhance your professional profile and establish yourself as a thought leader in AI."
    }
  ];

  const requirements = [
    "Proven experience in AI, Machine Learning, or related technologies",
    "Strong communication skills and passion for teaching",
    "Portfolio of work or professional background in AI field",
    "Commitment to creating quality educational content",
    "Ability to explain complex concepts in simple terms"
  ];

  const steps = [
    {
      number: "01",
      title: "Submit Application",
      description: "Fill out our comprehensive application form with your background and expertise."
    },
    {
      number: "02", 
      title: "Review Process",
      description: "Our team reviews your application and credentials within 3-5 business days."
    },
    {
      number: "03",
      title: "Interview",
      description: "Selected candidates participate in a brief interview to discuss teaching approach."
    },
    {
      number: "04",
      title: "Start Teaching",
      description: "Once approved, you can start creating courses and hosting live sessions."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-6 py-2">
              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Join Our Expert Community</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-white">Become an</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  AI Instructor
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Share your AI expertise with thousands of eager learners. Build your reputation, 
                grow your income, and help shape the future of AI education.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => setShowApplicationModal(true)}
              >
                <Users className="mr-2 h-5 w-5" />
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 text-blue-600 dark:text-blue-400"
                onClick={() => window.location.href = '/ai-experts'}
              >
                View All Instructors
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Teach with CampusForWisdom?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join our community of expert instructors and enjoy the benefits of teaching on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Instructor Requirements
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                We're looking for passionate AI experts who want to make a difference in education.
              </p>
              
              <div className="space-y-4">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 p-8 text-white">
                <div className="h-full flex flex-col justify-center text-center space-y-6">
                  <div className="text-4xl font-bold">500+</div>
                  <div className="text-lg">Active Students</div>
                  <div className="text-sm opacity-90">Join our growing community of learners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How to Get Started
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our simple 4-step process to become an approved instructor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-bold">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Teaching?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of expert instructors and start sharing your knowledge with students worldwide.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowApplicationModal(true)}
            >
              <Users className="mr-2 h-5 w-5" />
              Apply to Become an Instructor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      <InstructorApplicationModal
        isOpen={showApplicationModal}
        onOpenChange={setShowApplicationModal}
        onClose={() => setShowApplicationModal(false)}
      />
    </div>
  );
}