import LoginForm from "../login-form";

export const metadata = {
  title: "iGyanAI • Launch Pad Login",
  description: "Access Launch Pad for student and parent learning accounts.",
};

export default async function ProfessionalSuiteLoginPage({ searchParams }) {
  const params = await searchParams;
  const initialError = params?.error === "login_required"
    ? "Please sign up or log in to use this feature."
    : "";

  return <LoginForm variant="professionalSuite" initialError={initialError} />;
}
