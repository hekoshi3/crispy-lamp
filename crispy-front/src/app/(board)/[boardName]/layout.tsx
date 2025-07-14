import Nav from "../../components/nav";
import "../../../css/globals.css";

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="boardpage">
      <Nav />
      <main>{children}</main>
    </div>
  )
}