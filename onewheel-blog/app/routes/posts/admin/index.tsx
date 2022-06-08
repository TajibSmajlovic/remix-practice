import { Link } from "react-router-dom";

export default function AdminIndexRoute() {
  return (
    <Link to="new" className="text-blue-600 underline">
      Create new post
    </Link>
  );
}
