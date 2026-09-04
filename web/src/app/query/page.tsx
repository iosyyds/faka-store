import Navbar from "@/components/Navbar";
import QueryBox from "@/components/QueryBox";

export default function QueryPage() {
  return (
    <>
      <Navbar siteName="发卡小店" />
      <main className="flex min-h-screen flex-col items-center px-4 pb-16">
        <QueryBox />
      </main>
    </>
  );
}
