import DocsSidebar from "./_components/docs-sidebar";
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-row">
        <DocsSidebar />
        {children}
      </div>
    </>
  );
}
