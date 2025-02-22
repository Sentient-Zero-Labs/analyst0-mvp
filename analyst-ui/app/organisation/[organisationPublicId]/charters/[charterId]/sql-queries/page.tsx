import { getSession } from "@/lib/auth/session/server";

import { getCharterList } from "@/services/charter/charter.service";
import { UserPlaygroundList } from "./_components/UserPlaygroundList";
import { getCharterPlaygroundList } from "@/services/charterPlayground/charterPlayground.service";

export default async function PlaygroundPage({
  params,
}: {
  params: { organisationPublicId: string; charterId: string };
}) {
  const organisationPublicId = params.organisationPublicId;
  const charterId = parseInt(params.charterId);

  const session = await getSession();

  const [charters, userPlaygrounds] = await Promise.all([
    getCharterList({ organisationPublicId: organisationPublicId }, session!.accessToken!),
    getCharterPlaygroundList({ organisationPublicId, charterId }, session!.accessToken!),
  ]);

  return (
    <div className="container-dashboard mx-auto !p-0 gap-4">
      <UserPlaygroundList
        organisationPublicId={organisationPublicId}
        playgrounds={userPlaygrounds}
        charters={charters}
      />
      {/* <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={15}>
          <div className="h-[calc(100vh-45px)] overflow-y-auto border-r">
            <UserPlaygroundList
              organisationPublicId={organisationPublicId}
              playgrounds={userPlaygrounds}
              charters={charters}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="w-0" />

        <ResizablePanel defaultSize={75} minSize={70}>
          <div className="w-full flex flex-col items-center gap-4 h-full">
            <h3 className="mt-20 mb-1 text-2xl text-center">
              You can chat to <span className="font-semibold">generate, correct and refine</span> your SQL queries.
            </h3>

            {charters && charters?.length > 0 ? (
              <div className="flex flex-row flex-wrap gap-4 justify-center">
                {charters?.map((charter) => (
                  <CharterCard key={charter.id} charter={charter} organisationPublicId={organisationPublicId} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup> */}
      {/* <div className="w-96 h-[calc(100vh-45px)] overflow-y-auto border-r">
        <UserPlaygroundList
          organisationPublicId={organisationPublicId}
          playgrounds={userPlaygrounds}
          charters={charters}
        />
      </div>

      <div className="w-full flex flex-col items-center gap-4 h-full">
        <h3 className="mt-20 mb-1 text-2xl text-center">
          You can chat to <span className="font-semibold">generate, correct and refine</span> your SQL queries.
        </h3>

        {charters && charters?.length > 0 ? (
          <div className="flex flex-row flex-wrap gap-4 justify-center">
            {charters?.map((charter) => (
              <CharterCard key={charter.id} charter={charter} organisationPublicId={organisationPublicId} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div> */}
    </div>
  );
}
