import LoginForm from "../login-form";

export const metadata = {
  title: "iGyanAI • Institutional Suite Login",
  description: "Institutional access for super admins, principals, and teachers.",
};

export default function InstitutionalSuiteLoginPage() {
  return <LoginForm variant="institutionalSuite" />;
}
