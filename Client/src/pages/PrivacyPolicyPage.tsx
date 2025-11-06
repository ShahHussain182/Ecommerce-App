import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion , Variants } from 'framer-motion';

const sectionVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, };

const PrivacyPolicyPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-20 md:py-32 overflow-hidden">
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
              Privacy Policy
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="mt-4 max-w-2xl mx-auto text-lg text-white/90"
            >
              Understanding how we collect, use, and protect your data.
            </motion.p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0  }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>Welcome to E-Store! This Privacy Policy describes how E-Store ("we," "us," or "our") collects, uses, and shares your personal information when you visit or make a purchase from our website (the "Site") or use our services.</p>
                <p>We are committed to protecting your privacy and handling your data in an open and transparent manner. By using our Service, you agree to the collection and use of information in accordance with this policy.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">2. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>We collect several types of information for various purposes to provide and improve our Service to you.</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Personal Data</h3>
                <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                  <li>Cookies and Usage Data</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Usage Data</h3>
                <p>We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>E-Store uses the collected data for various purposes:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>To provide and maintain our Service</li>
                  <li>To notify you about changes to our Service</li>
                  <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information so that we can improve our Service</li>
                  <li>To monitor the usage of our Service</li>
                  <li>To detect, prevent and address technical issues</li>
                  <li>To provide you with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information</li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">4. How We Share Your Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>We may share your personal information in the following situations:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>With Service Providers:</strong> We may share your personal information with service providers to monitor and analyze the use of our Service, to contact you.</li>
                  <li><strong>For Business Transfers:</strong> We may share or transfer your personal information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                  <li><strong>With Affiliates:</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy.</li>
                  <li><strong>With Business Partners:</strong> We may share your information with our business partners to offer you certain products, services or promotions.</li>
                  <li><strong>With Other Users:</strong> When you share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay:0.4 }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">5. Your Choices and Rights</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>You have certain rights regarding your personal information, including:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>The right to access, update or delete the information we have on you.</li>
                  <li>The right to rectify your Personal Data if that information is inaccurate or incomplete.</li>
                  <li>The right to object to our processing of your Personal Data.</li>
                  <li>The right to request that we restrict the processing of your personal information.</li>
                  <li>The right to data portability for your Personal Data.</li>
                  <li>The right to withdraw consent at any time where E-Store relied on your consent to process your personal information.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay:0.5 }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">6. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">7. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>Our Service does not address anyone under the age of 18 ("Children").</p>
                <p>We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.7 }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">8. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
                <p>We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.</p>
                <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}>
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">9. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>By email: <a href="mailto:privacy@e-store.com" className="text-blue-600 hover:underline">privacy@e-store.com</a></li>
                  <li>By visiting this page on our website: <a href="/contact" className="text-blue-600 hover:underline">/contact</a></li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;