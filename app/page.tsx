import Link from "next/link";

export default function Page() {
  return (
    <main style={{padding:40,fontFamily:"sans-serif"}}>
      <h1>Vitrino</h1>
      <p>Landing page test</p>

      <div style={{marginTop:20}}>
        <Link href="/login">Login</Link>
        <span style={{margin:"0 10px"}}>|</span>
        <Link href="/signup">Signup</Link>
      </div>
    </main>
  );
}