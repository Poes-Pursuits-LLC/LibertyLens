import { SignIn } from "@clerk/react-router";
import type { Route } from "./+types/login";

export function meta(): Route.MetaDescriptors {
  return [
    { title: "Sign In - Liberty Lens" },
    {
      name: "description",
      content: "Sign in to Liberty Lens to access your personalized dashboard",
    },
  ];
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Liberty Lens
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue to your dashboard
          </p>
        </div>

        <SignIn
          routing="hash"
          transferable
          withSignUp
          signUpForceRedirectUrl={"/dashboard"}
          forceRedirectUrl={"/dashboard"}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white dark:bg-gray-800 shadow-xl rounded-lg",
              headerTitle:
                "text-2xl font-semibold text-gray-900 dark:text-white",
              headerSubtitle: "text-sm text-gray-600 dark:text-gray-400",
              socialButtonsBlockButton:
                "flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              formButtonPrimary:
                "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              formFieldInput:
                "appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white",
              formFieldLabel:
                "block text-sm font-medium text-gray-700 dark:text-gray-200",
              identityPreviewText: "text-sm text-gray-600 dark:text-gray-400",
              identityPreviewEditButton:
                "text-indigo-600 hover:text-indigo-500",
              formHeaderTitle:
                "text-lg font-medium text-gray-900 dark:text-white",
              formHeaderSubtitle: "text-sm text-gray-600 dark:text-gray-400",
              otpCodeFieldInput:
                "block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white",
              formResendCodeLink: "text-indigo-600 hover:text-indigo-500",
              footerActionLink: "text-indigo-600 hover:text-indigo-500",
              footerAction: "text-sm text-gray-600 dark:text-gray-400",
              dividerLine: "bg-gray-200 dark:bg-gray-600",
              dividerText: "text-sm text-gray-500 dark:text-gray-400",
              formFieldErrorText: "text-sm text-red-600 dark:text-red-400",
              formFieldSuccessText:
                "text-sm text-green-600 dark:text-green-400",
              alert: "text-sm",
              alertText: "text-sm",
            },
            layout: {
              socialButtonsPlacement: "top",
              showOptionalFields: true,
            },
          }}
        />
      </div>
    </div>
  );
}
