import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut", // Changed from "ease"
    },
  },
};

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-foreground dark:text-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
        <motion.h1
          className="text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-12"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          Privacy Policy
        </motion.h1>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>This Privacy Policy describes how we collect, use, and disclose your personal information when you visit or make a purchase from our website. We are committed to protecting your privacy and ensuring the security of your personal data.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>We collect various types of information in connection with the services we provide, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, shipping address, billing address, phone number, payment information (e.g., credit card details).</li>
                <li><strong>Order Information:</strong> Details of products purchased, transaction history.</li>
                <li><strong>Usage Data:</strong> Information about how you access and use our website, including IP address, browser type, pages viewed, and time spent on pages.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track activity on our service and hold certain information.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>We use the collected information for various purposes, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>To provide and maintain our service;</li>
                <li>To process your orders and manage your account;</li>
                <li>To communicate with you about your orders, products, services, and promotional offers;</li>
                <li>To improve our website, products, and services;</li>
                <li>To monitor the usage of our service;</li>
                <li>To detect, prevent, and address technical issues.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">4. Sharing Your Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>We may share your personal information with third parties in the following situations:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf, such as payment processing, shipping, and marketing.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, sale of company assets, or acquisition of all or a portion of our business.</li>
                <li><strong>Legal Requirements:</strong> When required to do so by law or in response to valid requests by public authorities.</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.4 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">6. Your Data Protection Rights</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>Depending on your location, you may have the following data protection rights:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>The right to access, update or to delete the information we have on you.</li>
                <li>The right of rectification.</li>
                <li>The right to object.</li>
                <li>The right of restriction.</li>
                <li>The right to data portability.</li>
                <li>The right to withdraw consent.</li>
              </ul>
              <p>To exercise any of these rights, please contact us.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.6 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.7 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">8. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.8 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>If you have any questions about this Privacy Policy, please contact us at support@example.com.</p>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}