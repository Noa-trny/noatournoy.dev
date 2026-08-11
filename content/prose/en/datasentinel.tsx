import type { Section } from "@/components/ProjectPage";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "From spreadsheets to a single source.",
    body: (
      <div className="prose">
        <p>Security tracking for digital products lived in hand-maintained spreadsheets: vulnerability status, compliance, penetration-test progress. Every cross-check was copy work, and nobody held the same version of the number.</p>
        <p>DataSentinel centralises that monitoring in a Looker dashboard wired straight to the data. The number on screen is the number at the source; there is no intermediate version left to maintain.</p>
      </div>
    ),
  },
  {
    id: "fait",
    title: "Delivery",
    srOnly: true,
    body: (
      <>
        <p className="label"><span>What I built</span></p>
        <div className="prose">
          <h3>The modelling</h3>
          <p>Working the data through Google Cloud Platform and BigQuery: complex SQL queries and modelling in LookML. This is the layer that decides what an indicator means: the place where a vague definition costs the most.</p>

          <h3>The full-stack extensions</h3>
          <p>A dashboard shows; it does not let you act. I built extensions embedded in Looker (Python backend, React frontend) to make penetration-test management interactive: consult, update and follow up inside the tool rather than beside it.</p>

          <h3>The deployment</h3>
          <p>A continuous integration and delivery pipeline, and infrastructure described as code: Terraform, GitHub Actions, Docker, Kubernetes. The tool redeploys without a manual step.</p>

          <h3>What I took away</h3>
          <p>The <strong>Google Looker</strong> and <strong>LookML</strong> certifications, and one conviction: on a security subject, the value is not in the chart but in the definition of the data it displays.</p>
        </div>
      </>
    ),
  },
  {
    id: "confid",
    title: "Confidentiality",
    srOnly: true,
    body: (
      <div className="prose">
        <p>No screenshots, no data, no product names: the contents of the tool belong to ADEO. What is described here is limited to what I can say about my own work.</p>
      </div>
    ),
  },
];
