import { LegalPage } from "@/components/ui/LegalPage";
import { company } from "@/data/company";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms of use for the Plusmark Display System website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      path="/terms"
      intro="By using this website you agree to the following terms."
      sections={[
        {
          heading: "Product information",
          body: [
            "Product descriptions on this website are based on the Plusmark product catalog. Images and 3D models are for illustration; please confirm specifications, sizes, colours and finishes at the time of enquiry.",
          ],
        },
        {
          heading: "Enquiries & orders",
          body: [
            "Submitting an enquiry does not constitute an order. Quotations, delivery and order terms are confirmed directly by Plusmark or its authorized distributors.",
            "For Dry Wipe Schedule Boards, when Plusmark makes the design of a board, additional charges will be applicable.",
          ],
        },
        { heading: "Warranty", body: [company.warranty] },
        {
          heading: "Intellectual property",
          body: ["The Plusmark name, logo and website content may not be reproduced without permission."],
        },
      ]}
    />
  );
}
