import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Track Your Nicotine Intake
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Monitor cigarettes, vapes, zyns, and more. Understand your habits and
          see real-time bloodstream levels.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/signup"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-white text-indigo-600 px-6 py-3 rounded-md text-lg font-medium border border-indigo-600 hover:bg-indigo-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
