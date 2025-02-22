import ChatPage from "./ChatPage";

export default function Page({
  params: { organisationPublicId, charterId },
}: {
  params: { organisationPublicId: string; charterId: number };
}) {
  return <ChatPage organisationPublicId={organisationPublicId} charterId={charterId} />;
}
