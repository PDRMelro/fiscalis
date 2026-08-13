import { ConfirmarForm } from "./ConfirmarForm";

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <ConfirmarForm email={email ?? ""} />;
}
