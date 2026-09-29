import { LegalPage } from "@/components/ui/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Plusmark Display System handles information submitted through plusmarkboards.com.",
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy-policy"
      intro="This policy explains what information we collect through this website and how it is used."
      sections={[
        {
          heading: "Information you submit",
          body: [
            "When you submit an enquiry, we collect the details you provide — name, company or institution, phone number, email address, product of interest, quantity, requirement and message.",
            "This information is used only to respond to your enquiry and to provide quotations, product details and related communication.",
          ],
        },
        {
          heading: "Sharing",
          body: [
            "Enquiry details may be shared with Plusmark's authorized distributors or marketing executives so they can respond to your requirement. We do not sell your personal information.",
          ],
        },
        {
          heading: "Cookies & analytics",
          body: [
            "This website does not use advertising cookies. Technical logs may be kept by our hosting provider for security and performance purposes.",
          ],
        },
        {
          heading: "Your choices",
          body: ["You may ask us to update or delete the information you submitted by sending a request through the enquiry form."],
        },
      ]}
    />
  );
}
