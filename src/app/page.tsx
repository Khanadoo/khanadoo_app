import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}

        <section className="bg-gradient-to-b from-blue-50 to-white">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center">
            <h1 className="text-5xl font-bold tracking-tight">
              Find Your Perfect Property
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Discover verified properties for rent
              and sale. Connect directly with
              property owners and find your next
              home with confidence.
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <Link href="/properties">
                <Button size="md">
                  Browse Properties
                </Button>
              </Link>

              <Link href="/register">
                <Button size="md" variant="secondary">
                  Become an Owner
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED */}

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold">
              Featured Properties
            </h2>

            <p className="mt-2 text-gray-600">
              Explore some of our latest and
              verified listings.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border p-6">
                <h3 className="font-semibold">
                  Luxury Apartment
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Modern apartment with premium
                  amenities.
                </p>

                <p className="mt-4 font-bold">
                  ₹45,00,000
                </p>
              </div>

              <div className="rounded-xl border p-6">
                <h3 className="font-semibold">
                  Family House
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Spacious house in a peaceful
                  locality.
                </p>

                <p className="mt-4 font-bold">
                  ₹65,00,000
                </p>
              </div>

              <div className="rounded-xl border p-6">
                <h3 className="font-semibold">
                  PG Accommodation
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Comfortable PG for students and
                  professionals.
                </p>

                <p className="mt-4 font-bold">
                  ₹8,000 / month
                </p>
              </div>
            </div>

            <div className="mt-10">
              <Link href="/properties">
                <Button size="md">
                  View All Properties
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* WHY US */}

        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-3xl font-bold">
              Why Choose PropertyHub?
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold">
                  Verified Listings
                </h3>

                <p className="mt-2 text-gray-600">
                  Every property goes through
                  verification before appearing on
                  our platform.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold">
                  Trusted Owners
                </h3>

                <p className="mt-2 text-gray-600">
                  Connect directly with genuine
                  property owners.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold">
                  Easy Enquiries
                </h3>

                <p className="mt-2 text-gray-600">
                  Contact owners quickly and track
                  your enquiries effortlessly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}