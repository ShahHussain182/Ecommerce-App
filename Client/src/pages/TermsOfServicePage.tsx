import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, Variants } from 'framer-motion';

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }, // plain object, no function here
};

const TermsOfServicePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 md:py-32 overflow-hidden">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 5, ease: "easeOut" }}
            className="absolute inset-0 opacity-30 bg-cover bg-center" 
            style={{ backgroundImage: "url('/placeholder.svg')" }}
          ></motion.div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
            >
              Terms of Service
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="mt-4 max-w-2xl mx-auto text-lg text-white/90"
            >
              Your agreement to use our services.
            </motion.p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>By accessing and using the E-Store website and services, you agree to be bound by these Terms of Service and all terms incorporated by reference. If you do not agree to all of these terms, do not use our website or services.</p>
                <p>These Terms of Service apply to all visitors, users, and others who access or use the Service.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1  }} >
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">2. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">3. Your Account</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">4. Prohibited Conduct</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>You agree not to engage in any of the following prohibited activities:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
                  <li>Violating, or encouraging others to violate, any right of a third party, including by infringing or misappropriating any third-party intellectual property right.</li>
                  <li>Interfering with security-related features of the Service, including by (a) disabling or circumventing features that prevent or limit use or copying of any content; or (b) reverse engineering or otherwise attempting to discover the source code of the Service or any part thereof except to the extent that such activity is expressly permitted by applicable law.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.4  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">5. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of E-Store and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
                <p>Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of E-Store.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.5  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">6. Disclaimer of Warranties</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
                <p>E-Store does not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.6  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">7. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>In no event shall E-Store, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.7  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">8. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.</p>
                <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.8  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">9. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@e-store.com" className="text-blue-600 hover:underline">support@e-store.com</a>.</p>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;