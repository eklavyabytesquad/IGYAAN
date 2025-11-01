import LoginForm from "../login-form";

export const metadata = {
  title: "iGyanAI • Institutional Suite Login",
  description: "Access your institution's iGyanAI workspace and Sudarshan Ai copilots.",
};

export default function InstitutionalSuiteLoginPage() {
  return <LoginForm variant="institutionalSuite" />;
}
