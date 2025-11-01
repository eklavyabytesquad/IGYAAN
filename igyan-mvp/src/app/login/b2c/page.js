import LoginForm from "../login-form";

export const metadata = {
  title: "iGyanAI • B2C Login",
  description: "Log in to your Sudarshan copilots as a learner or family member.",
};

export default function B2CLoginPage() {
  return <LoginForm variant="b2c" />;
}
