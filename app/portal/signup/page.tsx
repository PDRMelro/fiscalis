import { SignupForm } from "./SignupForm";

export default async function PortalSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; nome?: string; email?: string }>;
}) {
  const { codigo, nome, email } = await searchParams;
  return <SignupForm codigo={codigo ?? ""} nome={nome ?? ""} email={email ?? ""} />;
}
