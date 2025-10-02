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

export function TermsOfServicePage() {
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
          Terms of Service
        </motion.h1>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>By accessing and using our website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">2. Use License</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Modify or copy the materials;</li>
                <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                <li>Attempt to decompile or reverse engineer any software contained on our website;</li>
                <li>Remove any copyright or other proprietary notations from the materials; or</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>
              <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">3. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              <p>Further, we do not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on our website or otherwise relating to such materials or on any sites linked to this site.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">4. Limitations</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.4 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">5. Accuracy of Materials</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete or current. We may make changes to the materials contained on its website at any time without notice. However we do not make any commitment to update the materials.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">6. Links</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>We have not reviewed all of the sites linked to its website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.6 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">7. Modifications</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>We may revise these Terms of Service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms of Service.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.7 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">8. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>These terms and conditions are governed by and construed in accordance with the laws of [Your Country/State] and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.8 }}>
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>If you have any questions about these Terms, please contact us at support@example.com.</p>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}