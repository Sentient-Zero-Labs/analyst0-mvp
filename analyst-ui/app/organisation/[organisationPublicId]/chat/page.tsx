import ChatPage from "./ChatPage";

export default async function Page({ params: { organisationPublicId } }: { params: { organisationPublicId: string } }) {
  return <ChatPage organisationPublicId={organisationPublicId} />;
}
