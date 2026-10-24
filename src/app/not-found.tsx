import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-wrap narrow">
      <h1>This path doesn’t lead to a conversation.</h1>
      <p>The page could not be found.</p>
      <Link className="primary" href="/">
        Return home
      </Link>
    </div>
  );
}
