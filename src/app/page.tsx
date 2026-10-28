
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const steps = [
  {
    number: "01",
    title: "Explore properties",
    description:
      "Browse available listings and compare prices, locations, and property details.",
  },
  {
    number: "02",
    title: "Review the details",
    description:
      "Check the information, photos, and contact details provided with each listing.",
  },
  {
    number: "03",
    title: "Contact the owner",
    description:
      "Send an enquiry through PropertyHub and keep track of your enquiries.",
  },
];

const benefits = [
  {
    title: "Information at a glance",
    description:
      "See important details such as price, location, property type, and availability in one place.",
  },
  {
    title: "Enquiries in one place",
    description:
      "Submit property enquiries and follow their status through your account.",
  },
  {
    title: "A more informed search",
    description:
      "Review listing details carefully and ask the owner questions before making a decision.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="border-b border-[var(--line)] bg-[var(--panel)]">
          <div className="page-shell grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-[var(--brand-deep)]">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-[var(--brand)]"
                />
                Your property search, made simpler
              </div>

              <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Find a place that feels{" "}
                <span className="text-[var(--brand-deep)]">
                  right for you.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
                Explore rooms, PGs, houses, and apartments
                for rent or sale. Compare property details
                and connect with owners as you search for
                your next place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/properties"
                  className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand-deep)] px-6 py-3 text-center font-medium text-white! transition-colors hover:bg-[#294b43] focus-visible:outline-offset-4"
                >
                  Browse properties
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                </Link>

                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-6 py-3 text-center font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
                >
                  Create an account
                </Link>
              </div>

              <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)]">
                New to PropertyHub? Start by exploring listings.
                You can create an account when you're ready to
                enquire about a property.
              </p>
            </div>

            {/* How the platform helps */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--background)] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-deep)]">
                A clearer way to search
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Take your search one step at a time.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Find options, understand the details, and
                decide which properties are worth enquiring
                about.
              </p>

              <div className="mt-7 space-y-5">
                {steps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sage)] text-sm font-semibold text-[var(--brand-deep)]">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {step.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/properties"
                className="mt-7 inline-flex items-center font-medium text-[var(--brand-deep)] hover:underline"
              >
                Start exploring
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="page-shell py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-deep)]">
              Built around your search
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Less confusion. More clarity.
            </h2>

            <p className="mt-4 leading-7 text-[var(--muted)]">
              Looking for a place can involve many decisions.
              PropertyHub brings useful listing information
              and enquiry management together in one place.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <article
                key={benefit.title}
                className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] p-6"
              >
                <span className="text-sm font-semibold text-[var(--brand-deep)]">
                  0{index + 1}
                </span>

                <h3 className="mt-4 text-lg font-semibold">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Trust and safety */}
        <section className="border-y border-[var(--line)] bg-[var(--sage)]/40">
          <div className="page-shell grid gap-6 py-12 sm:py-16 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl text-[var(--brand-deep)]"
            >
              ✓
            </div>

            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Make informed property decisions.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Listing information is provided through the
                platform. Always confirm the property's
                availability, ownership, terms, and identity
                of the person you deal with before paying
                any money.
              </p>
            </div>

            <Link
              href="/properties"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-5 py-2.5 font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
            >
              Explore listings
            </Link>
          </div>
        </section>

        {/* Final call to action */}
        <section className="page-shell py-16 sm:py-20">
          <div className="rounded-2xl bg-[var(--foreground)] px-6 py-10 text-center text-white sm:px-12 sm:py-14">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to find your next place?
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
              Start with the available listings and explore
              the options that suit your needs.
            </p>

            <Link
              href="/properties"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-background px-6 py-3 font-semibold text-foreground! transition-colors hover:bg-[var(--background)]"
            >
              Browse properties
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
