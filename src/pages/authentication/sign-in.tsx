/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Card, Label, TextInput, Alert } from "flowbite-react";
import React, { useState, FC } from "react";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../pages/loading";
import { useAuthContext } from "../../context/AuthContext";

const SignInPage: FC = () => {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuthContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(username, password);

    if (result.error) {
      setError(result.error.message);
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 lg:h-screen bg-gray-50 dark:bg-gray-900">
      <div className="grid max-w-screen-xl w-full py-8 lg:gap-20 lg:py-16 lg:grid-cols-12">
        {/* Form Section */}
        <div className="lg:col-span-6 w-full mx-auto">
          <Card className="p-6 bg-white rounded-lg shadow dark:bg-gray-800 sm:max-w-xl sm:p-8">
            <a
              href="#"
              className="inline-flex items-center mb-4 text-xl font-semibold text-gray-900 dark:text-white"
            >
              <img
                className="w-8 h-8 mr-2"
                src="/images/logo.svg"
                alt="LuminoChat Logo"
              />
              LuminoChat
            </a>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Start your website in seconds. Don’t have an account?{" "}
              <a
                href="/authentication/sign-up"
                className="text-primary-600 hover:underline dark:text-primary-500"
              >
                Sign up
              </a>
              .
            </p>
            {error && (
              <Alert color="failure" className="my-4">
                {error}
              </Alert>
            )}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <Label htmlFor="username" className="mb-2">
                  Your Username
                </Label>
                <TextInput
                  id="username"
                  name="username"
                  placeholder="username123"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="mb-2">
                  Your Password
                </Label>
                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login to your account
              </Button>
            </form>
          </Card>
        </div>

        {/* Illustration Section */}
        <div className="lg:col-span-6 place-self-center">
          <img
            className="hidden lg:block mx-auto"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/authentication/illustration.svg"
            alt="Sign-in Illustration"
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
