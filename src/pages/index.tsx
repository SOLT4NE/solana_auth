import Link from "next/link";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { SigninMessage } from "../utils/SigninMessage";
import bs58 from "bs58";
import { useEffect } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const wallet = useWallet();
  const walletModal = useWalletModal();

  const handleSignIn = async () => {
    try {
      if (!wallet.connected) {
        walletModal.setVisible(true);
      }

      const csrf = await getCsrfToken();
      if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.publicKey?.toBase58(),
        statement: `SOLT4NE THE GOAT .`,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await wallet.signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (wallet.connected && status === "unauthenticated") {
      handleSignIn();
    }
  }, [wallet.connected]);

  return (
<header className="bg-blue-500 p-4">
  <noscript>
    <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
  </noscript>
  <div className="container mx-auto">
    <p className="text-white">
      {!session && (
        <>
          <span>You are not signed in</span>
          <span
            onClick={handleSignIn}
            className="ml-2 px-4 py-2 bg-blue-700 text-white rounded-lg cursor-pointer"
          >
            Sign in
          </span>
        </>
      )}
      {session?.user && (
        <>
          {session.user.image && (
            <span
              className="ml-4 px-4 py-4 w-[200px] rounded-full bg-white"
              style={{ backgroundImage: `url('${session.user.image}')` }}
            />
          )}
          <span className="text-white">
            <small>Signed in as</small>
            <br />
            <strong>{session.user.email ?? session.user.name}</strong>
          </span>
          <a
            href={`/api/auth/signout`}
            className="ml-2 text-white hover:underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
          >
            Sign out
          </a>
        </>
      )}
    </p>
  </div>
  <nav className="container mx-auto mt-4">
    <ul className="flex space-x-4">
      <li>
        <Link legacyBehavior href="/">
          <a className="text-white hover:underline">Home</a>
        </Link>
      </li>
      <li>
        <Link legacyBehavior href="/api/examples/protected">
          <a className="text-white hover:underline">Protected API Route</a>
        </Link>
      </li>
      <li>
        <Link legacyBehavior href="/me">
          <a className="text-white hover:underline">Me</a>
        </Link>
      </li>
    </ul>
  </nav>
</header>

  );
}