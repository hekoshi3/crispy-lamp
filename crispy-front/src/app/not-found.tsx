import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#04070A',
      }}
    >
      <Image
        src="/images/default.png"
        alt="Not found"
        style={{
          maxWidth: '300px',
          width: '100%',
          height: '100%',
          marginBottom: '2rem',
        }}
      />
      <h1 style={{ fontSize: '2rem', color: '#333', textAlign: 'center' }}>
        Вы забрели в небытие. <Link href="/">Вернитесь домой</Link>
      </h1>
    </div>
  );
}