import { MainContent } from "./main-content";

export const dynamic = "force-dynamic";

// The public studio stays usable while managed sign-in is being repaired.
// Private project routes and portfolio ownership checks remain authenticated.
export default function Home() {
  return <MainContent user={null} />;
}
