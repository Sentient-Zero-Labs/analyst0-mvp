import { createCharterPlayground } from "@/services/charterPlayground/charterPlayground.service";
import CharterPlaygoundPage from "./_components/CharterPlaygoundPage";
import { getSession } from "@/lib/auth/session/server";

export default async function Page({
  params,
}: {
  params: { organisationPublicId: string; charterId: string; playgroundPublicId: string };
}) {
  const organisationPublicId = params.organisationPublicId;
  const charterId = parseInt(params.charterId);
  let playgroundPublicId = params.playgroundPublicId;
  const session = await getSession();

  const accessToken = session.accessToken!;

  if (playgroundPublicId === "new") {
    const playground = await createCharterPlayground({ organisationPublicId, charterId }, accessToken);
    playgroundPublicId = playground.public_id;
  }

  return (
    <CharterPlaygoundPage
      organisationPublicId={organisationPublicId}
      charterId={charterId}
      playgroundPublicId={playgroundPublicId}
    />
  );
}
