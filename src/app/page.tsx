"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
        Welcome{user && " Back"}!
      </h1>
      <p className="text-lg sm:text-xl text-center mb-8">
        {user ? (
          <>
            Go to{" "}
            <Link
              href="/chat"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
            >
              Chat
            </Link>
          </>
        ) : (
          <>
            Please{" "}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
            >
              Login
            </Link>
            {" "}to continue.
          </>
        )}
      </p>
    </div>
  );
}
