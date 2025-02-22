import Image from "next/image";
import Link from "next/link";

export default function GetStarted() {
  return (
    <div className="container-section lg:py-10 xl:py-10 flex flex-col gap-8 lg:pr-52 xl:pr-64 !pb-32">
      <div>
        <h1 className="font-semibold xl:text-4xl text-3xl">Setup</h1>
        <p className="mt-2">Follow the steps below to get started with using Analyst Zero.</p>
      </div>

      {/* Step 1: Sign up and create a project */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-2xl">1. Create project and connect your database</h3>
        <p>
          To get started, you need to sign up and <span className="font-semibold">create a project</span>. Once
          you have created a project, you can <span className="font-semibold">connect your database</span>.
          Currently we support PostgreSQL and MySQL (Snowflake is coming soon).
        </p>
        <Image
          src="/docs/add-data-source.png"
          alt="Add data source"
          width={1000}
          height={1000}
          className="rounded-lg border shadow-md mt-2"
        />
      </div>

      {/* Step 2: Sync data entities from your database */}
      <div className="mt-4 flex flex-col gap-3">
        <h3 className="font-semibold text-2xl">2. Sync data entities from your database</h3>
        <p>
          Once you have connected your database, you need to <span className="font-semibold">sync data entities</span>.
          Syncing will fetch all Table Schema from your database and create data entities in Analyst Zero. Please wait
          while syncing is in progress, it may take a while.
        </p>
        <Image
          src="/docs/sync-data-entities.png"
          alt="Sync data entities"
          width={1000}
          height={1000}
          className="rounded-lg border shadow-md mt-2"
        />
      </div>

      {/* Step 3: Create charter  */}
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-2xl">3. Create Data Agent</h3>
          <p className="text-sm text-muted-foreground">
            Data Agent is a sub-collection of data entities that you want to analyse together. For example, you can create
            a data agent for different data domains at your company.
          </p>
        </div>

        <p className="mt-1">
          To create data agent, go to Data Agents from the sidebar and then click on{" "}
          <span className="font-semibold">Create New Data Agent</span>. This will open create data agent page where you
          need to add Name, select Data Source and the Data entities you want to include in the data agent.
        </p>

        <Image
          src="/docs/create-charter.png"
          alt="Create data agent"
          width={1000}
          height={1000}
          className="rounded-lg border shadow-md mt-2"
        />
      </div>

      {/* Step 4: Adding Context  */}
      <div className="mt-4 flex flex-col gap-2">
        <h3 className="font-semibold text-2xl">
          4. Adding Context <span className="text-foreground/70 text-lg">(Optional but Important)</span>
        </h3>

        <p className="mt-1">
          Context is the knowledge that you add to your charter to help Analyst Zero understand your data better. Though
          you can start chatting with your data or use SQL playground without adding context, it is recommended step in
          making AI stay grounded and give more accurate. We have integrated AI at every step of adding context to help
          you setup as fast and easy as possible.
        </p>

        <span>
          To learn how to add context, please refer to the{" "}
          <Link href="/docs/get-started/adding-context" className="text-blue-600 font-semibold hover:underline">
            Adding Context.
          </Link>{" "}
        </span>
      </div>

      {/* Step 5: Start Chatting or Use SQL Playground  */}
      <div className="mt-4 flex flex-col gap-3">
        <h3 className="font-semibold text-2xl">5. Start Chatting or Use SQL Playground</h3>
        <p>
          Once you have created a charter, you can start chatting with your data in natural language or use SQL
          playground to create queries at the charter level.
        </p>

        <div className="flex flex-col gap-1 mt-3">
          <h4 className="font-semibold text-xl">Chat with your data</h4>
          <p>To chat with your data, go to the Chat on the sidebar. Then select the charter you want to chat with.</p>
          <Image
            src="/docs/chat-with-data.png"
            alt="Chat with data"
            width={1000}
            height={1000}
            className="rounded-lg border shadow-md mt-2"
          />
        </div>

        <div className="flex flex-col gap-1 mt-5">
          <h4 className="font-semibold text-xl">Use SQL Playground</h4>
          <p>
            To use SQL playground, go to the Playground on the sidebar. Then select the charter you want to use SQL
            playground for.
          </p>
          <Image
            src="/docs/sql-playground.png"
            alt="SQL Playground"
            width={1000}
            height={1000}
            className="rounded-lg border shadow-md mt-2"
          />
        </div>
      </div>
    </div>
  );
}
