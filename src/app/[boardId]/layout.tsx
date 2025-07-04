import Nav from "../components/nav";
import "../../css/globals.scss";

export default function Layout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <>
            <Nav />
            <body className="boardpage">{children}</body>
        </>
    )
  }